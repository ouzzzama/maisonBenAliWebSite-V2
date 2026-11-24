/* Réservation forms — product page
 *
 * The visitor's request is stored twice when possible: by the site's own
 * Express endpoint (/api/reservation, used locally and on a VPS) and, if that
 * endpoint is unavailable — Hostinger shared hosting serves the site as static
 * files, so the route answers 404 — directly by the CRM public intake.
 */
(function () {
  "use strict";

  var forms = document.querySelectorAll("[data-reserve-form]");

  function crmBase() {
    return String(
      window.MB_CRM_URL ||
        document.documentElement.getAttribute("data-crm-url") ||
        ""
    ).replace(/\/$/, "");
  }

  function readJson(response) {
    return response.json().then(function (body) {
      return { ok: response.ok, body: body };
    });
  }

  function postToSite(data) {
    return fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (response) {
      return response.json().then(function (body) {
        return { ok: response.ok, body: body };
      });
    });
  }

  function postToCrm(data) {
    var base = crmBase();
    if (!base) return Promise.reject(new Error("CRM non configuré"));
    return fetch(base + "/api/public/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(readJson);
  }

  forms.forEach(function (form) {
    var status = form.querySelector("[data-form-status]");
    var button = form.querySelector('button[type="submit"]');

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state || "";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = String(value).trim();
      });

      var type = form.getAttribute("data-reserve-type") || "bien";

      if (!data.phone) {
        setStatus("Merci d'indiquer un numéro de téléphone.", "error");
        return;
      }

      if (type === "car") {
        if (!data.name || data.name.length < 2) {
          setStatus("Merci d'indiquer votre nom.", "error");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || "")) {
          setStatus("Merci d'indiquer un e-mail valide : c'est là que part l'accusé de réception.", "error");
          return;
        }
        if (!data.from || !data.to) {
          setStatus("Merci d'indiquer vos dates de départ et de retour.", "error");
          return;
        }
        if (data.to < data.from) {
          setStatus("La date de retour doit être après la date de départ.", "error");
          return;
        }
      }

      data.type = type;
      if (type === "bien") data.property = "Résidence Agadir Bay";
      data.page = window.location.pathname;

      if (button) {
        button.disabled = true;
        button.dataset.label = button.innerHTML;
        button.innerHTML = "Envoi…";
      }
      setStatus("Envoi de votre demande…", "pending");

      postToSite(data)
        .catch(function () {
          /* Static hosting: /api/reservation does not exist, so the CRM
           * public intake records the request instead. */
          return postToCrm(data);
        })
        .then(function (result) {
          if (!result.ok || !result.body.ok) {
            throw new Error((result.body && result.body.error) || "Échec de l'envoi");
          }
          var reference = result.body.reference || result.body.id || null;
          var label = "Demande enregistrée" + (reference ? " (réf. " + reference + ")" : "") + ". ";
          var ackSent = !!(result.body.ack && result.body.ack.delivered);
          var message =
            type === "car"
              ? label +
                (ackSent && data.email ? "Un accusé de réception part vers " + data.email + ". " : "") +
                "Nous confirmons la disponibilité sous 24 h ouvrées."
              : label + "Nous vous rappelons sous 24 h ouvrées.";
          setStatus(message, "success");
          form.reset();
        })
        .catch(function (error) {
          setStatus(
            "Envoi impossible : " + error.message + ". Contactez-nous sur WhatsApp au +212 661-191787.",
            "error"
          );
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.innerHTML = button.dataset.label || button.innerHTML;
          }
        });
    });
  });
})();
