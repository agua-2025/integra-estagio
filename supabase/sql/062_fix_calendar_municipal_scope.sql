-- Integra Estágio
-- Migration 062 - Corrige abrangência municipal do calendário

begin;

alter table public.unit_calendar_exceptions
  alter column municipal_unit_id drop not null;

commit;
