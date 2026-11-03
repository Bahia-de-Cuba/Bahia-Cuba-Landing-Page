---
name: Hotel Bahía de Cuba
description: El hotel se anuncia como un cartel chicha de la Panamericana; cada sección avisa algo verdadero.
colors:
  noche: "#10162b"
  noche-2: "#18213f"
  noche-3: "#24305a"
  niebla: "#c9cee0"
  niebla-2: "#8f96b3"
  rojo: "#e8231e"
  rojo-boton: "#d61f1b"
  rojo-hondo: "#b51714"
  rojo-texto: "#c81a17"
  rojo-vivo: "#ff4a3d"
  amarillo: "#ffc414"
  amarillo-hondo: "#e5a900"
  tinta-amarilla: "#3d2a00"
  morado: "#7b5cd6"
  morado-hondo: "#5b3fc0"
  morado-claro: "#b7a6ff"
  cal: "#f7f6f2"
  cal-2: "#ebe8e0"
  tinta: "#10162b"
  tinta-2: "#4a5170"
  blanco: "#ffffff"
typography:
  display:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "calc(var(--fit) * 1cqi)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4rem)"
    fontWeight: 900
    lineHeight: 0.9
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 1.5vw + 0.8rem, 1.625rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 72"
  lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1vw + 0.8rem, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 75"
  button:
    fontFamily: "Anybody, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 80"
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  foto: "2px"
  costura: "3px"
  control: "4px"
  panel: "6px"
  pieza: "8px"
  pastilla: "999px"
spacing:
  margen: "clamp(1rem, 4vw, 3.5rem)"
  seccion: "clamp(4.5rem, 9vw, 8.5rem)"
  ancho: "84rem"
  cabecera: "4.25rem"
components:
  button-reservar:
    backgroundColor: "{colors.rojo-boton}"
    textColor: "{colors.blanco}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.8em 1.35em"
    height: "3rem"
  button-reservar-hover:
    backgroundColor: "{colors.rojo-hondo}"
  button-noche:
    backgroundColor: "{colors.noche}"
    textColor: "{colors.blanco}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.8em 1.35em"
    height: "3rem"
  button-noche-hover:
    backgroundColor: "{colors.noche-3}"
  button-amarillo:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.noche}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.8em 1.35em"
    height: "3rem"
  button-claro:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.noche}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.8em 1.35em"
    height: "3rem"
  button-claro-hover:
    backgroundColor: "{colors.cal-2}"
  input-campo:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.85rem"
    height: "3rem"
  chip:
    textColor: "{colors.noche}"
    rounded: "{rounded.pastilla}"
    padding: "0 1rem"
    height: "2.875rem"
  chip-selected:
    backgroundColor: "{colors.noche}"
    textColor: "{colors.blanco}"
  costura:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.tinta}"
    typography: "{typography.caption}"
    rounded: "{rounded.costura}"
    padding: "0.5rem 0.9rem"
  letrero:
    backgroundColor: "{colors.noche-3}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.pieza}"
    padding: "1.1rem 1.4rem 1.2rem"
  boleto:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pieza}"
    padding: "clamp(1.5rem, 3vw, 2.5rem)"
---

# Design System: Hotel Bahía de Cuba

## Overview

**Creative North Star: "El cartel chicha de la Panamericana"**

La página es una sucesión de carteles pintados a mano junto a la carretera. Cada sección es un campo entero de un solo color (azul noche, amarillo letrero, rojo atardecer, morado, cal) con un rótulo negro y condensado que llena el ancho de su columna, y cada cartel avisa algo verdadero: a qué hora cae el sol hoy, qué cuarto te sirve, si el rooftop está abierto, cuánto falta desde Lima. El color tiene oficio, no adorno.

El sol de puntos del logo es el sistema de luz. Los mismos anillos de puntos dibujan el sol del cartel principal (que sube y baja con la hora real de Huarmey), el arco del atardecer, los diales de energía y la costura entre secciones, donde el color de arriba se deshace en puntos cada vez más pequeños. El cartel principal cambia de color entre día, atardecer y noche solo cambiando tokens.

Densidad media, contraste alto, nada de vidrio ni degradados de agencia. Las fotos son reales, enmarcadas en blanco como pegadas en un muro, y llevan sus datos cosidos debajo. Se rechaza la foto de playa a pantalla completa con barra de fechas y titular serif.

