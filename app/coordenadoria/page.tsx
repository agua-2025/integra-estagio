import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Sondagens",
    value: "0",
    description: "Consultas recebidas para análise de campo.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Processos aguardando documento ou manifestação.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos em análise, assinatura ou vigência.",
  },
  {
    label: "Estágios",
    value: "0",
    description: "Estágios autorizados ou em acompanhamento.",
  },
];

const actions = [
  {
    title: "Analisar sondagens",
    description:
      "Receba consultas de instituições e encaminhe às unidades municipais para manifestação sobre disponibilidade de campo.",
    status: "Entrada",
  },
  {
    title: "Consolidar viabilidade",
    description:
      "Organize as respostas das unidades e informe se há possibilidade total, parcial ou inexistente.",
  },
  {
    title: "Controlar Acordos de Cooperação",
    description:
      "Analise pedidos, gere minutas, acompanhe assinaturas, registre publicações e controle vigências.",
  },
  {
    title: "Validar documentos individuais",
    description:
      "Confira carta de apresentação, termo de compromisso, seguro e demais documentos do estudante.",
  },
  {
    title: "Autorizar início",
    description:
      "Libere o início do estágio somente após validação completa da documentação e indicação da unidade.",
  },
  {
    title: "Relatórios e auditoria",
    description:
      "Acompanhe estágios em andamento, pendências, encerramentos e histórico das movimentações.",
  },
];

export default function CoordenadoriaAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Coordenadoria"
      title="Controle central do fluxo"
      description="Ambiente responsável por analisar solicitações, consultar unidades, controlar acordos, validar documentos e autorizar o início dos estágios."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Configurações principais
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Organize as bases do sistema antes de liberar os fluxos para as instituições e unidades.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/coordenadoria/campos-estagio"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                  Campos de Estágio
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Cadastre, edite, publique ou suspenda áreas e unidades que poderão receber estágio curricular supervisionado.
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Configurar
              </span>
            </div>
          </Link>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-slate-950">
              Instituições e cursos
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Futuramente esta área reunirá instituições cooperadas, cursos, orientadores e documentos institucionais.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Gestão do processo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe as etapas sob responsabilidade da Coordenadoria.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
