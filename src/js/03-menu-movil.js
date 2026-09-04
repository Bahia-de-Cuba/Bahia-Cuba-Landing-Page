  /* ------------------------------------------------------------------
     3. MENÚ LATERAL MÓVIL (accesible: Esc, foco y aria-expanded)
     ------------------------------------------------------------------ */
  (function drawer() {
    var abrir = $("#btnOpenDrawer");
    var cerrarBtn = $("#btnCloseDrawer");
    var panel = $("#sideDrawer");
    var overlay = $("#drawerOverlay");
    if (!abrir || !panel || !overlay) return;

    function set(estado) {
      panel.dataset.state = estado;
      overlay.dataset.state = estado;
      abrir.setAttribute("aria-expanded", String(estado === "open"));
      document.body.style.overflow = estado === "open" ? "hidden" : "";
      if (estado === "open") cerrarBtn.focus();
      else abrir.focus();
    }

    abrir.addEventListener("click", function () { set("open"); });
    cerrarBtn.addEventListener("click", function () { set("closed"); });
    overlay.addEventListener("click", function () { set("closed"); });
    $$(".drawer-item", panel).forEach(function (a) {
      a.addEventListener("click", function () { set("closed"); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && panel.dataset.state === "open") set("closed");
    });
  })();
