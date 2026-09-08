import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionInquiriesData } from "@/lib/queries/institution-inquiries";
import { createInstitutionInquiry } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NovaSondagemInstituicaoPage() {
  const { institution, courses, error } = await getInstitutionInquiriesData();

  const institutionIsActive = institution?.status === "ativa";
  const activeCourses = courses.filter((course) => course.is_active);

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Nova sondagem"
      description="Consulta sobre possibilidade de campo de estágio curricular supervisionado."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao/sondagens"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para acompanhar sondagens
        </Link>

        <Link
          href="/instituicao"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Painel da instituição
        </Link>
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!institutionIsActive && (
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          A instituição precisa estar ativa para solicitar sondagens. Complete o cadastro institucional e aguarde a validação da Coordenadoria.
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Dados da sondagem
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Informe curso, área de interesse, quantidade, carga horária e período pretendido.
          </p>
        </div>

        {activeCourses.length === 0 ? (
          <div className="p-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-black text-amber-950">
                Nenhum curso ativo cadastrado
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Cadastre ou ative ao menos um curso antes de solicitar sondagem.
              </p>
              <Link
                href="/instituicao/cursos"
                className="mt-4 inline-flex rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-950"
              >
                Ir para cursos
              </Link>
            </div>
          </div>
        ) : (
          <form action={createInstitutionInquiry}>
            <div className="grid gap-3 px-4 py-4 lg:grid-cols-4">
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-bold text-slate-600">Curso</span>
                <select
                  name="course_id"
                  required
                  disabled={!institutionIsActive}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="">Selecione o curso</option>
                  {activeCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Quantidade
                </span>
                <input
                  name="requested_students"
                  type="number"
                  min="1"
                  required
                  disabled={!institutionIsActive}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 5"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Carga horária
                </span>
                <input
                  name="required_workload"
                  type="number"
                  min="0"
                  disabled={!institutionIsActive}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 100"
                />
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-bold text-slate-600">
                  Área ou setor de interesse
                </span>
                <input
                  name="requested_area"
                  required
                  disabled={!institutionIsActive}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: jurídico, administrativo, saúde, assistência social..."
                />
              </label>

              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-bold text-slate-600">
                  Período pretendido
                </span>
                <input
                  name="intended_period"
                  disabled={!institutionIsActive}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 2º semestre de 2026"
                />
              </label>

              <label className="grid gap-1 lg:col-span-4">
                <span className="text-xs font-bold text-slate-600">
                  Observações
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  disabled={!institutionIsActive}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Informe detalhes úteis para a análise da Coordenadoria."
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/instituicao/sondagens"
                className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar e voltar
              </Link>

              <button
                type="submit"
                disabled={!institutionIsActive}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Enviar sondagem
              </button>
            </div>
          </form>
        )}
      </section>
    </SystemShell>
  );
}
