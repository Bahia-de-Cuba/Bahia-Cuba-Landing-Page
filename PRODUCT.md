# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Familias de Lima en escapada de fin de semana o feriado; llegan en auto por la Panamericana Norte (~4 h).
- Grupos de amigos que vienen por la playa y por las noches en el rooftop.
- Parejas que buscan descanso y atardeceres.
- Viajeros con mascota que eligen el hotel por ser pet friendly.

Su trabajo en la web: entender rápido qué es el hotel y dónde está, elegir habitación según con quién viajan, ver el precio y reservar directo (o escribir por WhatsApp).

## Product Purpose

Landing de una sola página del Hotel Bahía de Cuba, eco hotel a 200 m de Playa Tuquillo, Huarmey (Áncash, Perú). Su éxito es que el visitante reserve directo en el sistema propio (`bahia-cuba-app.netlify.app/es/reservar`), sin intermediarios.

## Positioning

Pequeño hotel de playa con carácter propio frente a «la piscina del Pacífico»: energía 100 % solar y eólica (paneles, aerogenerador, baterías, agua temperada solar), pet friendly sin costo, estacionamiento privado y un bar en la azotea, **Varadero 319 Rooftop**, con billar, sapito y dardos de 19:00 a 01:00.

## Operating Context

- Reserva real en la app externa; la landing manda `tipo`, `checkin`, `checkout` por query string. Se paga el 50 % para asegurar y el resto al llegar (efectivo o transferencia).
- Tarifas vivas leídas de Supabase (tabla `habitaciones`, `tipo`, `precio_noche`); el HTML lleva tarifas de respaldo.
- Check-in 14:00, check-out 12:00. Rooftop 19:00–01:00.
- Contacto: WhatsApp +51 908 925 065. Instagram y Facebook del hotel.

## Capabilities and Constraints

- Sitio estático (Tailwind v4 compilado, JS sin dependencias, fragmentos HTML numerados). Sin peticiones a terceros al cargar salvo Supabase; CSP en `_headers`.
- Habitaciones e inventario: Individual (1 pers., 1 cama 1.5 plazas, S/180), Matrimonial (2, cama 2 plazas, S/220), Doble (hasta 3, cama 2 plazas + camarote, S/280), Triple (hasta 4, 3 camas individuales, S/310), Familiar (hasta 6, 2 camarotes, S/350). Todas con baño privado.
- Ubicación: Playa Tuquillo s/n, Huarmey 02651; -10.0158125, -78.1918125. Mapa de Google solo bajo demanda.
- Legales obligatorios: RUC 20612706230, Términos, Privacidad, Cancelación y Libro de reclamaciones visibles.

## Brand Commitments

- Logo: sol de puntos en anillo + «Bahía De Cuba» en caligrafía de brocha, blanco sobre rojo.
- Colores del hotel: rojo atardecer, amarillo/dorado del letrero de la entrada, azul noche; morado del letrero pintado; el edificio es blanco con pérgolas de caña y murales a mano.
- Tono: playero con carácter. Ambición de hotel de 5 estrellas en diseño y funciones, pero fiel a lo que el huésped encuentra: colorido, hecho a mano, solar, relajado. Nadie debe llegar y sentirse engañado.
- El rooftop se nombra **Varadero 319 Rooftop**.

## Evidence on Hand

- Fotos reales en `media/originals/` y `assets/img/`: 5 habitaciones, fachada con letrero amarillo, terraza (parrilla, billar), recorte del hotel, 6 fotos de huéspedes.
- No hay reseñas con texto, puntuaciones ni premios verificados: no inventarlos.

## Product Principles

1. Reservar directo siempre a un paso: precio visible y acción clara en cada tramo.
2. Mostrar el lugar tal como es; el diseño eleva, no disfraza.
3. Funciones que respondan preguntas reales del viajero (cuándo es el atardecer, qué cuarto me sirve, cómo llego).
4. Rápido y ligero: el público llega desde el celular, a menudo en carretera.

## Accessibility & Inclusion

WCAG 2.2 AA. Respeta `prefers-reduced-motion`. Uso mayoritario en móvil.
