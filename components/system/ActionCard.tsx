type ActionCardProps = {
  title: string;
  description: string;
  status?: string;
};

export function ActionCard({ title, description, status }: ActionCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {status ? (
          <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {status}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
