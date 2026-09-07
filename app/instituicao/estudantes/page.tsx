import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionStudentsData } from "@/lib/queries/institution-students";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string | null) {
  if (!status) {
    return "Aguardando autorização";
  }

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
    aguardando_unidade: "Aguardando unidade",
    aguardando_supervisor: "Aguardando supervisor",
    pronto_para_autorizar: "Pronto para autorizar",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string | null) {
  if (status === "autorizado") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (
    status === "apto_para_autorizacao" ||
    status === "documentos_validados" ||
    status === "pronto_para_autorizar"
  ) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (
    status === "apresentado" ||
    status === "em_analise" ||
    status === "pendente_correcao" ||
    !status
  ) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (["indeferido", "cancelado", "suspenso", "encerrado"].includes(status)) {
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

export default async function InstituicaoEstudantesPage() {
  const { institution, students, error } = await getInstitutionStudentsData();

  const total = students.length;
  const emAnalise = students.filter((item) =>
    ["apresentado", "em_analise", "pendente_correcao"].includes(
      item.presentation_status,
    ),
  ).length;
  const prontos = students.filter((item) =>
    ["documentos_validados", "apto_para_autorizacao"].includes(
      item.presentation_status,
    ),
  ).length;
  const autorizados = students.filter(
    (item) => item.authorization_status === "autorizado",
  ).length;

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Estudantes"
      description="Acompanhe os estudantes apresentados, a análise da Coordenadoria e as autorizações de início emitidas."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/apresentar-estudante"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Apresentar estudante
        </Link>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Instituição
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {institution?.name ?? "Instituição não identificada"}
        </p>
      </section>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Apresentados
          </p>
          <p className="text-xl font-black text-slate-950">{total}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Em análise
          </p>
          <p className="text-xl font-black text-amber-700">{emAnalise}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Prontos
          </p>
          <p className="text-xl font-black text-sky-700">{prontos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Autorizados
          </p>
          <p className="text-xl font-black text-teal-700">{autorizados}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Estudantes apresentados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            A autorização de início somente aparece quando emitida formalmente pela Coordenadoria.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estudante apresentado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Período</th>
                  <th className="px-3 py-2 font-black">Carga</th>
                  <th className="px-3 py-2 font-black">Análise</th>
                  <th className="px-3 py-2 font-black">Autorização</th>
                  <th className="px-3 py-2 font-black">Início</th>
                  <th className="px-3 py-2 font-black">Supervisor</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">
                        {student.student_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {student.student_email ?? "E-mail não informado"}
                      </p>
                      {student.student_cpf && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          CPF: {student.student_cpf}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {student.course_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {student.municipal_unit_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <p>{student.intended_period ?? "-"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {student.intended_schedule ?? "-"}
                      </p>
                    </td>

                    <td className="px-3 py-2 align-top font-bold text-slate-800">
                      {formatNumber(student.required_workload)}h
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.presentation_status,
                        )}`}
                      >
                        {statusLabel(student.presentation_status)}
                      </span>

                      {student.review_notes && (
                        <details className="mt-1 max-w-[220px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Observação
                          </summary>
                          <p className="mt-1 leading-5">{student.review_notes}</p>
                        </details>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.authorization_status,
                        )}`}
                      >
                        {statusLabel(student.authorization_status)}
                      </span>

                      {student.authorization_notes && (
                        <details className="mt-1 max-w-[220px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Observação
                          </summary>
                          <p className="mt-1 leading-5">
                            {student.authorization_notes}
                          </p>
                        </details>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <p>{formatDate(student.authorized_start_date)}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        até {formatDate(student.authorized_end_date)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {student.authorized_schedule ?? "-"}
                      </p>
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-700">
                      {student.supervisor_name ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          Esta tela é de acompanhamento. A apresentação de novos estudantes deve
          ser feita pelo botão “Apresentar estudante”.
        </div>
      </section>
    </SystemShell>
  );
}
