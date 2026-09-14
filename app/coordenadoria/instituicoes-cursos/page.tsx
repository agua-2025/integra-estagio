import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionsAndCourses } from "@/lib/queries/institutions-courses";
import { updateInstitutionStatus } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CoordenadoriaInstituicoesCursosPageProps = {
  searchParams?: Promise<{
    busca?: string;
    status?: string;
    erro?: string;
  }>;
};

function institutionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    em_analise: "Em análise",
    ativa: "Ativa",
    pendente: "Pendente",
    inativa: "Inativa",
    bloqueada: "Bloqueada",
  };

  return labels[status] ?? status;
}

function institutionStatusClass(status: string) {
  if (status === "ativa") return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  if (status === "pendente") return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  if (status === "em_analise") return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  if (status === "bloqueada") return "bg-red-50 text-red-700 ring-1 ring-red-200";
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function normalize(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

export default async function CoordenadoriaInstituicoesCursosPage({
  searchParams,
}: CoordenadoriaInstituicoesCursosPageProps) {
  const params = await searchParams;
  const { institutions, courses, error } = await getInstitutionsAndCourses();

  const busca = normalize(params?.busca);
  const statusFilter = String(params?.status ?? "").trim();

  const activeInstitutions = institutions.filter(
    (institution) => institution.status === "ativa",
  ).length;

  const pendingInstitutions = institutions.filter((institution) =>
    ["em_analise", "pendente"].includes(institution.status),
  ).length;

  const activeCourses = courses.filter((course) => course.is_active).length;

  const coursesByInstitution = new Map<string, typeof courses>();

  for (const course of courses) {
    const current = coursesByInstitution.get(course.institution_id) ?? [];
    current.push(course);
    coursesByInstitution.set(course.institution_id, current);
  }

  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch =
      !busca ||
      normalize(institution.name).includes(busca) ||
      normalize(institution.cnpj).includes(busca) ||
      normalize(institution.email).includes(busca) ||
      normalize(institution.city).includes(busca);

    const matchesStatus = !statusFilter || institution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasFilters = Boolean(busca || statusFilter);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Instituições e Cursos"
      description="Controle cadastral das instituições de ensino e dos cursos vinculados ao fluxo de estágio."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/coordenadoria/instituicoes-cursos/cursos"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver cursos
          </Link>

          <Link
            href="/coordenadoria/campos-estagio"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver campos
          </Link>
        </div>
      </div>

      {(error || params?.erro) && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error ? `Não foi possível carregar os dados: ${error}` : params?.erro}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 md:grid-cols-5">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Exibidas
            </p>
            <p className="text-lg font-black text-slate-950">
              {filteredInstitutions.length}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Instituições
            </p>
            <p className="text-lg font-black text-slate-950">{institutions.length}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Ativas
            </p>
            <p className="text-lg font-black text-teal-700">{activeInstitutions}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-lg font-black text-amber-700">{pendingInstitutions}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Cursos ativos
            </p>
            <p className="text-lg font-black text-teal-700">{activeCourses}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="text-xs text-slate-500">
                A instituição cadastra os próprios dados e cursos. A Coordenadoria apenas valida e controla a situação.
              </p>
            </div>

            {hasFilters && (
              <Link
                href="/coordenadoria/instituicoes-cursos"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Buscar
              </span>
              <input
                name="busca"
                defaultValue={params?.busca ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Instituição, CNPJ, e-mail ou cidade"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Status
              </span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todos</option>
                <option value="em_analise">Em análise</option>
                <option value="pendente">Pendente</option>
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-8 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Instituições cadastradas
          </h2>
          <p className="text-xs text-slate-500">
            Para liberar correção pela instituição, altere o status para pendente.
          </p>
        </div>

        {filteredInstitutions.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhuma instituição encontrada.
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[30%] px-2 py-1.5 font-black">Instituição</th>
                  <th className="w-[22%] px-2 py-1.5 font-black">Contato</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Cursos</th>
                  <th className="w-[8%] px-2 py-1.5 font-black">Status</th>
                  <th className="w-[30%] px-2 py-1.5 text-right font-black">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInstitutions.map((institution) => {
                  const institutionCourses =
                    coursesByInstitution.get(institution.id) ?? [];

                  return (
                    <tr key={institution.id} className="align-top hover:bg-slate-50">
                      <td className="px-2 py-1.5">
                        <p className="font-black text-slate-950">{institution.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {institution.city || "Cidade não informada"}
                          {institution.state ? `/${institution.state}` : ""}
                        </p>
                        {institution.cnpj && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            CNPJ: {institution.cnpj}
                          </p>
                        )}
                      </td>

                      <td className="px-2 py-1.5 text-slate-700">
                        <p className="truncate">{institution.email ?? "Sem e-mail"}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {institution.phone ?? "Sem telefone"}
                        </p>
                      </td>

                      <td className="px-2 py-1.5 text-slate-700">
                        {institutionCourses.length > 0
                          ? `${institutionCourses.length} curso(s)`
                          : "Nenhum curso"}
                      </td>

                      <td className="px-2 py-1.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${institutionStatusClass(
                            institution.status,
                          )}`}
                        >
                          {institutionStatusLabel(institution.status)}
                        </span>
                      </td>

                      <td className="px-2 py-1.5">
                        <div className="flex flex-nowrap justify-end gap-1">
                          {institution.status !== "ativa" && (
                            <form action={updateInstitutionStatus}>
                              <input type="hidden" name="id" value={institution.id} />
                              <input type="hidden" name="status" value="ativa" />
                              <button className="whitespace-nowrap rounded-lg border border-teal-300 bg-teal-50 px-2 py-1.5 text-[11px] font-semibold text-teal-800">
                                Validar
                              </button>
                            </form>
                          )}

                          {institution.status !== "pendente" && (
                            <form action={updateInstitutionStatus}>
                              <input type="hidden" name="id" value={institution.id} />
                              <input type="hidden" name="status" value="pendente" />
                              <button className="whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-800">
                                Correção
                              </button>
                            </form>
                          )}

                          {institution.status !== "inativa" && (
                            <form action={updateInstitutionStatus}>
                              <input type="hidden" name="id" value={institution.id} />
                              <input type="hidden" name="status" value="inativa" />
                              <button className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700">
                                Inativar
                              </button>
                            </form>
                          )}

                          {institution.status !== "bloqueada" && (
                            <form action={updateInstitutionStatus}>
                              <input type="hidden" name="id" value={institution.id} />
                              <input type="hidden" name="status" value="bloqueada" />
                              <button className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-700">
                                Bloquear
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          Para gerar minuta de acordo, a instituição deverá ter cadastro completo,
          curso ativo e validação da Coordenadoria.
        </div>
      </section>
    </SystemShell>
  );
}
