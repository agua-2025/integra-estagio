import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getStudentAreaData } from "@/lib/queries/student-area";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) return "Não informada";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatStatus(value: string | null | undefined) {
  if (!value) return "Não informado";
  const labels: Record<string, string> = {
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
    autorizado: "Autorizado",
    aguardando_unidade: "Aguardando unidade",
    aguardando_supervisor: "Aguardando supervisor",
    pronto_para_autorizar: "Pronto para autorizar",
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

function Field({
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

export default async function MeuEstagioPage() {
  const data = await getStudentAreaData();

  const {
    student,
    institution,
    course,
    unit,
    internship,
    authorization,
    presentation,
    occurrences,
    finalReport,
    error,
  } = data;

  const startDate =
    internship?.start_date ??
    authorization?.authorized_start_date ??
    null;

  const endDate =
    internship?.end_date ??
    authorization?.authorized_end_date ??
    null;

  const supervisor =
    internship?.supervisor_name ??
    authorization?.supervisor_name ??
    null;

  const schedule =
    internship?.schedule ??
    authorization?.authorized_schedule ??
    presentation?.intended_schedule ??
    null;

  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Meu Estágio"
      description="Consulte os dados do seu estágio, vínculo, jornada e acompanhamento."
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
        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Não foi possível localizar os dados do estagiário.
        </section>
      ) : (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Identificação do estágio
                </h2>
                <p className="text-xs text-slate-500">
                  Informações registradas no Integra Estágio
                </p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
                {formatStatus(internship?.status ?? authorization?.status ?? presentation?.status)}
              </span>
            </div>

            <div className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
              <Field label="Estagiário" value={student.full_name} />
              <Field label="Instituição" value={institution?.name ?? "Não informada"} />
              <Field label="Curso" value={course?.name ?? "Não informado"} />
              <Field label="Matrícula acadêmica" value={student.academic_registration ?? "Não informada"} />
              <Field label="Unidade municipal" value={unit?.name ?? "Ainda não definida"} />
              <Field label="Supervisor" value={supervisor ?? "Não informado"} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">
                Período e jornada
              </h2>
            </div>

            <div className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
              <Field label="Início autorizado" value={formatDate(startDate)} />
              <Field label="Previsão de término" value={formatDate(endDate)} />
              <Field label="Jornada" value={schedule ?? "Não informada"} />
              <Field
                label="Carga horária prevista"
                value={
                  presentation?.required_workload != null
                    ? `${presentation.required_workload} horas`
                    : "Não informada"
                }
              />
              <Field label="Situação do estágio" value={formatStatus(internship?.status)} />
              <Field
                label="Carga horária concluída"
                value={
                  finalReport?.completed_workload != null
                    ? `${finalReport.completed_workload} horas`
                    : "Sem relatório final registrado"
                }
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">
                Acompanhamento
              </h2>
            </div>

            <div className="p-4">
              <p className="mb-3 text-sm text-slate-600">
                Últimas ocorrências registradas no estágio.
              </p>

              {occurrences.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  Nenhuma ocorrência registrada.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {occurrences.map((item) => (
                    <div key={item.id} className="px-3 py-3">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatStatus(item.occurrence_type)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(item.occurrence_date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Documentação do estágio
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Consulte os documentos registrados e sua situação.
                </p>
              </div>
              <Link
                href="/estagiario/documentos"
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"
              >
                Ver documentos
              </Link>
            </div>
          </section>
        </div>
      )}
    </SystemShell>
  );
}
