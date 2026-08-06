import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceKey,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/** Client com secret — só em Server Actions / Route Handlers. */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseServiceKey();
  if (!isSupabaseConfigured() || !url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (ou SECRET) é necessária para ações de admin",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
