/* Maison Ben Ali — CRM endpoint
 *
 * One place to tell the static website where the CRM lives. Loaded before
 * crm-media.js (CMS images) and product-reservation.js (form forwarding).
 *
 *   Local development  → http://localhost:3002
 *   Production         → https://crm.maisonbenali.com
 *
 * Set window.MB_CRM_URL before this file (or add data-crm-url on <html>) to
 * override without touching the code.
 */
(function () {
  "use strict";

  if (window.MB_CRM_URL) return;

  var host = window.location.hostname;
  var isLocal =
    host === "" || host === "localhost" || host === "127.0.0.1" || host === "[::1]";

  window.MB_CRM_URL = isLocal
    ? "http://localhost:3002"
    : "https://crm.maisonbenali.com";
})();
