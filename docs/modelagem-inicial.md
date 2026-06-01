# Integra Estágio — Modelagem Inicial

Documento de referência para orientar a criação do banco de dados, autenticação, permissões, regras de negócio e evolução do sistema Integra Estágio.

Este arquivo registra o fluxo aprovado até esta etapa visual do projeto, para evitar que regras, telas ou dependências sejam esquecidas na hora da modelagem do Supabase.

---

## 1. Áreas do sistema

O sistema terá quatro áreas principais:

1. Instituição de Ensino;
2. Coordenadoria;
3. Unidade Municipal;
4. Estagiário.

---

## 2. Responsabilidades por perfil

### Instituição de Ensino

A instituição poderá:

- consultar campo de estágio;
- acompanhar sondagens;
- solicitar Acordo de Cooperação Técnica somente após viabilidade de campo;
- acompanhar acordos;
- apresentar estudantes somente após acordo ativo;
- acompanhar pendências e orientações.

### Coordenadoria

A Coordenadoria poderá:

- configurar campos de estágio;
- cadastrar instituições e cursos;
- controlar Acordos de Cooperação Técnica;
- analisar sondagens;
- encaminhar sondagens para unidades municipais;
- consolidar viabilidade;
- validar estudantes apresentados;
- solicitar correção documental;
- autorizar início de estágio;
- acompanhar ocorrências, relatórios e auditoria.

### Unidade Municipal

A unidade poderá:

- responder sondagens;
- informar disponibilidade de campo;
- indicar limites, horários, atividades compatíveis e supervisor;
- acompanhar estagiários autorizados;
- registrar ocorrências;
- registrar relatório final e encerramento.

### Estagiário

O estagiário poderá:

- acompanhar a própria situação;
- consultar documentos e pendências;
- consultar unidade, supervisor, período, horários e orientações após autorização.

---

## 3. Fluxo principal aprovado

O fluxo principal será:

1. Instituição consulta campo de estágio;
2. Coordenadoria recebe a sondagem;
3. Coordenadoria encaminha para unidade municipal;
4. Unidade responde sobre disponibilidade;
5. Coordenadoria consolida a viabilidade;
6. Instituição acompanha o resultado;
7. Se houver viabilidade positiva ou parcial, a instituição poderá solicitar Acordo de Cooperação Técnica;
8. Coordenadoria analisa o acordo;
9. Acordo precisa estar assinado, publicado, ativo e vigente;
10. Instituição apresenta estudante;
11. Coordenadoria valida documentos;
12. Coordenadoria autoriza início;
13. Unidade acompanha o estágio;
14. Unidade registra ocorrências, se houver;
15. Unidade registra relatório final;
16. Estagiário acompanha situação e orientações.

---

## 4. Regra da sondagem

A Instituição de Ensino não poderá solicitar Acordo de Cooperação Técnica livremente.

O pedido de acordo somente será liberado quando existir sondagem com um destes status:

- viável;
- viável parcial.

Status de sondagem previstos:

- rascunho;
- enviada;
- recebida;
- em análise;
- encaminhada à unidade;
- aguardando unidade;
- complementação solicitada;
- viável;
- viável parcial;
- sem disponibilidade;
- cancelada;
- convertida em acordo.

Status que não liberam acordo:

- rascunho;
- enviada;
- recebida;
- em análise;
- encaminhada à unidade;
- aguardando unidade;
- complementação solicitada;
- sem disponibilidade;
- cancelada.

---

## 5. Regra do Acordo de Cooperação

A apresentação de estudantes somente será liberada quando houver Acordo de Cooperação Técnica:

- assinado;
- publicado;
- ativo;
- dentro da vigência;
- abrangendo o curso correspondente.

Status previstos para acordo:

- rascunho;
- em análise;
- pendente de correção;
- minuta gerada;
- aguardando assinatura;
- assinado;
- publicado;
- ativo;
- vencido;
- encerrado;
- cancelado.

Acordos vencidos, não publicados, não assinados, encerrados ou cancelados não liberam apresentação de estudantes.

---

## 6. Regra da apresentação do estudante

A instituição somente poderá apresentar estudante após acordo ativo.

A apresentação do estudante não autoriza início automático.

A apresentação deve conter:

- estudante;
- instituição;
- curso;
- matrícula acadêmica;
- professor ou orientador;
- carga horária obrigatória;
- acordo vinculado;
- sondagem ou campo aprovado vinculado;
- unidade pretendida;
- período pretendido;
- horários pretendidos;
- documentos obrigatórios.

Documentos previstos:

- Carta de Apresentação;
- Termo de Compromisso de Estágio;
- Comprovante de matrícula;
- Apólice ou comprovante de seguro;
- Plano de Atividades;
- Documento de identificação do estudante.

Status previstos para apresentação:

- rascunho;
- apresentado;
- em análise;
- pendente de correção;
- documentos validados;
- apto para autorização;
- autorizado;
- indeferido;
- cancelado.

---

## 7. Validação pela Coordenadoria

A Coordenadoria deverá validar:

- acordo ativo;
- curso abrangido pelo acordo;
- campo compatível;
- unidade definida ou a definir;
- supervisor indicado ou pendente;
- documentos obrigatórios;
- período e carga horária;
- compatibilidade geral da solicitação.

Tela prevista:

- /coordenadoria/estudantes

