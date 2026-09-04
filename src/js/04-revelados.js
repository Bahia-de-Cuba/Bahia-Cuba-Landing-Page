  /* ------------------------------------------------------------------
     4. REVELADO AL ENTRAR EN PANTALLA
     ------------------------------------------------------------------ */
  (function reveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        obs.unobserve(e.target); // una vez visible, deja de observarse
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { obs.observe(el); });
  })();
