"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

const PAGE_SIZE = 12;

export function CatalogGrid({ products }: { products: Product[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const listKey = products.map((product) => product.id).join("|");

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [listKey]);

  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;
  const nextCount = Math.min(PAGE_SIZE, remaining);

  return (
    <>
      <p className="mt-6 text-sm text-ink-muted">
        Mostrando {shown.length} de {products.length}{" "}
        {products.length === 1 ? "modelo" : "modelos"}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 2}
          />
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            Carregar mais {nextCount}
          </button>
        </div>
      ) : null}
    </>
  );
}
