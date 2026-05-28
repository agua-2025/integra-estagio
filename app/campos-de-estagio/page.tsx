import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const fields = [
  {
    area: "Administração e Gestão Pública",
    status: "Em organização",
    description:
      "Possibilidade de vivência em rotinas administrativas, atendimento, documentos, controles internos e apoio institucional.",
  },
  {
    area: "Assistência Social",
    status: "Conforme disponibilidade",
    description:
      "Campo sujeito à avaliação da secretaria responsável, compatibilidade do curso e capacidade de supervisão.",
  },
  {
    area: "Saúde",
    status: "Conforme disponibilidade",
    description:
      "Campo dependente de critérios específicos da unidade, normas técnicas, capacidade local e perfil do curso.",
  },
  {
    area: "Educação",
    status: "Conforme disponibilidade",
    description:
      "Possibilidade de estágio conforme calendário, unidade de ensino, orientação pedagógica e capacidade de acompanhamento.",
  },
];

export default function CamposDeEstagioPage() {
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

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {fields.map((item) => (
            <article
              key={item.area}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-xl font-bold text-slate-950">
                  {item.area}
                </h2>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {item.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
