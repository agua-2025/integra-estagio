# Integra Estágio — Modelagem do Banco Supabase

Documento técnico para orientar a criação das tabelas, relacionamentos, regras de negócio, permissões RLS, storage e auditoria do sistema Integra Estágio.

Este documento deve ser revisado antes de executar qualquer SQL no Supabase.

---

## 1. Princípios da modelagem

A modelagem deve seguir o fluxo aprovado:

1. Instituição consulta campo de estágio;
2. Coordenadoria analisa a sondagem;
3. Unidade Municipal responde disponibilidade;
4. Coordenadoria consolida viabilidade;
5. Instituição solicita acordo somente se houver viabilidade;
6. Acordo precisa estar assinado, publicado, ativo e vigente;
7. Instituição apresenta estudante;
8. Coordenadoria valida documentos;
9. Coordenadoria autoriza início;
10. Unidade acompanha estágio;
11. Unidade registra ocorrências e relatório final;
12. Estagiário acompanha situação e orientações.

Nenhuma etapa posterior deve ser liberada sem a etapa anterior válida.

---

## 2. Perfis de acesso

Tabela: profiles

Campos principais:

- id
- full_name
- email
- role
- institution_id
- municipal_unit_id
- student_id
- is_active
- created_at
- updated_at

Perfis previstos:

- admin
- coordenadoria
- instituicao
- unidade
- estagiario

Regras:

- Coordenadoria visualiza o fluxo geral.
- Instituição visualiza apenas seus próprios registros.
- Unidade visualiza apenas registros encaminhados ou vinculados à sua unidade.
- Estagiário visualiza apenas dados vinculados a ele.
- Admin pode operar configurações gerais, se necessário.

---

## 3. Instituições, contatos e cursos

Tabela: institutions

Campos principais:

- id
- name
- cnpj
- address
- city
- state
- phone
- email
- status
- notes
- created_at
- updated_at

Status previstos:

- em_analise
- ativa
- pendente
- inativa
- bloqueada

Tabela: institution_contacts

Campos principais:

- id
- institution_id
- name
- position
- email
- phone
- is_legal_representative
- is_internship_responsible
- is_active
- created_at
- updated_at

Tabela: courses

Campos principais:

- id
- institution_id
- name
- level
- workload_required
- is_active
- created_at
- updated_at

Níveis previstos:

- superior
- tecnico
- medio
- outro

Relacionamentos:

- Uma instituição possui vários cursos.
- Uma instituição possui vários contatos.
- Uma instituição possui várias sondagens.
- Uma instituição possui vários acordos.
- Uma instituição apresenta vários estudantes.

---

## 4. Unidades municipais

Tabela: municipal_units

Campos principais:

- id
- name
- department
- address
- responsible_name
- email
- phone
- is_active
- created_at
- updated_at

Relacionamentos:

- Unidade responde sondagens.
- Unidade recebe estagiários autorizados.
- Unidade registra ocorrências.
- Unidade registra relatório final.
- Unidade pode ter usuários vinculados.

---

## 5. Campos de estágio

Tabela: internship_fields

Campos principais:

- id
- title
- description
- area
- municipal_unit_id
- status
- is_public
- available_slots
- shift
- supervisor_required
- display_order
- created_at
- updated_at

Status previstos:

- ativo
- em_analise
- temporariamente_indisponivel
- inativo

Regra:

Somente campos públicos e ativos devem aparecer para consulta pública ou para a instituição.

Tabela: field_courses

Campos principais:

- id
- field_id
- course_id
- is_active
- created_at

Finalidade:

Indicar quais cursos podem ser compatíveis com determinado campo de estágio.

---

## 6. Sondagens

Tabela: inquiries

Campos principais:

- id
- institution_id
- course_id
- field_id
- requested_area
- requested_students
- required_workload
- intended_period
- notes
- status
- submitted_by
- created_at
- updated_at

Status previstos:

- rascunho
- enviada
- recebida
- em_analise
- encaminhada_unidade
- aguardando_unidade
- complementacao_solicitada
- viavel
- viavel_parcial
- sem_disponibilidade
- cancelada
- convertida_em_acordo

