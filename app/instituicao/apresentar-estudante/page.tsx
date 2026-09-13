import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { StudentPresentationForm } from "@/components/institution/StudentPresentationForm";
import { getInstitutionStudentPresentationData } from "@/lib/queries/institution-student-presentations";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApresentarEstudantePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { options, error } = await getInstitutionStudentPresentationData();

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Apresentar estagiário"
      description="Encaminhe o Termo de Compromisso, apólice e documentos para conferência da Coordenadoria."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/instituicao/sondagens"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver sondagens
          </Link>

          <Link
            href="/instituicao/acordos"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver acordos
          </Link>
        </div>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Estagiário apresentado com sucesso. A Coordenadoria fará a conferência dos documentos e do Termo de Compromisso.
        </section>
      )}

      {params?.erro && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(params.erro)}
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </section>
      )}

      {options.length === 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <p className="font-black">Nenhuma apresentação disponível.</p>
          <p className="mt-2">
            Para apresentar estagiário, é necessário existir sondagem viável ou
            parcialmente viável, com quantidade autorizada disponível, além de
            Acordo de Cooperação ativo e vinculado ao curso.
          </p>
        </section>
      ) : (
        <StudentPresentationForm
          options={options}
          clearDraft={params?.sucesso === "1"}
        />
      )}
    </SystemShell>
  );
}
