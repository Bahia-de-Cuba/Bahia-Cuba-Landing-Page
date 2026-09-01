/**
 * Revisión automática de la landing: capturas en 3 anchos, errores de consola,
 * peticiones fallidas y peso real de la primera carga.
 *   node tools/check.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = process.cwd();
const PORT = 8099;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((r) => server.listen(PORT, r));

mkdirSync("tools/shots", { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const errores = [];
const fallos = [];
let bytes = 0;

const VISTAS = [
  { name: "movil", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 820, height: 1180, mobile: false },
  { name: "escritorio", width: 1440, height: 900, mobile: false },
];

for (const v of VISTAS) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 2,
    isMobile: v.mobile,
    hasTouch: v.mobile,
  });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") errores.push(`[${v.name}] ${m.text()}`);
  });
  page.on("requestfailed", (r) => fallos.push(`[${v.name}] ${r.url()} — ${r.failure()?.errorText}`));
  page.on("response", async (r) => {
    if (v.name !== "escritorio") return;
    if (new URL(r.url()).host !== `localhost:${PORT}`) return;
    try { bytes += (await r.body()).length; } catch {}
  });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load" });
  await page.waitForTimeout(3200); // deja pasar la intro
  await page.screenshot({ path: `tools/shots/${v.name}-hero.png` });

  // Página completa: revela todo antes de capturar
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 130));
    }
    // Espera a que terminen de cargar las imágenes diferidas
    await Promise.race([
      Promise.all(
        [...document.images].filter((i) => !i.complete).map(
          (i) => new Promise((r) => { i.onload = i.onerror = r; })
        )
      ),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `tools/shots/${v.name}-full.png`, fullPage: true });

  if (v.name === "escritorio") {
    // Interacciones clave
    const res = await page.evaluate(() => {
      const out = {};
      const h1 = document.querySelectorAll("h1");
      out.h1 = h1.length;
      out.imgSinAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
      out.imgSinTamano = [...document.querySelectorAll("img")].filter(
        (i) => !i.getAttribute("width") || !i.getAttribute("height")
      ).length;
      out.precios = [...document.querySelectorAll(".js-precio")].map((s) => s.textContent);
      out.total = document.getElementById("calcTotal").textContent;
      out.detalle = document.getElementById("calcDetalle").textContent;
      out.iconosRotos = [...document.querySelectorAll("svg.icon use")].filter(
        (u) => !document.querySelector(u.getAttribute("href"))
      ).map((u) => u.getAttribute("href"));
      return out;
    });
    console.log("\nComprobaciones de contenido:");
    console.log(res);

    // Filtro de habitaciones
    await page.click('[data-filter="familias"]');
    await page.waitForTimeout(400);
    const visibles = await page.$$eval(".room-item", (els) => els.filter((e) => !e.hidden).length);
    console.log(`Filtro "familias" -> ${visibles} habitaciones visibles (esperado 2)`);
    await page.click('[data-filter="todas"]');

    // FAQ
    await page.click(".faq-toggle");
    await page.waitForTimeout(450);
    const faqAbierto = await page.$eval(".faq-item", (e) => e.classList.contains("is-open"));
    const alturaFaq = await page.$eval(".faq-answer > div", (e) => e.getBoundingClientRect().height);
    console.log(`FAQ abre: ${faqAbierto} (alto respuesta ${Math.round(alturaFaq)}px)`);

    // Mapa bajo demanda
    const iframesAntes = await page.$$eval("iframe", (e) => e.length);
    await page.click("#btnLoadMap");
    await page.waitForTimeout(600);
    const iframesDespues = await page.$$eval("iframe", (e) => e.length);
    console.log(`Mapa: ${iframesAntes} iframe(s) antes -> ${iframesDespues} después`);

    // Scroll horizontal indeseado
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    console.log(`Desbordamiento horizontal: ${overflow}px (debe ser 0)`);
  }

  if (v.name === "movil") {
    await page.click("#btnOpenDrawer");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "tools/shots/movil-menu.png" });
    await page.keyboard.press("Escape");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    console.log(`Desbordamiento horizontal en móvil: ${overflow}px (debe ser 0)`);
  }

  await ctx.close();
}

await browser.close();
server.close();

console.log(`\nPeso descargado desde el sitio (escritorio, primera carga): ${(bytes / 1024).toFixed(0)} KB`);
console.log(`Errores de consola: ${errores.length}`);
errores.forEach((e) => console.log("  " + e));
console.log(`Peticiones fallidas: ${fallos.length}`);
fallos.forEach((e) => console.log("  " + e));
