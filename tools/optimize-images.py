#!/usr/bin/env python3
"""
Optimiza las fotos del hotel: redimensiona a los tamanos que realmente
se muestran y exporta WebP (2 anchos por imagen para srcset).

Uso:  python3 tools/optimize-images.py
Entrada:  assets/originals/*.jpg   Salida:  assets/img/*.webp
"""
import os
from PIL import Image, ImageOps

SRC = "assets/originals"
OUT = "assets/img"

# nombre -> (caja maxima del tamano grande, calidad)
PLAN = {
    "fondo":             ((1800, 1200), 72),
    "logo":              ((320, 320),   88),
    "hab-individual":    ((1400, 1400), 78),
    "hab-matrimonial":   ((1400, 1400), 78),
    "hab-doble":         ((1400, 1400), 78),
    "hab-familiar":      ((1200, 1200), 70),
    "fachada":           ((1200, 1400), 78),
    "terraza-parrilla":  ((1400, 1400), 78),
    "terraza-billar":    ((1400, 1400), 78),
    "huesped-1":         ((760, 900),   76),
    "huesped-2":         ((760, 900),   76),
    "huesped-3":         ((760, 900),   76),
    "huesped-4":         ((760, 900),   76),
    "huesped-5":         ((760, 900),   76),
    "huesped-6":         ((760, 900),   76),
}

# recortes previos, en fracciones de la imagen (izq, arriba, der, abajo)
CROP = {
    # quita cielo de mas para que el letrero del hotel gane presencia
    "fachada": (0.0, 0.17, 1.0, 1.0),
}

# imagenes que ademas necesitan una variante chica para moviles
SMALL = {"fondo", "hab-individual", "hab-matrimonial", "hab-doble",
         "hab-familiar", "terraza-parrilla", "terraza-billar", "fachada"}


def save_webp(im, path, quality):
    im.save(path, "WEBP", quality=quality, method=6)
    return os.path.getsize(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    total_in = total_out = 0
    rows = []

    for name, (box, q) in PLAN.items():
        src = os.path.join(SRC, f"{name}.jpg")
        if not os.path.exists(src):
            print(f"  !! falta {src}")
            continue
        size_in = os.path.getsize(src)
        total_in += size_in

        im = Image.open(src)
        im = ImageOps.exif_transpose(im).convert("RGB")

        if name in CROP:
            l, t, r, b = CROP[name]
            im = im.crop((round(l * im.width), round(t * im.height),
                          round(r * im.width), round(b * im.height)))

        im.thumbnail(box, Image.LANCZOS)

        out_big = os.path.join(OUT, f"{name}.webp")
        size_out = save_webp(im, out_big, q)
        made = [f"{im.width}w"]

        if name in SMALL:
            small = im.copy()
            small.thumbnail((round(im.width * 0.55), round(im.height * 0.55)), Image.LANCZOS)
            out_small = os.path.join(OUT, f"{name}-sm.webp")
            size_out += save_webp(small, out_small, q)
            made.append(f"{small.width}w")

        total_out += size_out
        rows.append((name, size_in / 1024, size_out / 1024, ", ".join(made)))

    # favicon pequeno en PNG (compatibilidad universal)
    logo = ImageOps.exif_transpose(Image.open(os.path.join(SRC, "logo.jpg"))).convert("RGB")
    logo.thumbnail((180, 180), Image.LANCZOS)
    logo.quantize(colors=96, method=Image.MEDIANCUT).save(
        os.path.join(OUT, "favicon.png"), "PNG", optimize=True
    )

    # Imagen de vista previa al compartir el enlace (WhatsApp, Facebook...).
    # Va en JPEG 1200x630: es el unico formato/proporcion que todas respetan.
    og = ImageOps.exif_transpose(Image.open(os.path.join(SRC, "fachada.jpg"))).convert("RGB")
    w, h = og.size
    alto = round(w / 1.9047)            # proporcion 1.91:1
    centro = round(h * 0.47)            # el letrero queda a esta altura
    arriba = max(0, min(centro - alto // 2, h - alto))
    og = og.crop((0, arriba, w, arriba + alto)).resize((1200, 630), Image.LANCZOS)
    og.save(os.path.join(OUT, "og.jpg"), "JPEG", quality=82, optimize=True, progressive=True)
    print(f"\nog.jpg (vista previa al compartir): {os.path.getsize(os.path.join(OUT, 'og.jpg')) / 1024:.0f}KB")

    w = max(len(r[0]) for r in rows)
    print(f"{'imagen'.ljust(w)}   antes      despues    anchos")
    for n, a, b, m in rows:
        print(f"{n.ljust(w)}   {a:7.0f}KB  {b:7.0f}KB   {m}")
    print(f"\n{'TOTAL'.ljust(w)}   {total_in/1024:7.0f}KB  {total_out/1024:7.0f}KB   "
          f"(-{100 - total_out/total_in*100:.0f}%)")


if __name__ == "__main__":
    main()
