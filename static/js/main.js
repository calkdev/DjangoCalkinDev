// Front end bits for the CalkinDev site: the light/dark theme button and
// the menu button on phones. Everything else is done by Django on the server.

document.addEventListener("DOMContentLoaded", function () {
  // ── Theme toggle ──
  // base.html already put the saved theme on before the page drew,
  // this just keeps the icon matching and handles clicks.
  var toggle = document.getElementById("theme-toggle");
  var icon = document.querySelector("#theme-toggle .icon i");

  function showIcon(theme) {
    if (icon) icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
  showIcon(document.documentElement.getAttribute("data-theme") || "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      showIcon(next);
    });
  }

  // ── Mobile menu ──
  var burger = document.querySelector(".navbar-burger");
  var menu = document.getElementById("navMenu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = !burger.classList.contains("is-active");
      burger.classList.toggle("is-active", open);
      menu.classList.toggle("is-active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu again once a link has been picked
    menu.querySelectorAll("a.nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        burger.classList.remove("is-active");
        menu.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
});
