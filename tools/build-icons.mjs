/**
 * Genera el sprite SVG inline que reemplaza a Font Awesome.
 * Toma solo los iconos que la landing usa realmente (~34 en vez de 2000+).
 *
 *   node tools/build-icons.mjs        -> escribe tools/icons-sprite.html
 *
 * El contenido se pega dentro de <body> en index.html y se usa asi:
 *   <svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>
 */
import { readFileSync, writeFileSync } from "node:fs";

// id en el sprite -> archivo de lucide (iconos de trazo)
const LINE = {
  sun: "sun",
  solar: "sun-medium",
  dog: "dog",
  compass: "compass",
  calculator: "calculator",
  menu: "menu",
  house: "house",
  bed: "bed-double",
  martini: "martini",
  images: "images",
  pin: "map-pin",
  help: "circle-help",
  x: "x",
  umbrella: "umbrella",
  leaf: "leaf",
  "arrow-left": "move-left",
  "arrow-right": "move-right",
  shower: "shower-head",
  star: "star",
  ball: "circle-dot",
  coins: "coins",
  target: "target",
  wifi: "wifi",
  paw: "paw-print",
  walk: "footprints",
  car: "car",
  route: "route",
  chevron: "chevron-down",
  up: "arrow-up",
  phone: "phone",
  drop: "droplets",
};

// id en el sprite -> archivo de simple-icons (iconos de relleno)
const BRAND = {
  whatsapp: "whatsapp",
  instagram: "instagram",
  facebook: "facebook",
};

const inner = (svg) =>
  svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>[\s\S]*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const parts = [];

for (const [id, file] of Object.entries(LINE)) {
  const svg = readFileSync(`node_modules/lucide-static/icons/${file}.svg`, "utf8");
  parts.push(
    `<symbol id="i-${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner(svg)}</symbol>`
  );
}

for (const [id, file] of Object.entries(BRAND)) {
  const svg = readFileSync(`node_modules/simple-icons/icons/${file}.svg`, "utf8");
  parts.push(
    `<symbol id="i-${id}" viewBox="0 0 24 24" fill="currentColor" stroke="none">${inner(svg)}</symbol>`
  );
}

const out =
  `<!-- Sprite de iconos (generado por tools/build-icons.mjs - no editar a mano) -->\n` +
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n  ` +
  parts.join("\n  ") +
  `\n</svg>\n`;

// Se inyecta directamente en index.html, entre los marcadores
const START = "<!-- icons:start -->";
const END = "<!-- icons:end -->";
const html = readFileSync("index.html", "utf8");
const a = html.indexOf(START);
const b = html.indexOf(END);

if (a === -1 || b === -1) {
  throw new Error(`No encuentro los marcadores ${START} / ${END} en index.html`);
}

writeFileSync(
  "index.html",
  html.slice(0, a + START.length) + "\n" + out + html.slice(b)
);

console.log(`${parts.length} iconos inyectados en index.html (${(out.length / 1024).toFixed(1)} KB)`);
