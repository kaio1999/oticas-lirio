"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  cropImageStyle,
  defaultCrop,
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
 * Exibe a foto com o enquadramento salvo no admin.
 * Sem recorte salvo, usa o centro 8:5 da imagem após carregar.
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
  const [resolvedCrop, setResolvedCrop] = useState<ImageCrop | null>(
    crop ?? null,
  );

  useEffect(() => {
    setResolvedCrop(crop ?? null);
  }, [crop, src]);

  if (resolvedCrop) {
    return (
      <div className={containerClassName}>
        {/* img nativo: recorte usa width/left — incompatível com next/image fill */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={className}
          style={cropImageStyle(resolvedCrop)}
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
        className={className}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0) {
            setResolvedCrop(
              defaultCrop(img.naturalWidth, img.naturalHeight),
            );
          }
        }}
      />
    </div>
  );
}
