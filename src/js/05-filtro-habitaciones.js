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

     El contenedor lleva `no-scrollbar`, asi que en escritorio no hay barra
     de desplazamiento ni forma evidente de avanzar: con raton solo queda
     shift+rueda. Estas flechas resuelven eso.

     En movil no hacen falta —se desliza con el dedo— pero tampoco estorban,
     y se ocultan solas cuando todas las tarjetas caben en pantalla, por
     ejemplo al filtrar por un solo tipo.
     ------------------------------------------------------------------ */
  (function carruselHabitaciones() {
    var grid = $("#gridHabitaciones");
    var controles = $("#habControles");
    var anterior = $("#habAnterior");
    var siguiente = $("#habSiguiente");
    if (!grid || !controles || !anterior || !siguiente) return;

    /** Un salto = lo que se ve, para que no queden tarjetas a medias. */
    function salto() {
      var tarjeta = grid.querySelector(".room-item:not([hidden])");
      if (!tarjeta) return grid.clientWidth;
      var ancho = tarjeta.getBoundingClientRect().width;
      var hueco = parseFloat(getComputedStyle(grid).columnGap) || 20;
      var caben = Math.max(1, Math.round(grid.clientWidth / (ancho + hueco)));
      return caben * (ancho + hueco);
    }

    function refrescar() {
      // 2px de margen: los navegadores redondean scrollLeft y sin holgura el
      // boton se queda desactivado al llegar al final.
      var desborda = grid.scrollWidth > grid.clientWidth + 2;
      controles.hidden = !desborda;
      if (!desborda) return;
      anterior.disabled = grid.scrollLeft <= 2;
      siguiente.disabled =
        grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 2;
    }

    anterior.addEventListener("click", function () {
      grid.scrollBy({ left: -salto(), behavior: "smooth" });
    });
    siguiente.addEventListener("click", function () {
      grid.scrollBy({ left: salto(), behavior: "smooth" });
    });

    grid.addEventListener("scroll", refrescar, { passive: true });
    window.addEventListener("resize", refrescar);
    // Tras filtrar cambia cuantas tarjetas hay, y puede dejar de desbordar
    $$(".room-filter-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(refrescar, 50);
      });
    });

    refrescar();
  })();
