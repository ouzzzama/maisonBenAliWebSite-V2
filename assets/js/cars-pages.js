/* Benali Cars — rendu du marché et de la fiche véhicule.
   S'appuie sur assets/js/cars-data.js (window.BENALI_CARS). */
(function () {
  "use strict";

  var cars = window.BENALI_CARS || [];
  var services = window.BENALI_CARS_SERVICES || [];
  var WHATSAPP = "https://wa.me/212661191787";
  var RESERVATION = "reservation";

  /* Tarifs : source = CRM (grille saisie dans Cars → Tarifs). Sans réseau ou
     sans tarif saisi, chaque véhicule garde « Tarif sur demande ». */
  function crmBase() {
    return String(
      window.MB_CRM_URL || document.documentElement.getAttribute("data-crm-url") || ""
    ).replace(/\/$/, "");
  }

  function mad(value) {
    var number = Number(value);
    if (!isFinite(number) || number <= 0) return "";
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(number) + " MAD";
  }

  function rates(car) {
    return car.rates || {};
  }

  function rateRows(car) {
    var r = rates(car);
    var rows = [];
    if (r.daily) rows.push({ label: "Journée", value: mad(r.daily) });
    if (r.weekly) rows.push({ label: "Semaine", value: mad(r.weekly) });
    if (r.high) rows.push({ label: "Haute saison", value: mad(r.high) + " / jour" });
    return rows;
  }

  /* Ligne de prix courte pour les cartes du marché. */
  function priceLabel(car) {
    var r = rates(car);
    if (r.daily) return { main: "À partir de " + mad(r.daily), unit: "/ jour" };
    if (r.weekly) return { main: mad(r.weekly), unit: "/ semaine" };
    return { main: "Tarif sur demande", unit: "" };
  }

  function loadRates() {
    var base = crmBase();
    if (!base) return Promise.resolve(false);
    return fetch(base + "/api/public/cars", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (body) {
        var list = (body && body.cars) || [];
        var changed = false;
        for (var i = 0; i < list.length; i++) {
          var car = findCar(list[i].slug);
          if (!car) continue;
          car.rates = {
            daily: list[i].dailyRate,
            weekly: list[i].weeklyRate,
            high: list[i].highSeasonRate,
            note: list[i].seasonNote,
            deposit: list[i].deposit
          };
          changed = true;
        }
        return changed;
      })
      .catch(function () {
        return false;
      });
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function findCar(slug) {
    for (var i = 0; i < cars.length; i++) {
      if (cars[i].slug === slug) return cars[i];
    }
    return null;
  }

  function bookingHref(car) {
    return RESERVATION + "?car=" + encodeURIComponent(car.name);
  }

  function waHref(car) {
    return (
      WHATSAPP +
      "?text=" +
      encodeURIComponent(
        "Bonjour Maison Benali, je souhaite réserver la " + car.name + " (Benali Cars) à Agadir."
      )
    );
  }

  function card(car) {
    return (
      '<a class="car-card" href="voiture-details?car=' + encodeURIComponent(car.slug) + '">' +
      '<span class="car-card__media">' +
      '<img src="' + esc(car.image) + '" alt="' + esc(car.alt) + '" loading="lazy" decoding="async">' +
      '<span class="car-card__badge">' + esc(car.badge) + "</span>" +
      "</span>" +
      '<span class="car-card__body">' +
      '<span class="car-card__category">' + esc(car.category) + "</span>" +
      '<span class="car-card__name">' + esc(car.name) + "</span>" +
      '<span class="car-card__tagline">' + esc(car.tagline) + "</span>" +
      '<span class="car-card__foot">' +
      '<span class="car-card__price">' +
      esc(priceLabel(car).main) +
      (priceLabel(car).unit ? '<small>' + esc(priceLabel(car).unit) + "</small>" : "") +
      "</span>" +
      '<span class="car-card__arrow"><i class="far fa-arrow-right"></i></span>' +
      "</span>" +
      "</span>" +
      "</a>"
    );
  }

  function renderListing() {
    var grid = document.getElementById("carsGrid");
    if (!grid || !cars.length) return;
    grid.innerHTML = cars.map(card).join("");
  }

  /* Variante B « collection » : hero cinématographique pleine largeur,
     bandeau de caractéristiques, récit éditorial et carte de réservation.
     Même donnée et mêmes liens que la fiche classique. */
  /* Remplit le bloc tarifaire de la fiche classique. */
  function applyRatesToDetail(car) {
    var main = document.getElementById("carPriceMain");
    var note = document.getElementById("carPriceNote");
    var list = document.getElementById("carRates");
    var r = rates(car);

    if (main) {
      main.textContent = r.daily
        ? "À partir de " + mad(r.daily) + " / jour"
        : r.weekly
          ? mad(r.weekly) + " / semaine"
          : "Tarif sur demande";
    }
    if (note) {
      note.textContent =
        (r.high && r.note) ||
        "Devis selon la durée et la saison, confirmé par écrit.";
    }
    if (list) {
      var rows = rateRows(car);
      if (rows.length) {
        list.innerHTML = rows
          .map(function (row) {
            return (
              '<li><span>' + esc(row.label) + "</span><strong>" + esc(row.value) + "</strong></li>"
            );
          })
          .join("");
        list.hidden = false;
      } else {
        list.innerHTML = "";
        list.hidden = true;
      }
    }
  }

  /* Bloc tarifaire de la variante B (carte graphite). */
  function bookPriceHtml(car) {
    var r = rates(car);
    var main = r.daily
      ? mad(r.daily) + ' <span class="carb-book__unit">/ jour</span>'
      : r.weekly
        ? mad(r.weekly) + ' <span class="carb-book__unit">/ semaine</span>'
        : "Tarif sur demande";
    var extras = [];
    if (r.daily && r.weekly) extras.push("Semaine : " + mad(r.weekly));
    if (r.high) extras.push("Haute saison : " + mad(r.high) + " / jour");
    return (
      '<p class="carb-book__price">' + main + "</p>" +
      (extras.length ? '<p class="carb-book__rates">' + esc(extras.join(" · ")) + "</p>" : "") +
      '<p class="carb-book__hint">' +
      esc((r.high && r.note) || "Devis selon la durée et la saison, confirmé par écrit.") +
      "</p>"
    );
  }

  function renderDetailB(root, car) {
    root.classList.add("car-detail--b");

    var specs = [
      { label: "Catégorie", value: car.category },
      { label: "Livraison", value: "Aéroport Al Massira" },
      { label: "Tarif", value: "Sur devis" },
      { label: "Pack", value: "Villa + voiture" }
    ];

    var others = cars
      .filter(function (c) {
        return c.slug !== car.slug;
      })
      .slice(0, 3);

    root.innerHTML =
      '<div class="carb">' +
      '<section class="carb-hero">' +
      '<img class="carb-hero__img" src="' + esc(car.image) + '" alt="' + esc(car.alt) + '">' +
      '<span class="carb-hero__scrim" aria-hidden="true"></span>' +
      '<div class="carb-hero__inner">' +
      '<nav class="carb-crumb" aria-label="Fil d\'Ariane">' +
      '<a href="/">Accueil</a><span>/</span>' +
      '<a href="benali-cars">Benali Cars</a><span>/</span>' +
      '<span id="carCrumb">' + esc(car.name) + "</span>" +
      "</nav>" +
      '<div class="carb-hero__foot">' +
      '<span class="carb-kicker">' + esc(car.badge) + " · " + esc(car.category) + "</span>" +
      '<h1 id="carName">' + esc(car.name) + "</h1>" +
      '<p class="carb-hero__tagline" id="carTagline">' + esc(car.tagline) + "</p>" +
      "</div>" +
      "</div>" +
      "</section>" +
      '<div class="carb-wrap">' +
      '<ul class="carb-specs">' +
      specs
        .map(function (s) {
          return "<li><span>" + esc(s.label) + "</span><strong>" + esc(s.value) + "</strong></li>";
        })
        .join("") +
      "</ul>" +
      '<div class="carb-main">' +
      '<article class="carb-story">' +
      '<span class="carb-label">Le véhicule</span>' +
      '<p id="carDescription">' + esc(car.description) + "</p>" +
      "</article>" +
      '<aside class="carb-book">' +
      '<span class="carb-label">Réservation</span>' +
      bookPriceHtml(car) +
      '<a class="carb-cta" id="carBook" href="' + esc(bookingHref(car)) + '">Réserver ce véhicule <i class="far fa-arrow-right"></i></a>' +
      '<a class="carb-ghost" id="carWhatsApp" href="' + esc(waHref(car)) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Demander la disponibilité</a>' +
      '<ul class="carb-book__list">' +
      services
        .map(function (s) {
          return '<li><i class="' + esc(s.icon) + '"></i>' + esc(s.text) + "</li>";
        })
        .join("") +
      "</ul>" +
      '<p class="carb-book__note">Remise des clés à l\'aéroport Agadir Al Massira ou à votre résidence.</p>' +
      "</aside>" +
      "</div>" +
      '<section class="carb-more">' +
      '<div class="carb-more__head"><h2>Les autres véhicules</h2><a href="benali-cars">Toute la flotte <i class="far fa-arrow-right"></i></a></div>' +
      '<div class="carb-more__grid">' +
      others
        .map(function (c, i) {
          return (
            '<a class="carb-tile" href="voiture-details?car=' +
            encodeURIComponent(c.slug) +
            '&amp;style=b">' +
            '<span class="carb-tile__index">0' + (i + 1) + "</span>" +
            '<span class="carb-tile__media"><img src="' + esc(c.image) + '" alt="' + esc(c.alt) + '" loading="lazy" decoding="async"></span>' +
            '<span class="carb-tile__meta"><span class="carb-tile__cat">' + esc(c.category) + '</span><strong>' + esc(c.name) + '</strong><i class="far fa-arrow-right"></i></span>' +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      "</section>" +
      "</div>" +
      "</div>";
  }

  function renderDetail() {
    var root = document.getElementById("carDetail");
    if (!root || !cars.length) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("car");
    var car = findCar(slug) || cars[0];

    document.title = car.name + " — Location à Agadir | Benali Cars";

    if (params.get("style") === "b") {
      renderDetailB(root, car);
      return;
    }

    var title = document.getElementById("carName");
    if (title) title.textContent = car.name;

    var crumb = document.getElementById("carCrumb");
    if (crumb) crumb.textContent = car.name;

    var cat = document.getElementById("carCategory");
    if (cat) cat.textContent = car.category;

    var catSide = document.getElementById("carCategorySide");
    if (catSide) catSide.textContent = car.category;

    var tagline = document.getElementById("carTagline");
    if (tagline) tagline.textContent = car.tagline;

    var desc = document.getElementById("carDescription");
    if (desc) desc.textContent = car.description;

    var img = document.getElementById("carImage");
    if (img) {
      img.src = car.image;
      img.alt = car.alt;
    }

    var book = document.getElementById("carBook");
    if (book) book.href = bookingHref(car);

    var wa = document.getElementById("carWhatsApp");
    if (wa) wa.href = waHref(car);

    applyRatesToDetail(car);

    var rateSide = document.getElementById("carPriceSide");
    if (rateSide) {
      var side = rates(car);
      rateSide.textContent = side.daily
        ? mad(side.daily) + " / jour"
        : side.weekly
          ? mad(side.weekly) + " / semaine"
          : "Sur devis";
    }

    var features = document.getElementById("carFeatures");
    if (features) {
      features.innerHTML = services
        .map(function (s) {
          return '<li><i class="' + esc(s.icon) + '"></i><span>' + esc(s.text) + "</span></li>";
        })
        .join("");
    }

    var others = document.getElementById("carOthers");
    if (others) {
      others.innerHTML = cars
        .filter(function (c) {
          return c.slug !== car.slug;
        })
        .slice(0, 3)
        .map(card)
        .join("");
    }
  }

  /* Le formulaire de réservation reçoit ?car=Dacia Duster : on présélectionne. */
  function preselectReservation() {
    var select = document.querySelector('[data-reserve-type="car"] select[name="car"]');
    if (!select) return;
    var wanted = new URLSearchParams(window.location.search).get("car");
    if (!wanted) return;
    var target = wanted.trim().toLowerCase();
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].textContent.trim().toLowerCase() === target) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  function renderAll() {
    renderListing();
    renderDetail();
  }

  function boot() {
    renderAll();
    preselectReservation();
    /* Les tarifs arrivent du CRM : on redessine dès qu'ils sont là, sans
       bloquer l'affichage si le CRM est injoignable. */
    loadRates().then(function (changed) {
      if (changed) renderAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
