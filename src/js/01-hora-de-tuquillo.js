  /* ------------------------------------------------------------------
     1. HORA DE TUQUILLO — día, atardecer y noche
     El script del <head> ya puso data-hora antes de pintar. Aquí se
     mantiene al día (cada minuto), se muestra el reloj y el selector
     deja ver el cartel en otra hora sin perder la real.
     ------------------------------------------------------------------ */
  var horaReal = SOL ? SOL.estado(new Date()) : "noche";
  var horaElegida = null;

  (function horaDeTuquillo() {
    var raiz = document.documentElement;
    var botones = $$("[data-ver-hora]");
    var reloj = $("[data-reloj]");
    var solSvg = $("#solCartel");
    var fraseEl = $('[data-sol="frase"]');

    /* Altura del sol en el cartel: 0 arriba, 1 tras el hotel */
    function alturaSol(estado) {
      if (estado === "noche") return 0.08; // la luna, alta
      if (estado === "atardecer") return 0.62;
      if (!SOL || horaElegida) return 0.12;
      var alt = SOL.altura(new Date());
      return Math.min(0.62, Math.max(0.04, 0.66 - alt / 95));
    }

    function pintar() {
      var estado = horaElegida || horaReal;
      raiz.dataset.hora = estado;
      botones.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.verHora === estado));
      });
      if (solSvg) solSvg.style.setProperty("--sol-y", alturaSol(estado));
    }

    function tic() {
      var ahora = new Date();
      if (reloj) reloj.textContent = hora(ahora);
      if (!SOL) return;
      var antes = horaReal;
      horaReal = SOL.estado(ahora);

      var h = SOL.horas(SOL.hoyLima(ahora));
      if (fraseEl) {
        // Las horas salen del formateador (texto seguro), así que se pueden poner en negrita
        if (ahora < h.puesta) {
          fraseEl.innerHTML = "Hoy el sol se pone sobre el Pacífico a las <strong>" + hora(h.puesta) +
            "</strong> · faltan " + duracion(h.puesta - ahora) + ".";
        } else {
          var manana = SOL.horas(new Date(+SOL.hoyLima(ahora) + UN_DIA));
          fraseEl.innerHTML = "Hoy el sol se puso a las " + hora(h.puesta) +
            " sobre el Pacífico. Mañana se pone a las <strong>" + hora(manana.puesta) + "</strong>";
        }
      }
      pintar();
      if (antes !== horaReal) emitir("hora", horaReal);
    }

    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.dataset.verHora;
        horaElegida = v === horaReal ? null : v;
        pintar();
      });
    });

    tic();
    setInterval(tic, 30000);
  })();
