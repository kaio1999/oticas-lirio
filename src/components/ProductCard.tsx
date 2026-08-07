"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  categoryLabels,
  formatPrice,
  productDisplayName,
  shapeLabels,
} from "@/lib/format";
import { catalogProductPath } from "@/lib/admin/productId";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  priority?: boolean;
};

/** Card do catálogo: capa (1ª foto) com troca rápida se houver mais imagens. */
export function ProductCard({ product, priority = false }: Props) {
  const images =
    product.images.length > 0
      ? product.images
      : ["/products/placeholder-aviador.svg"];
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, images.length - 1)]!;
  const title = productDisplayName(product.name, product.brand);

  return (
    <Link
      href={catalogProductPath(product.id)}
      className="group block h-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_#12121208] transition duration-300 hover:border-brand/35 hover:shadow-[0_22px_44px_#00b7c818]"
    >
      <div className="relative aspect-[8/5] overflow-hidden bg-sand">
        <Image
          src={current}
          alt={title}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {!product.inStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-deep px-3 py-1 text-xs font-medium text-white">
            Indisponível
          </span>
        ) : null}
        {images.length > 1 ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
            {images.length} fotos
          </span>
        ) : null}

        {images.length > 1 ? (
          <div
            className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5"
            onClick={(e) => e.preventDefault()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink-muted">
          {categoryLabels[product.category]} · {shapeLabels[product.shape]}
        </p>
        <h3 className="font-display text-2xl text-brand-ink">{title}</h3>
        <p className="pt-1 text-lg font-semibold text-brand-ink">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
