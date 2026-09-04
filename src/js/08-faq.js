  /* ------------------------------------------------------------------
     8. ACORDEÓN DE PREGUNTAS FRECUENTES
     ------------------------------------------------------------------ */
  (function faq() {
    var botones = $$(".faq-toggle");
    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var abierto = item.classList.contains("is-open");

        $$(".faq-item.is-open").forEach(function (el) {
          el.classList.remove("is-open");
          $(".faq-toggle", el).setAttribute("aria-expanded", "false");
        });

        if (!abierto) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();
