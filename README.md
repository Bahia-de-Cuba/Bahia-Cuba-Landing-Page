# Hotel Bahía de Cuba — Landing Page

Sitio de una sola página del **Hotel Bahía de Cuba**, eco hotel a 200 m de
Playa Tuquillo, en Huarmey (Áncash, Perú).

Es un sitio **estático**: se publica tal cual en GitHub Pages, Netlify, Vercel o
cualquier hosting. No necesita servidor ni base de datos.

En producción: <https://bahia-de-cuba.github.io/Bahia-Cuba-Landing-Page/>

---

## Cómo verlo

```bash
npm run serve      # http://localhost:8080
```

Abrir `index.html` a pelo también funciona, pero con servidor todo se comporta
igual que en producción (incluido el mapa).

---

## Estructura

El repositorio separa **fuente** (lo que se edita) de **salida** (lo que se
publica). Los tres archivos que sirve el hosting están generados y versionados
a propósito, para que GitHub Pages no necesite ningún paso de build.

```
├── index.html                  SALIDA — ensamblada desde src/html/
├── assets/                     Todo lo que se publica
│   ├── css/styles.css          SALIDA — compilada desde src/css/
│   ├── js/main.js              SALIDA — unida desde src/js/
│   ├── fonts/                  Tipografías variables propias (.woff2)
│   └── img/                    Fotos optimizadas en WebP (dos anchos)
├── src/                        FUENTE — aquí se edita
│   ├── html/
│   │   ├── 01-head/            Metadatos, redes, recursos, JSON-LD
│   │   ├── 02-generado/        Sprite de iconos (lo escribe build:icons)
│   │   ├── 03-secciones/       Una sección de la página por archivo
│   │   └── 04-cierre.html      </body></html>
│   ├── css/
│   │   ├── input.css           Entrada de Tailwind: importa las partes
│   │   └── partes/             Un bloque de estilos por archivo
│   └── js/                     Una función de la página por archivo
├── media/originals/            Fotos originales sin tocar (no se publican)
├── tools/                      Scripts de build y revisión
├── package.json
└── README.md
```

**No edites `index.html`, `assets/css/styles.css` ni `assets/js/main.js`:** se
sobrescriben en cada build. Edita `src/` y ejecuta `npm run build`.

### Por qué van numeradas las carpetas y los archivos

El build concatena los fragmentos en orden alfabético de ruta. El número del
principio *es* el orden en que aparecen en la página, así que renombrar un
archivo lo mueve de sitio y no hace falta mantener ninguna lista aparte.

---

## Compilar

```bash
npm install        # solo la primera vez
npm run build      # iconos + HTML + JS + CSS
npm run dev        # recompila el CSS al guardar, mientras trabajas
```

| Comando | Qué hace | De dónde | A dónde |
|---|---|---|---|
| `npm run build:icons` | Empaqueta el sprite SVG | `node_modules` (Lucide, Simple Icons) | `src/html/02-generado/` |
| `npm run build:html` | Une los fragmentos | `src/html/` | `index.html` |
| `npm run build:js` | Une las partes | `src/js/` | `assets/js/main.js` |
| `npm run build:css` | Compila Tailwind | `src/css/` | `assets/css/styles.css` |
| `npm run build:img` | Optimiza las fotos | `media/originals/` | `assets/img/` |

`build:img` va aparte porque solo hace falta cuando cambian las fotos, y tarda.

---

## Cómo está partido el código

**HTML** — `src/html/03-secciones/` tiene un archivo por sección visible de la
página: `07-habitaciones.html`, `10-ubicacion.html`, `13-preguntas-frecuentes.html`…
Para tocar una sección, abre solo su archivo.

**CSS** — `src/css/partes/` tiene un archivo por bloque de estilos, en el mismo
orden en el que se cargan: tema y paleta, base, iconos, utilidades de marca y
después un archivo por componente (intro, header, menú, FAQ, mapa…).
`src/css/input.css` solo importa Tailwind y las partes, y le dice qué carpetas
escanear para generar únicamente las clases que se usan.

**JS** — `src/js/` tiene un archivo por comportamiento: `07-cotizador.js`,
`09-mapa.js`, `10-cielo-estrellado.js`… `00-base.js` declara lo compartido
(`$`, `$$`, `WHATSAPP`, `reduceMotion`) y el build envuelve todo en una sola
clausura, por eso el resto de archivos puede usar esos ayudantes directamente.
El resultado sigue siendo **un único archivo sin dependencias**.

