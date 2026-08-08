import { productHasPromo } from "@/lib/format";
import type { Product } from "@/types/product";

type Props = {
  product: Pick<Product, "price" | "promoPrice" | "inStock">;
  className?: string;
};

/**
 * Badge discreta na capa: % de desconto (promo) ou indisponível.
 * Uma por vez — estoque tem prioridade.
 */
export function ProductStatusBadge({ product, className = "" }: Props) {
  if (!product.inStock) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-ink/50 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm ${className}`}
      >
        Indisponível
      </span>
    );
  }

  if (!productHasPromo(product)) return null;

  const pct = Math.round(
    ((product.price - Number(product.promoPrice)) / product.price) * 100,
  );

  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-ink/80 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm ${className}`}
      aria-label={`Promoção: ${pct}% de desconto`}
    >
      −{pct}%
    </span>
  );
}
