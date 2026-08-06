/**
 * Gera logos vetoriais (SVG) e PNGs nítidos da Óticas Lírio.
 * Recria o símbolo floral e as composições a partir da identidade visual.
 */
import { mkdirSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPublic = join(root, "public", "logos");
const outAssets = join(root, "assets", "logos");

const BRAND = "#2EC4D4";
const WHITE = "#FFFFFF";

mkdirSync(outPublic, { recursive: true });
mkdirSync(outAssets, { recursive: true });

/** Pétala apontando para cima (folha com nervura), centrada em (0,0). */
function petalPath() {
  // Folha limpa: ponta em y=-82, base afastada do centro para não empilhar
  return [
    "M 0 -82",
    "C 20 -68 26 -38 18 -18",
    "C 12 -6 4 2 0 4",
    "C -4 2 -12 -6 -18 -18",
    "C -26 -38 -20 -68 0 -82",
    "Z",
  ].join(" ");
}

function flowerGroup(color, { stroke = 5.2, vein = 2.4, dot = 4.2, scale = 1 } = {}) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const deg = i * 45;
    return `<g transform="rotate(${deg})">
      <path d="${petalPath()}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="0" y1="-76" x2="0" y2="-8" stroke="${color}" stroke-width="${vein}" stroke-linecap="round"/>
    </g>`;
  }).join("\n");

  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) * 45 * Math.PI) / 180;
    const r = 90;
    const x = Math.sin(a) * r;
    const y = -Math.cos(a) * r;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dot}" fill="${color}"/>`;
  }).join("\n");

  return `<g transform="scale(${scale})">${petals}${dots}</g>`;
}

function svgWrap(vb, body, { bg = null } = {}) {
  const [w, h] = vb.split(" ").slice(2).map(Number);
  const background = bg
    ? `<rect width="100%" height="100%" fill="${bg}"/>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" fill="none">
  ${background}
  ${body}
</svg>
`;
}

function logoCircle(color, { includeSlogan = true } = {}) {
  const flower = flowerGroup(color, { stroke: 4.6, vein: 2.1, dot: 3.6, scale: 0.72 });
  const slogan = includeSlogan
    ? `
    <text x="200" y="268" text-anchor="middle" fill="${color}"
      font-family="Brush Script MT, Snell Roundhand, cursive" font-size="22" font-style="italic">
      Um amor por cada óculos!
    </text>
    <path d="M 95 280 Q 200 292 290 278" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M 292 274 C 296 268 304 268 306 274 C 308 268 316 268 320 274 C 320 282 306 292 306 292 C 306 292 292 282 292 274 Z" fill="${color}"/>
  `
    : "";

  return svgWrap(
    "0 0 400 400",
    `
    <circle cx="200" cy="200" r="188" fill="none" stroke="${color}" stroke-width="5.5"/>
    <g transform="translate(200 118)">${flower}</g>
    <text x="200" y="228" text-anchor="middle" fill="${color}"
      font-family="Arial Black, Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="900"
      letter-spacing="1.5">ÓTICAS LÍRIO</text>
    ${slogan}
  `,
  );
}

function logoVertical(color) {
  const flower = flowerGroup(color, { stroke: 5.5, vein: 2.5, dot: 4.4, scale: 1 });
  return svgWrap(
    "0 0 400 400",
    `
    <g transform="translate(200 150)">${flower}</g>
    <text x="200" y="320" text-anchor="middle" fill="${color}"
      font-family="Arial Black, Helvetica Neue, Arial, sans-serif" font-size="36" font-weight="900"
      letter-spacing="2">ÓTICAS LÍRIO</text>
  `,
  );
}

function logoDuo(whiteWord, cyanWord) {
  const flower = flowerGroup(BRAND, { stroke: 5.2, vein: 2.4, dot: 4.2, scale: 0.95 });
  return svgWrap(
    "0 0 400 400",
    `
    <g transform="translate(200 130)">${flower}</g>
    <text x="200" y="290" text-anchor="middle"
      font-family="Arial Black, Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="900"
      letter-spacing="1.5">
      <tspan fill="${whiteWord}">ÓTICAS </tspan><tspan fill="${cyanWord}">LÍRIO</tspan>
    </text>
    <text x="200" y="328" text-anchor="middle" fill="${BRAND}"
      font-family="Brush Script MT, Snell Roundhand, cursive" font-size="22" font-style="italic">
      Um amor por cada óculos!
    </text>
  `,
  );
}

