import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { getPublicInternshipFields } from "@/lib/queries/internship-fields";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CampoDetalhesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CampoDetalhesPage({
  params,
}: CampoDetalhesPageProps) {
  const { id } = await params;
  const fields = await getPublicInternshipFields();
  const field = fields.find((item) => item.id === id);

  if (!field) {
    notFound();
  }

  const linkedUnits =
    field.field_units
      ?.filter((link) => link.is_active)
      .flatMap((link) => link.municipal_units ?? []) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <Link
          href="/campos-de-estagio"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para campos de estágio
        </Link>

        <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Campo de estágio
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {field.title}
              </h1>

              {field.area && (
                <p className="mt-2 text-base font-semibold text-teal-700">
                  {field.area}
                </p>
              )}
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
              Publicado
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
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

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-bold text-slate-950">Descrição</h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {field.description ||
                  "Descrição detalhada ainda não informada pela Coordenadoria."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-bold text-slate-950">
                Unidades vinculadas
              </h2>

              {linkedUnits.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Unidade municipal ainda não definida.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {linkedUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {unit.name}
                      </p>

                      {unit.department && (
                        <p className="mt-1 text-xs text-slate-500">
                          {unit.department}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-bold text-amber-950">
              Observação importante
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Este campo indica possibilidade de análise. A autorização do
              estágio depende de sondagem, compatibilidade do curso, acordo de
              cooperação vigente, documentação válida, unidade definida e
              supervisor indicado.
            </p>
          </div>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
