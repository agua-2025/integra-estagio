import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { createInternshipAuthorization } from "./actions";
import { getCoordinationAuthorizationsData } from "@/lib/queries/coordination-authorizations";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_unidade: "Aguardando unidade",
    aguardando_supervisor: "Aguardando supervisor",
    pronto_para_autorizar: "Pronto para autorizar",
    autorizado: "Autorizado",
    suspenso: "Suspenso",
    cancelado: "Cancelado",
    encerrado: "Encerrado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "autorizado") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "pronto_para_autorizar") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (["suspenso", "cancelado", "encerrado"].includes(status)) {
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

export default async function CoordenadoriaAutorizacoesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { readyPresentations, authorizations, error } =
    await getCoordinationAuthorizationsData();

  const aptos = readyPresentations.length;
  const autorizados = authorizations.filter(
    (item) => item.status === "autorizado",
  ).length;
  const pendencias = authorizations.filter((item) =>
    ["aguardando_unidade", "aguardando_supervisor"].includes(item.status),
  ).length;
  const total = authorizations.length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Autorizações de início"
      description="Emita a autorização formal para início do estágio após a análise da apresentação."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/estudantes"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estudantes
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Autorização de início registrada com sucesso.
        </section>
      )}

      {params?.erro && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(params.erro)}
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Prontos
          </p>
          <p className="text-xl font-black text-teal-700">{aptos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Autorizações
          </p>
          <p className="text-xl font-black text-slate-950">{total}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Autorizados
          </p>
          <p className="text-xl font-black text-teal-700">{autorizados}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Pendências
          </p>
          <p className="text-xl font-black text-amber-700">{pendencias}</p>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Prontos para emissão
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Estudantes com apresentação validada pela Coordenadoria e aptos para
            emissão da autorização formal.
          </p>
        </div>

        {readyPresentations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estudante pronto para emissão da autorização no momento.
          </div>
        ) : (
          <div className="grid gap-4 p-4">
            {readyPresentations.map((item) => (
              <form
                key={item.id}
                action={createInternshipAuthorization}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <input type="hidden" name="presentation_id" value={item.id} />

                <div className="mb-4 grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">
                      Estudante
                    </p>
                    <p className="font-black text-slate-950">{item.student_name}</p>
                    <p className="text-xs text-slate-500">{item.institution_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">
                      Curso
                    </p>
                    <p className="font-bold text-slate-800">{item.course_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">
                      Unidade
                    </p>
                    <p className="font-bold text-slate-800">
                      {item.municipal_unit_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">
                      Horário sugerido
                    </p>
                    <p className="font-bold text-slate-800">
                      {item.intended_schedule ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <label className="grid gap-1 xl:col-span-2">
                    <span className="text-xs font-bold text-slate-600">
                      Supervisor responsável
                    </span>
                    <input
                      name="supervisor_name"
                      required
                      defaultValue={item.supervisor_name ?? ""}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-slate-600">
                      Início autorizado
                    </span>
                    <input
                      name="authorized_start_date"
                      type="date"
                      required
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-slate-600">
                      Término
                    </span>
                    <input
                      name="authorized_end_date"
                      type="date"
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-slate-600">
                      Horário autorizado
                    </span>
                    <input
                      name="authorized_schedule"
                      defaultValue={item.intended_schedule ?? ""}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>
                </div>

                <label className="mt-3 grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Observações da autorização
                  </span>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Registre observações, condições ou referências do termo de compromisso."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
                  >
                    Emitir autorização
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Autorizações emitidas
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Relação das autorizações formais já registradas no sistema.
          </p>
        </div>

        {authorizations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhuma autorização emitida até o momento.
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
                  <th className="px-3 py-2 font-black">Supervisor</th>
                  <th className="px-3 py-2 font-black">Início</th>
                  <th className="px-3 py-2 font-black">Término</th>
                  <th className="px-3 py-2 font-black">Horário</th>
                  <th className="px-3 py-2 font-black">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {authorizations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-black text-slate-950">
                      {item.student_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.institution_name}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {item.course_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.municipal_unit_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.supervisor_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(item.authorized_start_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(item.authorized_end_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.authorized_schedule ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A autorização de início é o ato formal que libera o estudante para
          iniciar as atividades na unidade municipal indicada.
        </div>
      </section>
    </SystemShell>
  );
}