function simboloOnly(color) {
  const flower = flowerGroup(color, { stroke: 6, vein: 2.8, dot: 5, scale: 1 });
  return svgWrap("0 0 256 256", `<g transform="translate(128 128)">${flower}</g>`);
}

const files = {
  "simbolo-flor.svg": simboloOnly(BRAND),
  "simbolo-flor-branco.svg": simboloOnly(WHITE),
  "logo-completo.svg": logoCircle(BRAND),
  "logo-branco-circulo.svg": logoCircle(WHITE),
  "logo-vertical.svg": logoVertical(BRAND),
  "logo-vertical-branco.svg": logoVertical(WHITE),
  "logo-duo.svg": logoDuo(WHITE, BRAND),
  "logo-transparente.svg": logoCircle(BRAND),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(outPublic, name), content);
}

function renderPng(svg, size, outPath) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: {
      loadSystemFonts: true,
      fontFiles: [
        "/System/Library/Fonts/Supplemental/Arial Black.ttf",
        "/System/Library/Fonts/Supplemental/Brush Script.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
      ],
    },
    background: "transparent",
  });
  const png = resvg.render().asPng();
  writeFileSync(outPath, png);
}

// Símbolo em vários tamanhos (a partir do SVG ciano)
const symbolSvg = files["simbolo-flor.svg"];
const symbolWhiteSvg = files["simbolo-flor-branco.svg"];

for (const size of [16, 32, 64, 128, 180, 192, 512, 1024]) {
  renderPng(symbolSvg, size, join(outPublic, `simbolo-${size}x${size}.png`));
}

// Favicons / app icons
renderPng(symbolSvg, 16, join(outPublic, "favicon-16x16.png"));
renderPng(symbolSvg, 32, join(outPublic, "favicon-32x32.png"));
renderPng(symbolSvg, 64, join(outPublic, "favicon-64x64.png"));
renderPng(symbolSvg, 180, join(outPublic, "icon-180x180.png"));
renderPng(symbolSvg, 192, join(outPublic, "icon-192x192.png"));
renderPng(symbolSvg, 512, join(outPublic, "icon-512x512.png"));
renderPng(symbolSvg, 1024, join(outPublic, "icon-1024x1024.png"));
renderPng(symbolSvg, 1080, join(outPublic, "social-1080x1080.png"));

// Logos principais em alta resolução
renderPng(files["logo-branco-circulo.svg"], 2048, join(outPublic, "logo-branco-circulo.png"));
renderPng(files["logo-transparente.svg"], 2048, join(outPublic, "logo-transparente.png"));
renderPng(files["logo-vertical.svg"], 2048, join(outPublic, "logo-vertical.png"));
renderPng(files["logo-duo.svg"], 2048, join(outPublic, "logo-duo.png"));
renderPng(symbolSvg, 1292, join(outPublic, "simbolo-flor.png"));
renderPng(symbolWhiteSvg, 1292, join(outPublic, "simbolo-flor-branco.png"));

// Versões extras úteis no site
renderPng(files["logo-completo.svg"], 1024, join(outPublic, "logo-completo-1024.png"));
renderPng(files["logo-branco-circulo.svg"], 1024, join(outPublic, "logo-branco-circulo-1024.png"));

// Espelhar em assets/logos
for (const name of readdirSync(outPublic)) {
  copyFileSync(join(outPublic, name), join(outAssets, name));
}

// Favicon raiz + apple-icon
copyFileSync(join(outPublic, "favicon-32x32.png"), join(root, "public", "favicon.ico"));
copyFileSync(join(outPublic, "icon-180x180.png"), join(root, "public", "apple-icon.png"));
copyFileSync(join(outPublic, "icon-192x192.png"), join(root, "public", "icon.png"));

console.log("Logos geradas em public/logos e assets/logos");
