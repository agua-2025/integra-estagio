import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { createAccessRequest } from "./actions";

type SolicitarAcessoPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

function getMessage(params?: { sucesso?: string; erro?: string }) {
  if (params?.sucesso === "1") {
    return {
      type: "success",
      text: "Solicitação enviada com sucesso. A Coordenadoria analisará os dados informados e entrará em contato para os próximos passos.",
    };
  }

  if (params?.erro === "campos-obrigatorios") {
    return {
      type: "warning",
      text: "Preencha o nome do responsável, e-mail e nome da instituição.",
    };
  }

  if (params?.erro === "falha-envio") {
    return {
      type: "error",
      text: "Não foi possível enviar a solicitação agora. Confira os dados e tente novamente.",
    };
  }

  return null;
}

export default async function SolicitarAcessoPage({
  searchParams,
}: SolicitarAcessoPageProps) {
  const params = await searchParams;
  const message = getMessage(params);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Solicitação de acesso
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Acesso institucional ao Integra Estágio.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
            Esta página é destinada às instituições de ensino interessadas em
            consultar campos e iniciar o fluxo de estágio curricular
            supervisionado junto ao Município.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-bold text-amber-950">
              Importante
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              O envio da solicitação não libera acesso automático. A
              Coordenadoria analisará as informações e, se cabível, orientará a
              criação ou liberação do usuário institucional.
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">
              Próximas etapas
            </h2>

            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-600">
              <li>A instituição envia a solicitação.</li>
              <li>A Coordenadoria confere os dados.</li>
              <li>O acesso institucional é liberado, quando aprovado.</li>
              <li>A instituição completa seus dados e informa os cursos.</li>
              <li>Somente depois poderá solicitar sondagem de campo.</li>
            </ol>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Dados para análise
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informe os dados básicos da instituição e do responsável pelo
            contato.
          </p>

          {message && (
            <div
              className={
                message.type === "success"
                  ? "mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800"
                  : message.type === "warning"
                    ? "mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
                    : "mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              }
            >
              {message.text}
            </div>
          )}

          <form action={createAccessRequest} className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Responsável pelo contato
              </span>
              <input
                name="requester_name"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Nome completo"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                E-mail do responsável
              </span>
              <input
                name="requester_email"
                type="email"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="responsavel@instituicao.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Telefone
              </span>
              <input
                name="requester_phone"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="(65) 0000-0000"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">CNPJ</span>
              <input
                name="institution_cnpj"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="00.000.000/0000-00"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Nome da instituição
              </span>
              <input
                name="institution_name"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Faculdade Católica Rainha da Paz"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Cidade
              </span>
              <input
                name="city"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Araputanga"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">UF</span>
              <input
                name="state"
                maxLength={2}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="MT"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Observações
              </span>
              <textarea
                name="notes"
                rows={4}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Informe observações úteis para análise, como cursos pretendidos, setor responsável ou forma preferencial de contato."
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Enviar solicitação
              </button>

              <Link
                href="/login"
                className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                Já tenho acesso
              </Link>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
