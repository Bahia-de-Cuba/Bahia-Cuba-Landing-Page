  /* ------------------------------------------------------------------
     4. MENÚ MÓVIL (Esc, foco atrapado y aria-expanded)
     ------------------------------------------------------------------ */
  (function menuMovil() {
    var abrir = $("#abrirMenu");
    var cerrar = $("#cerrarMenu");
    var panel = $("#menuMovil");
    if (!abrir || !panel || !cerrar) return;

    function enfocables() {
      return $$("a, button", panel);
    }

    function set(abierto) {
      abrir.setAttribute("aria-expanded", String(abierto));
      document.body.style.overflow = abierto ? "hidden" : "";
      if (abierto) {
        panel.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { panel.dataset.estado = "abierto"; });
        });
        cerrar.focus();
      } else {
        panel.dataset.estado = "cerrado";
        var fin = function () { if (panel.dataset.estado === "cerrado") panel.hidden = true; };
        if (reduceMotion) fin();
        else setTimeout(fin, 320);
        abrir.focus();
      }
    }

    abrir.addEventListener("click", function () { set(true); });
    cerrar.addEventListener("click", function () { set(false); });
    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
    panel.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") return set(false);
      if (ev.key !== "Tab") return;
      var f = enfocables(), primero = f[0], ultimo = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
    });
  })();