Regra crítica:

Acordo de Cooperação só pode ser solicitado se a sondagem estiver com status:

- viavel
- viavel_parcial

Tabela: inquiry_unit_responses

Campos principais:

- id
- inquiry_id
- municipal_unit_id
- response_status
- available_slots
- possible_schedule
- compatible_activities
- supervisor_name
- notes
- responded_by
- created_at
- updated_at

Status previstos:

- campo_disponivel
- campo_com_limite
- sem_disponibilidade
- precisa_analise

Regra:

A Coordenadoria consolida a viabilidade considerando as respostas das unidades.

---

## 7. Acordos de Cooperação Técnica

Tabela: cooperation_agreements

Campos principais:

- id
- institution_id
- inquiry_id
- status
- legal_representative_name
- institution_responsible_name
- started_at
- ended_at
- signed_at
- published_at
- publication_reference
- document_url
- notes
- created_at
- updated_at

Status previstos:

- rascunho
- em_analise
- pendente_correcao
- minuta_gerada
- aguardando_assinatura
- assinado
- publicado
- ativo
- vencido
- encerrado
- cancelado

Regra crítica:

A apresentação de estudante somente será liberada se existir acordo:

- ativo;
- assinado;
- publicado;
- dentro da vigência;
- abrangendo o curso correspondente.

Tabela: agreement_courses

Campos principais:

- id
- agreement_id
- course_id
- is_active
- created_at

Finalidade:

Controlar quais cursos estão abrangidos por determinado acordo.

---

## 8. Estudantes e apresentações

Tabela: students

Campos principais:

- id
- full_name
- cpf
- email
- phone
- birth_date
- institution_id
- course_id
- academic_registration
- created_at
- updated_at

Observação:

O login do estagiário poderá ser vinculado depois pelo campo student_id em profiles.

Tabela: student_presentations

Campos principais:

- id
- student_id
- institution_id
- course_id
- agreement_id
- inquiry_id
- field_id
- municipal_unit_id
- intended_period
- intended_schedule
- required_workload
- status
- submitted_by
- reviewed_by
- review_notes
- created_at
- updated_at

Status previstos:

- rascunho
- apresentado
- em_analise
- pendente_correcao
- documentos_validados
- apto_para_autorizacao
- autorizado
- indeferido
- cancelado

Regra:

A apresentação não pode existir sem acordo ativo e válido.

---

## 9. Documentos do estudante

Tabela: student_documents

Campos principais:

- id
- presentation_id
- document_type
- file_path
- status
- notes
- uploaded_by
- reviewed_by
- created_at
- updated_at

Tipos previstos:

- carta_apresentacao
- termo_compromisso
- comprovante_matricula
- seguro
- plano_atividades
- documento_identificacao
- outro

Status previstos:

- pendente
- enviado
- validado
- rejeitado
- substituido

Bucket previsto:

- student-documents

---

## 10. Autorizações de início

Tabela: internship_authorizations

Campos principais:

- id
- presentation_id
- student_id
- institution_id
- course_id
- agreement_id
- field_id
- municipal_unit_id
- supervisor_name
- authorized_start_date
- authorized_end_date
- authorized_schedule
- status
- authorized_by
- notes
- created_at
- updated_at

Status previstos:

- aguardando_unidade
- aguardando_supervisor
- pronto_para_autorizar
- autorizado
- suspenso
- cancelado
- encerrado

Regra crítica:

Não autorizar sem:

- documentos validados;
- acordo ativo;
- unidade definida;
- supervisor indicado;
- período autorizado.

---

## 11. Estágios autorizados

Tabela: internships

Campos principais:

- id
- authorization_id
- student_id
- institution_id
- course_id
- municipal_unit_id
- supervisor_name
- start_date
- end_date
- schedule
- status
- created_at
- updated_at

Status previstos:

- aguardando_inicio
- em_andamento
- suspenso
- encerrado
- cancelado

Finalidade:

Representar o estágio efetivamente autorizado e acompanhado pela unidade.

---

## 12. Ocorrências

Tabela: occurrences

