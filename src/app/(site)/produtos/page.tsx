import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogFilters } from "@/features/catalog/CatalogFilters";
import { CatalogGrid } from "@/features/catalog/CatalogGrid";
import type { ProductCategory, ProductGender, ProductShape } from "@/types/product";
import {
  type CatalogSort,
  getBrands,
  getMaterials,
  getPriceBounds,
  getProducts,
} from "@/services/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explore óculos de grau, sol, infantil e acessórios da Óticas Lírio.",
};

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  formato?: string;
  genero?: string;
  marca?: string;
  material?: string;
  precoMin?: string;
  precoMax?: string;
  estoque?: string;
  promo?: string;
  ordem?: string;
}>;

function parseSort(raw?: string): CatalogSort {
  const allowed: CatalogSort[] = [
    "nome",
    "nome-desc",
    "preco-asc",
    "preco-desc",
    "promo",
  ];
  if (raw && (allowed as string[]).includes(raw)) return raw as CatalogSort;
  return "nome";
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [materials, brands, priceBounds] = await Promise.all([
    getMaterials(),
    getBrands(),
    getPriceBounds(),
  ]);

  const minPrice = params.precoMin != null ? Number(params.precoMin) : undefined;
  const maxPrice = params.precoMax != null ? Number(params.precoMax) : undefined;

  const products = await getProducts({
    query: params.q,
    category: (params.categoria as ProductCategory | "todos") || "todos",
    shape: (params.formato as ProductShape | "todos") || "todos",
    gender: (params.genero as ProductGender | "todos") || "todos",
    brand: params.marca || "todos",
    material: params.material || "todos",
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    inStockOnly: params.estoque === "1",
    promoOnly: params.promo === "1",
    sort: parseSort(params.ordem),
  });

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
          Catálogo
        </p>
        <h1 className="mt-2 font-display text-4xl text-brand-ink sm:text-5xl">
          Encontre o seu próximo olhar
        </h1>
        <p className="mt-3 text-ink-muted">
          Filtre por marca, gênero, promoção, categoria e faixa de preço — e
          ordene como preferir. Os valores são referência; confirme na loja.
        </p>
      </div>

      <div className="mt-8">
        <Suspense
          fallback={<div className="h-40 animate-pulse rounded-2xl bg-white/50" />}
        >
          <CatalogFilters
            materials={materials}
            brands={brands}
            priceBounds={priceBounds}
          />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-3xl text-brand">
            Nenhum modelo neste filtro
          </p>
          <p className="mt-2 text-ink-muted">
            Tente limpar a busca ou escolher outra categoria.
          </p>
        </div>
      ) : (
        <CatalogGrid products={products} />
      )}
    </div>
  );
}
