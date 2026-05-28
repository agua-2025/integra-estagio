import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Landmark,
  Newspaper,
  Scale,
  Users,
} from "lucide-react";

const menuItems = [
  { label: "Como funciona", href: "/como-funciona", Icon: BookOpen },
  { label: "Instituições", href: "/instituicoes", Icon: Building2 },
  { label: "Estudantes", href: "/estudantes", Icon: GraduationCap },
  { label: "Órgãos", href: "/orgaos-municipais", Icon: Landmark },
  { label: "Campos", href: "/campos-de-estagio", Icon: Users },
  { label: "Documentos", href: "/documentos", Icon: FileText },
  { label: "FAQ", href: "/perguntas-frequentes", Icon: HelpCircle },
  { label: "Notícias", href: "/noticias", Icon: Newspaper },
  { label: "Base legal", href: "/base-legal", Icon: Scale },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="relative block h-16 w-80 shrink-0">
            <Image
              src="/branding/logo-header.png"
              alt="Integra Estágio"
              fill
              priority
              sizes="320px"
              className="object-contain object-left"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-medium text-slate-600 xl:flex">
            {menuItems.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap hover:text-teal-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
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
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                >
                  <Home className="h-4 w-4" />
                  Início
                </Link>

                {menuItems.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
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
