-- Permite corrigir um termo enviado somente quando a apresentação
-- da mesma instituição foi devolvida pela Coordenadoria.
alter policy "commitment_terms_update_policy"
on public.commitment_terms
using (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and (
      status in ('rascunho', 'pendente_correcao')
      or (
        status = 'enviado'
        and exists (
          select 1
          from public.student_presentations sp
          where sp.id = commitment_terms.presentation_id
            and sp.institution_id = commitment_terms.institution_id
            and sp.status = 'pendente_correcao'
        )
      )
    )
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and status in ('rascunho', 'enviado', 'pendente_correcao')
  )
);
