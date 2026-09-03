import type { ImageCrop } from "@/lib/productImageCrop";

export type { ImageCrop };

export type ProductCategory = "grau" | "sol" | "infantil" | "acessorio";

export type ProductShape =
  | "aviador"
  | "redondo"
  | "quadrado"
  | "gatinho"
  | "retangular"
  | "outro";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  /** Preço promocional (para). Se menor que price, vitrine mostra de/para. */
  promoPrice?: number | null;
  images: string[];
  /** Enquadramento por foto (mesma ordem de images). */
  imageCrops?: ImageCrop[];
  model3dUrl?: string;
  shape: ProductShape;
  material: string;
  colors: string[];
  inStock: boolean;
  description: string;
  featured?: boolean;
  /** Uso interno (admin). Não exibir na vitrine. */
  sku?: string | null;
  /** Medidas em mm — uso interno / futuro try-on. */
  lensWidthMm?: number | null;
  bridgeMm?: number | null;
  templeMm?: number | null;
  frameWidthMm?: number | null;
};
