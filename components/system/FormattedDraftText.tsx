type FormattedDraftTextProps = {
  text: string;
};

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-black text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export function FormattedDraftText({ text }: FormattedDraftTextProps) {
  return (
    <div className="space-y-3 text-xs leading-6 text-slate-800">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {renderInlineBold(paragraph)}
        </p>
      ))}
    </div>
  );
}
