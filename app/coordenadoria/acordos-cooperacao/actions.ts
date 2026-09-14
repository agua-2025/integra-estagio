"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "rascunho",
  "em_analise",
  "pendente_correcao",
  "minuta_gerada",
  "aguardando_assinatura",
  "assinado",
  "publicado",
  "ativo",
  "vencido",
  "encerrado",
  "cancelado",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  return text || null;
}

function validateDateRange(startedAt: string | null, endedAt: string | null) {
  if (startedAt && endedAt && endedAt < startedAt) {
    throw new Error("A data final da vigência não pode ser anterior à data inicial.");
  }
}

function validateActiveAgreement(data: {
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  signedAt: string | null;
  publishedAt: string | null;
  publicationReference: string | null;
  documentUrl: string | null;
}) {
  if (data.status !== "ativo") {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  if (!data.startedAt || !data.endedAt) {
    throw new Error("Para ativar o acordo, informe o início e o fim da vigência.");
  }

  if (data.endedAt < today) {
    throw new Error("Não é possível ativar acordo com vigência encerrada.");
  }

  if (!data.signedAt) {
    throw new Error("Para ativar o acordo, informe a data de assinatura.");
  }

  if (!data.publishedAt) {
    throw new Error("Para ativar o acordo, informe a data de publicação.");
  }

  if (data.publishedAt < data.signedAt) {
    throw new Error("A data de publicação não pode ser anterior à data de assinatura.");
  }

  if (!data.publicationReference) {
    throw new Error("Para ativar o acordo, informe a referência da publicação.");
  }

  if (!data.documentUrl) {
    throw new Error("Para ativar o acordo, informe ou anexe o documento assinado/publicado.");
  }
}

async function requireCoordination() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    throw new Error("Acesso permitido apenas à Coordenadoria.");
  }

  return { supabase, profileId: profile.id as string };
}


const AGREEMENT_DOCUMENTS_BUCKET = "agreement-documents";

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "acordo-assinado.pdf";
}

