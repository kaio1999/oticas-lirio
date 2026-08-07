/** IDs de produto seguros para URL/Storage (sem espaços). */
export function slugifyProductId(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function decodeProductIdParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function adminProductPath(id: string): string {
  return `/admin/produtos/${encodeURIComponent(id)}`;
}

export function catalogProductPath(id: string): string {
  return `/produtos/${encodeURIComponent(id)}`;
}
