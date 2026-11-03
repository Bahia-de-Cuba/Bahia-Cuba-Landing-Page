/* ==========================================================================
   Hotel Bahía de Cuba — comportamiento de la landing
   Sin dependencias. Todo se degrada con elegancia si algo no está disponible.

   Archivo generado por tools/build-js.mjs a partir de src/js/ — no editar.
   ========================================================================== */
(function () {
  "use strict";

  /** Número de WhatsApp del hotel (formato internacional, sin signos). */
  var WHATSAPP = "51908925065";

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

  /** Cálculo solar del <head> (window.SOL). Sin él, las funciones de sol se apagan solas. */
  var SOL = window.SOL || null;

  var UN_MIN = 6e4;
  var UNA_HORA = 36e5;
  var UN_DIA = 864e5;

  /* Todo se muestra en la hora de Huarmey, esté donde esté el visitante */
  var fmtHora = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima", hour: "numeric", minute: "2-digit", hour12: true,
  });
  var fmtDia = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima", weekday: "short", day: "numeric",
  });
  var fmtFechaLarga = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima", weekday: "long", day: "numeric", month: "long",
  });
  var fmtDiaSemana = new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short" });

  /** "6:12 p. m.", unido con espacios de no separación para que nunca se parta en dos líneas. */
  function hora(d) {
    return fmtHora.format(d).replace(/\s/g, " ").replace("a.m.", "a. m.").replace("p.m.", "p. m.").replace(/ /g, "\u00a0");
  }

  /** "2 h 14 min", "35 min" */
  function duracion(ms) {
    var min = Math.max(0, Math.round(ms / UN_MIN));
    var h = Math.floor(min / 60), m = min % 60;
    if (!h) return m + " min";
    return m ? h + " h " + m + " min" : h + " h";
  }

  /** Hora de Lima (0–23) de un instante */
  function horaLima(t) {
    return new Date(+t - 5 * UNA_HORA).getUTCHours();
  }

  /** "2026-11-14" → mediodía de ese día en Huarmey */
  function diaDesdeISO(iso) {
    var p = (iso || "").split("-");
    if (p.length !== 3 || !SOL) return null;
    return SOL.mediodiaLima(+p[0], +p[1] - 1, +p[2]);
  }

  /** Avisa a los demás módulos de que algo cambió */
  function emitir(nombre, detalle) {
    document.dispatchEvent(new CustomEvent("bdc:" + nombre, { detail: detalle }));
  }

  /** Precio por noche de un tipo, leído del <select> del cotizador (fuente única) */
  function precioDe(tipo) {
    var opt = document.querySelector('#cRoom option[value="' + tipo + '"]');
    return opt ? parseInt(opt.dataset.precio, 10) || 0 : 0;
  }

  /**
   * Dibuja anillos de puntos (el sol del logo) dentro de un <svg>.
   * anillos: [{ r: radio del anillo, p: radio del punto, claro: bool }]
   */
  function anillos(svg, lista, opciones) {
    var ns = "http://www.w3.org/2000/svg";
    var o = opciones || {};
    var frag = document.createDocumentFragment();
    var puntos = [];
    lista.forEach(function (a, i) {
      var n = Math.max(6, Math.floor((2 * Math.PI * a.r) / (a.p * 2 + (o.aire || 7))));
      var giro = i % 2 ? Math.PI / n : 0;
      for (var j = 0; j < n; j++) {
        var ang = -Math.PI / 2 + giro + (j / n) * Math.PI * 2;
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", (Math.cos(ang) * a.r).toFixed(2));
        c.setAttribute("cy", (Math.sin(ang) * a.r).toFixed(2));
        c.setAttribute("r", a.p);
        if (a.claro) c.setAttribute("class", "claro");
        if (o.retardo) c.style.setProperty("--d", (o.retardo(i, j, n)).toFixed(3) + "s");
        c.dataset.f = (j / n).toFixed(3);
        frag.appendChild(c);
        puntos.push(c);
      }
    });
    svg.appendChild(frag);
    return puntos;
  }

  /* ------------------------------------------------------------------
     1. HORA DE TUQUILLO — día, atardecer y noche
     El script del <head> ya puso data-hora antes de pintar. Aquí se
     mantiene al día (cada minuto), se muestra el reloj y el selector
     deja ver el cartel en otra hora sin perder la real.
     ------------------------------------------------------------------ */
  var horaReal = SOL ? SOL.estado(new Date()) : "noche";
  var horaElegida = null;

  (function horaDeTuquillo() {
    var raiz = document.documentElement;
    var botones = $$("[data-ver-hora]");
    var reloj = $("[data-reloj]");
    var solSvg = $("#solCartel");
    var fraseEl = $('[data-sol="frase"]');

    /* Altura del sol en el cartel: 0 arriba, 1 tras el hotel */
    function alturaSol(estado) {
      if (estado === "noche") return 0.08; // la luna, alta
      if (estado === "atardecer") return 0.62;
      if (!SOL || horaElegida) return 0.12;
      var alt = SOL.altura(new Date());
      return Math.min(0.62, Math.max(0.04, 0.66 - alt / 95));
    }

    function pintar() {
      var estado = horaElegida || horaReal;
      raiz.dataset.hora = estado;
      botones.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.verHora === estado));
      });
      if (solSvg) solSvg.style.setProperty("--sol-y", alturaSol(estado));
    }

    function tic() {
      var ahora = new Date();
      if (reloj) reloj.textContent = hora(ahora);
      if (!SOL) return;
      var antes = horaReal;
      horaReal = SOL.estado(ahora);

      var h = SOL.horas(SOL.hoyLima(ahora));
      if (fraseEl) {
        // Las horas salen del formateador (texto seguro), así que se pueden poner en negrita
        if (ahora < h.puesta) {
          fraseEl.innerHTML = "Hoy el sol se pone sobre el Pacífico a las <strong>" + hora(h.puesta) +
            "</strong> · faltan " + duracion(h.puesta - ahora) + ".";
        } else {
          var manana = SOL.horas(new Date(+SOL.hoyLima(ahora) + UN_DIA));
          fraseEl.innerHTML = "Hoy el sol se puso a las " + hora(h.puesta) +
            " sobre el Pacífico. Mañana se pone a las <strong>" + hora(manana.puesta) + "</strong>";
        }
      }
      pintar();
      if (antes !== horaReal) emitir("hora", horaReal);
    }

    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.dataset.verHora;
        horaElegida = v === horaReal ? null : v;
        pintar();
      });
    });

    tic();
    setInterval(tic, 30000);
  })();

  /* ------------------------------------------------------------------
     2. SOL DE PUNTOS — el anillo del logo, como sistema de luz
     El del cartel se arma punto a punto al cargar (del centro hacia
     fuera). Los puntos grandes van dentro y se achican hacia el borde,
     como en el logo.
     ------------------------------------------------------------------ */
  (function solDePuntos() {
    var svg = $("#solCartel");
    if (!svg) return;
    var lista = [];
    for (var i = 0; i < 7; i++) {
      lista.push({ r: 96 + i * 30, p: +(13.5 - i * 1.6).toFixed(2), claro: i === 0 });
    }
    anillos(svg, lista, {
      aire: 8,
      retardo: reduceMotion ? null : function (anillo, j, n) {
        // del centro hacia afuera, con un barrido que da la vuelta
        return 0.25 + anillo * 0.075 + (j / n) * 0.18;
      },
    });
  })();

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

  /* ------------------------------------------------------------------
     4. MENÚ MÓVIL (Esc, foco atrapado y aria-expanded)
     ------------------------------------------------------------------ */
  (function menuMovil() {
    var abrir = $("#abrirMenu");
    var cerrar = $("#cerrarMenu");
    var panel = $("#menuMovil");
    if (!abrir || !panel || !cerrar) return;

    function enfocables() {
      return $$("a, button", panel);
    }

    function set(abierto) {
      abrir.setAttribute("aria-expanded", String(abierto));
      document.body.style.overflow = abierto ? "hidden" : "";
      if (abierto) {
        panel.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { panel.dataset.estado = "abierto"; });
        });
        cerrar.focus();
      } else {
        panel.dataset.estado = "cerrado";
        var fin = function () { if (panel.dataset.estado === "cerrado") panel.hidden = true; };
        if (reduceMotion) fin();
        else setTimeout(fin, 320);
        abrir.focus();
      }
    }

    abrir.addEventListener("click", function () { set(true); });
    cerrar.addEventListener("click", function () { set(false); });
    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
    panel.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") return set(false);
      if (ev.key !== "Tab") return;
      var f = enfocables(), primero = f[0], ultimo = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
    });
  })();

  /* ------------------------------------------------------------------
     5. REVELADOS AL BAJAR
     Solo se ocultan los elementos que al cargar están fuera de pantalla:
     lo que ya se ve, se queda visible. Sin IntersectionObserver o con
     movimiento reducido, todo está a la vista desde el principio.
     ------------------------------------------------------------------ */
  (function revelados() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    $$(".seccion .rotulo-seccion, .pie__rotulo").forEach(function (el) { el.dataset.revelar = "rotulo"; });
    $$(".seccion .foto-pegada").forEach(function (el) { el.dataset.revelar = "foto"; });
    $$(".cartelera, .programa, .casa__lista, .muro, .instrumentos").forEach(function (el) {
      el.dataset.revelar = "lista";
      Array.prototype.forEach.call(el.children, function (h, i) { h.style.setProperty("--n", i); });
    });

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("revelado");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    var alto = window.innerHeight;
    $$("[data-revelar]").forEach(function (el) {
      if (el.getBoundingClientRect().top < alto) return; // ya está a la vista
      el.classList.add("por-revelar");
      io.observe(el);
    });
  })();

  /* ------------------------------------------------------------------
     6. TIRA — corre en bucle; con movimiento reducido se queda quieta
     ------------------------------------------------------------------ */
  (function tira() {
    var t = $(".tira");
    var pista = t && $(".tira__pista", t);
    if (!pista || reduceMotion) return;
    $$("li", pista).forEach(function (li) {
      var copia = li.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      pista.appendChild(copia);
    });
    t.classList.add("tira--anim");
  })();

  /* ------------------------------------------------------------------
     7. TARIFAS — una sola fuente y en vivo
     El <select> del cotizador es la fuente: las filas de habitaciones, el
     «desde S/» y el buscador leen de él. Al cargar se piden las tarifas
     reales a la base; si la consulta falla (sin red, base dormida) se
     quedan las publicadas en el HTML, que hacen de respaldo.
     ------------------------------------------------------------------ */
  (function tarifas() {
    var select = $("#cRoom");
    if (!select) return;

    function pintar() {
      var min = Infinity;
      $$("option", select).forEach(function (o) {
        var p = parseInt(o.dataset.precio, 10);
        if (p > 0 && p < min) min = p;
      });
      $$(".js-precio[data-tipo]").forEach(function (span) {
        span.textContent = precioDe(span.dataset.tipo);
      });
      if (min < Infinity) {
        $$("[data-precio-min]").forEach(function (s) { s.textContent = min; });
      }
      emitir("tarifas");
    }

    pintar();
    if (!window.fetch) return;

    fetch(SUPABASE_URL + "/rest/v1/habitaciones?select=tipo,precio_noche", {
      headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (filas) {
        if (!Array.isArray(filas) || !filas.length) return;
        var cambio = false;
        filas.forEach(function (f) {
          var n = Math.round(Number(f.precio_noche));
          var tipo = String(f.tipo || "");
          tipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
          var opt = select.querySelector('option[value="' + tipo + '"]');
          if (n > 0 && opt && opt.dataset.precio !== String(n)) {
            opt.dataset.precio = String(n);
            cambio = true;
          }
        });
        if (!cambio) return;
        pintar();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      })
      .catch(function () {
        /* Sin conexión con la base se quedan las tarifas publicadas en el HTML. */
      });
  })();

  /* ------------------------------------------------------------------
     8. ¿CON QUIÉN VIAJAS? — recomienda la habitación
     Con quién y cuántos → el cuarto que les queda, con su precio vivo.
     Marca en la cartelera los que sirven y apaga los que no, y deja el
     cotizador listo con la misma elección.
     ------------------------------------------------------------------ */
  (function conQuienViajas() {
    var form = $("#buscador");
    if (!form) return;

    var nEl = $("#buscadorN");
    var menos = $('[data-paso="-1"]', form);
    var mas = $('[data-paso="1"]', form);
    var mascota = $("#buscadorMascota");
    var veredicto = $("#veredicto");
    var filas = $$(".fila");
    var v = function (k) { return $('[data-veredicto="' + k + '"]', veredicto); };

    var CAP = { Individual: 1, Matrimonial: 2, Doble: 3, Triple: 4, Familiar: 6 };
    var CAMAS = {
      Individual: "1 cama de 1.5 plazas, silenciosa para descansar o trabajar.",
      Matrimonial: "1 cama de 2 plazas, para descansar en pareja.",
      Doble: "1 cama de 2 plazas + camarote.",
      Triple: "3 camas individuales: cada uno en la suya.",
      Familiar: "2 camarotes: todos juntos en un mismo cuarto.",
    };
    var POR_DEFECTO = { solo: 1, pareja: 2, amigos: 3, familia: 4 };
    var n = 2;
    var quien = "pareja";

    /** La regla: el cuarto más ajustado que les sirve, según con quién van */
    function elegir() {
      if (n <= 1) return "Individual";
      if (n === 2) {
        if (quien === "amigos") return "Doble";
        return "Matrimonial";
      }
      if (n === 3) return quien === "amigos" ? "Triple" : "Doble";
      if (n === 4) return "Triple";
      return "Familiar";
    }

    function razon(tipo) {
      if (tipo === "Doble" && quien === "amigos") return "1 cama de 2 plazas + camarote: cada uno en su cama.";
      if (tipo === "Doble" && n === 3) return "1 cama de 2 plazas + camarote, para los tres.";
      if (tipo === "Triple" && n === 4) return "3 camas individuales, para hasta 4 personas.";
      if (tipo === "Familiar") return "2 camarotes: hasta 6 personas en un mismo cuarto.";
      return CAMAS[tipo];
    }

    function actualizar(animar) {
      nEl.textContent = n;
      menos.disabled = n <= 1;
      mas.disabled = n >= 6;

      var tipo = elegir();
      var precio = precioDe(tipo);
      v("nombre").textContent = tipo;
      v("razon").textContent = razon(tipo);
      v("precio").textContent = precio;
      v("reservar").href = URL_RESERVAS + "?tipo=" + tipo.toLowerCase();
      v("mascota").hidden = !mascota.checked;
      if (animar) {
        veredicto.removeAttribute("data-cambio");
        void veredicto.offsetWidth;
        veredicto.setAttribute("data-cambio", "");
      }

      filas.forEach(function (f) {
        var cap = CAP[f.dataset.room];
        f.dataset.encaja = cap >= n ? "si" : "no";
        if (f.dataset.room === tipo) f.setAttribute("data-recomendada", "");
        else f.removeAttribute("data-recomendada");
      });

      // El cotizador queda con la misma elección
      var room = $("#cRoom"), guests = $("#cGuests");
      if (room && guests && animar) {
        room.value = tipo;
        guests.value = String(n);
        room.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); });
    form.addEventListener("change", function (e) {
      if (e.target.name === "quien") {
        quien = e.target.value;
        n = POR_DEFECTO[quien];
      }
      actualizar(true);
    });
    [menos, mas].forEach(function (b) {
      b.addEventListener("click", function () {
        n = Math.min(6, Math.max(1, n + parseInt(b.dataset.paso, 10)));
        if (n === 1) {
          quien = "solo";
          $('input[value="solo"]', form).checked = true;
        } else if (quien === "solo") {
          quien = n === 2 ? "pareja" : "amigos";
          $('input[value="' + quien + '"]', form).checked = true;
        }
        actualizar(true);
      });
    });
    document.addEventListener("bdc:tarifas", function () { actualizar(false); });

    actualizar(false);
  })();

  /* ------------------------------------------------------------------
     9. FOTO QUE ACOMPAÑA AL CURSOR (cartelera, escritorio)
     En pantallas con ratón la cartelera es solo texto y la foto de cada
     habitación sigue al cursor con un muelle suave. En móvil la foto va
     dentro de cada fila, así que esto no hace nada.
     ------------------------------------------------------------------ */
  (function previaCartelera() {
    var lista = $("#cartelera");
    if (!lista || reduceMotion) return;
    var mq = window.matchMedia("(hover: hover) and (min-width: 1024px)");

    var previa = document.createElement("figure");
    previa.className = "previa";
    previa.setAttribute("aria-hidden", "true");
    previa.innerHTML = '<img alt="" decoding="async"><figcaption class="costura"></figcaption>';
    document.body.appendChild(previa);
    var img = $("img", previa), pie = $("figcaption", previa);

    var x = 0, y = 0, tx = 0, ty = 0, vx = 0, corriendo = false, activa = false;

    function bucle() {
      // muelle amortiguado: rígido 0.14, amortiguado por la mezcla
      var dx = tx - x, dy = ty - y;
      x += dx * 0.16;
      y += dy * 0.16;
      vx = vx * 0.8 + dx * 0.02;
      previa.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" +
        (-3 + Math.max(-6, Math.min(6, vx))).toFixed(2) + "deg)";
      if (activa || Math.abs(dx) + Math.abs(dy) > 0.5) requestAnimationFrame(bucle);
      else corriendo = false;
    }

    function mover(ev) {
      tx = ev.clientX + 28;
      ty = ev.clientY - 160;
      if (!corriendo) {
        corriendo = true;
        requestAnimationFrame(bucle);
      }
    }

    $$(".fila", lista).forEach(function (fila) {
      var foto = $(".fila__foto img", fila);
      var cap = $(".fila__foto figcaption", fila);
      fila.addEventListener("pointerenter", function (ev) {
        if (!mq.matches || ev.pointerType !== "mouse") return;
        img.src = foto.currentSrc || foto.src;
        pie.textContent = cap ? cap.textContent : "";
        if (!activa) {
          x = tx = ev.clientX + 28;
          y = ty = ev.clientY - 160;
        }
        activa = true;
        previa.dataset.visible = "true";
        mover(ev);
      });
      fila.addEventListener("pointermove", function (ev) { if (activa) mover(ev); });
    });
    lista.addEventListener("pointerleave", function () {
      activa = false;
      previa.dataset.visible = "false";
    });
  })();

  /* ------------------------------------------------------------------
     10. ATARDECER EN VIVO
     Puesta, salida y hora dorada para la ubicación exacta del hotel, hoy
     o el día que el visitante elija; el sol recorre su arco según la hora
     real, y abajo van los próximos siete atardeceres.
     ------------------------------------------------------------------ */
  (function atardecer() {
    var seccion = $("#atardecer");
    if (!seccion || !SOL) return;

    var q = function (k) { return $('[data-atardecer="' + k + '"]', seccion); };
    var fechaEl = $("#fechaSol");
    var grupoSol = $("#arcoSolPuntos");
    var mar = $("#arcoMar");
    var semana = $("#semanaSol");
    var ns = "http://www.w3.org/2000/svg";
    var elegido = null;

    // Sol pequeño de puntos para el arco
    anillos(grupoSol, [
      { r: 9, p: 4.2 }, { r: 19, p: 3.4 }, { r: 28, p: 2.4 }, { r: 36, p: 1.5 },
    ], { aire: 4 });

    // Mar en trama: filas de puntos que se achican hacia abajo
    var puntosMar = [];
    for (var fila = 0; fila < 5; fila++) {
      var r = 3.4 - fila * 0.62, paso = 13;
      for (var cx = (fila % 2) * paso / 2; cx <= 640; cx += paso) {
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", 300 + fila * 9);
        c.setAttribute("r", r.toFixed(2));
        mar.appendChild(c);
        puntosMar.push(c);
      }
    }

    // Punto de la curva cuadrática del arco (mismos valores que el path)
    function enArco(t) {
      var x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 320 + t * t * 600;
      var y = (1 - t) * (1 - t) * 290 + 2 * (1 - t) * t * -70 + t * t * 290;
      return { x: x, y: y };
    }

    function pintar() {
      var ahora = new Date();
      var dia = elegido || SOL.hoyLima(ahora);
      var h = SOL.horas(dia);
      var esHoy = !elegido || +SOL.hoyLima(ahora) === +dia;

      var dh = h; // el día cuyos datos se cuentan abajo
      q("salida-corta").textContent = hora(h.salida);
      q("puesta-corta").textContent = hora(h.puesta);

      var t;
      if (esHoy) {
        q("etiqueta").textContent = "Hoy, a las";
        q("hora").textContent = hora(h.puesta);
        if (ahora < h.salida) {
          q("falta").textContent = "Todavía no amanece: el sol sale a las " + hora(h.salida);
          t = 0;
        } else if (ahora < h.puesta) {
          q("falta").textContent = "Faltan " + duracion(h.puesta - ahora) + ". La hora dorada empieza a las " + hora(h.dorada);
          t = (ahora - h.salida) / (h.puesta - h.salida);
        } else {
          // Ya pasó: la respuesta útil es la de mañana
          var m = SOL.horas(new Date(+dia + UN_DIA));
          q("etiqueta").textContent = "Mañana, a las";
          q("hora").textContent = hora(m.puesta);
          // hora() ya termina en "m.", así que no se le pone otro punto detrás
          q("falta").textContent = "Hoy se puso a las " + hora(h.puesta) + " La hora dorada de mañana empieza a las " + hora(m.dorada);
          dh = m;
          t = 1;
        }
        q("ahora").textContent = t <= 0 || t >= 1 ? "El sol, bajo el mar" : "El sol, ahora";
      } else {
        var largo = fmtFechaLarga.format(dia);
        q("etiqueta").textContent = largo.charAt(0).toUpperCase() + largo.slice(1) + ", a las";
        q("hora").textContent = hora(h.puesta);
        q("falta").textContent = "Ese día la hora dorada empieza a las " + hora(h.dorada);
        q("ahora").textContent = "Ese día, al caer la tarde";
        t = 0.93;
      }

      // El arco cuenta el mismo día que la respuesta grande
      q("salida-corta").textContent = hora(dh.salida);
      q("puesta-corta").textContent = hora(dh.puesta);
      var quien = !esHoy ? "Ese día el sol sale" : dh === h ? "Hoy el sol salió" : "Mañana el sol sale";
      q("detalle").textContent = quien + " a las " + hora(dh.salida) + " y hay " +
        duracion(dh.puesta - dh.salida) + " de luz.";

      var pos = enArco(Math.min(1, Math.max(0, t)));
      var bajo = t <= 0 || t >= 1 ? 46 : 0; // bajo el horizonte, escondido por la máscara
      grupoSol.setAttribute("transform", "translate(" + pos.x.toFixed(1) + " " + (pos.y + bajo).toFixed(1) + ")");

      // Reflejo: los puntos del mar bajo el sol se encienden cerca del ocaso
      var cerca = t > 0.75 && t < 1;
      puntosMar.forEach(function (c) {
        var dx = Math.abs(+c.getAttribute("cx") - pos.x);
        c.style.fill = cerca && dx < 40 ? "var(--rojo)" : "";
      });
    }

    function pintarSemana() {
      var hoy = SOL.hoyLima(new Date());
      var html = "";
      for (var i = 0; i < 7; i++) {
        var d = new Date(+hoy + i * UN_DIA);
        var corto = fmtDiaSemana.format(d);
        var finde = corto === "Sat" || corto === "Sun";
        var etiqueta = i === 0 ? "hoy" : i === 1 ? "mañana" : fmtDia.format(d).replace(".", "");
        html += "<li" + (finde ? " data-finde" : "") + '><span class="semana__dia">' + etiqueta +
          '</span><span class="semana__hora">' + hora(SOL.horas(d).puesta) + "</span></li>";
      }
      semana.innerHTML = html;
    }

    // Máscara: el sol se esconde bajo el horizonte
    var svg = $("#arcoSol");
    var defs = document.createElementNS(ns, "defs");
    defs.innerHTML = '<clipPath id="sobreHorizonte"><rect x="-60" y="-120" width="760" height="410"/></clipPath>';
    svg.insertBefore(defs, svg.firstChild);
    var envoltura = document.createElementNS(ns, "g");
    envoltura.setAttribute("clip-path", "url(#sobreHorizonte)");
    grupoSol.parentNode.insertBefore(envoltura, grupoSol);
    envoltura.appendChild(grupoSol);

    if (fechaEl) {
      var hoyISO = new Date(Date.now() - 5 * UNA_HORA).toISOString().slice(0, 10);
      fechaEl.min = hoyISO;
      fechaEl.value = hoyISO;
      fechaEl.addEventListener("change", function () {
        elegido = diaDesdeISO(fechaEl.value);
        pintar();
      });
    }

    pintar();
    pintarSemana();
    setInterval(pintar, 60000);
  })();

  /* ------------------------------------------------------------------
     11. COTIZADOR — calcula y manda al sistema de reservas
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
    var solLlegada = $("[data-sol-llegada]");
    var solLlegadaHora = $("[data-sol-llegada-hora]");

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

    /* Capacidad real de cada tipo (la misma que muestran las filas). Tiene
       que llevar todos los tipos: el que falte no avisa nunca. */
    var CAPACIDAD = { Individual: 1, Matrimonial: 2, Doble: 3, Triple: 4, Familiar: 6 };

    function recalcular() {
      // El check-out siempre al menos un día después del check-in
      if (inEl.value) {
        var minOut = iso(new Date(new Date(inEl.value).getTime() + UN_DIA));
        outEl.min = minOut;
        if (outEl.value && outEl.value < minOut) outEl.value = minOut;
      }

      var n = noches();
      var precio = precioDe(roomEl.value);
      totalEl.textContent = (n * precio).toFixed(2);
      detalleEl.textContent = n
        ? n + (n === 1 ? " noche" : " noches") + " × S/ " + precio
        : "Elige tus fechas para ver el total";

      var cap = CAPACIDAD[roomEl.value];
      var huespedes = parseInt(guestsEl.value, 10);
      aviso(cap && huespedes > cap
        ? "La habitación " + roomEl.value + " admite hasta " + cap +
          (cap === 1 ? " persona" : " personas") + ". Elige una más grande o escríbenos por camas extra."
        : "");

      // A qué hora cae el sol el día que llegan
      var dia = diaDesdeISO(inEl.value);
      if (solLlegada && dia && SOL) {
        solLlegadaHora.textContent = hora(SOL.horas(dia).puesta);
        solLlegada.hidden = false;
      }
    }

    ["change", "input"].forEach(function (ev) {
      form.addEventListener(ev, recalcular);
    });

    /* Lleva al sistema de reservas con lo elegido. Aquí no se sabe qué
       noches están vendidas —eso vive en la base—, así que las fechas viajan
       como propuesta y el calendario de allá las descarta si pisan otra. */
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!inEl.value || !outEl.value || !noches()) {
        aviso("Elige las fechas de llegada y salida para continuar.");
        inEl.focus();
        return;
      }
      var q =
        "?tipo=" + encodeURIComponent(roomEl.value.toLowerCase()) +
        "&checkin=" + encodeURIComponent(inEl.value) +
        "&checkout=" + encodeURIComponent(outEl.value);
      window.location.href = URL_RESERVAS + q;
    });

    // Fechas por defecto: mañana y pasado (la llegada más temprana que admite el sistema)
    var base = new Date(Date.now() - 5 * UNA_HORA);
    var manana = new Date(+base + UN_DIA);
    var pasado = new Date(+base + 2 * UN_DIA);
    inEl.min = iso(manana);
    inEl.value = iso(manana);
    outEl.value = iso(pasado);
    recalcular();
  })();

  /* ------------------------------------------------------------------
     12. RUTA DESDE LIMA
     La carretera es un <input type="range"> de verdad (teclado y lector
     de pantalla funcionan solos); aquí solo se le pone el letrero. La
     primera vez que entra en pantalla, el auto hace el viaje solo.
     Kilómetros y tiempos son aproximados y así se dice en la página.
     ------------------------------------------------------------------ */
  (function rutaDesdeLima() {
    var control = $("#rutaKm");
    var widget = $("#ruta-widget");
    if (!control || !widget) return;

    var carretera = $(".carretera", widget);
    var q = function (k) { return $('[data-ruta="' + k + '"]', widget); };
    var paradas = $$(".carretera__paradas li", widget);
    var TOTAL = 297;

    // km, minutos aproximados desde Lima, nota
    var TRAMO = [
      { km: 0, min: 0, lugar: "Lima", nota: "Sales por la Panamericana Norte, rumbo al norte." },
      { km: 43, min: 50, lugar: "Ancón", nota: "Quedan atrás la ciudad y el tráfico; empieza la costa abierta." },
      { km: 148, min: 135, lugar: "Huacho", nota: "Buen punto para parar a comer a mitad de camino." },
      { km: 195, min: 175, lugar: "Barranca", nota: "Pasando Barranca queda el último tramo largo." },
      { km: 293, min: 230, lugar: "Huarmey", nota: "Ya casi: Tuquillo está a pocos minutos." },
      { km: 297, min: 240, lugar: "Hotel Bahía de Cuba", nota: "Llegaste. Búscanos por el letrero amarillo." },
    ];

    function minutosEn(km) {
      for (var i = 1; i < TRAMO.length; i++) {
        var a = TRAMO[i - 1], b = TRAMO[i];
        if (km <= b.km) return a.min + ((km - a.km) / (b.km - a.km)) * (b.min - a.min);
      }
      return 240;
    }

    function tiempo(min) {
      if (min < 1) return "0 h";
      return duracion(min * UN_MIN);
    }

    function pintar() {
      var km = +control.value;
      var actual = 0;
      for (var i = 0; i < TRAMO.length; i++) if (km >= TRAMO[i].km) actual = i;
      var exacto = TRAMO.filter(function (t) { return Math.abs(t.km - km) <= 2; })[0];
      var siguiente = TRAMO[Math.min(actual + 1, TRAMO.length - 1)];

      var lugar = exacto ? exacto.lugar : "Rumbo a " + siguiente.lugar;
      var nota = exacto ? exacto.nota : "Entre " + TRAMO[actual].lugar + " y " + siguiente.lugar + ", con el mar a la izquierda.";
      var falta = TOTAL - km;

      q("lugar").textContent = lugar;
      q("km").textContent = km;
      q("tiempo").textContent = km ? "~" + tiempo(minutosEn(km)) : "0 h";
      q("falta").textContent = falta ? falta + " km" : "0 km";
      q("nota").textContent = nota;
      control.setAttribute("aria-valuetext", lugar + ", kilómetro " + km + ", faltan " + falta + " kilómetros");
      carretera.style.setProperty("--avance", (km / TOTAL).toFixed(4));

      paradas.forEach(function (li, i) {
        var t = TRAMO[i];
        li.toggleAttribute("data-pasada", km >= t.km);
        li.toggleAttribute("data-actual", exacto === t);
      });
    }

    var animacion = null;
    function irA(destino, ms) {
      if (animacion) cancelAnimationFrame(animacion);
      var desde = +control.value;
      if (reduceMotion || !ms) {
        control.value = destino;
        return pintar();
      }
      var t0 = performance.now();
      (function paso(ahora) {
        var p = Math.min(1, (ahora - t0) / ms);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // entra y sale suave
        control.value = Math.round(desde + (destino - desde) * e);
        pintar();
        if (p < 1) animacion = requestAnimationFrame(paso);
        else animacion = null;
      })(t0);
    }

    control.addEventListener("input", function () {
      if (animacion) { cancelAnimationFrame(animacion); animacion = null; }
      pintar();
    });
    $$("button[data-km]", widget).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = +b.dataset.km;
        irA(d, Math.min(1400, 300 + Math.abs(d - control.value) * 5));
      });
    });

    pintar();

    // El viaje solo, una vez, al aparecer
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function () { irA(TOTAL, 3200); }, 350);
      }, { threshold: 0.6 });
      io.observe(carretera);
    }
  })();

  /* ------------------------------------------------------------------
     13. MAPA BAJO DEMANDA — Google solo carga si el visitante lo pide
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
        "&z=16&hl=es&output=embed";
      iframe.title = "Mapa: Hotel Bahía de Cuba, Playa Tuquillo, Huarmey";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      btn.remove();
      shell.appendChild(iframe);
    });
  })();

  /* ------------------------------------------------------------------
     14. ROOFTOP ABIERTO / CERRADO Y LOS CUATRO INSTRUMENTOS
     Ambos salen de la hora real de Tuquillo. Los diales no inventan
     lecturas: un punto encendido indica qué fuente está trabajando ahora
     (el sol, según su altura real; las baterías, de noche).
     ------------------------------------------------------------------ */
  (function rooftopYEnergia() {
    var bar = $("#estadoBar");
    var barTexto = bar && $('[data-bar="texto"]', bar);
    var diales = {};

    $$(".instrumento").forEach(function (li) {
      var svg = $(".instrumento__dial", li);
      diales[li.dataset.fuente] = anillos(svg, [
        { r: 33, p: 4.4 }, { r: 43, p: 3.4 }, { r: 52, p: 2.4 },
      ], { aire: 5 });
    });

    function encender(fuente, fraccion) {
      (diales[fuente] || []).forEach(function (c) {
        c.classList.toggle("encendido", +c.dataset.f < fraccion);
      });
    }

    function estadoFuente(fuente, texto) {
      var el = $('[data-estado-fuente="' + fuente + '"]');
      if (el) el.textContent = texto;
    }

    function tic() {
      var ahora = new Date();

      // Varadero 319: de 19:00 a 01:00, hora de Huarmey
      if (bar) {
        var h = horaLima(ahora);
        var abierto = h >= 19 || h < 1;
        bar.dataset.abierto = String(abierto);
        if (abierto) {
          barTexto.textContent = "Abierto ahora · cierra a la 1:00 a. m.";
        } else {
          var hoy = SOL ? SOL.hoyLima(ahora) : null;
          var abre = hoy ? new Date(+hoy + 7 * UNA_HORA) : null; // 12:00 + 7 h = 19:00
          barTexto.textContent = abre
            ? "Abre hoy a las 7:00 p. m. · en " + duracion(abre - ahora)
            : "Todas las noches de 7:00 p. m. a 1:00 a. m.";
        }
      }

      if (!SOL) return;
      var dias = SOL.horas(SOL.hoyLima(ahora));
      var deDia = ahora > dias.salida && ahora < dias.puesta;
      var alt = SOL.altura(ahora);
      var altMax = SOL.altura(dias.mediodia);

      encender("sol", deDia ? Math.max(0.08, alt / altMax) : 0);
      estadoFuente("sol", deDia ? "De día, con el sol" : "Vuelve a las " + hora(SOL.horas(new Date(+SOL.hoyLima(ahora) + (ahora > dias.puesta ? UN_DIA : 0))).salida));
      // Viento y agua no tienen lectura en vivo: sus diales quedan quietos y sus
      // textos son hechos. Solo el sol y las baterías cambian con la hora.
      encender("viento", 1);
      encender("bateria", deDia ? 0.5 : 1);
      estadoFuente("bateria", deDia ? "De día se cargan" : "De noche dan la luz");
      encender("agua", 1);
    }

    tic();
    setInterval(tic, 60000);
  })();

  /* ------------------------------------------------------------------
     15. DETALLES
     ------------------------------------------------------------------ */
  (function detalles() {
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  })();
})();
