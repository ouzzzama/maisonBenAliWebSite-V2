/* ============================================================
   MAISON BEN ALI — BRAND MAP
   OpenStreetMap raster tiles, multiplied over a grey CSS
   gradient so the ground reads as a gradient and the streets
   read as darker grey. Zero vendor UI: no zoom buttons, no
   fullscreen, no scale bar, no directions widget, no logo.
   Our own pin pill, address card and "Itinéraire" CTA.
   Usage: <div class="mb-map" data-brand-map data-lat=".."
             data-lng=".." data-zoom="16" data-title=".."
             data-address=".."></div>
   ============================================================ */
(function () {
  "use strict";

  var PIN_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/>' +
    '<circle cx="12" cy="10" r="2.6"/></svg>';

  var MAP_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 3.6 3.6 5.8v14.6L9 18.2l6 2.2 5.4-2.2V3.6L15 5.8z"/>' +
    '<path d="M9 3.6v14.6M15 5.8v14.6"/></svg>';

  var STAR_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/></svg>';

  var ARROW_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html) node.innerHTML = html;
    return node;
  }

  function initMap(host) {
    if (!host || host.dataset.mbMapReady || !window.L) return;
    var lat = parseFloat(host.dataset.lat);
    var lng = parseFloat(host.dataset.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    var zoom = parseInt(host.dataset.zoom, 10) || 16;
    var address = host.dataset.address || "";
    var title = host.dataset.title || "Maison Benali";
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    host.dataset.mbMapReady = "1";
    host.setAttribute("role", "application");
    host.setAttribute(
      "aria-label",
      "Carte de localisation — " + (address || title)
    );

    var map = L.map(host, {
      zoomControl: false,
      attributionControl: false,
      scaleControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: false,
      keyboard: false,
      zoomAnimation: !reduced,
      fadeAnimation: !reduced,
      markerZoomAnimation: !reduced,
      center: [lat, lng],
      zoom: zoom
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      crossOrigin: true,
      attribution: ""
    }).addTo(map);

    /* our own pin: white glyph inside a coral pill, plus a name tag
       whose tail points down at the pin */
    var pinEl = el(
      "div",
      "mb-map-marker",
      '<span class="mb-map-halo" aria-hidden="true"></span>' +
        '<span class="mb-map-pill">' + PIN_SVG + "</span>"
    );

    var nameTag = el("span", "mb-map-tag");
    var nameText = el("span", "mb-map-tag__text");
    nameText.textContent = title;
    nameTag.appendChild(nameText);
    pinEl.appendChild(nameTag);

    var marker = L.marker([lat, lng], {
      keyboard: false,
      riseOnHover: false,
      alt: title,
      icon: L.divIcon({
        className: "mb-map-marker",
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        html: pinEl
      })
    }).addTo(map);

    /* overlays are independent of the tile network */
    host.appendChild(el("div", "mb-map-tint"));

    var card = el("div", "mb-map-card");
    card.innerHTML =
      '<span class="mb-map-card__eyebrow">' +
      '<span class="mb-map-card__dot" aria-hidden="true"></span>' +
      "Localisation</span>" +
      '<h3 class="mb-map-card__title">' + esc(title) + "</h3>" +
      (address ? '<p class="mb-map-card__address">' + esc(address) + "</p>" : "") +
      '<div class="mb-map-card__actions">' +
      '<a class="mb-map-card__cta mb-map-card__cta--book" href="/contact">Prendre rendez-vous' +
      ARROW_SVG + '</a>' +
      '<a class="mb-map-card__cta mb-map-card__cta--ghost" target="_blank" rel="noopener" ' +
      'href="https://www.google.com/maps/search/?api=1&query=' +
      lat + "," + lng + '">Google Maps' +
      MAP_SVG + '</a>' +
      '<button type="button" class="mb-map-card__fav" aria-pressed="false">' +
      STAR_SVG +
      '<span class="mb-map-card__fav-label">Enregistrer</span></button>' +
      "</div>";
    host.appendChild(card);

    /* save this location to the visitor's favourites (localStorage) */
    var favBtn = card.querySelector(".mb-map-card__fav");
    var favLabel = card.querySelector(".mb-map-card__fav-label");
    var favKey = "mbMapFav:" + lat.toFixed(5) + "," + lng.toFixed(5);
    var isSaved = false;
    try { isSaved = localStorage.getItem(favKey) === "1"; } catch (e) {}

    var paintFav = function () {
      favBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
      favBtn.setAttribute(
        "aria-label",
        (isSaved ? "Retirer " : "Enregistrer ") + title + (isSaved ? " des favoris" : " dans les favoris")
      );
      favLabel.textContent = isSaved ? "Enregistré" : "Enregistrer";
    };
    paintFav();

    favBtn.addEventListener("click", function () {
      isSaved = !isSaved;
      try {
        if (isSaved) localStorage.setItem(favKey, "1");
        else localStorage.removeItem(favKey);
      } catch (e) {}
      paintFav();
    });

    var credit = el(
      "p",
      "mb-map-credit",
      '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>'
    );
    host.appendChild(credit);

    /* keep the canvas honest when the seam clip or fonts settle */
    var refresh = function () { map.invalidateSize(); };
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    setTimeout(refresh, 350);
    setTimeout(refresh, 1200);

    return map;
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    Array.prototype.forEach.call(
      scope.querySelectorAll("[data-brand-map]"),
      initMap
    );
  }

  window.mbBrandMapInit = scan;

  function boot() {
    scan(document);
    if (window.MutationObserver) {
      new MutationObserver(function (records) {
        records.forEach(function (record) {
          Array.prototype.forEach.call(record.addedNodes, function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches("[data-brand-map]")) initMap(node);
            if (node.querySelectorAll) {
              Array.prototype.forEach.call(
                node.querySelectorAll("[data-brand-map]"),
                initMap
              );
            }
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
