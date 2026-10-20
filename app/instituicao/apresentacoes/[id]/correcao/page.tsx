import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentPresentationForm } from "@/components/institution/StudentPresentationForm";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionPresentationCorrection } from "@/lib/queries/institution-presentation-correction";
import { resubmitPresentation } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
};

const documentLabels: Record<string, string> = {
  carta_apresentacao: "Carta de apresentação",
  termo_compromisso: "Termo de Compromisso",
  seguro: "Apólice/seguro",
  comprovante_matricula: "Comprovante de matrícula",
  documento_identificacao: "Documento de identificação",
  plano_atividades: "Plano de atividades",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  enviado: "Enviado para conferência",
  validado: "Validado",
  rejeitado: "Rejeitado",
  substituido: "Substituído",
};

export default async function CorrecaoApresentacaoPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { erro } = await searchParams;
  const correction = await getInstitutionPresentationCorrection(id);

  if (!correction) notFound();

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title={`Corrigir apresentação: ${correction.studentName}`}
      description="Confira o apontamento, complemente os dados e reenvie a apresentação para análise."
    >
      <Link
        href="/instituicao/estudantes"
        className="text-sm font-semibold text-teal-700 hover:text-teal-900"
      >
        Voltar para estudantes
      </Link>

      {erro && (
        <section className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </section>
      )}

      <section className="my-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-amber-950">
          Apontamento da Coordenadoria
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-950">
          {correction.reviewNotes || "A Coordenadoria não registrou observações."}
        </p>
      </section>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
          Documentos desta apresentação
        </h2>
        {correction.documents.length === 0 ? (
          <p className="mt-2 text-sm text-amber-800">
            Nenhum documento foi anexado. Os cinco documentos obrigatórios deverão ser enviados.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {correction.documents.map((document) => (
              <li
                key={document.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {documentLabels[document.document_type] ?? document.document_type}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {statusLabels[document.status] ?? document.status}
                </p>
                {document.notes && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-amber-900">
                    {document.notes}
                  </p>
                )}
                {document.url && (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-teal-700 underline"
                  >
                    Abrir documento
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-600">
          Os documentos enviados ou validados permanecem vinculados. Você pode anexar uma nova
          versão dos documentos ainda não validados.
        </p>
      </section>

      <StudentPresentationForm
        options={correction.options}
        clearDraft={false}
        correction={{
          initialValues: correction.initialValues,
          selectedDays: correction.selectedDays,
          documents: correction.documents,
          submit: resubmitPresentation.bind(null, correction.id),
        }}
      />
    </SystemShell>
  );
}
