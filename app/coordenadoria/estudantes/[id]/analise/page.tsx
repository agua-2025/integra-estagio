import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import {
  releaseStudentAccess,
  updateCommitmentTermReview,
  updateStudentDocumentReview,
  updateStudentPresentationReview,
} from "../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
    acesso?: string;
  }>;
};

type StudentDocument = {
  id: string;
  document_type: string;
  file_path: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    apresentado: "Apresentado",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Apto para emissão da autorização",
    autorizado: "Autorizado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
    viavel: "Viável",
    viavel_parcial: "Viável parcial",
    parcialmente_viavel: "Parcialmente viável",
    ativo: "Ativo",
    enviado: "Enviado",
    validado: "Validado",
    rejeitado: "Rejeitado",
    substituido: "Substituído",
    obrigatorio: "Obrigatório",
    nao_obrigatorio: "Não obrigatório",
  };

  if (!status) return "-";
  return labels[status] ?? status;
}

function documentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    carta_apresentacao: "Carta de apresentação",
    termo_compromisso: "Termo de Compromisso",
    seguro: "Apólice/seguro",
    comprovante_matricula: "Comprovante de matrícula",
    documento_identificacao: "Documento de identificação",
    plano_atividades: "Plano de atividades",
    outro: "Outro",
  };

  return labels[type] ?? type;
}

