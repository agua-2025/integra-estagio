import Link from "next/link";
import { MaskedInput } from "@/components/forms/MaskedInput";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";
import { createOwnInstitution, updateOwnInstitution } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoCadastroPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
  }>;
};

const inputClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

const labelClass = "grid gap-1";
const spanClass = "text-xs font-bold text-slate-600";

export default async function InstituicaoCadastroPage({
  searchParams,
}: InstituicaoCadastroPageProps) {
  const params = await searchParams;
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
      description="Cadastro formal da instituição para validação da Coordenadoria."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para o painel da instituição
        </Link>

        {!canEditInstitution && (
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
            Cadastro validado
          </span>
        )}
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Dados institucionais salvos com sucesso. A Coordenadoria poderá analisar e validar o cadastro.
        </section>
      )}

      {!canEditInstitution && (
        <section className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          O cadastro institucional já foi validado. Alterações sensíveis deverão ser solicitadas à Coordenadoria.
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form action={formAction}>
          {institution && <input type="hidden" name="id" value={institution.id} />}

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Identificação da instituição
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Dados principais da instituição de ensino.
            </p>
          </div>

          <div className="grid gap-3 px-4 py-4 lg:grid-cols-4">
            <label className={`${labelClass} lg:col-span-4`}>
              <span className={spanClass}>Nome da instituição</span>
              <input
                name="name"
                required
                disabled={!canEditInstitution}
                defaultValue={institution?.name ?? ""}
                className={inputClass}
                placeholder="Ex.: Faculdade Católica Rainha da Paz"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Razão social</span>
              <input
                name="legal_name"
                disabled={!canEditInstitution}
                defaultValue={institution?.legal_name ?? ""}
                className={inputClass}
                placeholder="Nome jurídico da instituição"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>Nome fantasia</span>
              <input
                name="trade_name"
                disabled={!canEditInstitution}
                defaultValue={institution?.trade_name ?? ""}
                className={inputClass}
                placeholder="Nome de uso comum"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>CNPJ</span>
              <MaskedInput
                name="cnpj"
                mask="cnpj"
                disabled={!canEditInstitution}
                defaultValue={institution?.cnpj ?? ""}
                className={inputClass}
                placeholder="00.000.000/0000-00"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>E-mail institucional</span>
              <input
                name="email"
                type="email"
                disabled={!canEditInstitution}
                defaultValue={institution?.email ?? ""}
                className={inputClass}
                placeholder="instituicao@exemplo.com"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>Telefone institucional</span>
              <MaskedInput
                name="phone"
                mask="phone"
                disabled={!canEditInstitution}
                defaultValue={institution?.phone ?? ""}
                className={inputClass}
                placeholder="(65) 0000-0000"
              />
            </label>
          </div>

          <div className="border-y border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Endereço
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Localização da instituição.
            </p>
          </div>

          <div className="grid gap-3 px-4 py-4 lg:grid-cols-6">
            <label className={`${labelClass} lg:col-span-3`}>
              <span className={spanClass}>Endereço</span>
              <input
                name="address_line"
                disabled={!canEditInstitution}
                defaultValue={institution?.address_line ?? ""}
                className={inputClass}
                placeholder="Rua, avenida, travessa..."
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>Número</span>
              <input
                name="address_number"
                disabled={!canEditInstitution}
                defaultValue={institution?.address_number ?? ""}
                className={inputClass}
                placeholder="Número"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Complemento</span>
              <input
                name="address_complement"
                disabled={!canEditInstitution}
                defaultValue={institution?.address_complement ?? ""}
                className={inputClass}
                placeholder="Bloco, sala, campus..."
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Bairro</span>
              <input
                name="neighborhood"
                disabled={!canEditInstitution}
                defaultValue={institution?.neighborhood ?? ""}
                className={inputClass}
                placeholder="Bairro"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>CEP</span>
              <MaskedInput
                name="zip_code"
                mask="cep"
                disabled={!canEditInstitution}
                defaultValue={institution?.zip_code ?? ""}
                className={inputClass}
                placeholder="00000-000"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Cidade</span>
              <input
                name="city"
                disabled={!canEditInstitution}
                defaultValue={institution?.city ?? ""}
                className={inputClass}
                placeholder="Ex.: Mirassol d'Oeste"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>UF</span>
              <input
                name="state"
                maxLength={2}
                disabled={!canEditInstitution}
                defaultValue={institution?.state ?? ""}
                className={`${inputClass} uppercase`}
                placeholder="MT"
              />
            </label>
          </div>

          <div className="border-y border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Representação e setor de estágio
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Responsáveis formais e contato operacional para acompanhamento dos estágios.
            </p>
          </div>

          <div className="grid gap-3 px-4 py-4 lg:grid-cols-4">
            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Representante legal</span>
              <input
                name="legal_representative_name"
                disabled={!canEditInstitution}
                defaultValue={institution?.legal_representative_name ?? ""}
                className={inputClass}
                placeholder="Nome completo"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Cargo do representante</span>
              <input
                name="legal_representative_role"
                disabled={!canEditInstitution}
                defaultValue={institution?.legal_representative_role ?? ""}
                className={inputClass}
                placeholder="Ex.: Diretor(a), Reitor(a), Coordenador(a)"
              />
            </label>

            <label className={`${labelClass} lg:col-span-2`}>
              <span className={spanClass}>Responsável pelo setor de estágio</span>
              <input
                name="internship_sector_contact_name"
                disabled={!canEditInstitution}
                defaultValue={institution?.internship_sector_contact_name ?? ""}
                className={inputClass}
                placeholder="Nome completo"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>E-mail do setor</span>
              <input
                name="internship_sector_contact_email"
                type="email"
                disabled={!canEditInstitution}
                defaultValue={institution?.internship_sector_contact_email ?? ""}
                className={inputClass}
                placeholder="estagios@instituicao.com"
              />
            </label>

            <label className={labelClass}>
              <span className={spanClass}>Telefone do setor</span>
              <MaskedInput
                name="internship_sector_contact_phone"
                mask="phone"
                disabled={!canEditInstitution}
                defaultValue={institution?.internship_sector_contact_phone ?? ""}
                className={inputClass}
                placeholder="(65) 0000-0000"
              />
            </label>

            <label className={`${labelClass} lg:col-span-4`}>
              <span className={spanClass}>Observações institucionais</span>
              <textarea
                name="notes"
                rows={2}
                disabled={!canEditInstitution}
                defaultValue={institution?.notes ?? ""}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Informe dados úteis para análise da Coordenadoria."
              />
            </label>
          </div>

          {canEditInstitution && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
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
