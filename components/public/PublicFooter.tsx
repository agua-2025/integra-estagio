import Image from "next/image";
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
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="inline-flex rounded-2xl border border-white/10 bg-white px-3.5 py-2.5 shadow-sm">
            <Image
              src="/branding/logo-header.png"
              alt="Integra Estágio"
              width={2400}
              height={660}
              className="h-11 w-auto sm:h-12"
            />
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">
            Programa de Estágio Curricular Supervisionado de Mirassol
            d&apos;Oeste. Ambiente digital para organização, formalização e
            acompanhamento dos estágios realizados nos órgãos e unidades da
            Administração Municipal.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Acesso rápido</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-teal-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Sistema</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {systemAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Link
            href="/acesso"
            className="mt-5 inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
          >
            Acessar sistema
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Município de Mirassol d&apos;Oeste. Todos
        os direitos reservados.
      </div>
    </footer>
  );
}
