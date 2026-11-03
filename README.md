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
├── media/originals/            Fotos originales y el recorte del hotel (no se publican)
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
npm run build      # iconos + JS + CSS + HTML
npm run dev        # recompila el CSS al guardar, mientras trabajas
```

| Comando | Qué hace | De dónde | A dónde |
|---|---|---|---|
| `npm run build:icons` | Empaqueta el sprite SVG | `node_modules` (Lucide, Simple Icons) | `src/html/02-generado/` |
| `npm run build:js` | Une las partes | `src/js/` | `assets/js/main.js` |
| `npm run build:css` | Compila Tailwind | `src/css/` | `assets/css/styles.css` |
| `npm run build:html` | Une los fragmentos y versiona los assets | `src/html/` | `index.html` |
| `npm run build:img` | Optimiza las fotos | `media/originals/` | `assets/img/` |

**`build:html` va el último a propósito.** Además de unir los fragmentos, pone un
`?v=<hash del contenido>` en el CSS y el JS, así que necesita esos dos archivos
ya compilados. Si no los encuentra, falla con un mensaje que explica el orden.

Ese hash no es cosmético: GitHub Pages sirve los assets con
`Cache-Control: max-age=600`, y el HTML y el CSS se cachean por separado. Sin él,
tras un despliegue un visitante puede quedarse con el HTML nuevo y el CSS viejo
—y la página se vería rota en vez de degradarse. Con el hash, un asset distinto es una URL distinta.

`build:img` va aparte porque solo hace falta cuando cambian las fotos, y tarda.

---

## Cómo está partido el código

**HTML** — `src/html/03-secciones/` tiene un archivo por sección visible de la
página: `05-hero.html`, `07-habitaciones.html`, `11-ruta.html`… Para tocar una
sección, abre solo su archivo.

**CSS** — `src/css/partes/` tiene un archivo por bloque, en el orden en que se
cargan: tipografías, tema (paleta), base, sistema del cartel (rótulos, botones,
secciones) y luego uno por sección. `src/css/input.css` solo importa Tailwind
(por su reset) y las partes.

**JS** — `src/js/` tiene un archivo por comportamiento: `08-con-quien-viajas.js`,
`10-atardecer.js`, `12-ruta-desde-lima.js`… `00-base.js` declara lo compartido
(`$`, `$$`, `WHATSAPP`, `reduceMotion`, `hora()`, `precioDe()`) y el build
envuelve todo en una sola clausura. El resultado sigue siendo **un único archivo
sin dependencias**.

---

## El diseño: un cartel chicha

La página se anuncia como los carteles fosforescentes de la Panamericana: cada
sección es un cartel que avisa algo verdadero. Los colores tienen un papel fijo
(definidos en `src/css/partes/01-tema.css`):

| Color | Papel |
|---|---|
| Rojo atardecer | Reservar y la marca |
| Amarillo letrero | El sol y la hora |
| Morado | La segunda voz del cartel |
| Azul noche | Fondo y estructura |
| Cal | Las paredes del hotel |

Tipografías propias: **Anybody** (rótulos, condensada y negra) y **Archivo**
(texto). Los rótulos apilados llenan su columna con `--fit`: el tamaño de cada
línea en % del ancho del rótulo (unidades `cqi`). Si cambias un texto de rótulo,
ajusta su `--fit` para que vuelva a llenar el ancho.

El sol de puntos del logo es el sistema de luz: se dibuja con la función
`anillos()` de `00-base.js` (cartel principal, arco del atardecer y los diales de
energía), y las transiciones entre secciones son una trama de puntos.

## Funciones vivas

- **Día, atardecer y noche.** Un script en línea del `<head>`
  (`src/html/01-head/03-recursos.html`) calcula la posición del sol en las
  coordenadas exactas del hotel y pone `data-hora` en `<html>` antes de pintar.
  El cartel principal cambia de colores con eso; el visitante puede verlo en
  otra hora con el selector.
- **Atardecer en vivo** (`10-atardecer.js`): puesta, salida y hora dorada de hoy
  o de la fecha que elija, y los próximos siete atardeceres. El cotizador también
  dice a qué hora cae el sol el día de llegada.
- **¿Con quién viajas?** (`08-con-quien-viajas.js`): recomienda la habitación,
  marca en la lista las que sirven y deja el cotizador con la misma elección.
- **Ruta desde Lima** (`12-ruta-desde-lima.js`): un `<input type="range">` con
  forma de carretera. Kilómetros y tiempos son aproximados (así lo dice la
  página); se editan en el arreglo `TRAMO`.
- **Varadero 319 abierto o cerrado** (`14-rooftop-y-energia.js`), según la hora
  de Huarmey.

Con `prefers-reduced-motion` no hay desplazamientos ni bucles; los cambios de
color se mantienen.

---

## Dónde se cambia cada dato

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `src/js/00-base.js` (constante `WHATSAPP`) y los enlaces `wa.me` en `src/html/` |
| Tarifas por noche (respaldo) | `src/html/03-secciones/13-reserva.html`, atributos `data-precio` |
| Textos de habitaciones | `src/html/03-secciones/07-habitaciones.html` |
| Regla de recomendación | `src/js/08-con-quien-viajas.js`, función `elegir()` |
| Preguntas frecuentes | `src/html/03-secciones/14-preguntas.html` |
| Dirección, mapa y coordenadas | `src/html/03-secciones/11-ruta.html`, `src/js/13-mapa.js` y el script del `<head>` |
| Horario del rooftop | `src/html/03-secciones/09-rooftop.html` y `src/js/14-rooftop-y-energia.js` |
| Redes, horarios y contacto | `src/html/03-secciones/15-pie.html` y `src/html/01-head/04-datos-estructurados.html` |
| Metadatos y vista previa al compartir | `src/html/01-head/` |

Las tarifas se escriben **una sola vez**: todo lo que muestra precios los toma
del `<select>` del cotizador, y al cargar se actualizan desde la base del hotel.

---

## Cambiar o añadir fotos

1. Deja el archivo original en `media/originals/` con el nombre que le
   corresponde (`hab-doble.jpg`, `huesped-3.jpg`, …).
2. Ejecuta `npm run build:img`.
3. Se regeneran los WebP en `assets/img/` en los tamaños que la página usa.
4. Si cambió el tamaño de la foto, actualiza `width`, `height` y `srcset` en el
   fragmento HTML que la muestra.

Para añadir una foto nueva, agrégala también al diccionario `PLAN` de
`tools/optimize-images.py`. Si lleva transparencia, añádela además a `CON_ALFA`
y déjala en `.png`: se exporta a WebP conservando el canal alfa.

`media/originals/hotel-recorte.png` se obtuvo levantando la máscara de un
recorte de fondo hecho sobre `fondo.jpg`: como el recorte venía a 644 px, se
reescaló su canal alfa a la resolución del original y se compuso sobre él, en
vez de usar la versión pequeña. Si hay que rehacerlo, se parte de `fondo.jpg`.

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
| Tipografías | 3 familias desde Google Fonts | 2 familias variables propias (Anybody + Archivo), 90 KB |
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
