"use client";

import { useMemo, useState } from "react";

type MaskType = "cnpj" | "phone" | "cep" | "cpf";

type MaskedInputProps = {
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  mask: MaskType;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function applyCnpjMask(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function applyCpfMask(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function applyCepMask(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function applyPhoneMask(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function applyMask(value: string, mask: MaskType) {
  if (mask === "cnpj") return applyCnpjMask(value);
  if (mask === "cpf") return applyCpfMask(value);
  if (mask === "cep") return applyCepMask(value);
  return applyPhoneMask(value);
}

export function MaskedInput({
  name,
  defaultValue,
  disabled,
  required,
  placeholder,
  className,
  maxLength,
  mask,
}: MaskedInputProps) {
  const initialValue = useMemo(
    () => applyMask(String(defaultValue ?? ""), mask),
    [defaultValue, mask],
  );

  const [value, setValue] = useState(initialValue);

  return (
    <input
      name={name}
      required={required}
      disabled={disabled}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      className={className}
      onChange={(event) => setValue(applyMask(event.target.value, mask))}
    />
  );
}
