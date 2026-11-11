/* ==========================================================================
   PROJECT DETAILS — reference rebuild
   Rearranges the existing page data into three sections:
     1. split hero with stats + thumbnail gallery
     2. “values” 3x2 numbered card grid
     3. floor-plan tabs with an image and a specification panel
   The original sections are hidden, so if this script does not run the old
   page still renders.
   ========================================================================== */
(function () {
  "use strict";

  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function build() {
    var sec = document.querySelector(".renvia-project-details-sec");
    var oldHero = document.querySelector(".page-hero");
    if (!sec || document.querySelector(".bp-page")) return;

    var title = txt(sec.querySelector(".project-content .title")) || "Résidence";
    var location = txt(sec.querySelector(".project-content .location"));
    var paras = Array.prototype.map.call(
      sec.querySelectorAll(".project-content > p"),
      function (p) { return txt(p); }
    ).filter(Boolean);

    var facts = Array.prototype.map.call(
      sec.querySelectorAll(".project-meta-list .renvia-info-item"),
      function (item) {
        return {
          label: txt(item.querySelector("span")),
          value: txt(item.querySelector("h6")),
          icon: (item.querySelector("img") || {}).src || ""
        };
      }
    ).filter(function (f) { return f.label || f.value; });

    var amenities = Array.prototype.map.call(
      sec.querySelectorAll(".features-amenities-list .renvia-info-item"),
      function (item) {
        return {
          label: txt(item.querySelector("h6")),
          value: txt(item.querySelector("p")),
          icon: (item.querySelector("img") || {}).src || ""
        };
      }
    ).filter(function (a) { return a.label || a.value; });

    var mainImg = sec.querySelector(".project-thumbnail > img") ||
      sec.querySelector(".project-hero-row img") ||
      document.querySelector(".page-hero");

    var gallery = [];
    Array.prototype.forEach.call(sec.querySelectorAll('#tab1 .renvia-image img'), function (img) {
      if (gallery.indexOf(img.src) === -1) gallery.push(img.src);
    });

    var heroSrc = mainImg && mainImg.src ? mainImg.src : (gallery[0] || "");
    var thumbs = [heroSrc].concat(gallery).filter(Boolean).slice(0, 4);
    while (thumbs.length < 4 && gallery.length) thumbs.push(gallery[thumbs.length % gallery.length]);

    var statIcons = ["far fa-users", "far fa-house-chimney", "far fa-user-tie"];
    var numericFacts = facts.filter(function (f) { return /[0-9]/.test(f.value); });
    var stats = (numericFacts.length >= 3 ? numericFacts : facts).slice(0, 3);
    var statHtml = stats.map(function (f, i) {
      return '<li class="bp-stat">' +
        '<span class="bp-stat-icon"><i class="' + statIcons[i % statIcons.length] + '" aria-hidden="true"></i></span>' +
        '<span class="bp-stat-body"><strong>' + esc(f.value) + '</strong><small>' + esc(f.label) + '</small></span>' +
        '</li>';
    }).join("");

    var thumbHtml = thumbs.map(function (src, i) {
      return '<button type="button" class="bp-thumb' + (i === 0 ? " is-active" : "") + '" data-src="' + esc(src) + '" aria-label="Voir la photo ' + (i + 1) + '">' +
        '<img src="' + esc(src) + '" alt="" loading="lazy">' +
        '</button>';
    }).join("");

    var labelMap = {
      "id no.": "Identifiant",
      "type": "Typologie",
      "bedroom": "Chambres",
      "bath": "Salles de bain",
      "sqft": "Surface habitable",
      "purpose": "Usage",
      "wi-fi": "Wi-Fi inclus",
      "wifi": "Wi-Fi inclus",
      "smart t.": "Domotique",
      "parking": "Parking privé",
      "build year": "Année de livraison"
    };

    var valueMap = {
      "apartment": "Appartement",
      "for sell": "À la vente",
      "yes": "Oui",
      "no": "Non"
    };

    var phraseMap = {
      "chambres": "spacieuses, pensées pour le confort familial.",
      "salles de bain": "en pierre naturelle et marbre poli.",
      "surface habitable": "optimisée, lumineuse et traversante.",
      "parking privé": "en sous-sol, accès sécurisé par badge.",
      "année de livraison": "livraison avec finitions haut de gamme.",
      "typologie": "pensée pour répondre à tous les usages.",
      "identifiant": "référence unique du bien Maison Benali.",
      "usage": "idéal pour l'habitation ou l'investissement.",
      "wi-fi inclus": "fibre optique disponible dans chaque pièce.",
      "domotique": "équipements connectés pilotables à distance."
    };

    function frenchLabel(raw) {
      var key = String(raw || "").toLowerCase();
      return labelMap[key] || raw;
    }

    function frenchValue(raw) {
      var key = String(raw || "").toLowerCase();
      return valueMap[key] || raw;
    }

    var valueIconMap = {
      "identifiant": "tag",
      "typologie": "building",
      "chambres": "bed",
      "salles de bain": "bath",
      "surface habitable": "ruler",
      "superficie totale": "ruler",
      "superficie logement": "ruler",
      "usage": "key",
      "parking privé": "car",
      "parking": "car",
      "année de livraison": "calendar",
      "année de construction": "calendar",
      "wi-fi inclus": "wifi",
      "domotique": "chip"
    };

    function valueIcon(label) {
      var key = String(label || "").toLowerCase();
      var name = valueIconMap[key] ||
        (/chambre/.test(key) ? "bed" :
          /bain|bath/.test(key) ? "bath" :
            /surface|superficie/.test(key) ? "ruler" : "home");
      return window.mbMinimalIcon ? window.mbMinimalIcon(name, 24) : "";
    }

    var valueItems = amenities.slice(0, 6);
    while (valueItems.length < 6 && facts.length) valueItems.push(facts[valueItems.length % facts.length]);
    var valueHtml = valueItems.slice(0, 6).map(function (item, i) {
      var num = ("0" + (i + 1)).slice(-2);
      var label = frenchLabel(item.label);
      var value = frenchValue(item.value);
      var phrase = phraseMap[String(label || "").toLowerCase()] || "";
      return '<article class="bp-value">' +
        '<div class="bp-value-copy">' +
          '<span class="bp-value-num">' + num + '</span>' +
          '<h3>' + esc(label) + '</h3>' +
          '<p><strong>' + esc(value) + '</strong>' + (phrase ? " — " + esc(phrase) : "") + '</p>' +
        '</div>' +
        '<span class="bp-value-icon">' + valueIcon(label) + '</span>' +
        '</article>';
    }).join("");

    var planImages = gallery.length ? gallery : [heroSrc];
    var planTitles = ["Rez-de-chaussée", "Premier étage", "Deuxième étage", "Terrasse"];
    var tabsHtml = planTitles.map(function (label, i) {
      return '<button type="button" class="bp-plan-tab' + (i === 0 ? " is-active" : "") + '" data-index="' + i + '">' +
        '<img src="' + esc(planImages[i % planImages.length]) + '" alt="" loading="lazy">' +
        '<span>' + esc(label) + '</span>' +
        '</button>';
    }).join("");

    function amenity() {
      for (var a = 0; a < arguments.length; a++) {
        for (var i = 0; i < amenities.length; i++) {
          if (amenities[i].label.toLowerCase().indexOf(arguments[a]) !== -1) return frenchValue(amenities[i].value);
        }
      }
      return "—";
    }

    var specs = [
      ["Superficie totale", amenity("sqft")],
      ["Chambres", amenity("bedroom")],
      ["Salles de bain", amenity("bath")],
      ["Parking", amenity("parking")],
      ["Wi-Fi", amenity("wifi", "wi-fi")],
      ["Année de livraison", amenity("build year")]
    ];

    var specsHtml = specs.map(function (row) {
      return '<div class="bp-spec"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
    }).join("");

    var body = paras[0] || "Une réalisation Maison Benali pensée pour allier élégance, confort et art de vivre.";
    var shortBody = paras[1] || body;

    var page = document.createElement("div");
    page.className = "bp-page";
    page.innerHTML =
      '<section class="bp-hero-sec">' +
        '<div class="container">' +
          '<div class="bp-hero-grid">' +
            '<figure class="bp-hero-media"><img id="bpMainImage" src="' + esc(heroSrc) + '" alt="' + esc(title) + '"></figure>' +
            '<div class="bp-hero-copy">' +
              '<span class="bp-kicker">Résidence contemporaine' + (location ? ' · ' + esc(location) : '') + '</span>' +
              '<h1>' + esc(title) + '</h1>' +
              '<p>' + esc(body) + '</p>' +
              '<ul class="bp-stats">' + statHtml + '</ul>' +
              '<div class="bp-thumbs">' + thumbHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="bp-values-sec">' +
        '<div class="container">' +
          '<div class="bp-head">' +
            '<span class="bp-kicker">Nos engagements</span>' +
            '<h2>Un art de bâtir : exigence, finition et art de vivre</h2>' +
          '</div>' +
          '<div class="bp-values-grid">' + valueHtml + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="bp-plans-sec">' +
        '<div class="container">' +
          '<div class="bp-head">' +
            '<span class="bp-kicker">Découvrir</span>' +
            '<h2>Des espaces pensés pour votre art de vivre</h2>' +
          '</div>' +
          '<div class="bp-plan-tabs" role="tablist">' + tabsHtml + '</div>' +
          '<div class="bp-plan-body">' +
            '<figure class="bp-plan-media"><img id="bpPlanImage" src="' + esc(planImages[0]) + '" alt="Aperçu du niveau"></figure>' +
            '<aside class="bp-plan-panel">' +
              '<h3 id="bpPlanTitle">Rez-de-chaussée</h3>' +
              '<p>' + esc(shortBody) + '</p>' +
              '<div class="bp-specs">' + specsHtml + '</div>' +
              '<a class="bp-plan-cta" href="contact">Réserver une visite <i class="far fa-arrow-right" aria-hidden="true"></i></a>' +
            '</aside>' +
          '</div>' +
        '</div>' +
      '</section>';

    var anchor = oldHero || sec;
    anchor.parentNode.insertBefore(page, anchor);
    if (oldHero) oldHero.style.display = "none";
    sec.style.display = "none";

    /* same map block as the contact page, pinned to this project's address
       (read before the old consultation block is discarded) */
    var address = "";
    Array.prototype.forEach.call(document.querySelectorAll(".renvia-info-item"), function (item) {
      var label = item.querySelector("h5, h4, .title");
      var value = item.querySelector("p");
      if (!address && label && /adresse/i.test(label.textContent) && value) {
        address = value.textContent.trim().replace(/\s+/g, " ");
      }
    });
    var legacyMap = sec && sec.querySelector('iframe[src*="maps"]');
    if (!address && legacyMap) {
      var match = legacyMap.getAttribute("src").match(/[?&]q=([^&]+)/);
      if (match) address = decodeURIComponent(match[1].replace(/\+/g, " "));
    }
    /* the hidden legacy block must not keep loading a duplicate map */
    if (legacyMap) legacyMap.parentNode.removeChild(legacyMap);

    /* the old map / consultation block no longer belongs on this page */
    Array.prototype.forEach.call(
      document.querySelectorAll("main > .renvia-contact_two"),
      function (block) { block.parentNode.removeChild(block); }
    );

    var mapSection = document.createElement("section");
    mapSection.className = "contact-map-sec curve-bottom";
    var mapBox = document.createElement("div");
    mapBox.className = "map-box";
    /* brand map: Carto/OSM tiles muted to our palette, no vendor UI */
    var mapCanvas = document.createElement("div");
    mapCanvas.className = "mb-map";
    mapCanvas.setAttribute("data-brand-map", "");
    mapCanvas.setAttribute("data-lat", "30.4251");
    mapCanvas.setAttribute("data-lng", "-9.6171");
    mapCanvas.setAttribute("data-zoom", "16");
    var projectNameEl = page.querySelector(".bp-hero-copy h1");
    mapCanvas.setAttribute(
      "data-title",
      projectNameEl && projectNameEl.textContent.trim()
        ? projectNameEl.textContent.trim()
        : "Le projet"
    );
    mapCanvas.setAttribute("data-address", address || "Marina d'Agadir, Agadir, Maroc");
    mapBox.appendChild(mapCanvas);
    mapSection.appendChild(mapBox);

    /* the map is now the last block before the footer, so it carries the
       « arche douce » seam (same class chain as the contact page). */
    page.parentNode.insertBefore(mapSection, page.nextSibling);

    var main = page.querySelector("#bpMainImage");
    page.querySelectorAll(".bp-thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        page.querySelectorAll(".bp-thumb").forEach(function (t) { t.classList.remove("is-active"); });
        thumb.classList.add("is-active");
        main.src = thumb.getAttribute("data-src");
      });
    });

    var planImg = page.querySelector("#bpPlanImage");
    var planTitle = page.querySelector("#bpPlanTitle");
    page.querySelectorAll(".bp-plan-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        page.querySelectorAll(".bp-plan-tab").forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var i = parseInt(tab.getAttribute("data-index"), 10) || 0;
        planImg.src = planImages[i % planImages.length];
        planTitle.textContent = planTitles[i] || planTitles[0];
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
}());
