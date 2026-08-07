import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSupabasePublicKey, isSupabaseConfigured } from "@/lib/supabase/env";

/** Um client Supabase por request RSC. */
export const createSupabaseServerClient = cache(async () => {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // set em Server Component pode falhar — o middleware renova a sessão
          }
        },
      },
    },
  );
});
