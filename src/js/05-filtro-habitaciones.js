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

     Misma tecnica que el carrusel de fotos de visitantes: la pista se mueve
     con `transform` y el catalogo esta duplicado. No se toca el
     desplazamiento del contenedor, asi que no hay barra que recolocar, ni
     extremo al que llegar, ni animacion del navegador con la que pelear.
     Todos los parpadeos anteriores salian de eso.

     Se mueve a pasos: quieto un rato, avanza una habitacion, quieto otra vez.
     Cuando el indice llega al final del juego original se vuelve a cero SIN
     transicion; como en esa posicion se ve exactamente lo mismo (ahi empiezan
     las copias), el salto no existe para el ojo. Y ocurre durante la pausa,
     con todo quieto.

     Orden real: 1 2 3 4 5 1 2 3 4 5... sin fin y sin vuelta atras.
     ------------------------------------------------------------------ */
  (function carruselHabitaciones() {
    var pista = $(".pista-habitaciones");
    var track = $("#gridHabitaciones");
    var controles = $("#habControles");
    var anterior = $("#habAnterior");
    var siguiente = $("#habSiguiente");
    if (!pista || !track) return;

    var originales = $$(".room-item", track);
    if (originales.length < 2) return;

    var clones = [];
    var indice = 0;
    var desplazamiento = 0; // px, siempre <= 0
    var reloj = null;
    var arrastrando = false;

    /** Cuanto se queda quieta antes de pasar a la siguiente. */
    var PAUSA = 2200;

    /* ---------------------------------------------------------------- copias */

    function anadirJuego() {
      originales.forEach(function (t) {
        var copia = t.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        copia.dataset.clon = "1";
        $$("img", copia).forEach(function (img) {
          img.setAttribute("loading", "eager");
          img.draggable = false;
        });
        $$("a, button, input", copia).forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
        track.appendChild(copia);
        clones.push(copia);
      });
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

    function visibles() {
      return originales.filter(function (t) { return !t.hidden; });
    }

    /** Ancho de una tarjeta mas su hueco: lo que avanza un paso. */
    function zancada() {
      var t = track.querySelector(".room-item:not([hidden])");
      if (!t) return 0;
      var hueco = parseFloat(getComputedStyle(track).columnGap) || 20;
      return t.getBoundingClientRect().width + hueco;
    }

    /**
     * Duplica hasta que, estando en el ultimo original, la ventana siga llena
     * de tarjetas. Se anade y se vuelve a medir en vez de calcularlo de una
     * vez: si la primera medida sale mal —al arrancar la pagina las tarjetas
     * pueden no tener ancho— la siguiente lo corrige.
     */
    function asegurarPista() {
      var n = visibles().length;
      if (n < 2) return false;
      var paso = zancada();
      if (paso <= 0) return false;

      var intentos = 0;
      while (track.scrollWidth < n * paso + pista.clientWidth + 4 && intentos < 12) {
        anadirJuego();
        sincronizarClones();
        intentos++;
      }
      return clones.length > 0;
    }

    /* ------------------------------------------------------------ movimiento */

    function aplicar(px, instantaneo) {
      if (instantaneo) track.classList.add("sin-transicion");
      track.style.transform = "translate3d(" + px + "px,0,0)";
      if (instantaneo) {
        void track.offsetWidth; // fuerza el pintado antes de devolver la transicion
        track.classList.remove("sin-transicion");
      }
    }

    /**
     * Vuelve al principio sin que se note.
     *
     * En el indice `n` se esta viendo el primer juego de copias, que es
     * identico al original: poner el indice a cero y el desplazamiento a cero
     * muestra exactamente lo mismo. Por eso se puede hacer de golpe.
     */
    function reenganchar() {
      var n = visibles().length;
      if (!n) return;
      if (indice >= n) {
        indice -= n;
        desplazamiento = -indice * zancada();
        aplicar(desplazamiento, true);
      } else if (indice < 0) {
        indice += n;
        desplazamiento = -indice * zancada();
        aplicar(desplazamiento, true);
      }
    }

    function paso(direccion) {
      reenganchar(); // con todo quieto, antes de mover
      indice += direccion;
      desplazamiento = -indice * zancada();
      aplicar(desplazamiento, false);
    }

    function arrancar() {
      if (reloj || reduceMotion || visibles().length < 2) return;
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
    var inicioDesp = 0;
    var movido = 0;

    pista.addEventListener("pointerdown", function (ev) {
      if (ev.button !== undefined && ev.button !== 0) return;
      arrastrando = true;
      movido = 0;
      inicioX = ev.clientX;
      inicioDesp = desplazamiento;
      pista.classList.add("arrastrando");
      track.classList.add("sin-transicion");
      detener();
    });

    window.addEventListener("pointermove", function (ev) {
      if (!arrastrando) return;
      var delta = ev.clientX - inicioX;
      movido = Math.abs(delta);
      desplazamiento = inicioDesp + delta;

      // Dar la vuelta tambien mientras se arrastra, para que no haya tope
      var n = visibles().length;
      var paso = zancada();
      var largo = n * paso;
      if (largo > 0) {
        while (desplazamiento <= -largo) { desplazamiento += largo; inicioDesp += largo; }
        while (desplazamiento > 0) { desplazamiento -= largo; inicioDesp -= largo; }
      }
      track.style.transform = "translate3d(" + desplazamiento + "px,0,0)";
    }, { passive: true });

    function soltar() {
      if (!arrastrando) return;
      arrastrando = false;
      pista.classList.remove("arrastrando");
      track.classList.remove("sin-transicion");

      // Cuadrar con la tarjeta mas cercana
      var paso = zancada();
      if (paso > 0) {
        indice = Math.round(-desplazamiento / paso);
        desplazamiento = -indice * paso;
        aplicar(desplazamiento, false);
      }
      arrancar();
    }
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);

    // Si se ha arrastrado, al soltar no debe abrirse el enlace de la tarjeta
    pista.addEventListener("click", function (ev) {
      if (movido > 8) { ev.preventDefault(); ev.stopPropagation(); movido = 0; }
    }, true);

    $$("img", track).forEach(function (img) { img.draggable = false; });

    /* ----------------------------------------------------------------- estado */

    function refrescar() {
      var n = visibles().length;

      if (n > 1) {
        if (clones.length) sincronizarClones();
        asegurarPista();
      } else if (clones.length) {
        quitarClones();
        detener();
      }

      // Con poco que enseniar, centrado: si no queda un palmo de blanco
      pista.classList.toggle("flex", n <= 1);
      pista.classList.toggle("justify-center", n <= 1);

      // El indice puede haberse quedado fuera de rango al filtrar
      if (n > 0 && indice >= n) indice = 0;
      desplazamiento = -indice * zancada();
      aplicar(desplazamiento, true);

      if (controles) controles.hidden = n <= 1;
      if (anterior) anterior.disabled = false;
      if (siguiente) siguiente.disabled = false;

      if (n > 1) arrancar(); else detener();
    }

    if (anterior) anterior.addEventListener("click", function () { detener(); paso(-1); arrancar(); });
    if (siguiente) siguiente.addEventListener("click", function () { detener(); paso(1); arrancar(); });

    ["mouseenter", "focusin"].forEach(function (ev) {
      pista.addEventListener(ev, detener, { passive: true });
      if (controles) controles.addEventListener(ev, detener, { passive: true });
    });
    ["mouseleave", "focusout"].forEach(function (ev) {
      pista.addEventListener(ev, arrancar, { passive: true });
      if (controles) controles.addEventListener(ev, arrancar, { passive: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) detener(); else arrancar();
    });

    window.addEventListener("resize", refrescar);
    $$(".room-filter-btn").forEach(function (b) {
      b.addEventListener("click", function () { setTimeout(refrescar, 60); });
    });

    refrescar();
    window.addEventListener("load", refrescar);
    setTimeout(refrescar, 1200);
    setTimeout(refrescar, 3000);
  })();
