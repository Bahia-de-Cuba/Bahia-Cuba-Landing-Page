  /* ------------------------------------------------------------------
     2. UN SOLO LISTENER DE SCROLL
     Barra de progreso, header compacto, parallax, scrollspy y botón
     de "volver arriba" comparten un único rAF: sin jank en móviles.
     ------------------------------------------------------------------ */
  (function scrollUI() {
    var header = $("#siteHeader");
    var bar = $("#scrollBar");
    var heroBg = $("#heroBackground");
    var toTop = $("#backToTop");
    var navLinks = $$("#primaryNav .nav-link");

    // Si el navegador soporta scroll-driven animations, la barra ya es CSS puro
    var barPorCSS = CSS.supports && CSS.supports("animation-timeline: scroll()");

    var secciones = navLinks
      .map(function (a) {
        var el = document.getElementById(a.getAttribute("href").slice(1));
        return el ? { link: a, el: el } : null;
      })
      .filter(Boolean);

    var esTactil = window.matchMedia("(hover: none)").matches;
    var pendiente = false;

    function actualizar() {
      pendiente = false;
      var y = window.scrollY || document.documentElement.scrollTop;

      if (bar && !barPorCSS) {
        var alto = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (alto > 0 ? Math.min(y / alto, 1) : 0) + ")";
      }

      if (header) header.classList.toggle("is-stuck", y > 12);

      if (toTop) toTop.dataset.state = y > window.innerHeight ? "shown" : "hidden";

      if (heroBg && !reduceMotion && !esTactil && y < window.innerHeight) {
        heroBg.style.transform = "translate3d(0," + y * 0.25 + "px,0) scale(1.05)";
      }

      // Scrollspy: la sección activa es la última cuyo inicio ya pasó el header
      var limite = y + (header ? header.offsetHeight : 0) + 90;
      var activa = null;
      for (var i = 0; i < secciones.length; i++) {
        if (secciones[i].el.offsetTop <= limite) activa = secciones[i];
      }
      navLinks.forEach(function (a) { a.classList.remove("is-active"); });
      if (activa) activa.link.classList.add("is-active");
    }

    function onScroll() {
      if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    actualizar();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  })();
