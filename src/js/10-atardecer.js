  /* ------------------------------------------------------------------
     10. ATARDECER EN VIVO
     Puesta, salida y hora dorada para la ubicación exacta del hotel, hoy
     o el día que el visitante elija; el sol recorre su arco según la hora
     real, y abajo van los próximos siete atardeceres.
     ------------------------------------------------------------------ */
  (function atardecer() {
    var seccion = $("#atardecer");
    if (!seccion || !SOL) return;

    var q = function (k) { return $('[data-atardecer="' + k + '"]', seccion); };
    var fechaEl = $("#fechaSol");
    var grupoSol = $("#arcoSolPuntos");
    var mar = $("#arcoMar");
    var semana = $("#semanaSol");
    var ns = "http://www.w3.org/2000/svg";
    var elegido = null;

    // Sol pequeño de puntos para el arco
    anillos(grupoSol, [
      { r: 9, p: 4.2 }, { r: 19, p: 3.4 }, { r: 28, p: 2.4 }, { r: 36, p: 1.5 },
    ], { aire: 4 });

    // Mar en trama: filas de puntos que se achican hacia abajo
    var puntosMar = [];
    for (var fila = 0; fila < 5; fila++) {
      var r = 3.4 - fila * 0.62, paso = 13;
      for (var cx = (fila % 2) * paso / 2; cx <= 640; cx += paso) {
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", 300 + fila * 9);
        c.setAttribute("r", r.toFixed(2));
        mar.appendChild(c);
        puntosMar.push(c);
      }
    }

    // Punto de la curva cuadrática del arco (mismos valores que el path)
    function enArco(t) {
      var x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 320 + t * t * 600;
      var y = (1 - t) * (1 - t) * 290 + 2 * (1 - t) * t * -70 + t * t * 290;
      return { x: x, y: y };
    }

    function pintar() {
      var ahora = new Date();
      var dia = elegido || SOL.hoyLima(ahora);
      var h = SOL.horas(dia);
      var esHoy = !elegido || +SOL.hoyLima(ahora) === +dia;

      var dh = h; // el día cuyos datos se cuentan abajo
      q("salida-corta").textContent = hora(h.salida);
      q("puesta-corta").textContent = hora(h.puesta);

      var t;
      if (esHoy) {
        q("etiqueta").textContent = "Hoy, a las";
        q("hora").textContent = hora(h.puesta);
        if (ahora < h.salida) {
          q("falta").textContent = "Todavía no amanece: el sol sale a las " + hora(h.salida);
          t = 0;
        } else if (ahora < h.puesta) {
          q("falta").textContent = "Faltan " + duracion(h.puesta - ahora) + ". La hora dorada empieza a las " + hora(h.dorada);
          t = (ahora - h.salida) / (h.puesta - h.salida);
        } else {
          // Ya pasó: la respuesta útil es la de mañana
          var m = SOL.horas(new Date(+dia + UN_DIA));
          q("etiqueta").textContent = "Mañana, a las";
          q("hora").textContent = hora(m.puesta);
          // hora() ya termina en "m.", así que no se le pone otro punto detrás
          q("falta").textContent = "Hoy se puso a las " + hora(h.puesta) + " La hora dorada de mañana empieza a las " + hora(m.dorada);
          dh = m;
          t = 1;
        }
        q("ahora").textContent = t <= 0 || t >= 1 ? "El sol, bajo el mar" : "El sol, ahora";
      } else {
        var largo = fmtFechaLarga.format(dia);
        q("etiqueta").textContent = largo.charAt(0).toUpperCase() + largo.slice(1) + ", a las";
        q("hora").textContent = hora(h.puesta);
        q("falta").textContent = "Ese día la hora dorada empieza a las " + hora(h.dorada);
        q("ahora").textContent = "Ese día, al caer la tarde";
        t = 0.93;
      }

      // El arco cuenta el mismo día que la respuesta grande
      q("salida-corta").textContent = hora(dh.salida);
      q("puesta-corta").textContent = hora(dh.puesta);
      var quien = !esHoy ? "Ese día el sol sale" : dh === h ? "Hoy el sol salió" : "Mañana el sol sale";
      q("detalle").textContent = quien + " a las " + hora(dh.salida) + " y hay " +
        duracion(dh.puesta - dh.salida) + " de luz.";

      var pos = enArco(Math.min(1, Math.max(0, t)));
      var bajo = t <= 0 || t >= 1 ? 46 : 0; // bajo el horizonte, escondido por la máscara
      grupoSol.setAttribute("transform", "translate(" + pos.x.toFixed(1) + " " + (pos.y + bajo).toFixed(1) + ")");

      // Reflejo: los puntos del mar bajo el sol se encienden cerca del ocaso
      var cerca = t > 0.75 && t < 1;
      puntosMar.forEach(function (c) {
        var dx = Math.abs(+c.getAttribute("cx") - pos.x);
        c.style.fill = cerca && dx < 40 ? "var(--rojo)" : "";
      });
    }

    function pintarSemana() {
      var hoy = SOL.hoyLima(new Date());
      var html = "";
      for (var i = 0; i < 7; i++) {
        var d = new Date(+hoy + i * UN_DIA);
        var corto = fmtDiaSemana.format(d);
        var finde = corto === "Sat" || corto === "Sun";
        var etiqueta = i === 0 ? "hoy" : i === 1 ? "mañana" : fmtDia.format(d).replace(".", "");
        html += "<li" + (finde ? " data-finde" : "") + '><span class="semana__dia">' + etiqueta +
          '</span><span class="semana__hora">' + hora(SOL.horas(d).puesta) + "</span></li>";
      }
      semana.innerHTML = html;
    }

    // Máscara: el sol se esconde bajo el horizonte
    var svg = $("#arcoSol");
    var defs = document.createElementNS(ns, "defs");
    defs.innerHTML = '<clipPath id="sobreHorizonte"><rect x="-60" y="-120" width="760" height="410"/></clipPath>';
    svg.insertBefore(defs, svg.firstChild);
    var envoltura = document.createElementNS(ns, "g");
    envoltura.setAttribute("clip-path", "url(#sobreHorizonte)");
    grupoSol.parentNode.insertBefore(envoltura, grupoSol);
    envoltura.appendChild(grupoSol);

    if (fechaEl) {
      var hoyISO = new Date(Date.now() - 5 * UNA_HORA).toISOString().slice(0, 10);
      fechaEl.min = hoyISO;
      fechaEl.value = hoyISO;
      fechaEl.addEventListener("change", function () {
        elegido = diaDesdeISO(fechaEl.value);
        pintar();
      });
    }

    pintar();
    pintarSemana();
    setInterval(pintar, 60000);
  })();
