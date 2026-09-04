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

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!inEl.value || !outEl.value || !noches()) {
        aviso("Elige las fechas de check-in y check-out para cotizar.");
        inEl.focus();
        return;
      }
      var msg =
        "¡Hola Hotel Bahía de Cuba! 🌊\n" +
        "Deseo cotizar:\n" +
        "• Habitación: " + roomEl.value + "\n" +
        "• Huéspedes: " + guestsEl.options[guestsEl.selectedIndex].text + "\n" +
        "• Check-in: " + inEl.value + "\n" +
        "• Check-out: " + outEl.value + " (" + noches() + " noches)\n" +
        "• Tarifa web: S/ " + totalEl.textContent + "\n" +
        "¿Tienen disponibilidad?";
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });

    // Fechas por defecto: hoy y mañana
    var hoy = new Date();
    var manana = new Date(hoy.getTime() + UN_DIA);
    inEl.min = iso(hoy);
    inEl.value = iso(hoy);
    outEl.value = iso(manana);
    recalcular();
  })();
