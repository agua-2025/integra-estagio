import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";
import { createOwnInstitution, updateOwnInstitution } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InstituicaoCadastroPage() {
  const { institution, error } = await getInstitutionAreaData();

  const canEditInstitution =
    !institution ||
    institution.status === "em_analise" ||
    institution.status === "pendente";

  const formAction = institution ? updateOwnInstitution : createOwnInstitution;

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Dados Institucionais"
      description="Preencha ou revise os dados da instituição de ensino para análise da Coordenadoria."
    >
      <div className="mb-6">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para o painel da instituição
        </Link>
      </div>

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!canEditInstitution && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          O cadastro institucional já foi validado. Alterações sensíveis deverão
          ser solicitadas à Coordenadoria.
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={formAction} className="grid gap-4 lg:grid-cols-2">
          {institution && <input type="hidden" name="id" value={institution.id} />}

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Nome da instituição
            </span>
            <input
              name="name"
              required
              disabled={!canEditInstitution}
              defaultValue={institution?.name ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Ex.: Faculdade Católica Rainha da Paz"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">CNPJ</span>
            <input
              name="cnpj"
              disabled={!canEditInstitution}
              defaultValue={institution?.cnpj ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="00.000.000/0000-00"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Cidade</span>
            <input
              name="city"
              disabled={!canEditInstitution}
              defaultValue={institution?.city ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Ex.: Araputanga"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">UF</span>
            <input
              name="state"
              maxLength={2}
              disabled={!canEditInstitution}
              defaultValue={institution?.state ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="MT"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">E-mail</span>
            <input
              name="email"
              type="email"
              disabled={!canEditInstitution}
              defaultValue={institution?.email ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="instituicao@exemplo.com"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Telefone</span>
            <input
              name="phone"
              disabled={!canEditInstitution}
              defaultValue={institution?.phone ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="(65) 0000-0000"
            />
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Observações
            </span>
            <textarea
              name="notes"
              rows={3}
              disabled={!canEditInstitution}
              defaultValue={institution?.notes ?? ""}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Informe dados úteis para análise da Coordenadoria."
            />
          </label>

          {canEditInstitution && (
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                {institution ? "Atualizar dados" : "Enviar cadastro para análise"}
              </button>
            </div>
          )}
        </form>
      </section>
    </SystemShell>
  );
}
