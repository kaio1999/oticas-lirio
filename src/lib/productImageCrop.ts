import type { CSSProperties } from "react";

/** Recorte normalizado (0–1) relativo à imagem original. Proporção alvo da vitrine: 8/5. */
export type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const VITRINE_ASPECT = 8 / 5;

export function normalizeCrop(raw: unknown): ImageCrop | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  const width = Number(o.width);
  const height = Number(o.height);
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0 ||
    x + width > 1.001 ||
    y + height > 1.001
  ) {
    return null;
  }
  return {
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(width),
    height: clamp01(height),
  };
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Maior retângulo 8:5 centralizado dentro da imagem. */
export function defaultCrop(
  imageWidth: number,
  imageHeight: number,
  aspect = VITRINE_ASPECT,
): ImageCrop {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  const imageAspect = imageWidth / imageHeight;
  if (imageAspect > aspect) {
    const height = 1;
    const width = (aspect * imageHeight) / imageWidth;
    return { x: (1 - width) / 2, y: 0, width, height };
  }
  const width = 1;
  const height = imageWidth / (aspect * imageHeight);
  return { x: 0, y: (1 - height) / 2, width, height };
}

export function cropForIndex(
  crops: (ImageCrop | null | undefined)[] | undefined,
  index: number,
): ImageCrop | null {
  if (!crops?.length) return null;
  return normalizeCrop(crops[index]) ?? null;
}


export function cropImageStyle(crop: ImageCrop): CSSProperties {
  return {
    position: "absolute",
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
    maxWidth: "none",
    objectFit: "fill",
  };
}

/**
 * Recortes gravados pelo editor antigo iam até a borda da foto, em vez da
 * janela 8:5 visível. Com a medida real da imagem, devolve essa janela.
 */
export function repairCropForVitrine(
  crop: ImageCrop,
  iw: number,
  ih: number,
): ImageCrop {
  if (iw <= 0 || ih <= 0) return crop;
  const pixelAspect = (crop.width * iw) / (crop.height * ih);
  if (Math.abs(pixelAspect - VITRINE_ASPECT) / VITRINE_ASPECT < 0.02) {
    return crop;
  }

  const hitsRight = crop.x + crop.width >= 0.995;
  const hitsBottom = crop.y + crop.height >= 0.995;
  const fullWidth = crop.x <= 0.01 && crop.width >= 0.99;
  const fullHeight = crop.y <= 0.01 && crop.height >= 0.99;

  if (fullWidth && hitsBottom) {
    const height = Math.min(1, iw / ih / VITRINE_ASPECT);
    return { x: 0, y: clamp(0, Math.min(crop.y, 1 - height), 1 - height), width: 1, height };
  }

  if (fullHeight && hitsRight) {
    const width = Math.min(1, VITRINE_ASPECT * (ih / iw));
    return { x: clamp(0, Math.min(crop.x, 1 - width), 1 - width), y: 0, width, height: 1 };
  }

  const availW = Math.max(0, 1 - crop.x);
  const availH = Math.max(0, 1 - crop.y);
  let srcW = availW * iw;
  let srcH = srcW / VITRINE_ASPECT;
  if (srcH > availH * ih) {
    srcH = availH * ih;
    srcW = srcH * VITRINE_ASPECT;
  }
  if (srcW <= 0 || srcH <= 0) return crop;
  return {
    x: crop.x,
    y: crop.y,
    width: srcW / iw,
    height: srcH / ih,
  };
}

export function parseImageCropsJson(raw: string): ImageCrop[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeCrop(item)).filter(Boolean) as ImageCrop[];
  } catch {
    return [];
  }
}

/** Converte recorte normalizado em pan/zoom na viewport do editor. */
export function cropToTransform(
  crop: ImageCrop,
  iw: number,
  ih: number,
  vw: number,
  vh: number,
): { scale: number; panX: number; panY: number } {
  const coverScale = Math.max(vw / iw, vh / ih);
  const cropW = crop.width * iw;
  const cropH = crop.height * ih;
  const scale = Math.max(coverScale, Math.max(vw / cropW, vh / cropH));
  const displayW = iw * scale;
  const displayH = ih * scale;
  const panX = -crop.x * iw * scale;
  const panY = -crop.y * ih * scale;
  return clampPan(scale, panX, panY, displayW, displayH, vw, vh);
}

/** Converte pan/zoom da viewport em recorte normalizado. */
export function transformToCrop(
  scale: number,
  panX: number,
  panY: number,
  iw: number,
  ih: number,
  vw: number,
  vh: number,
): ImageCrop {
  const srcLeft = clamp(0, -panX / scale, iw);
  const srcTop = clamp(0, -panY / scale, ih);
  // A janela visível é vw/scale por vh/scale. Não estender até a borda da foto:
  // clamp() trata o 1º argumento como mínimo, e isso gravava o resto da imagem.
  let width = Math.min(vw / scale, Math.max(0, iw - srcLeft)) / iw;
  let height = Math.min(vh / scale, Math.max(0, ih - srcTop)) / ih;
  const x = srcLeft / iw;
  const y = srcTop / ih;
  if (x + width > 1) width = 1 - x;
  if (y + height > 1) height = 1 - y;
  return { x, y, width, height };
}

export function clampPan(
  scale: number,
  panX: number,
  panY: number,
  displayW: number,
  displayH: number,
  vw: number,
  vh: number,
) {
  const minPanX = Math.min(0, vw - displayW);
  const minPanY = Math.min(0, vh - displayH);
  return {
    scale,
    panX: clamp(minPanX, panX, 0),
    panY: clamp(minPanY, panY, 0),
  };
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Alinha recortes à ordem final das imagens (mesma lógica de resolveImages). */
export function mergeImageCrops(
  keptCrops: ImageCrop[],
  pendingCrops: ImageCrop[],
  uploadedCount: number,
  coverPending: boolean,
): ImageCrop[] {
  if (coverPending && uploadedCount > 0) {
    return [
      pendingCrops[0] ?? { x: 0, y: 0, width: 1, height: 1 },
      ...keptCrops,
      ...pendingCrops.slice(1),
    ];
  }
  return [...keptCrops, ...pendingCrops];
}
