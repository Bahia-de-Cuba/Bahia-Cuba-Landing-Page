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
      return Number((opt && opt.dataset.precio) || "0");
    }

    /**
     * Aforo del tipo elegido.
     *
     * Manda `data-capacidad`, que lo pone 13-tarifas-en-vivo.js con lo que dice
     * la columna `capacidad_max` de la base: si el hotel cambia un aforo, la
     * web se entera sola. La tabla de aquí abajo es solo el respaldo para
     * cuando la base no contesta.
     *
     * Ese respaldo tiene que llevar TODOS los tipos del desplegable. El que
     * falte no avisa nunca, porque `CAPACIDAD[tipo]` sale `undefined` y la
     * condición se cae en silencio: así estuvo Triple, admitiendo peticiones
     * de seis personas sin rechistar.
     */
    var CAPACIDAD = {
      Individual: 1,
      Matrimonial: 2,
      Doble: 3,
      Triple: 4,
      Familiar: 6,
    };

    function capacidad() {
      var opt = roomEl.options[roomEl.selectedIndex];
      return Number(opt && opt.dataset.capacidad) || CAPACIDAD[roomEl.value];
    }

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

      var cap = capacidad();
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
      // Decir "elige las fechas" a quien ya las eligió no ayuda: cada motivo
      // lleva su mensaje, o el visitante no sabe qué corregir.
      if (!inEl.value || !outEl.value || !noches()) {
        aviso("Elige las fechas de check-in y check-out para continuar.");
        inEl.focus();
        return;
      }
      if (inEl.value < inEl.min) {
        aviso("La entrada más temprana que podemos reservar es mañana.");
        inEl.focus();
        return;
      }
      if (noches() > 365) {
        aviso("Para estancias de más de un año, escríbenos y lo vemos contigo.");
        outEl.focus();
        return;
      }
      if (Number(guestsEl.value) > capacidad()) {
        aviso("El número de huéspedes supera la capacidad de esta habitación. Elige otra habitación o consulta al hotel.");
        guestsEl.focus();
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
    // Perú es UTC-5 todo el año; no usar el día UTC ni el del visitante.
    var hoyLima = new Date(Date.now() - 5 * 3600000).toISOString().slice(0,10);
    var manana = new Date(Date.parse(hoyLima + "T00:00:00Z") + UN_DIA);
    var pasado = new Date(manana.getTime() + UN_DIA);
    inEl.min = iso(manana);
    inEl.value = iso(manana);
    outEl.value = iso(pasado);
    recalcular();
  })();
