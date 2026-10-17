"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = [
  "feriado",
  "ponto_facultativo",
  "recesso",
  "suspensao_atividades",
  "dispensa_coletiva",
];

function fail(message: string): never {
  redirect(`/coordenadoria/calendario?erro=${encodeURIComponent(message)}`);
}

export async function createCalendarException(form: FormData) {
  const type = String(form.get("exception_type") ?? "").trim();
  const unitId = String(form.get("municipal_unit_id") ?? "").trim();
  const startDate = String(form.get("start_date") ?? "").trim();
  const endDate = String(form.get("end_date") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!allowedTypes.includes(type)) {
    fail("Selecione um tipo de exceção válido.");
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    startDate > endDate
  ) {
    fail("Informe um período válido.");
  }

  if (description.length < 5) {
    fail("Informe o motivo da suspensão ou dispensa.");
  }

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth.user) {
    fail("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", auth.user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    fail("Acesso reservado à Coordenadoria.");
  }

  if (unitId && !/^[0-9a-f-]{36}$/i.test(unitId)) {
    fail("Unidade municipal inválida.");
  }

  if (unitId) {
    const { data: unit, error: unitError } = await supabase
      .from("municipal_units")
      .select("id")
      .eq("id", unitId)
      .single();

    if (unitError || !unit) {
      fail("Unidade municipal não encontrada.");
    }
  }

  const { error } = await supabase
    .from("unit_calendar_exceptions")
    .insert({
      municipal_unit_id: unitId || null,
      exception_type: type,
      start_date: startDate,
      end_date: endDate,
      description,
    });

  if (error) fail(error.message);

  revalidatePath("/coordenadoria/calendario");
  revalidatePath("/unidade/frequencia");
  revalidatePath("/unidade/relatorio-final");

  redirect("/coordenadoria/calendario?sucesso=1");
}
