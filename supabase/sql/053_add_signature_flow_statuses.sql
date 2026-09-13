alter table public.student_presentations
drop constraint if exists student_presentations_status_check;

alter table public.student_presentations
add constraint student_presentations_status_check check (
  status in (
    'rascunho',
    'apresentado',
    'em_analise',
    'pendente_correcao',
    'apto_para_assinatura',
    'termo_assinado_anexado',
    'documentos_validados',
    'apto_para_autorizacao',
    'autorizado',
    'indeferido',
    'cancelado'
  )
);

alter table public.commitment_terms
drop constraint if exists commitment_terms_status_check;

alter table public.commitment_terms
add constraint commitment_terms_status_check check (
  status in (
    'rascunho',
    'enviado',
    'em_analise',
    'pendente_correcao',
    'apto_para_assinatura',
    'termo_assinado_anexado',
    'validado',
    'rejeitado',
    'substituido',
    'cancelado'
  )
);
