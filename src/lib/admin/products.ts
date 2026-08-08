import { products as mockProducts } from "@/data/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/types/product";

export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export type AdminProductFilters = {
  q?: string;
  category?: ProductCategory | "todos";
  brand?: string | "todos";
  stock?: "todos" | "1" | "0";
  featured?: "todos" | "1" | "0";
  page?: number;
};

export type AdminProductListItem = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  promoPrice?: number | null;
  shape: Product["shape"];
  material: string;
  inStock: boolean;
  featured: boolean;
  sku?: string | null;
};

export type AdminProductsPageResult = {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function escapeIlike(value: string) {
  return value.replace(/[%_,]/g, "\\$&");
}

function toListItem(p: Product): AdminProductListItem {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    promoPrice: p.promoPrice ?? null,
    shape: p.shape,
    material: p.material,
    inStock: p.inStock,
    featured: Boolean(p.featured),
    sku: p.sku ?? null,
  };
}

function filterMock(
  list: Product[],
  filters: AdminProductFilters,
): Product[] {
  let result = [...list];
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)),
    );
  }
  if (filters.category && filters.category !== "todos") {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters.brand && filters.brand !== "todos") {
    result = result.filter(
      (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase(),
    );
  }
  if (filters.stock === "1") result = result.filter((p) => p.inStock);
  if (filters.stock === "0") result = result.filter((p) => !p.inStock);
  if (filters.featured === "1") result = result.filter((p) => p.featured);
  if (filters.featured === "0") result = result.filter((p) => !p.featured);
  return result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Lista admin com filtro + paginação no servidor (Supabase). */
export async function getAdminProductsPage(
  filters: AdminProductFilters = {},
): Promise<AdminProductsPageResult> {
  const pageSize = ADMIN_PRODUCTS_PAGE_SIZE;
  const page = Math.max(1, filters.page || 1);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const filtered = filterMock(mockProducts, filters);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      products: filtered.slice(start, start + pageSize).map(toListItem),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  let query = supabase
    .from("products")
    .select(
      "id, name, brand, category, price, promo_price, shape, material, in_stock, featured, sku",
      { count: "exact" },
    )
    .order("name", { ascending: true });

  const q = filters.q?.trim();
  if (q) {
    const safe = escapeIlike(q);
    query = query.or(
      `name.ilike.%${safe}%,brand.ilike.%${safe}%,id.ilike.%${safe}%,material.ilike.%${safe}%,sku.ilike.%${safe}%`,
    );
  }

  if (filters.category && filters.category !== "todos") {
    query = query.eq("category", filters.category);
  }
  if (filters.brand && filters.brand !== "todos") {
    query = query.eq("brand", filters.brand);
  }
  if (filters.stock === "1") query = query.eq("in_stock", true);
  if (filters.stock === "0") query = query.eq("in_stock", false);
  if (filters.featured === "1") query = query.eq("featured", true);
  if (filters.featured === "0") query = query.eq("featured", false);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[admin/products]", error.message);
    return { products: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  // Página fora do alcance → ultima página válida
  if (total > 0 && page > totalPages) {
    return getAdminProductsPage({ ...filters, page: totalPages });
  }

  const products: AdminProductListItem[] = (data || []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as ProductCategory,
    price: Number(row.price),
    promoPrice:
      row.promo_price == null || row.promo_price === undefined
        ? null
        : Number(row.promo_price),
    shape: row.shape as Product["shape"],
    material: row.material as string,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    sku: (row.sku as string | null) ?? null,
  }));

  return { products, total, page, pageSize, totalPages };
}

/** Marcas distintas para o select do admin (leve). */
export async function getAdminProductBrands(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [...new Set(mockProducts.map((p) => p.brand))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .order("brand");

  if (error || !data) return [];
  return [
    ...new Set(
      data
        .map((r) => String(r.brand || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
