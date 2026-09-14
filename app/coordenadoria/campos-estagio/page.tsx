import Link from "next/link";
import {
  Eye,
  EyeOff,
  Landmark,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { SystemShell } from "@/components/system/SystemShell";
import { getDashboardInternshipFields } from "@/lib/queries/dashboard-internship-fields";
import { toggleFieldPublic, updateFieldStatus } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ativo: "Ativo",
    em_analise: "Em análise",
    temporariamente_indisponivel: "Suspenso",
    inativo: "Inativo",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "ativo") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "temporariamente_indisponivel") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "inativo") {
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
}

type CoordenadoriaCamposEstagioPageProps = {
  searchParams?: Promise<{
    erro?: string;
  }>;
};

function getPageMessage(errorCode?: string) {
  if (errorCode === "sem-unidade-publicada") {
    return "Para ativar ou publicar um campo de estágio, selecione ao menos uma unidade municipal vinculada.";
  }

  return null;
}

function Indicator({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
    </div>
  );
}

export default async function CoordenadoriaCamposEstagioPage({
  searchParams,
}: CoordenadoriaCamposEstagioPageProps) {
  const params = await searchParams;
  const pageMessage = getPageMessage(params?.erro);

  const { fields, error } = await getDashboardInternshipFields();

  const activeCount = fields.filter((field) => field.status === "ativo").length;
  const publicCount = fields.filter((field) => field.is_public).length;
  const suspendedCount = fields.filter(
    (field) => field.status === "temporariamente_indisponivel",
  ).length;
  const inactiveCount = fields.filter((field) => field.status === "inativo").length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Campos de Estágio"
      description="Controle administrativo das áreas municipais aptas ao recebimento de estagiários."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/coordenadoria"
            className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
          >
            Voltar para a Coordenadoria
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/campos-de-estagio"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            <Eye className="h-4 w-4" />
            Página pública
          </Link>

          <Link
            href="/coordenadoria/campos-estagio/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" />
            Novo campo
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Indicator
          label="Total"
          value={fields.length}
          description="Campos registrados no sistema."
        />
        <Indicator
          label="Ativos"
          value={activeCount}
          description="Liberados para utilização."
        />
        <Indicator
          label="Publicados"
          value={publicCount}
          description="Visíveis na área pública."
        />
        <Indicator
          label="Suspensos"
          value={suspendedCount}
          description="Indisponíveis temporariamente."
        />
        <Indicator
          label="Inativos"
          value={inactiveCount}
          description="Ocultos ou desativados."
        />
      </div>

      {pageMessage && (
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {pageMessage}
        </section>
      )}

      {error && (
        <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar os campos de estágio: {error}
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Campos cadastrados
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Listagem administrativa para publicação, suspensão e controle das áreas.
            </p>
          </div>

          <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
            {fields.length} registro(s)
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="p-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-black text-amber-950">
                Nenhum campo cadastrado.
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Cadastre o primeiro campo de estágio para iniciar a organização das áreas disponíveis.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-black">Campo</th>
                  <th className="px-5 py-3 font-black">Área</th>
                  <th className="px-5 py-3 font-black">Vagas</th>
                  <th className="px-5 py-3 font-black">Turno</th>
                  <th className="px-5 py-3 font-black">Publicação</th>
                  <th className="px-5 py-3 font-black">Status</th>
                  <th className="px-5 py-3 text-right font-black">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {fields.map((field) => (
                  <tr key={field.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-950">{field.title}</p>
                      {field.description && (
                        <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-slate-500">
                          {field.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {field.area ?? "Não informado"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {field.available_slots ?? "A definir"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {field.shift ?? "A definir"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          field.is_public
                            ? "inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                            : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                        }
                      >
                        {field.is_public ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {field.is_public ? "Publicado" : "Oculto"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          field.status,
                        )}`}
                      >
                        {statusLabel(field.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/coordenadoria/campos-estagio/${field.id}`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Editar
                        </Link>

                        <form action={toggleFieldPublic}>
                          <input type="hidden" name="id" value={field.id} />
                          <input
                            type="hidden"
                            name="is_public"
                            value={String(field.is_public)}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                          >
                            {field.is_public ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                            {field.is_public ? "Ocultar" : "Publicar"}
                          </button>
                        </form>

                        {field.status !== "ativo" && (
                          <form action={updateFieldStatus}>
                            <input type="hidden" name="id" value={field.id} />
                            <input type="hidden" name="status" value="ativo" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                            >
                              <ToggleRight className="h-3.5 w-3.5" />
                              Ativar
                            </button>
                          </form>
                        )}

                        {field.status !== "temporariamente_indisponivel" && (
                          <form action={updateFieldStatus}>
                            <input type="hidden" name="id" value={field.id} />
                            <input
                              type="hidden"
                              name="status"
                              value="temporariamente_indisponivel"
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Suspender
                            </button>
                          </form>
                        )}

                        {field.status !== "inativo" && (
                          <form action={updateFieldStatus}>
                            <input type="hidden" name="id" value={field.id} />
                            <input type="hidden" name="status" value="inativo" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <ToggleLeft className="h-3.5 w-3.5" />
                              Inativar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 ring-1 ring-teal-100">
            <Landmark className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              Controle de disponibilidade
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              O campo de estágio representa uma área de atuação possível. A utilização efetiva depende da vinculação com unidades municipais, sondagem favorável, acordo vigente e autorização individual do estágio.
            </p>
          </div>
        </div>
      </section>
    </SystemShell>
  );
}
