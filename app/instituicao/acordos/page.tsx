import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Em análise",
    value: "0",
    description: "Pedidos enviados e aguardando conferência.",
  },
  {
    label: "Assinatura",
    value: "0",
    description: "Acordos aguardando assinatura das partes.",
  },
  {
    label: "Ativos",
    value: "0",
    description: "Acordos vigentes e aptos para apresentação de estudantes.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Acordos aguardando ajuste ou documento complementar.",
  },
];

const agreements = [
  {
    title: "Acordo de Cooperação Técnica",
    status: "Em análise",
    courses: ["Direito", "Administração"],
    validity: "A definir",
    publication: "Pendente",
    description:
      "Pedido encaminhado à Coordenadoria para análise dos dados institucionais, cursos abrangidos e documentos apresentados.",
  },
  {
    title: "Acordo de Cooperação Técnica",
    status: "Aguardando assinatura",
    courses: ["Serviço Social", "Enfermagem"],
    validity: "24 meses",
    publication: "Após assinatura",
    description:
      "Minuta aprovada e pendente de assinatura. Após assinatura e publicação, o acordo poderá ser ativado.",
  },
  {
    title: "Acordo de Cooperação Técnica",
    status: "Ativo",
    courses: ["Técnico em Administração"],
    validity: "01/01/2026 a 31/12/2027",
    publication: "Registrada",
    description:
      "Acordo ativo e dentro da vigência. A instituição poderá apresentar estudantes vinculados aos cursos abrangidos.",
  },
];

export default function InstituicaoAcordosPage() {
  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Acompanhar Acordos"
      description="Consulte a situação dos pedidos de cooperação técnica e acompanhe análise, assinatura, publicação e vigência dos acordos."
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

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Meus acordos
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na versão com banco de dados,
            a instituição poderá acompanhar seus pedidos, consultar minutas,
            anexar documentos, visualizar pendências e verificar a vigência dos
            acordos ativos.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {agreements.map((agreement, index) => (
            <article
              key={`${agreement.title}-${index}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-950">
                  {agreement.title}
                </h3>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {agreement.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {agreement.description}
              </p>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Vigência
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {agreement.validity}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Publicação
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {agreement.publication}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cursos abrangidos
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {agreement.courses.map((course) => (
                    <span
                      key={course}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Ver detalhes
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Documentos
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Minuta
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Acordo ativo"
          description="A apresentação de estudantes somente será liberada quando houver acordo ativo, assinado, publicado e dentro da vigência."
          status="Regra"
        />
        <ActionCard
          title="Pendências documentais"
          description="Caso a Coordenadoria solicite ajustes, a instituição poderá acompanhar a pendência e complementar informações."
        />
        <ActionCard
          title="Controle de vigência"
          description="A instituição poderá consultar acordos vigentes, vencidos, encerrados ou em fase de renovação."
        />
      </section>
    </SystemShell>
  );
}
