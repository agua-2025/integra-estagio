import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Recebidos",
    value: "0",
    description: "Estudantes apresentados por instituições.",
  },
  {
    label: "Pendentes",
    value: "0",
    description: "Apresentações aguardando análise documental.",
  },
  {
    label: "Correção",
    value: "0",
    description: "Processos devolvidos para complementação.",
  },
  {
    label: "Aptos",
    value: "0",
    description: "Estudantes prontos para autorização de início.",
  },
];

const students = [
  {
    name: "Estudante Exemplo 01",
    institution: "Faculdade ou Universidade Exemplo",
    course: "Direito",
    status: "Aguardando análise",
    agreement: "Em conferência",
    field: "Jurídico / Administração",
    documents: "4 documentos",
    receivedAt: "Hoje",
  },
  {
    name: "Estudante Exemplo 02",
    institution: "Instituição Cooperada Exemplo",
    course: "Serviço Social",
    status: "Correção solicitada",
    agreement: "Ativo",
    field: "Assistência Social",
    documents: "1 pendência",
    receivedAt: "Ontem",
  },
  {
    name: "Estudante Exemplo 03",
    institution: "Centro de Ensino Técnico Exemplo",
    course: "Técnico em Administração",
    status: "Apto para autorização",
    agreement: "Ativo",
    field: "Administração e Gestão Pública",
    documents: "Completo",
    receivedAt: "25/05/2026",
  },
  {
    name: "Estudante Exemplo 04",
    institution: "Faculdade ou Universidade Exemplo",
    course: "Administração",
    status: "Aguardando análise",
    agreement: "Ativo",
    field: "Gestão Pública",
    documents: "5 documentos",
    receivedAt: "24/05/2026",
  },
];

const filters = [
  "Todos",
  "Aguardando análise",
  "Correção solicitada",
  "Aptos",
  "Autorizados",
];

function statusClass(status: string) {
  if (status === "Correção solicitada") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "Apto para autorização") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function CoordenadoriaEstudantesPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Estudantes Apresentados"
      description="Analise estudantes encaminhados pelas instituições, confira documentos individuais e prepare a autorização de início do estágio."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <button
          type="button"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Filtrar pendentes
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Apresentações recebidas
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Listagem compacta para análise documental, conferência do acordo,
              campo pretendido e autorização de início.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Estudante</th>
                  <th className="px-5 py-4 font-bold">Instituição</th>
                  <th className="px-5 py-4 font-bold">Curso</th>
                  <th className="px-5 py-4 font-bold">Campo</th>
                  <th className="px-5 py-4 font-bold">Acordo</th>
                  <th className="px-5 py-4 font-bold">Documentos</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Recebido</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={`${student.name}-${student.course}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">{student.name}</p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {student.institution}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {student.course}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {student.field}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {student.agreement}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {student.documents}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          student.status,
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {student.receivedAt}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-800"
                        >
                          Correção
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                        >
                          Autorizar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
            Na versão com banco de dados, esta listagem terá busca, filtros por
            instituição, curso, status, período e paginação.
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Conferência obrigatória"
          description="A apresentação do estudante não autoriza início automático. A Coordenadoria deverá validar documentos e vínculo com acordo ativo."
          status="Regra"
        />
        <ActionCard
          title="Correção documental"
          description="Quando houver pendência, o processo poderá ser devolvido para complementação pela instituição de ensino."
        />
        <ActionCard
          title="Autorização de início"
          description="Somente após validação completa a Coordenadoria poderá liberar o estudante para iniciar as atividades na unidade."
        />
      </section>
    </SystemShell>
  );
}
