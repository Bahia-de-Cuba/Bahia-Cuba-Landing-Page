/**
 * Une las partes de src/js/ en assets/js/main.js.
 *
 *   node tools/build-js.mjs
 *
 * Cada parte es un bloque independiente que se ejecuta dentro de una misma
 * clausura: 00-base.js declara los ayudantes ($, $$, WHATSAPP…) y el resto son
 * funciones autoejecutables que los usan. Por eso el orden numérico importa.
 * No edites assets/js/main.js a mano: es salida.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "src/js";
const SALIDA = "assets/js/main.js";

const CABECERA = `/* ==========================================================================
   Hotel Bahía de Cuba — comportamiento de la landing
   Sin dependencias. Todo se degrada con elegancia si algo no está disponible.

   Archivo generado por tools/build-js.mjs a partir de src/js/ — no editar.
   ========================================================================== */`;

const partes = readdirSync(RAIZ)
  .filter((n) => n.endsWith(".js"))
  .sort()
  .map((n) => readFileSync(join(RAIZ, n), "utf8").replace(/^\n+|\s+$/g, ""));

if (!partes.length) throw new Error(`No hay partes en ${RAIZ}`);

const js =
  `${CABECERA}\n(function () {\n  "use strict";\n\n` +
  partes.join("\n\n") +
  "\n})();\n";

mkdirSync("assets/js", { recursive: true });
writeFileSync(SALIDA, js, "utf8");
console.log(
  `${SALIDA} — ${partes.length} partes, ${js.split("\n").length} líneas, ` +
    `${(Buffer.byteLength(js) / 1024).toFixed(0)} KB`
);
