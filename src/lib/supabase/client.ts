import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublicKey,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export { getSupabasePublicKey, isSupabaseConfigured } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

/** Client anônimo para leitura pública (catálogo). */
export function createSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** @deprecated use createSupabaseBrowserClient de @/lib/supabase/browser */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!,
  );
  return browserClient;
}
