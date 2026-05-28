type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
};

export function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
