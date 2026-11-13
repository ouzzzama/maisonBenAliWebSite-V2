/* Maison Ben Ali — CMS bridge (CRM → website)
 *
 * Any <img> (or <source>) carrying data-cms-slot="HOME_HERO" is replaced by the
 * matching active asset from the CRM media library. The bundled image is kept
 * whenever the CRM is unreachable or returns no usable asset, so the page never
 * ends up with a broken visual.
 *
 * CRM base URL: window.MB_CRM_URL, or <html data-crm-url="...">.
 */
(function () {
  "use strict";

  var CRM =
    window.MB_CRM_URL ||
    document.documentElement.getAttribute("data-crm-url") ||
    "http://localhost:3002";

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-cms-slot]"));
  if (!nodes.length) return;

  var slots = [];
  nodes.forEach(function (node) {
    var slot = node.getAttribute("data-cms-slot");
    if (slot && slots.indexOf(slot) === -1) slots.push(slot);
  });

  function swap(node, asset) {
    if (!asset || !asset.url) return;
    var probe = new Image();
    probe.onload = function () {
      node.src = asset.url;
      if (asset.alt) node.alt = asset.alt;
      node.setAttribute("data-cms-applied", "true");
    };
    probe.onerror = function () {
      /* keep the image shipped with the page */
    };
    probe.src = asset.url;
  }

  slots.forEach(function (slot) {
    fetch(CRM + "/api/public/media?slot=" + encodeURIComponent(slot), { cache: "no-store" })
      .then(function (response) {
        return response.ok ? response.json() : [];
      })
      .then(function (assets) {
        if (!assets || !assets.length) return;
        var targets = document.querySelectorAll('[data-cms-slot="' + slot + '"]');
        Array.prototype.forEach.call(targets, function (node, index) {
          swap(node, assets[index] || assets[0]);
        });
      })
      .catch(function () {
        /* CRM offline — the static page stands on its own */
      });
  });
})();
