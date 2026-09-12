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

    /**
     * Avisa (sin bloquear) si hay más huéspedes que la capacidad del cuarto.
     *
     * Tiene que llevar TODOS los tipos del desplegable: el que falte no avisa
     * nunca, porque `CAPACIDAD[tipo]` sale `undefined` y la condición se cae.
     * Triple faltaba y Doble decía 4 cuando admite 3. Las cifras son las del
     * inventario real del hotel, las mismas que muestran las tarjetas.
     */
    var CAPACIDAD = {
      Individual: 1,
      Matrimonial: 2,
      Doble: 3,
      Triple: 4,
      Familiar: 6,
    };

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
