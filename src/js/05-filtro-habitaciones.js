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
     5b. CARRUSEL DE HABITACIONES

     Se mueve a pasos: quieto un rato, desliza una tarjeta, quieto otra vez.
     Nunca llega al final —siempre hay otra habitacion detras— y se puede
     arrastrar con el raton.

     El parpadeo de las versiones anteriores venia de recolocar el carril en
     mitad de una animacion. Aqui el reenganche se hace SIEMPRE con el
     carrusel parado, en la pausa entre dos pasos: nada se esta moviendo, el
     contenido que entra es identico al que sale y el corte no existe.

     El catalogo se duplica las veces necesarias para que detras de la costura
     siempre queden tarjetas; asi no puede aparecer un hueco en blanco.
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
    var reloj = null;
    var arrastrando = false;

    /** Cuanto se queda quieta antes de pasar a la siguiente. */
    var PAUSA = 3000;

    /* ---------------------------------------------------------------- copias */

    function crearClones() {
      if (clones.length) return;
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (!visibles.length) return;

      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      var unJuego = visibles.reduce(function (suma, t) {
        return suma + t.getBoundingClientRect().width + hueco;
      }, 0);
      if (unJuego <= 0) return;

      // Suficientes para que tras la costura siga habiendo catalogo
      var copias = Math.max(1, Math.ceil((grid.clientWidth + unJuego) / unJuego));

      for (var c = 0; c < copias; c++) {
        originales.forEach(function (t) {
          var copia = t.cloneNode(true);
          copia.setAttribute("aria-hidden", "true");
          copia.dataset.clon = "1";
          // Sin carga diferida: si la imagen llegase tarde, la copia se veria
          // en blanco justo al dar la vuelta.
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

    function medirJuego() {
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (!visibles.length) return 0;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      return visibles.reduce(function (suma, t) {
        return suma + t.getBoundingClientRect().width + hueco;
      }, 0);
    }

    /* -------------------------------------------------------------- costura */

    /**
     * Devuelve el carril al primer juego.
     *
     * Se llama solo con el carrusel parado. Si se hiciera durante un
     * desplazamiento suave, el navegador seguiria animando hacia la posicion
     * vieja y se veria el tiron: eso era el parpadeo.
     */
    function reenganchar() {
      if (!enBucle || !anchoJuego) return;
      var antes = grid.style.scrollBehavior;
      grid.style.scrollBehavior = "auto";
      if (grid.scrollLeft >= anchoJuego) grid.scrollLeft -= anchoJuego;
      else if (grid.scrollLeft < 0) grid.scrollLeft += anchoJuego;
      grid.style.scrollBehavior = antes;
    }

    /* ---------------------------------------------------------------- pasos */

    function posicionDe(t) {
      return (
        t.getBoundingClientRect().left -
        grid.getBoundingClientRect().left +
        grid.scrollLeft
      );
    }

    /** Un paso = una tarjeta, alineando su borde con el del contenedor. */
    function paso(direccion) {
      reenganchar(); // parado: es el momento seguro

      var tarjetas = $$(".room-item:not([hidden])", grid);
      if (!tarjetas.length) return;

      var actual = grid.scrollLeft;
      var margen = 4;
      var destino = null;

      if (direccion > 0) {
        for (var i = 0; i < tarjetas.length; i++) {
          var p = posicionDe(tarjetas[i]);
          if (p > actual + margen) { destino = p; break; }
        }
      } else {
        for (var j = tarjetas.length - 1; j >= 0; j--) {
          var q = posicionDe(tarjetas[j]);
          if (q < actual - margen) { destino = q; break; }
        }
      }

      if (destino === null) return;
      grid.scrollTo({ left: destino, behavior: "smooth" });
    }

    /* -------------------------------------------------------------- automatico */

    function arrancar() {
      if (reloj || !enBucle || reduceMotion) return;
      reloj = setInterval(function () {
        if (!arrastrando) paso(1);
      }, PAUSA);
    }
    function detener() {
      if (!reloj) return;
      clearInterval(reloj);
      reloj = null;
    }

    /* --------------------------------------------------------------- arrastre */

    var inicioX = 0;
    var inicioScroll = 0;
    var movido = 0;

    function empezarArrastre(ev) {
      // Solo boton principal; los enlaces siguen funcionando
      if (ev.button !== undefined && ev.button !== 0) return;
      arrastrando = true;
      movido = 0;
      inicioX = ev.clientX;
      inicioScroll = grid.scrollLeft;
      grid.style.scrollBehavior = "auto";
      grid.classList.add("cursor-grabbing");
      detener();
    }

    function moverArrastre(ev) {
      if (!arrastrando) return;
      var delta = ev.clientX - inicioX;
      movido = Math.abs(delta);
      grid.scrollLeft = inicioScroll - delta;
      // Al arrastrar tambien hay que dar la vuelta, o se topa con el final
      if (anchoJuego) {
        if (grid.scrollLeft >= anchoJuego) {
          grid.scrollLeft -= anchoJuego;
          inicioScroll -= anchoJuego;
        } else if (grid.scrollLeft <= 0) {
          grid.scrollLeft += anchoJuego;
          inicioScroll += anchoJuego;
        }
      }
    }

    function soltarArrastre() {
      if (!arrastrando) return;
      arrastrando = false;
      grid.style.scrollBehavior = "";
      grid.classList.remove("cursor-grabbing");
      arrancar();
    }

    grid.addEventListener("pointerdown", empezarArrastre);
    window.addEventListener("pointermove", moverArrastre, { passive: true });
    window.addEventListener("pointerup", soltarArrastre);
    window.addEventListener("pointercancel", soltarArrastre);

    // Un arrastre no debe acabar abriendo el enlace de la tarjeta
    grid.addEventListener("click", function (ev) {
      if (movido > 8) { ev.preventDefault(); ev.stopPropagation(); movido = 0; }
    }, true);

    // Arrastrar una imagen es lo que hace el navegador por defecto; estorba
    $$("img", grid).forEach(function (img) { img.draggable = false; });

    /* ----------------------------------------------------------------- estado */

    function refrescar() {
      var visibles = originales.filter(function (t) { return !t.hidden; }).length;
      var deberia = visibles > 1;

      if (deberia && !enBucle) { crearClones(); enBucle = true; }
      else if (!deberia && enBucle) { quitarClones(); enBucle = false; detener(); }
      if (enBucle) sincronizarClones();

      anchoJuego = medirJuego();

      // Con poco que enseniar, centrado: si no, quedaria un palmo de blanco a
      // la derecha que parece contenido que falta.
      grid.classList.toggle("justify-center", grid.scrollWidth <= grid.clientWidth + 2);
      grid.classList.toggle("cursor-grab", deberia);

      if (controles) controles.hidden = !deberia;
      if (anterior) anterior.disabled = false;
      if (siguiente) siguiente.disabled = false;

      if (enBucle) arrancar(); else detener();
    }

    if (anterior) anterior.addEventListener("click", function () { detener(); paso(-1); arrancar(); });
    if (siguiente) siguiente.addEventListener("click", function () { detener(); paso(1); arrancar(); });

    // Mientras se mira o se navega con teclado, no avanza solo
    ["mouseenter", "focusin"].forEach(function (ev) {
      grid.addEventListener(ev, detener, { passive: true });
      if (controles) controles.addEventListener(ev, detener, { passive: true });
    });
    ["mouseleave", "focusout"].forEach(function (ev) {
      grid.addEventListener(ev, arrancar, { passive: true });
      if (controles) controles.addEventListener(ev, arrancar, { passive: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) detener(); else arrancar();
    });

    // Deslizar con el dedo tambien tiene que dar la vuelta; se espera a que
    // pare para no recolocar en marcha.
    var esperaDedo = null;
    grid.addEventListener("scroll", function () {
      if (arrastrando) return;
      clearTimeout(esperaDedo);
      esperaDedo = setTimeout(reenganchar, 180);
    }, { passive: true });

    window.addEventListener("resize", refrescar);
    $$(".room-filter-btn").forEach(function (b) {
      b.addEventListener("click", function () { setTimeout(refrescar, 60); });
    });

    refrescar();
  })();
