"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { cropForIndex } from "@/lib/productImageCrop";
import type { ImageCrop, Product } from "@/types/product";

type Props = {
  images: string[];
  imageCrops?: ImageCrop[];
  alt: string;
  priority?: boolean;
  /** Dados para badge de status na capa. */
  product?: Pick<Product, "price" | "promoPrice" | "inStock">;
};

/** Galeria: capa em destaque + miniaturas; clique abre tela cheia. */
export function ProductGallery({
  images,
  imageCrops,
  alt,
  priority = false,
  product,
}: Props) {
  const list =
    images.length > 0 ? images : ["/products/placeholder-aviador.svg"];
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = list[Math.min(active, list.length - 1)]!;
  const hasMany = list.length > 1;

  function goPrev() {
    setActive((i) => (i - 1 + list.length) % list.length);
  }

  function goNext() {
    setActive((i) => (i + 1) % list.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && list.length > 1) {
        setActive((i) => (i - 1 + list.length) % list.length);
      }
      if (e.key === "ArrowRight" && list.length > 1) {
        setActive((i) => (i + 1) % list.length);
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, list.length]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[2rem] border border-line bg-mist-deep text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label={`Ampliar foto: ${alt}`}
      >
        <div className="relative aspect-[8/5]">
          <ProductImage
            src={current}
            alt={alt}
            crop={cropForIndex(imageCrops, active)}
            priority={priority}
            containerClassName="absolute inset-0"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {product ? (
            <div className="absolute left-4 top-4">
              <ProductStatusBadge product={product} />
            </div>
          ) : null}
          {hasMany ? (
            <p className="absolute bottom-3 right-3 rounded-full bg-ink/40 px-2 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              {active + 1} / {list.length}
            </p>
          ) : null}
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/45 px-2.5 py-1 text-[11px] font-medium text-white/90 opacity-90 backdrop-blur-sm transition group-hover:opacity-100">
            Toque para ampliar
          </span>
        </div>
      </button>

      {hasMany ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-brand"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
              aria-label={`Foto ${i + 1}`}
            >
              <ProductImage
                src={src}
                alt=""
                crop={cropForIndex(imageCrops, i)}
                containerClassName="absolute inset-0"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black/92"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos — ${alt}`}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate text-sm text-white/80">{alt}</p>
            <div className="flex shrink-0 items-center gap-3">
              {hasMany ? (
                <p className="tabular-nums text-sm text-white/70">
                  {active + 1} / {list.length}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Fechar
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6 sm:px-14"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMany ? (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25 sm:left-4"
                aria-label="Foto anterior"
              >
                ‹
              </button>
            ) : null}

            <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black/40 shadow-2xl aspect-[8/5]">
              <ProductImage
                src={current}
                alt={alt}
                crop={cropForIndex(imageCrops, active)}
                priority
                containerClassName="absolute inset-0"
                sizes="100vw"
              />
            </div>

            {hasMany ? (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25 sm:right-4"
                aria-label="Próxima foto"
              >
                ›
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
