"use server";

import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function failEquipe(message: string): never {
  redirect(
    `/admin/equipe?erro=${encodeURIComponent(translateAdminError(message))}`,
  );
}

export async function createStaffAction(formData: FormData) {
  const actor = await requirePermission("team");

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const password = String(formData.get("password") || "");
  const canManageProducts = formData.get("canManageProducts") === "on";
  const canManageTeam = formData.get("canManageTeam") === "on";

  if (!email || !fullName || password.length < 8) {
    failEquipe("campos");
  }

  const grantTeam = actor.role === "owner" && canManageTeam;

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    failEquipe("config");
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createError || !created.user) {
    failEquipe(createError?.message || "falha");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    role: "staff",
    can_manage_products: canManageProducts,
    can_manage_team: grantTeam,
    active: true,
  });

  if (profileError) {
    failEquipe(profileError.message);
  }

  revalidatePath("/admin/equipe");
  redirect("/admin/equipe?ok=criado");
}

export async function updateStaffAction(formData: FormData) {
  const actor = await requirePermission("team");
  const supabase = await createSupabaseServerClient();
  if (!supabase) failEquipe("config");

  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const canManageProducts = formData.get("canManageProducts") === "on";
  const canManageTeam = formData.get("canManageTeam") === "on";
  const active = formData.get("active") === "on";
  const role = String(formData.get("role") || "staff");

  if (!id || !fullName) {
    failEquipe("campos");
  }

  if (id === actor.id && role !== "owner") {
    failEquipe("dono");
  }

  const payload = {
    full_name: fullName,
    can_manage_products: role === "owner" ? true : canManageProducts,
    can_manage_team:
      role === "owner" ? true : actor.role === "owner" && canManageTeam,
    active: id === actor.id ? true : active,
    role: role === "owner" ? "owner" : "staff",
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", id);
  if (error) {
    failEquipe(error.message);
  }

  revalidatePath("/admin/equipe");
  redirect("/admin/equipe?ok=salvo");
}
