/*
  Steuerung für die Grenzwerttabellen: Spaltenauswahl (max. 2, zum
  Vergleichen auf schmalen Bildschirmen) und Umschalter Volltext/Abkürzung
  für die Hauptmatrix. Auf Desktop (> 640px) sind immer alle Spalten
  sichtbar - die Auswahl-Chips sind dort per CSS ausgeblendet.
  Reines Vanilla-JS, keine Abhängigkeiten. Ohne JS bleiben alle Tabellen
  vollständig sichtbar (progressive enhancement).
*/
(function () {
  "use strict";

  var MAX_COLS = 2;
  var mq = window.matchMedia("(max-width: 640px)");

  function initColumnControl(panel) {
    var table = document.getElementById(panel.dataset.target);
    var toggle = panel.querySelector(".chip-toggle");
    if (!table || !toggle) return;

    var order = [];

    function activeChips() {
      return Array.prototype.slice.call(toggle.querySelectorAll(".chip.active"));
    }

    function showAllColumns() {
      var cells = table.querySelectorAll("[data-col]");
      for (var i = 0; i < cells.length; i++) cells[i].removeAttribute("hidden");
    }

    function applyColumns() {
      if (!mq.matches) {
        showAllColumns();
        return;
      }
      var activeCols = activeChips().map(function (b) { return b.dataset.col; });
      var cells = table.querySelectorAll("[data-col]");
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (activeCols.indexOf(cell.dataset.col) > -1) {
          cell.removeAttribute("hidden");
        } else {
          cell.setAttribute("hidden", "");
        }
      }
    }

    // Startzustand aus den im HTML als "active" markierten Chips übernehmen
    activeChips().forEach(function (b) { order.push(b.dataset.col); });
    applyColumns();

    // Beim Wechsel über die Bildschirmgrenze (Fenstergrösse/Drehung) neu anwenden
    if (mq.addEventListener) {
      mq.addEventListener("change", applyColumns);
    } else if (mq.addListener) {
      mq.addListener(applyColumns); // Safari < 14
    }

    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn || !toggle.contains(btn)) return;

      if (btn.classList.contains("active")) {
        if (activeChips().length <= 1) return; // mindestens eine Spalte muss sichtbar bleiben
        btn.classList.remove("active");
        order = order.filter(function (c) { return c !== btn.dataset.col; });
      } else {
        if (activeChips().length >= MAX_COLS) {
          var oldestCol = order.shift();
          var oldestBtn = toggle.querySelector('.chip[data-col="' + oldestCol + '"]');
          if (oldestBtn) oldestBtn.classList.remove("active");
        }
        btn.classList.add("active");
        order.push(btn.dataset.col);
      }
      applyColumns();
    });
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".table-controls[data-target]"),
    initColumnControl
  );

  // Abkürzungs-Umschalter: nur für die Hauptmatrix (Aushub/Deponietypen)
  var mainTable = document.getElementById("matrix-table");
  var abbrBtn = document.getElementById("abbr-toggle");
  if (mainTable && abbrBtn) {
    // Auf Mobile ergibt Abkürzung als Startzustand mehr Sinn (schmalere Stoff-Spalte)
    if (mq.matches) {
      abbrBtn.setAttribute("aria-pressed", "true");
      mainTable.classList.add("show-abbr");
    }
    abbrBtn.addEventListener("click", function () {
      var pressed = abbrBtn.getAttribute("aria-pressed") === "true";
      abbrBtn.setAttribute("aria-pressed", String(!pressed));
      mainTable.classList.toggle("show-abbr", !pressed);
    });
  }
})();
