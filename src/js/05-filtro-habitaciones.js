  /* ------------------------------------------------------------------
     5. FILTRO DE HABITACIONES
     ------------------------------------------------------------------ */
  (function filtroHabitaciones() {
    var botones = $$(".room-filter-btn");
    var cuartos = $$(".room-item");
    var vacio = $("#roomsEmpty");
    var grid = $("#gridHabitaciones");
    if (!botones.length || !cuartos.length) return;

    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.dataset.filter;
        botones.forEach(function (b) {
          var activo = b === btn;
          b.setAttribute("aria-pressed", String(activo));
          b.classList.toggle("bg-sand-100", !activo);
          b.classList.toggle("text-slate-700", !activo);
        });

        var visibles = 0;
        cuartos.forEach(function (room) {
          var mostrar = cat === "todas" || room.dataset.category === cat;
          room.hidden = !mostrar;
          if (mostrar) visibles++;
        });

        if (vacio) vacio.hidden = visibles > 0;
        if (grid) grid.scrollLeft = 0;
      });
    });
  })();
  /* ------------------------------------------------------------------
     5b. CARRUSEL DE HABITACIONES, EN BUCLE

     Dos problemas que resuelve:

     1. El contenedor lleva `no-scrollbar`, asi que en escritorio no habia
        barra ni forma evidente de avanzar: con raton solo quedaba
        shift+rueda. De ahi las flechas.
     2. Al llegar al final habia que volver de un salto al principio, que se
        ve mal. Aqui se duplica el juego de tarjetas: cuando el recorrido
        pasa del primer juego, se descuenta su ancho de golpe y sin
        animacion. Como lo que se ve es identico, el ojo no percibe el corte
        y el carrusel parece infinito.

     Las copias son decorativas: van con aria-hidden y fuera del tabulador,
     para que un lector de pantalla no lea el catalogo dos veces.
     ------------------------------------------------------------------ */
  (function carruselHabitaciones() {
    var grid = $("#gridHabitaciones");
    var controles = $("#habControles");
    var anterior = $("#habAnterior");
    var siguiente = $("#habSiguiente");
    if (!grid || !controles || !anterior || !siguiente) return;

    var originales = $$(".room-item", grid);
    if (originales.length < 2) return;

    var clones = [];
    var anchoJuego = 0;
    var enBucle = false;
    var temporizador = null;
    var PAUSA = 4500;

    /** Un salto = lo que se ve, para no dejar tarjetas cortadas. */
    function salto() {
      var visible = grid.querySelector(".room-item:not([hidden])");
      if (!visible) return grid.clientWidth;
      var ancho = visible.getBoundingClientRect().width;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      var caben = Math.max(1, Math.round(grid.clientWidth / (ancho + hueco)));
      return caben * (ancho + hueco);
    }

    /** Ancho del juego original, para saber donde reenganchar. */
    function medirJuego() {
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (!visibles.length) return 0;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      return visibles.reduce(function (suma, t) {
        return suma + t.getBoundingClientRect().width + hueco;
      }, 0);
    }

    function crearClones() {
      if (clones.length) return;
      originales.forEach(function (t) {
        var copia = t.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        copia.dataset.clon = "1";
        // Nada dentro de una copia debe ser alcanzable con el tabulador
        $$("a, button, input", copia).forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
        grid.appendChild(copia);
        clones.push(copia);
      });
    }

    function quitarClones() {
      clones.forEach(function (c) { c.remove(); });
      clones = [];
    }

    /** Las copias siguen al original al filtrar. */
    function sincronizarClones() {
      clones.forEach(function (c, i) {
        c.hidden = originales[i].hidden;
      });
    }

    /* --- bucle ------------------------------------------------------- */

    /** Mueve el recorrido sin animacion; el contenido es identico y no se nota. */
    function saltar(delta) {
      grid.style.scrollBehavior = "auto";
      grid.scrollLeft += delta;
      // Se fuerza el recalculo antes de devolver el desplazamiento suave, o el
      // navegador funde las dos operaciones en una sola animacion visible.
      void grid.offsetWidth;
      grid.style.scrollBehavior = "";
    }

    /**
     * Reengancha ANTES de desplazar, nunca durante.
     *
     * Hacerlo desde el evento `scroll` parecia lo natural, pero saltaba a mitad
     * del desplazamiento suave: el navegador seguia animando hacia la posicion
     * vieja y el carrusel daba tumbones. Colocandose antes, la animacion nunca
     * cruza la costura.
     */
    function normalizar(haciaAtras) {
      if (!enBucle || !anchoJuego) return;
      // Solo se descuenta cuando ya se ha pasado el juego original. Entrar en
      // las copias es lo normal y no se nota: son identicas. Adelantarse a la
      // costura restaba el juego entero desde una posicion menor, el recorrido
      // se iba a negativo, el navegador lo recortaba a cero y el carrusel
      // volvia al principio de golpe.
      if (grid.scrollLeft >= anchoJuego) saltar(-anchoJuego);
      else if (haciaAtras && grid.scrollLeft <= 0) saltar(anchoJuego);
    }

    /** Posicion de una tarjeta dentro del contenido desplazable. */
    function posicionDe(tarjeta) {
      return (
        tarjeta.getBoundingClientRect().left -
        grid.getBoundingClientRect().left +
        grid.scrollLeft
      );
    }

    /**
     * Desplaza hasta el borde de una tarjeta, no una cantidad de pixeles.
     *
     * El contenedor lleva `scroll-snap-type: x mandatory`, y con el un
     * `scrollBy` a media tarjeta no llega a ninguna parte: el motor de anclaje
     * cancela la animacion y devuelve el carrusel a donde estaba. Cuadrando el
     * destino con un borde de tarjeta —que con `snap-start` es exactamente un
     * punto de anclaje— el anclaje coopera en vez de estorbar.
     */
    function irHacia(direccion) {
      var tarjetas = $$(".room-item:not([hidden])", grid);
      if (!tarjetas.length) return;

      var actual = grid.scrollLeft;
      var margen = 8;
      var destino = null;

      if (direccion > 0) {
        for (var i = 0; i < tarjetas.length; i++) {
          var p = posicionDe(tarjetas[i]);
          // La primera que empiece mas adelante de lo que ya se ve
          if (p > actual + grid.clientWidth - margen) { destino = p; break; }
        }
      } else {
        for (var j = tarjetas.length - 1; j >= 0; j--) {
          var q = posicionDe(tarjetas[j]);
          if (q < actual - margen) {
            // Retrocede una pantalla completa, sin dejar tarjetas cortadas
            destino = Math.max(0, q - grid.clientWidth + tarjetas[j].getBoundingClientRect().width);
            break;
          }
        }
      }

      if (destino === null) return;
      grid.scrollTo({ left: destino, behavior: "smooth" });
    }

    function avanzar() {
      normalizar(false);
      irHacia(1);
    }

    /** Para el deslizamiento con el dedo, que no pasa por los botones. */
    var esperaReenganche = null;
    function reengancharTrasDeslizar() {
      clearTimeout(esperaReenganche);
      esperaReenganche = setTimeout(function () {
        if (!enBucle || !anchoJuego) return;
        if (grid.scrollLeft >= anchoJuego) saltar(-anchoJuego);
        else if (grid.scrollLeft <= 0) saltar(anchoJuego);
      }, 160);
    }

    function arrancar() {
      if (temporizador || !enBucle || reduceMotion) return;
      temporizador = setInterval(avanzar, PAUSA);
    }
    function parar() {
      if (!temporizador) return;
      clearInterval(temporizador);
      temporizador = null;
    }

    /* --- estado ------------------------------------------------------ */

    function refrescar() {
      var visibles = originales.filter(function (t) { return !t.hidden; }).length;
      // Solo tiene sentido el bucle si sobran tarjetas para desbordar
      var deberia = visibles > 1 && grid.scrollWidth > grid.clientWidth + 2;

      if (deberia && !enBucle) {
        crearClones();
        enBucle = true;
      } else if (!deberia && enBucle) {
        quitarClones();
        enBucle = false;
        parar();
      }
      if (enBucle) sincronizarClones();

      anchoJuego = medirJuego();
      controles.hidden = !(grid.scrollWidth > grid.clientWidth + 2);

      // En bucle nunca hay extremos, asi que las flechas no se desactivan
      anterior.disabled = false;
      siguiente.disabled = false;

      if (enBucle) arrancar(); else parar();
    }

    anterior.addEventListener("click", function () {
      normalizar(true);
      irHacia(-1);
    });
    siguiente.addEventListener("click", avanzar);

    // Mientras se mira o se navega con teclado, el carrusel no se mueve solo
    ["mouseenter", "focusin", "touchstart"].forEach(function (ev) {
      grid.addEventListener(ev, parar, { passive: true });
      controles.addEventListener(ev, parar, { passive: true });
    });
    ["mouseleave", "focusout"].forEach(function (ev) {
      grid.addEventListener(ev, arrancar);
      controles.addEventListener(ev, arrancar);
    });
    // En una pestana oculta no tiene sentido seguir desplazando
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) parar(); else arrancar();
    });

    grid.addEventListener("scroll", reengancharTrasDeslizar, { passive: true });
    window.addEventListener("resize", refrescar);
    $$(".room-filter-btn").forEach(function (b) {
      b.addEventListener("click", function () { setTimeout(refrescar, 60); });
    });

    refrescar();
  })();
