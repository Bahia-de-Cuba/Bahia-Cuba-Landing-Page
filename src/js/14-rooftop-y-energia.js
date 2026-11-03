  /* ------------------------------------------------------------------
     14. ROOFTOP ABIERTO / CERRADO Y LOS CUATRO INSTRUMENTOS
     Ambos salen de la hora real de Tuquillo. Los diales no inventan
     lecturas: un punto encendido indica qué fuente está trabajando ahora
     (el sol, según su altura real; las baterías, de noche).
     ------------------------------------------------------------------ */
  (function rooftopYEnergia() {
    var bar = $("#estadoBar");
    var barTexto = bar && $('[data-bar="texto"]', bar);
    var diales = {};

    $$(".instrumento").forEach(function (li) {
      var svg = $(".instrumento__dial", li);
      diales[li.dataset.fuente] = anillos(svg, [
        { r: 33, p: 4.4 }, { r: 43, p: 3.4 }, { r: 52, p: 2.4 },
      ], { aire: 5 });
    });

    function encender(fuente, fraccion) {
      (diales[fuente] || []).forEach(function (c) {
        c.classList.toggle("encendido", +c.dataset.f < fraccion);
      });
    }

    function estadoFuente(fuente, texto) {
      var el = $('[data-estado-fuente="' + fuente + '"]');
      if (el) el.textContent = texto;
    }

    function tic() {
      var ahora = new Date();

      // Varadero 319: de 19:00 a 01:00, hora de Huarmey
      if (bar) {
        var h = horaLima(ahora);
        var abierto = h >= 19 || h < 1;
        bar.dataset.abierto = String(abierto);
        if (abierto) {
          barTexto.textContent = "Abierto ahora · cierra a la 1:00 a. m.";
        } else {
          var hoy = SOL ? SOL.hoyLima(ahora) : null;
          var abre = hoy ? new Date(+hoy + 7 * UNA_HORA) : null; // 12:00 + 7 h = 19:00
          barTexto.textContent = abre
            ? "Abre hoy a las 7:00 p. m. · en " + duracion(abre - ahora)
            : "Todas las noches de 7:00 p. m. a 1:00 a. m.";
        }
      }

      if (!SOL) return;
      var dias = SOL.horas(SOL.hoyLima(ahora));
      var deDia = ahora > dias.salida && ahora < dias.puesta;
      var alt = SOL.altura(ahora);
      var altMax = SOL.altura(dias.mediodia);

      encender("sol", deDia ? Math.max(0.08, alt / altMax) : 0);
      estadoFuente("sol", deDia ? "De día, con el sol" : "Vuelve a las " + hora(SOL.horas(new Date(+SOL.hoyLima(ahora) + (ahora > dias.puesta ? UN_DIA : 0))).salida));
      // Viento y agua no tienen lectura en vivo: sus diales quedan quietos y sus
      // textos son hechos. Solo el sol y las baterías cambian con la hora.
      encender("viento", 1);
      encender("bateria", deDia ? 0.5 : 1);
      estadoFuente("bateria", deDia ? "De día se cargan" : "De noche dan la luz");
      encender("agua", 1);
    }

    tic();
    setInterval(tic, 60000);
  })();
