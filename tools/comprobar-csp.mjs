// Falla si un script en línea del index.html publicado no tiene su huella en
// la CSP. Si pasa, el navegador lo bloquea en silencio y la página se queda
// sin JavaScript: sin cotizador, sin carrusel y sin tarifas.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const html = readFileSync("index.html", "utf8");
const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] ?? "";
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const faltan = scripts.filter((s) => !csp.includes(`'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`));
if (!csp) { console.error("index.html no tiene CSP"); process.exit(1); }
if (faltan.length) {
  console.error(`${faltan.length} script(s) en línea sin su huella en la CSP. Recompila con npm run build:html.`);
  process.exit(1);
}
console.log(`CSP correcta: ${scripts.length} script(s) en línea autorizados.`);
