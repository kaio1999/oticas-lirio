import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfile, type AdminProfile, type ProfileRow } from "@/types/admin";
import { redirect } from "next/navigation";

/** Dedupe getUser no mesmo request (layout + página). */
export const getSessionUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Dedupe perfil admin no mesmo request. */
export const getAdminProfile = cache(
  async (): Promise<AdminProfile | null> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const user = await getSessionUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, can_manage_products, can_manage_team, active, created_at",
      )
      .eq("id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfile(data as ProfileRow);
  },
);

export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) {
    redirect("/admin/login");
  }
  return profile;
}

export async function requirePermission(
  permission: "products" | "team",
): Promise<AdminProfile> {
  const profile = await requireAdmin();
  if (permission === "products" && !profile.canManageProducts) {
    redirect("/admin?erro=sem-permissao");
  }
  if (permission === "team" && !profile.canManageTeam) {
    redirect("/admin?erro=sem-permissao");
  }
  return profile;
}
