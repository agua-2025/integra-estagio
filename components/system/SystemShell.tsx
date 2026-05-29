import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Landmark,
  LayoutDashboard,
} from "lucide-react";

const navigation = [
  { label: "Instituição", href: "/instituicao", Icon: Building2 },
  { label: "Coordenadoria", href: "/coordenadoria", Icon: LayoutDashboard },
  { label: "Unidade Municipal", href: "/unidade", Icon: Landmark },
  { label: "Estagiário", href: "/estagiario", Icon: GraduationCap },
];

type SystemShellProps = {
  areaLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SystemShell({
  areaLabel,
  title,
  description,
  children,
}: SystemShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="flex h-full flex-col px-5 py-5">
            <Link
              href="/"
              className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm transition hover:border-teal-200"
            >
              <div className="relative h-16 w-full">
                <Image
                  src="/branding/logo-header.png"
                  alt="Integra Estágio"
                  fill
                  priority
                  sizes="240px"
                  className="object-contain object-center"
                />
              </div>

              <p className="mt-3 text-center text-xs font-medium text-slate-500">
                Gestão de Estágios
              </p>
            </Link>

            <nav className="mt-6 grid gap-2">
              {navigation.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-teal-100 bg-teal-50 p-4">
              <p className="text-sm font-bold text-teal-900">Versão inicial</p>
              <p className="mt-2 text-xs leading-5 text-teal-800">
                As áreas estão em validação visual. Login, permissões e dados
                serão ativados na próxima etapa.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  {areaLabel}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>

              <Link
                href="/acesso"
                className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                Trocar área
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