Campos principais:

- id
- internship_id
- student_id
- municipal_unit_id
- occurrence_type
- occurred_at
- description
- measures_taken
- status
- created_by
- created_at
- updated_at

Tipos previstos:

- falta
- atraso
- ajuste_horario
- alteracao_supervisor
- dificuldade_acompanhamento
- encerramento_antecipado
- outra

Status previstos:

- registrada
- em_acompanhamento
- resolvida
- critica
- cancelada

---

## 13. Relatórios finais

Tabela: final_reports

Campos principais:

- id
- internship_id
- student_id
- municipal_unit_id
- supervisor_name
- performed_period
- completed_workload
- activities_summary
- supervisor_notes
- closing_status
- created_by
- created_at
- updated_at

Status de encerramento previstos:

- concluido
- concluido_com_observacao
- encerrado_antecipadamente
- pendente
- cancelado

---

## 14. Logs e auditoria

Tabela: audit_logs

Campos principais:

- id
- user_id
- module
- action
- entity_table
- entity_id
- old_data
- new_data
- description
- created_at

Ações que devem gerar log:

- criação de sondagem;
- envio de sondagem;
- resposta de unidade;
- consolidação de viabilidade;
- pedido de acordo;
- alteração de status do acordo;
- apresentação de estudante;
- validação ou rejeição de documento;
- autorização de início;
- registro de ocorrência;
- relatório final;
- alterações sensíveis de cadastro.

---

## 15. Notificações

Tabela: notifications

Campos principais:

- id
- profile_id
- title
- message
- related_module
- related_id
- read_at
- created_at

Finalidade:

Notificações internas futuras para pendências, respostas, acordos, autorizações, ocorrências e relatórios.

---

## 16. Buckets de Storage previstos

Buckets iniciais:

- student-documents
- agreement-documents
- institution-documents
- reports

Regras gerais:

- Instituição acessa documentos vinculados a ela.
- Estagiário acessa apenas documentos vinculados ao próprio processo.
- Unidade acessa documentos necessários ao acompanhamento.
- Coordenadoria acessa todos os documentos do fluxo.
- Storage deve ter regras de acesso compatíveis com as tabelas.

---

## 17. Regras RLS gerais

### Coordenadoria

Pode ler e alterar registros do fluxo geral, configurar campos, instituições, cursos e acordos, validar documentos, autorizar início, consultar relatórios e auditoria.

### Instituição

Pode ler e alterar apenas seus registros, criar sondagens, acompanhar suas sondagens, solicitar acordo quando permitido, apresentar estudantes vinculados a seus acordos e enviar documentos.

### Unidade Municipal

Pode ler sondagens encaminhadas para sua unidade, responder sondagens, acompanhar estagiários vinculados à sua unidade, registrar ocorrências e registrar relatório final.

### Estagiário

Pode ler apenas sua própria situação, consultar documentos e orientações vinculadas ao seu estágio e não deve alterar dados centrais do fluxo.

---

## 18. Ordem recomendada de criação no Supabase

1. profiles;
2. institutions;
3. institution_contacts;
4. courses;
5. municipal_units;
6. internship_fields;
7. field_courses;
8. inquiries;
9. inquiry_unit_responses;
10. cooperation_agreements;
11. agreement_courses;
12. students;
13. student_presentations;
14. student_documents;
15. internship_authorizations;
16. internships;
17. occurrences;
18. final_reports;
19. notifications;
20. audit_logs;
21. storage buckets;
22. RLS;
23. triggers de updated_at;
24. funções auxiliares de permissão.

---

## 19. Pontos de atenção antes do SQL

Antes de executar SQL, confirmar:

- nomes definitivos das tabelas;
- nomes definitivos dos status;
- se status serão texto com check constraint ou enum;
- se documentos serão obrigatórios desde o início;
- se uma instituição poderá ter mais de um usuário;
- se uma unidade poderá ter mais de um usuário;
- se o estagiário terá login próprio desde o início;
- se logs serão criados por trigger ou pela aplicação;
- se notificações internas entram já na primeira versão funcional.

---

Fim do documento.
