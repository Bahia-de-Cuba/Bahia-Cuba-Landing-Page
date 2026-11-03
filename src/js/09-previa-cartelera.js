  /* ------------------------------------------------------------------
     9. FOTO QUE ACOMPAÑA AL CURSOR (cartelera, escritorio)
     En pantallas con ratón la cartelera es solo texto y la foto de cada
     habitación sigue al cursor con un muelle suave. En móvil la foto va
     dentro de cada fila, así que esto no hace nada.
     ------------------------------------------------------------------ */
  (function previaCartelera() {
    var lista = $("#cartelera");
    if (!lista || reduceMotion) return;
    var mq = window.matchMedia("(hover: hover) and (min-width: 1024px)");

    var previa = document.createElement("figure");
    previa.className = "previa";
    previa.setAttribute("aria-hidden", "true");
    previa.innerHTML = '<img alt="" decoding="async"><figcaption class="costura"></figcaption>';
    document.body.appendChild(previa);
    var img = $("img", previa), pie = $("figcaption", previa);

    var x = 0, y = 0, tx = 0, ty = 0, vx = 0, corriendo = false, activa = false;

    function bucle() {
      // muelle amortiguado: rígido 0.14, amortiguado por la mezcla
      var dx = tx - x, dy = ty - y;
      x += dx * 0.16;
      y += dy * 0.16;
      vx = vx * 0.8 + dx * 0.02;
      previa.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" +
        (-3 + Math.max(-6, Math.min(6, vx))).toFixed(2) + "deg)";
      if (activa || Math.abs(dx) + Math.abs(dy) > 0.5) requestAnimationFrame(bucle);
      else corriendo = false;
    }

    function mover(ev) {
      tx = ev.clientX + 28;
      ty = ev.clientY - 160;
      if (!corriendo) {
        corriendo = true;
        requestAnimationFrame(bucle);
      }
    }

    $$(".fila", lista).forEach(function (fila) {
      var foto = $(".fila__foto img", fila);
      var cap = $(".fila__foto figcaption", fila);
      fila.addEventListener("pointerenter", function (ev) {
        if (!mq.matches || ev.pointerType !== "mouse") return;
        img.src = foto.currentSrc || foto.src;
        pie.textContent = cap ? cap.textContent : "";
        if (!activa) {
          x = tx = ev.clientX + 28;
          y = ty = ev.clientY - 160;
        }
        activa = true;
        previa.dataset.visible = "true";
        mover(ev);
      });
      fila.addEventListener("pointermove", function (ev) { if (activa) mover(ev); });
    });
    lista.addEventListener("pointerleave", function () {
      activa = false;
      previa.dataset.visible = "false";
    });
  })();
