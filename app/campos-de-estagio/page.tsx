import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { getPublicInternshipFields } from "@/lib/queries/internship-fields";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CamposDeEstagioPage() {
  const fields = await getPublicInternshipFields();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Campos disponíveis para consulta
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Áreas municipais que podem ser consultadas pelas instituições de ensino.
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
            Consulte os campos cadastrados pela Coordenadoria para análise prévia. A disponibilidade
            depende de sondagem, unidade municipal, supervisor e compatibilidade
            com o curso.
          </p>
        </div>

        <div className="mt-10">
          {fields.length === 0 ? (
            <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
              <h2 className="text-xl font-bold text-amber-950">
                Nenhum campo publicado no momento.
              </h2>

              <p className="mt-3 text-sm leading-6 text-amber-900">
                Os campos de estágio serão exibidos aqui após publicação pela
                Coordenadoria.
              </p>
            </div>
          ) : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => {
                const linkedUnits =
                  field.field_units
                    ?.filter((link) => link.is_active)
                    .flatMap((link) => link.municipal_units ?? []) ?? [];

                return (
                  <article
                    key={field.id}
                    className="flex min-h-[285px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950">
                          {field.title}
                        </h2>

                        {field.area && (
                          <p className="mt-1 line-clamp-1 text-sm font-semibold text-teal-700">
                            {field.area}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
                        Disponível para consulta
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {field.shift && (
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          {field.shift}
                        </span>
                      )}

                      {field.available_slots !== null && (
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          {field.available_slots} vaga(s)
                        </span>
                      )}
                    </div>

                    <div className="mt-5 min-h-[86px]">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Unidades
                      </p>

                      {linkedUnits.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">
                          A definir
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {linkedUnits.slice(0, 3).map((unit) => (
                            <span
                              key={unit.id}
                              className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                            >
                              {unit.name}
                            </span>
                          ))}

                          {linkedUnits.length > 3 && (
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
                              +{linkedUnits.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <Link
                        href={`/campos-de-estagio/${field.id}`}
                        className="inline-flex w-full justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-teal-300 hover:text-teal-800"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Observação importante
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            A exibição de um campo indica possibilidade de consulta, mas não
            garante vaga, aprovação ou autorização automática. Cada solicitação dependerá de sondagem,
            disponibilidade da unidade, existência de supervisor e validação pela
            Coordenadoria.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

