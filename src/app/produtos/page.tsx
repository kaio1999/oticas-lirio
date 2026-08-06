import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/features/catalog/CatalogFilters";
import type { ProductCategory, ProductShape } from "@/types/product";
import { getBrands, getMaterials, getPriceBounds, getProducts } from "@/services/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explore óculos de grau, sol, infantil e acessórios da Óticas Lírio.",
};

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  formato?: string;
  marca?: string;
  material?: string;
  precoMin?: string;
  precoMax?: string;
  estoque?: string;
}>;

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
    brand: params.marca || "todos",
    material: params.material || "todos",
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    inStockOnly: params.estoque === "1",
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
          Filtre por marca, categoria, formato, material e faixa de preço. Os
          valores são referência — confirme disponibilidade na loja.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white/50" />}>
          <CatalogFilters
            materials={materials}
            brands={brands}
            priceBounds={priceBounds}
          />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        {products.length}{" "}
        {products.length === 1 ? "modelo encontrado" : "modelos encontrados"}
      </p>

      {products.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-3xl text-brand">Nenhum modelo neste filtro</p>
          <p className="mt-2 text-ink-muted">
            Tente limpar a busca ou escolher outra categoria.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
