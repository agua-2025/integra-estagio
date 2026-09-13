import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import { releaseStudentAccess, updateStudentPresentationReview } from "../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
    acesso?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    apresentado: "Apresentado",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Pronto para autorização",
    autorizado: "Autorizado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
    viavel: "Viável",
    viavel_parcial: "Viável parcial",
    parcialmente_viavel: "Parcialmente viável",
    ativo: "Ativo",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (["autorizado", "apto_para_autorizacao", "documentos_validados"].includes(status)) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (["apresentado", "em_analise", "pendente_correcao"].includes(status)) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (["indeferido", "cancelado"].includes(status)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR").format(value);
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
  ]);

  const student = studentResult.data;
  const institution = institutionResult.data;
  const course = courseResult.data;
  const unit = unitResult.data;
  const agreement = agreementResult.data;
  const inquiry = inquiryResult.data;
  const studentAccess = studentAccessResult.data;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Análise do estagiário"
      description="Confira os dados da apresentação, registre a análise e gerencie o acesso individual."
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

        <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 border-b border-slate-200 xl:border-b-0 xl:border-r">
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
                <InfoPair
                  leftLabel="Período"
                  leftValue={presentation.intended_period ?? "-"}
                  rightLabel="Horário"
                  rightValue={presentation.intended_schedule ?? "-"}
                />
                <InfoPair
                  leftLabel="Carga horária"
                  leftValue={`${formatNumber(presentation.required_workload)}h`}
                  rightLabel="Registro"
                  rightValue={formatDate(presentation.created_at)}
                />
              </tbody>
            </table>

            <details className="group border-t border-slate-200 px-4 py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Sondagem e acordo
                <span className="text-slate-400 group-open:rotate-90">›</span>
              </summary>

              <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
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

            <details className="group border-t border-slate-200 px-4 py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Observação da análise
                <span className="text-slate-400 group-open:rotate-90">›</span>
              </summary>

              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {presentation.review_notes ?? "Nenhuma observação registrada."}
              </div>
            </details>
          </div>

          <aside className="bg-slate-50 p-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Análise
              </h3>

              <form action={updateStudentPresentationReview} className="mt-2 grid gap-2">
                <input type="hidden" name="presentation_id" value={presentation.id} />

                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Situação</span>
                  <select
                    name="status"
                    defaultValue={presentation.status}
                    required
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="apresentado">Apresentado</option>
                    <option value="em_analise">Em análise</option>
                    <option value="pendente_correcao">Pendente de correção</option>
                    <option value="documentos_validados">Documentos validados</option>
                    <option value="apto_para_autorizacao">Pronto para autorização</option>
                    <option value="indeferido">Indeferido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Observações</span>
                  <textarea
                    name="review_notes"
                    rows={3}
                    defaultValue={presentation.review_notes ?? ""}
                    placeholder="Pendências ou orientações."
                    className="rounded-md border border-slate-300 px-2 py-2 text-xs outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <button
                  type="submit"
                  className="rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                >
                  Salvar análise
                </button>
              </form>
            </div>

            <details className="group mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Acesso individual
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
                <form action={releaseStudentAccess} className="mt-2 grid gap-2">
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

                  <button
                    type="submit"
                    className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-teal-800 transition hover:bg-teal-100"
                  >
                    Liberar acesso
                  </button>
                </form>
              )}
            </details>
          </aside>
        </div>

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
