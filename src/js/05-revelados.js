  /* ------------------------------------------------------------------
     5. REVELADOS AL BAJAR
     Solo se ocultan los elementos que al cargar están fuera de pantalla:
     lo que ya se ve, se queda visible. Sin IntersectionObserver o con
     movimiento reducido, todo está a la vista desde el principio.
     ------------------------------------------------------------------ */
  (function revelados() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    $$(".seccion .rotulo-seccion, .pie__rotulo").forEach(function (el) { el.dataset.revelar = "rotulo"; });
    $$(".seccion .foto-pegada").forEach(function (el) { el.dataset.revelar = "foto"; });
    $$(".cartelera, .programa, .casa__lista, .muro, .instrumentos").forEach(function (el) {
      el.dataset.revelar = "lista";
      Array.prototype.forEach.call(el.children, function (h, i) { h.style.setProperty("--n", i); });
    });

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("revelado");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    var alto = window.innerHeight;
    $$("[data-revelar]").forEach(function (el) {
      if (el.getBoundingClientRect().top < alto) return; // ya está a la vista
      el.classList.add("por-revelar");
      io.observe(el);
    });
  })();
