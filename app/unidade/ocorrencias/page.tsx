import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { createUnitOccurrence, resolveUnitOccurrence } from "./actions";
import { getUnitOccurrencesData } from "@/lib/queries/unit-occurrences";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    resolvida?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    falta: "Falta",
    atraso: "Atraso",
    ajuste_horario: "Ajuste de horário",
    alteracao_supervisor: "Alteração de supervisor",
    dificuldade_acompanhamento: "Dificuldade de acompanhamento",
    encerramento_antecipado: "Encerramento antecipado",
    outra: "Outra ocorrência",
  };

  return labels[type] ?? type;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_acompanhamento: "Em acompanhamento",
    resolvida: "Resolvida",
    critica: "Crítica",
    cancelada: "Cancelada",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "resolvida") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "em_acompanhamento") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "critica") {
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

export default async function UnidadeOcorrenciasPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { unit, internOptions, occurrences, error } =
    await getUnitOccurrencesData();

  const today = new Date().toISOString().slice(0, 10);

  const registradas = occurrences.length;
  const pendentes = occurrences.filter((item) =>
    ["pendente", "em_acompanhamento"].includes(item.status),
  ).length;
  const resolvidas = occurrences.filter((item) => item.status === "resolvida").length;
  const criticas = occurrences.filter((item) => item.status === "critica").length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Ocorrências"
      description="Registre situações relevantes durante o estágio para acompanhamento da unidade, da Coordenadoria e da instituição de ensino."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Ocorrência registrada com sucesso.
        </section>
      )}

      {params?.resolvida === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Ocorrência concluída com sucesso.
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

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Unidade municipal
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {unit?.name ?? "Unidade não identificada"}
        </p>
      </section>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Registradas
          </p>
          <p className="text-xl font-black text-slate-950">{registradas}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Pendentes
          </p>
          <p className="text-xl font-black text-amber-700">{pendentes}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Resolvidas
          </p>
          <p className="text-xl font-black text-teal-700">{resolvidas}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Críticas
          </p>
          <p className="text-xl font-black text-red-700">{criticas}</p>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          action={createUnitOccurrence}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Nova ocorrência
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Registre fato relevante relacionado a estudante autorizado para esta unidade.
          </p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Estagiário</span>
              <select
                name="authorization_id"
                required
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecione</option>
                {internOptions.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.student_name} — {intern.course_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Tipo de ocorrência
              </span>
              <select
                name="occurrence_type"
                required
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecione</option>
                <option value="falta">Falta</option>
                <option value="atraso">Atraso</option>
                <option value="ajuste_horario">Ajuste de horário</option>
                <option value="alteracao_supervisor">Alteração de supervisor</option>
                <option value="dificuldade_acompanhamento">
                  Dificuldade de acompanhamento
                </option>
                <option value="encerramento_antecipado">
                  Encerramento antecipado
                </option>
                <option value="outra">Outra ocorrência</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Data da ocorrência
              </span>
              <input
                name="occurrence_date"
                type="date"
                required
                defaultValue={today}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Descrição</span>
              <textarea
                name="description"
                rows={6}
                required
                placeholder="Descreva objetivamente o fato ocorrido e as providências adotadas."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <button
              type="submit"
              disabled={internOptions.length === 0}
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Registrar ocorrência
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Ocorrências registradas
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Listagem real das ocorrências lançadas pela unidade.
            </p>
          </div>

          {occurrences.length === 0 ? (
            <div className="p-5 text-sm text-slate-600">
              Nenhuma ocorrência registrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-black">Estagiário</th>
                    <th className="px-3 py-2 font-black">Tipo</th>
                    <th className="px-3 py-2 font-black">Data</th>
                    <th className="px-3 py-2 font-black">Status</th>
                    <th className="px-3 py-2 font-black">Descrição</th>
                    <th className="px-3 py-2 text-right font-black">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {occurrences.map((occurrence) => (
                    <tr key={occurrence.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 align-top">
                        <p className="font-black text-slate-950">
                          {occurrence.student_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {occurrence.course_name}
                        </p>
                      </td>

                      <td className="px-3 py-2 align-top font-semibold text-slate-800">
                        {typeLabel(occurrence.occurrence_type)}
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        {formatDate(occurrence.occurrence_date)}
                      </td>

                      <td className="px-3 py-2 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                            occurrence.status,
                          )}`}
                        >
                          {statusLabel(occurrence.status)}
                        </span>
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        <details className="max-w-[260px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Ver detalhes
                          </summary>
                          <p className="mt-1 leading-5">{occurrence.description}</p>
                          {occurrence.resolution_notes && (
                            <p className="mt-2 leading-5">
                              <strong>Conclusão:</strong>{" "}
                              {occurrence.resolution_notes}
                            </p>
                          )}
                        </details>
                      </td>

                      <td className="px-3 py-2 align-top">
                        {occurrence.status === "resolvida" ? (
                          <div className="text-right text-[11px] font-semibold text-slate-400">
                            Concluída
                          </div>
                        ) : (
                          <form
                            action={resolveUnitOccurrence}
                            className="flex justify-end gap-2"
                          >
                            <input
                              type="hidden"
                              name="occurrence_id"
                              value={occurrence.id}
                            />
                            <input
                              name="resolution_notes"
                              placeholder="Conclusão"
                              className="h-9 w-36 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-black text-white transition hover:bg-teal-800"
                            >
                              Concluir
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            Ocorrências críticas ou de encerramento antecipado poderão ser tratadas em fluxo próprio posteriormente.
          </div>
        </section>
      </section>
    </SystemShell>
  );
}