---

## Dónde se cambia cada dato

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `src/js/00-base.js` (constante `WHATSAPP`) y los enlaces `wa.me` en `src/html/` |
| Tarifas por noche | `src/html/03-secciones/12-reserva-cotizador.html`, atributos `data-precio` |
| Textos de habitaciones | `src/html/03-secciones/07-habitaciones.html` |
| Preguntas frecuentes | `src/html/03-secciones/13-preguntas-frecuentes.html` |
| Dirección, mapa y coordenadas | `src/html/03-secciones/10-ubicacion.html` y `src/js/09-mapa.js` |
| Redes, horarios y contacto | `src/html/03-secciones/14-pie.html` y `src/html/01-head/04-datos-estructurados.html` |
| Metadatos y vista previa al compartir | `src/html/01-head/` |

Las tarifas se escriben **una sola vez**: los precios de las tarjetas de
habitación los toma `src/js/06-precios-tarjetas.js` del propio cotizador, así
nunca quedan desfasados.

---

## Cambiar o añadir fotos

1. Deja el archivo original en `media/originals/` con el nombre que le
   corresponde (`hab-doble.jpg`, `huesped-3.jpg`, …).
2. Ejecuta `npm run build:img`.
3. Se regeneran los WebP en `assets/img/` en los tamaños que la página usa.
4. Si cambió el tamaño de la foto, actualiza `width`, `height` y `srcset` en el
   fragmento HTML que la muestra.

Para añadir una foto nueva, agrégala también al diccionario `PLAN` de
`tools/optimize-images.py`.

`media/originals/` está fuera de `assets/` a propósito: son ~8 MB de JPG que no
tiene sentido publicar, pero sí conservar para poder reoptimizar.

---

## Iconos

No se usa Font Awesome. Los ~34 iconos que la página necesita se empaquetan en
un sprite SVG que se incrusta en el HTML.

Para cambiarlos, edita los diccionarios `LINE` / `BRAND` de
`tools/build-icons.mjs` (nombres de [Lucide](https://lucide.dev) y
[Simple Icons](https://simpleicons.org)) y ejecuta `npm run build:icons`.

---

## Revisión automática

```bash
npm run check
```

Abre la página en Chromium a 390, 820 y 1440 px, guarda capturas en
`tools/shots/`, y verifica que no haya errores de consola, peticiones fallidas,
desbordamiento horizontal ni imágenes sin `alt` o sin dimensiones. Con
`PW_CHROMIUM` puedes apuntar a un Chromium propio.

`npm run preview` genera además un `preview.html` de un solo archivo, con todo
incrustado, para compartir la página sin subirla a ningún sitio.

---

## Notas de rendimiento

La página no carga **nada** de terceros al abrirse: sin Tailwind por CDN, sin
Font Awesome, sin Google Fonts. El mapa de Google se inserta solo cuando el
visitante pulsa «Ver la ubicación exacta del hotel».

| | Antes | Ahora |
|---|---|---|
| Fotos (todas) | 6.7 MB | 1.4 MB (WebP, dos anchos con `srcset`) |
| CSS | Tailwind CDN: ~300 KB de JS que compila en el navegador | 58 KB estáticos (10 KB gzip) |
| Iconos | Font Awesome completo (~300 KB con fuentes) | sprite SVG de 14 KB, incrustado |
| Tipografías | 3 familias desde Google Fonts | 2 familias variables propias, 102 KB |
| Peticiones a terceros | 3 dominios | 0 |

Primera visita, ya comprimido: **~140 KB** de HTML, CSS, JS y tipografías, más
las fotos que el navegador decida traer de entrada — en móvil unos 170 KB, en
escritorio unos 340 KB. Antes rondaba los 7.5 MB.

---

## Pendiente

- Existe un repositorio antiguo con el mismo sitio (`Bahia-de-Cuba/Landing-Page`)
  que también tiene GitHub Pages activo. Conviene archivarlo o redirigirlo:
  hoy compiten entre sí en buscadores.
- Al tener dominio propio, actualizar `canonical`, `og:url`, `og:image` y las
  URL del JSON-LD en `src/html/01-head/`.
- Confirmar tarifas y horarios con el hotel antes de la próxima campaña.
