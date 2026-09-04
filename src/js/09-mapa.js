  /* ------------------------------------------------------------------
     9. MAPA BAJO DEMANDA
     ------------------------------------------------------------------ */
  (function mapa() {
    var btn = $("#btnLoadMap");
    var shell = $("#mapShell");
    if (!btn || !shell) return;

    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      // Coordenadas exactas del hotel (Plus Code 57X3XRM5+M7) para que el
      // marcador caiga en la puerta y no en el centro de Huarmey.
      iframe.src = "https://maps.google.com/maps?q=" +
        encodeURIComponent("loc:-10.0158125,-78.1918125 (Hotel Bahía de Cuba)") +
        "&z=17&hl=es&output=embed";
      iframe.title = "Mapa: Hotel Bahía de Cuba, Playa Tuquillo, Huarmey";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      btn.remove();
      shell.appendChild(iframe);
    });
  })();
