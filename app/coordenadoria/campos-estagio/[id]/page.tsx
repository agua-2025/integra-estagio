import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { getDashboardInternshipFieldById } from "@/lib/queries/dashboard-internship-fields";
import { updateInternshipField } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EditarCampoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarCampoPage({
  params,
}: EditarCampoPageProps) {
  const { id } = await params;
  const { field, error } = await getDashboardInternshipFieldById(id);

  if (!field) {
    notFound();
  }

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Editar Campo de Estágio"
      description="Atualize as informações do campo, publicação e situação administrativa."
    >
      <div className="mb-6">
        <Link
          href="/coordenadoria/campos-estagio"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para Campos de Estágio
        </Link>
      </div>

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar o campo: {error}
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Dados do campo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Campos ativos e publicados aparecem na página pública de campos de
            estágio. Campos suspensos, inativos ou ocultos não aparecem para
            consulta pública.
          </p>
        </div>

        <form action={updateInternshipField} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={field.id} />

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Nome do campo
            </span>
            <input
              name="title"
              required
              defaultValue={field.title}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Área</span>
            <input
              name="area"
              defaultValue={field.area ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Vagas</span>
            <input
              name="available_slots"
              type="number"
              min="0"
              defaultValue={field.available_slots ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Turno</span>
            <input
              name="shift"
              defaultValue={field.shift ?? ""}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Descrição
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={field.description ?? ""}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                name="status"
                defaultValue={field.status}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="em_analise">Em análise</option>
                <option value="ativo">Ativo</option>
                <option value="temporariamente_indisponivel">Suspenso</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                name="is_public"
                type="checkbox"
                defaultChecked={field.is_public}
                className="h-4 w-4 rounded border-slate-300 text-teal-700"
              />
              <span className="text-sm font-semibold text-slate-700">
                Publicado
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                name="supervisor_required"
                type="checkbox"
                defaultChecked={field.supervisor_required}
                className="h-4 w-4 rounded border-slate-300 text-teal-700"
              />
              <span className="text-sm font-semibold text-slate-700">
                Exige supervisor
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Salvar alterações
            </button>

            <Link
              href="/coordenadoria/campos-estagio"
              className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </SystemShell>
  );
}
