import { getPublicInternshipFields } from "@/lib/queries/internship-fields";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TesteSupabasePage() {
  const fields = await getPublicInternshipFields();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Teste Supabase
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Campos de estágio públicos
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Esta página consulta a tabela internship_fields no Supabase e lista
          apenas campos ativos e publicados.
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {fields.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-950">
                Nenhum campo público encontrado.
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Isso é normal se ainda não houver registros na tabela
                internship_fields com status ativo e is_public igual a true.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {fields.map((field) => (
                <article
                  key={field.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h2 className="text-lg font-bold text-slate-950">
                    {field.title}
                  </h2>

                  {field.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {field.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    {field.area && (
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {field.area}
                      </span>
                    )}

                    {field.shift && (
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {field.shift}
                      </span>
                    )}

                    {field.available_slots !== null && (
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {field.available_slots} vaga(s)
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
