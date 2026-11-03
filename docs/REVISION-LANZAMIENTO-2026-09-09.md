# Revisión de lanzamiento — 9 de septiembre de 2026

Base revisada: `main`, commit `74e49c7`. Se mantienen el diseño y la estructura.

El cotizador permitía cuatro personas en la doble, aunque el catálogo muestra tres.
Se ajustó la capacidad de respaldo, se añadió triple y se consulta `capacidad_max`
junto con las tarifas. El envío se detiene si se supera esa capacidad. También se
conservan los céntimos de las tarifas y se rechazan fechas anteriores al mínimo o
estancias superiores a 365 noches. Las fechas iniciales usan el día de Lima.

Verificación: `npm run build:js`, `node --check assets/js/main.js` y
`node --test tools/test-cotizador.cjs`. Dos casos de regresión comprueban exceso de
huéspedes, capacidad de catálogo, céntimos y fechas fuera de rango. Navegación
pública: landing, cotizador y enlaces a la aplicación, sin crear reservas reales.

La disponibilidad final se decide en la aplicación y en Supabase, nunca en esta
landing. La auditoría de reservas y pagos está en un PR separado de Bahia-Cuba-App.
Estas correcciones no certifican que ese backend ya esté actualizado.

GitHub Pages publica al fusionar en la rama configurada. `_headers` no se aplica
en GitHub Pages; no se ha cambiado el alojamiento ni la configuración de cuentas.
