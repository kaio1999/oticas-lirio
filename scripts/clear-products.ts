/**
 * Apaga TODOS os produtos e arquivos do bucket `products`.
 *   CONFIRM=YES npm run db:clear-products
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (process.env.CONFIRM !== "YES") {
  console.error(
    "Abortado. Para confirmar:\n  CONFIRM=YES npm run db:clear-products",
  );
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Defina URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "products";

async function removeStorageFolder(prefix: string) {
  const { data: listed, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000 });
  if (error) {
    console.warn(`[storage] list ${prefix || "/"}:`, error.message);
    return;
  }
  if (!listed?.length) return;

  const files = listed.filter((f) => f.name && f.id);
  const folders = listed.filter(
    (f) => f.name && (!f.id || f.metadata === null),
  );

  const paths = files.map((f) => (prefix ? `${prefix}/${f.name}` : f.name));
  if (paths.length) {
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (rmErr) console.warn(`[storage] remove:`, rmErr.message);
    else console.log(`[storage] ${paths.length} arquivo(s) em ${prefix || "/"}`);
  }

  for (const folder of folders) {
    if (!folder.name || folder.name === ".emptyFolderPlaceholder") continue;
    await removeStorageFolder(prefix ? `${prefix}/${folder.name}` : folder.name);
  }
}

async function main() {
  console.log(`Alvo: ${url}`);
  const { data: before, error } = await supabase.from("products").select("id");
  if (error) throw new Error(error.message);
  const ids = (before || []).map((r) => r.id as string);
  console.log(`Produtos: ${ids.length}`);

  await removeStorageFolder("");

  if (ids.length > 0) {
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .in("id", ids);
    if (delErr) throw new Error(delErr.message);
  }

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  console.log(`Restantes: ${count ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
