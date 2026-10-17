-- Integra Estágio
-- 059_secure_internship_attendance.sql

begin;

create or replace function public.attendance_check_permission(
  p_internship_id uuid,
  p_unit_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile record;
  v_internship record;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select role, is_active, municipal_unit_id
    into v_profile
  from public.profiles
  where id = auth.uid();

  if not found
     or v_profile.is_active is distinct from true
     or v_profile.role is distinct from 'unidade'
     or v_profile.municipal_unit_id is distinct from p_unit_id then
    raise exception 'Usuário sem permissão para registrar frequência.';
  end if;

  select municipal_unit_id
    into v_internship
  from public.internships
  where id = p_internship_id;

  if not found
     or v_internship.municipal_unit_id is distinct from p_unit_id then
    raise exception 'Estágio não pertence à unidade responsável.';
  end if;
end;
$$;

revoke all on function public.attendance_check_permission(uuid, uuid)
from public, anon, authenticated;

-- Acrescenta validação de permissão antes dos demais
-- controles de jornada instalados pela migration 058.

create or replace function public.attendance_authorize_write()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.attendance_check_permission(
    new.internship_id,
    new.municipal_unit_id
  );

  if tg_op = 'UPDATE' then
    if old.internship_id is distinct from new.internship_id
       or old.municipal_unit_id is distinct from new.municipal_unit_id
       or old.attendance_date is distinct from new.attendance_date then
      raise exception 'Não é permitido transferir ou redatar frequência.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.attendance_authorize_write()
from public, anon, authenticated;

drop trigger if exists attendance_authorize_write_trigger
on public.internship_attendance;

create trigger attendance_authorize_write_trigger
before insert or update
on public.internship_attendance
for each row
execute function public.attendance_authorize_write();

-- Confirma que o histórico permanece somente de leitura
-- para os perfis autenticados.

revoke insert, update, delete, truncate
on public.internship_attendance_history
from public, anon, authenticated;

grant select on public.internship_attendance_history
to authenticated;

-- O histórico nunca deve ser alterado ou apagado,
-- inclusive por operações administrativas comuns.

create or replace function public.attendance_history_immutable()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'O histórico de frequência é imutável.';
end;
$$;

revoke all on function public.attendance_history_immutable()
from public, anon, authenticated;

drop trigger if exists attendance_history_immutable_trigger
on public.internship_attendance_history;

create trigger attendance_history_immutable_trigger
before update or delete
on public.internship_attendance_history
for each row
execute function public.attendance_history_immutable();

commit;
