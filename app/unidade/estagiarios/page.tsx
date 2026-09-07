import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInternsData } from "@/lib/queries/unit-interns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_unidade: "Aguardando unidade",
    aguardando_supervisor: "Aguardando supervisor",
    pronto_para_autorizar: "Pronto para autorizar",
    autorizado: "Autorizado para início",
    suspenso: "Suspenso",
    cancelado: "Cancelado",
    encerrado: "Encerrado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "autorizado") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "encerrado") {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  if (["suspenso", "cancelado"].includes(status)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UnidadeEstagiariosPage() {
  const { unit, interns, error } = await getUnitInternsData();

  const autorizados = interns.filter((item) => item.status === "autorizado").length;
  const suspensos = interns.filter((item) => item.status === "suspenso").length;
  const encerrados = interns.filter((item) => item.status === "encerrado").length;
  const ativos = interns.filter((item) =>
    ["autorizado", "pronto_para_autorizar"].includes(item.status),
  ).length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Estagiários da unidade"
      description="Acompanhe os estudantes autorizados para atuação na unidade municipal."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/sondagens"
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

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Unidade municipal
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {unit?.name ?? "Unidade não identificada"}
        </p>
        {unit?.responsible_name && (
          <p className="mt-1 text-sm text-slate-600">
            Responsável: {unit.responsible_name}
          </p>
        )}
      </section>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Autorizados
          </p>
          <p className="text-xl font-black text-sky-700">{autorizados}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Ativos
          </p>
          <p className="text-xl font-black text-teal-700">{ativos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Suspensos
          </p>
          <p className="text-xl font-black text-red-700">{suspensos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Encerrados
          </p>
          <p className="text-xl font-black text-slate-950">{encerrados}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Estagiários vinculados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Listagem real dos estudantes com autorização de início emitida para esta unidade.
          </p>
        </div>

        {interns.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estagiário autorizado para esta unidade até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Supervisor</th>
                  <th className="px-3 py-2 font-black">Início</th>
                  <th className="px-3 py-2 font-black">Término</th>
                  <th className="px-3 py-2 font-black">Horário</th>
                  <th className="px-3 py-2 font-black">Status</th>
                  <th className="px-3 py-2 font-black">Observações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">
                        {intern.student_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {intern.student_email ?? "E-mail não informado"}
                      </p>
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {intern.institution_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {intern.course_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-700">
                      {intern.supervisor_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(intern.authorized_start_date)}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(intern.authorized_end_date)}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {intern.authorized_schedule ?? "-"}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          intern.status,
                        )}`}
                      >
                        {statusLabel(intern.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {intern.notes ? (
                        <details className="max-w-[220px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Ver observação
                          </summary>
                          <p className="mt-1 leading-5">{intern.notes}</p>
                        </details>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          Esta tela é de acompanhamento da unidade. Ocorrências, ajustes e relatório final serão implementados em etapas próprias.
        </div>
      </section>
    </SystemShell>
  );
}
