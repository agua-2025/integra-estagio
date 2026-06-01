import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Nova consulta",
    value: "1º passo",
    description: "A instituição informa o curso e a necessidade de campo.",
  },
  {
    label: "Análise",
    value: "Município",
    description: "A Coordenadoria encaminha a solicitação às unidades.",
  },
  {
    label: "Resposta",
    value: "Viabilidade",
    description: "A instituição recebe retorno sobre possibilidade de campo.",
  },
];

const formPreview = [
  "Instituição de ensino",
  "Curso pretendido",
  "Quantidade estimada de estudantes",
  "Carga horária obrigatória",
  "Período pretendido",
  "Área ou unidade de interesse",
  "Observações sobre exigências do curso",
];

export default function ConsultarCampoPage() {
  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Consultar Campo de Estágio"
      description="Informe a necessidade da instituição para que o Município verifique a disponibilidade de campo junto às unidades municipais."
    >
      <div className="mb-6">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Dados da consulta
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Nesta primeira versão, a tela é apenas visual. Depois, estes campos
              serão ligados ao banco de dados e enviados para análise da
              Coordenadoria.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {formPreview.map((field) => (
              <label key={field} className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {field}
                </span>
                <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  Campo a preencher
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Enviar consulta
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Salvar rascunho
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <ActionCard
            title="Antes do acordo"
            description="A consulta de campo ocorre antes do Acordo de Cooperação Técnica, para evitar formalizações sem viabilidade real."
            status="Fluxo"
          />

          <ActionCard
            title="Análise pelas unidades"
            description="A Coordenadoria poderá encaminhar a sondagem para uma ou mais unidades municipais, que informarão se possuem campo compatível."
          />

          <ActionCard
            title="Próxima etapa"
            description="Havendo viabilidade, a instituição será orientada a solicitar o Acordo de Cooperação Técnica."
          />
        </div>
      </section>
    </SystemShell>
  );
}
