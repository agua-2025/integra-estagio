import Link from "next/link";

const menuItems = [
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Instituições", href: "/instituicoes" },
  { label: "Estudantes", href: "/estudantes" },
  { label: "Órgãos", href: "/orgaos-municipais" },
  { label: "Campos", href: "/campos-de-estagio" },
  { label: "Documentos", href: "/documentos" },
  { label: "FAQ", href: "/perguntas-frequentes" },
  { label: "Notícias", href: "/noticias" },
  { label: "Base legal", href: "/base-legal" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Mirassol d&apos;Oeste
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-teal-800">
              Integra Estágio
            </h1>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
            {menuItems.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-teal-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <Link
              href="/acesso"
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Acessar sistema
            </Link>
          </div>

          <details className="group relative xl:hidden">
            <summary className="list-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800">
              Menu
            </summary>

            <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              <nav className="grid gap-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/acesso"
                  className="mt-2 rounded-xl bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Acessar sistema
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
