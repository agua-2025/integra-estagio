import Link from "next/link";
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
      description="Complete o cadastro formal da instituição de ensino para validação da Coordenadoria."
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

      {params?.sucesso === "1" && (
        <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Dados institucionais salvos com sucesso. A Coordenadoria poderá analisar e validar o cadastro.
        </section>
      )}

      {!canEditInstitution && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          O cadastro institucional já foi validado. Alterações sensíveis deverão
          ser solicitadas à Coordenadoria.
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={formAction} className="grid gap-8">
          {institution && <input type="hidden" name="id" value={institution.id} />}

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Identificação da instituição
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Informe os dados principais da instituição de ensino.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
                <span className="text-sm font-semibold text-slate-700">
                  Razão social
                </span>
                <input
                  name="legal_name"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.legal_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome jurídico da instituição"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nome fantasia
                </span>
                <input
                  name="trade_name"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.trade_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome de uso comum"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  CNPJ
                </span>
                <input
                  name="cnpj"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.cnpj ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="00.000.000/0000-00"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  E-mail institucional
                </span>
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
                <span className="text-sm font-semibold text-slate-700">
                  Telefone institucional
                </span>
                <input
                  name="phone"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.phone ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="(65) 0000-0000"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-950">
              Endereço
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Dados de localização da instituição.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 lg:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Endereço
                </span>
                <input
                  name="address_line"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.address_line ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Rua, avenida, travessa..."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Número
                </span>
                <input
                  name="address_number"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.address_number ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Número"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Complemento
                </span>
                <input
                  name="address_complement"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.address_complement ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Bloco, sala, campus..."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Bairro
                </span>
                <input
                  name="neighborhood"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.neighborhood ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Bairro"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  CEP
                </span>
                <input
                  name="zip_code"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.zip_code ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="00000-000"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Cidade
                </span>
                <input
                  name="city"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.city ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: Araputanga"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  UF
                </span>
                <input
                  name="state"
                  maxLength={2}
                  disabled={!canEditInstitution}
                  defaultValue={institution?.state ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="MT"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-950">
              Representação legal
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Informe quem representa formalmente a instituição.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Representante legal
                </span>
                <input
                  name="legal_representative_name"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.legal_representative_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome completo"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Cargo do representante
                </span>
                <input
                  name="legal_representative_role"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.legal_representative_role ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: Diretor(a), Reitor(a), Coordenador(a)"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-slate-950">
              Setor de estágio
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Informe o contato responsável pelo acompanhamento dos estágios.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Responsável pelo setor de estágio
                </span>
                <input
                  name="internship_sector_contact_name"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.internship_sector_contact_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome completo"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  E-mail do setor de estágio
                </span>
                <input
                  name="internship_sector_contact_email"
                  type="email"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.internship_sector_contact_email ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="estagios@instituicao.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Telefone do setor de estágio
                </span>
                <input
                  name="internship_sector_contact_phone"
                  disabled={!canEditInstitution}
                  defaultValue={institution?.internship_sector_contact_phone ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="(65) 0000-0000"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Observações institucionais
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
          </div>

          {canEditInstitution && (
            <div className="border-t border-slate-200 pt-6">
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

