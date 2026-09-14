import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationAgreementsData } from "@/lib/queries/coordination-agreements";
import { createCoordinationAgreement } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy.toISOString().slice(0, 10);
}

export default async function NovoAcordoPage() {
  const { viableInquiries, viableInstitutions, viableCourses, error } =
    await getCoordinationAgreementsData();

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = addMonths(new Date(), 24);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Novo Acordo de Cooperação"
      description="Inicie o acordo com base em instituição validada, cursos cadastrados e sondagem viável."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/acordos-cooperacao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para acordos
        </Link>

        <Link
          href="/coordenadoria/sondagens"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Não foi possível carregar os dados: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Dados iniciais
          </h2>
          <p className="text-xs text-slate-500">
            O representante legal e o responsável pelo estágio serão obtidos do cadastro institucional validado.
          </p>
        </div>

        {viableInquiries.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhuma sondagem viável disponível para novo acordo.
          </div>
        ) : (
          <form action={createCoordinationAgreement} className="grid gap-3 p-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-[11px] font-semibold text-slate-600">
                  Instituição
                </span>
                <select
                  name="institution_id"
                  required
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Selecione</option>
                  {viableInstitutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Situação inicial
                </span>
                <select
                  name="status"
                  defaultValue="em_analise"
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="em_analise">Em análise</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="pendente_correcao">Pendente de correção</option>
                  <option value="minuta_gerada">Minuta gerada</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Início da vigência
                </span>
                <input
                  name="started_at"
                  type="date"
                  required
                  defaultValue={today}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Fim da vigência
                </span>
                <input
                  name="ended_at"
                  type="date"
                  required
                  defaultValue={defaultEnd}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            </div>

            <div className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                  Cursos abrangidos
                </p>
                <p className="text-[11px] text-slate-500">
                  Selecione apenas cursos da instituição escolhida que tenham sondagem viável.
                </p>
              </div>

              <div className="grid gap-2 p-3 md:grid-cols-2 lg:grid-cols-3">
                {viableCourses.map((course) => (
                  <label
                    key={`${course.institution_id}-${course.course_id}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  >
                    <input
                      type="checkbox"
                      name="course_ids"
                      value={course.course_id}
                      className="h-4 w-4 rounded border-slate-300 text-teal-700"
                    />
                    <span>
                      {course.course_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Observações
              </span>
              <textarea
                name="notes"
                rows={3}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Observações internas da Coordenadoria."
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
              <Link
                href="/coordenadoria/acordos-cooperacao"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Registrar acordo
              </button>
            </div>
          </form>
        )}
      </section>
    </SystemShell>
  );
}
