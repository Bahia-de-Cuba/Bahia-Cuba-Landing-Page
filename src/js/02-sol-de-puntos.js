  /* ------------------------------------------------------------------
     2. SOL DE PUNTOS — el anillo del logo, como sistema de luz
     El del cartel se arma punto a punto al cargar (del centro hacia
     fuera). Los puntos grandes van dentro y se achican hacia el borde,
     como en el logo.
     ------------------------------------------------------------------ */
  (function solDePuntos() {
    var svg = $("#solCartel");
    if (!svg) return;
    var lista = [];
    for (var i = 0; i < 7; i++) {
      lista.push({ r: 96 + i * 30, p: +(13.5 - i * 1.6).toFixed(2), claro: i === 0 });
    }
    anillos(svg, lista, {
      aire: 8,
      retardo: reduceMotion ? null : function (anillo, j, n) {
        // del centro hacia afuera, con un barrido que da la vuelta
        return 0.25 + anillo * 0.075 + (j / n) * 0.18;
      },
    });
  })();
