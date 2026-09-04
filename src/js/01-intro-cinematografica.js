  /* ------------------------------------------------------------------
     1. INTRO CINEMATOGRÁFICA
     Se muestra una sola vez por sesión, es saltable y nunca bloquea
     la página más de ~2.6 s.
     ------------------------------------------------------------------ */
  (function intro() {
    var cinema = $("#welcomeCinema");
    if (!cinema) return;

    var yaVista = false;
    try { yaVista = sessionStorage.getItem("bdc-intro") === "1"; } catch (e) {}

    if (yaVista || reduceMotion) {
      cinema.remove();
      return;
    }

    document.body.style.overflow = "hidden";
    var waves = startWaves($("#cinemaWaves"));
    var cerrado = false;

    function cerrar() {
      if (cerrado) return;
      cerrado = true;
      try { sessionStorage.setItem("bdc-intro", "1"); } catch (e) {}
      cinema.classList.add("is-leaving");
      window.setTimeout(function () {
        cinema.remove();
        if (waves) waves.stop();
        document.body.style.overflow = "";
      }, 800);
    }

    $("#btnEnterCinema").addEventListener("click", cerrar);
    cinema.addEventListener("click", cerrar);
    document.addEventListener("keydown", function onKey(ev) {
      if (ev.key === "Escape") { cerrar(); document.removeEventListener("keydown", onKey); }
    });
    window.setTimeout(cerrar, 2600);
  })();

  /** Olas del intro: una simulación ligera en canvas. */
  function startWaves(canvas) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var step = 0;
    var raf = 0;
    var vivo = true;

    var capas = [
      { color: "rgba(255,42,42,0.25)", speed: 1.0, freq: 0.008, amp: 22, y: 40 },
      { color: "rgba(243,179,64,0.35)", speed: 1.5, freq: 0.012, amp: 18, y: 60 },
      { color: "rgba(12,23,34,0.85)", speed: 0.8, freq: 0.006, amp: 26, y: 90 },
      { color: "#070e16", speed: 1.2, freq: 0.009, amp: 30, y: 120 }
    ];

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * 0.45 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!vivo) return;
      var w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      step += 0.02;
      capas.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 12) {
          ctx.lineTo(x, Math.sin(x * l.freq + step * l.speed) * l.amp + l.y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = l.color;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    return {
      stop: function () {
        vivo = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      }
    };
  }
