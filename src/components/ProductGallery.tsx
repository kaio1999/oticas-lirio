"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { useHorizontalSwipe } from "@/lib/useHorizontalSwipe";
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
  const swipe = useHorizontalSwipe(list.length > 1, (direction) => {
    setActive((i) => (i + direction + list.length) % list.length);
  });
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
        onClickCapture={swipe.consumeClick}
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
        style={{ touchAction: hasMany ? "pan-y" : undefined }}
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
          className="fixed inset-0 z-[80] flex flex-col bg-[#0a1214]/95"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos — ${alt}`}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate text-sm text-white/75">{alt}</p>
            <div className="flex shrink-0 items-center gap-3">
              {hasMany ? (
                <p className="rounded-full bg-white/10 px-2.5 py-1 tabular-nums text-xs font-medium text-white">
                  {active + 1} / {list.length}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-brand-ink shadow-lg transition hover:bg-[#f3fbfc]"
              >
                <span aria-hidden className="text-base leading-none">
                  ×
                </span>
                Fechar
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-8 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMany ? (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-[#e8f8fa] active:scale-95 sm:left-5 sm:size-14"
                aria-label="Foto anterior"
              >
                <ChevronLeftIcon />
              </button>
            ) : null}

            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black/30 shadow-2xl aspect-[8/5] ring-1 ring-white/10"
              style={{ touchAction: hasMany ? "pan-y" : undefined }}
              onPointerDown={swipe.onPointerDown}
              onPointerUp={swipe.onPointerUp}
              onPointerCancel={swipe.onPointerCancel}
            >
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
                className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-[#e8f8fa] active:scale-95 sm:right-5 sm:size-14"
                aria-label="Próxima foto"
              >
                <ChevronRightIcon />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="sm:h-6 sm:w-6"
    >
      <path
        d="M14.5 5.5 8 12l6.5 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="sm:h-6 sm:w-6"
    >
      <path
        d="M9.5 5.5 16 12l-6.5 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
