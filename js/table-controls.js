/*
  Steuerung für die Grenzwerttabelle: Spaltenauswahl (max. 2, zum Vergleichen
  auf schmalen Bildschirmen) und Umschalter Volltext/Abkürzung.
  Reines Vanilla-JS, keine Abhängigkeiten. Ohne JS bleibt die Tabelle
  vollständig sichtbar (progressive enhancement).
*/
(function () {
  "use strict";

  var table = document.getElementById("matrix-table");
  var toggle = document.getElementById("typ-toggle");
  if (!table || !toggle) return;

  var MAX_COLS = 2;
  var order = [];

  function activeChips() {
    return Array.prototype.slice.call(toggle.querySelectorAll(".chip.active"));
  }

  function applyColumns() {
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

  var abbrBtn = document.getElementById("abbr-toggle");
  if (abbrBtn) {
    abbrBtn.addEventListener("click", function () {
      var pressed = abbrBtn.getAttribute("aria-pressed") === "true";
      abbrBtn.setAttribute("aria-pressed", String(!pressed));
      table.classList.toggle("show-abbr", !pressed);
    });
  }
})();
