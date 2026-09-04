  /* ------------------------------------------------------------------
     11. EFECTO 3D EN LA TARJETA DE ENERGÍA (solo con mouse)
     ------------------------------------------------------------------ */
  (function tilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

    $$(".card-tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  })();