**Key Characteristics:**
- Campos de color planos a sangre, uno por sección, unidos por una trama de puntos.
- Rótulos apilados en Anybody 900 al 62 % de ancho, cada línea a su propio tamaño.
- Color por función: rojo reserva, amarillo marca el sol y la hora, morado es la segunda voz.
- El sol de puntos como única fuente de luz y de transición.
- Fotos reales con marco blanco y leyenda cosida de datos verdaderos.

## Colors

Una paleta de letrero pintado: cinco colores enteros, cada uno con un papel fijo, y variantes solo para ganar contraste.

### Primary
- **Rojo atardecer** (rojo): la marca y los rótulos grandes; la línea de color de un rótulo.
- **Rojo de botón** (rojo-boton): fondo de todo botón Reservar y del campo de la sección de reserva; blanco encima pasa AA. Su hover es el **rojo hondo** (rojo-hondo).
- **Rojo de texto** (rojo-texto): el rojo cuando es texto sobre cal. **Rojo vivo** (rojo-vivo): el rojo cuando es texto sobre noche.

### Secondary
- **Amarillo letrero** (amarillo): el sol y la hora. Campo de la sección del atardecer, cartel principal de día, puntos encendidos de los diales, datos destacados sobre noche, foco sobre fondos oscuros y la selección de texto. **Amarillo hondo** (amarillo-hondo) es su suelo secundario.
- **Tinta amarilla** (tinta-amarilla): texto secundario sobre amarillo.

### Tertiary
- **Morado del letrero pintado** (morado): la segunda voz. Campo de huéspedes, la tira de servicios. **Morado hondo** (morado-hondo) hace la sombra de letra sobre morado y de noche; **morado claro** (morado-claro) tiñe el sol de puntos de noche.

### Neutral
- **Azul noche** (noche): el negro del cartel. Fondo del documento, cartel de noche, botones de estructura, bordes de 3 px, foco sobre fondos claros. **Noche 2** (noche-2) y **noche 3** (noche-3) son el segundo campo oscuro y el hover/panel interior.
- **Niebla** (niebla): texto corrido sobre noche; **niebla 2** (niebla-2) para datos secundarios.
- **Cal** (cal): las paredes; campo claro y fondo de las piezas de papel (leyendas, boleto). **Cal 2** (cal-2) es el hover suave sobre cal.
- **Tinta** (tinta) y **tinta 2** (tinta-2): texto y párrafo sobre cal.

### Named Rules
**La regla del color con oficio.** Rojo solo para reservar y la marca, amarillo solo para el sol y la hora, morado para la segunda voz. Un color nuevo no entra sin un oficio que los demás no cumplan.

**La regla del rojo según el muro.** El rojo cambia de valor según el fondo: rojo-boton bajo texto blanco, rojo-texto sobre cal, rojo-vivo sobre noche. Nunca el rojo de rótulo como texto pequeño sobre cal.

**La regla del campo entero.** Una sección es un solo color a sangre (cal, amarillo, noche, noche-2, morado o rojo); dos campos seguidos nunca repiten color.

## Typography

**Display Font:** Anybody (con Arial Narrow), autoalojada, variable en peso y ancho
**Body Font:** Archivo (con ui-sans-serif, system-ui), autoalojada

**Character:** Anybody al 62 % de ancho y peso 900 es la letra de brocha del cartel chicha; Archivo es la voz llana que da los datos.

### Hierarchy
- **Display** (900, ancho 62 %, tamaño por línea vía `--fit` en cqi, interlineado 0.86, mayúsculas): rótulos de sección, título del cartel principal y rótulo del pie. Cada línea es un bloque que llena el ancho del rótulo; las secciones limitan el rótulo a 34rem, el cartel a min(100 %, 56svh).
- **Headline** (900, ancho 62 %, clamp(2.75rem, 6vw, 4rem), 0.9): la cifra o lugar protagonista de una pieza (el letrero de ruta, el veredicto de habitación).
- **Title** (800, ancho 72 %, clamp(1.25rem, 1.5vw + 0.8rem, 1.625rem), 1.2): preguntas del acordeón, nombres en listas.
- **Lead** (400, clamp(1.0625rem, 1vw + 0.8rem, 1.25rem), 1.55, máx. 38rem, `text-wrap: pretty`): el párrafo bajo un rótulo.
- **Body** (400, 1.0625rem, 1.6): texto corrido; respuestas del acordeón a 62ch.
- **Label** (800, ancho 75 %, 0.875rem, 0.04em, mayúsculas): etiquetas de campos de formulario.
- **Button** (800, ancho 80 %, 1.0625rem, 0.02em, mayúsculas): botones y enlaces de cartel.

