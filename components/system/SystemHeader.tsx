import Link from "next/link";

const areas = [
  { label: "Instituição", href: "/instituicao" },
  { label: "Coordenadoria", href: "/coordenadoria" },
  { label: "Unidade Municipal", href: "/unidade" },
  { label: "Estagiário", href: "/estagiario" },
];

export function SystemHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Sistema
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-teal-800">
            Integra Estágio
          </h1>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          {areas.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Site público
        </Link>
      </div>
    </header>
  );
}
