/* ==========================================================================
   NAVBAR OVERLAY MENU
   Adds a left-hand hamburger to the white header pill. Clicking it unfolds
   the bar into a full menu: big titles + subtitles on the left, and a media
   panel on the right whose image changes as you hover the titles.
   A round orange X sits at the bottom centre of the panel to close it; on
   mobile the same control closes the orange panel and the hamburger returns.
   ========================================================================== */
(function () {
  "use strict";

  var nav = document.querySelector(".header-area .header-navigation");
  var primary = nav && nav.querySelector(".primary-menu");
  if (!nav || !primary || nav.querySelector(".mb-mega")) return;

  var header = nav.closest(".header-area");

  var ITEMS = [
    {
      href: "/",
      title: "Accueil",
      sub: "L'excellence immobilière à Agadir",
      img: "assets/images/gallery/agadir-bay-residence.jpg"
    },
    {
      href: "a-propos",
      title: "À propos",
      sub: "11 ans d'expertise, une éthique rigoureuse",
      img: "assets/images/home-one/about/about-agadir-bay-pool.jpg"
    },
    {
      href: "ecosysteme-360",
      title: "L'Écosystème 360°",
      sub: "Transaction, conciergerie VIP, Benali Cars",
      img: "assets/images/gallery/agadir-bay-plaza.jpg"
    },
    {
      href: "proprietes-projets",
      title: "Propriétés & Projets",
      sub: "Villas, résidences et VEFA à Agadir",
      img: "assets/images/featured-projects/featured-1.jpg"
    },
    {
      href: "contact",
      title: "Contact",
      sub: "Estimation gratuite, réponse sous 24 h",
      img: "assets/images/innerpage/contact/agence-maison-benali.jpg"
    }
  ];

  /* ---- hamburger button (left side of the pill) ---- */
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mb-menu-toggle";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "mbMegaMenu");
  btn.setAttribute("aria-label", "Ouvrir le menu");
  btn.innerHTML =
    '<span class="mb-menu-toggle__bars"><i></i><i></i><i></i></span>' +
    '<span class="mb-menu-toggle__txt">Menu</span>';

  var brand = primary.querySelector(".site-branding");
  primary.insertBefore(btn, primary.firstElementChild || brand);

  /* ---- overlay panel ---- */
  var mega = document.createElement("div");
  mega.className = "mb-mega";
  mega.id = "mbMegaMenu";
  mega.setAttribute("aria-hidden", "true");

  var items = ITEMS.map(function (it, i) {
    return (
      '<li class="mb-mega__item" data-index="' + i + '">' +
        '<a href="' + it.href + '">' +
          '<span class="mb-mega__num">' + ("0" + (i + 1)).slice(-2) + "</span>" +
          '<span class="mb-mega__text">' +
            "<strong>" + it.title + "</strong>" +
            "<em>" + it.sub + "</em>" +
          "</span>" +
          '<i class="far fa-arrow-right" aria-hidden="true"></i>' +
        "</a>" +
      "</li>"
    );
  }).join("");

  mega.innerHTML =
    '<div class="mb-mega__clip">' +
      '<div class="mb-mega__grid">' +
        '<ul class="mb-mega__list">' + items + "</ul>" +
        '<div class="mb-mega__media">' +
          '<img class="is-active" alt="" src="' + ITEMS[0].img + '" />' +
          "<img alt=\"\" />" +
          '<div class="mb-mega__caption">' +
            '<span class="mb-mega__caption-title">' + ITEMS[0].title + "</span>" +
            '<span class="mb-mega__caption-sub">' + ITEMS[0].sub + "</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";

  nav.appendChild(mega);

  /* ---- image crossfade ---- */
  var layers = mega.querySelectorAll(".mb-mega__media img");
  var layerA = layers[0];
  var layerB = layers[1];
  var front = layerA;
  var captionTitle = mega.querySelector(".mb-mega__caption-title");
  var captionSub = mega.querySelector(".mb-mega__caption-sub");

  function showItem(index) {
    var data = ITEMS[index];
    if (!data) return;
    if (captionTitle) captionTitle.textContent = data.title;
    if (captionSub) captionSub.textContent = data.sub;
    if (front.getAttribute("src") === data.img) return;
    var back = front === layerA ? layerB : layerA;
    back.setAttribute("src", data.img);
    back.classList.add("is-active");
    front.classList.remove("is-active");
    front = back;
  }

  mega.querySelectorAll(".mb-mega__item").forEach(function (li) {
    var i = parseInt(li.getAttribute("data-index"), 10) || 0;
    li.addEventListener("mouseenter", function () { showItem(i); });
    li.addEventListener("focusin", function () { showItem(i); });
  });

  /* ---- open / close ---- */
  function setOpen(open) {
    header.classList.toggle("is-menu-open", open);
    mega.classList.toggle("is-open", open);
    mega.setAttribute("aria-hidden", String(!open));
    btn.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }

  btn.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!mega.classList.contains("is-open"));
  });

  document.addEventListener("click", function (event) {
    if (mega.classList.contains("is-open") && !mega.contains(event.target) && !btn.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("scroll", function () {
    if (mega.classList.contains("is-open") && (window.scrollY || document.documentElement.scrollTop) > 30) {
      setOpen(false);
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (window.innerWidth < 1200) setOpen(false);
  });

  /* ---- mobile: numbered rows like the desktop overlay, burger closes ---- */
  var mobileMenu = document.querySelector(".header-area .theme-nav-menu");

  if (mobileMenu) {
    var mobileLinks = mobileMenu.querySelectorAll(".main-menu > ul > li > a");

    Array.prototype.forEach.call(mobileLinks, function (a, i) {
      if (a.querySelector(".mb-mob__num")) return;

      var label = a.textContent.trim();
      var path = "";
      try { path = new URL(a.getAttribute("href") || "#", window.location.href).pathname; } catch (e) {}

      var sub = "";
      ITEMS.forEach(function (item) {
        var candidate = "";
        try { candidate = new URL(item.href, window.location.href).pathname; } catch (e) {}
        if (candidate === path) sub = item.sub;
      });

      a.innerHTML =
        '<span class="mb-mob__num">' + ("0" + (i + 1)).slice(-2) + "</span>" +
        '<span class="mb-mob__text">' +
          "<strong>" + label + "</strong>" +
          (sub ? "<em>" + sub + "</em>" : "") +
        "</span>" +
        '<i class="far fa-arrow-right mb-mob__arrow" aria-hidden="true"></i>';
      a.classList.add("mb-mob__link");
    });
  }
})();


/* -------------------------------------------------------------------------
   Footer guard: drop the bottom screen blur once the footer is in view.
   ------------------------------------------------------------------------- */
(function () {
  var footer = document.getElementById("mainFooter") || document.querySelector("footer");
  if (!footer || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    document.documentElement.classList.toggle("mb-footer-in-view", entries[0].isIntersecting);
  }, { rootMargin: "0px 0px -45% 0px", threshold: 0 });

  observer.observe(footer);
})();


/* -------------------------------------------------------------------------
   Logo contrast guard — on small screens the header sits transparent over the
   page, so the wordmark flips to its white artwork whenever the surface
   behind it is dark (navy heroes, dark sections), and back on light pages.
   ------------------------------------------------------------------------- */
(function () {
  var header = document.querySelector(".header-area");
  if (!header) return;
  var logo = header.querySelector(".brand-logo img");
  if (!logo) return;

  var LIGHT_SRC = logo.getAttribute("src");
  var DARK_SRC = "assets/images/home-one/logo/maison-benali-logo-white.svg";
  var isDark = null;

  function parse(color) {
    var m = String(color).match(/rgba?(([^)]+))/);
    if (!m) return null;
    var parts = m[1].split(",").map(function (v) { return parseFloat(v); });
    if (parts.length < 3) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  /* The header is see-through on phones and only visible over the page top,
     so the surface that matters is the page's first hero block. */
  function surfaceIsDark() {
    var nodes = document.querySelectorAll('[class*="hero"], main > section, body > section');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (header.contains(el) || !el.getClientRects().length) continue;
      var c = parse(getComputedStyle(el).backgroundColor);
      if (!c || c.a < 0.55) continue;
      var lum = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
      return lum < 0.45;
    }
    return null;
  }

  function set(dark) {
    if (dark === isDark) return;
    isDark = dark;
    header.classList.toggle("is-on-dark", !!dark);
    var next = dark ? DARK_SRC : LIGHT_SRC;
    if (logo.getAttribute("src") !== next) logo.setAttribute("src", next);
  }

  function update() {
    if (window.innerWidth > 1199.98) { set(false); return; }
    var dark = surfaceIsDark();
    if (dark !== null) set(dark);
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    /* plain timer: requestAnimationFrame is paused while the tab is hidden */
    timer = setTimeout(function () { timer = null; update(); }, 80);
  }

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  [250, 800, 1600, 2600].forEach(function (delay) {
    setTimeout(update, delay);
  });
})();
