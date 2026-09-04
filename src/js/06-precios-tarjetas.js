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
