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
    return opt ? Number(opt.dataset.precio) || 0 : 0;
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
