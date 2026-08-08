"use client";

import { useRef } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
};

const PAGE_SIZE = 4;

/** Destaques em carrossel simples — até 4 itens por “página” de scroll. */
export function FeaturedProducts({ products }: Props) {
  const list = products.slice(0, PAGE_SIZE);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (list.length === 0) return null;

  function scrollByPage(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  const canScroll = list.length > 1;

  return (
    <section className="container-page pb-14 pt-6 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
            Destaques
          </p>
          <h2 className="mt-2 font-display text-3xl text-brand-ink sm:text-4xl">
            Modelos em evidência
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {canScroll ? (
            <div className="mr-1 hidden items-center gap-1 sm:flex">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => scrollByPage(-1)}
                className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-brand-ink transition hover:border-brand/40"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próximo"
                onClick={() => scrollByPage(1)}
                className="flex size-10 items-center justify-center rounded-full border border-line bg-white text-brand-ink transition hover:border-brand/40"
              >
                ›
              </button>
            </div>
          ) : null}
          <Link href="/produtos" className="btn btn-secondary">
            Ver catálogo
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
        aria-label="Modelos em evidência"
      >
        {list.map((product, index) => (
          <div
            key={product.id}
            className="w-[min(78vw,300px)] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <ProductCard product={product} priority={index < 2} />
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-ink-muted sm:hidden">
        Deslize para ver mais
      </p>
    </section>
  );
}
