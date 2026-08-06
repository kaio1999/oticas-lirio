"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
  priority?: boolean;
};

/** Galeria: capa em destaque + miniaturas de todas as fotos. */
export function ProductGallery({ images, alt, priority = false }: Props) {
  const list =
    images.length > 0 ? images : ["/products/placeholder-aviador.svg"];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[8/5] overflow-hidden rounded-[2rem] border border-line bg-mist-deep">
        <Image
          src={current}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {list.length > 1 ? (
          <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
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
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
