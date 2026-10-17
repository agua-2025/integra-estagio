import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getStudentAreaData } from "@/lib/queries/student-area";

export const dynamic = "force-dynamic";

const documentLabels: Record<string, string> = {
  carta_apresentacao: "Carta de apresentação",
  termo_compromisso: "Termo de Compromisso",
  seguro: "Seguro de acidentes pessoais",
  apolice_seguro: "Apólice de seguro",
  comprovante_matricula: "Comprovante de matrícula",
  documento_identificacao: "Documento de identificação",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  em_analise: "Em análise",
  validado: "Validado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  pendente_correcao: "Correção solicitada",
};

export default async function DocumentosEstagiarioPage() {
  const { student, documents, error } = await getStudentAreaData();

  const validatedCount = documents.filter(
    (item) => ["validado", "aprovado"].includes(item.status)
  ).length;

  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Meus Documentos"
      description="Acompanhe os documentos vinculados ao seu estágio e a situação de cada registro."
    >
      <div className="mb-4">
        <Link
          href="/estagiario"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar ao painel
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!student ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Não foi possível localizar os dados do estagiário.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Registrados", value: documents.length },
              { label: "Validados", value: validatedCount },
              {
                label: "Demais situações",
                value: documents.length - validatedCount,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">
                Documentos registrados
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Consulta dos documentos e resultados de conferência.
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Nenhum documento registrado.
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Os documentos serão apresentados aqui quando estiverem
                  registrados e disponíveis para acompanhamento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Documento</th>
                      <th className="px-4 py-3 font-semibold">Situação</th>
                      <th className="px-4 py-3 font-semibold">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {documentLabels[item.document_type] ??
                            item.document_type.replaceAll("_", " ")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {statusLabels[item.status] ??
                              item.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.notes ?? "Sem observações"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-xs leading-5 text-slate-500">
            A situação apresentada corresponde aos registros disponíveis
            no sistema. A conferência e validação documental são realizadas
            pela Coordenadoria.
          </p>
        </div>
      )}
    </SystemShell>
  );
}
