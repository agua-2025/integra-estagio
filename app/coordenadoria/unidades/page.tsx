import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getMunicipalUnits } from "@/lib/queries/municipal-units";
import { createMunicipalUnit, toggleMunicipalUnitStatus } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoordenadoriaUnidadesPage() {
  const { units, error } = await getMunicipalUnits();

  const activeCount = units.filter((unit) => unit.is_active).length;
  const inactiveCount = units.filter((unit) => !unit.is_active).length;

  const summaries = [
    {
      label: "Total",
      value: String(units.length),
      description: "Unidades municipais cadastradas.",
    },
    {
      label: "Ativas",
      value: String(activeCount),
      description: "Unidades disponíveis para vínculo.",
    },
    {
      label: "Inativas",
      value: String(inactiveCount),
      description: "Unidades suspensas ou desativadas.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Unidades Municipais"
      description="Cadastre e organize as unidades que poderão receber sondagens e estagiários autorizados."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/campos-estagio"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver campos de estágio
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as unidades: {error}
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Nova unidade municipal
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre secretarias, setores ou órgãos municipais que poderão
            responder sondagens e receber estagiários.
          </p>
        </div>

        <form action={createMunicipalUnit} className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Nome da unidade
            </span>
            <input
              name="name"
              required
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Ex.: Procuradoria Jurídica"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Secretaria/Departamento
            </span>
            <input
              name="department"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Ex.: Secretaria Municipal de Administração"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Responsável
            </span>
            <input
              name="responsible_name"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Nome do responsável"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">E-mail</span>
            <input
              name="email"
              type="email"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="unidade@mirassoldoeste.mt.gov.br"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Telefone
            </span>
            <input
              name="phone"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="(65) 0000-0000"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Endereço
            </span>
            <input
              name="address"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Endereço da unidade, se necessário"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Cadastrar unidade
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Unidades cadastradas
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Depois, essas unidades poderão ser vinculadas aos campos de estágio.
            Um mesmo campo poderá ter várias unidades vinculadas.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {units.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhuma unidade cadastrada.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Cadastre as unidades municipais para permitir o vínculo com
                  campos de estágio e futuras sondagens.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Unidade</th>
                    <th className="px-5 py-4 font-bold">Departamento</th>
                    <th className="px-5 py-4 font-bold">Responsável</th>
                    <th className="px-5 py-4 font-bold">Contato</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-right font-bold">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {units.map((unit) => (
                    <tr key={unit.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{unit.name}</p>
                        {unit.address && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {unit.address}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {unit.department ?? "Não informado"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {unit.responsible_name ?? "Não informado"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        <div className="grid gap-1">
                          <span>{unit.email ?? "Sem e-mail"}</span>
                          <span className="text-xs text-slate-500">
                            {unit.phone ?? "Sem telefone"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            unit.is_active
                              ? "inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                              : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                          }
                        >
                          {unit.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <form action={toggleMunicipalUnitStatus}>
                            <input type="hidden" name="id" value={unit.id} />
                            <input
                              type="hidden"
                              name="is_active"
                              value={String(unit.is_active)}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                            >
                              {unit.is_active ? "Inativar" : "Ativar"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Vínculo flexível"
          description="Um campo de estágio poderá ser oferecido por várias unidades municipais."
          status="Regra"
        />
        <ActionCard
          title="Exemplo prático"
          description="O campo jurídico pode ser vinculado à Administração, Procuradoria, Gabinete ou Controle Interno."
        />
        <ActionCard
          title="Próxima etapa"
          description="Depois vamos vincular unidades cadastradas aos campos de estágio pela tabela field_units."
        />
      </section>
    </SystemShell>
  );
}
