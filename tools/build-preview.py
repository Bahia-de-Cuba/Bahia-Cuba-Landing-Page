#!/usr/bin/env python3
"""
Genera una versión de un solo archivo (preview.html) con el CSS, el JS,
las fotos y las tipografías incrustados. Sirve para compartir la página
por un enlace sin tener que subir nada a un hosting.

No forma parte del sitio: el sitio real usa archivos separados.
"""
import base64, os, re

MIME = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".woff2": "font/woff2",
}


def data_uri(path):
    ext = os.path.splitext(path)[1]
    with open(path, "rb") as f:
        return f"data:{MIME[ext]};base64," + base64.b64encode(f.read()).decode()


html = open("index.html", encoding="utf-8").read()
css = open("assets/css/styles.css", encoding="utf-8").read()
js = open("assets/js/main.js", encoding="utf-8").read()

# Fuentes dentro del CSS
for name in os.listdir("assets/fonts"):
    css = css.replace(f"../fonts/{name}", data_uri(f"assets/fonts/{name}"))

# Enlaces a hojas/scripts -> contenido incrustado
html = re.sub(r'<link rel="stylesheet" href="assets/css/styles\.css">', f"<style>{css}</style>", html)
html = re.sub(r'<script src="assets/js/main\.js" defer></script>', f"<script>{js}</script>", html)
html = re.sub(r'\s*<link rel="preload" as="font"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="preload" as="image"[^>]*>', "", html)

# Imágenes (src, srcset y href del favicon)
for name in sorted(os.listdir("assets/img"), key=len, reverse=True):
    html = html.replace(f"assets/img/{name}", data_uri(f"assets/img/{name}"))

# Sin servidor no tiene sentido diferir la carga de imágenes
html = html.replace(' loading="lazy"', "")

open("preview.html", "w", encoding="utf-8").write(html)
print(f"preview.html — {os.path.getsize('preview.html') / 1024 / 1024:.1f} MB")
