/**
 * Seed: envia mocks locais para o Supabase.
 *
 * 1. Rode supabase/schema.sql no SQL Editor
 * 2. Preencha .env.local (ver .env.example)
 * 3. npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { products } from "../src/data/products";
import { storeInfo } from "../src/data/store";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) no .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    images: p.images,
    model_3d_url: p.model3dUrl ?? null,
    shape: p.shape,
    gender: p.gender ?? "unissex",
    material: p.material,
    colors: p.colors,
    in_stock: p.inStock,
    description: p.description,
    featured: Boolean(p.featured),
  }));

  const { error: productsError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id" });

  if (productsError) {
    throw new Error(
      `products: ${productsError.message}\n` +
        `Dica: rode supabase/grants.sql no SQL Editor e confira se SUPABASE_SERVICE_ROLE_KEY é a chave secret (sb_secret_... ou JWT service_role), não a publishable.`,
    );
  }

  const storeRow = {
    id: 1,
    name: storeInfo.name,
    legal_name: storeInfo.legalName,
    cnpj: storeInfo.cnpj,
    slogan: storeInfo.slogan,
    founder: storeInfo.founder,
    story: storeInfo.story,
    value_items: storeInfo.values,
    differentials: storeInfo.differentials,
    address: storeInfo.address,
    phone: storeInfo.phone,
    phone_e164: storeInfo.phoneE164,
    email: storeInfo.email,
    instagram: storeInfo.instagram,
    instagram_handle: storeInfo.instagramHandle,
    hours: storeInfo.hours,
    opened_at: storeInfo.openedAt,
  };

  const { error: storeError } = await supabase
    .from("store_settings")
    .upsert(storeRow, { onConflict: "id" });

  if (storeError) {
    throw new Error(`store_settings: ${storeError.message}`);
  }

  console.log(`Seed ok: ${productRows.length} produtos + store_settings.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
