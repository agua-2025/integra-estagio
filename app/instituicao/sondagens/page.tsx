import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionInquiriesData } from "@/lib/queries/institution-inquiries";
import { createInstitutionInquiry } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoSondagensPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
  }>;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    recebida: "Recebida",
    em_analise: "Em análise",
    encaminhada: "Encaminhada",
    viavel: "Viável",
    viavel_parcial: "Viável parcialmente",
    inviavel: "Sem campo disponível",
    pendente: "Pendente",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "viavel_parcial" || status === "em_analise" || status === "encaminhada") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "inviavel") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return String(value);
}

export default async function InstituicaoSondagensPage({
  searchParams,
}: InstituicaoSondagensPageProps) {
  const params = await searchParams;
  const { institution, courses, inquiries, error } =
    await getInstitutionInquiriesData();

  const institutionIsActive = institution?.status === "ativa";
  const receivedCount = inquiries.filter((item) => item.status === "recebida").length;
  const inAnalysisCount = inquiries.filter((item) =>
    ["em_analise", "encaminhada", "pendente"].includes(item.status),
  ).length;
  const viableCount = inquiries.filter((item) =>
    ["viavel", "viavel_parcial"].includes(item.status),
  ).length;

  const summaries = [
    {
      label: "Enviadas",
      value: String(inquiries.length),
      description: "Sondagens encaminhadas pela instituição.",
    },
    {
      label: "Recebidas",
      value: String(receivedCount),
      description: "Sondagens aguardando análise inicial.",
    },
    {
      label: "Em análise",
      value: String(inAnalysisCount),
      description: "Sondagens em análise pela Coordenadoria ou unidade.",
    },
    {
      label: "Viáveis",
      value: String(viableCount),
      description: "Sondagens com possibilidade de campo identificada.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Sondagens de Campo"
      description="Solicite e acompanhe consultas sobre possibilidade de campo de estágio curricular supervisionado."
    >
      <div className="mb-6">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Sondagem enviada com sucesso. A Coordenadoria poderá analisar a
          solicitação e, se necessário, encaminhar às unidades municipais.
        </section>
      )}

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!institutionIsActive && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          A instituição precisa estar ativa para solicitar sondagens. Complete o
          cadastro institucional e aguarde a validação da Coordenadoria.
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Nova sondagem
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informe o curso e a necessidade de estágio. O campo específico será
            analisado posteriormente pela Coordenadoria e pelas unidades
            municipais, conforme disponibilidade.
          </p>

          {courses.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-amber-950">
                Nenhum curso ativo cadastrado.
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Cadastre ao menos um curso antes de solicitar sondagem.
              </p>
              <Link
                href="/instituicao/cursos"
                className="mt-4 inline-flex rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-950"
              >
                Cadastrar curso
              </Link>
            </div>
          ) : (
            <form action={createInstitutionInquiry} className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Curso
                </span>
                <select
                  name="course_id"
                  required
                  disabled={!institutionIsActive}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Selecione o curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Área pretendida
                </span>
                <input
                  name="requested_area"
                  required
                  disabled={!institutionIsActive}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: jurídico, administrativo, saúde, assistência social..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Quantidade de estudantes
                  </span>
                  <input
                    name="requested_students"
                    type="number"
                    min="1"
                    required
                    disabled={!institutionIsActive}
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Ex.: 5"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Carga horária exigida
                  </span>
                  <input
                    name="required_workload"
                    type="number"
                    min="0"
                    disabled={!institutionIsActive}
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Ex.: 100"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Período pretendido
                </span>
                <input
                  name="intended_period"
                  disabled={!institutionIsActive}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 2º semestre de 2026"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Observações
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  disabled={!institutionIsActive}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Informe detalhes úteis para a análise da Coordenadoria."
                />
              </label>

              <button
                type="submit"
                disabled={!institutionIsActive}
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Enviar sondagem
              </button>
            </form>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-950">
              Sondagens enviadas
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Acompanhe as consultas encaminhadas pela instituição.
            </p>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-5 text-sm font-semibold text-slate-600">
              Nenhuma sondagem enviada até o momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map((inquiry) => (
                <article key={inquiry.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {inquiry.course_name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {inquiry.requested_area ?? "Área não informada"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        inquiry.status,
                      )}`}
                    >
                      {statusLabel(inquiry.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Estudantes
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatNumber(inquiry.requested_students)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Carga horária
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {inquiry.required_workload !== null
                          ? `${inquiry.required_workload}h`
                          : "Não informada"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Período
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {inquiry.intended_period ?? "Não informado"}
                      </p>
                    </div>
                  </div>

                  {inquiry.notes && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {inquiry.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SystemShell>
  );
}
