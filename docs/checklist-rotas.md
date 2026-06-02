# Integra Estágio — Checklist de Rotas e Módulos

Checklist técnico para conferência das rotas, módulos e regras antes da modelagem do banco no Supabase.

---

## 1. Site público

| Rota | Finalidade | Status |
|---|---|---|
| `/` | Página inicial pública | Criada |
| `/como-funciona` | Explicação do fluxo | Criada |
| `/instituicoes` | Orientação para instituições | Criada |
| `/estudantes` | Orientação para estudantes | Criada |
| `/orgaos-municipais` | Orientação para órgãos/unidades | Criada |
| `/campos-de-estagio` | Catálogo público de campos | Criada |
| `/documentos` | Documentos do programa | Criada |
| `/perguntas-frequentes` | FAQ | Criada |
| `/noticias` | Notícias e avisos | Criada |
| `/base-legal` | Base normativa | Criada |
| `/acesso` | Entrada para áreas internas | Criada |

---

## 2. Áreas internas principais

| Rota | Perfil | Finalidade | Status |
|---|---|---|---|
| `/instituicao` | Instituição | Painel da instituição | Criada |
| `/coordenadoria` | Coordenadoria | Painel central | Criada |
| `/unidade` | Unidade Municipal | Painel da unidade | Criada |
| `/estagiario` | Estagiário | Painel do estagiário | Criada |

---

## 3. Área da Instituição

| Rota | Finalidade | Regra principal | Status |
|---|---|---|---|
| `/instituicao/consultar-campo` | Enviar sondagem de campo | Primeira etapa do fluxo | Criada |
| `/instituicao/sondagens` | Acompanhar sondagens | Mostra andamento e viabilidade | Criada |
| `/instituicao/solicitar-acordo` | Solicitar Acordo de Cooperação | Somente após sondagem viável ou parcialmente viável | Criada |
| `/instituicao/acordos` | Acompanhar acordos | Consulta análise, assinatura, publicação e vigência | Criada |
| `/instituicao/apresentar-estudante` | Apresentar estudante | Somente após acordo ativo, assinado, publicado e vigente | Criada |

Regras principais:

- Não pode solicitar acordo sem sondagem viável ou parcialmente viável.
- Não pode apresentar estudante sem acordo ativo.
- Apresentação de estudante não autoriza início automático.
- Deve acompanhar pendências e respostas da Coordenadoria.

---

## 4. Área da Coordenadoria

| Rota | Finalidade | Padrão visual | Status |
|---|---|---|---|
| `/coordenadoria/campos-estagio` | Configurar campos de estágio | Cards/listagem configurável | Criada |
| `/coordenadoria/instituicoes-cursos` | Gerenciar instituições e cursos | Cards/listagem administrativa | Criada |
| `/coordenadoria/acordos-cooperacao` | Controlar acordos | Cards/listagem administrativa | Criada |
| `/coordenadoria/sondagens` | Analisar sondagens | Cards operacionais | Criada |
| `/coordenadoria/estudantes` | Validar estudantes apresentados | Tabela/listagem compacta | Criada |
| `/coordenadoria/autorizacoes` | Autorizar início | Tabela/listagem compacta | Criada |
| `/coordenadoria/relatorios` | Relatórios e auditoria | Indicadores + tabela | Criada |

Regras principais:

- Consolidar viabilidade das sondagens.
- Validar documentos antes da autorização.
- Exigir acordo ativo antes da apresentação de estudante.
- Exigir unidade e supervisor antes de autorizar início.
- Registrar histórico/auditoria das ações importantes.
- Usar tabela/listagem compacta em telas com volume.

---

## 5. Área da Unidade Municipal

| Rota | Finalidade | Padrão visual | Status |
|---|---|---|---|
| `/unidade/sondagens` | Responder sondagens | Cards operacionais | Criada |
| `/unidade/estagiarios` | Acompanhar estagiários | Tabela/listagem compacta | Criada |
| `/unidade/ocorrencias` | Registrar ocorrências | Formulário + tabela | Criada |
| `/unidade/relatorio-final` | Registrar encerramento | Formulário + tabela | Criada |

Regras principais:

- Responder se possui ou não campo disponível.
- Informar limite de estudantes, horários e condições.
- Indicar supervisor quando houver campo.
- Acompanhar apenas estagiários vinculados à sua unidade.
- Registrar ocorrências e relatório final.

---

## 6. Área do Estagiário

| Rota | Finalidade | Status |
|---|---|---|
| `/estagiario/situacao` | Acompanhar situação, documentos e pendências | Criada |
| `/estagiario/orientacoes` | Consultar unidade, supervisor, período e orientações | Criada |

Regras principais:

- Não iniciar atividades antes da autorização formal.
- Visualizar somente dados vinculados à própria apresentação.
- Consultar documentos, unidade, supervisor, horários e orientações.

---

## 7. Responsividade

Conferir manualmente nas larguras:

- 390 px;
- 430 px;
- 768 px.

Pontos de atenção:

- menu superior compacto no celular;
- menu lateral fixo apenas no desktop;
- cards em uma coluna no celular;
- tabelas com rolagem horizontal;
- botões sem estourar a largura;
- textos sem quebra ruim;
- formulários confortáveis em tela pequena.

Rotas prioritárias para teste mobile:

- `/coordenadoria/estudantes`;
- `/coordenadoria/autorizacoes`;
- `/coordenadoria/relatorios`;
- `/unidade/estagiarios`;
- `/unidade/ocorrencias`;
- `/unidade/relatorio-final`;
- `/instituicao/apresentar-estudante`;
- `/estagiario/orientacoes`.

---

## 8. Telas que devem usar tabela/listagem compacta

- `/coordenadoria/estudantes`;
- `/coordenadoria/autorizacoes`;
- `/coordenadoria/relatorios`;
- `/unidade/estagiarios`;
- `/unidade/ocorrencias`;
- `/unidade/relatorio-final`.

Motivo:

Essas telas podem ter muitos registros e não devem usar cards como padrão principal.

---

## 9. Regras críticas para Supabase

Antes de criar as tabelas, garantir que o banco imponha:

1. acordo depende de sondagem viável ou parcialmente viável;
2. estudante depende de acordo ativo, assinado, publicado e vigente;
3. autorização depende de documentos validados;
4. autorização depende de unidade definida;
5. autorização depende de supervisor indicado;
6. usuário só acessa dados do próprio perfil ou responsabilidade;
7. ações importantes geram log/auditoria;
8. documentos usam storage com regras de acesso;
9. status são controlados e não texto livre;
10. alterações sensíveis preservam histórico.

---

## 10. Próxima etapa

Após este checklist:

1. revisar `docs/modelagem-inicial.md`;
2. conferir rotas no navegador;
3. testar responsividade;
4. criar modelagem detalhada do banco;
5. definir tabelas, relacionamentos, RLS e permissões;
6. iniciar Supabase com prudência.

---

Fim do checklist.
