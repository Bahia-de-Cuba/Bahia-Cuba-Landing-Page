  /* ------------------------------------------------------------------
     6. TIRA — corre en bucle; con movimiento reducido se queda quieta
     ------------------------------------------------------------------ */
  (function tira() {
    var t = $(".tira");
    var pista = t && $(".tira__pista", t);
    if (!pista || reduceMotion) return;
    $$("li", pista).forEach(function (li) {
      var copia = li.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      pista.appendChild(copia);
    });
    t.classList.add("tira--anim");
  })();
