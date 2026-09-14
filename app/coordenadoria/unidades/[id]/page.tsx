import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import { releaseMunicipalUnitAccess, toggleMunicipalUnitStatus } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UnidadeDetalhePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UnidadeDetalhePage({ params }: UnidadeDetalhePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: unit, error } = await supabase
    .from("municipal_units")
    .select("id, name, department, responsible_name, email, phone, address, is_active")
    .eq("id", id)
    .maybeSingle();

  if (error || !unit) {
    notFound();
  }

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Detalhes da unidade"
      description="Consulte os dados da unidade municipal e libere o acesso do responsável, quando necessário."
    >
      <div className="mb-5">
        <Link
          href="/coordenadoria/unidades"
          className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
        >
          Voltar para Unidades Municipais
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-lg font-black text-slate-950">
              Dados cadastrados
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Informações utilizadas para identificação da unidade no sistema.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Unidade
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {unit.name}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Departamento
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {unit.department ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Responsável
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {unit.responsible_name ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                E-mail
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {unit.email ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Telefone
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {unit.phone ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Endereço
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {unit.address ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Status
              </p>
              <span
                className={
                  unit.is_active
                    ? "mt-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                    : "mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                }
              >
                {unit.is_active ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-5">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-lg font-black text-slate-950">
                Liberar acesso
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Crie ou atualize o usuário responsável pelo acesso da unidade municipal.
              </p>
            </div>

            <form action={releaseMunicipalUnitAccess} className="grid gap-4 p-5">
              <input type="hidden" name="unit_id" value={unit.id} />

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nome do responsável
                </span>
                <input
                  name="full_name"
                  required
                  defaultValue={unit.responsible_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome completo"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  E-mail de acesso
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={unit.email ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="unidade@mirassoldoeste.mt.gov.br"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Senha provisória
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Mínimo de 8 caracteres"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Liberar acesso da unidade
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Situação da unidade
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Unidades inativas não devem ser utilizadas para novos vínculos ou sondagens.
            </p>

            <form action={toggleMunicipalUnitStatus} className="mt-4">
              <input type="hidden" name="id" value={unit.id} />
              <input type="hidden" name="is_active" value={String(unit.is_active)} />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                {unit.is_active ? "Inativar unidade" : "Ativar unidade"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </SystemShell>
  );
}
