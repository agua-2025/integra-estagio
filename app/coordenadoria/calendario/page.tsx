import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import { createCalendarException } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
};

const typeLabels: Record<string, string> = {
  feriado: "Feriado",
  ponto_facultativo: "Ponto facultativo",
  recesso: "Recesso",
  suspensao_atividades: "Suspensão de atividades",
  dispensa_coletiva: "Dispensa coletiva",
};

function dateBR(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function CoordinatorCalendarPage({
  searchParams,
}: Props) {
  const query = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: profile } = auth.user
    ? await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", auth.user.id)
        .single()
    : { data: null };

  const authorized =
    !!profile?.is_active &&
    ["admin", "coordenadoria"].includes(profile.role);

  if (!authorized) {
    return (
      <SystemShell
        areaLabel="Coordenadoria"
        title="Calendário de exceções"
        description="Cadastro administrativo de dias sem atividades de estágio."
      >
        <p className="text-sm text-red-700">
          Acesso permitido apenas à Coordenadoria.
        </p>
      </SystemShell>
    );
  }

  const [unitsResult, exceptionsResult] = await Promise.all([
    supabase
      .from("municipal_units")
      .select("id, name")
      .order("name"),

    supabase
      .from("unit_calendar_exceptions")
      .select(
        "id, municipal_unit_id, exception_type, start_date, end_date, description, created_at"
      )
      .order("start_date", { ascending: false })
      .limit(200),
  ]);

  const units = unitsResult.data ?? [];
  const exceptions = exceptionsResult.data ?? [];
  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]));

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Calendário de exceções"
      description="Feriados, pontos facultativos, recessos e suspensões que afetam os estágios."
    >
      {query.erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {query.erro}
        </p>
      )}

      {query.sucesso && (
        <p className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Período registrado com sucesso.
        </p>
      )}

      {(unitsResult.error || exceptionsResult.error) && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {unitsResult.error?.message ?? exceptionsResult.error?.message}
        </p>
      )}

      <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">
            Registrar período sem atividades
          </h2>
        </div>

        <form action={createCalendarException} className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="text-xs font-bold text-slate-700">
              Tipo *
              <select
                name="exception_type"
                required
                defaultValue=""
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
              >
                <option value="">Selecione</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700">
              Abrangência *
              <select
                name="municipal_unit_id"
                defaultValue=""
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
              >
                <option value="">Todas as unidades municipais</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-700">
              Data inicial *
              <input
                type="date"
                name="start_date"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </label>

            <label className="text-xs font-bold text-slate-700">
              Data final *
              <input
                type="date"
                name="end_date"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </label>

            <label className="text-xs font-bold text-slate-700 md:col-span-4">
              Motivo / referência do ato administrativo *
              <textarea
                name="description"
                rows={2}
                minLength={5}
                required
                placeholder="Ex.: Ponto facultativo instituído pelo Decreto Municipal nº ... "
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </label>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-600">
            O registro não apaga frequências anteriores, não gera faltas
            e não acrescenta horas. Datas já dispensadas ficarão
            indisponíveis para novos lançamentos.
          </p>

          <button
            type="submit"
            className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-xs font-black text-white hover:bg-teal-800"
          >
            Registrar exceção
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">
            Períodos cadastrados
          </h2>
        </div>

        {exceptions.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-600">
            Nenhuma exceção cadastrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Período</th>
                  <th className="px-4 py-3">Abrangência</th>
                  <th className="px-4 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {typeLabels[item.exception_type] ?? item.exception_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {dateBR(item.start_date)}
                      {item.end_date !== item.start_date &&
                        ` a ${dateBR(item.end_date)}`}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.municipal_unit_id
                        ? unitNames.get(item.municipal_unit_id) ?? "Unidade"
                        : "Todas as unidades"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.description}
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
