import Link from "next/link";

const quickLinks = [
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Instituições de ensino", href: "/instituicoes" },
  { label: "Estudantes", href: "/estudantes" },
  { label: "Órgãos municipais", href: "/orgaos-municipais" },
  { label: "Campos de estágio", href: "/campos-de-estagio" },
  { label: "Documentos", href: "/documentos" },
  { label: "Perguntas frequentes", href: "/perguntas-frequentes" },
  { label: "Notícias e avisos", href: "/noticias" },
  { label: "Base legal", href: "/base-legal" },
];

const systemAreas = [
  "Área da Instituição",
  "Área da Coordenadoria",
  "Área da Unidade Municipal",
  "Área do Estagiário",
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Integra Estágio
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Programa de Estágio Curricular Supervisionado
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Ambiente digital para organização, formalização e acompanhamento dos
            estágios curriculares supervisionados realizados nos órgãos e
            unidades da Administração Municipal de Mirassol d&apos;Oeste.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">Acesso rápido</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-teal-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">Sistema</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {systemAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Link
            href="/acesso"
            className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Acessar sistema
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Município de Mirassol d&apos;Oeste. Todos
        os direitos reservados.
      </div>
    </footer>
  );
}
