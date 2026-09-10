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
