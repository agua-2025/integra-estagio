"use client";

import { useState } from "react";

type FieldFormGuardProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function FieldFormGuard({
  action,
  children,
  className,
}: FieldFormGuardProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    const status = String(formData.get("status") ?? "");
    const isPublic = formData.get("is_public") === "on";
    const selectedUnits = formData.getAll("unit_ids").filter(Boolean);

    if ((status === "ativo" || isPublic) && selectedUnits.length === 0) {
      event.preventDefault();

      setMessage(
        "Para ativar ou publicar um campo de estágio, selecione ao menos uma unidade municipal vinculada.",
      );

      return;
    }

    setMessage("");
  }

  return (
    <form action={action} onSubmit={handleSubmit} className={className}>
      {message && (
        <div className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {message}
        </div>
      )}

      {children}
    </form>
  );
}