function statusClass(status: string | null | undefined) {
  if (["autorizado", "apto_para_autorizacao", "documentos_validados", "validado"].includes(status ?? "")) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (["apresentado", "em_analise", "pendente_correcao", "enviado"].includes(status ?? "")) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (["indeferido", "cancelado", "rejeitado"].includes(status ?? "")) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatWeekDays(days: string[] | null | undefined) {
  if (!days || days.length === 0) return "-";

  const labels: Record<string, string> = {
    segunda: "Seg",
    terca: "Ter",
    quarta: "Qua",
    quinta: "Qui",
    sexta: "Sex",
    sabado: "Sáb",
    domingo: "Dom",
  };

  return days.map((day) => labels[day] ?? day).join(", ");
}

function getPublicDocumentUrl(filePath: string | null | undefined) {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return filePath;
}

function dateIsBefore(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return false;
  return left.slice(0, 10) < right.slice(0, 10);
}

export default async function AnaliseEstagiarioPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    notFound();
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, institution_id, course_id, agreement_id, inquiry_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload, review_notes, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (presentationError || !presentation) {
    notFound();
  }

  const [
    studentResult,
    institutionResult,
    courseResult,
    unitResult,
    agreementResult,
    inquiryResult,
    studentAccessResult,
    documentsResult,
    commitmentTermResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, cpf, email, phone, birth_date, academic_registration")
      .eq("id", presentation.student_id)
      .single(),

    supabase
      .from("institutions")
      .select("id, name")
      .eq("id", presentation.institution_id)
      .single(),

    supabase
      .from("courses")
      .select("id, name, level, workload_required")
      .eq("id", presentation.course_id)
      .single(),

    presentation.municipal_unit_id
      ? supabase
          .from("municipal_units")
          .select("id, name, department, responsible_name")
          .eq("id", presentation.municipal_unit_id)
          .single()
      : { data: null, error: null },

    supabase
      .from("cooperation_agreements")
      .select("id, status, signed_at, published_at, started_at, ended_at")
      .eq("id", presentation.agreement_id)
      .single(),

    presentation.inquiry_id
      ? supabase
          .from("inquiries")
          .select("id, requested_area, requested_students, coordination_decision, coordination_approved_students, coordination_notes, status")
          .eq("id", presentation.inquiry_id)
          .single()
      : { data: null, error: null },

    supabase
      .from("profiles")
      .select("id, full_name, email, is_active")
      .eq("student_id", presentation.student_id)
      .maybeSingle(),

    supabase
      .from("student_documents")
      .select("id, document_type, file_path, status, notes, created_at")
      .eq("presentation_id", presentation.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("commitment_terms")
      .select(
        "id, status, term_number, term_signed_at, internship_type, academic_period, professor_advisor_name, professor_advisor_email, internship_location, activities_plan, policy_number, insurance_company, insurance_valid_from, insurance_valid_until, internship_start_date, internship_end_date, internship_schedule, required_workload, supervisor_name, weekly_days, daily_start_time, daily_end_time, break_minutes, daily_workload, weekly_workload, maximum_possible_workload, notes, term_document_id, insurance_document_id",
      )
      .eq("presentation_id", presentation.id)
      .not("status", "in", "(cancelado,substituido)")
      .maybeSingle(),
  ]);

  const student = studentResult.data;
  const institution = institutionResult.data;
  const course = courseResult.data;
  const unit = unitResult.data;
  const agreement = agreementResult.data;
  const inquiry = inquiryResult.data;
  const studentAccess = studentAccessResult.data;
  const documents = (documentsResult.data ?? []) as StudentDocument[];
  const commitmentTerm = commitmentTermResult.data;

  const storage = supabase.storage.from("student-documents");

  const documentRows = documents.map((document) => {
    const url = document.file_path
      ? storage.getPublicUrl(document.file_path).data.publicUrl
      : getPublicDocumentUrl(document.file_path);

    return {
      ...document,
      url,
    };
  });

  const requiredDocumentTypes = [
    "carta_apresentacao",
    "termo_compromisso",
    "seguro",
    "comprovante_matricula",
    "documento_identificacao",
  ];

  const requiredDocumentsOk = requiredDocumentTypes.every((type) =>
    documents.some((document) => document.document_type === type && document.status === "validado"),
  );

  const commitmentTermOk =
    commitmentTerm?.status === "validado" &&
    commitmentTerm.term_document_id &&
    commitmentTerm.insurance_document_id &&
    commitmentTerm.policy_number &&
    commitmentTerm.insurance_company &&
    commitmentTerm.insurance_valid_from &&
    commitmentTerm.insurance_valid_until &&
    commitmentTerm.internship_start_date &&
    commitmentTerm.internship_end_date &&
    commitmentTerm.required_workload;

  const insuranceCoversPeriod =
    commitmentTerm?.insurance_valid_from &&
    commitmentTerm?.insurance_valid_until &&
    commitmentTerm?.internship_start_date &&
    commitmentTerm?.internship_end_date &&
    !dateIsBefore(commitmentTerm.insurance_valid_until, commitmentTerm.internship_end_date) &&
    !dateIsBefore(commitmentTerm.internship_start_date, commitmentTerm.insurance_valid_from);

  const canAdvance = Boolean(requiredDocumentsOk && commitmentTermOk && insuranceCoversPeriod);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Análise do estagiário"
      description="Confira dados, documentos, Termo de Compromisso e seguro antes de liberar a autorização."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/estudantes"
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          Voltar para estagiários
        </Link>

        <Link
          href="/coordenadoria/autorizacoes"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver autorizações
        </Link>
      </div>

      {query?.sucesso === "1" && (
        <Alert type="success" text="Análise atualizada com sucesso." />
      )}

      {query?.acesso === "1" && (
        <Alert type="success" text="Acesso do estagiário liberado com sucesso." />
      )}

      {query?.erro && (
        <Alert type="error" text={decodeURIComponent(query.erro)} />
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 md:grid-cols-[1.5fr_0.8fr_1fr_0.8fr]">
          <HeaderCell
            label="Estagiário"
            value={student?.full_name ?? "Não identificado"}
            subvalue={student?.email ?? "E-mail não informado"}
          />

          <div className="border-b border-slate-100 px-4 py-2.5 md:border-b-0 md:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Situação
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
                presentation.status,
              )}`}
            >
              {statusLabel(presentation.status)}
            </span>
          </div>

          <HeaderCell
            label="Acesso"
            value={studentAccess ? "Liberado" : "Não liberado"}
            subvalue={studentAccess?.email ?? "Sem usuário vinculado"}
          />

          <HeaderCell
            label="Recebido em"
            value={formatDate(presentation.created_at)}
          />
        </div>

        <div className="border-b border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <tbody className="divide-y divide-slate-100">
              <InfoPair
                leftLabel="CPF"
                leftValue={student?.cpf ?? "-"}
                rightLabel="Telefone"
                rightValue={student?.phone ?? "-"}
              />
              <InfoPair
                leftLabel="Nascimento"
                leftValue={formatDate(student?.birth_date ?? null)}
                rightLabel="Matrícula"
                rightValue={student?.academic_registration ?? "-"}
              />
              <InfoPair
                leftLabel="Instituição"
                leftValue={institution?.name ?? "-"}
                rightLabel="Curso"
                rightValue={course?.name ?? "-"}
              />
              <InfoPair
                leftLabel="Unidade"
                leftValue={unit?.name ?? "-"}
                rightLabel="Setor"
                rightValue={unit?.department ?? "-"}
              />
            </tbody>
          </table>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="grid gap-2 md:grid-cols-3">
            <ChecklistBadge
              label="Termo de Compromisso"
              ok={Boolean(commitmentTermOk)}
              okText="Validado"
              pendingText="Pendente"
            />
            <ChecklistBadge
              label="Seguro"
              ok={Boolean(insuranceCoversPeriod)}
              okText="Cobertura regular"
              pendingText="Conferir cobertura"
            />
            <ChecklistBadge
              label="Documentos obrigatórios"
              ok={Boolean(requiredDocumentsOk)}
              okText="Validados"
              pendingText="Pendentes"
            />
          </div>
        </div>

        <section className="border-b border-slate-200 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Termo de Compromisso
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Conferência dos dados estruturados informados pela instituição.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                commitmentTerm?.status,
              )}`}
            >
              {statusLabel(commitmentTerm?.status)}
            </span>
          </div>

          {commitmentTerm ? (
            <div className="grid gap-3">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <InfoPair
                      leftLabel="Nº termo"
                      leftValue={commitmentTerm.term_number ?? "-"}
                      rightLabel="Assinatura"
                      rightValue={formatDate(commitmentTerm.term_signed_at)}
                    />
                    <InfoPair
                      leftLabel="Tipo"
                      leftValue={statusLabel(commitmentTerm.internship_type)}
                      rightLabel="Período acadêmico"
                      rightValue={commitmentTerm.academic_period ?? "-"}
                    />
                    <InfoPair
                      leftLabel="Professor orientador"
                      leftValue={commitmentTerm.professor_advisor_name ?? "-"}
                      rightLabel="E-mail orientador"
                      rightValue={commitmentTerm.professor_advisor_email ?? "-"}
                    />
                    <InfoPair
                      leftLabel="Local/setor"
                      leftValue={commitmentTerm.internship_location ?? "-"}
                      rightLabel="Supervisor"
                      rightValue={commitmentTerm.supervisor_name ?? "-"}
                    />
                    <InfoPair
                      leftLabel="Período"
                      leftValue={`${formatDate(commitmentTerm.internship_start_date)} a ${formatDate(
                        commitmentTerm.internship_end_date,
                      )}`}
                      rightLabel="Dias"
                      rightValue={formatWeekDays(commitmentTerm.weekly_days)}
                    />
                    <InfoPair
                      leftLabel="Horário"
                      leftValue={`${commitmentTerm.daily_start_time?.slice(0, 5) ?? "-"} às ${
                        commitmentTerm.daily_end_time?.slice(0, 5) ?? "-"
                      } · intervalo ${formatNumber(commitmentTerm.break_minutes)} min`}
                      rightLabel="Carga"
                      rightValue={`${formatNumber(commitmentTerm.required_workload)}h obrigatórias · ${formatNumber(
                        commitmentTerm.maximum_possible_workload,
                      )}h possíveis`}
                    />
                    <InfoPair
                      leftLabel="Seguro"
                      leftValue={`${commitmentTerm.insurance_company ?? "-"} · Apólice ${
                        commitmentTerm.policy_number ?? "-"
                      }`}
                      rightLabel="Vigência"
                      rightValue={`${formatDate(commitmentTerm.insurance_valid_from)} a ${formatDate(
                        commitmentTerm.insurance_valid_until,
                      )}`}
                    />
                  </tbody>
                </table>
              </div>

              <div
                className={`rounded-lg border px-3 py-2 text-xs ${
                  insuranceCoversPeriod
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                {insuranceCoversPeriod
                  ? "Seguro compatível com todo o período do Termo de Compromisso."
                  : "A cobertura do seguro precisa ser conferida ou corrigida."}
              </div>

              <details className="group rounded-lg border border-slate-200 bg-white px-3 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Plano de atividades e observações
                  <span className="text-slate-400 group-open:rotate-90">›</span>
                </summary>

                <div className="mt-2 grid gap-3 text-xs leading-5 text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="font-bold text-slate-700">Plano de atividades</p>
                    <p className="mt-1">{commitmentTerm.activities_plan ?? "Não informado."}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Observações</p>
                    <p className="mt-1">{commitmentTerm.notes ?? "Nenhuma observação registrada."}</p>
                  </div>
                </div>
              </details>

              <form
                action={updateCommitmentTermReview}
                className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[220px_minmax(0,1fr)_auto]"
              >
                <input type="hidden" name="presentation_id" value={presentation.id} />
                <input type="hidden" name="commitment_term_id" value={commitmentTerm.id} />

                <select
                  name="status"
                  defaultValue={commitmentTerm.status}
                  required
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="enviado">Enviado</option>
                  <option value="em_analise">Em análise</option>
                  <option value="pendente_correcao">Pendente de correção</option>
                  <option value="validado">Validado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>

                <input
                  name="notes"
                  defaultValue={commitmentTerm.notes ?? ""}
                  placeholder="Observação sobre o termo."
                  className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

                <button
                  type="submit"
                  className="rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-teal-800"
                >
                  Salvar termo
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Nenhum Termo de Compromisso estruturado foi localizado para esta apresentação.
            </div>
          )}
        </section>

        <section className="border-b border-slate-200 p-4">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Documentos anexados
            </h2>
            <p className="text-xs text-slate-500">
              Valide os documentos obrigatórios antes de liberar a apresentação para autorização.
            </p>
          </div>

          {documentRows.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum documento anexado.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-black">Documento</th>
                    <th className="px-3 py-2 font-black">Enviado em</th>
                    <th className="px-3 py-2 font-black">Status</th>
                    <th className="px-3 py-2 font-black">Arquivo</th>
                    <th className="px-3 py-2 font-black">Análise</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {documentRows.map((document) => (
                    <tr key={document.id} className="align-middle hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-900">
                        {documentTypeLabel(document.document_type)}
                        {document.notes && (
                          <p className="mt-1 font-normal text-slate-500">
                            {document.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {formatDate(document.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                            document.status,
                          )}`}
                        >
                          {statusLabel(document.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {document.url ? (
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-teal-700 hover:text-teal-900"
                          >
                            Abrir PDF
                          </a>
                        ) : (
                          <span className="text-slate-400">Sem arquivo</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <form action={updateStudentDocumentReview} className="grid gap-2">
                          <input type="hidden" name="presentation_id" value={presentation.id} />
                          <input type="hidden" name="document_id" value={document.id} />

                          <div className="grid gap-2 lg:grid-cols-[130px_minmax(0,1fr)_auto]">
                            <select
                              name="status"
                              defaultValue={document.status}
                              required
                              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            >
                              <option value="enviado">Enviado</option>
                              <option value="validado">Validado</option>
                              <option value="rejeitado">Rejeitado</option>
                              <option value="pendente">Pendente</option>
                            </select>

                            <input
                              name="notes"
                              defaultValue={document.notes ?? ""}
                              placeholder="Observação"
                              className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                            />

                            <button
                              type="submit"
                              className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100"
                            >
                              Salvar
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <details className="group border-b border-slate-200 px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Sondagem e acordo
            <span className="text-slate-400 group-open:rotate-90">›</span>
          </summary>

          <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-500">
                Sondagem
              </p>
              <p className="mt-1 text-slate-800">
                {inquiry?.coordination_decision
                  ? statusLabel(inquiry.coordination_decision)
                  : inquiry?.status
                    ? statusLabel(inquiry.status)
                    : "-"}
              </p>
              <p className="mt-1 text-slate-500">
                Autorizados: {formatNumber(inquiry?.coordination_approved_students ?? null)}
              </p>
              {inquiry?.requested_area && (
                <p className="mt-1 text-slate-500">
                  Área: {inquiry.requested_area}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-500">
                Acordo
              </p>
              <p className="mt-1 text-slate-800">
                {agreement?.status ? statusLabel(agreement.status) : "-"}
              </p>
              <p className="mt-1 text-slate-500">
                Vigência: {formatDate(agreement?.started_at ?? null)} a{" "}
                {formatDate(agreement?.ended_at ?? null)}
              </p>
              <p className="mt-1 text-slate-500">
                Ass.: {formatDate(agreement?.signed_at ?? null)} · Pub.:{" "}
                {formatDate(agreement?.published_at ?? null)}
              </p>
            </div>
          </div>

          {inquiry?.coordination_notes && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
              <p className="text-[11px] font-semibold uppercase text-slate-500">
                Observação da sondagem
              </p>
              <p className="mt-1">{inquiry.coordination_notes}</p>
            </div>
          )}
        </details>

        <section className="bg-slate-50 p-4">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Decisão da Coordenadoria
            </h2>
            <p className="text-xs text-slate-500">
              Esta análise documental não autoriza o início do estágio. A autorização será emitida em etapa própria.
            </p>
          </div>

          <div
            className={`mb-3 rounded-lg border px-3 py-2 text-xs leading-5 ${
              canAdvance
                ? "border-teal-200 bg-teal-50 text-teal-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-black">
              {canAdvance ? "Processo apto para avanço" : "Pendências de validação"}
            </p>
            <p className="mt-1">
              {canAdvance
                ? "Termo, seguro e documentos obrigatórios estão validados."
                : "O sistema bloqueará Documentos validados ou Pronto para autorização enquanto houver pendências."}
            </p>
          </div>

          <form
            action={updateStudentPresentationReview}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[260px_minmax(0,1fr)_auto]"
          >
            <input type="hidden" name="presentation_id" value={presentation.id} />

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={presentation.status}
                required
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="apresentado">Apresentado</option>
                <option value="em_analise">Em análise</option>
                <option value="pendente_correcao">Pendente de correção</option>
                                <option value="apto_para_autorizacao">Apto para emissão da autorização</option>
                <option value="indeferido">Indeferido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">Observações</span>
              <textarea
                name="review_notes"
                rows={2}
                defaultValue={presentation.review_notes ?? ""}
                placeholder="Pendências ou orientações."
                className="rounded-md border border-slate-300 px-2 py-2 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-9 w-full rounded-md bg-teal-700 px-4 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800 md:w-auto"
              >
                Salvar análise
              </button>
            </div>
          </form>

          <details className="group mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Acesso individual do estagiário
              <span className="text-slate-400 group-open:rotate-90">›</span>
            </summary>

            {studentAccess ? (
              <div className="mt-2 rounded-md border border-teal-200 bg-teal-50 p-2 text-xs leading-5 text-teal-900">
                <p>Acesso já liberado.</p>
                <p className="mt-1">{studentAccess.email}</p>
                <p className="mt-1">
                  {studentAccess.is_active ? "Ativo" : "Inativo"}
                </p>
              </div>
            ) : (
              <form action={releaseStudentAccess} className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_220px_auto]">
                <input type="hidden" name="presentation_id" value={presentation.id} />

                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Nome</span>
                  <input
                    name="full_name"
                    defaultValue={student?.full_name ?? ""}
                    required
                    className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">E-mail</span>
                  <input
                    type="email"
                    name="email"
                    defaultValue={student?.email ?? ""}
                    required
                    className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Senha provisória</span>
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    required
                    placeholder="Mínimo de 8 caracteres"
                    className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="h-8 rounded-md border border-teal-200 bg-teal-50 px-3 text-xs font-semibold uppercase tracking-wide text-teal-800 transition hover:bg-teal-100"
                  >
                    Liberar
                  </button>
                </div>
              </form>
            )}
          </details>
        </section>
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          A análise não autoriza o início do estágio. A autorização será emitida em etapa própria.
        </div>
      </section>
    </SystemShell>
  );
}

function Alert({ type, text }: { type: "success" | "error"; text: string }) {
  const classes =
    type === "success"
      ? "border-teal-200 bg-teal-50 text-teal-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <section className={`mb-3 rounded-lg border px-4 py-2 text-sm font-medium ${classes}`}>
      {text}
    </section>
  );
}

function HeaderCell({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-2.5 md:border-b-0 md:border-r">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 break-words text-sm font-medium text-slate-900">{value}</p>
      {subvalue && (
        <p className="mt-0.5 break-words text-[11px] text-slate-500">
          {subvalue}
        </p>
      )}
    </div>
  );
}

function InfoPair({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <tr>
      <th className="w-36 bg-slate-50 px-4 py-2 align-top text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {leftLabel}
      </th>
      <td className="w-[38%] px-4 py-2 align-top text-xs text-slate-800">
        {leftValue}
      </td>
      <th className="w-36 bg-slate-50 px-4 py-2 align-top text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {rightLabel}
      </th>
      <td className="px-4 py-2 align-top text-xs text-slate-800">
        {rightValue}
      </td>
    </tr>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ChecklistBadge({
  label,
  ok,
  okText,
  pendingText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  pendingText: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs ${
        ok
          ? "border-teal-200 bg-white text-teal-900"
          : "border-amber-200 bg-white text-amber-900"
      }`}
    >
      <p className="font-black uppercase tracking-wide">{label}</p>
      <p className="mt-1">{ok ? okText : pendingText}</p>
    </div>
  );
}
