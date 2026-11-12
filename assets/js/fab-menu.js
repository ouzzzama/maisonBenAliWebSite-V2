/* ==========================================================================
   FLOATING MENU BUTTON
   A fixed coral circle at the bottom centre of the screen. Clicking it morphs
   the circle into a rounded rectangle that holds the main menu list.
   The links are read from the existing desktop nav so they never drift.
   ========================================================================== */
(function () {
  "use strict";

  var source = document.querySelector(".header-area .main-menu > ul");
  if (!source || document.querySelector(".mb-fab")) return;

  var links = Array.prototype.slice.call(
    source.querySelectorAll(":scope > li > a")
  );
  if (!links.length) return;

  /* subtitles mirror the desktop overlay menu */
  var SUBS = {
    "/": "L'excellence immobilière à Agadir",
    "/a-propos": "11 ans d'expertise, une éthique rigoureuse",
    "/ecosysteme-360": "Transaction, conciergerie VIP, Benali Cars",
    "/proprietes-projets": "Villas, résidences et VEFA à Agadir",
    "/contact": "Estimation gratuite, réponse sous 24 h"
  };

  var fab = document.createElement("div");
  fab.className = "mb-fab";

  var shape = document.createElement("div");
  shape.className = "mb-fab__shape";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mb-fab__btn";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "mbFabPanel");
  btn.setAttribute("aria-label", "Ouvrir le menu");
  btn.innerHTML = '<span class="mb-fab__bars"><i></i><i></i><i></i></span>';

  var panel = document.createElement("nav");
  panel.className = "mb-fab__panel";
  panel.id = "mbFabPanel";
  panel.setAttribute("aria-hidden", "true");

  var list = document.createElement("ul");
  list.className = "mb-fab__list";

  links.forEach(function (a, i) {
    var li = document.createElement("li");
    var href = a.getAttribute("href") || "#";
    var path = href;
    try { path = new URL(href, window.location.href).pathname; } catch (e) {}

    /* the overlay script decorates the same nav links (number + subtitle),
       so read the bare label instead of the whole link text */
    var strong = a.querySelector(".mb-mob__text strong");
    var label = (strong ? strong.textContent : a.textContent).trim();

    li.innerHTML =
      '<a href="' + href + '">' +
        '<span class="mb-fab__num">' + ("0" + (i + 1)).slice(-2) + "</span>" +
        '<span class="mb-fab__text">' +
          "<strong>" + escText(label) + "</strong>" +
          (SUBS[path] ? "<em>" + escText(SUBS[path]) + "</em>" : "") +
        "</span>" +
        '<i class="far fa-arrow-right" aria-hidden="true"></i>' +
      "</a>";

    if (path === window.location.pathname) {
      li.querySelector("a").classList.add("is-current");
      li.querySelector("a").setAttribute("aria-current", "page");
    }
    list.appendChild(li);
  });

  function escText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  panel.appendChild(list);
  shape.appendChild(btn);
  shape.appendChild(panel);
  fab.appendChild(shape);

  /* four quick actions around the circle: two on the left, two on the right */
  var QUICK = [
    { label: "Séjours Airbnb", icon: "fab fa-airbnb", href: "proprietes-projets" },
    { label: "Location de voiture", icon: "fas fa-car", href: "ecosysteme-360" },
    { label: "Appeler l'agence", icon: "fas fa-phone", href: "tel:+212661191787" },
    { label: "Écrire sur WhatsApp", icon: "fab fa-whatsapp", href: "https://wa.me/212661191787" }
  ];

  function quickLink(item) {
    var a = document.createElement("a");
    a.className = "mb-fab__quick-btn";
    a.href = item.href;
    a.setAttribute("aria-label", item.label);
    a.setAttribute("title", item.label);
    if (/^https?:/i.test(item.href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.innerHTML = '<i class="' + item.icon + '" aria-hidden="true"></i>';
    return a;
  }

  var quickLeft = document.createElement("div");
  quickLeft.className = "mb-fab__quick mb-fab__quick--left";
  var quickRight = document.createElement("div");
  quickRight.className = "mb-fab__quick mb-fab__quick--right";
  QUICK.slice(0, 2).forEach(function (item) { quickLeft.appendChild(quickLink(item)); });
  QUICK.slice(2).forEach(function (item) { quickRight.appendChild(quickLink(item)); });
  fab.appendChild(quickLeft);
  fab.appendChild(quickRight);
  document.body.appendChild(fab);
  document.documentElement.classList.add("mb-has-fab");

  function applySize() {
    var narrow = window.innerWidth <= 480;
    var width = Math.min(340, window.innerWidth - 28);

    shape.style.width = width + "px";
    /* the panel keeps the same inset on every side as the stylesheet, so the
       copy never touches the card edge; width must follow that inset */
    var insetX = narrow ? 16 : 18;
    panel.style.left = insetX + "px";
    panel.style.right = insetX + "px";
    /* measure the list at its final width, otherwise it is still wrapped
       for the collapsed 66px circle and the panel opens far too tall */
    panel.style.width = width - insetX * 2 + "px";

    /* list on top, the circle keeps its place at the bottom centre */
    var pad = narrow ? 96 : 102;
    var h = Math.min(list.offsetHeight + pad, window.innerHeight - 48);
    shape.style.height = h + "px";
    shape.style.borderRadius = (narrow ? 24 : 26) + "px";
  }

  function setOpen(open) {
    fab.classList.toggle("is-open", open);

    if (open) {
      applySize();
    } else {
      shape.style.width = "";
      shape.style.height = "";
      shape.style.borderRadius = "";
      panel.style.width = "";
    }

    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    panel.setAttribute("aria-hidden", String(!open));
  }

  btn.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!fab.classList.contains("is-open"));
  });

  document.addEventListener("click", function (event) {
    if (fab.classList.contains("is-open") && !fab.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (fab.classList.contains("is-open")) applySize();
  });
})();
