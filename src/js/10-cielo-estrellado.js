  /* ------------------------------------------------------------------
     10. CIELO ESTRELLADO DEL ROOFTOP
     ------------------------------------------------------------------ */
  (function estrellas() {
    var caja = $("#rooftopStars");
    if (!caja || reduceMotion) return;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < 46; i++) {
      var s = document.createElement("span");
      var tam = (Math.random() * 2 + 1).toFixed(1);
      s.style.cssText =
        "position:absolute;border-radius:50%;background:#fff;" +
        "width:" + tam + "px;height:" + tam + "px;" +
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "top:" + (Math.random() * 100).toFixed(2) + "%;" +
        "opacity:" + (Math.random() * 0.5 + 0.2).toFixed(2) + ";" +
        "animation:twinkle " + (Math.random() * 3 + 2).toFixed(1) + "s ease-in-out " +
        (Math.random() * 3).toFixed(1) + "s infinite alternate";
      frag.appendChild(s);
    }
    caja.appendChild(frag);

    var hoja = document.createElement("style");
    hoja.textContent = "@keyframes twinkle{to{opacity:.95;transform:scale(1.35)}}";
    document.head.appendChild(hoja);
  })();
