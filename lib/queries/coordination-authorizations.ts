import { createClient } from "@/lib/supabase/server";

export type AuthorizationRequirement = {
  label: string;
  ok: boolean;
  detail: string;
};

export type ReadyAuthorizationPresentation = {
  id: string;
  student_id: string;
  student_name: string;
  institution_id: string;
  institution_name: string;
  course_id: string;
  course_name: string;
  agreement_id: string;
  municipal_unit_id: string;
  municipal_unit_name: string;
  supervisor_name: string | null;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
  status: string;

  commitment_term_id: string | null;
  commitment_term_status: string | null;
  term_document_id: string | null;
  insurance_document_id: string | null;
  policy_number: string | null;
  insurance_company: string | null;
  insurance_valid_from: string | null;
  insurance_valid_until: string | null;
  internship_start_date: string | null;
  internship_end_date: string | null;
  internship_schedule: string | null;
  term_required_workload: number | null;
  term_supervisor_name: string | null;

  term_document_status: string | null;
  insurance_document_status: string | null;
  enrollment_document_status: string | null;
  identification_document_status: string | null;

  authorization_requirements: AuthorizationRequirement[];
  can_authorize: boolean;
};

export type InternshipAuthorizationRow = {
  id: string;
  presentation_id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  supervisor_name: string;
  authorized_start_date: string;
  authorized_end_date: string | null;
  authorized_schedule: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type PresentationRow = {
  id: string;
  student_id: string;
  institution_id: string;
  course_id: string;
  agreement_id: string;
  municipal_unit_id: string;
  status: string;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
};

type CommitmentTermRow = {
  id: string;
  presentation_id: string;
  status: string;
  term_document_id: string | null;
  insurance_document_id: string | null;
  policy_number: string | null;
  insurance_company: string | null;
  insurance_valid_from: string | null;
  insurance_valid_until: string | null;
  internship_start_date: string | null;
  internship_end_date: string | null;
  internship_schedule: string | null;
  required_workload: number | null;
  supervisor_name: string | null;
};

type StudentDocumentRow = {
  id: string;
  presentation_id: string;
  document_type: string;
  status: string;
};

function isValidated(status: string | null | undefined) {
  return status === "validado";
}

function dateIsBefore(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return false;
  return left.slice(0, 10) < right.slice(0, 10);
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

function buildRequirements({
  presentation,
  commitmentTerm,
  documents,
}: {
  presentation: PresentationRow;
  commitmentTerm: CommitmentTermRow | null;
  documents: StudentDocumentRow[];
}) {
  const termDocument = commitmentTerm?.term_document_id
    ? documents.find((document) => document.id === commitmentTerm.term_document_id)
    : null;

  const insuranceDocument = commitmentTerm?.insurance_document_id
    ? documents.find((document) => document.id === commitmentTerm.insurance_document_id)
    : null;

  const enrollmentDocument = documents.find(
    (document) => document.document_type === "comprovante_matricula",
  );

  const identificationDocument = documents.find(
    (document) => document.document_type === "documento_identificacao",
  );

  const termWorkload = Number(commitmentTerm?.required_workload ?? 0);
  const presentationWorkload = Number(presentation.required_workload ?? 0);

  const requirements: AuthorizationRequirement[] = [
    {
      label: "Termo de Compromisso",
      ok: commitmentTerm?.status === "validado",
      detail: commitmentTerm
        ? `Status: ${commitmentTerm.status}`
        : "Termo estruturado ainda não registrado.",
    },
    {
      label: "Documento do termo",
      ok: isValidated(termDocument?.status),
      detail: termDocument
        ? `Status: ${termDocument.status}`
        : "Documento do termo não vinculado.",
    },
    {
      label: "Apólice/seguro",
      ok: isValidated(insuranceDocument?.status),
      detail: insuranceDocument
        ? `Status: ${insuranceDocument.status}`
        : "Apólice/seguro não vinculada.",
    },
    {
      label: "Comprovante de matrícula",
      ok: isValidated(enrollmentDocument?.status),
      detail: enrollmentDocument
        ? `Status: ${enrollmentDocument.status}`
        : "Documento não localizado.",
    },
    {
      label: "Documento de identificação",
      ok: isValidated(identificationDocument?.status),
      detail: identificationDocument
        ? `Status: ${identificationDocument.status}`
        : "Documento não localizado.",
    },
    {
      label: "Dados do seguro",
      ok: Boolean(
        commitmentTerm?.policy_number &&
          commitmentTerm?.insurance_company &&
          commitmentTerm?.insurance_valid_from &&
          commitmentTerm?.insurance_valid_until,
      ),
      detail:
        commitmentTerm?.insurance_valid_from && commitmentTerm?.insurance_valid_until
          ? `${commitmentTerm.insurance_company ?? "Seguradora não informada"} - vigência ${formatDate(
              commitmentTerm.insurance_valid_from,
            )} a ${formatDate(commitmentTerm.insurance_valid_until)}`
          : "Seguradora, apólice ou vigência não informada.",
    },
    {
      label: "Período do estágio",
      ok: Boolean(commitmentTerm?.internship_start_date && commitmentTerm?.internship_end_date),
      detail:
        commitmentTerm?.internship_start_date && commitmentTerm?.internship_end_date
          ? `${formatDate(commitmentTerm.internship_start_date)} a ${formatDate(
              commitmentTerm.internship_end_date,
            )}`
          : "Período não informado no termo.",
    },
    {
      label: "Cobertura do seguro",
      ok: Boolean(
        commitmentTerm?.insurance_valid_from &&
          commitmentTerm?.insurance_valid_until &&
          commitmentTerm?.internship_start_date &&
          commitmentTerm?.internship_end_date &&
          !dateIsBefore(commitmentTerm.insurance_valid_until, commitmentTerm.internship_end_date) &&
          !dateIsBefore(commitmentTerm.internship_start_date, commitmentTerm.insurance_valid_from),
      ),
      detail:
        commitmentTerm?.insurance_valid_until && commitmentTerm?.internship_end_date
          ? dateIsBefore(commitmentTerm.insurance_valid_until, commitmentTerm.internship_end_date)
            ? "Seguro vence antes do término previsto."
            : "Seguro cobre o período informado."
          : "Não foi possível conferir a cobertura.",
    },
    {
      label: "Carga horária",
      ok:
        presentationWorkload > 0 &&
        termWorkload > 0 &&
        presentationWorkload === termWorkload,
      detail:
        presentationWorkload > 0 && termWorkload > 0
          ? `${termWorkload}h no termo / ${presentationWorkload}h na apresentação`
          : "Carga horária não informada.",
    },
  ];

  return {
    requirements,
    termDocumentStatus: termDocument?.status ?? null,
    insuranceDocumentStatus: insuranceDocument?.status ?? null,
    enrollmentDocumentStatus: enrollmentDocument?.status ?? null,
    identificationDocumentStatus: identificationDocument?.status ?? null,
    canAuthorize: requirements.every((item) => item.ok),
  };
}

export async function getCoordinationAuthorizationsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const { data: presentationsData, error: presentationsError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, institution_id, course_id, agreement_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload",
    )
    .in("status", ["documentos_validados", "apto_para_autorizacao", "autorizado"])
    .order("created_at", { ascending: false });

  const { data: authorizationsData, error: authorizationsError } = await supabase
    .from("internship_authorizations")
    .select(
      "id, presentation_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, authorized_start_date, authorized_end_date, authorized_schedule, status, notes, created_at",
    )
    .order("created_at", { ascending: false });

  const baseError =
    presentationsError?.message ?? authorizationsError?.message ?? null;

  if (baseError) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: baseError,
    };
  }

  const presentations = (presentationsData ?? []) as PresentationRow[];
  const authorizations = authorizationsData ?? [];

  const presentationIds = presentations.map((item) => item.id);

  const studentIds = Array.from(
    new Set([
      ...presentations.map((item) => item.student_id),
      ...authorizations.map((item) => item.student_id),
    ].filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set([
      ...presentations.map((item) => item.institution_id),
      ...authorizations.map((item) => item.institution_id),
    ].filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set([
      ...presentations.map((item) => item.course_id),
      ...authorizations.map((item) => item.course_id),
    ].filter(Boolean)),
  ) as string[];

  const unitIds = Array.from(
    new Set([
      ...presentations.map((item) => item.municipal_unit_id),
      ...authorizations.map((item) => item.municipal_unit_id),
    ].filter(Boolean)),
  ) as string[];

  const [
    studentsResult,
    institutionsResult,
    coursesResult,
    unitsResult,
    commitmentTermsResult,
    documentsResult,
  ] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name").in("id", studentIds)
      : { data: [], error: null },

    institutionIds.length > 0
      ? supabase.from("institutions").select("id, name").in("id", institutionIds)
      : { data: [], error: null },

    courseIds.length > 0
      ? supabase.from("courses").select("id, name").in("id", courseIds)
      : { data: [], error: null },

    unitIds.length > 0
      ? supabase
          .from("municipal_units")
          .select("id, name, responsible_name")
          .in("id", unitIds)
      : { data: [], error: null },

    presentationIds.length > 0
      ? supabase
          .from("commitment_terms")
          .select(
            "id, presentation_id, status, term_document_id, insurance_document_id, policy_number, insurance_company, insurance_valid_from, insurance_valid_until, internship_start_date, internship_end_date, internship_schedule, required_workload, supervisor_name",
          )
          .in("presentation_id", presentationIds)
          .not("status", "in", "(cancelado,substituido)")
      : { data: [], error: null },

    presentationIds.length > 0
      ? supabase
          .from("student_documents")
          .select("id, presentation_id, document_type, status")
          .in("presentation_id", presentationIds)
      : { data: [], error: null },
  ]);

  const error =
    studentsResult.error?.message ??
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    unitsResult.error?.message ??
    commitmentTermsResult.error?.message ??
    documentsResult.error?.message ??
    null;

  if (error) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error,
    };
  }

  const students = new Map(
    (studentsResult.data ?? []).map((item) => [item.id, item]),
  );
  const institutions = new Map(
    (institutionsResult.data ?? []).map((item) => [item.id, item]),
  );
  const courses = new Map(
    (coursesResult.data ?? []).map((item) => [item.id, item]),
  );
  const units = new Map((unitsResult.data ?? []).map((item) => [item.id, item]));

  const commitmentTermsByPresentation = new Map(
    ((commitmentTermsResult.data ?? []) as CommitmentTermRow[]).map((item) => [
      item.presentation_id,
      item,
    ]),
  );

  const documentsByPresentation = new Map<string, StudentDocumentRow[]>();

  for (const document of (documentsResult.data ?? []) as StudentDocumentRow[]) {
    const current = documentsByPresentation.get(document.presentation_id) ?? [];
    current.push(document);
    documentsByPresentation.set(document.presentation_id, current);
  }

  const authorizedPresentationIds = new Set(
    authorizations.map((item) => item.presentation_id),
  );

  const readyPresentations = presentations
    .filter((item) => !authorizedPresentationIds.has(item.id))
    .filter((item) => item.status !== "autorizado")
    .map((item) => {
      const unit = units.get(item.municipal_unit_id);
      const commitmentTerm = commitmentTermsByPresentation.get(item.id) ?? null;
      const documents = documentsByPresentation.get(item.id) ?? [];
      const check = buildRequirements({
        presentation: item,
        commitmentTerm,
        documents,
      });

      return {
        id: item.id,
        student_id: item.student_id,
        student_name:
          students.get(item.student_id)?.full_name ?? "Estagiário não identificado",
        institution_id: item.institution_id,
        institution_name:
          institutions.get(item.institution_id)?.name ??
          "Instituição não identificada",
        course_id: item.course_id,
        course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
        agreement_id: item.agreement_id,
        municipal_unit_id: item.municipal_unit_id,
        municipal_unit_name: unit?.name ?? "Unidade não identificada",
        supervisor_name: commitmentTerm?.supervisor_name ?? unit?.responsible_name ?? null,
        intended_period: item.intended_period,
        intended_schedule: commitmentTerm?.internship_schedule ?? item.intended_schedule,
        required_workload: item.required_workload,
        status: item.status,

        commitment_term_id: commitmentTerm?.id ?? null,
        commitment_term_status: commitmentTerm?.status ?? null,
        term_document_id: commitmentTerm?.term_document_id ?? null,
        insurance_document_id: commitmentTerm?.insurance_document_id ?? null,
        policy_number: commitmentTerm?.policy_number ?? null,
        insurance_company: commitmentTerm?.insurance_company ?? null,
        insurance_valid_from: commitmentTerm?.insurance_valid_from ?? null,
        insurance_valid_until: commitmentTerm?.insurance_valid_until ?? null,
        internship_start_date: commitmentTerm?.internship_start_date ?? null,
        internship_end_date: commitmentTerm?.internship_end_date ?? null,
        internship_schedule: commitmentTerm?.internship_schedule ?? null,
        term_required_workload: commitmentTerm?.required_workload ?? null,
        term_supervisor_name: commitmentTerm?.supervisor_name ?? null,

        term_document_status: check.termDocumentStatus,
        insurance_document_status: check.insuranceDocumentStatus,
        enrollment_document_status: check.enrollmentDocumentStatus,
        identification_document_status: check.identificationDocumentStatus,

        authorization_requirements: check.requirements,
        can_authorize: check.canAuthorize,
      };
    }) as ReadyAuthorizationPresentation[];

  const authorizationRows = authorizations.map((item) => ({
    id: item.id,
    presentation_id: item.presentation_id,
    student_name:
      students.get(item.student_id)?.full_name ?? "Estagiário não identificado",
    institution_name:
      institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    municipal_unit_name:
      units.get(item.municipal_unit_id)?.name ?? "Unidade não identificada",
    supervisor_name: item.supervisor_name,
    authorized_start_date: item.authorized_start_date,
    authorized_end_date: item.authorized_end_date,
    authorized_schedule: item.authorized_schedule,
    status: item.status,
    notes: item.notes,
    created_at: item.created_at,
  })) as InternshipAuthorizationRow[];

  return {
    readyPresentations,
    authorizations: authorizationRows,
    error: null,
  };
}
