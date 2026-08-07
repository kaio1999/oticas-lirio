import { products as mockProducts } from "@/data/products";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { mapProductRow, PRODUCT_PUBLIC_COLUMNS, type ProductRow } from "@/lib/supabase/mappers";
import type { Product, ProductCategory, ProductShape } from "@/types/product";
import { unstable_cache } from "next/cache";

export type ProductFilters = {
  query?: string;
  category?: ProductCategory | "todos";
  shape?: ProductShape | "todos";
  brand?: string | "todos";
  material?: string | "todos";
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
};

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
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  return result;
}

async function fetchAllProductsUncached(): Promise<Product[] | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_PUBLIC_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    console.error("[products] Supabase error:", error.message);
    return null;
  }

  return (data as ProductRow[]).map(mapProductRow);
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
  const prices = list.map((p) => p.price);
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  return { min, max: max <= min ? min + 1 : max };
}
