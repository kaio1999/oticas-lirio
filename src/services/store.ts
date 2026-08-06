import { storeInfo as mockStoreInfo } from "@/data/store";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { mapStoreRow, type StoreSettingsRow } from "@/lib/supabase/mappers";
import type { StoreInfo } from "@/types/store";
import { unstable_cache } from "next/cache";

async function fetchStoreUncached(): Promise<StoreInfo> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return mockStoreInfo;

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[store] Supabase error:", error.message);
    return mockStoreInfo;
  }

  if (!data) return mockStoreInfo;
  return mapStoreRow(data as StoreSettingsRow);
}

export const getStoreInfo = unstable_cache(
  fetchStoreUncached,
  ["store-info"],
  { revalidate: 120 },
);
