import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationStudentPresentationsData } from "@/lib/queries/coordination-student-presentations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    apresentado: "Apresentado",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Apto para autorização",
    autorizado: "Autorizado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (["autorizado", "apto_para_autorizacao", "documentos_validados"].includes(status)) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (["pendente_correcao", "em_analise", "apresentado"].includes(status)) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (["indeferido", "cancelado"].includes(status)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function CoordenadoriaEstudantesPage() {
  const { presentations, error } =
    await getCoordinationStudentPresentationsData();

  const recebidos = presentations.length;
  const pendentes = presentations.filter((item) =>
    ["apresentado", "em_analise"].includes(item.status),
  ).length;
  const correcao = presentations.filter(
    (item) => item.status === "pendente_correcao",
  ).length;
  const aptos = presentations.filter((item) =>
    ["documentos_validados", "apto_para_autorizacao", "autorizado"].includes(
      item.status,
    ),
  ).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Estudantes apresentados"
      description="Analise estudantes encaminhados pelas instituições e acompanhe a situação de cada apresentação."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/sondagens"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Recebidos
          </p>
          <p className="text-xl font-black text-slate-950">{recebidos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Pendentes
          </p>
          <p className="text-xl font-black text-amber-700">{pendentes}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Correção
          </p>
          <p className="text-xl font-black text-slate-950">{correcao}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Aptos
          </p>
          <p className="text-xl font-black text-teal-700">{aptos}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Apresentações recebidas
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Listagem real dos estudantes apresentados pelas instituições.
          </p>
        </div>

        {presentations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estudante apresentado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Período</th>
                  <th className="px-3 py-2 font-black">Carga</th>
                  <th className="px-3 py-2 font-black">Status</th>
                  <th className="px-3 py-2 font-black">Recebido</th>
                  <th className="px-3 py-2 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {presentations.map((presentation) => (
                  <tr key={presentation.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">
                        {presentation.student_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {presentation.student_email ?? "E-mail não informado"}
                      </p>
                      {presentation.student_cpf && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          CPF: {presentation.student_cpf}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-700">
                      {presentation.institution_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {presentation.course_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {presentation.municipal_unit_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <p>{presentation.intended_period ?? "-"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {presentation.intended_schedule ?? "-"}
                      </p>
                    </td>

                    <td className="px-3 py-2 align-top font-bold text-slate-800">
                      {formatNumber(presentation.required_workload)}h
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          presentation.status,
                        )}`}
                      >
                        {statusLabel(presentation.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(presentation.created_at)}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <div className="flex justify-end">
                        <Link
                          href={`/coordenadoria/estudantes/${presentation.id}/analise`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Analisar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          Nesta etapa, a listagem já utiliza o banco de dados. A análise
          documental e autorização de início serão implementadas em etapa própria.
        </div>
      </section>
    </SystemShell>
  );
}

