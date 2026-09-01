# Hotel Bahía de Cuba — Landing Page

Sitio de una sola página del **Hotel Bahía de Cuba**, eco hotel a 200 m de
Playa Tuquillo, en Huarmey (Áncash, Perú).

Es un sitio **estático**: se publica tal cual en GitHub Pages, Netlify, Vercel o
cualquier hosting. No necesita servidor ni base de datos.

---

## Cómo verlo

Abre `index.html` en el navegador. Para que todo funcione igual que en
producción (incluido el mapa), conviene levantar un servidor local:

```bash
npm run serve      # http://localhost:8080
```

---

## Estructura

```
index.html            La página (marcado + sprite de iconos)
styles.css            CSS compilado — GENERADO, no editar a mano
main.js               Comportamiento: menú, cotizador, scroll, FAQ, mapa
src/input.css         FUENTE de los estilos: tema, tipografías y CSS propio
assets/img/           Fotos optimizadas en WebP (2 anchos para srcset)
assets/fonts/         Tipografías variables alojadas en el propio sitio
assets/originals/     Fotos originales sin tocar (fuente para reoptimizar)
tools/                Scripts de build y revisión automática
```

`styles.css` está compilado y versionado a propósito: así el sitio funciona en
GitHub Pages sin ningún paso de build.

---

## Editar estilos

Los estilos se escriben en **`src/input.css`** y se compilan a `styles.css` con
Tailwind. Nunca edites `styles.css`: se sobrescribe en cada compilación.

```bash
npm install        # solo la primera vez
npm run dev        # recompila al guardar, mientras trabajas
npm run build      # compila iconos + CSS para publicar
```

Después de cambiar `src/input.css` **o** de añadir clases nuevas en el HTML,
ejecuta `npm run build` y sube también el `styles.css` resultante.

---

## Dónde se cambia cada dato

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `index.html` (busca `51941677501`) y la constante `WHATSAPP` en `main.js` |
| Tarifas por noche | `index.html`, atributos `data-precio` del `<select id="cRoom">` |
| Textos de habitaciones | `index.html`, sección `#habitaciones` |
| Preguntas frecuentes | `index.html`, sección `#faq` |
| Redes sociales | `index.html`, pie de página y bloque `application/ld+json` |
| Horarios y contacto | `index.html`, pie de página y bloque `application/ld+json` |

Las tarifas se escriben **una sola vez**: los precios que aparecen en las
tarjetas de habitación los toma `main.js` del propio cotizador, así nunca
quedan desfasados.

---

## Cambiar o añadir fotos

1. Deja el archivo original en `assets/originals/` con el nombre que le
   corresponde (`hab-doble.jpg`, `huesped-3.jpg`, …).
2. Ejecuta `npm run build:img`.
3. Se regeneran los WebP en `assets/img/` en los tamaños que la página usa.

Para añadir una foto nueva, agrégala también al diccionario `PLAN` en
`tools/optimize-images.py`.

---

## Iconos

No se usa Font Awesome. Los ~34 iconos que la página necesita se empaquetan en
un sprite SVG incrustado dentro de `index.html`, entre los marcadores
`<!-- icons:start -->` y `<!-- icons:end -->`.

Para cambiarlos, edita los diccionarios `LINE` / `BRAND` en
`tools/build-icons.mjs` (nombres de [Lucide](https://lucide.dev) y
[Simple Icons](https://simpleicons.org)) y ejecuta `npm run build:icons`.

---

## Revisión automática

```bash
node tools/check.mjs
```

Abre la página en Chromium a 390, 820 y 1440 px, guarda capturas en
`tools/shots/`, y verifica que no haya errores de consola, peticiones
fallidas, desbordamiento horizontal ni imágenes sin `alt` o sin dimensiones.

---

## Notas de rendimiento

La página no carga **nada** de terceros al abrirse: sin Tailwind por CDN, sin
Font Awesome, sin Google Fonts. El mapa de Google se inserta solo cuando el
visitante pulsa «Ver mapa».

| | Antes | Ahora |
|---|---|---|
| Imágenes | 6.7 MB | 1.0 MB (WebP, 2 anchos) |
| CSS | Tailwind CDN (~300 KB de JS que compila en el navegador) | 58 KB estáticos (~10 KB gzip) |
| Iconos | Font Awesome completo (~300 KB con fuentes) | Sprite SVG de 14 KB |
| Tipografías | 3 familias desde Google Fonts | 2 familias variables propias (105 KB) |
| Peticiones a terceros | 3 dominios | 0 |
| Primera carga | ~7.5 MB | ~240 KB |

---

## Pendiente

- `assets/originals/hab-individual.jpg` es de baja resolución (384 × 512 px) y
  se ve suave en pantallas grandes. Conviene reemplazarla por una foto nueva.
- El mapa apunta al hotel por búsqueda de nombre. Si quieres que el pin caiga
  exactamente en la puerta, reclama la ficha del hotel en Google Maps.
