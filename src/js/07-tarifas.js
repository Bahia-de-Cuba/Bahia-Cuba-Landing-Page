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
