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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Campos de estágio
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Áreas municipais com possibilidade de vivência supervisionada.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            A existência de campo de estágio depende da compatibilidade do curso,
            disponibilidade da unidade, indicação de supervisor e capacidade de
            acompanhamento.
          </p>
        </div>

        <div className="mt-10">
          {fields.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-amber-950">
                Nenhum campo publicado no momento.
              </h2>

              <p className="mt-3 text-sm leading-6 text-amber-900">
                Os campos de estágio serão exibidos aqui após publicação pela
                Coordenadoria. A disponibilidade depende da análise das unidades
                municipais e da compatibilidade com cada curso.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-xl font-bold text-slate-950">
                      {item.title}
                    </h2>

                    <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      Publicado
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.area && (
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {item.area}
                      </span>
                    )}

                    {item.shift && (
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {item.shift}
                      </span>
                    )}

                    {item.available_slots !== null && (
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {item.available_slots} vaga(s)
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Observação importante
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            A publicação de um campo indica possibilidade de análise, mas não
            garante aprovação automática. Cada solicitação dependerá de sondagem,
            disponibilidade da unidade, existência de supervisor e validação pela
            Coordenadoria.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
