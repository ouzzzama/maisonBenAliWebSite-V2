/* Réservation forms — product page */
(function () {
  "use strict";

  var forms = document.querySelectorAll("[data-reserve-form]");

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

      if (!data.phone) {
        setStatus("Merci d'indiquer un numéro de téléphone.", "error");
        return;
      }

      data.type = form.getAttribute("data-reserve-type") || "bien";
      data.property = "Résidence Agadir Bay";
      data.page = window.location.pathname;

      if (button) {
        button.disabled = true;
        button.dataset.label = button.innerHTML;
        button.innerHTML = "Envoi…";
      }
      setStatus("Envoi de votre demande…", "pending");

      fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          return response.json().then(function (body) {
            return { ok: response.ok, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.body.ok) {
            throw new Error((result.body && result.body.error) || "Échec de l'envoi");
          }
          setStatus(
            "Demande enregistrée (réf. " + result.body.id + "). Nous vous rappelons sous 24 h ouvrées.",
            "success"
          );
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
