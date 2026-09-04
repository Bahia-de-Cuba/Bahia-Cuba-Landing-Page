/**
 * Genera el sprite SVG inline que reemplaza a Font Awesome.
 * Toma solo los iconos que la landing usa realmente (~34 en vez de 2000+).
 *
 *   node tools/build-icons.mjs   -> src/html/02-generado/sprite-iconos.html
 *
 * El fragmento lo recoge tools/build-html.mjs al ensamblar index.html. Se usa asi:
 *   <svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

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

// Se guarda como fragmento; tools/build-html.mjs lo inserta al ensamblar
const DESTINO = "src/html/02-generado/sprite-iconos.html";
mkdirSync(dirname(DESTINO), { recursive: true });
writeFileSync(DESTINO, out);

console.log(`${parts.length} iconos -> ${DESTINO} (${(out.length / 1024).toFixed(1)} KB)`);
