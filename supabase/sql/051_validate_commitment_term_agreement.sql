create or replace function public.validate_commitment_term_agreement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  agreement_record record;
begin
  select
    ca.id,
    ca.status,
    ca.signed_at,
    ca.published_at,
    ca.started_at,
    ca.ended_at
  into agreement_record
  from public.cooperation_agreements ca
  where ca.id = new.agreement_id;

  if agreement_record.id is null then
    raise exception 'Acordo de Cooperação não encontrado.';
  end if;

  if agreement_record.status <> 'ativo' then
    raise exception 'O Termo de Compromisso exige Acordo de Cooperação ativo.';
  end if;

  if agreement_record.signed_at is null then
    raise exception 'O Termo de Compromisso exige Acordo de Cooperação assinado.';
  end if;

  if agreement_record.published_at is null then
    raise exception 'O Termo de Compromisso exige Acordo de Cooperação publicado.';
  end if;

  if new.internship_start_date is not null
     and agreement_record.started_at is not null
     and new.internship_start_date < agreement_record.started_at::date then
    raise exception 'O início do estágio não pode ser anterior à vigência do Acordo de Cooperação.';
  end if;

  if new.internship_end_date is not null
     and agreement_record.ended_at is not null
     and new.internship_end_date > agreement_record.ended_at::date then
    raise exception 'O término do estágio não pode ultrapassar a vigência do Acordo de Cooperação.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_commitment_term_agreement_trigger
on public.commitment_terms;

create trigger validate_commitment_term_agreement_trigger
before insert or update of
  agreement_id,
  internship_start_date,
  internship_end_date,
  status
on public.commitment_terms
for each row
execute function public.validate_commitment_term_agreement();
