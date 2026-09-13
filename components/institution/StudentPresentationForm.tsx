"use client";

import { useEffect, useMemo, useState } from "react";
import { submitStudentPresentation } from "@/app/instituicao/apresentar-estudante/actions";

type PresentationOption = {
  key: string;
  course_name: string;
  municipal_unit_name: string;
  remaining_slots: number;
  approved_students: number;
  already_presented: number;
  intended_period: string | null;
  possible_schedule: string | null;
  required_workload: number | null;
};

type Props = {
  options: PresentationOption[];
  clearDraft: boolean;
};

const draftKey = "integra-estagio:apresentar-estagiario:v1";

const weekDays = [
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

const weekDayIndex: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function maskPhone(value: string) {
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

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += digits[index] * (10 - index);
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) {
    firstDigit = 0;
  }

  if (firstDigit !== digits[9]) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += digits[index] * (11 - index);
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) {
    secondDigit = 0;
  }

  return secondDigit === digits[10];
}

function calculateAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function countSelectedDays(startDate: string, endDate: string, selectedDays: string[]) {
  if (!startDate || !endDate || selectedDays.length === 0) {
    return 0;
  }

  const selectedIndexes = new Set(selectedDays.map((day) => weekDayIndex[day]));
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let total = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (selectedIndexes.has(cursor.getDay())) {
      total += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

function calculateWorkload({
  startDate,
  endDate,
  startTime,
  endTime,
  breakMinutes,
  selectedDays,
}: {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  selectedDays: string[];
}) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const interval = Number(breakMinutes || 0);

  if (start === null || end === null || end <= start || interval < 0) {
    return {
      days: 0,
      dailyHours: 0,
      weeklyHours: 0,
      maximumHours: 0,
    };
  }

  const minutesPerDay = Math.max(0, end - start - interval);
  const dailyHours = minutesPerDay / 60;
  const days = countSelectedDays(startDate, endDate, selectedDays);

  return {
    days,
    dailyHours,
    weeklyHours: dailyHours * selectedDays.length,
    maximumHours: dailyHours * days,
  };
}

export function StudentPresentationForm({ options, clearDraft }: Props) {
  const firstOption = options[0];

  const [selectedDays, setSelectedDays] = useState<string[]>([
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
  ]);

  const [formValues, setFormValues] = useState<Record<string, string>>({
    authorization_key: firstOption?.key ?? "",
    required_workload: firstOption?.required_workload
      ? String(firstOption.required_workload)
      : "",
    daily_start_time: "07:00",
    daily_end_time: "12:00",
    break_minutes: "0",
  });

  useEffect(() => {
    if (clearDraft) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    const saved = window.localStorage.getItem(draftKey);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        values?: Record<string, string>;
        selectedDays?: string[];
      };

      setFormValues((current) => ({
        ...current,
        ...(parsed.values ?? {}),
      }));

      if (Array.isArray(parsed.selectedDays) && parsed.selectedDays.length > 0) {
        setSelectedDays(parsed.selectedDays);
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [clearDraft]);

  useEffect(() => {
    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        values: formValues,
        selectedDays,
      }),
    );
  }, [formValues, selectedDays]);

  const workload = useMemo(
    () =>
      calculateWorkload({
        startDate: formValues.internship_start_date ?? "",
        endDate: formValues.internship_end_date ?? "",
        startTime: formValues.daily_start_time ?? "",
        endTime: formValues.daily_end_time ?? "",
        breakMinutes: formValues.break_minutes ?? "0",
        selectedDays,
      }),
    [formValues, selectedDays],
  );

  const requiredWorkload = Number(formValues.required_workload || 0);
  const workloadIsEnough =
    requiredWorkload > 0 && workload.maximumHours >= requiredWorkload;

  const visibleWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (formValues.cpf && onlyDigits(formValues.cpf).length === 11 && !isValidCpf(formValues.cpf)) {
      warnings.push("CPF inválido. Confira os números informados.");
    }

    if (formValues.birth_date) {
      const today = new Date().toISOString().slice(0, 10);

      if (formValues.birth_date >= today) {
        warnings.push("A data de nascimento não pode ser a data atual ou futura.");
      } else if (calculateAge(formValues.birth_date) < 16) {
        warnings.push("A idade do estagiário deve ser compatível com a realização do estágio.");
      }
    }

    if (
      formValues.insurance_valid_from &&
      formValues.insurance_valid_until &&
      formValues.internship_start_date &&
      formValues.internship_end_date &&
      (formValues.insurance_valid_from > formValues.internship_start_date ||
        formValues.insurance_valid_until < formValues.internship_end_date)
    ) {
      warnings.push("O seguro deve cobrir todo o período previsto para o estágio.");
    }

    if (
      formValues.internship_start_date &&
      formValues.internship_end_date &&
      formValues.daily_start_time &&
      formValues.daily_end_time &&
      requiredWorkload > 0 &&
      !workloadIsEnough
    ) {
      warnings.push(
        `O período e horário informados comportam aproximadamente ${formatDecimal(
          workload.maximumHours,
        )}h, mas a carga obrigatória é de ${formatDecimal(requiredWorkload)}h.`,
      );
    }

    return warnings;
  }, [formValues, requiredWorkload, workload.maximumHours, workloadIsEnough]);

  function updateField(name: string, value: string) {
    let nextValue = value;

    if (name === "cpf") {
      nextValue = maskCpf(value);
    }

    if (name === "phone") {
      nextValue = maskPhone(value);
    }

    setFormValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const startDate = formValues.internship_start_date;
    const endDate = formValues.internship_end_date;
    const insuranceFrom = formValues.insurance_valid_from;
    const insuranceUntil = formValues.insurance_valid_until;

    if (formValues.cpf && !isValidCpf(formValues.cpf)) {
      event.preventDefault();
      alert("Informe um CPF válido para o estagiário.");
      return;
    }

    if (formValues.birth_date) {
      const today = new Date().toISOString().slice(0, 10);

      if (formValues.birth_date >= today) {
        event.preventDefault();
        alert("A data de nascimento do estagiário não pode ser a data atual ou futura.");
        return;
      }

      if (calculateAge(formValues.birth_date) < 16) {
        event.preventDefault();
        alert("A idade do estagiário deve ser compatível com a realização do estágio.");
        return;
      }
    }

    if (!startDate || !endDate) {
      event.preventDefault();
      alert("Informe a data de início e término previstas no Termo de Compromisso.");
      return;
    }

    if (startDate > endDate) {
      event.preventDefault();
      alert("A data de início do estágio não pode ser posterior à data de término.");
      return;
    }

    if (!insuranceFrom || !insuranceUntil) {
      event.preventDefault();
      alert("Informe a vigência completa do seguro.");
      return;
    }

    if (insuranceFrom > insuranceUntil) {
      event.preventDefault();
      alert("O início da vigência do seguro não pode ser posterior ao fim da vigência.");
      return;
    }

    if (insuranceFrom > startDate || insuranceUntil < endDate) {
      event.preventDefault();
      alert("O seguro deve cobrir todo o período previsto para o estágio.");
      return;
    }

    if (selectedDays.length === 0) {
      event.preventDefault();
      alert("Selecione ao menos um dia da semana para o estágio.");
      return;
    }

    if (!formValues.daily_start_time || !formValues.daily_end_time) {
      event.preventDefault();
      alert("Informe o horário de entrada e saída.");
      return;
    }

    const startTime = toMinutes(formValues.daily_start_time);
    const endTime = toMinutes(formValues.daily_end_time);

    if (startTime === null || endTime === null || endTime <= startTime) {
      event.preventDefault();
      alert("O horário de saída deve ser posterior ao horário de entrada.");
      return;
    }

    if (!workloadIsEnough) {
      event.preventDefault();
      alert(
        `O período e horário informados comportam aproximadamente ${formatDecimal(
          workload.maximumHours,
        )}h, mas a carga obrigatória é de ${formatDecimal(requiredWorkload)}h.`,
      );
    }
  }

  return (
    <form
      action={submitStudentPresentation}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {selectedDays.map((day) => (
        <input key={day} type="hidden" name="weekly_days" value={day} />
      ))}

      <input type="hidden" name="calculated_daily_workload" value={workload.dailyHours.toFixed(2)} />
      <input type="hidden" name="calculated_weekly_workload" value={workload.weeklyHours.toFixed(2)} />
      <input type="hidden" name="maximum_possible_workload" value={workload.maximumHours.toFixed(2)} />

      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-950">Dados do estagiário</h2>
        <p className="mt-1 text-xs text-slate-500">
          Preencha os dados do estagiário e vincule o Termo de Compromisso ao seguro correspondente.
        </p>
      </div>

      {visibleWarnings.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-black">Verifique antes de enviar</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {visibleWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4">
        <section className="grid gap-3">
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-bold text-slate-700">
              Sondagem autorizada / unidade municipal
            </span>
            <select
              name="authorization_key"
              required
              value={formValues.authorization_key ?? ""}
              onChange={(event) => updateField("authorization_key", event.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.course_name} — {option.municipal_unit_name} — {option.remaining_slots} vaga(s) restante(s)
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <TextInput label="Nome completo" name="full_name" required value={formValues.full_name ?? ""} onChange={updateField} />
            <TextInput label="CPF" name="cpf" placeholder="000.000.000-00" value={formValues.cpf ?? ""} onChange={updateField} />
            <TextInput label="E-mail" name="email" type="email" required value={formValues.email ?? ""} onChange={updateField} />
            <TextInput label="Telefone" name="phone" placeholder="(00) 00000-0000" value={formValues.phone ?? ""} onChange={updateField} />
            <TextInput label="Data de nascimento" name="birth_date" type="date" value={formValues.birth_date ?? ""} onChange={updateField} />
            <TextInput label="Matrícula acadêmica" name="academic_registration" required value={formValues.academic_registration ?? ""} onChange={updateField} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Termo de Compromisso
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Início previsto" name="internship_start_date" type="date" required value={formValues.internship_start_date ?? ""} onChange={updateField} />
            <TextInput label="Término previsto" name="internship_end_date" type="date" required value={formValues.internship_end_date ?? ""} onChange={updateField} />
            <TextInput label="Carga horária obrigatória" name="required_workload" type="number" min="1" required value={formValues.required_workload ?? ""} onChange={updateField} />
            <TextInput label="Supervisor previsto" name="supervisor_name" required value={formValues.supervisor_name ?? ""} onChange={updateField} />
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Dias e horários previstos
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                    selectedDays.includes(day.value)
                      ? "bg-teal-600 text-white ring-teal-600"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <TextInput label="Entrada" name="daily_start_time" type="time" required value={formValues.daily_start_time ?? ""} onChange={updateField} />
              <TextInput label="Saída" name="daily_end_time" type="time" required value={formValues.daily_end_time ?? ""} onChange={updateField} />
              <TextInput label="Intervalo em minutos" name="break_minutes" type="number" min="0" value={formValues.break_minutes ?? "0"} onChange={updateField} />

              <div className={`rounded-lg border px-3 py-2 text-xs ${
                workloadIsEnough
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}>
                <p className="font-black">Carga estimada</p>
                <p className="mt-1">
                  {formatDecimal(workload.maximumHours)}h possíveis / {formatDecimal(requiredWorkload)}h obrigatórias
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Seguro do estagiário
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Seguradora" name="insurance_company" required value={formValues.insurance_company ?? ""} onChange={updateField} />
            <TextInput label="Número da apólice" name="policy_number" required value={formValues.policy_number ?? ""} onChange={updateField} />
            <TextInput label="Início da vigência" name="insurance_valid_from" type="date" required value={formValues.insurance_valid_from ?? ""} onChange={updateField} />
            <TextInput label="Fim da vigência" name="insurance_valid_until" type="date" required value={formValues.insurance_valid_until ?? ""} onChange={updateField} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Documentos obrigatórios
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <FileInput label="Carta de apresentação" name="presentation_letter_file" />
            <FileInput label="Termo de Compromisso" name="commitment_term_file" />
            <FileInput label="Apólice/seguro" name="insurance_file" />
            <FileInput label="Comprovante de matrícula" name="enrollment_file" />
            <FileInput label="Documento de identificação" name="identification_file" />
          </div>
        </section>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-slate-700">Observações</span>
          <textarea
            name="notes"
            rows={3}
            value={formValues.notes ?? ""}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Registre informações complementares, se necessário."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold leading-5 text-slate-500">
          A Coordenadoria fará a validação formal dos documentos antes da autorização de início.
        </p>

        <button
          type="submit"
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
        >
          Enviar para conferência
        </button>
      </div>
    </form>
  );
}

function TextInput({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  min?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        min={min}
        onChange={(event) => onChange(name, event.target.value)}
        className="h-10 w-full min-w-0 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}

function FileInput({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        type="file"
        accept="application/pdf,.pdf"
        required
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-800 hover:file:bg-teal-100"
      />
    </label>
  );
}
