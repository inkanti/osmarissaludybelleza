/* ==========================================================================
   Osmari's · Beautiful Face & Health — prototipo
   Interacciones: navegación, animaciones y generación de cita por WhatsApp
   ========================================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "50376822944"; // +503 7682-2944

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- menú móvil ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- filtro de cócteles ---------- */
  var filterChips = document.querySelectorAll("[data-filter]");
  if (filterChips.length) {
    filterChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var key = chip.getAttribute("data-filter");
        filterChips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        document.querySelectorAll("[data-cat]").forEach(function (card) {
          var match = key === "todos" || card.getAttribute("data-cat").indexOf(key) > -1;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---------- cita -> WhatsApp ---------- */
  var form = document.getElementById("booking-form");
  if (form) {
    var summary = document.getElementById("summary");
    var update = function () {
      if (!summary) return;
      var d = new FormData(form);
      if (!d.get("servicio")) {
        summary.textContent = "Selecciona un servicio para ver el resumen.";
        return;
      }
      var parts = [];
      var svc = d.get("servicio");
      var mode = d.get("modalidad");
      var date = d.get("fecha");
      var nombre = (d.get("nombre") || "").toString().trim();
      if (svc) parts.push("<strong>" + svc + "</strong>");
      if (mode) parts.push(mode);
      if (date) parts.push(date);
      parts.push(nombre || "falta el nombre");
      summary.innerHTML = parts.join(" · ");
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();

    /* --- validación con avisos propios --- */
    var showError = function (input, errorId) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      var err = document.getElementById(errorId);
      if (err) err.classList.add("is-shown");
    };
    var clearError = function (input, errorId) {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      var err = document.getElementById(errorId);
      if (err) err.classList.remove("is-shown");
    };

    var nombreInput = form.querySelector("#nombre");
    var servicioInput = form.querySelector("#servicio");

    if (nombreInput) {
      nombreInput.addEventListener("input", function () {
        if (nombreInput.value.trim().length >= 2) clearError(nombreInput, "error-nombre");
      });
    }
    if (servicioInput) {
      servicioInput.addEventListener("change", function () {
        if (servicioInput.value) clearError(servicioInput, "error-servicio");
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var service = (d.get("servicio") || "").toString().trim();
      var nombre = (d.get("nombre") || "").toString().trim().replace(/\s+/g, " ");
      var tel = (d.get("telefono") || "").toString().trim();
      var nota = (d.get("nota") || "").toString().trim();

      var firstInvalid = null;
      if (!service) {
        showError(servicioInput, "error-servicio");
        firstInvalid = firstInvalid || servicioInput;
      }
      if (nombre.length < 2) {
        showError(nombreInput, "error-nombre");
        firstInvalid = firstInvalid || nombreInput;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      var msg =
        "Hola Osmari's 👋 Soy " + nombre + " y quiero agendar una cita.\n\n" +
        "• Servicio: " + service + "\n" +
        "• Modalidad: " + (d.get("modalidad") || "En el estudio") + "\n" +
        "• Fecha preferida: " + (d.get("fecha") || "por coordinar") + "\n" +
        "• Hora preferida: " + (d.get("hora") || "por coordinar") + "\n" +
        (tel ? "• Mi WhatsApp: " + tel + "\n" : "") +
        (nota ? "• Nota: " + nota + "\n" : "") +
        "\n¿Me confirman disponibilidad? Gracias.";
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  /* ---------- año dinámico ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