Esta tela deve usar listagem compacta em formato de tabela, pois poderá haver muitos estudantes.

Ações previstas:

- ver detalhes;
- solicitar correção;
- marcar como apto;
- encaminhar para autorização;
- consultar documentos.

---

## 8. Autorização de início

O estágio somente poderá iniciar após autorização formal da Coordenadoria.

Tela prevista:

- /coordenadoria/autorizacoes

A autorização deve exigir:

- estudante validado;
- documentos validados;
- acordo ativo;
- curso abrangido;
- campo aprovado;
- unidade municipal definida;
- supervisor indicado;
- período autorizado;
- horários autorizados;
- data de início;
- observações.

Status previstos para autorização:

- aguardando unidade;
- aguardando supervisor;
- pronto para autorizar;
- autorizado;
- suspenso;
- cancelado;
- encerrado.

---

## 9. Unidade Municipal

A Unidade Municipal terá as seguintes telas:

- /unidade/sondagens;
- /unidade/estagiarios;
- /unidade/ocorrencias;
- /unidade/relatorio-final.

A unidade responderá sondagens informando:

- disponibilidade;
- limite de estudantes;
- horários possíveis;
- atividades compatíveis;
- supervisor possível;
- observações.

A tela de estagiários da unidade deve usar tabela/listagem compacta.

Ocorrências previstas:

- falta;
- atraso;
- ajuste de horário;
- alteração de supervisor;
- dificuldade de acompanhamento;
- encerramento antecipado;
- outra ocorrência.

O relatório final deve registrar:

- estudante;
- instituição;
- curso;
- unidade;
- supervisor;
- período realizado;
- carga horária cumprida;
- resumo das atividades;
- observações;
- situação do encerramento.

---

## 10. Estagiário

A área do estagiário terá:

- /estagiario/situacao;
- /estagiario/orientacoes.

O estagiário visualizará:

- situação da apresentação;
- instituição;
- curso;
- campo pretendido;
- unidade municipal;
- supervisor;
- documentos;
- pendências;
- autorização de início;
- orientações.

Regra:

- o estagiário não deve iniciar atividades antes da autorização formal.

---

## 11. Rotas internas previstas

### Instituição

- /instituicao;
- /instituicao/consultar-campo;
- /instituicao/sondagens;
- /instituicao/solicitar-acordo;
- /instituicao/acordos;
- /instituicao/apresentar-estudante.

### Coordenadoria

- /coordenadoria;
- /coordenadoria/campos-estagio;
- /coordenadoria/instituicoes-cursos;
- /coordenadoria/acordos-cooperacao;
- /coordenadoria/sondagens;
- /coordenadoria/estudantes;
- /coordenadoria/autorizacoes;
- /coordenadoria/relatorios.

### Unidade Municipal

- /unidade;
- /unidade/sondagens;
- /unidade/estagiarios;
- /unidade/ocorrencias;
- /unidade/relatorio-final.

### Estagiário

- /estagiario;
- /estagiario/situacao;
- /estagiario/orientacoes.

---

## 12. Tabelas previstas para o banco

Modelagem inicial prevista para Supabase:

- profiles;
- institutions;
- institution_contacts;
- courses;
- municipal_units;
- internship_fields;
- field_courses;
- inquiries;
- inquiry_unit_responses;
- cooperation_agreements;
- agreement_courses;
- students;
- student_presentations;
- student_documents;
- internship_authorizations;
- internships;
- occurrences;
- final_reports;
- audit_logs;
- notifications.

---

## 13. Regras críticas

1. Não permitir pedido de acordo sem sondagem viável ou parcialmente viável.
2. Não permitir apresentação de estudante sem acordo ativo, publicado e vigente.
3. Não permitir autorização de início sem documentos validados.
4. Não permitir autorização de início sem unidade definida.
5. Não permitir autorização de início sem supervisor indicado.
6. Cada perfil deve visualizar e alterar apenas o que for de sua responsabilidade.
7. Telas com volume devem usar tabela/listagem compacta.
8. O sistema deve ser responsivo no celular.
9. No desktop, o menu lateral deve permanecer fixo.
10. No celular, deve haver menu superior compacto.
11. Tabelas devem ter rolagem horizontal no celular.
12. Logs e auditoria devem ser considerados desde a modelagem inicial.

---

## 14. Telas que devem priorizar tabela/listagem

- /coordenadoria/estudantes;
- /coordenadoria/autorizacoes;
- /unidade/estagiarios;
- /unidade/ocorrencias;
- /unidade/relatorio-final;
- /coordenadoria/relatorios.

---

## 15. Ordem recomendada para implementar o banco

1. Autenticação e perfis;
2. Instituições, cursos e unidades;
3. Campos de estágio;
4. Sondagens e respostas das unidades;
5. Acordos de cooperação;
6. Estudantes e documentos;
7. Autorizações de início;
8. Estágios autorizados;
9. Ocorrências;
10. Relatórios finais;
11. Logs e auditoria;
12. Notificações.

---

## 16. Padrão visual aprovado

O padrão visual aprovado é:

- limpo;
- moderno;
- profissional;
- azul e teal;
- cards para resumos;
- tabelas para volume;
- botões discretos;
- responsivo;
- menu lateral fixo no desktop;
- menu superior no celular;
- identidade visual do Integra Estágio aplicada com cuidado.

---

Fim do documento.