async function uploadAgreementDocument(
  supabase: Awaited<ReturnType<typeof createClient>>,
  agreementId: string,
  file: File,
) {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("O documento do acordo deve ser enviado em formato PDF.");
  }

  const fileName = safeFileName(file.name);
  const path = `acordos/${agreementId}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(AGREEMENT_DOCUMENTS_BUCKET)
    .upload(path, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Não foi possível enviar o PDF do acordo: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(AGREEMENT_DOCUMENTS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Não foi possível gerar o link público do PDF do acordo.");
  }

  return data.publicUrl;
}

export async function createCoordinationAgreement(formData: FormData) {
  const { supabase, profileId } = await requireCoordination();

  const institutionId = normalizeText(formData.get("institution_id"));
  const courseIds = Array.from(
    new Set(
      formData
        .getAll("course_ids")
        .map((value) => normalizeText(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const status = normalizeText(formData.get("status")) ?? "em_analise";
  const startedAt = normalizeDate(formData.get("started_at"));
  const endedAt = normalizeDate(formData.get("ended_at"));
  const notes = normalizeText(formData.get("notes"));

  if (!institutionId) {
    throw new Error("Selecione a instituição vinculada ao acordo.");
  }

  if (courseIds.length === 0) {
    throw new Error("Selecione ao menos um curso abrangido pelo acordo.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Situação inválida para o acordo.");
  }

  if (!startedAt) {
    throw new Error("Informe o início da vigência do acordo.");
  }

  if (!endedAt) {
    throw new Error("Informe o fim da vigência do acordo.");
  }

  validateDateRange(startedAt, endedAt);

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select(
      "id, status, name, legal_name, cnpj, email, phone, address_line, address_number, neighborhood, city, state, zip_code, legal_representative_name, legal_representative_role, legal_representative_cpf, legal_representative_email, legal_representative_phone, internship_sector_contact_name, internship_sector_contact_email, internship_sector_contact_phone",
    )
    .eq("id", institutionId)
    .single();

  if (institutionError || !institution) {
    throw new Error(
      institutionError?.message ?? "Instituição não encontrada para atualização do acordo.",
    );
  }

  if (institution.status !== "ativa") {
    throw new Error("O acordo somente pode ser mantido para instituição ativa/validada.");
  }

  const requiredInstitutionFields = [
    [institution.legal_name, "razão social"],
    [institution.cnpj, "CNPJ"],
    [institution.email, "e-mail institucional"],
    [institution.phone, "telefone institucional"],
    [institution.address_line, "endereço"],
    [institution.address_number, "número do endereço"],
    [institution.neighborhood, "bairro"],
    [institution.city, "cidade"],
    [institution.state, "UF"],
    [institution.zip_code, "CEP"],
    [institution.legal_representative_name, "representante legal"],
    [institution.legal_representative_role, "cargo do representante legal"],
    [institution.legal_representative_cpf, "CPF do representante legal"],
    [institution.legal_representative_email, "e-mail do representante legal"],
    [institution.legal_representative_phone, "telefone do representante legal"],
    [institution.internship_sector_contact_name, "responsável pelo setor de estágio"],
    [institution.internship_sector_contact_email, "e-mail do setor de estágio"],
    [institution.internship_sector_contact_phone, "telefone do setor de estágio"],
  ];

  const missingInstitutionField = requiredInstitutionFields.find(
    ([value]) => typeof value !== "string" || value.trim().length === 0,
  );

  if (missingInstitutionField) {
    throw new Error(
      `Antes de atualizar o acordo, complete o cadastro da instituição: ${missingInstitutionField[1]}.`,
    );
  }

  const { data: viableCourseInquiries, error: viableCoursesError } = await supabase
    .from("inquiries")
    .select("id, institution_id, course_id, status, created_at")
    .eq("institution_id", institutionId)
    .in("course_id", courseIds)
    .in("status", ["viavel", "viavel_parcial", "convertida_em_acordo"])
    .order("created_at", { ascending: false });

  if (viableCoursesError) {
    throw new Error(viableCoursesError.message);
  }

  const validCourseIds = new Set(
    (viableCourseInquiries ?? [])
      .map((item) => item.course_id)
      .filter((value): value is string => Boolean(value)),
  );

  const invalidCourseIds = courseIds.filter((courseId) => !validCourseIds.has(courseId));

  if (invalidCourseIds.length > 0) {
    throw new Error(
      "Todos os cursos abrangidos precisam pertencer à instituição e possuir sondagem viável ou viável parcial.",
    );
  }

  const originInquiry = viableCourseInquiries?.[0];

  if (!originInquiry) {
    throw new Error("A instituição selecionada não possui sondagem viável para os cursos informados.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .insert({
      institution_id: institutionId,
      inquiry_id: originInquiry.id,
      status,
      legal_representative_name: institution.legal_representative_name,
      institution_responsible_name: institution.internship_sector_contact_name,
      started_at: startedAt,
      ended_at: endedAt,
      notes,
      created_by: profileId,
      reviewed_by: profileId,
    })
    .select("id")
    .single();

  if (agreementError || !agreement) {
    throw new Error(agreementError?.message ?? "Não foi possível criar o acordo.");
  }

  const agreementCoursesPayload = courseIds.map((courseId) => ({
    agreement_id: agreement.id,
    course_id: courseId,
    is_active: true,
  }));

  const { error: courseError } = await supabase
    .from("agreement_courses")
    .insert(agreementCoursesPayload);

  if (courseError) {
    throw new Error(
      `Acordo criado, mas não foi possível vincular os cursos: ${courseError.message}`,
    );
  }

  const inquiryIdsToConvert = (viableCourseInquiries ?? [])
    .map((item) => item.id)
    .filter(Boolean);

  if (inquiryIdsToConvert.length > 0) {
    await supabase
      .from("inquiries")
      .update({ status: "convertida_em_acordo" })
      .in("id", inquiryIdsToConvert);
  }

  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath("/instituicao/acordos");
  revalidatePath("/instituicao/apresentar-estudante");

  redirect("/coordenadoria/acordos-cooperacao?sucesso=1");
}

export async function updateCoordinationAgreement(formData: FormData) {
  const { supabase, profileId } = await requireCoordination();

  const id = normalizeText(formData.get("id"));
  const status = normalizeText(formData.get("status"));
  const startedAt = normalizeDate(formData.get("started_at"));
  const endedAt = normalizeDate(formData.get("ended_at"));
  const signedAt = normalizeDate(formData.get("signed_at"));
  const publishedAt = normalizeDate(formData.get("published_at"));
  const publicationReference = normalizeText(formData.get("publication_reference"));
  let documentUrl = normalizeText(formData.get("document_url"));
  const documentFile = formData.get("document_file");

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .select("id, institution_id, status, document_url")
    .eq("id", id)
    .single();

  if (agreementError || !agreement) {
    throw new Error(
      agreementError?.message ?? "Acordo não encontrado para atualização.",
    );
  }

  if (isUploadedFile(documentFile)) {
    documentUrl = await uploadAgreementDocument(supabase, id, documentFile);
  }

  const notes = normalizeText(formData.get("notes"));

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  if (!status || !allowedStatuses.includes(status)) {
    throw new Error("Situação inválida para o acordo.");
  }

  if (!startedAt) {
    throw new Error("Informe o início da vigência do acordo.");
  }

  if (!endedAt) {
    throw new Error("Informe o fim da vigência do acordo.");
  }

  validateDateRange(startedAt, endedAt);

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select(
      "id, status, name, legal_name, cnpj, email, phone, address_line, address_number, neighborhood, city, state, zip_code, legal_representative_name, legal_representative_role, legal_representative_cpf, legal_representative_email, legal_representative_phone, internship_sector_contact_name, internship_sector_contact_email, internship_sector_contact_phone",
    )
    .eq("id", agreement.institution_id)
    .single();

  if (institutionError || !institution) {
    throw new Error(
      institutionError?.message ?? "Instituição não encontrada para atualização do acordo.",
    );
  }

  if (institution.status !== "ativa") {
    throw new Error("O acordo somente pode ser mantido para instituição ativa/validada.");
  }

  const requiredInstitutionFields = [
    [institution.legal_name, "razão social"],
    [institution.cnpj, "CNPJ"],
    [institution.email, "e-mail institucional"],
    [institution.phone, "telefone institucional"],
    [institution.address_line, "endereço"],
    [institution.address_number, "número do endereço"],
    [institution.neighborhood, "bairro"],
    [institution.city, "cidade"],
    [institution.state, "UF"],
    [institution.zip_code, "CEP"],
    [institution.legal_representative_name, "representante legal"],
    [institution.legal_representative_role, "cargo do representante legal"],
    [institution.legal_representative_cpf, "CPF do representante legal"],
    [institution.legal_representative_email, "e-mail do representante legal"],
    [institution.legal_representative_phone, "telefone do representante legal"],
    [institution.internship_sector_contact_name, "responsável pelo setor de estágio"],
    [institution.internship_sector_contact_email, "e-mail do setor de estágio"],
    [institution.internship_sector_contact_phone, "telefone do setor de estágio"],
  ];

  const missingInstitutionField = requiredInstitutionFields.find(
    ([value]) => typeof value !== "string" || value.trim().length === 0,
  );

  if (missingInstitutionField) {
    throw new Error(
      `Antes de atualizar o acordo, complete o cadastro da instituição: ${missingInstitutionField[1]}.`,
    );
  }

  validateActiveAgreement({
    status,
    startedAt,
    endedAt,
    signedAt,
    publishedAt,
    publicationReference,
    documentUrl,
  });

  if (status === "ativo") {
    const { count: activeCoursesCount, error: activeCoursesError } = await supabase
      .from("agreement_courses")
      .select("id", { count: "exact", head: true })
      .eq("agreement_id", id)
      .eq("is_active", true);

    if (activeCoursesError) {
      throw new Error(activeCoursesError.message);
    }

    if (!activeCoursesCount || activeCoursesCount <= 0) {
      throw new Error("Para ativar o acordo, vincule ao menos um curso ativo.");
    }
  }

  const { error } = await supabase
    .from("cooperation_agreements")
    .update({
      status,
      legal_representative_name: institution.legal_representative_name,
      institution_responsible_name: institution.internship_sector_contact_name,
      started_at: startedAt,
      ended_at: endedAt,
      signed_at: signedAt,
      published_at: publishedAt,
      publication_reference: publicationReference,
      document_url: documentUrl,
      notes,
      reviewed_by: profileId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar o acordo: ${error.message}`);
  }

  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath("/instituicao/acordos");
  revalidatePath("/instituicao/apresentar-estudante");

  redirect("/coordenadoria/acordos-cooperacao?sucesso=2");
}

