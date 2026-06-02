-- Integra Estágio
-- 012_seed_campo_publico_teste.sql
-- Registro temporário para testar leitura pública de campos de estágio.

insert into public.internship_fields (
  title,
  description,
  area,
  status,
  is_public,
  available_slots,
  shift,
  supervisor_required,
  display_order
)
values (
  'Administração e Gestão Pública',
  'Campo de estágio voltado ao acompanhamento de rotinas administrativas, organização documental, atendimento, tramitação de processos e apoio à gestão pública municipal.',
  'Administração Pública',
  'ativo',
  true,
  2,
  'Matutino ou vespertino',
  true,
  1
);
