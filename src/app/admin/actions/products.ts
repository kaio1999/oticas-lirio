"use server";

import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import {
  adminProductPath,
  catalogProductPath,
  slugifyProductId,
} from "@/lib/admin/productId";
import { parseBRLCurrency } from "@/lib/format";
import {
  mergeImageCrops,
  parseImageCropsJson,
  type ImageCrop,
} from "@/lib/productImageCrop";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ProductCategory,
  ProductGender,
  ProductShape,
} from "@/types/product";
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
  const genderRaw = String(formData.get("gender") || "unissex");
  const gender: ProductGender =
    genderRaw === "feminino" || genderRaw === "masculino" || genderRaw === "unissex"
      ? genderRaw
      : "unissex";
  const material = String(formData.get("material") || "").trim();
  const price = parseBRLCurrency(String(formData.get("price") || "0"));
  const onPromo = formData.get("onPromo") === "on";
  const promoRaw = parseBRLCurrency(String(formData.get("promoPrice") || ""));
  let promo_price: number | null = null;
  let promoError: string | null = null;

  if (onPromo) {
    if (!Number.isFinite(promoRaw) || promoRaw < 0) {
      promoError = "promo-vazia";
    } else if (!(promoRaw < price)) {
      promoError = "promo-maior";
    } else {
      promo_price = promoRaw;
    }
  }

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
    gender,
    material,
    price,
    promo_price,
    promoError,
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

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableUploadError(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes("máximo 8 mb") || lower.includes("8 mb")) return false;
  if (lower.includes("envie apenas")) return false;
  if (lower.includes("too large") || lower.includes("payload")) return false;
  if (lower.includes("mime") || lower.includes("invalid content")) return false;
  return true;
}

async function uploadPhotos(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  productId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  const maxAttempts = 3;
  const backoffs = [500, 1500];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_BYTES) {
      throw new Error("Cada foto deve ter no máximo 8 MB.");
    }
    if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
      throw new Error("Envie apenas arquivos de imagem.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let lastError = "Falha ao enviar a foto.";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
        lastError = "";
        break;
      }

      lastError = error.message;
      const retryable = isRetryableUploadError(lastError);
      if (!retryable || attempt === maxAttempts) {
        break;
      }
      await sleep(backoffs[attempt - 1] ?? 1500);
    }

    if (lastError) {
      throw new Error(
        isRetryableUploadError(lastError)
          ? "Não foi possível enviar a foto (internet instável). Tente de novo."
          : lastError,
      );
    }
  }

  return urls;
}

function parseCropsFromForm(formData: FormData) {
  const keptCrops = parseImageCropsJson(
    String(formData.get("imageCropsKept") || "[]"),
  );
  const pendingCrops = parseImageCropsJson(
    String(formData.get("imageCropsPending") || "[]"),
  );
  return { keptCrops, pendingCrops };
}

function alignCropsToImages(
  images: string[],
  crops: ImageCrop[],
): ImageCrop[] {
  if (crops.length === 0) return [];
  if (crops.length >= images.length) {
    return crops.slice(0, images.length);
  }
  return [
    ...crops,
    ...Array.from({ length: images.length - crops.length }, () => ({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    })),
  ];
}

async function resolveImagesAndCrops(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  productId: string,
  formData: FormData,
  previousImages: string[] = [],
  previousCrops: ImageCrop[] = [],
  options: { requireAtLeastOne?: boolean } = {},
): Promise<{ images: string[]; imageCrops: ImageCrop[] }> {
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
  const { keptCrops, pendingCrops } = parseCropsFromForm(formData);
  const uploaded = await uploadPhotos(supabase, productId, photos);

  let images: string[];
  if (coverPending && uploaded.length > 0) {
    images = [uploaded[0]!, ...kept, ...uploaded.slice(1)];
  } else {
    images = [...kept, ...uploaded];
  }

  let imageCrops = mergeImageCrops(
    keptCrops,
    pendingCrops,
    uploaded.length,
    coverPending,
  );

  if (imageCrops.length === 0 && previousCrops.length > 0) {
    const keptIndexMap = kept.map((url) => previousImages.indexOf(url));
    imageCrops = keptIndexMap
      .filter((i) => i >= 0)
      .map((i) => previousCrops[i])
      .filter(Boolean) as ImageCrop[];
    if (coverPending && uploaded.length > 0 && pendingCrops[0]) {
      imageCrops = [pendingCrops[0], ...imageCrops, ...pendingCrops.slice(1)];
    } else {
      imageCrops = [...imageCrops, ...pendingCrops];
    }
  }

  const removed = previousImages.filter(
    (url) =>
      url.includes(`/storage/v1/object/public/${BUCKET}/`) &&
      !images.includes(url),
  );
  const paths = removed
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const real = images.filter((url) => !url.includes("placeholder-"));
  if (real.length === 0) {
    if (options.requireAtLeastOne) {
      throw new Error("foto");
    }
    return {
      images: ["/products/placeholder-aviador.svg"],
      imageCrops: [],
    };
  }

  return {
    images: real,
    imageCrops: alignCropsToImages(real, imageCrops),
  };
}

export async function createProductAction(formData: FormData) {
  await requirePermission("products");
  const supabase = await createSupabaseServerClient();
  if (!supabase) failProduto("/admin/produtos/novo", "config");

  const { promoError, ...fields } = parseProductFields(formData);
  if (!fields.name || !fields.brand || !fields.material || Number.isNaN(fields.price)) {
    failProduto("/admin/produtos/novo", "campos");
  }
  if (promoError) {
    failProduto("/admin/produtos/novo", promoError);
  }

  const customId = String(formData.get("id") || "").trim();
  const id = customId
    ? slugifyProductId(customId)
    : `lirio-${slugifyProductId(fields.name)}-${Date.now().toString(36).slice(-4)}`;

  if (!id) {
    failProduto("/admin/produtos/novo", "id-invalido");
  }

  let images: string[];
  let imageCrops: ImageCrop[];
  try {
    ({ images, imageCrops } = await resolveImagesAndCrops(
      supabase,
      id,
      formData,
      [],
      [],
      { requireAtLeastOne: true },
    ));
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
    image_crops: imageCrops,
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

  const { promoError, ...fields } = parseProductFields(formData);
  if (!fields.name || !fields.brand || !fields.material || Number.isNaN(fields.price)) {
    failProduto(adminProductPath(id), "campos");
  }
  if (promoError) {
    failProduto(adminProductPath(id), promoError);
  }

  const { data: current } = await supabase
    .from("products")
    .select("images, image_crops")
    .eq("id", id)
    .maybeSingle();

  const previousImages = (current?.images as string[] | undefined) ?? [];
  const previousCrops =
    (current?.image_crops as ImageCrop[] | undefined) ?? [];

  let images: string[];
  let imageCrops: ImageCrop[];
  try {
    ({ images, imageCrops } = await resolveImagesAndCrops(
      supabase,
      id,
      formData,
      previousImages,
      previousCrops,
    ));
  } catch (e) {
    failProduto(
      adminProductPath(id),
      e instanceof Error ? e.message : "falha",
    );
  }

  const { error } = await supabase
    .from("products")
    .update({ ...fields, images, image_crops: imageCrops })
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
