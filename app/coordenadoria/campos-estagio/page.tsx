import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getDashboardInternshipFields } from "@/lib/queries/dashboard-internship-fields";
import { getMunicipalUnits } from "@/lib/queries/municipal-units";
import {
  createInternshipField,
  toggleFieldPublic,
  updateFieldStatus,
} from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ativo: "Ativo",
    em_analise: "Em análise",
    temporariamente_indisponivel: "Suspenso",
    inativo: "Inativo",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "ativo") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "temporariamente_indisponivel") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "inativo") {
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
}

export default async function CoordenadoriaCamposEstagioPage() {
  const [{ fields, error }, { units, error: unitsError }] = await Promise.all([
    getDashboardInternshipFields(),
    getMunicipalUnits(),
  ]);

  const activeUnits = units.filter((unit) => unit.is_active);

  const activeCount = fields.filter((field) => field.status === "ativo").length;
  const publicCount = fields.filter((field) => field.is_public).length;
  const inactiveCount = fields.filter((field) => field.status === "inativo").length;

  const summaries = [
    {
      label: "Total",
      value: String(fields.length),
      description: "Campos de estágio cadastrados no sistema.",
    },
    {
      label: "Ativos",
      value: String(activeCount),
      description: "Campos liberados para utilização.",
    },
    {
      label: "Publicados",
      value: String(publicCount),
      description: "Campos visíveis na área pública.",
    },
    {
      label: "Inativos",
      value: String(inactiveCount),
      description: "Campos ocultos ou desativados.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Campos de Estágio"
      description="Cadastre, organize e publique áreas municipais com possibilidade de estágio supervisionado."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/coordenadoria/unidades"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Unidades municipais
          </Link>

          <Link
            href="/campos-de-estagio"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver página pública
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar os campos de estágio: {error}
        </section>
      )}

      {unitsError && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as unidades municipais: {unitsError}
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Novo campo de estágio
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre uma área municipal com possibilidade de estágio e selecione
            as unidades que poderão receber estudantes nesse campo.
          </p>
        </div>

        <form action={createInternshipField} className="grid gap-4 lg:grid-cols-2">
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
              placeholder="Descreva as atividades compatíveis, rotina da área e observações gerais."
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
              <p className="text-sm font-bold text-slate-800">
                Unidades que poderão receber este estágio
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Selecione uma ou mais unidades municipais. Exemplo: Direito
                pode ser vinculado à Administração e à Procuradoria.
              </p>

              {activeUnits.length === 0 ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  Nenhuma unidade ativa cadastrada. Cadastre uma unidade antes
                  de criar o campo.
                </div>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {activeUnits.map((unit) => (
                    <label
                      key={unit.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
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

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Cadastrar campo
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Campos cadastrados
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Listagem administrativa conectada ao Supabase. A edição do campo
            permite revisar também as unidades vinculadas.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {fields.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhum campo cadastrado.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Quando a Coordenadoria cadastrar campos de estágio, eles
                  aparecerão aqui para organização, publicação e controle.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Campo</th>
                      <th className="px-5 py-4 font-bold">Área</th>
                      <th className="px-5 py-4 font-bold">Vagas</th>
                      <th className="px-5 py-4 font-bold">Turno</th>
                      <th className="px-5 py-4 font-bold">Publicação</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                      <th className="px-5 py-4 text-right font-bold">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {fields.map((field) => (
                      <tr key={field.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-950">
                            {field.title}
                          </p>
                          {field.description && (
                            <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-slate-500">
                              {field.description}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {field.area ?? "Não informado"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {field.available_slots ?? "A definir"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {field.shift ?? "A definir"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              field.is_public
                                ? "inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                                : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                            }
                          >
                            {field.is_public ? "Publicado" : "Oculto"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                              field.status,
                            )}`}
                          >
                            {statusLabel(field.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              href={`/coordenadoria/campos-estagio/${field.id}`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                            >
                              Editar
                            </Link>

                            <form action={toggleFieldPublic}>
                              <input type="hidden" name="id" value={field.id} />
                              <input
                                type="hidden"
                                name="is_public"
                                value={String(field.is_public)}
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                              >
                                {field.is_public ? "Ocultar" : "Publicar"}
                              </button>
                            </form>

                            {field.status !== "ativo" && (
                              <form action={updateFieldStatus}>
                                <input type="hidden" name="id" value={field.id} />
                                <input type="hidden" name="status" value="ativo" />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                                >
                                  Ativar
                                </button>
                              </form>
                            )}

                            {field.status !== "temporariamente_indisponivel" && (
                              <form action={updateFieldStatus}>
                                <input type="hidden" name="id" value={field.id} />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="temporariamente_indisponivel"
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                                >
                                  Suspender
                                </button>
                              </form>
                            )}

                            {field.status !== "inativo" && (
                              <form action={updateFieldStatus}>
                                <input type="hidden" name="id" value={field.id} />
                                <input type="hidden" name="status" value="inativo" />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Inativar
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
                No celular, a tabela possui rolagem horizontal. As ações de
                cadastro, publicação, status e edição estão conectadas ao Supabase.
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Vínculo flexível"
          description="Um campo de estágio pode ser oferecido por várias unidades municipais."
          status="Regra"
        />
        <ActionCard
          title="Exemplo prático"
          description="O campo jurídico pode ser vinculado à Administração, Procuradoria, Gabinete ou Controle Interno."
        />
        <ActionCard
          title="Próxima etapa"
          description="Depois vamos vincular campos aos cursos compatíveis, como Direito, Administração, Serviço Social e outros."
        />
      </section>
    </SystemShell>
  );
}
