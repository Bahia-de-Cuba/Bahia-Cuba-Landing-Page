  /* ------------------------------------------------------------------
     3. CABECERA Y BARRA MÓVIL
     Un solo rAF de scroll. La cabecera se esconde al bajar y vuelve al
     subir; la barra móvil aparece cuando el botón del cartel ya no se ve
     y se aparta cuando el formulario de reserva está en pantalla.
     ------------------------------------------------------------------ */
  (function cabeceraYBarra() {
    var cab = $("#cabecera");
    var barra = $("#barraMovil");
    var cartel = $("#inicio");
    if (!cab) return;

    var ultimo = window.scrollY;
    var pendiente = false;
    var menuAbierto = function () {
      var m = $("#menuMovil");
      return m && m.dataset.estado === "abierto";
    };

    function leer() {
      pendiente = false;
      var y = window.scrollY;
      var altoCartel = cartel ? cartel.offsetHeight : 600;
      var estado = "arriba";
      if (y > 24) estado = "abajo";
      // Se esconde solo al bajar con decisión, pasado el cartel (histéresis de 8px)
      if (y > altoCartel && y - ultimo > 8 && !menuAbierto()) estado = "oculta";
      else if (cab.dataset.estado === "oculta" && ultimo - y < 8 && y > altoCartel) estado = "oculta";
      cab.dataset.estado = estado;
      ultimo = y;
    }

    window.addEventListener("scroll", function () {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(leer);
      }
    }, { passive: true });
    leer();

    /* Barra móvil */
    if (barra && "IntersectionObserver" in window) {
      var accionCartel = $(".cartel__acciones");
      var reserva = $("#reservar");
      var accionVisible = true, reservaVisible = false;
      var actualizar = function () {
        barra.dataset.visible = String(!accionVisible && !reservaVisible);
      };
      new IntersectionObserver(function (e) {
        accionVisible = e[0].isIntersecting;
        actualizar();
      }).observe(accionCartel || cartel);
      if (reserva) {
        new IntersectionObserver(function (e) {
          reservaVisible = e[0].isIntersecting;
          actualizar();
        }, { rootMargin: "0px 0px -35% 0px" }).observe(reserva);
      }
    }

    /* Enlace activo del menú según la sección en pantalla */
    var enlaces = $$(".cabecera__nav a");
    if (enlaces.length && "IntersectionObserver" in window) {
      var porId = {};
      enlaces.forEach(function (a) { porId[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          var a = porId[en.target.id];
          if (!a) return;
          if (en.isIntersecting) {
            enlaces.forEach(function (x) { x.removeAttribute("aria-current"); });
            a.setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(porId).forEach(function (id) {
        var s = document.getElementById(id);
        if (s) io.observe(s);
      });
    }
  })();
