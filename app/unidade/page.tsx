import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";

const modules = [
  {
    title: "Sondagens recebidas",
    href: "/unidade/sondagens",
    tag: "Prioridade",
    description:
      "Responder consultas encaminhadas pela Coordenadoria, informando disponibilidade, quantidade possível, horário, supervisor e atividades compatíveis.",
  },
  {
    title: "Estagiários",
    href: "/unidade/estagiarios",
    tag: "Acompanhamento",
    description:
      "Consultar estudantes autorizados para a unidade, com curso, instituição, período, horário e supervisor responsável.",
  },
  {
    title: "Ocorrências",
    href: "/unidade/ocorrencias",
    tag: "Registro",
    description:
      "Registrar e acompanhar faltas, atrasos, ajustes de horário, alteração de supervisor ou outras intercorrências durante o estágio.",
  },
  {
    title: "Relatórios finais",
    href: "/unidade/relatorio-final",
    tag: "Encerramento",
    description:
      "Registrar informações de encerramento, carga cumprida, atividades realizadas e observações finais do supervisor.",
  },
];

export default function UnidadeAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Unidade Municipal"
      title="Painel da Unidade"
      description="Acompanhe sondagens, estagiários autorizados, ocorrências e relatórios finais."
    >
      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-4">
          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Sondagens
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Responder disponibilidade
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Estagiários
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Acompanhar autorizados
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Ocorrências
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Registrar intercorrências
            </p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Relatórios
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              Encerrar estágios
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
          A unidade participa do fluxo informando viabilidade, acompanhando estudantes e registrando o encerramento do estágio.
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Módulos da unidade
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Acesse rapidamente as etapas de responsabilidade da unidade municipal.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-black">Módulo</th>
                <th className="px-4 py-2 font-black">Finalidade</th>
                <th className="px-4 py-2 font-black">Tipo</th>
                <th className="px-4 py-2 text-right font-black">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => (
                <tr key={module.href} className="hover:bg-slate-50">
                  <td className="px-4 py-2 align-top">
                    <p className="font-black text-slate-950">{module.title}</p>
                  </td>

                  <td className="px-4 py-2 align-top text-slate-700">
                    {module.description}
                  </td>

                  <td className="px-4 py-2 align-top">
                    <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                      {module.tag}
                    </span>
                  </td>

                  <td className="px-4 py-2 align-top">
                    <div className="flex justify-end">
                      <Link
                        href={module.href}
                        className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                      >
                        Acessar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          Os dados exibidos nos módulos respeitam o vínculo da unidade municipal do usuário logado.
        </div>
      </section>
    </SystemShell>
  );
}