export async function cancelCoordinationAgreementEdit() {
  redirect("/coordenadoria/acordos-cooperacao");
}

function formatDraftDate(value: string | null) {
  if (!value) return "____/____/______";

  const parts = value.slice(0, 10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;

  return value;
}

function formatLongDraftDate(value: string | null) {
  if (!value) return "____ dias do mês de __________________ do ano de ______";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  const day = date.getDate();

  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  return `${day} dias do mês de ${months[date.getMonth()]} do ano de ${date.getFullYear()}`;
}

function onlyYear(value: string | null) {
  if (!value) return "______";
  return value.slice(0, 4);
}

function formatUpper(value: string | null) {
  return value ? value.toUpperCase() : "";
}

export async function generateCoordinationAgreementDraft(formData: FormData) {
  const { supabase, profileId } = await requireCoordination();

  const id = normalizeText(formData.get("id"));

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .select("id, institution_id, inquiry_id, started_at, ended_at")
    .eq("id", id)
    .single();

  if (agreementError || !agreement) {
    throw new Error(
      agreementError?.message ?? "Acordo não encontrado para geração da minuta.",
    );
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select(
      "name, legal_name, cnpj, email, phone, address_line, address_number, address_complement, neighborhood, city, state, zip_code, legal_representative_name, legal_representative_role, legal_representative_cpf, legal_representative_rg, legal_representative_rg_issuer, legal_representative_email, legal_representative_phone, internship_sector_contact_name, internship_sector_contact_email, internship_sector_contact_phone",
    )
    .eq("id", agreement.institution_id)
    .single();

  if (institutionError || !institution) {
    throw new Error(
      institutionError?.message ?? "Instituição não encontrada para geração da minuta.",
    );
  }

  const { data: agreementCourses, error: coursesError } = await supabase
    .from("agreement_courses")
    .select("course_id, courses(name, level, workload_required)")
    .eq("agreement_id", id)
    .eq("is_active", true);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const courseNames = (agreementCourses ?? [])
    .map((item: any) => item.courses?.name)
    .filter(Boolean);

  if (courseNames.length === 0) {
    throw new Error("Não há curso ativo vinculado ao acordo para gerar a minuta.");
  }

  const institutionName = institution.legal_name ?? institution.name;
  const institutionState = formatUpper(institution.state);

  const institutionAddress = [
    institution.address_line,
    institution.address_number ? `nº ${institution.address_number}` : null,
    institution.address_complement,
    institution.neighborhood,
    institution.city,
    institutionState,
    institution.zip_code ? `CEP ${institution.zip_code}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const representativeDocument = [
    institution.legal_representative_rg
      ? `portador da cédula de identidade nº ${institution.legal_representative_rg}${
          institution.legal_representative_rg_issuer
            ? ` ${institution.legal_representative_rg_issuer}`
            : ""
        }`
      : null,
    institution.legal_representative_cpf
      ? `inscrito no CPF nº ${institution.legal_representative_cpf}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const coursesText = courseNames.map((course) => `- ${course}`).join("\n");

  const draftText = `ACORDO DE COOPERAÇÃO TÉCNICA ____/${onlyYear(agreement.started_at)}

ACORDO DE COOPERAÇÃO TÉCNICA QUE ENTRE SI CELEBRAM O MUNICÍPIO DE MIRASSOL D'OESTE/MT E ${formatUpper(institutionName)} PARA OS FINS QUE ESPECIFICAM.

Aos ${formatLongDraftDate(agreement.started_at)}, o MUNICÍPIO DE MIRASSOL D'OESTE/MT, pessoa jurídica de direito público interno, inscrito no CNPJ sob o nº 03.755.477/0001-75, com sede administrativa na Rua Antônio Tavares, nº 3310, Centro, nesta cidade de Mirassol d'Oeste/MT, neste ato representado pelo Prefeito Municipal, Sr. HÉCTOR ALVARES BEZERRA, brasileiro, residente e domiciliado nesta cidade, doravante denominado MUNICÍPIO, e de outro lado ${institutionName}, inscrita no CNPJ sob nº ${institution.cnpj}, com sede administrativa em ${institutionAddress}, neste ato representada por ${institution.legal_representative_name}, ${institution.legal_representative_role}${representativeDocument ? `, ${representativeDocument}` : ""}, doravante denominada INSTITUIÇÃO DE ENSINO, resolvem celebrar o presente ACORDO DE COOPERAÇÃO TÉCNICA, conforme as normas contidas na Lei Federal nº 11.788/2008 e na Lei Municipal nº 1.409/2017, mediante as disposições expressas nas cláusulas seguintes:

1. CLÁUSULA PRIMEIRA - DO OBJETO

1.1. Constitui objeto do presente instrumento a mútua cooperação técnica e pedagógica entre os partícipes, para a concessão de vagas para estágio supervisionado obrigatório ou não obrigatório aos estudantes regularmente matriculados nos cursos mantidos pela INSTITUIÇÃO DE ENSINO, devidamente autorizados ou reconhecidos pelo Ministério da Educação – MEC, observada a disponibilidade das unidades da Administração Pública Municipal.

1.2. Ficam abrangidos pelo presente Acordo de Cooperação Técnica, inicialmente, os seguintes cursos:

${coursesText}

1.3. A inclusão de novos cursos dependerá de prévia análise da Coordenadoria competente, do cadastro regular do curso no sistema e da existência de campo de estágio compatível no âmbito municipal.

2. CLÁUSULA SEGUNDA - DO VÍNCULO EMPREGATÍCIO

2.1. O estágio não gerará vínculo empregatício de qualquer natureza com a Prefeitura do Município de Mirassol d'Oeste/MT ou suas Unidades Administrativas, conforme previsto na legislação federal e municipal aplicável.

3. CLÁUSULA TERCEIRA - DOS RECURSOS FINANCEIROS

3.1. Este Acordo de Cooperação Técnica não visa ao repasse de recursos financeiros entre os partícipes, tendo em vista o seu caráter eminentemente didático-pedagógico.

Parágrafo Único – A INSTITUIÇÃO DE ENSINO responsabilizar-se-á, quando aplicável, pelo fornecimento dos recursos materiais, acadêmicos e documentos necessários à regular apresentação e acompanhamento dos estagiários, observadas as normas estabelecidas pelo Município e por suas Unidades Administrativas.

4. CLÁUSULA QUARTA - DO ESTÁGIO

4.1. A Prefeitura do Município de Mirassol d'Oeste/MT poderá conceder estágio a estudantes regularmente matriculados e efetivamente frequentando os cursos oferecidos pela INSTITUIÇÃO DE ENSINO, desde que as atividades sejam compatíveis com a área de formação do estudante.

4.2. Os estágios serão realizados nas unidades da Administração Pública Municipal que apresentem compatibilidade com a área de formação do estudante e disponham de estrutura e supervisor técnico habilitado, conforme manifestação da Secretaria ou Unidade competente.

4.3. A existência do presente Acordo de Cooperação Técnica não assegura, por si só, a disponibilização automática de vagas, ficando cada estágio condicionado à análise de viabilidade, disponibilidade, documentação e autorização específica.

5. CLÁUSULA QUINTA - DA FORMALIZAÇÃO DO ESTÁGIO

5.1. A concessão do estágio estará condicionada à análise e manifestação da Secretaria ou Unidade competente quanto à disponibilidade de vaga, estrutura, atividades compatíveis e supervisão.

5.2. A formalização da concessão do estágio efetivar-se-á mediante Termo de Compromisso de Estágio a ser firmado entre a INSTITUIÇÃO DE ENSINO, o estudante e o Município de Mirassol d'Oeste/MT, com interveniência obrigatória das partes responsáveis.

Parágrafo Único – O estagiário obrigar-se-á, mediante Termo de Compromisso, a cumprir as condições fixadas para o estágio, assim como as normas de trabalho estabelecidas pela Prefeitura e suas Unidades Administrativas, especialmente aquelas relacionadas à conduta, sigilo, proteção de dados e acesso às informações.

6. CLÁUSULA SEXTA - DA DURAÇÃO DO ESTÁGIO

6.1. A duração dos estágios observará o prazo estabelecido no respectivo Termo de Compromisso, não podendo exceder 02 (dois) anos, exceto quando se tratar de estagiário com deficiência, nos termos da legislação aplicável.

7. CLÁUSULA SÉTIMA - DA JORNADA DE TRABALHO

7.1. A jornada de estágio será definida no Termo de Compromisso, dependendo da disponibilidade da unidade municipal, devendo ser cumprida em horário compatível com as atividades acadêmicas do estudante.

7.2. A jornada não poderá ultrapassar 06 (seis) horas diárias e 30 (trinta) horas semanais, sendo vedada a permanência de estagiários como voluntários ou em horários diversos daqueles formalmente autorizados.

Parágrafo Único – É assegurado ao estagiário, sempre que o estágio tenha duração igual ou superior a 01 (um) ano, período de recesso de 30 (trinta) dias, a ser gozado preferencialmente durante as férias escolares, observada a legislação aplicável.

8. CLÁUSULA OITAVA - DO ACOMPANHAMENTO DO ESTÁGIO

8.1. O estágio será desenvolvido sob orientação de professor orientador indicado pela INSTITUIÇÃO DE ENSINO e sob supervisão de servidor da Prefeitura com formação ou experiência na área do estágio.

8.2. A supervisão municipal será definida pela unidade concedente, de acordo com a compatibilidade das atividades, disponibilidade administrativa e capacidade de acompanhamento.

9. CLÁUSULA NONA - DAS OBRIGAÇÕES

9.1. São obrigações da INSTITUIÇÃO DE ENSINO:

9.1.1. Celebrar o Termo de Compromisso de Estágio com o estudante ou com seu representante ou assistente legal, quando for o caso, e com o Município, indicando as condições de adequação do estágio à proposta pedagógica do curso, à etapa e modalidade da formação escolar do estudante e ao horário e calendário escolar;

9.1.2. Avaliar, quando necessário, as instalações disponibilizadas pelo Município e sua adequação à formação cultural e profissional do estudante;

9.1.3. Indicar professor orientador da área a ser desenvolvida no estágio, responsável pelo acompanhamento e avaliação das atividades do estagiário;

9.1.4. Exigir do estudante a apresentação periódica de relatório de atividades, em prazo não superior a 06 (seis) meses;

9.1.5. Zelar pelo cumprimento do Termo de Compromisso, adotando as providências cabíveis em caso de descumprimento de suas normas;

9.1.6. Elaborar normas complementares e instrumentos de avaliação dos estágios de seus estudantes;

9.1.7. Comunicar ao Município, no início do período letivo, as datas de realização de avaliações escolares ou acadêmicas, quando houver impacto na jornada de estágio;

9.1.8. Promover o ajuste das condições de estágio definidas pela Instituição de Ensino com a disponibilidade do Município, indicando as principais atividades a serem desenvolvidas pelos estagiários e observando sua compatibilidade com programas, currículos escolares e diretrizes educacionais;

9.1.9. Encaminhar ao Município os estudantes interessados nas oportunidades de estágio, observando os procedimentos definidos pela Coordenadoria competente;

9.1.10. Preparar e encaminhar a documentação legal referente ao estágio, incluindo Termo de Compromisso de Estágio, documentos pessoais, comprovação de vínculo acadêmico, carta de apresentação, apólice de seguro contra acidentes pessoais e demais documentos exigidos pelo Município;

9.1.11. Comunicar ao Município ou à Unidade Administrativa em que o estagiário estiver atuando qualquer irregularidade na situação escolar do estudante;

9.1.12. Contratar, em favor dos estagiários, seguro contra acidentes pessoais antes de iniciada a prática de estágio, cuja apólice seja compatível com valores de mercado e permaneça vigente durante todo o período de estágio;

9.1.13. Encaminhar ao Município, quando solicitado, informações referentes à programação de estágios, para fins de organização e acompanhamento;

9.1.14. Apresentar o estagiário no campo de estágio por intermédio de responsável da área respectiva, portando os documentos necessários, sem os quais o estagiário não poderá iniciar suas atividades;

9.1.15. Acompanhar e avaliar o desenvolvimento do estágio;

9.1.16. Manter comunicação direta com os responsáveis pelos setores da Prefeitura e suas Unidades Administrativas para tomar ciência do desempenho das atividades exercidas pelo estagiário;

9.1.17. Fornecer, sempre que solicitado pelo Município, informações a respeito do estudante;

9.1.18. Tomar as providências cabíveis sempre que algum estagiário se envolver em desvio de conduta ou desrespeitar as normas do estágio;

9.1.19. Responsabilizar-se, na forma da lei, por danos causados por seus estudantes, desde que devidamente comprovada a responsabilidade;

9.1.20. Respeitar as normas administrativas existentes;

9.1.21. Anuir e executar o presente Acordo de Cooperação Técnica com estrita observância da legislação federal, municipal e das normas regulamentares aplicáveis;

9.1.22. Encaminhar a documentação necessária por representante ou responsável indicado pela INSTITUIÇÃO DE ENSINO, ficando vedado o envio informal de documentos diretamente pelo estudante quando não autorizado pelo Município.

9.2. São obrigações da Prefeitura e suas Unidades Administrativas:

9.2.1. Celebrar Acordo de Cooperação Técnica com a instituição de ensino, zelando por seu cumprimento;

9.2.2. Ofertar instalações que tenham condições de proporcionar ao estudante atividades de aprendizagem social, profissional e cultural, conforme disponibilidade administrativa;

9.2.3. Assegurar que o estágio, como ato educativo escolar supervisionado, tenha acompanhamento efetivo por supervisor da parte concedente, observado o critério de conveniência e capacidade da Administração Pública;

9.2.4. Entregar termo ou relatório de realização do estágio com indicação resumida das atividades desenvolvidas, dos períodos e da avaliação de desempenho do estagiário, quando cabível;

9.2.5. Manter à disposição da fiscalização os documentos que comprovem a relação de estágio;

9.2.6. Encaminhar à instituição de ensino, quando exigido, relatório de atividades com vista obrigatória ao estagiário;

9.2.7. Cumprir as responsabilidades assumidas no presente Acordo de Cooperação Técnica e nos Termos de Compromisso de Estágio celebrados;

9.2.8. Solicitar ao estagiário ou à instituição de ensino, a qualquer tempo, documentos comprobatórios da regularidade da situação escolar;

9.2.9. Informar à INSTITUIÇÃO DE ENSINO, de imediato, sempre que identificada irregularidade na situação escolar de qualquer estagiário ou quando ocorrer rescisão antecipada do Termo de Compromisso de Estágio;

9.2.10. Participar da sistemática de acompanhamento, supervisão e avaliação dos estágios, fornecendo dados à INSTITUIÇÃO DE ENSINO, quando solicitado e quando compatível com as atribuições municipais;

9.2.11. Informar os locais, horários, normas internas e responsáveis pelas atividades de estágio, de acordo com os Termos de Compromisso firmados;

9.2.12. Disponibilizar espaço físico na Unidade onde serão realizadas as atividades de estágio, de acordo com a disponibilidade e as condições de cada setor;

9.2.13. Proporcionar ao estudante experiências válidas para a elaboração de relatórios acadêmicos e conclusão do estágio, ressalvada a autonomia científica e pedagógica da instituição de ensino;

9.2.14. Comunicar à INSTITUIÇÃO DE ENSINO, em tempo hábil, possíveis alterações nas condições de estágio pactuadas no Termo de Compromisso.

9.3. Compete ao estagiário:

9.3.1. Firmar Termo de Compromisso para a prática das atividades de estágio, declarando conhecer as normas e critérios para sua realização;

9.3.2. Apresentar-se ao local de estágio devidamente identificado, quando exigido;

9.3.3. Realizar o estágio em conformidade com a legislação de ensino e com as normas, rotinas, regulamentos e procedimentos da Prefeitura e suas Unidades Administrativas;

9.3.4. Manter comportamento ético, agindo com discrição e respeito aos usuários, servidores e demais estagiários;

9.3.5. Solicitar orientação aos servidores responsáveis sempre que necessário;

9.3.6. Cumprir fielmente os horários de chegada e saída do campo de estágio.

10. CLÁUSULA DÉCIMA - DA RESCISÃO

10.1. O presente Acordo de Cooperação Técnica poderá ser rescindido, a qualquer tempo:

A) Automaticamente ao término do prazo de vigência;

B) Em caso fortuito ou de força maior, devidamente comprovado, que impeça a sua execução;

C) De comum acordo entre as partes;

D) Unilateralmente, por interesse de qualquer das partes, mediante comunicação prévia com antecedência mínima de 30 (trinta) dias, sem direito a indenização.

Parágrafo Único – Em qualquer hipótese de rescisão, fica garantida a conclusão dos planos de trabalho em execução à época da rescisão, quando possível e desde que não haja prejuízo ao interesse público.

11. CLÁUSULA DÉCIMA PRIMEIRA - DO PRAZO

11.1. O presente Acordo de Cooperação Técnica vigorará de ${formatDraftDate(agreement.started_at)} a ${formatDraftDate(agreement.ended_at)}, podendo ser prorrogado mediante Termo Aditivo, observada a legislação aplicável e o interesse público.

12. CLÁUSULA DÉCIMA SEGUNDA - DA EXECUÇÃO

12.1. As partes praticarão, reciprocamente, os atos necessários à efetiva execução das presentes disposições por intermédio dos seus representantes legais ou de pessoa regularmente designada.

12.2. Para fins de comunicação operacional relacionada aos estágios, a INSTITUIÇÃO DE ENSINO indica como responsável ${institution.internship_sector_contact_name}, e-mail ${institution.internship_sector_contact_email}, telefone ${institution.internship_sector_contact_phone}.

13. CLÁUSULA DÉCIMA TERCEIRA - DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)

13.1. As partes comprometem-se a cumprir integralmente as disposições da Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais – LGPD), bem como demais normas aplicáveis à proteção de dados pessoais.

13.2. Os dados pessoais a que as partes tiverem acesso em razão deste Acordo deverão ser utilizados exclusivamente para a execução das atividades relacionadas ao estágio, sendo vedado seu uso para finalidade diversa.

13.3. As partes deverão adotar medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.

13.4. O estagiário, a instituição de ensino e os servidores envolvidos comprometem-se a manter sigilo sobre as informações pessoais e sensíveis a que tiverem acesso durante a execução do estágio.

13.5. Em caso de incidente envolvendo dados pessoais, a parte responsável deverá comunicar a outra parte, adotando as providências necessárias para mitigar os danos, nos termos da legislação vigente.

14. CLÁUSULA DÉCIMA QUARTA - DOS CASOS OMISSOS

14.1. O presente Acordo de Cooperação Técnica será executado sob a égide da Lei Municipal nº 1.409/2017 e alterações posteriores, da Lei Federal nº 11.788/2008 e demais normas aplicáveis.

14.2. Os casos omissos e dúvidas decorrentes de fatos não contemplados no presente instrumento serão dirimidos segundo os princípios jurídicos aplicáveis, preservando-se o interesse público.

15. CLÁUSULA DÉCIMA QUINTA - DO FORO

15.1. Fica eleito o Foro da Comarca de Mirassol d'Oeste/MT para dirimir quaisquer dúvidas oriundas do presente Acordo de Cooperação Técnica.

16. CLÁUSULA DÉCIMA SEXTA - DA PUBLICAÇÃO

16.1. O presente instrumento será publicado no Diário Oficial dos Municípios de Mato Grosso.

Para firmeza e como prova do acordado, é lavrado o presente Acordo de Cooperação Técnica, o qual, depois de lido e achado conforme, será assinado pelas partes, dele sendo extraídas quantas cópias forem necessárias para seu fiel cumprimento, todas de igual teor e forma.

Mirassol d'Oeste/MT, ____ de __________________ de ______.


HÉCTOR ALVARES BEZERRA
Prefeito Municipal


${formatUpper(institution.legal_representative_name)}
${institution.legal_representative_role}
${formatUpper(institutionName)}
`;

  const { error: updateError } = await supabase
    .from("cooperation_agreements")
    .update({
      draft_text: draftText,
      draft_generated_at: new Date().toISOString(),
      draft_generated_by: profileId,
      status: "minuta_gerada",
      reviewed_by: profileId,
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(`Não foi possível salvar a minuta: ${updateError.message}`);
  }

  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath(`/coordenadoria/acordos-cooperacao/${id}`);

  redirect(`/coordenadoria/acordos-cooperacao/${id}`);
}

