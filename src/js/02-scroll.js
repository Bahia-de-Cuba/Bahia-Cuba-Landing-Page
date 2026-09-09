  /* ------------------------------------------------------------------
     2. UN SOLO LISTENER DE SCROLL
     Barra de progreso, header compacto, parallax, scrollspy y botón
     de "volver arriba" comparten un único rAF: sin jank en móviles.
     ------------------------------------------------------------------ */
  (function scrollUI() {
    var header = $("#siteHeader");
    var bar = $("#scrollBar");
    var hero = $("#inicio");
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

    var pendiente = false;
    // Se recuerda cuál estaba activa para no tocar el DOM sin necesidad
    var activaAnterior;

    function actualizar() {
      pendiente = false;
      var y = window.scrollY || document.documentElement.scrollTop;

      if (bar && !barPorCSS) {
        var alto = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (alto > 0 ? Math.min(y / alto, 1) : 0) + ")";
      }

      /* Histeresis, no un umbral unico.
         `is-stuck` encoge el encabezado de 80 px a 60 px, y como es `sticky`
         ocupa sitio en el documento: al encogerse, el contenido sube 20 px y
         la posicion de scroll vuelve a cruzar el umbral. Con un solo limite en
         12 px eso entra en bucle y el encabezado tiembla mientras se anima su
         altura durante 0,3 s.
         Con dos limites separados 60 px —mas que el salto de 20— cruzar uno no
         puede devolverte al otro, y la oscilacion desaparece. */
      if (header) {
        if (!header.classList.contains("is-stuck")) {
          if (y > 80) header.classList.add("is-stuck");
        } else if (y < 20) {
          header.classList.remove("is-stuck");
        }
      }

      if (toTop) toTop.dataset.state = y > window.innerHeight ? "shown" : "hidden";

      // Hero: un solo valor 0..1 que el CSS reparte entre cielo, hotel,
      // niebla y texto. Se deja de calcular al salir del hero.
      if (hero && !reduceMotion && y < hero.offsetHeight * 1.1) {
        var avance = Math.min(Math.max(y / (hero.offsetHeight * 0.85), 0), 1);
        hero.style.setProperty("--hero-p", avance.toFixed(4));
      }

      // Scrollspy: la sección activa es la última cuyo inicio ya pasó el header
      var limite = y + (header ? header.offsetHeight : 0) + 90;
      var activa = null;
      for (var i = 0; i < secciones.length; i++) {
        if (secciones[i].el.offsetTop <= limite) activa = secciones[i];
      }
      // Solo se toca el DOM si la seccion activa CAMBIA.
      //
      // Antes se quitaba y se volvia a poner `is-active` en cada fotograma,
      // aunque la seccion fuera la misma. El subrayado tiene una transicion de
      // 0,3 s, asi que se reiniciaba sesenta veces por segundo mientras la
      // pagina se desplazaba: eso era el parpadeo al volver a Inicio.
      if (activa !== activaAnterior) {
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        if (activa) activa.link.classList.add("is-active");
        activaAnterior = activa;
      }
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
