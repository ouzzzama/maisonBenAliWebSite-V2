/* Maison Ben Ali — CRM → site bridge pour les biens
 *
 * PAGE LISTE (proprietes-projets.html)
 *   <div data-crm-products></div> reçoit une carte par bien publié dans le CRM.
 *   Les filtres existants (pills, type, secteur, chambres, mot-clé) filtrent
 *   aussi ces cartes.
 *
 * PAGE FICHE (project-details.html)
 *   avec ?bien=villa-founty-beach : les éléments marqués data-crm="…" sont
 *   remplis depuis le CRM. Sans paramètre, le premier bien publié est utilisé.
 *
 * URL du CRM : window.MB_CRM_URL, ou <html data-crm-url="…">, posé par
 * assets/js/crm-config.js.
 */
(function () {
  "use strict";

  var CRM = String(
    window.MB_CRM_URL || document.documentElement.getAttribute("data-crm-url") || ""
  ).replace(/\/$/, "");
  if (!CRM) return;

  var CATEGORY_LABEL = {
    villas: "Villa",
    appartements: "Appartement",
    vefa: "VEFA",
    commercial: "Commercial",
  };

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(value) {
    if (value === null || value === undefined || value === "" || Number(value) <= 0) {
      return "Prix sur demande";
    }
    try {
      return new Intl.NumberFormat("fr-FR").format(Number(value)) + " MAD";
    } catch (error) {
      return Number(value) + " MAD";
    }
  }

  function fetchProducts(slug) {
    var url = CRM + "/api/public/products";
    if (slug) url += "?slug=" + encodeURIComponent(slug);
    return fetch(url, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) return slug ? null : [];
        return response.json();
      })
      .catch(function () {
        return slug ? null : [];
      });
  }

  /* ---------------------------------------------------------------- liste */

  function cardMarkup(product) {
    var title = escapeHtml(product.title);
    var address = escapeHtml(product.address || product.location);
    var slug = encodeURIComponent(product.slug);
    var photo = escapeHtml(product.coverUrl);
    var badge = product.badge
      ? '<span class="luxury-card-pill-badge badge-white"><i class="fas fa-star" style="color: #f59e0b;"></i> ' +
        escapeHtml(product.badge) +
        "</span>"
      : '<span class="luxury-card-pill-badge badge-glass">' +
        escapeHtml(CATEGORY_LABEL[product.category] || "Bien") +
        "</span>";

    var specs = "";
    if (product.rooms) specs += '<div class="spec-item"><i class="fas fa-bed"></i> Ch: ' + product.rooms + "</div>";
    if (product.baths)
      specs += (specs ? '<span class="spec-divider"></span>' : "") +
        '<div class="spec-item"><i class="fas fa-bath"></i> Sdb: ' + product.baths + "</div>";
    if (product.surface)
      specs += (specs ? '<span class="spec-divider"></span>' : "") +
        '<div class="spec-item"><i class="fas fa-vector-square"></i> ' + product.surface + " m²</div>";

    return (
      '<div class="prop-card-item" data-crm-product-card="true" data-category="' +
      escapeHtml(product.category) +
      '" data-location="' +
      escapeHtml(product.location) +
      '" data-beds="' +
      (product.rooms || 0) +
      '" data-title="' +
      title.toLowerCase() +
      '" data-address="' +
      address.toLowerCase() +
      '" data-aos="fade-up" data-aos-duration="900">' +
      '<div class="luxury-product-card">' +
      '<div class="luxury-card-bg" style="background-image: url(\'' + photo + "');\"></div>" +
      '<div class="luxury-card-top">' + badge + "</div>" +
      '<div class="luxury-card-dots"><span class="active"></span><span></span><span></span><span></span></div>' +
      '<div class="luxury-card-overlay">' +
      '<div class="luxury-card-main-info"><div class="luxury-card-title-wrap">' +
      '<h3 class="luxury-card-title">' + title + "</h3>" +
      '<p class="luxury-card-address"><i class="far fa-map-marker-alt"></i> ' + address + "</p>" +
      "</div></div>" +
      '<div class="luxury-card-specs-bar">' + specs + "</div>" +
      '<div class="luxury-card-actions">' +
      '<a href="contact?prop=' + slug + '" class="luxury-book-btn"><i class="far fa-calendar-alt"></i> Réserver</a>' +
      '<a href="project-details?bien=' + slug + '" class="luxury-reserve-btn">Découvrir le bien</a>' +
      "</div></div></div></div>"
    );
  }

  function renderList(container, products) {
    if (!products.length) return;

    var column = document.createElement("div");
    column.className = "col-lg-4 col-md-6 prop-col-track prop-col-right";
    column.setAttribute("data-crm-column", "true");
    column.innerHTML = products.map(cardMarkup).join("");

    // La grille des biens de la page liste accueille aussi les biens du CRM, pour
    // qu'ils se rangent dans les mêmes colonnes au lieu d'une rangée à part.
    var grid = document.getElementById("propertiesListingGrid") || container;
    grid.appendChild(column);

    var cards = Array.prototype.slice.call(column.querySelectorAll("[data-crm-product-card]"));

    var keyword = document.getElementById("propSearchKeyword");
    var type = document.getElementById("propFilterType");
    var location = document.getElementById("propFilterLocation");
    var beds = document.getElementById("propFilterBeds");

    function applyFilters() {
      var term = keyword ? keyword.value.trim().toLowerCase() : "";
      var category = type ? type.value : "all";
      var zone = location ? location.value : "all";
      var minimumRooms = beds ? parseInt(beds.value, 10) || 0 : 0;

      cards.forEach(function (card) {
        var okCategory = category === "all" || card.getAttribute("data-category") === category;
        var okZone = zone === "all" || card.getAttribute("data-location") === zone;
        var okRooms =
          minimumRooms === 0 || (parseInt(card.getAttribute("data-beds"), 10) || 0) >= minimumRooms;
        var haystack = card.getAttribute("data-title") + " " + card.getAttribute("data-address");
        var okKeyword = !term || haystack.indexOf(term) !== -1;
        card.style.display = okCategory && okZone && okRooms && okKeyword ? "" : "none";
      });
    }

    [keyword, type, location, beds].forEach(function (control) {
      if (!control) return;
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    Array.prototype.forEach.call(document.querySelectorAll(".prop-filter-btn"), function (button) {
      button.addEventListener("click", function () {
        setTimeout(applyFilters, 0);
      });
    });

    var reset = document.getElementById("emptyStateResetBtn");
    if (reset) reset.addEventListener("click", function () { setTimeout(applyFilters, 0); });

    if (typeof AOS !== "undefined" && AOS.refresh) AOS.refresh();
  }

  /* ---------------------------------------------------------------- fiche */

  function setText(selector, value) {
    if (value === null || value === undefined || value === "") return;
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (node) {
      node.textContent = value;
    });
  }

  function fillDetail(product) {
    document.title = "Maison Benali - " + product.title;
    setText('[data-crm="title"]', product.title);
    setText('[data-crm="crumb"]', product.title);
    setText('[data-crm="address"]', product.address || product.location);
    setText('[data-crm="description"]', product.description);
    setText('[data-crm="price"]', money(product.price));
    setText('[data-crm="type"]', CATEGORY_LABEL[product.category] || product.category);
    setText('[data-crm="status"]', "Disponible");
    setText(
      '[data-crm="surface"]',
      product.surface ? product.surface + " m²" : ""
    );
    setText(
      '[data-crm="rooms"]',
      [product.rooms ? product.rooms + " chambres" : "", product.baths ? product.baths + " sdb" : ""]
        .filter(Boolean)
        .join(" · ")
    );
    setText(
      '[data-crm="summary"]',
      [
        product.surface ? product.surface + " m²" : "",
        product.rooms ? product.rooms + " chambres" : "",
        product.baths ? product.baths + " salles de bain" : "",
      ]
        .filter(Boolean)
        .join(" · ")
    );
    setText('[data-crm="ref"]', "#" + String(product.id).slice(-4).toUpperCase());

    Array.prototype.forEach.call(document.querySelectorAll('[data-crm="cover"]'), function (img) {
      if (product.coverUrl) img.setAttribute("src", product.coverUrl);
    });

    var hero = document.querySelector('[data-crm="hero"]');
    if (hero && product.coverUrl) {
      hero.style.backgroundImage = "url('" + product.coverUrl + "')";
      hero.setAttribute("data-src", product.coverUrl);
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-crm="reserve"]'), function (link) {
      link.setAttribute("href", "contact?prop=" + encodeURIComponent(product.slug));
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-crm="whatsapp"]'), function (link) {
      link.setAttribute(
        "href",
        "https://wa.me/212661191787?text=" +
          encodeURIComponent("Bonjour Maison Ben Ali, je souhaite des informations sur « " + product.title + " ».")
      );
    });

    var gallery = document.querySelector("[data-crm-gallery]");
    if (gallery && product.gallery && product.gallery.length) {
      gallery.innerHTML = product.gallery
        .map(function (url) {
          return (
            '<div class="col-lg-4 col-md-6"><img src="' +
            escapeHtml(url) +
            '" alt="' +
            escapeHtml(product.title) +
            '" loading="lazy" style="width:100%;border-radius:18px;"></div>'
          );
        })
        .join("");
    }
  }

  /* ---------------------------------------------------------------- route */

  var listContainer = document.querySelector("[data-crm-products]");
  if (listContainer) {
    fetchProducts(null).then(function (products) {
      if (Array.isArray(products)) renderList(listContainer, products);
    });
  }

  var detailRoot = document.querySelector("[data-crm-product]");
  if (detailRoot) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("bien") || params.get("slug");

    // bento-product.js attend cette promesse avant de dessiner la fiche, et lit
    // window.MB_CRM_PRODUCT : la page affiche donc le bien du CRM, pas le gabarit.
    var request = fetchProducts(slug).then(function (data) {
      var product = Array.isArray(data) ? data[0] : data;
      if (product) {
        window.MB_CRM_PRODUCT = product;
        fillDetail(product);
      }
      return product;
    });
    window.MB_CRM_READY = request;
  }
})();
