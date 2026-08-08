"use server";

import { requireOwner } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StoreHours } from "@/types/store";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

function failHorarios(message: string): never {
  redirect(
    `/admin/horarios?erro=${encodeURIComponent(translateAdminError(message))}`,
  );
}

export async function updateStoreHoursAction(formData: FormData) {
  await requireOwner();
  const supabase = await createSupabaseServerClient();
  if (!supabase) failHorarios("config");

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("hoursJson") || "[]"));
  } catch {
    failHorarios("horarios-invalidos");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    failHorarios("horarios-vazios");
  }

  const hours: StoreHours[] = [];
  for (const row of parsed) {
    if (!row || typeof row !== "object") continue;
    const days = String((row as { days?: string }).days || "").trim();
    const closed = Boolean((row as { closed?: boolean }).closed);
    const timeRaw = String((row as { time?: string }).time || "").trim();
    const time = closed ? "Fechado" : timeRaw;

    if (!days) failHorarios("horarios-dias");
    if (!time) failHorarios("horarios-hora");

    hours.push({ days, time });
  }

  if (hours.length === 0) failHorarios("horarios-vazios");

  const { error } = await supabase
    .from("store_settings")
    .update({ hours })
    .eq("id", 1);

  if (error) failHorarios(error.message);

  revalidateTag("store", "max");
  revalidatePath("/contato");
  revalidatePath("/");
  revalidatePath("/admin/horarios");
  redirect("/admin/horarios?ok=1");
}
