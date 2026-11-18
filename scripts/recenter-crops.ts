/**
 * Recalcula o enquadramento das fotos que não estão em 8:5.
 * Cada foto torta passa a usar o maior retângulo 8:5 centralizado.
 * Fotos que já estão em 8:5 ficam como foram enquadradas.
 *
 * O alvo é o projeto do .env.local (não o site no ar, se o arquivo for o de DEV).
 *
 * Simulação:
 *   npm run db:recenter-crops
 *
 * Gravar:
 *   PowerShell:  $env:CONFIRM='YES'; npm run db:recenter-crops
 *   bash:        CONFIRM=YES npm run db:recenter-crops
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import {
  defaultCrop,
  normalizeCrop,
  VITRINE_ASPECT,
  type ImageCrop,
} from "../src/lib/productImageCrop";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const write = process.env.CONFIRM === "YES";

if (!url || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.\n" +
      "Para produção, use o projeto tmjnksgwrysxjqamwcsi.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = {
  id: string;
  name: string;
  images: string[] | null;
  image_crops: unknown;
};

function imageSize(buf: Buffer): { w: number; h: number } | null {
  if (buf.length >= 24 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length >= 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  }
  if (
    buf.length >= 30 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const format = buf.toString("ascii", 12, 16);
    if (format === "VP8X") {
      return {
        w: 1 + buf.readUIntLE(24, 3),
        h: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (format === "VP8 " && buf.length >= 30) {
      return {
        w: buf.readUInt16LE(26) & 0x3fff,
        h: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (format === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) return null;
      while (buf[offset] === 0xff) offset += 1;
      const marker = buf[offset];
      offset += 1;
      if (marker === 0xd9 || marker === 0xda) return null;
      if (offset + 1 >= buf.length) return null;
      const length = buf.readUInt16BE(offset);
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          h: buf.readUInt16BE(offset + 3),
          w: buf.readUInt16BE(offset + 5),
        };
      }
      offset += length;
    }
  }
  return null;
}

function isVitrineCrop(crop: ImageCrop, iw: number, ih: number) {
  const pixelAspect = (crop.width * iw) / (crop.height * ih);
  return Math.abs(pixelAspect - VITRINE_ASPECT) / VITRINE_ASPECT < 0.02;
}

function sameCrop(a: ImageCrop, b: ImageCrop) {
  return (
    Math.abs(a.x - b.x) < 0.002 &&
    Math.abs(a.y - b.y) < 0.002 &&
    Math.abs(a.width - b.width) < 0.002 &&
    Math.abs(a.height - b.height) < 0.002
  );
}

async function loadSize(src: string) {
  const response = await fetch(src, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const size = imageSize(Buffer.from(await response.arrayBuffer()));
  if (!size || size.w <= 0 || size.h <= 0) {
    throw new Error("formato sem medida");
  }
  return size;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]!, index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  const host = new URL(url!).host;
  console.log(write ? `Gravando em ${host}` : `Simulação em ${host} (nada será gravado)`);
  if (!host.includes("tmjnksgwrysxjqamwcsi")) {
    console.log(
      "Este não é o projeto de produção. Para o site no ar, o .env.local precisa apontar para tmjnksgwrysxjqamwcsi.",
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, images, image_crops")
    .order("name");
  if (error) throw new Error(error.message);

  const rows = (data || []) as Row[];
  let changedPhotos = 0;
  let changedProducts = 0;
  let skipped = 0;

  for (const row of rows) {
    const images = (row.images || []).filter(Boolean);
    if (images.length === 0) continue;
    const stored = Array.isArray(row.image_crops) ? row.image_crops : [];

    const measured = await mapPool(images, 4, async (src, index) => {
      const current = normalizeCrop(stored[index]);
      if (!src.startsWith("http")) {
        return { crop: current, failed: true, reason: "URL local" };
      }
      try {
        const size = await loadSize(src);
        if (current && isVitrineCrop(current, size.w, size.h)) {
          return { crop: current, failed: false, reason: "" };
        }
        return { crop: defaultCrop(size.w, size.h), failed: false, reason: "" };
      } catch (err) {
        return {
          crop: current,
          failed: true,
          reason: err instanceof Error ? err.message : String(err),
        };
      }
    });

    if (measured.some((item) => item.failed)) {
      skipped += 1;
      const reasons = measured
        .map((item, index) => (item.failed ? `foto ${index + 1}: ${item.reason}` : ""))
        .filter(Boolean)
        .join("; ");
      console.warn(`[${row.name}] ignorado — ${reasons}`);
      continue;
    }

    const next = measured.map((item) => item.crop!);
    const changed = next.some((crop, index) => {
      const current = normalizeCrop(stored[index]);
      return !current || !sameCrop(current, crop);
    });
    if (!changed) continue;

    changedProducts += 1;
    changedPhotos += next.filter((crop, index) => {
      const current = normalizeCrop(stored[index]);
      return !current || !sameCrop(current, crop);
    }).length;
    console.log(`- ${row.name} (${row.id})`);
    if (!write) continue;

    const { error: updateError } = await supabase
      .from("products")
      .update({ image_crops: next })
      .eq("id", row.id);
    if (updateError) throw new Error(`${row.id}: ${updateError.message}`);
  }

  console.log(
    `${changedProducts} produto(s), ${changedPhotos} foto(s) torta(s), ${skipped} ignorada(s).`,
  );
  if (!write && changedProducts > 0) {
    console.log("Para gravar: $env:CONFIRM='YES'; npm run db:recenter-crops");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
