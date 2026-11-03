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
