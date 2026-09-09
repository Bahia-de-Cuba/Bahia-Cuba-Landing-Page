/* ==========================================================================
   Hotel Bahía de Cuba — comportamiento de la landing
   Sin dependencias. Todo se degrada con elegancia si algo no está disponible.

   Archivo generado por tools/build-js.mjs a partir de src/js/ — no editar.
   ========================================================================== */
(function () {
  "use strict";

  /** Número de WhatsApp del hotel (formato internacional, sin signos). */
  var WHATSAPP = "51941677501";

  /** Sistema de reservas. Es el único sitio donde se reserva de verdad. */
  var URL_RESERVAS = "https://bahia-cuba-app.netlify.app/es/reservar";

  /* Lectura de tarifas desde la base del hotel.
     La clave es la pública (anon): viaja al navegador por diseño y la tabla
     `habitaciones` solo permite leer. Con esto las tarifas se cambian desde el
     panel y esta web las refleja sin volver a publicarla. */
  var SUPABASE_URL = "https://xahrwafxzymxnuphpacl.supabase.co";
  var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaHJ3YWZ4enlteG51cGhwYWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTAzMDIsImV4cCI6MjEwNDE4NjMwMn0.zB3BD7vMEcX0SDzk_uP9FXHBSpchmPDGSyrfd-AGKOc";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. INTRO CINEMATOGRÁFICA
     Se muestra una sola vez por sesión, es saltable y nunca bloquea
     la página más de ~2.6 s.
     ------------------------------------------------------------------ */
  (function intro() {
    var cinema = $("#welcomeCinema");
    if (!cinema) return;

    var yaVista = false;
    try { yaVista = sessionStorage.getItem("bdc-intro") === "1"; } catch (e) {}

    if (yaVista || reduceMotion) {
      cinema.remove();
      return;
    }

    document.body.style.overflow = "hidden";
    var waves = startWaves($("#cinemaWaves"));
    var cerrado = false;

    function cerrar() {
      if (cerrado) return;
      cerrado = true;
      try { sessionStorage.setItem("bdc-intro", "1"); } catch (e) {}
      cinema.classList.add("is-leaving");
      window.setTimeout(function () {
        cinema.remove();
        if (waves) waves.stop();
        document.body.style.overflow = "";
      }, 800);
    }

    $("#btnEnterCinema").addEventListener("click", cerrar);
    cinema.addEventListener("click", cerrar);
    document.addEventListener("keydown", function onKey(ev) {
      if (ev.key === "Escape") { cerrar(); document.removeEventListener("keydown", onKey); }
    });
    window.setTimeout(cerrar, 2600);
  })();

  /** Olas del intro: una simulación ligera en canvas. */
  function startWaves(canvas) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var step = 0;
    var raf = 0;
    var vivo = true;

    var capas = [
      { color: "rgba(255,42,42,0.25)", speed: 1.0, freq: 0.008, amp: 22, y: 40 },
      { color: "rgba(243,179,64,0.35)", speed: 1.5, freq: 0.012, amp: 18, y: 60 },
      { color: "rgba(12,23,34,0.85)", speed: 0.8, freq: 0.006, amp: 26, y: 90 },
      { color: "#070e16", speed: 1.2, freq: 0.009, amp: 30, y: 120 }
    ];

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * 0.45 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!vivo) return;
      var w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      step += 0.02;
      capas.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 12) {
          ctx.lineTo(x, Math.sin(x * l.freq + step * l.speed) * l.amp + l.y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = l.color;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    return {
      stop: function () {
        vivo = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      }
    };
  }

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

    function actualizar() {
      pendiente = false;
      var y = window.scrollY || document.documentElement.scrollTop;

      if (bar && !barPorCSS) {
        var alto = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (alto > 0 ? Math.min(y / alto, 1) : 0) + ")";
      }

      if (header) header.classList.toggle("is-stuck", y > 12);

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

  /* ------------------------------------------------------------------
     3. MENÚ LATERAL MÓVIL (accesible: Esc, foco y aria-expanded)
     ------------------------------------------------------------------ */
  (function drawer() {
    var abrir = $("#btnOpenDrawer");
    var cerrarBtn = $("#btnCloseDrawer");
    var panel = $("#sideDrawer");
    var overlay = $("#drawerOverlay");
    if (!abrir || !panel || !overlay) return;

    function set(estado) {
      panel.dataset.state = estado;
      overlay.dataset.state = estado;
      abrir.setAttribute("aria-expanded", String(estado === "open"));
      document.body.style.overflow = estado === "open" ? "hidden" : "";
      if (estado === "open") cerrarBtn.focus();
      else abrir.focus();
    }

    abrir.addEventListener("click", function () { set("open"); });
    cerrarBtn.addEventListener("click", function () { set("closed"); });
    overlay.addEventListener("click", function () { set("closed"); });
    $$(".drawer-item", panel).forEach(function (a) {
      a.addEventListener("click", function () { set("closed"); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && panel.dataset.state === "open") set("closed");
    });
  })();

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
    var PAUSA = 2200;

    /* ---------------------------------------------------------------- copias */

    /** Anade un juego completo de copias al final del carril. */
    function anadirJuego() {
      originales.forEach(function (t) {
        var copia = t.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        copia.dataset.clon = "1";
        // Sin carga diferida: si la imagen llegase tarde, la copia se veria en
        // blanco justo al dar la vuelta.
        $$("img", copia).forEach(function (img) {
          img.setAttribute("loading", "eager");
          img.draggable = false;
        });
        $$("a, button, input", copia).forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
        grid.appendChild(copia);
        clones.push(copia);
      });
    }

    /**
     * Garantiza que detras de la costura siempre queden tarjetas.
     *
     * No se calcula cuantas copias hacen falta y se confia: se van anadiendo
     * juegos y se vuelve a medir hasta que el carril cubre la costura mas una
     * ventana entera. Calcularlo de una vez fallaba cuando la primera medida
     * salia mal —al arrancar la pagina las tarjetas pueden no tener ancho
     * todavia—: se daba el bucle por montado sin haber creado ni una copia, y
     * al llegar a la ultima habitacion aparecia el hueco en blanco.
     *
     * Devuelve si el carril quedo en condiciones.
     */
    function asegurarCarril() {
      var visibles = originales.filter(function (t) { return !t.hidden; });
      if (visibles.length < 2) return false;

      var unJuego = medirJuego();
      if (unJuego <= 0) return false; // aun sin medidas: se reintenta luego

      // Tope de seguridad para no crecer sin fin si algo va mal
      var intentos = 0;
      while (
        grid.scrollWidth < unJuego + grid.clientWidth + 4 &&
        intentos < 12
      ) {
        anadirJuego();
        sincronizarClones();
        unJuego = medirJuego();
        intentos++;
      }
      return clones.length > 0;
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

      if (deberia) {
        if (enBucle) sincronizarClones();
        // Se marca el bucle SOLO si de verdad hay copias. Antes se daba por
        // hecho, y si la medida fallaba quedaban las cinco originales sueltas.
        enBucle = asegurarCarril();
        if (enBucle) sincronizarClones();
      } else if (enBucle) {
        quitarClones();
        enBucle = false;
        detener();
      }

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

    // La primera medida puede salir mal si las fuentes o las fotos aun no han
    // llegado y las tarjetas no tienen su ancho definitivo. Se vuelve a mirar
    // cuando la pagina termina de cargar, y una vez mas por si acaso.
    window.addEventListener("load", refrescar);
    setTimeout(refrescar, 1200);
    setTimeout(refrescar, 3000);
  })();

  /* ------------------------------------------------------------------
     6. PRECIOS DE LAS TARJETAS
     Se leen del propio cotizador para que nunca queden desfasados:
     la tarifa se edita en un solo lugar (el <select> del formulario).
     ------------------------------------------------------------------ */
  (function preciosEnTarjetas() {
    var select = $("#cRoom");
    if (!select) return;
    $$(".room-item").forEach(function (card) {
      var span = $(".js-precio", card);
      var opt = select.querySelector('option[value="' + card.dataset.room + '"]');
      if (span && opt) span.textContent = "Desde S/ " + opt.dataset.precio;
    });
  })();

  /* ------------------------------------------------------------------
     7. COTIZADOR
     ------------------------------------------------------------------ */
  (function cotizador() {
    var form = $("#formCotizacion");
    if (!form) return;

    var inEl = $("#cCheckin");
    var outEl = $("#cCheckout");
    var roomEl = $("#cRoom");
    var guestsEl = $("#cGuests");
    var totalEl = $("#calcTotal");
    var detalleEl = $("#calcDetalle");
    var avisoEl = $("#calcAviso");

    var UN_DIA = 86400000;
    var iso = function (d) { return d.toISOString().slice(0, 10); };

    function aviso(texto) {
      if (!avisoEl) return;
      avisoEl.textContent = texto || "";
      avisoEl.hidden = !texto;
    }

    function noches() {
      if (!inEl.value || !outEl.value) return 0;
      var d = Math.round((new Date(outEl.value) - new Date(inEl.value)) / UN_DIA);
      return d > 0 ? d : 0;
    }

    function precioNoche() {
      var opt = roomEl.options[roomEl.selectedIndex];
      return parseInt((opt && opt.dataset.precio) || "0", 10);
    }

    /** Avisa (sin bloquear) si hay más huéspedes que la capacidad del cuarto. */
    var CAPACIDAD = { Individual: 1, Matrimonial: 2, Doble: 4, Familiar: 6 };

    function recalcular() {
      // El check-out siempre debe ser al menos un día después del check-in
      if (inEl.value) {
        var minOut = iso(new Date(new Date(inEl.value).getTime() + UN_DIA));
        outEl.min = minOut;
        if (outEl.value && outEl.value < minOut) outEl.value = minOut;
      }

      var n = noches();
      var precio = precioNoche();
      var total = n * precio;

      totalEl.textContent = total.toFixed(2);
      detalleEl.textContent = n
        ? n + (n === 1 ? " noche" : " noches") + " × S/ " + precio
        : "Elige tus fechas para ver el total";

      var cap = CAPACIDAD[roomEl.value];
      var huespedes = parseInt(guestsEl.value, 10);
      aviso(cap && huespedes > cap
        ? "La habitación " + roomEl.value + " admite hasta " + cap +
          (cap === 1 ? " persona" : " personas") + ". Consúltanos por camas extra."
        : "");
    }

    ["change", "input"].forEach(function (ev) {
      form.addEventListener(ev, recalcular);
    });

    /* El cotizador ya no manda a WhatsApp: lleva al sistema de reservas con lo
       elegido puesto. Aquí no se sabe qué noches están vendidas —eso vive en la
       base—, así que las fechas viajan como propuesta y el calendario de allá
       las descarta si pisan una reserva. */
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!inEl.value || !outEl.value || !noches()) {
        aviso("Elige las fechas de check-in y check-out para continuar.");
        inEl.focus();
        return;
      }
      var q =
        "?tipo=" + encodeURIComponent(roomEl.value.toLowerCase()) +
        "&checkin=" + encodeURIComponent(inEl.value) +
        "&checkout=" + encodeURIComponent(outEl.value);
      window.location.href = URL_RESERVAS + q;
    });

    // Fechas por defecto: mañana y pasado. La llegada más temprana que admite
    // el sistema de reservas es mañana, así que ofrecer hoy solo llevaría a
    // que allá rechazasen las fechas nada más llegar.
    var manana = new Date(Date.now() + UN_DIA);
    var pasado = new Date(Date.now() + 2 * UN_DIA);
    inEl.min = iso(manana);
    inEl.value = iso(manana);
    outEl.value = iso(pasado);
    recalcular();
  })();

  /* ------------------------------------------------------------------
     8. ACORDEÓN DE PREGUNTAS FRECUENTES
     ------------------------------------------------------------------ */
  (function faq() {
    var botones = $$(".faq-toggle");
    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var abierto = item.classList.contains("is-open");

        $$(".faq-item.is-open").forEach(function (el) {
          el.classList.remove("is-open");
          $(".faq-toggle", el).setAttribute("aria-expanded", "false");
        });

        if (!abierto) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();

  /* ------------------------------------------------------------------
     9. MAPA BAJO DEMANDA
     ------------------------------------------------------------------ */
  (function mapa() {
    var btn = $("#btnLoadMap");
    var shell = $("#mapShell");
    if (!btn || !shell) return;

    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      // Coordenadas exactas del hotel (Plus Code 57X3XRM5+M7) para que el
      // marcador caiga en la puerta y no en el centro de Huarmey.
      iframe.src = "https://maps.google.com/maps?q=" +
        encodeURIComponent("loc:-10.0158125,-78.1918125 (Hotel Bahía de Cuba)") +
        "&z=17&hl=es&output=embed";
      iframe.title = "Mapa: Hotel Bahía de Cuba, Playa Tuquillo, Huarmey";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      btn.remove();
      shell.appendChild(iframe);
    });
  })();

  /* ------------------------------------------------------------------
     10. CIELO ESTRELLADO DEL ROOFTOP
     ------------------------------------------------------------------ */
  (function estrellas() {
    var caja = $("#rooftopStars");
    if (!caja || reduceMotion) return;

    var frag = document.createDocumentFragment();
    for (var i = 0; i < 46; i++) {
      var s = document.createElement("span");
      var tam = (Math.random() * 2 + 1).toFixed(1);
      s.style.cssText =
        "position:absolute;border-radius:50%;background:#fff;" +
        "width:" + tam + "px;height:" + tam + "px;" +
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "top:" + (Math.random() * 100).toFixed(2) + "%;" +
        "opacity:" + (Math.random() * 0.5 + 0.2).toFixed(2) + ";" +
        "animation:twinkle " + (Math.random() * 3 + 2).toFixed(1) + "s ease-in-out " +
        (Math.random() * 3).toFixed(1) + "s infinite alternate";
      frag.appendChild(s);
    }
    caja.appendChild(frag);

    var hoja = document.createElement("style");
    hoja.textContent = "@keyframes twinkle{to{opacity:.95;transform:scale(1.35)}}";
    document.head.appendChild(hoja);
  })();

  /* ------------------------------------------------------------------
     11. EFECTO 3D EN LA TARJETA DE ENERGÍA (solo con mouse)
     ------------------------------------------------------------------ */
  (function tilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

    $$(".card-tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  })();

  /* ------------------------------------------------------------------
     12. DETALLES
     ------------------------------------------------------------------ */
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     13. TARIFAS EN VIVO

     Las tarifas se editan en el panel del hotel y esta web las lee de la
     base al cargarse. Antes estaban escritas a mano en el HTML, así que
     subir precios obligaba a tocar dos sitios y era cuestión de tiempo
     que la web mintiera.

     Los valores del HTML siguen ahí y hacen de respaldo: si la consulta
     falla —sin red, base dormida— la página no se queda sin precios,
     solo muestra los últimos publicados.
     ------------------------------------------------------------------ */
  (function tarifasEnVivo() {
    var select = $("#cRoom");
    if (!select || !window.fetch) return;

    // El <select> del cotizador es la única fuente: las tarjetas ya leen de él
    // (ver módulo 6), así que basta con actualizarlo y volver a pintar.
    function aplicar(tarifas) {
      var cambio = false;

      Object.keys(tarifas).forEach(function (tipo) {
        var opt = select.querySelector('option[value="' + tipo + '"]');
        if (!opt) return;
        var nuevo = String(tarifas[tipo]);
        if (opt.dataset.precio !== nuevo) {
          opt.dataset.precio = nuevo;
          cambio = true;
        }
      });

      if (!cambio) return;

      $$(".room-item").forEach(function (card) {
        var span = $(".js-precio", card);
        var opt = select.querySelector('option[value="' + card.dataset.room + '"]');
        if (span && opt) span.textContent = "Desde S/ " + opt.dataset.precio;
      });

      // El cotizador recalcula al oír "change" en el formulario
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    /** "individual" -> "Individual", que es como los nombra el <select>. */
    function aEtiqueta(tipo) {
      return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }

    fetch(SUPABASE_URL + "/rest/v1/habitaciones?select=tipo,precio_noche", {
      headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (filas) {
        if (!Array.isArray(filas) || filas.length === 0) return;
        var tarifas = {};
        filas.forEach(function (f) {
          var n = Math.round(Number(f.precio_noche));
          if (n > 0) tarifas[aEtiqueta(f.tipo)] = n;
        });
        aplicar(tarifas);
      })
      .catch(function () {
        /* Sin conexión con la base se quedan las tarifas publicadas en el HTML. */
      });
  })();
})();
