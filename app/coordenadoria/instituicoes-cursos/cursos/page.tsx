import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionsAndCourses } from "@/lib/queries/institutions-courses";
import { toggleCourseStatus } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CursosPageProps = {
  searchParams?: Promise<{
    busca?: string;
    instituicao?: string;
    status?: string;
  }>;
};

function courseLevelLabel(level: string | null) {
  const labels: Record<string, string> = {
    superior: "Superior",
    tecnico: "Técnico",
    medio: "Médio",
    outro: "Outro",
  };

  return level ? labels[level] ?? level : "Não informado";
}

function normalize(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const params = await searchParams;
  const { institutions, courses, error } = await getInstitutionsAndCourses();

  const busca = normalize(params?.busca);
  const institutionFilter = String(params?.instituicao ?? "").trim();
  const statusFilter = String(params?.status ?? "").trim();

  const activeCourses = courses.filter((course) => course.is_active).length;
  const inactiveCourses = courses.length - activeCourses;

  const filteredCourses = courses.filter((course) => {
    const institution = institutions.find(
      (item) => item.id === course.institution_id,
    );

    const matchesSearch =
      !busca ||
      normalize(course.name).includes(busca) ||
      normalize(institution?.name).includes(busca);

    const matchesInstitution =
      !institutionFilter || course.institution_id === institutionFilter;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "ativo" && course.is_active) ||
      (statusFilter === "inativo" && !course.is_active);

    return matchesSearch && matchesInstitution && matchesStatus;
  });

  const hasFilters = Boolean(busca || institutionFilter || statusFilter);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Cursos"
      description="Consulta e controle dos cursos cadastrados pelas instituições de ensino."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/instituicoes-cursos"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para Instituições e Cursos
        </Link>

        <Link
          href="/coordenadoria/instituicoes-cursos"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver instituições
        </Link>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Não foi possível carregar cursos: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 md:grid-cols-4">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Exibidos
            </p>
            <p className="text-lg font-black text-slate-950">
              {filteredCourses.length}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Cadastrados
            </p>
            <p className="text-lg font-black text-slate-950">{courses.length}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Ativos
            </p>
            <p className="text-lg font-black text-teal-700">{activeCourses}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Inativos
            </p>
            <p className="text-lg font-black text-slate-700">{inactiveCourses}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="text-xs text-slate-500">
                Os cursos são cadastrados pela instituição. A Coordenadoria apenas consulta e controla a situação.
              </p>
            </div>

            {hasFilters && (
              <Link
                href="/coordenadoria/instituicoes-cursos/cursos"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 lg:grid-cols-[1fr_260px_160px_auto]">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Buscar
              </span>
              <input
                name="busca"
                defaultValue={params?.busca ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Curso ou instituição"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Instituição
              </span>
              <select
                name="instituicao"
                defaultValue={params?.instituicao ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
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
            Cursos cadastrados
          </h2>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum curso encontrado.
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[30%] px-2 py-1.5 font-black">Curso</th>
                  <th className="w-[34%] px-2 py-1.5 font-black">Instituição</th>
                  <th className="w-[11%] px-2 py-1.5 font-black">Nível</th>
                  <th className="w-[9%] px-2 py-1.5 font-black">Carga</th>
                  <th className="w-[8%] px-2 py-1.5 font-black">Status</th>
                  <th className="w-[8%] px-2 py-1.5 text-right font-black">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => {
                  const institution = institutions.find(
                    (item) => item.id === course.institution_id,
                  );

                  return (
                    <tr key={course.id} className="align-top hover:bg-slate-50">
                      <td className="px-2 py-1.5 font-black text-slate-950">
                        {course.name}
                      </td>

                      <td className="px-2 py-1.5 text-slate-700">
                        <p className="truncate">
                          {institution?.name ?? "Instituição não encontrada"}
                        </p>
                      </td>

                      <td className="px-2 py-1.5 text-slate-700">
                        {courseLevelLabel(course.level)}
                      </td>

                      <td className="px-2 py-1.5 text-slate-700">
                        {course.workload_required !== null
                          ? `${course.workload_required}h`
                          : "-"}
                      </td>

                      <td className="px-2 py-1.5">
                        <span
                          className={
                            course.is_active
                              ? "inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200"
                              : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200"
                          }
                        >
                          {course.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-right">
                        <form action={toggleCourseStatus}>
                          <input type="hidden" name="id" value={course.id} />
                          <input
                            type="hidden"
                            name="is_active"
                            value={String(course.is_active)}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                          >
                            {course.is_active ? "Inativar" : "Ativar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          O cadastro e a atualização dos cursos pertencem à instituição. A Coordenadoria apenas controla a situação para fins de sondagem, acordo e apresentação de estagiários.
        </div>
      </section>
    </SystemShell>
  );
}
