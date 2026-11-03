  /* ------------------------------------------------------------------
     8. ¿CON QUIÉN VIAJAS? — recomienda la habitación
     Con quién y cuántos → el cuarto que les queda, con su precio vivo.
     Marca en la cartelera los que sirven y apaga los que no, y deja el
     cotizador listo con la misma elección.
     ------------------------------------------------------------------ */
  (function conQuienViajas() {
    var form = $("#buscador");
    if (!form) return;

    var nEl = $("#buscadorN");
    var menos = $('[data-paso="-1"]', form);
    var mas = $('[data-paso="1"]', form);
    var mascota = $("#buscadorMascota");
    var veredicto = $("#veredicto");
    var filas = $$(".fila");
    var v = function (k) { return $('[data-veredicto="' + k + '"]', veredicto); };

    var CAP = { Individual: 1, Matrimonial: 2, Doble: 3, Triple: 4, Familiar: 6 };
    var CAMAS = {
      Individual: "1 cama de 1.5 plazas, silenciosa para descansar o trabajar.",
      Matrimonial: "1 cama de 2 plazas, para descansar en pareja.",
      Doble: "1 cama de 2 plazas + camarote.",
      Triple: "3 camas individuales: cada uno en la suya.",
      Familiar: "2 camarotes: todos juntos en un mismo cuarto.",
    };
    var POR_DEFECTO = { solo: 1, pareja: 2, amigos: 3, familia: 4 };
    var n = 2;
    var quien = "pareja";

    /** La regla: el cuarto más ajustado que les sirve, según con quién van */
    function elegir() {
      if (n <= 1) return "Individual";
      if (n === 2) {
        if (quien === "amigos") return "Doble";
        return "Matrimonial";
      }
      if (n === 3) return quien === "amigos" ? "Triple" : "Doble";
      if (n === 4) return "Triple";
      return "Familiar";
    }

    function razon(tipo) {
      if (tipo === "Doble" && quien === "amigos") return "1 cama de 2 plazas + camarote: cada uno en su cama.";
      if (tipo === "Doble" && n === 3) return "1 cama de 2 plazas + camarote, para los tres.";
      if (tipo === "Triple" && n === 4) return "3 camas individuales, para hasta 4 personas.";
      if (tipo === "Familiar") return "2 camarotes: hasta 6 personas en un mismo cuarto.";
      return CAMAS[tipo];
    }

    function actualizar(animar) {
      nEl.textContent = n;
      menos.disabled = n <= 1;
      mas.disabled = n >= 6;

      var tipo = elegir();
      var precio = precioDe(tipo);
      v("nombre").textContent = tipo;
      v("razon").textContent = razon(tipo);
      v("precio").textContent = precio;
      v("reservar").href = URL_RESERVAS + "?tipo=" + tipo.toLowerCase();
      v("mascota").hidden = !mascota.checked;
      if (animar) {
        veredicto.removeAttribute("data-cambio");
        void veredicto.offsetWidth;
        veredicto.setAttribute("data-cambio", "");
      }

      filas.forEach(function (f) {
        var cap = CAP[f.dataset.room];
        f.dataset.encaja = cap >= n ? "si" : "no";
        if (f.dataset.room === tipo) f.setAttribute("data-recomendada", "");
        else f.removeAttribute("data-recomendada");
      });

      // El cotizador queda con la misma elección
      var room = $("#cRoom"), guests = $("#cGuests");
      if (room && guests && animar) {
        room.value = tipo;
        guests.value = String(n);
        room.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); });
    form.addEventListener("change", function (e) {
      if (e.target.name === "quien") {
        quien = e.target.value;
        n = POR_DEFECTO[quien];
      }
      actualizar(true);
    });
    [menos, mas].forEach(function (b) {
      b.addEventListener("click", function () {
        n = Math.min(6, Math.max(1, n + parseInt(b.dataset.paso, 10)));
        if (n === 1) {
          quien = "solo";
          $('input[value="solo"]', form).checked = true;
        } else if (quien === "solo") {
          quien = n === 2 ? "pareja" : "amigos";
          $('input[value="' + quien + '"]', form).checked = true;
        }
        actualizar(true);
      });
    });
    document.addEventListener("bdc:tarifas", function () { actualizar(false); });

    actualizar(false);
  })();
