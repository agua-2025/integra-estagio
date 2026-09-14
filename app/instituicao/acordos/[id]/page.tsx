import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { CopyTextButton } from "@/components/system/CopyTextButton";
import { FormattedDraftText } from "@/components/system/FormattedDraftText";
import { getInstitutionAgreementsData } from "@/lib/queries/institution-agreements";
import {
  approveAgreementDraft,
  requestAgreementDraftCorrection,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoAcordoDetalhePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    aguardando_conferencia: "Aguardando conferência",
    aprovada: "Minuta aprovada",
    correcao_solicitada: "Correção solicitada",
  };

  if (!status) return "Aguardando conferência";

  return labels[status] ?? status;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const parts = value.slice(0, 10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;

  return value;
}

export default async function InstituicaoAcordoDetalhePage({
  params,
}: InstituicaoAcordoDetalhePageProps) {
  const { id } = await params;

  const { institution, agreements, error } = await getInstitutionAgreementsData();

  const agreement = agreements.find((item) => item.id === id);

  if (!agreement) {
    notFound();
  }

  const canReview =
    Boolean(agreement.draft_text) &&
    (agreement.status === "minuta_gerada" || agreement.status === "pendente_correcao");

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Conferência da Minuta"
      description="Confira os dados do Acordo de Cooperação antes da assinatura."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao/acordos"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para acordos
        </Link>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
          {statusLabel(agreement.institution_review_status)}
        </span>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <p className="font-black uppercase tracking-wide">Atenção</p>
        <p className="mt-1">
          Esta conferência não substitui a assinatura formal do acordo. A instituição deve
          verificar dados cadastrais, representante, cursos abrangidos, vigência e cláusulas
          antes de confirmar ou solicitar correção.
        </p>
      </section>

      <section className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Dados resumidos
          </h2>
        </div>

        <div className="grid gap-0 text-xs md:grid-cols-2">
          <div className="border-b border-slate-100 px-4 py-2 md:border-r">
            <p className="font-bold text-slate-500">Instituição</p>
            <p className="mt-1 font-semibold text-slate-900">
              {institution?.name ?? "Instituição não identificada"}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2">
            <p className="font-bold text-slate-500">Situação do acordo</p>
            <p className="mt-1 font-semibold text-slate-900">
              {agreement.status === "minuta_gerada"
                ? "Minuta gerada"
                : agreement.status === "pendente_correcao"
                  ? "Pendente de correção"
                  : agreement.status === "aguardando_assinatura"
                    ? "Aguardando assinatura"
                    : agreement.status}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-r">
            <p className="font-bold text-slate-500">Vigência</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(agreement.started_at)} a {formatDate(agreement.ended_at)}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2">
            <p className="font-bold text-slate-500">Cursos abrangidos</p>
            <p className="mt-1 font-semibold text-slate-900">
              {agreement.course_names.length > 0
                ? agreement.course_names.join(", ")
                : "Nenhum curso vinculado"}
            </p>
          </div>

          {agreement.institution_review_notes && (
            <div className="border-b border-slate-100 px-4 py-2 md:col-span-2">
              <p className="font-bold text-slate-500">Observação da instituição</p>
              <p className="mt-1 whitespace-pre-wrap font-semibold text-slate-900">
                {agreement.institution_review_notes}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Minuta do Acordo
              </h2>
              <p className="text-xs text-slate-500">
                Texto gerado pela Coordenadoria para conferência prévia.
              </p>
            </div>

            {agreement.draft_text && (
              <CopyTextButton
                text={agreement.draft_text}
                label="Copiar versão para publicação"
                copiedLabel="Versão para publicação copiada"
                anonymize
              />
            )}
          </div>

          {agreement.draft_text ? (
            <div className="max-h-[680px] overflow-auto p-4">
              <FormattedDraftText text={agreement.draft_text} />
            </div>
          ) : (
            <div className="p-5 text-sm font-semibold text-slate-600">
              A minuta ainda não foi disponibilizada pela Coordenadoria.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Manifestação da instituição
          </h2>

          {canReview ? (
            <div className="mt-3 grid gap-3">
              <form action={approveAgreementDraft}>
                <input type="hidden" name="id" value={agreement.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                >
                  Confirmar minuta
                </button>
              </form>

              <form action={requestAgreementDraftCorrection} className="grid gap-2">
                <input type="hidden" name="id" value={agreement.id} />

                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Correção solicitada
                  </span>
                  <textarea
                    name="notes"
                    rows={3}
                    required
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Ex.: favor corrigir a cláusula 10."
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-100"
                >
                  Enviar pedido de correção
                </button>
              </form>
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Esta minuta não está aberta para manifestação neste momento.
            </p>
          )}
        </div>
      </section>
    </SystemShell>
  );
}




