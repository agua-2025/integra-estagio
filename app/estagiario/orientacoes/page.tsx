import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getStudentAreaData } from "@/lib/queries/student-area";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const orientationItems = [
  {
    title: "Apresentação na unidade",
    description:
      "O estagiário deverá apresentar-se na unidade municipal indicada, observando a data de início e as orientações da Coordenadoria.",
  },
  {
    title: "Cumprimento da jornada",
    description:
      "Devem ser respeitados os horários, a carga horária e as condições previstas no Termo de Compromisso e na autorização.",
  },
  {
    title: "Supervisão das atividades",
    description:
      "As atividades deverão ser acompanhadas pelo supervisor designado, observando a compatibilidade com o curso e o plano de atividades.",
  },
  {
    title: "Comunicação de ocorrências",
    description:
      "Ausências, alterações de horários ou outras situações relevantes deverão ser comunicadas à unidade e à instituição de ensino.",
  },
  {
    title: "Alteração das condições",
    description:
      "Mudanças de unidade, período, jornada ou demais condições do estágio devem ser previamente submetidas à análise competente.",
  },
  {
    title: "Encerramento do estágio",
    description:
      "A conclusão regular depende do cumprimento da carga horária prevista e dos procedimentos de acompanhamento e encerramento.",
  },
];

const documentLabels: Record<string, string> = {
  carta_apresentacao: "Carta de apresentação",
  termo_compromisso: "Termo de Compromisso",
  seguro: "Seguro de acidentes pessoais",
  apolice_seguro: "Apólice de seguro",
  comprovante_matricula: "Comprovante de matrícula",
  documento_identificacao: "Documento de identificação",
};

const statusLabels: Record<string, string> = {
  aguardando_inicio: "Aguardando início",
  em_andamento: "Em andamento",
  autorizado: "Autorizado",
  pronto_para_autorizar: "Pronto para autorizar",
  aguardando_unidade: "Aguardando unidade",
  aguardando_supervisor: "Aguardando supervisor",
  suspenso: "Suspenso",
  cancelado: "Cancelado",
  encerrado: "Encerrado",
  pendente: "Pendente",
  enviado: "Enviado",
  em_analise: "Em análise",
  validado: "Validado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  pendente_correcao: "Correção solicitada",
};

function formatStatus(value: string | null | undefined) {
  if (!value) return "Não informado";
  return statusLabels[value] ?? value.replaceAll("_", " ");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Não informado";

  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function DataField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}

export default async function EstagiarioOrientacoesPage() {
  const {
    student,
    institution,
    course,
    unit,
    authorization,
    internship,
    presentation,
    documents,
    error,
  } = await getStudentAreaData();

  const status =
    internship?.status ??
    authorization?.status ??
    presentation?.status ??
    null;

  const unitName = unit?.name ?? "Ainda não definida";

  const supervisor =
    internship?.supervisor_name ??
    authorization?.supervisor_name ??
    "Não informado";

  const startDate =
    internship?.start_date ??
    authorization?.authorized_start_date ??
    null;

  const endDate =
    internship?.end_date ??
    authorization?.authorized_end_date ??
    null;

  const schedule =
    internship?.schedule ??
    authorization?.authorized_schedule ??
    presentation?.intended_schedule ??
    "Não informado";

  const hasAuthorization =
    authorization?.status === "autorizado" &&
    !["cancelado", "suspenso"].includes(internship?.status ?? "");

  const isFinished = internship?.status === "encerrado";

  const documentCount = documents.length;

  const validatedCount = documents.filter(
    (item) => ["validado", "aprovado"].includes(item.status)
  ).length;

  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Orientações do Estágio"
      description="Consulte as condições registradas e as orientações para realização das atividades."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/estagiario"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar ao painel
        </Link>

        <Link
          href="/estagiario/estagio"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"
        >
          Ver meu estágio
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!student ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Não foi possível localizar as informações do estagiário.
        </section>
      ) : (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Informações do estágio
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dados registrados no Integra Estágio
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatStatus(status)}
              </span>
            </div>

            <div className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
              <DataField label="Estagiário" value={student.full_name} />
              <DataField
                label="Instituição"
                value={institution?.name ?? "Não informada"}
              />
              <DataField
                label="Curso"
                value={course?.name ?? "Não informado"}
              />
              <DataField label="Unidade municipal" value={unitName} />
              <DataField label="Supervisor" value={supervisor} />
              <DataField
                label="Início autorizado"
                value={formatDate(startDate)}
              />
              <DataField
                label="Previsão de término"
                value={formatDate(endDate)}
              />
              <DataField label="Jornada" value={schedule} />
            </div>
          </section>

          <section
            className={
              isFinished
                ? "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                : hasAuthorization
                  ? "rounded-xl border border-teal-200 bg-teal-50 px-4 py-3"
                  : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
            }
          >
            <h2 className="text-sm font-bold text-slate-900">
              {isFinished
                ? "Estágio encerrado"
                : hasAuthorization
                  ? "Autorização de início registrada"
                  : "Atenção às condições de início"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-700">
              {isFinished
                ? "O estágio consta como encerrado no sistema. Consulte as informações de acompanhamento e encerramento em Meu Estágio."
                : hasAuthorization
                  ? "Existe autorização registrada pela Coordenadoria. O início e a execução das atividades devem observar as datas e condições autorizadas."
                  : "O início das atividades depende de autorização formal da Coordenadoria. A apresentação ou análise do estágio, isoladamente, não autoriza seu início."}
            </p>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Situação dos documentos
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {documentCount} registro(s), {validatedCount} validado(s)
                </p>
              </div>

              <Link
                href="/estagiario/documentos"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"
              >
                Ver documentos
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-500">
                Nenhum documento registrado para esta apresentação.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                  >
                    <span className="text-sm text-slate-800">
                      {documentLabels[document.document_type] ??
                        document.document_type.replaceAll("_", " ")}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {formatStatus(document.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">
                Orientações principais
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Procedimentos e cuidados durante a realização do estágio
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {orientationItems.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                    {index + 1}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </SystemShell>
  );
}