### Named Rules
**La regla del rótulo apilado.** Un rótulo grande se escribe en líneas `.linea`, cada una con su `--fit` (porcentaje del ancho en cqi) para que llene la columna sin JavaScript. Nunca un titular en párrafo con salto automático.

**La regla de la sombra pintada.** La sombra desplazada (0.035em 0.035em, sin desenfoque) es de rótulo pintado y va solo en la línea de color de un rótulo grande, con color según el campo: amarillo sobre cal, blanco sobre amarillo, rojo-boton sobre noche, morado-hondo sobre morado, rojo-hondo sobre rojo.

**La regla de las cifras.** Precios, horas y totales usan cifras tabulares; las horas se escriben «6:12 p. m.» con espacios de no separación, en hora de Lima.

## Layout

Página de una columna de campos de color a sangre. El contenido vive en un contenedor de máximo 84rem con margen lateral fluido clamp(1rem, 4vw, 3.5rem); el cartel principal se abre a 90rem. Cada sección respira clamp(4.5rem, 9vw, 8.5rem) arriba y abajo. La cabecera fija mide 4.25rem y el scroll ancla con ese margen más 1rem.

Las rejillas son de móvil primero y se abren a dos columnas en 1024px (el corte principal); 768px y 900px ajustan piezas intermedias. Todo hijo de rejilla lleva `min-width: 0` para que un campo de fecha no desborde en móvil. La cartelera de habitaciones es una lista de filas separadas por reglas de 3 px en azul noche, no una cuadrícula de tarjetas.

**La regla de la costura de puntos.** El paso de una sección a otra es una franja de 2.75rem donde el color anterior se deshace en una trama de círculos decrecientes (máscara SVG de 22×44px repetida en horizontal). Cada sección declara el color de arriba en `--antes`; nunca una línea recta ni un degradado.

## Elevation & Depth

El sistema es plano: la profundidad la dan los campos de color y el marco blanco. Las sombras existen, pero solo como sombras de objeto pegado (largas, negativas y desenfocadas, teñidas del color del campo), nunca como tarjetas flotantes. La única sombra dura es la de la letra pintada (ver Typography).

### Shadow Vocabulary
- **Botón** (`box-shadow: 0 10px 22px -12px rgb(16 22 43 / 0.35)`; hover `0 16px 26px -14px`): el botón sube 2px al pasar.
- **Foto pegada** (`box-shadow: 0 18px 30px -18px rgb(0 0 0 / 0.55)`): bajo fotos con marco blanco de 6px.
- **Boleto** (`box-shadow: 0 30px 60px -30px rgb(60 0 0 / 0.75)`): el boleto de reserva sobre el campo rojo.
- **Cabecera abajo** (`box-shadow: 0 10px 30px -18px rgb(0 0 0 / 0.8)`): solo cuando la página ya bajó.
- **Foco de campo** (`box-shadow: 0 0 0 4px rgb(214 31 27 / 0.22)`): anillo rojo de inputs enfocados.

### Named Rules
**La regla de la luz de puntos.** Lo que brilla se dibuja con puntos: el sol, los diales encendidos, las estrellas del cielo nocturno. No hay resplandores, halos ni degradados radiales de luz.

## Shapes

Esquinas casi rectas de letrero: 2px en fotos, 3px en la leyenda cosida y el foco, 4px en botones y campos, 6px en paneles interiores, 8px en piezas grandes (letrero, boleto, instrumentos). Lo redondo es solo lo que es redondo de verdad: puntos, el sol, chips e interruptores en pastilla. Las reglas son gruesas (3px en azul noche) y separan filas, acordeón y tira. El boleto de reserva tiene muescas de troquel recortadas con máscara a los lados.

## Components

### Buttons
Letra de cartel en un rectángulo pintado: firme, mayúsculas, con un leve levantamiento.
- **Shape:** esquinas casi rectas (4px), alto mínimo 3rem.
- **Reservar (primario):** rojo-boton con texto blanco, padding 0.8em 1.35em; puede llevar el precio («desde S/ 180») en peso 600 y cifras tabulares.
- **Hover / Focus:** hover al tono hondo, sube 2px y la flecha final avanza 3px; al pulsar baja 1px y escala a 0.98. Foco con contorno de 3px en el color de foco del campo.
- **Variantes:** noche (estructura), amarillo (sobre campos oscuros), claro (blanco sobre rojo o morado); tamaños chico (2.5rem) y grande (3.75rem).
- **Enlace de cartel:** misma letra que el botón, subrayado de 2px que se tiñe de rojo (o amarillo sobre noche) al pasar.

