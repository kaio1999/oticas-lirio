import { products as mockProducts } from "@/data/products";
import { productEffectivePrice, productHasPromo } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { mapProductRow, PRODUCT_PUBLIC_COLUMNS, PRODUCT_PUBLIC_COLUMNS_LEGACY, type ProductRow } from "@/lib/supabase/mappers";
import type {
  Product,
  ProductCategory,
  ProductGender,
  ProductShape,
} from "@/types/product";
import { unstable_cache } from "next/cache";
import { resolveProductGender } from "@/lib/format";

export type CatalogSort =
  | "nome"
  | "nome-desc"
  | "preco-asc"
  | "preco-desc"
  | "promo";

export type ProductFilters = {
  query?: string;
  category?: ProductCategory | "todos";
  shape?: ProductShape | "todos";
  gender?: ProductGender | "todos";
  brand?: string | "todos";
  material?: string | "todos";
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  /** Só produtos com promoção ativa. */
  promoOnly?: boolean;
  sort?: CatalogSort;
};

function applySort(list: Product[], sort: CatalogSort = "nome"): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "nome-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
    case "preco-asc":
      return sorted.sort(
        (a, b) => productEffectivePrice(a) - productEffectivePrice(b),
      );
    case "preco-desc":
      return sorted.sort(
        (a, b) => productEffectivePrice(b) - productEffectivePrice(a),
      );
    case "promo":
      return sorted.sort((a, b) => {
        const ap = productHasPromo(a) ? 0 : 1;
        const bp = productHasPromo(b) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return a.name.localeCompare(b.name, "pt-BR");
      });
    case "nome":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }
}

function applyFilters(list: Product[], filters: ProductFilters): Product[] {
  let result = [...list];

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q)),
    );
  }

  if (filters.category && filters.category !== "todos") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.shape && filters.shape !== "todos") {
    result = result.filter((p) => p.shape === filters.shape);
  }

  if (filters.gender && filters.gender !== "todos") {
    result = result.filter(
      (p) => resolveProductGender(p.gender) === filters.gender,
    );
  }

  if (filters.brand && filters.brand !== "todos") {
    result = result.filter(
      (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase(),
    );
  }

  if (filters.material && filters.material !== "todos") {
    result = result.filter(
      (p) => p.material.toLowerCase() === filters.material!.toLowerCase(),
    );
  }

  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    result = result.filter(
      (p) => productEffectivePrice(p) >= filters.minPrice!,
    );
  }

  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    result = result.filter(
      (p) => productEffectivePrice(p) <= filters.maxPrice!,
    );
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  if (filters.promoOnly) {
    result = result.filter((p) => productHasPromo(p));
  }

  return applySort(result, filters.sort ?? "nome");
}

async function fetchAllProductsUncached(): Promise<Product[] | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const primary = await supabase
    .from("products")
    .select(PRODUCT_PUBLIC_COLUMNS)
    .order("name", { ascending: true });

  if (!primary.error) {
    return (primary.data as ProductRow[]).map(mapProductRow);
  }

  const missingGender =
    /gender/i.test(primary.error.message) ||
    /column .* does not exist/i.test(primary.error.message);

  if (missingGender) {
    console.warn(
      "[products] Coluna gender ausente — usando fallback. Rode supabase/products-gender.sql",
    );
    const legacy = await supabase
      .from("products")
      .select(PRODUCT_PUBLIC_COLUMNS_LEGACY)
      .order("name", { ascending: true });

    if (legacy.error) {
      console.error("[products] Supabase error:", legacy.error.message);
      return null;
    }
    return (legacy.data as ProductRow[]).map(mapProductRow);
  }

  console.error("[products] Supabase error:", primary.error.message);
  return null;
}

const getCachedProducts = unstable_cache(
  async () => {
    const remote = await fetchAllProductsUncached();
    return remote ?? mockProducts;
  },
  ["products-all"],
  { revalidate: 60, tags: ["products"] },
);

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const list = await getCachedProducts();
  return applyFilters(list, filters);
}

export async function getProductById(
  id: string,
): Promise<Product | undefined> {
  const list = await getCachedProducts();
  return list.find((p) => p.id === id);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const list = await getCachedProducts();
  return list.filter((p) => p.featured);
}

export async function getMaterials(): Promise<string[]> {
  const list = await getCachedProducts();
  return [...new Set(list.map((p) => p.material))].sort();
}

export async function getBrands(): Promise<string[]> {
  const list = await getCachedProducts();
  return [...new Set(list.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const list = await getCachedProducts();
  if (list.length === 0) return { min: 0, max: 1000 };
  const prices = list.map((p) => productEffectivePrice(p));
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  return { min, max: max <= min ? min + 1 : max };
}
