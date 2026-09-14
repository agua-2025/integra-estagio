import Link from "next/link";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { SystemShell } from "@/components/system/SystemShell";
import { getMunicipalUnits } from "@/lib/queries/municipal-units";
import { toggleMunicipalUnitStatus } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CoordenadoriaUnidadesPageProps = {
  searchParams?: Promise<{
    acesso?: string;
  }>;
};

function Indicator({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  );
}

export default async function CoordenadoriaUnidadesPage({
  searchParams,
}: CoordenadoriaUnidadesPageProps) {
  const params = await searchParams;
  const { units, error } = await getMunicipalUnits();

  const activeCount = units.filter((unit) => unit.is_active).length;
  const inactiveCount = units.filter((unit) => !unit.is_active).length;
  const withEmailCount = units.filter((unit) => Boolean(unit.email)).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Unidades Municipais"
      description="Controle administrativo das unidades que poderão responder sondagens e receber estagiários autorizados."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/coordenadoria/campos-estagio"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver campos de estágio
          </Link>

          <Link
            href="/coordenadoria/unidades/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            Nova unidade
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Indicator
          label="Total"
          value={units.length}
          description="Unidades registradas no sistema."
        />
        <Indicator
          label="Ativas"
          value={activeCount}
          description="Disponíveis para vínculo e sondagens."
        />
        <Indicator
          label="Com contato"
          value={withEmailCount}
          description="Unidades com e-mail informado."
        />
        <Indicator
          label="Inativas"
          value={inactiveCount}
          description="Suspensas ou desativadas."
        />
      </div>

      {params?.acesso === "1" && (
        <section className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Acesso da unidade municipal liberado com sucesso.
        </section>
      )}

      {error && (
        <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as unidades: {error}
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Unidades cadastradas
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Listagem administrativa para controle das unidades municipais.
            </p>
          </div>

          <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
            {units.length} registro(s)
          </div>
        </div>

        {units.length === 0 ? (
          <div className="p-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-black text-amber-950">
                Nenhuma unidade cadastrada.
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Cadastre unidades municipais para permitir vínculos com campos de estágio e futuras sondagens.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 shadow-sm">
                <tr>
                  <th className="px-5 py-3 font-bold">Unidade</th>
                  <th className="px-5 py-3 font-bold">Departamento</th>
                  <th className="px-5 py-3 font-bold">Responsável</th>
                  <th className="px-5 py-3 font-bold">Contato</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => (
                  <tr key={unit.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-800">
                        {unit.name}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-700">
                      {unit.department ?? "Não informado"}
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-700">
                      {unit.responsible_name ?? "Não informado"}
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-700">
                      <div className="grid gap-1">
                        <span>{unit.email ?? "Sem e-mail"}</span>
                        <span className="text-xs text-slate-500">
                          {unit.phone ?? "Sem telefone"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
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

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Link
                          href={`/coordenadoria/unidades/${unit.id}`}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Detalhes
                        </Link>

                        <form action={toggleMunicipalUnitStatus}>
                          <input type="hidden" name="id" value={unit.id} />
                          <input
                            type="hidden"
                            name="is_active"
                            value={String(unit.is_active)}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                          >
                            {unit.is_active ? (
                              <ToggleLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ToggleRight className="h-3.5 w-3.5" />
                            )}
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
      </section>
    </SystemShell>
  );
}
