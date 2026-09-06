  /** Número de WhatsApp del hotel (formato internacional, sin signos). */
  var WHATSAPP = "51941677501";

  /** Sistema de reservas. Es el único sitio donde se reserva de verdad. */
  var URL_RESERVAS = "https://bahia-cuba-app.netlify.app/es/reservar";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
