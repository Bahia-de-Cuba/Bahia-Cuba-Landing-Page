/**
 * Ensambla index.html a partir de los fragmentos de src/html/.
 *
 *   node tools/build-html.mjs
 *
 * Los archivos se concatenan en orden alfabético de ruta, por eso todas las
 * carpetas y fragmentos van numerados. No edites index.html a mano: es salida.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "src/html";
const SALIDA = "index.html";

/** Devuelve todos los .html de una carpeta, en orden y recursivamente. */
function fragmentos(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((nombre) => {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) return fragmentos(ruta);
      return ruta.endsWith(".html") ? [ruta] : [];
    });
}

const rutas = fragmentos(RAIZ);
if (!rutas.length) throw new Error(`No hay fragmentos en ${RAIZ}`);

const html =
  rutas
    .map((r) => readFileSync(r, "utf8").replace(/^\n+|\s+$/g, ""))
    .join("\n\n") + "\n";

writeFileSync(SALIDA, html, "utf8");
console.log(
  `${SALIDA} — ${rutas.length} fragmentos, ${html.split("\n").length} líneas, ` +
    `${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`
);
