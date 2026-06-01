import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Etapa",
    value: "3º passo",
    description: "Apresentação individual após acordo ativo.",
  },
  {
    label: "Condição",
    value: "Acordo ativo",
    description: "Somente com cooperação vigente e publicada.",
  },
  {
    label: "Documentos",
    value: "Validação",
    description: "A Coordenadoria analisará os documentos do estudante.",
  },
];

const formSections = [
  {
    title: "Dados do estudante",
    fields: [
      "Nome completo",
      "CPF",
      "E-mail",
      "Telefone",
      "Data de nascimento",
      "Matrícula acadêmica",
    ],
  },
  {
    title: "Dados acadêmicos",
    fields: [
      "Instituição de ensino",
      "Curso",
      "Semestre/período",
      "Professor orientador",
      "E-mail do orientador",
      "Carga horária obrigatória",
    ],
  },
  {
    title: "Dados do estágio pretendido",
    fields: [
      "Acordo de Cooperação vinculado",
      "Sondagem/viabilidade vinculada",
      "Campo de estágio aprovado",
      "Unidade municipal pretendida",
      "Período de realização",
      "Horários pretendidos",
    ],
  },
];

const documents = [
  "Carta de Apresentação",
  "Termo de Compromisso de Estágio",
  "Comprovante de matrícula",
  "Apólice ou comprovante de seguro",
  "Plano de Atividades",
  "Documento de identificação do estudante",
];

export default function ApresentarEstudantePage() {
  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Apresentar Estudante"
      description="Encaminhe os dados e documentos do estudante após Acordo de Cooperação ativo, publicado e dentro da vigência."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/acordos"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver acordos
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-amber-800">
              Regra de liberação
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-amber-950">
              A apresentação de estudante depende de Acordo de Cooperação ativo.
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-amber-900">
              Esta etapa somente será liberada quando houver Acordo de Cooperação
              assinado, publicado, dentro da vigência e abrangendo o curso e o
              campo de estágio pretendido.
            </p>
          </div>

          <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800">
            Condicionado
          </span>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Dados para apresentação
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Esta tela é visual nesta etapa. Depois, os dados serão enviados
              para validação da Coordenadoria antes da autorização de início do
              estágio.
            </p>
          </div>

          <div className="space-y-6">
            {formSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-bold text-slate-950">
                  {section.title}
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field} className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {field}
                      </span>
                      <div className="h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
                        Campo a preencher
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Enviar apresentação
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Salvar rascunho
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Documentos previstos
            </h2>

            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                >
                  {document}
                </div>
              ))}
            </div>
          </div>

          <ActionCard
            title="Validação documental"
            description="A Coordenadoria deverá conferir os documentos do estudante antes da autorização de início do estágio."
            status="Regra"
          />

          <ActionCard
            title="Vínculo com campo aprovado"
            description="O estudante deve ser vinculado a campo de estágio previamente considerado viável e compatível com o curso."
          />

          <ActionCard
            title="Autorização de início"
            description="A apresentação do estudante não significa início automático. O estágio só começa após autorização final."
          />
        </div>
      </section>
    </SystemShell>
  );
}
