import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Etapa",
    value: "2º passo",
    description: "Solicitação formal após viabilidade de campo.",
  },
  {
    label: "Documentos",
    value: "Análise",
    description: "Dados institucionais serão conferidos pela Coordenadoria.",
  },
  {
    label: "Resultado",
    value: "Acordo",
    description: "Havendo aprovação, será gerada a minuta para assinatura.",
  },
];

const formSections = [
  {
    title: "Dados da instituição",
    fields: [
      "Nome da instituição",
      "CNPJ",
      "Endereço",
      "Município/UF",
      "Telefone institucional",
      "E-mail institucional",
    ],
  },
  {
    title: "Representante legal",
    fields: [
      "Nome completo",
      "CPF",
      "Cargo ou função",
      "E-mail",
      "Telefone",
      "Documento de representação",
    ],
  },
  {
    title: "Responsável pelo estágio",
    fields: [
      "Nome do responsável",
      "Cargo ou setor",
      "E-mail",
      "Telefone",
      "Cursos sob responsabilidade",
      "Observações",
    ],
  },
  {
    title: "Cursos abrangidos",
    fields: [
      "Curso",
      "Nível de ensino",
      "Carga horária obrigatória",
      "Professor/orientador",
      "Quantidade estimada de estudantes",
      "Campo pretendido",
    ],
  },
];

const documents = [
  "Documento de identificação do representante",
  "Comprovante de representação legal",
  "Dados cadastrais da instituição",
  "Relação de cursos pretendidos",
  "Modelo institucional, se houver",
];

export default function SolicitarAcordoPage() {
  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Solicitar Acordo de Cooperação"
      description="Formalize o pedido de cooperação institucional após a existência de campo de estágio viável ou parcialmente viável."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/sondagens"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Dados para formalização
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Esta tela é visual nesta etapa. Depois, os dados serão validados,
              armazenados e encaminhados para análise da Coordenadoria.
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
              Enviar pedido de acordo
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
            title="Vínculo com sondagem"
            description="O pedido de acordo deverá preferencialmente estar vinculado a uma sondagem com viabilidade de campo aprovada ou parcialmente aprovada."
            status="Regra"
          />

          <ActionCard
            title="Análise da Coordenadoria"
            description="A Coordenadoria conferirá os dados, solicitará ajustes se necessário e poderá gerar a minuta do acordo."
          />

          <ActionCard
            title="Antes dos estudantes"
            description="A instituição somente deverá apresentar estudantes após acordo ativo, assinado, publicado e dentro da vigência."
          />
        </div>
      </section>
    </SystemShell>
  );
}
