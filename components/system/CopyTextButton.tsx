"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyTextButton({
  text,
  label = "Copiar",
  copiedLabel = "Copiado",
  className,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      alert("Não foi possível copiar o texto automaticamente.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
      }
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
