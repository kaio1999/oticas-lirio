export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formata valor para o input mascarado (ex.: 1.234,56). */
export function formatBRLMask(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/**
 * Converte texto de moeda BR (R$ 1.234,56 / 100,50 / 100.5) em número.
 */
export function parseBRLCurrency(raw: string): number {
  const cleaned = String(raw || "")
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .trim();
  if (!cleaned) return NaN;

  if (cleaned.includes(",") && cleaned.includes(".")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (cleaned.includes(",")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned);
}

/** Nome do óculos + marca para catálogo e detalhe. */
export function productDisplayName(name: string, brand: string): string {
  const n = name.trim();
  const b = brand.trim();
  if (!b) return n;
  if (!n) return b;
  if (n.toLowerCase().includes(b.toLowerCase())) return n;
  return `${n} · ${b}`;
}

export const categoryLabels: Record<string, string> = {
  grau: "Grau",
  sol: "Sol",
  infantil: "Infantil",
  acessorio: "Acessório",
};

export const shapeLabels: Record<string, string> = {
  aviador: "Aviador",
  redondo: "Redondo",
  quadrado: "Quadrado",
  gatinho: "Gatinho",
  retangular: "Retangular",
  outro: "Outro",
};
