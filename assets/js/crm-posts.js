/* Maison Benali — CRM → site, articles du blog
 *
 * PAGE LISTE (blog.html)
 *   <div data-crm-posts></div> reçoit une carte par article publié dans le CRM.
 *
 * PAGE ARTICLE (blog-details.html?post=<slug>)
 *   les éléments marqués data-crm-post="…" sont remplis depuis le CRM.
 *   Sans paramètre, le premier article publié est affiché.
 *
 * URL du CRM : window.MB_CRM_URL, posé par assets/js/crm-config.js.
 */
(function () {
  "use strict";

  var CRM = String(
    window.MB_CRM_URL || document.documentElement.getAttribute("data-crm-url") || ""
  ).replace(/\/$/, "");
  if (!CRM) return;

  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fetchPosts(slug) {
    var url = CRM + "/api/public/posts";
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

  function articleUrl(post) {
    return "blog-details?post=" + encodeURIComponent(post.slug);
  }

  /* ---------------------------------------------------------------- liste */

  function cardMarkup(post, index) {
    var href = articleUrl(post);
    var cover = post.coverUrl
      ? '<img src="' + esc(post.coverUrl) + '" alt="' + esc(post.title) + '" loading="lazy">'
      : '<span class="mb-blog-card-nophoto"></span>';

    return (
      '<article class="mb-blog-card" data-aos="fade-up" data-aos-duration="' + (900 + index * 120) + '">' +
        '<a class="mb-blog-card-media" href="' + href + '">' + cover +
          '<span class="mb-blog-card-badge">' + esc(post.category) + "</span>" +
        "</a>" +
        '<div class="mb-blog-card-body">' +
          '<p class="mb-blog-card-meta">' +
            '<span><i class="far fa-clock"></i> ' + esc(post.readMinutes) + " min de lecture</span>" +
            '<span><i class="far fa-calendar-alt"></i> ' + esc(post.year) + "</span>" +
          "</p>" +
          '<h3 class="mb-blog-card-title"><a href="' + href + '">' + esc(post.title) + "</a></h3>" +
          '<p class="mb-blog-card-excerpt">' + esc(post.excerpt) + "</p>" +
          '<div class="mb-blog-card-foot">' +
            '<a class="mb-blog-readmore" href="' + href + '">Lire l\'article <i class="far fa-arrow-right"></i></a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderList(container, posts) {
    if (!posts.length) {
      container.innerHTML = "";
      var empty = document.getElementById("crmPostsEmpty");
      if (empty) empty.hidden = false;
      return;
    }
    container.innerHTML = posts.map(cardMarkup).join("");
    if (typeof AOS !== "undefined" && AOS.refresh) AOS.refresh();
  }

  /* --------------------------------------------------------------- article */

  function paragraphs(text) {
    return String(text || "")
      .split(/\n\s*\n/)
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean)
      .map(function (block) {
        return "<p>" + esc(block).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function setText(selector, value) {
    if (value === null || value === undefined || value === "") return;
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (node) {
      node.textContent = value;
    });
  }

  function fillArticle(post) {
    document.title = "Maison Benali - " + post.title;
    setText('[data-crm-post="category"]', post.category);
    setText('[data-crm-post="title"]', post.title);
    setText('[data-crm-post="readTime"]', post.readMinutes + " min de lecture");
    setText('[data-crm-post="year"]', post.year);
    setText('[data-crm-post="excerpt"]', post.excerpt);

    Array.prototype.forEach.call(document.querySelectorAll('[data-crm-post="cover"]'), function (img) {
      if (post.coverUrl) {
        img.setAttribute("src", post.coverUrl);
        img.setAttribute("alt", post.title);
      }
    });

    var body = document.querySelector('[data-crm-post="body"]');
    if (body) body.innerHTML = paragraphs(post.content);

    Array.prototype.forEach.call(document.querySelectorAll('[data-crm-post="back"]'), function (link) {
      link.setAttribute("href", "blog");
    });
  }

  /* ---------------------------------------------------------------- route */

  var listContainer = document.querySelector("[data-crm-posts]");
  if (listContainer) {
    fetchPosts(null).then(function (posts) {
      if (Array.isArray(posts)) renderList(listContainer, posts);
    });
  }

  var articleRoot = document.querySelector("[data-crm-post]");
  if (articleRoot) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("post") || params.get("slug");
    fetchPosts(slug).then(function (data) {
      var post = Array.isArray(data) ? data[0] : data;
      if (post) fillArticle(post);
    });
  }
})();
