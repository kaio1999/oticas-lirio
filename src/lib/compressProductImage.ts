const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.88;
/** Se já for menor que isso e dentro do limite de pixels, não reprocessa. */
const SKIP_IF_UNDER_BYTES = 550 * 1024;

export type CompressResult = {
  file: File;
  optimized: boolean;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao comprimir a imagem."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function jpegFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "foto";
  return `${base}.jpg`;
}

/**
 * Redimensiona (máx. 1920px no lado maior) e exporta JPEG ~0.88.
 * Em falha, devolve o arquivo original.
 */
export async function compressProductImage(
  file: File,
): Promise<CompressResult> {
  if (!file.type.startsWith("image/")) {
    return { file, optimized: false };
  }

  try {
    const img = await loadImageFromFile(file);
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const needsResize = longest > MAX_EDGE;
    const alreadySmall =
      file.size <= SKIP_IF_UNDER_BYTES &&
      !needsResize &&
      (file.type === "image/jpeg" || file.type === "image/jpg");

    if (alreadySmall) {
      return { file, optimized: false };
    }

    const scale = needsResize ? MAX_EDGE / longest : 1;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, optimized: false };

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToJpegBlob(canvas, JPEG_QUALITY);
    if (blob.size >= file.size && !needsResize) {
      return { file, optimized: false };
    }

    const compressed = new File([blob], jpegFileName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return { file: compressed, optimized: true };
  } catch {
    return { file, optimized: false };
  }
}
