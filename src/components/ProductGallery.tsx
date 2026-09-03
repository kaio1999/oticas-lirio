"use client";

import { useState } from "react";
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

/** Galeria: capa em destaque + miniaturas de todas as fotos. */
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
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[8/5] overflow-hidden rounded-[2rem] border border-line bg-mist-deep">
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
        {list.length > 1 ? (
          <p className="absolute bottom-3 right-3 rounded-full bg-ink/40 px-2 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {active + 1} / {list.length}
          </p>
        ) : null}
      </div>

      {list.length > 1 ? (
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
    </div>
  );
}
