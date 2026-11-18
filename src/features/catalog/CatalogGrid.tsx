"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

const PAGE_SIZE = 12;

export function CatalogGrid({ products }: { products: Product[] }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listKey = products.map((product) => product.id).join("|");
  const [windowState, setWindowState] = useState({
    key: listKey,
    visible: PAGE_SIZE,
  });

  if (windowState.key !== listKey) {
    setWindowState({ key: listKey, visible: PAGE_SIZE });
  }

  const visible =
    windowState.key === listKey ? windowState.visible : PAGE_SIZE;
  const shown = products.slice(0, visible);
  const hasMore = shown.length < products.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setWindowState((current) => {
          const count = current.key === listKey ? current.visible : PAGE_SIZE;
          if (count >= products.length) return current;
          return {
            key: listKey,
            visible: Math.min(count + PAGE_SIZE, products.length),
          };
        });
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, listKey, products.length, visible]);

  return (
    <>
      <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
        {shown.length} de {products.length}{" "}
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

      {hasMore ? <div ref={sentinelRef} className="h-px" aria-hidden /> : null}
    </>
  );
}
