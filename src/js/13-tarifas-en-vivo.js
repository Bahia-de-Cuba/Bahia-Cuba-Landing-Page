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

      if (cambio) $$(".room-item").forEach(function (card) {
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

    fetch(SUPABASE_URL + "/rest/v1/habitaciones?select=tipo,precio_noche,capacidad_max", {
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
          if (typeof f.tipo !== "string" || !/^(individual|matrimonial|doble|triple|familiar)$/.test(f.tipo)) return;
          var n = Number(f.precio_noche);
          if (Number.isFinite(n) && n > 0) tarifas[aEtiqueta(f.tipo)] = n;
          var opt = select.querySelector('option[value="' + aEtiqueta(f.tipo) + '"]');
          if (opt && Number.isInteger(f.capacidad_max) && f.capacidad_max>0) opt.dataset.capacidad = f.capacidad_max;
        });
        aplicar(tarifas);
      })
      .catch(function () {
        /* Sin conexión con la base se quedan las tarifas publicadas en el HTML. */
      });
  })();
