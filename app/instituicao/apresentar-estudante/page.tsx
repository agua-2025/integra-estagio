import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionStudentPresentationData } from "@/lib/queries/institution-student-presentations";
import { submitStudentPresentation } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function ApresentarEstudantePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { institution, options, error } =
    await getInstitutionStudentPresentationData();

  const firstOption = options[0];

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Apresentar estudante"
      description="Encaminhe estudante para análise da Coordenadoria, conforme sondagem autorizada e acordo ativo."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/instituicao/sondagens"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver sondagens
          </Link>

          <Link
            href="/instituicao/acordos"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver acordos
          </Link>
        </div>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Estudante apresentado com sucesso. A Coordenadoria fará a análise.
        </section>
      )}

      {params?.erro && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(params.erro)}
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </section>
      )}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Instituição
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {institution?.name ?? "Instituição não identificada"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          A apresentação somente fica disponível quando houver sondagem viável
          ou parcialmente viável, acordo ativo, assinado, publicado, vigente e
          curso abrangido pelo acordo.
        </p>
      </div>

      {options.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <p className="font-black">Nenhuma apresentação disponível.</p>
          <p className="mt-2">
            Para apresentar estudante, é necessário existir sondagem viável ou
            parcialmente viável, com quantidade autorizada disponível, além de
            Acordo de Cooperação ativo e vinculado ao curso.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <form
            action={submitStudentPresentation}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-950">
                Dados da apresentação
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Preencha os dados básicos do estudante e selecione o vínculo
                autorizado para encaminhamento à Coordenadoria.
              </p>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Sondagem autorizada / unidade municipal
                </span>
                <select
                  name="authorization_key"
                  required
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  {options.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.course_name} — {option.municipal_unit_name} —{" "}
                      {option.remaining_slots} vaga(s) restante(s)
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Nome completo
                  </span>
                  <input
                    name="full_name"
                    required
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">CPF</span>
                  <input
                    name="cpf"
                    placeholder="Somente números"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    E-mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Telefone
                  </span>
                  <input
                    name="phone"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Data de nascimento
                  </span>
                  <input
                    name="birth_date"
                    type="date"
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Matrícula acadêmica
                  </span>
                  <input
                    name="academic_registration"
                    required
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Período pretendido
                  </span>
                  <input
                    name="intended_period"
                    required
                    defaultValue={firstOption?.intended_period ?? ""}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Horário pretendido
                  </span>
                  <input
                    name="intended_schedule"
                    required
                    defaultValue={firstOption?.possible_schedule ?? ""}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    Carga horária obrigatória
                  </span>
                  <input
                    name="required_workload"
                    type="number"
                    min="1"
                    required
                    defaultValue={firstOption?.required_workload ?? ""}
                    className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-slate-500">
                O envio não autoriza início automático do estágio. A
                Coordenadoria ainda fará a análise.
              </p>

              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
              >
                Enviar apresentação
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                Vínculos disponíveis
              </h2>

              <div className="mt-3 space-y-3">
                {options.map((option) => (
                  <div
                    key={option.key}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
                  >
                    <p className="font-black text-slate-950">
                      {option.course_name}
                    </p>
                    <p className="mt-1">{option.municipal_unit_name}</p>
                    <p className="mt-1">
                      Autorizados:{" "}
                      <strong>{formatNumber(option.approved_students)}</strong>
                    </p>
                    <p>
                      Já apresentados:{" "}
                      <strong>{formatNumber(option.already_presented)}</strong>
                    </p>
                    <p>
                      Restantes:{" "}
                      <strong>{formatNumber(option.remaining_slots)}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              <p className="font-black">Atenção</p>
              <p className="mt-1">
                Documentos do estudante serão tratados em etapa própria. Nesta
                versão, será registrado apenas o envio inicial da apresentação.
              </p>
            </div>
          </aside>
        </section>
      )}
    </SystemShell>
  );
}
