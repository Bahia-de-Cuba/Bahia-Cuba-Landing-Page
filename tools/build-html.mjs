/**
 * Ensambla index.html a partir de los fragmentos de src/html/.
 *
 *   node tools/build-html.mjs
 *
 * Los archivos se concatenan en orden alfabético de ruta, por eso todas las
 * carpetas y fragmentos van numerados. No edites index.html a mano: es salida.
 *
 * Además pone un ?v=<hash> en el CSS y el JS. GitHub Pages sirve los assets con
 * Cache-Control: max-age=600, y el HTML y el CSS se cachean por separado: sin
 * esto, tras un despliegue un visitante que ya tuviera el sitio abierto puede
 * quedarse con el HTML nuevo y el CSS viejo, y ver la página rota. Con el hash,
 * un CSS distinto es una URL distinta y no se pueden desparejar.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const RAIZ = "src/html";
const SALIDA = "index.html";

// archivo de salida -> cómo aparece referenciado en el HTML
const VERSIONAR = ["assets/css/styles.css", "assets/js/main.js"];

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

let html =
  rutas
    .map((r) => readFileSync(r, "utf8").replace(/^\n+|\s+$/g, ""))
    .join("\n\n") + "\n";

for (const asset of VERSIONAR) {
  let contenido;
  try {
    contenido = readFileSync(asset);
  } catch {
    throw new Error(
      `Falta ${asset}. build:html va después de build:js y build:css: revisa el orden en package.json.`
    );
  }
  const hash = createHash("sha1").update(contenido).digest("hex").slice(0, 8);
  if (!html.includes(`"${asset}"`)) throw new Error(`No encuentro "${asset}" en el HTML`);
  html = html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`);
  console.log(`  ${asset} -> ?v=${hash}`);
}

/* La política de seguridad (CSP) del <head> solo deja correr los scripts en
   línea cuya huella conoce. El cálculo solar va en línea a propósito (pinta el
   cartel con la hora correcta antes de cargar main.js), así que su huella se
   calcula aquí en cada build: si alguien edita ese script, la CSP se actualiza
   sola en vez de bloquearlo en silencio. Los JSON-LD no se ejecutan y no
   necesitan huella. */
const enLinea = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const huellas = enLinea
  .map((codigo) => `'sha256-${createHash("sha256").update(codigo, "utf8").digest("base64")}'`)
  .join(" ");
const cspAntes = html;
html = html.replace(
  /(<meta http-equiv="Content-Security-Policy" content="[^"]*?script-src 'self')((?: 'sha256-[^']+')*)/,
  (_, inicio) => `${inicio}${huellas ? " " + huellas : ""}`
);
if (enLinea.length && html === cspAntes && !cspAntes.includes(huellas)) {
  throw new Error("No encuentro el script-src de la CSP para poner la huella del script en línea");
}
console.log(`  CSP: ${enLinea.length} script(s) en línea autorizados por huella`);

writeFileSync(SALIDA, html, "utf8");
console.log(
  `${SALIDA} — ${rutas.length} fragmentos, ${html.split("\n").length} líneas, ` +
    `${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`
);
