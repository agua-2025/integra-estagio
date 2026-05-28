import Link from "next/link";

const menuItems = [
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Instituições", href: "/instituicoes" },
  { label: "Estudantes", href: "/estudantes" },
  { label: "Órgãos", href: "/orgaos-municipais" },
  { label: "Documentos", href: "/documentos" },
  { label: "FAQ", href: "/perguntas-frequentes" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Mirassol d&apos;Oeste
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-teal-800">
            Integra Estágio
          </h1>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/acesso"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Acessar sistema
        </Link>
      </div>
    </header>
  );
}
