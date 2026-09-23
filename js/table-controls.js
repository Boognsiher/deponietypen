/*
  Steuerung für die Grenzwerttabelle: Spaltenauswahl (max. 2, zum Vergleichen
  auf schmalen Bildschirmen) und Umschalter Volltext/Abkürzung.
  Auf Desktop (> 640px) sind immer alle Spalten sichtbar - die Auswahl-Chips
  sind dort per CSS ausgeblendet und die Spaltenlogik bleibt inaktiv.
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
  var mq = window.matchMedia("(max-width: 640px)");

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

  // Beim Wechsel über die Bildschirmgrenze (z.B. Fenster verkleinert/vergrössert
  // oder Gerät gedreht) den Sichtbarkeitszustand neu anwenden
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

  var abbrBtn = document.getElementById("abbr-toggle");
  if (abbrBtn) {
    // Auf Mobile ergibt Abkürzung als Startzustand mehr Sinn (schmalere Stoff-Spalte)
    if (mq.matches) {
      abbrBtn.setAttribute("aria-pressed", "true");
      table.classList.add("show-abbr");
    }
    abbrBtn.addEventListener("click", function () {
      var pressed = abbrBtn.getAttribute("aria-pressed") === "true";
      abbrBtn.setAttribute("aria-pressed", String(!pressed));
      table.classList.toggle("show-abbr", !pressed);
    });
  }
})();
