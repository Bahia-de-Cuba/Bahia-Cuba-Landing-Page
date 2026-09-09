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
     5b. CARRUSEL DE HABITACIONES, DESLIZAMIENTO CONTINUO

     Antes avanzaba a saltos de dos tarjetas y al llegar al final tenia que
     reenganchar, lo que se veia como un parpadeo. Dos causas:

     - El contenedor llevaba `scroll-snap-type: mandatory`. Cada vez que se
       movia el desplazamiento a mano, el motor de anclaje recolocaba, y ese
       reajuste se ve.
     - El reenganche ocurria en medio de una animacion suave del navegador.

     Ahora no hay saltos ni anclaje: el desplazamiento avanza unos pocos
     pixeles por fotograma, de forma continua. El juego de tarjetas esta
     duplicado, asi que al pasar del original se descuenta su ancho; como lo
     que se ve es identico y el movimiento no se interrumpe, el corte es
     invisible.

     Las copias van con aria-hidden y fuera del tabulador: un lector de
     pantalla no debe leer el catalogo dos veces.
     ------------------------------------------------------------------ */
  (function carruselHabitaciones() {
    var grid = $("#gridHabitaciones");
    var controles = $("#habControles");
    var anterior = $("#habAnterior");
    var siguiente = $("#habSiguiente");
    if (!grid) return;

    var originales = $$(".room-item", grid);
    if (originales.length < 2) return;

    var clones = [];
    var anchoJuego = 0;
    var enBucle = false;
    var animacion = null;
    var enPausa = false;
    var ultimoInstante = 0;

    /* La posicion se lleva aparte, en decimales.
       `scrollLeft` redondea a enteros: a 34 px/s tocan 0,57 px por fotograma,
       que al redondear se pierden y el carrusel se queda clavado. Acumulando
       en una variable propia y escribiendo el total, el avance es real. */
    var posicion = 0;

    /** Pixeles por segundo. Lento: es un catalogo, no un ticker. */
    var VELOCIDAD = 34;

    /**
     * Duplica el catalogo tantas veces como haga falta.
     *
     * Con una sola copia basta mientras el juego de tarjetas sea mas ancho que
     * la ventana, pero eso deja de cumplirse al filtrar por un tipo o en
     * pantallas muy anchas: el carril se acaba antes de llegar a la costura, el
     * navegador recorta el desplazamiento y aparece el hueco en blanco a la
     * derecha. Duplicando hasta cubrir costura + ventana, ese hueco no puede
     * existir por construccion.
     */
    function crearClones() {
      if (clones.length) return;
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (!visibles.length) return;

      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      var anchoDeUnJuego = visibles.reduce(function (suma, t) {
        return suma + t.getBoundingClientRect().width + hueco;
      }, 0);
      if (anchoDeUnJuego <= 0) return;

      // Cuantos juegos extra para que tras la costura siga habiendo tarjetas
      var copiasNecesarias = Math.max(
        1,
        Math.ceil((grid.clientWidth + anchoDeUnJuego) / anchoDeUnJuego)
      );

      for (var c = 0; c < copiasNecesarias; c++) {
        originales.forEach(function (t) {
          var copia = t.cloneNode(true);
          copia.setAttribute("aria-hidden", "true");
          copia.dataset.clon = "1";
          // Las copias no esperan: si su imagen llegase tarde se verian en
          // blanco justo al dar la vuelta, que es el hueco que hay que evitar.
          $$("img", copia).forEach(function (img) {
            img.setAttribute("loading", "eager");
          });
          $$("a, button, input", copia).forEach(function (el) {
            el.setAttribute("tabindex", "-1");
          });
          grid.appendChild(copia);
          clones.push(copia);
        });
      }
    }

    function quitarClones() {
      clones.forEach(function (c) { c.remove(); });
      clones = [];
    }

    function sincronizarClones() {
      clones.forEach(function (c, i) {
        c.hidden = originales[i % originales.length].hidden;
      });
    }

    /** Ancho del juego original: donde esta la costura. */
    function medirJuego() {
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (!visibles.length) return 0;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      return visibles.reduce(function (suma, t) {
        return suma + t.getBoundingClientRect().width + hueco;
      }, 0);
    }

    /** Devuelve el recorrido al primer juego cuando se pasa de la costura. */
    function ajustarCostura() {
      if (!anchoJuego) return;
      if (posicion >= anchoJuego) posicion -= anchoJuego;
      else if (posicion < 0) posicion += anchoJuego;
    }

    function paso(instante) {
      if (!enBucle) { animacion = null; return; }
      if (!ultimoInstante) ultimoInstante = instante;
      var delta = (instante - ultimoInstante) / 1000;
      ultimoInstante = instante;

      if (!enPausa) {
        // Un tope por si la pestana estuvo detenida y el salto es enorme
        posicion += VELOCIDAD * Math.min(delta, 0.05);
        ajustarCostura();
        grid.scrollLeft = posicion;
        // Si el navegador recorto —el carril se quedo corto—, se vuelve al
        // principio en vez de quedarse mirando el final vacio.
        if (Math.abs(grid.scrollLeft - posicion) > 2) {
          posicion = grid.scrollLeft;
          if (posicion >= anchoJuego) { posicion -= anchoJuego; grid.scrollLeft = posicion; }
        }
      }
      animacion = requestAnimationFrame(paso);
    }

    function arrancar() {
      if (animacion || !enBucle || reduceMotion) return;
      ultimoInstante = 0;
      animacion = requestAnimationFrame(paso);
    }
    function detener() {
      if (!animacion) return;
      cancelAnimationFrame(animacion);
      animacion = null;
    }

    /** Las flechas mueven una tarjeta; el deslizamiento sigue despues. */
    function empujar(direccion) {
      var visible = grid.querySelector(".room-item:not([hidden])");
      if (!visible) return;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      var avance = visible.getBoundingClientRect().width + hueco;
      posicion = grid.scrollLeft + direccion * avance;
      ajustarCostura();
      grid.scrollLeft = posicion;
    }

    function refrescar() {
      var visibles = originales.filter(function (t) { return !t.hidden; }).length;
      var deberia = visibles > 1;

      if (deberia && !enBucle) { crearClones(); enBucle = true; }
      else if (!deberia && enBucle) { quitarClones(); enBucle = false; detener(); }
      if (enBucle) sincronizarClones();

      anchoJuego = medirJuego();
      posicion = grid.scrollLeft;

      /* Cuando lo visible no llega a llenar el ancho —al filtrar por un tipo
         del que solo hay una habitacion— las tarjetas se quedaban pegadas a la
         izquierda y sobraba un palmo de blanco a la derecha, que se ve como si
         faltara contenido. Centrarlas lo convierte en margen a los dos lados,
         que es lo que se espera de una fila corta. */
      var llena = grid.scrollWidth > grid.clientWidth + 2;
      grid.classList.toggle("justify-center", !llena);

      if (controles) controles.hidden = !deberia;
      if (anterior) anterior.disabled = false;
      if (siguiente) siguiente.disabled = false;

      if (enBucle) arrancar(); else detener();
    }

    if (anterior) anterior.addEventListener("click", function () { empujar(-1); });
    if (siguiente) siguiente.addEventListener("click", function () { empujar(1); });

    // Mientras se mira, se lee o se navega con teclado, el catalogo se queda
    // quieto. No se cancela la animacion: solo deja de avanzar, para que al
    // soltar retome sin tiron.
    function pausar() { enPausa = true; }
    function reanudar() { enPausa = false; }
    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach(function (ev) {
      grid.addEventListener(ev, pausar, { passive: true });
      if (controles) controles.addEventListener(ev, pausar, { passive: true });
    });
    ["mouseleave", "focusout", "touchend", "pointerup"].forEach(function (ev) {
      grid.addEventListener(ev, reanudar, { passive: true });
      if (controles) controles.addEventListener(ev, reanudar, { passive: true });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) detener(); else arrancar();
    });

    // Si el visitante desliza con el dedo o la rueda, manda el: se toma su
    // posicion como buena para que al reanudar no haya tiron.
    grid.addEventListener("scroll", function () {
      if (!enPausa) return;
      posicion = grid.scrollLeft;
      ajustarCostura();
      if (posicion !== grid.scrollLeft) grid.scrollLeft = posicion;
    }, { passive: true });

    window.addEventListener("resize", refrescar);
    $$(".room-filter-btn").forEach(function (b) {
      b.addEventListener("click", function () { setTimeout(refrescar, 60); });
    });

    refrescar();
  })();
