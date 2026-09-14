"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  anonymize?: boolean;
};

function protectCnpjs(text: string) {
  const cnpjs: string[] = [];

  const protectedText = text.replace(
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
    (match) => {
      const token = `__CNPJ_${cnpjs.length}__`;
      cnpjs.push(match);
      return token;
    },
  );

  return { protectedText, cnpjs };
}

function restoreCnpjs(text: string, cnpjs: string[]) {
  return cnpjs.reduce(
    (result, cnpj, index) => result.replaceAll(`__CNPJ_${index}__`, cnpj),
    text,
  );
}

function preparePublicationText(text: string) {
  const { protectedText, cnpjs } = protectCnpjs(text);

  const sanitized = protectedText
    // CPF com rótulo.
    .replace(
      /(CPF\s*(?:nº|n\.|n°|n)?\s*)\*{0,2}\d{3}\.?\d{3}\.?\d{3}-?\d{2}\*{0,2}/gi,
      "$1(informação suprimida)",
    )

    // CPF solto.
    .replace(
      /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
      "(informação suprimida)",
    )

    // RG do Prefeito ou representante.
    .replace(
      /(portador(?:a)?\s+do\s+RG\s*(?:nº|n\.|n°|n)?\s*)\*{0,2}[^,\n]+?\*{0,2}(?=,\s*inscrito|\s*,|\n)/gi,
      "$1(informação suprimida)",
    )

    // Cédula de identidade do representante.
    .replace(
      /(portador(?:a)?\s+da\s+cédula\s+de\s+identidade\s*(?:nº|n\.|n°|n)?\s*)\*{0,2}[^,\n]+?\*{0,2}(?=,\s*inscrito|\s*,|\n)/gi,
      "$1(informação suprimida)",
    )

    // E-mail.
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "(informação suprimida)",
    )

    // Telefone com rótulo.
    .replace(
      /(telefone\s*)\(?\d{2}\)?\s*(?:9?\d{4})[-\s]?\d{4}/gi,
      "$1(informação suprimida)",
    )

    // Endereço residencial completo do Prefeito, sem mexer no endereço institucional.
    .replace(
      /residente e domiciliad[oa]\s+nesta cidade\s+na\s+[^,.\n]+(?:,\s*[^,.\n]+){0,5}(?=,\s*doravante)/gi,
      "residente e domiciliado (informação suprimida)",
    )

    // Endereço residencial completo do representante da instituição.
    .replace(
      /residente e domiciliad[oa]\s+(?:na|no|em)\s+[^,.\n]+(?:,\s*[^,.\n]+){0,5}(?=,\s*resolvem)/gi,
      "residente e domiciliado (informação suprimida)",
    );

  return restoreCnpjs(sanitized, cnpjs);
}

function stripMarkdownBold(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function toHtml(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");

      return `<p style="margin: 0 0 12px 0; text-align: justify;">${escaped}</p>`;
    })
    .join("");

  return `
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5;">
          ${paragraphs}
        </div>
      </body>
    </html>
  `;
}

async function copyRichText(markdownText: string) {
  const plainText = stripMarkdownBold(markdownText);
  const htmlText = toHtml(markdownText);

  if ("ClipboardItem" in window && navigator.clipboard.write) {
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlText], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);
    return;
  }

  await navigator.clipboard.writeText(plainText);
}

export function CopyTextButton({
  text,
  label = "Copiar",
  copiedLabel = "Copiado",
  className,
  anonymize = false,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const sourceText = anonymize ? preparePublicationText(text) : text;

      await copyRichText(sourceText);
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
