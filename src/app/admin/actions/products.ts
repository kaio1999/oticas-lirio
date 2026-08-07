"use server";

import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import {
  adminProductPath,
  catalogProductPath,
  slugifyProductId,
} from "@/lib/admin/productId";
import { parseBRLCurrency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductCategory, ProductShape } from "@/types/product";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const BUCKET = "products";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function failProduto(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(translateAdminError(message))}`);
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

function parseOptionalMm(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 10) / 10;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const category = String(formData.get("category") || "grau") as ProductCategory;
  const shape = String(formData.get("shape") || "outro") as ProductShape;
  const material = String(formData.get("material") || "").trim();
  const price = parseBRLCurrency(String(formData.get("price") || "0"));
  const description = String(formData.get("description") || "").trim();
  const colorsRaw = String(formData.get("colors") || "");
  const colors = colorsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const sku = String(formData.get("sku") || "").trim() || null;

  return {
    name,
    brand,
    category,
    shape,
    material,
    price,
    description,
    colors,
    in_stock: inStock,
    featured,
    sku,
    lens_width_mm: parseOptionalMm(formData.get("lensWidthMm")),
    bridge_mm: parseOptionalMm(formData.get("bridgeMm")),
    temple_mm: parseOptionalMm(formData.get("templeMm")),
    frame_width_mm: parseOptionalMm(formData.get("frameWidthMm")),
  };
}

async function uploadPhotos(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  productId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_BYTES) {
      throw new Error("Cada foto deve ter no máximo 8 MB.");
    }
    if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
      throw new Error("Envie apenas arquivos de imagem.");
    }

    const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

async function resolveImages(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  productId: string,
  formData: FormData,
  previousImages: string[] = [],
  options: { requireAtLeastOne?: boolean } = {},
): Promise<string[]> {
  const kept = formData
    .getAll("keptImages")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const photos = formData.getAll("photos").filter((entry): entry is File => {
    return (
      typeof entry === "object" &&
      entry !== null &&
      "arrayBuffer" in entry &&
      "size" in entry &&
      (entry as File).size > 0
    );
  });

  const coverPending = String(formData.get("coverPending") || "") === "1";
  const uploaded = await uploadPhotos(supabase, productId, photos);

  // Capa = 1ª imagem. Se a capa for foto nova, ela sobe para o início.
  let next: string[];
  if (coverPending && uploaded.length > 0) {
    next = [uploaded[0]!, ...kept, ...uploaded.slice(1)];
  } else {
    next = [...kept, ...uploaded];
  }

  const removed = previousImages.filter(
    (url) =>
      url.includes(`/storage/v1/object/public/${BUCKET}/`) &&
      !next.includes(url),
  );
  const paths = removed
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const real = next.filter((url) => !url.includes("placeholder-"));
  if (real.length === 0) {
    if (options.requireAtLeastOne) {
      throw new Error("foto");
    }
    return ["/products/placeholder-aviador.svg"];
  }
  return real;
}

export async function createProductAction(formData: FormData) {
  await requirePermission("products");
  const supabase = await createSupabaseServerClient();
  if (!supabase) failProduto("/admin/produtos/novo", "config");

  const fields = parseProductFields(formData);
  if (!fields.name || !fields.brand || !fields.material || Number.isNaN(fields.price)) {
    failProduto("/admin/produtos/novo", "campos");
  }

  const customId = String(formData.get("id") || "").trim();
  const id = customId
    ? slugifyProductId(customId)
    : `lirio-${slugifyProductId(fields.name)}-${Date.now().toString(36).slice(-4)}`;

  if (!id) {
    failProduto("/admin/produtos/novo", "id-invalido");
  }

  let images: string[];
  try {
    images = await resolveImages(supabase, id, formData, [], {
      requireAtLeastOne: true,
    });
  } catch (e) {
    failProduto(
      "/admin/produtos/novo",
      e instanceof Error ? e.message : "falha",
    );
  }

  const { error } = await supabase.from("products").insert({
    id,
    ...fields,
    images,
  });

  if (error) {
    failProduto("/admin/produtos/novo", error.message);
  }

  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?ok=criado");
}

export async function updateProductAction(formData: FormData) {
  await requirePermission("products");
  const supabase = await createSupabaseServerClient();
  if (!supabase) failProduto("/admin/produtos", "config");

  const id = String(formData.get("id") || "").trim();
  if (!id) failProduto("/admin/produtos", "id");

  const fields = parseProductFields(formData);
  if (!fields.name || !fields.brand || !fields.material || Number.isNaN(fields.price)) {
    failProduto(adminProductPath(id), "campos");
  }

  const { data: current } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  const previousImages = (current?.images as string[] | undefined) ?? [];

  let images: string[];
  try {
    images = await resolveImages(supabase, id, formData, previousImages);
  } catch (e) {
    failProduto(
      adminProductPath(id),
      e instanceof Error ? e.message : "falha",
    );
  }

  const { error } = await supabase
    .from("products")
    .update({ ...fields, images })
    .eq("id", id);

  if (error) {
    failProduto(adminProductPath(id), error.message);
  }

  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(catalogProductPath(id));
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?ok=salvo");
}

export async function deleteProductAction(formData: FormData) {
  await requirePermission("products");
  const supabase = await createSupabaseServerClient();
  if (!supabase) failProduto("/admin/produtos", "config");

  const id = String(formData.get("id") || "").trim();
  if (!id) failProduto("/admin/produtos", "id");

  const { data: current } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  const images = (current?.images as string[] | undefined) ?? [];
  const paths = images
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  // limpa pasta do produto
  const { data: listed } = await supabase.storage.from(BUCKET).list(id);
  if (listed?.length) {
    await supabase.storage
      .from(BUCKET)
      .remove(listed.map((f) => `${id}/${f.name}`));
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    failProduto("/admin/produtos", error.message);
  }

  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?ok=excluido");
}

export async function toggleStockAction(formData: FormData) {
  await requirePermission("products");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const id = String(formData.get("id") || "").trim();
  const inStock = formData.get("inStock") === "true";
  if (!id) return;

  await supabase.from("products").update({ in_stock: !inStock }).eq("id", id);
  revalidateTag("products", "max");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(catalogProductPath(id));
}