### Chips
- **Style:** pastilla con borde de 2px azul noche, alto 2.875rem, texto 700.
- **State:** seleccionado en azul noche con texto blanco e icono amarillo; hover cal-2; foco con contorno rojo-boton.

### Cards / Containers
- **Letrero:** panel noche-3 de 8px con doble filete interior blanco, como un letrero de carretera; lugar en Headline, datos destacados en amarillo.
- **Veredicto:** panel noche de 6px que responde «qué cuarto te sirve» con la cifra en amarillo.
- **Boleto:** papel cal de 8px con muescas laterales y sombra de objeto.
- **Instrumentos:** cuatro piezas idénticas (sol, viento, batería, agua) con un dial de anillos de puntos que se encienden en amarillo.

### Inputs / Fields
- **Style:** fondo blanco, borde de 2px en el color del texto, 4px de radio, alto 3rem, texto 600 con cifras tabulares; etiqueta en Label encima.
- **Focus:** borde rojo-boton más anillo rojo translúcido de 4px.

### Navigation
- **Cabecera:** barra fija azul noche al 82 % con desenfoque, marca en Display chico (1.5rem); se oculta al bajar y reaparece al subir, con histéresis en el umbral. En móvil, menú a pantalla completa y barra inferior con Reservar.

### Leyenda cosida
La firma del sistema: una etiqueta cal con texto 600 de 0.8125rem y un pespunte rojo discontinuo de 1.5px metido 5px hacia dentro, pegada bajo (o montada sobre el borde de) una foto real. Solo lleva datos verdaderos: cama, aforo, precio, hora.

### Sol de puntos
Anillos concéntricos de puntos generados por un único ayudante (`anillos()`), con el número de puntos calculado por el perímetro. Se usa para el sol del cartel, el arco del atardecer y los diales. Al cargar se enciende punto a punto (escala 0.3 → 1, con retardo por punto).

### Movimiento
Un solo gesto de marca: el rótulo se «pega» como un cartel recién puesto (cada línea se destapa de abajo arriba con clip-path, 0.85–0.9s, `cubic-bezier(0.16, 1, 0.3, 1)`, 0.09s entre líneas); las fotos se destapan igual y las listas asoman en cascada de 70ms. Solo se anima lo que estaba fuera de pantalla al cargar; sin JavaScript nada queda oculto. Con movimiento reducido se quitan desplazamientos y bucles, pero se conservan los fundidos de color (el paso de día a noche del cartel, 0.8s).

## Do's and Don'ts

### Do:
- **Do** dar a cada sección un campo entero de color y declarar en `--antes` el color de la sección anterior para la costura de puntos.
- **Do** escribir los rótulos grandes como líneas apiladas con su propio `--fit`, y poner color y sombra pintada solo en una de ellas.
- **Do** usar rojo-boton para toda acción de reservar y mantener Reservar visible en cada tramo.
- **Do** dibujar cualquier luz, sol o medidor con anillos de puntos del ayudante común.
- **Do** colgar los colores del cartel principal de sus tokens (`--suelo`, `--l1`…`--l3`, `--sol`) para que día, atardecer y noche sean solo un cambio de tokens bajo `html[data-hora]`.
- **Do** coser los datos reales bajo cada foto con la leyenda cosida.
- **Do** ajustar el color de foco al campo: azul noche sobre claros, amarillo sobre oscuros.

### Don't:
- **Don't** usar la foto de playa a pantalla completa con barra de fechas y titular serif.
- **Don't** usar rojo para algo que no sea reservar o la marca, ni amarillo para algo que no sea sol, hora o dato destacado.
- **Don't** separar secciones con líneas rectas, ondas o degradados; la transición es la trama de puntos.
- **Don't** usar sombras de caja duras y desplazadas; la sombra sin desenfoque pertenece solo a la letra pintada.
- **Don't** poner antetítulos ni etiquetas decorativas sobre los rótulos; el rótulo apilado se presenta solo. Lo único que puede precederlo es un estado vivo con dato real (la pastilla abierto/cerrado del rooftop).
- **Don't** escribir en la leyenda cosida nada que no sea un dato verificable.
