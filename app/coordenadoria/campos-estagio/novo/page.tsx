import Link from "next/link";
import { FieldFormGuard } from "@/components/fields/FieldFormGuard";
import { SystemShell } from "@/components/system/SystemShell";
import { getMunicipalUnits } from "@/lib/queries/municipal-units";
import { createInternshipField } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NovoCampoEstagioPage() {
  const { units, error: unitsError } = await getMunicipalUnits();
  const activeUnits = units.filter((unit) => unit.is_active);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Novo campo de estágio"
      description="Cadastre uma área municipal com possibilidade de estágio e vincule as unidades que poderão receber estudantes."
    >
      <div className="mb-5">
        <Link
          href="/coordenadoria/campos-estagio"
          className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
        >
          Voltar para Campos de Estágio
        </Link>
      </div>

      {unitsError && (
        <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as unidades municipais: {unitsError}
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">
            Dados do campo
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Informe a área, disponibilidade, status inicial e unidades vinculadas.
          </p>
        </div>

        <div className="p-5">
          <FieldFormGuard
            action={createInternshipField}
            className="grid gap-4 lg:grid-cols-2"
          >
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Nome do campo
              </span>
              <input
                name="title"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Jurídico / Administração Pública"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Área</span>
              <input
                name="area"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Direito"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Vagas</span>
              <input
                name="available_slots"
                type="number"
                min="0"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: 2"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Turno</span>
              <input
                name="shift"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Matutino ou vespertino"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Descrição
              </span>
              <textarea
                name="description"
                rows={3}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Descreva atividades compatíveis, rotina da área e observações gerais."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Status inicial
                </span>
                <select
                  name="status"
                  defaultValue="em_analise"
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="em_analise">Em análise</option>
                  <option value="ativo">Ativo</option>
                  <option value="temporariamente_indisponivel">Suspenso</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  name="is_public"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Publicar
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  name="supervisor_required"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Exige supervisor
                </span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">
                  Unidades vinculadas
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Selecione uma ou mais unidades municipais que poderão receber estudantes neste campo.
                </p>

                {activeUnits.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    Nenhuma unidade ativa cadastrada. Cadastre uma unidade antes de criar o campo.
                  </div>
                ) : (
                  <div className="mt-3 grid max-h-60 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 pr-3 sm:grid-cols-2">
                    {activeUnits.map((unit) => (
                      <label
                        key={unit.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-teal-200 hover:bg-teal-50"
                      >
                        <input
                          name="unit_ids"
                          type="checkbox"
                          value={unit.id}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700"
                        />
                        <span>
                          <span className="block text-sm font-bold text-slate-800">
                            {unit.name}
                          </span>
                          {unit.department && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {unit.department}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Cadastrar campo
              </button>

              <Link
                href="/coordenadoria/campos-estagio"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                Cancelar
              </Link>
            </div>
          </FieldFormGuard>
        </div>
      </section>
    </SystemShell>
  );
}
