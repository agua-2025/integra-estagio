import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { createMunicipalUnit } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NovaUnidadeMunicipalPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Nova unidade municipal"
      description="Cadastre secretaria, setor ou órgão municipal que poderá responder sondagens e receber estagiários."
    >
      <div className="mb-5">
        <Link
          href="/coordenadoria/unidades"
          className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
        >
          Voltar para Unidades Municipais
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-black text-slate-950">
            Dados da unidade
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Informe os dados básicos da unidade e, quando houver, o responsável pelo acompanhamento.
          </p>
        </div>

        <form action={createMunicipalUnit} className="grid gap-4 p-5 lg:grid-cols-2">
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

          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Cadastrar unidade
            </button>

            <Link
              href="/coordenadoria/unidades"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </SystemShell>
  );
}
