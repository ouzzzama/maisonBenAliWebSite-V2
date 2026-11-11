/* Maison Benali — minimalist line icons
   Replaces the heavy 3D PNG badge icons with single-weight line glyphs
   (24px grid, 1.6 stroke, navy #122b43) everywhere they appear. */
(function () {
  "use strict";

  var PATHS = {
    home: '<path d="M4 10.4 12 4l8 6.4V20a.9.9 0 0 1-.9.9H4.9A.9.9 0 0 1 4 20Z"/><path d="M9.6 20.9v-6.1h4.8v6.1"/>',
    tag: '<path d="M20.5 12.6l-7.9 7.9L4 11.9V4h7.9z"/><circle cx="8.6" cy="8.6" r="1.3"/>',
    building: '<rect x="5" y="3.6" width="14" height="16.8" rx="1.2"/><path d="M9 8h2M13 8h2M9 11.6h2M13 11.6h2"/><path d="M10.4 20.4v-3.6h3.2v3.6"/>',
    bed: '<path d="M3.6 18.4V7"/><path d="M3.6 15.2h16.8v3.2"/><path d="M20.4 15.2v-3.4a2.6 2.6 0 0 0-2.6-2.6H10v4"/><circle cx="7.2" cy="11.6" r="1.5"/>',
    bath: '<path d="M4 12.6h16v2.8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M7 12.6V6.2a2 2 0 0 1 4 0"/><path d="M7.4 20.6l-.7-1.6M16.6 20.6l.7-1.6"/>',
    ruler: '<rect x="3.4" y="8" width="17.2" height="8" rx="1.4"/><path d="M7.4 8v3.2M11.4 8v4.4M15.4 8v3.2M19.4 8v4.4"/>',
    key: '<circle cx="8.2" cy="8.2" r="3.6"/><path d="M10.8 10.8 20.4 20.4"/><path d="M17.2 17.2l1.9-1.9M19.7 19.7l1.4-1.4"/>',
    percent: '<circle cx="12" cy="12" r="8.6"/><path d="M8.6 15.4l6.8-6.8"/><circle cx="9.4" cy="9.4" r="1.1"/><circle cx="14.6" cy="14.6" r="1.1"/>',
    document: '<path d="M7 3.6h6.4L18 8.2V20.4H7z"/><path d="M13.4 3.6v4.6H18"/><path d="M9.7 14.5l1.7 1.7 3.1-3.4"/>',
    wallet: '<rect x="3.4" y="6.4" width="17.2" height="12.4" rx="2.4"/><path d="M3.4 10.6h17.2"/><circle cx="16.6" cy="14.8" r="1.1"/>',
    cube: '<path d="M12 3.6l8 4.4v8L12 20.4 4 16V8z"/><path d="M4 8l8 4.4L20 8"/><path d="M12 12.4v8"/>',
    exchange: '<path d="M4.4 9.2h9.4"/><path d="M10.6 6.2l3 3-3 3"/><path d="M19.6 14.8H10.2"/><path d="M13.4 11.8l-3 3 3 3"/>',
    shield: '<path d="M12 3.6l7 2.4v5.4c0 4-2.9 7.1-7 9-4.1-1.9-7-5-7-9V6z"/><path d="M9.5 11.8l1.8 1.8 3.4-3.6"/>',
    clipboard: '<rect x="5.4" y="4.6" width="13.2" height="15.8" rx="2"/><path d="M9.4 4.6V3.2h5.2v1.4"/><path d="M9.4 12.6l1.8 1.8 3.4-3.6"/>',
    headset: '<path d="M5.6 13.2v-1a6.4 6.4 0 0 1 12.8 0v1"/><rect x="3.6" y="12.6" width="3.4" height="6" rx="1.6"/><rect x="17" y="12.6" width="3.4" height="6" rx="1.6"/><path d="M18.7 18.6v.4a2.4 2.4 0 0 1-2.4 2.4H13"/>',
    award: '<circle cx="12" cy="9.4" r="4.6"/><path d="M8.8 13.2l-1.4 7 4.6-2.6 4.6 2.6-1.4-7"/>',
    car: '<path d="M4 16.6h16v-3.2l-1.9-4.6a1.4 1.4 0 0 0-1.3-.9H7.2a1.4 1.4 0 0 0-1.3.9L4 13.4z"/><circle cx="8" cy="16.9" r="1.5"/><circle cx="16" cy="16.9" r="1.5"/>',
    calendar: '<rect x="4" y="5.4" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M8.4 3.6v3.4M15.6 3.6v3.4"/>',
    wifi: '<path d="M3.4 9.2a13 13 0 0 1 17.2 0"/><path d="M6.6 12.6a8.4 8.4 0 0 1 10.8 0"/><path d="M9.6 16a4.1 4.1 0 0 1 4.8 0"/><circle cx="12" cy="19.2" r="1"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3.6v3.4M14 3.6v3.4M10 17v3.4M14 17v3.4M3.6 10h3.4M3.6 14h3.4M17 10h3.4M17 14h3.4"/>'
  };

  var BY_FILE = {
    "real-estate/1": "home",
    "real-estate/3": "exchange",
    "real-estate/4": "building",
    "real-estate/6": "bed",
    "real-estate/10": "percent",
    "real-estate/12": "bath",
    "real-estate/13": "ruler",
    "real-estate/14": "key",
    "real-estate/18": "wallet",
    "real-estate/22": "cube",
    "real-estate/28": "shield",
    "expert/1": "clipboard",
    "expert/7": "award",
    "expert/8": "clipboard",
    "expert/9": "headset",
    "expert/10": "headset",
    "inheritance/14": "document",
    "inheritance/15": "shield"
  };

  function inline(name, size) {
    var body = PATHS[name] || PATHS.home;
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + '</svg>';
  }

  function dataUri(name) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="#122b43" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      (PATHS[name] || PATHS.home) + '</svg>'
    );
  }

  function swap(img) {
    if (!img || img.getAttribute("data-mb-icon")) return;
    var match = (img.getAttribute("src") || "").match(/custom-icons\/([^/]+)\/[^/]+\/(\d+)\.png/);
    if (!match) return;
    img.setAttribute("data-mb-icon", "1");
    img.src = dataUri(BY_FILE[match[1] + "/" + match[2]] || "home");
    img.classList.add("mb-mini-icon");
  }

  function run(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('img[src*="custom-icons"]'), swap);
  }

  window.mbMinimalIcon = inline;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { run(document); });
  } else {
    run(document);
  }

  if (window.MutationObserver) {
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes, function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === "IMG") swap(node);
          run(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
