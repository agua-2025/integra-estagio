import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import { updateStudentPresentationReview } from "../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
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
    apto_para_autorizacao: "Pronto para emissão da autorização",
    autorizado: "Autorizado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
    viavel: "Viável",
    viavel_parcial: "Viável parcial",
    parcialmente_viavel: "Parcialmente viável",
    sem_disponibilidade: "Sem disponibilidade",
    precisa_complementacao: "Precisa complementação",
    complementacao_solicitada: "Complementação solicitada",
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
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function AnaliseEstudantePage({
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
  ]);

  const student = studentResult.data;
  const institution = institutionResult.data;
  const course = courseResult.data;
  const unit = unitResult.data;
  const agreement = agreementResult.data;
  const inquiry = inquiryResult.data;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Análise do estudante"
      description="Confira os dados apresentados pela instituição e registre a situação da análise."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/estudantes"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para estudantes
        </Link>

        <Link
          href="/coordenadoria/autorizacoes"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver autorizações
        </Link>
      </div>

      {query?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Análise atualizada com sucesso.
        </section>
      )}

      {query?.erro && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(query.erro)}
        </section>
      )}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Estudante
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {student?.full_name ?? "Estudante não identificado"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {student?.email ?? "E-mail não informado"}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClass(
              presentation.status,
            )}`}
          >
            {statusLabel(presentation.status)}
          </span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">
              Dados do estudante
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info label="CPF" value={student?.cpf ?? "-"} />
              <Info label="Telefone" value={student?.phone ?? "-"} />
              <Info label="Nascimento" value={formatDate(student?.birth_date ?? null)} />
              <Info label="Matrícula acadêmica" value={student?.academic_registration ?? "-"} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">
              Vínculo da apresentação
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info label="Instituição" value={institution?.name ?? "-"} />
              <Info label="Curso" value={course?.name ?? "-"} />
              <Info label="Unidade municipal" value={unit?.name ?? "-"} />
              <Info label="Carga horária" value={`${formatNumber(presentation.required_workload)}h`} />
              <Info label="Período" value={presentation.intended_period ?? "-"} />
              <Info label="Horário" value={presentation.intended_schedule ?? "-"} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">
              Sondagem e acordo
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Resultado da sondagem
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {inquiry?.coordination_decision
                    ? statusLabel(inquiry.coordination_decision)
                    : inquiry?.status
                      ? statusLabel(inquiry.status)
                      : "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Autorizados: {formatNumber(inquiry?.coordination_approved_students ?? null)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Acordo
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {agreement?.status ? statusLabel(agreement.status) : "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Vigência: {formatDate(agreement?.started_at ?? null)} a{" "}
                  {formatDate(agreement?.ended_at ?? null)}
                </p>
              </div>
            </div>

            {inquiry?.coordination_notes && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Observação da sondagem
                </p>
                <p className="mt-1">{inquiry.coordination_notes}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">
            Registrar análise
          </h3>

          <form action={updateStudentPresentationReview} className="mt-4 grid gap-4">
            <input type="hidden" name="presentation_id" value={presentation.id} />

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Situação</span>
              <select
                name="status"
                defaultValue={presentation.status}
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="apresentado">Apresentado</option>
                <option value="em_analise">Em análise</option>
                <option value="pendente_correcao">Pendente de correção</option>
                <option value="documentos_validados">Documentos validados</option>
                <option value="apto_para_autorizacao">Pronto para emissão da autorização</option>
                <option value="indeferido">Indeferido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Observações da análise
              </span>
              <textarea
                name="review_notes"
                rows={8}
                defaultValue={presentation.review_notes ?? ""}
                placeholder="Registre conferências, pendências, orientações ou justificativas."
                className="rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
            >
              Salvar análise
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <p className="font-black">Atenção</p>
            <p className="mt-1">
              A marcação como pronto para emissão da autorização ainda não cria a autorização
              de início automaticamente. Essa será a próxima etapa do fluxo.
            </p>
          </div>
        </aside>
      </section>
    </SystemShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}
