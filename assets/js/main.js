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

    function crearClones() {
      if (clones.length) return;
      originales.forEach(function (t) {
        var copia = t.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        copia.dataset.clon = "1";
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

    function sincronizarClones() {
      clones.forEach(function (c, i) { c.hidden = originales[i].hidden; });
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
