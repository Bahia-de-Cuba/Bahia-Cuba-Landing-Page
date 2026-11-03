  /* ------------------------------------------------------------------
     12. RUTA DESDE LIMA
     La carretera es un <input type="range"> de verdad (teclado y lector
     de pantalla funcionan solos); aquí solo se le pone el letrero. La
     primera vez que entra en pantalla, el auto hace el viaje solo.
     Kilómetros y tiempos son aproximados y así se dice en la página.
     ------------------------------------------------------------------ */
  (function rutaDesdeLima() {
    var control = $("#rutaKm");
    var widget = $("#ruta-widget");
    if (!control || !widget) return;

    var carretera = $(".carretera", widget);
    var q = function (k) { return $('[data-ruta="' + k + '"]', widget); };
    var paradas = $$(".carretera__paradas li", widget);
    var TOTAL = 297;

    // km, minutos aproximados desde Lima, nota
    var TRAMO = [
      { km: 0, min: 0, lugar: "Lima", nota: "Sales por la Panamericana Norte, rumbo al norte." },
      { km: 43, min: 50, lugar: "Ancón", nota: "Quedan atrás la ciudad y el tráfico; empieza la costa abierta." },
      { km: 148, min: 135, lugar: "Huacho", nota: "Buen punto para parar a comer a mitad de camino." },
      { km: 195, min: 175, lugar: "Barranca", nota: "Pasando Barranca queda el último tramo largo." },
      { km: 293, min: 230, lugar: "Huarmey", nota: "Ya casi: Tuquillo está a pocos minutos." },
      { km: 297, min: 240, lugar: "Hotel Bahía de Cuba", nota: "Llegaste. Búscanos por el letrero amarillo." },
    ];

    function minutosEn(km) {
      for (var i = 1; i < TRAMO.length; i++) {
        var a = TRAMO[i - 1], b = TRAMO[i];
        if (km <= b.km) return a.min + ((km - a.km) / (b.km - a.km)) * (b.min - a.min);
      }
      return 240;
    }

    function tiempo(min) {
      if (min < 1) return "0 h";
      return duracion(min * UN_MIN);
    }

    function pintar() {
      var km = +control.value;
      var actual = 0;
      for (var i = 0; i < TRAMO.length; i++) if (km >= TRAMO[i].km) actual = i;
      var exacto = TRAMO.filter(function (t) { return Math.abs(t.km - km) <= 2; })[0];
      var siguiente = TRAMO[Math.min(actual + 1, TRAMO.length - 1)];

      var lugar = exacto ? exacto.lugar : "Rumbo a " + siguiente.lugar;
      var nota = exacto ? exacto.nota : "Entre " + TRAMO[actual].lugar + " y " + siguiente.lugar + ", con el mar a la izquierda.";
      var falta = TOTAL - km;

      q("lugar").textContent = lugar;
      q("km").textContent = km;
      q("tiempo").textContent = km ? "~" + tiempo(minutosEn(km)) : "0 h";
      q("falta").textContent = falta ? falta + " km" : "0 km";
      q("nota").textContent = nota;
      control.setAttribute("aria-valuetext", lugar + ", kilómetro " + km + ", faltan " + falta + " kilómetros");
      carretera.style.setProperty("--avance", (km / TOTAL).toFixed(4));

      paradas.forEach(function (li, i) {
        var t = TRAMO[i];
        li.toggleAttribute("data-pasada", km >= t.km);
        li.toggleAttribute("data-actual", exacto === t);
      });
    }

    var animacion = null;
    function irA(destino, ms) {
      if (animacion) cancelAnimationFrame(animacion);
      var desde = +control.value;
      if (reduceMotion || !ms) {
        control.value = destino;
        return pintar();
      }
      var t0 = performance.now();
      (function paso(ahora) {
        var p = Math.min(1, (ahora - t0) / ms);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // entra y sale suave
        control.value = Math.round(desde + (destino - desde) * e);
        pintar();
        if (p < 1) animacion = requestAnimationFrame(paso);
        else animacion = null;
      })(t0);
    }

    control.addEventListener("input", function () {
      if (animacion) { cancelAnimationFrame(animacion); animacion = null; }
      pintar();
    });
    $$("button[data-km]", widget).forEach(function (b) {
      b.addEventListener("click", function () {
        var d = +b.dataset.km;
        irA(d, Math.min(1400, 300 + Math.abs(d - control.value) * 5));
      });
    });

    pintar();

    // El viaje solo, una vez, al aparecer
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        setTimeout(function () { irA(TOTAL, 3200); }, 350);
      }, { threshold: 0.6 });
      io.observe(carretera);
    }
  })();
