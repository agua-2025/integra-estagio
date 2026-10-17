import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const typeNames: Record<string, string> = {
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

export default async function UnitCalendarPage() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  const { data: profile } = auth.user
    ? await supabase
        .from("profiles")
        .select("role, is_active, municipal_unit_id")
        .eq("id", auth.user.id)
        .single()
    : { data: null };

  const authorized =
    profile?.is_active === true &&
    profile.role === "unidade" &&
    !!profile.municipal_unit_id;

  if (!authorized) {
    return (
      <SystemShell
        areaLabel="Unidade Municipal"
        title="Calendário de exceções"
        description="Consulta de períodos sem expediente."
      >
        <p className="text-sm text-red-700">
          Acesso reservado à unidade municipal ativa.
        </p>
      </SystemShell>
    );
  }

  const { data: exceptions, error } = await supabase
    .from("unit_calendar_exceptions")
    .select(
      "id, municipal_unit_id, exception_type, start_date, end_date, description"
    )
    .or(
      `municipal_unit_id.is.null,municipal_unit_id.eq.${profile.municipal_unit_id}`
    )
    .order("start_date", { ascending: false })
    .limit(200);

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Calendário de exceções"
      description="Feriados, pontos facultativos e períodos sem atividades aplicáveis à sua unidade."
    >
      <div className="mb-4">
        <Link
          href="/unidade/frequencia"
          className="text-sm font-bold text-teal-700 hover:underline"
        >
          Voltar para frequência
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">
            Períodos sem atividades
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            As exceções são cadastradas pela Coordenadoria.
            Esses dias não geram faltas nem horas automáticas.
          </p>
        </div>

        {error ? (
          <p className="px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        ) : !exceptions?.length ? (
          <p className="px-4 py-4 text-sm text-slate-600">
            Nenhum período cadastrado para esta unidade.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
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
                      {typeNames[item.exception_type] ??
                        item.exception_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {dateBR(item.start_date)}
                      {item.start_date !== item.end_date &&
                        ` a ${dateBR(item.end_date)}`}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.municipal_unit_id
                        ? "Esta unidade"
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
