import type { ComponentType } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileSignature,
  GraduationCap,
  Layers3,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";

type IconComponent = ComponentType<{ className?: string }>;

async function safeCount(
  table: string,
  apply?: (query: any) => any,
): Promise<number> {
  try {
    const supabase = await createClient();

    let query = supabase.from(table).select("*", {
      count: "exact",
      head: true,
    });

    if (apply) {
      query = apply(query);
    }

    const { count, error } = await query;

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}

function MetricCard({
  label,
  value,
  description,
  Icon,
}: {
  label: string;
  value: number;
  description: string;
  Icon: IconComponent;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
  active,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        active
          ? "border-teal-200 bg-teal-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            active
              ? "bg-teal-700 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {number}
        </div>

        <h3 className="text-sm font-black text-slate-950">{title}</h3>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  );
}

function StatusLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
        {value}
      </span>
    </div>
  );
}

export default async function CoordenadoriaAreaPage() {
  const [
    sondagensPendentes,
    acordosEmAndamento,
    estudantesEmAnalise,
    autorizacoesPendentes,
    estagiosAtivos,
    ocorrenciasRegistradas,
  ] = await Promise.all([
    safeCount("inquiries", (query) =>
      query.in("status", [
        "enviada",
        "recebida",
        "em_analise",
        "encaminhada_unidade",
        "aguardando_unidade",
        "complementacao_solicitada",
      ]),
    ),
    safeCount("cooperation_agreements", (query) =>
      query.in("status", [
        "rascunho",
        "em_analise",
        "pendente_correcao",
        "minuta_gerada",
        "aguardando_assinatura",
        "assinado",
        "publicado",
      ]),
    ),
    safeCount("student_presentations", (query) =>
      query.in("status", [
        "apresentado",
        "em_analise",
        "pendente_correcao",
        "apto_para_assinatura",
        "termo_assinado_anexado",
        "documentos_validados",
      ]),
    ),
    safeCount("internship_authorizations", (query) =>
      query.in("status", [
        "aguardando_unidade",
        "aguardando_supervisor",
        "pronto_para_autorizar",
      ]),
    ),
    safeCount("internships", (query) =>
      query.in("status", ["aguardando_inicio", "em_andamento"]),
    ),
    safeCount("internship_occurrences"),
  ]);

  const totalPendencias =
    sondagensPendentes +
    acordosEmAndamento +
    estudantesEmAnalise +
    autorizacoesPendentes;

  return (
    <SystemShell
      areaLabel="Área da Coordenadoria"
      title="Painel administrativo"
      description="Visão geral do Programa de Estágio, com acompanhamento rápido das etapas que exigem análise, conferência ou providência da Coordenadoria."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pendências"
          value={totalPendencias}
          description="Itens que dependem de análise, conferência ou autorização."
          Icon={AlertCircle}
        />

        <MetricCard
          label="Sondagens"
          value={sondagensPendentes}
          description="Solicitações em análise ou aguardando retorno das unidades."
          Icon={Layers3}
        />

        <MetricCard
          label="Acordos"
          value={acordosEmAndamento}
          description="Minutas, conferências, assinaturas ou publicações pendentes."
          Icon={FileSignature}
        />

        <MetricCard
          label="Estágios ativos"
          value={estagiosAtivos}
          description="Estágios autorizados para início ou em acompanhamento."
          Icon={GraduationCap}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Esteira do processo
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Leitura rápida das fases principais do fluxo administrativo.
              </p>
            </div>

            <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
              Fluxo
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FlowStep
              number="1"
              title="Sondagem"
              description="Instituição consulta possibilidade de campo e a unidade informa disponibilidade."
              active={sondagensPendentes > 0}
            />

            <FlowStep
              number="2"
              title="Acordo"
              description="Coordenadoria controla minuta, conferência da instituição, assinatura e publicação."
              active={acordosEmAndamento > 0}
            />

            <FlowStep
              number="3"
              title="Apresentação"
              description="Instituição apresenta estudante e documentos para análise do Termo de Compromisso."
              active={estudantesEmAnalise > 0}
            />

            <FlowStep
              number="4"
              title="Autorização"
              description="Coordenadoria libera formalmente o início após conferência completa."
              active={autorizacoesPendentes > 0}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Resumo operacional
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Quantitativo geral das principais frentes de trabalho.
              </p>
            </div>

            <ListChecks className="h-5 w-5 text-teal-700" />
          </div>

          <div className="mt-2">
            <StatusLine label="Sondagens pendentes" value={sondagensPendentes} />
            <StatusLine label="Acordos em andamento" value={acordosEmAndamento} />
            <StatusLine label="Estudantes em análise" value={estudantesEmAnalise} />
            <StatusLine label="Autorizações pendentes" value={autorizacoesPendentes} />
            <StatusLine label="Ocorrências registradas" value={ocorrenciasRegistradas} />
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Controle por perfil
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                O menu lateral já apresenta apenas as áreas disponíveis ao
                usuário logado. Este painel concentra a visão administrativa do
                andamento geral do Programa de Estágio.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950">
                Situação atual
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {totalPendencias > 0
                  ? "Há itens aguardando análise da Coordenadoria. Utilize o menu lateral para acessar o módulo correspondente."
                  : "No momento, não há pendências identificadas nos principais módulos acompanhados pelo painel."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </SystemShell>
  );
}
