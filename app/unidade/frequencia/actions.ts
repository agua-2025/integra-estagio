"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "presenca",
  "presenca_parcial",
  "falta",
  "falta_justificada",
];

function valueOf(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function goBack(id: string, type: string, message: string): never {
  redirect(
    `/unidade/frequencia/${encodeURIComponent(id)}?${type}=${encodeURIComponent(message)}`
  );
}

async function ensurePermission(internshipId: string) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth.user) {
    goBack(internshipId, "erro", "Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active, municipal_unit_id")
    .eq("id", auth.user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    profile.role !== "unidade" ||
    !profile.municipal_unit_id
  ) {
    goBack(internshipId, "erro", "Acesso não autorizado.");
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select("id, municipal_unit_id, status")
    .eq("id", internshipId)
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .single();

  if (internshipError || !internship) {
    goBack(internshipId, "erro", "Estágio não localizado nesta unidade.");
  }

  return {
    supabase,
    unitId: profile.municipal_unit_id,
    status: internship.status,
  };
}

export async function saveUnitAttendance(form: FormData) {
  const internshipId = valueOf(form, "internship_id");
  const recordId = valueOf(form, "record_id");
  const attendanceDate = valueOf(form, "attendance_date");
  const attendanceStatus = valueOf(form, "attendance_status");
  const notes = valueOf(form, "notes");
  const correctionReason = valueOf(form, "correction_reason");
  const startTime = valueOf(form, "start_time");
  const endTime = valueOf(form, "end_time");
  const breakText = valueOf(form, "break_minutes");

  if (!/^[0-9a-f-]{36}$/i.test(internshipId)) {
    redirect("/unidade/frequencia?erro=Identificador%20invalido");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
    goBack(internshipId, "erro", "Informe uma data válida.");
  }

  if (!allowedStatuses.includes(attendanceStatus)) {
    goBack(internshipId, "erro", "Selecione uma situação válida.");
  }

  if (recordId && !correctionReason) {
    goBack(internshipId, "erro", "Informe a justificativa da correção.");
  }

  if (attendanceStatus === "falta_justificada" && !notes) {
    goBack(internshipId, "erro", "Descreva a justificativa da falta.");
  }

  const isPresence = attendanceStatus.startsWith("presenca");
  const breakMinutes = isPresence ? Number(breakText) : 0;

  if (
    isPresence &&
    (
      !/^\d{2}:\d{2}$/.test(startTime) ||
      !/^\d{2}:\d{2}$/.test(endTime) ||
      !Number.isInteger(breakMinutes) ||
      breakMinutes < 0
    )
  ) {
    goBack(internshipId, "erro", "Confira entrada, saída e intervalo.");
  }

  const { supabase, unitId, status } = await ensurePermission(internshipId);

  if (status !== "em_andamento") {
    goBack(internshipId, "erro", "O estágio não está em andamento.");
  }

  const fields = {
    attendance_status: attendanceStatus,
    start_time: isPresence ? startTime : null,
    end_time: isPresence ? endTime : null,
    break_minutes: breakMinutes,
    notes: notes || null,
  };

  if (recordId) {
    const { data: existing, error: existingError } = await supabase
      .from("internship_attendance")
      .select("id, attendance_date")
      .eq("id", recordId)
      .eq("internship_id", internshipId)
      .eq("municipal_unit_id", unitId)
      .single();

    if (existingError || !existing) {
      goBack(internshipId, "erro", "Registro de frequência não encontrado.");
    }

    if (existing.attendance_date !== attendanceDate) {
      goBack(internshipId, "erro", "A data da frequência não pode ser alterada.");
    }

    const { error } = await supabase
      .from("internship_attendance")
      .update({
        ...fields,
        correction_reason: correctionReason,
      })
      .eq("id", recordId)
      .eq("internship_id", internshipId)
      .eq("municipal_unit_id", unitId);

    if (error) {
      goBack(internshipId, "erro", error.message);
    }
  } else {
    const { error } = await supabase
      .from("internship_attendance")
      .insert({
        internship_id: internshipId,
        municipal_unit_id: unitId,
        attendance_date: attendanceDate,
        ...fields,
      });

    if (error) {
      goBack(internshipId, "erro", error.message);
    }
  }

  revalidatePath(`/unidade/frequencia/${internshipId}`);
  revalidatePath("/unidade/frequencia");
  revalidatePath(`/unidade/estagiarios/${internshipId}`);

  goBack(
    internshipId,
    "sucesso",
    recordId ? "Frequência corrigida com auditoria." : "Frequência registrada."
  );
}
