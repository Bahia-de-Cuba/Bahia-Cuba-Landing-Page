# Cómo trabajamos

Las reglas son las mismas que en la app:
[Bahia-Cuba-App/CONTRIBUTING.md](https://github.com/Bahia-de-Cuba/Bahia-Cuba-App/blob/main/CONTRIBUTING.md),
y el reparto de tareas está en su `docs/PLAN-TRABAJO-CONJUNTO.md`.

Lo propio de esta web:

- **`index.html` no se edita a mano**: es la salida de `npm run build`, que
  junta los fragmentos de `src/html/`. Ver el README.
- **Al subir a `main` se publica sola**, en GitHub Pages y en Cloudflare
  Pages. No hay paso de despliegue: lo que subes, se ve.
- Antes de subir: `npm run build`, `npm run check` y
  `node tools/comprobar-csp.mjs`. GitHub repite las comprobaciones en cada push.
- Este repositorio es **público**. Aquí no va ninguna clave salvo la
  publicable de Supabase, que es pública por diseño.
