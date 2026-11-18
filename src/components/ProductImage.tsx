"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  cropImageStyle,
  repairCropForVitrine,
  type ImageCrop,
} from "@/lib/productImageCrop";

type Props = {
  src: string;
  alt: string;
  crop?: ImageCrop | null;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Classe do container (deve incluir posicionamento e aspecto). */
  containerClassName?: string;
};

/**
 * Sem crop salvo: next/image + object-cover (comportamento antigo da vitrine).
 * Com crop: img nativo com enquadramento absoluto.
 * Não aplica defaultCrop no onLoad — isso trocava o renderer e deixava o catálogo inconsistente.
 */
export function ProductImage({
  src,
  alt,
  crop,
  priority = false,
  className = "object-cover",
  sizes,
  containerClassName = "relative overflow-hidden",
}: Props) {
  const cropKey = crop
    ? `${crop.x},${crop.y},${crop.width},${crop.height}`
    : "";
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const [framed, setFramed] = useState<ImageCrop | null>(null);

  useEffect(() => {
    const current = cropRef.current;
    if (!current) return;
    let cancelled = false;
    setFramed(null);
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) {
        setFramed(
          repairCropForVitrine(current, probe.naturalWidth, probe.naturalHeight),
        );
      }
    };
    probe.onerror = () => {
      if (!cancelled) setFramed(current);
    };
    probe.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, cropKey]);

  if (crop) {
    const applied = framed ?? crop;
    return (
      <div className={containerClassName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={className}
          style={{
            ...cropImageStyle(applied),
            opacity: framed ? 1 : 0,
          }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
        />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`.trim()}
      />
    </div>
  );
}
