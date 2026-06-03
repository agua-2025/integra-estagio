import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  LogIn,
  Menu,
  School,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

type NavigationItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{
    className?: string;
  }>;
};

const adminNavigation: NavigationItem[] = [
  { label: "Painel da Coordenadoria", href: "/coordenadoria", Icon: LayoutDashboard },
  { label: "Solicitações de Acesso", href: "/coordenadoria/solicitacoes-acesso", Icon: LogIn },
  { label: "Instituições e Cursos", href: "/coordenadoria/instituicoes-cursos", Icon: School },
  { label: "Campos de Estágio", href: "/coordenadoria/campos-estagio", Icon: ClipboardList },
  { label: "Unidades Municipais", href: "/coordenadoria/unidades", Icon: Landmark },
  { label: "Sondagens", href: "/coordenadoria/sondagens", Icon: ClipboardCheck },
  { label: "Acordos de Cooperação", href: "/coordenadoria/acordos-cooperacao", Icon: FileText },
  { label: "Estudantes", href: "/coordenadoria/estudantes", Icon: Users },
  { label: "Autorizações", href: "/coordenadoria/autorizacoes", Icon: GraduationCap },
  { label: "Relatórios", href: "/coordenadoria/relatorios", Icon: BookOpen },
];

const institutionNavigation: NavigationItem[] = [
  { label: "Painel da Instituição", href: "/instituicao", Icon: LayoutDashboard },
  { label: "Dados Institucionais", href: "/instituicao/cadastro", Icon: Building2 },
  { label: "Cursos", href: "/instituicao/cursos", Icon: School },
  { label: "Sondagens", href: "/instituicao/sondagens", Icon: ClipboardCheck },
  { label: "Acordos", href: "/instituicao/acordos", Icon: FileText },
  { label: "Estudantes", href: "/instituicao/estudantes", Icon: GraduationCap },
];

const unitNavigation: NavigationItem[] = [
  { label: "Painel da Unidade", href: "/unidade", Icon: LayoutDashboard },
  { label: "Sondagens Recebidas", href: "/unidade/sondagens", Icon: ClipboardCheck },
  { label: "Estagiários", href: "/unidade/estagiarios", Icon: GraduationCap },
  { label: "Ocorrências", href: "/unidade/ocorrencias", Icon: FileText },
  { label: "Relatórios Finais", href: "/unidade/relatorios", Icon: BookOpen },
];

const studentNavigation: NavigationItem[] = [
  { label: "Painel do Estagiário", href: "/estagiario", Icon: LayoutDashboard },
  { label: "Meu Estágio", href: "/estagiario/estagio", Icon: GraduationCap },
  { label: "Documentos", href: "/estagiario/documentos", Icon: FileText },
  { label: "Orientações", href: "/estagiario/orientacoes", Icon: BookOpen },
];

function getNavigation(role?: string | null) {
  if (role === "instituicao") {
    return institutionNavigation;
  }

  if (role === "unidade") {
    return unitNavigation;
  }

  if (role === "estagiario") {
    return studentNavigation;
  }

  return adminNavigation;
}

async function getCurrentProfileRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role ?? null;
}

type SystemShellProps = {
  areaLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export async function SystemShell({
  areaLabel,
  title,
  description,
  children,
}: SystemShellProps) {
  const role = await getCurrentProfileRole();
  const navigation = getNavigation(role);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="relative block h-10 w-44 shrink-0">
            <Image
              src="/branding/logo-header.png"
              alt="Integra Estágio"
              fill
              priority
              sizes="180px"
              className="object-contain object-left"
            />
          </Link>

          <details className="group relative">
            <summary className="flex list-none items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
              <Menu className="h-4 w-4" />
              Menu
            </summary>

            <div className="absolute right-0 mt-3 max-h-[75vh] w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <nav className="grid gap-1">
                {navigation.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}

                <div className="mt-2 border-t border-slate-200 pt-2">
                  <LogoutButton />
                </div>
              </nav>
            </div>
          </details>
        </div>
      </header>

      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:self-start lg:overflow-y-auto">
          <div className="flex h-full flex-col px-5 py-5">
            <Link
              href="/"
              className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm transition hover:border-teal-200"
            >
              <div className="relative h-14 w-full">
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

            <nav className="mt-6 grid gap-1">
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

            <div className="mt-auto space-y-4 pt-6">
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-bold text-teal-900">
                  Acesso controlado
                </p>
                <p className="mt-2 text-xs leading-5 text-teal-800">
                  O menu exibido considera o perfil de acesso do usuário logado.
                </p>
              </div>

              <LogoutButton />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 sm:text-sm">
                  {areaLabel}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
