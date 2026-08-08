import {
  formatPrice,
  productEffectivePrice,
  productHasPromo,
} from "@/lib/format";

type Props = {
  price: number;
  promoPrice?: number | null;
  /** Tamanho visual: card vs detalhe. */
  size?: "card" | "detail";
  className?: string;
};

/** Preço com de/para quando há promoção (sem badge redundante). */
export function ProductPrice({
  price,
  promoPrice,
  size = "card",
  className = "",
}: Props) {
  const hasPromo = productHasPromo({ price, promoPrice });
  const effective = productEffectivePrice({ price, promoPrice });

  if (!hasPromo) {
    return (
      <p
        className={
          size === "detail"
            ? `mt-5 text-3xl font-medium text-ink ${className}`
            : `pt-1 text-lg font-semibold text-brand-ink ${className}`
        }
      >
        {formatPrice(price)}
      </p>
    );
  }

  if (size === "detail") {
    return (
      <div className={`mt-5 space-y-1 ${className}`}>
        <p className="text-sm text-ink-muted">
          De{" "}
          <span className="line-through decoration-ink-muted/60">
            {formatPrice(price)}
          </span>
        </p>
        <p className="text-3xl font-medium tracking-tight text-brand-ink">
          {formatPrice(effective)}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 pt-1 ${className}`}>
      <p className="text-[0.7rem] text-ink-muted line-through decoration-ink-muted/50">
        {formatPrice(price)}
      </p>
      <p className="text-lg font-semibold tracking-tight text-brand-ink">
        {formatPrice(effective)}
      </p>
    </div>
  );
}
