/*
 * view-counter.js — dynamic per-article read counter backed by Firebase Realtime DB.
 *
 * How it counts a "read":
 *   - On an article page, the current count is shown immediately (read-only).
 *   - A read is only recorded after the visitor spends >= 20s of *visible* time
 *     on the page (Page Visibility API — a backgrounded tab does not accrue time).
 *   - Each browser counts an article at most once (localStorage de-dup).
 *
 * Storage: Firebase RTDB REST. Security rules only allow +1 increments, so a
 * write can never set an arbitrary value. Increment uses read-then-PUT with
 * retry to survive the rare concurrent-write rule rejection.
 *
 * The whole thing is best-effort: any network/permission failure fails silently
 * and never breaks the page.
 */
(function () {
  "use strict";

  /* ───────────────────────────────────────────────────────────────────────────
   *  Dear hengker hengker 👋
   *
   *  Iya, URL/config Firebase di bawah ini emang publik — dan itu MEMANG by design,
   *  bukan bug, bukan misconfig. Sebelum ngetik "Firebase API key exposed" di
   *  laporan, baca dulu ya, ntar N/A malu sendiri 😄
   *
   *    • Firebase apiKey/databaseURL itu identifier project, BUKAN secret. Google
   *      sendiri bilang aman ditaruh di client. Keamanannya dari Security Rules,
   *      bukan dari nyembunyiin URL.
   *    • Yang ke-expose di sini cuma databaseURL (endpoint). apiKey-nya malah nggak
   *      ikut ke-commit sama sekali.
   *    • Rules-nya: /reads read-only publik, write cuma boleh naik +1. Coba deh:
   *        - set angka sembarang (mis. 9999)  → 401 Permission denied
   *        - hapus / set null / decrement      → 401 Permission denied
   *        - baca/tulis path lain selain /reads → 401 Permission denied
   *    • Nol data sensitif. Isinya cuma: slug artikel → angka view. Itu doang.
   *
   *  Jadi worst case? Orang iseng bisa naikin angka view gw +1 berkali-kali.
   *  Bukan breach, cuma bikin gw kelihatan lebih populer dari aslinya wkwk.
   *  Makasih udah peduli sama keamanan gw sih, salam dari sesama researcher 🤝
   * ─────────────────────────────────────────────────────────────────────────── */
  var DB = "https://ryuu-portofolio-default-rtdb.asia-southeast1.firebasedatabase.app";
  var READ_THRESHOLD_MS = 20000; // 20 seconds of visible time
  var EYE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>' +
    '<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>';

  // ---- helpers -----------------------------------------------------------

  function slugFromPath(pathname) {
    // /blog/<slug>/  ->  <slug>   (returns "" for the /blog/ listing itself)
    var parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[parts.length - 2] === "blog") {
      return parts[parts.length - 1];
    }
    return "";
  }

  function slugFromHref(href) {
    try {
      var p = new URL(href, location.href).pathname.split("/").filter(Boolean);
      var last = p[p.length - 1];
      return last && last !== "blog" ? last : "";
    } catch (e) {
      return "";
    }
  }

  function isValidSlug(s) {
    // RTDB keys can't contain . # $ [ ] / — our slugs are [a-z0-9-] anyway.
    return /^[a-z0-9-]+$/.test(s);
  }

  function formatFull(n) {
    return (n || 0).toLocaleString("en-US");
  }

  function formatCompact(n) {
    n = n || 0;
    if (n < 1000) return String(n);
    if (n < 1000000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "k";
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function getCount(slug) {
    return fetch(DB + "/reads/" + slug + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) { return typeof v === "number" ? v : 0; })
      .catch(function () { return null; });
  }

  function getAllCounts() {
    return fetch(DB + "/reads.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) { return v && typeof v === "object" ? v : {}; })
      .catch(function () { return {}; });
  }

  function incrementCount(slug) {
    // read-then-PUT with retry; rule enforces newValue === oldValue + 1
    var url = DB + "/reads/" + slug + ".json";
    function attempt(tries) {
      return getCount(slug).then(function (cur) {
        if (cur === null) return null; // network down — give up quietly
        var next = cur + 1;
        return fetch(url, { method: "PUT", body: JSON.stringify(next) }).then(function (res) {
          if (res.ok) return next;
          if (tries <= 0) return null;
          return sleep(150 + Math.random() * 250).then(function () { return attempt(tries - 1); });
        });
      });
    }
    return attempt(4).catch(function () { return null; });
  }

  // ---- article page ------------------------------------------------------

  function initArticle(slug) {
    var meta = document.querySelector(".article-author-section .author-meta");
    if (!meta) return;

    var el = document.createElement("div");
    el.className = "read-count";
    el.setAttribute("title", "Reads (counted after 20 seconds)");
    el.innerHTML = EYE + ' <span class="read-count-num">—</span>&nbsp;reads';
    meta.appendChild(el);
    var numEl = el.querySelector(".read-count-num");

    getCount(slug).then(function (c) {
      if (c === null) { el.style.display = "none"; return; } // hide if backend unreachable
      numEl.textContent = formatFull(c);
    });

    var storeKey = "vc_read_" + slug;
    var alreadyCounted = false;
    try { alreadyCounted = localStorage.getItem(storeKey) === "1"; } catch (e) {}
    if (alreadyCounted) return; // this browser already counted this article

    var visibleMs = 0;
    var last = Date.now();
    var done = false;

    function record() {
      done = true;
      try { localStorage.setItem(storeKey, "1"); } catch (e) {}
      incrementCount(slug).then(function (n) {
        if (n !== null) numEl.textContent = formatFull(n);
      });
    }

    var timer = setInterval(function () {
      var now = Date.now();
      if (document.visibilityState === "visible") visibleMs += now - last;
      last = now;
      if (!done && visibleMs >= READ_THRESHOLD_MS) {
        clearInterval(timer);
        record();
      }
    }, 1000);

    document.addEventListener("visibilitychange", function () {
      last = Date.now(); // reset delta so hidden time isn't counted
    });
  }

  // ---- listing cards (blog index + homepage) -----------------------------

  function badge(count) {
    var span = document.createElement("span");
    span.className = "read-count-badge";
    span.setAttribute("title", formatFull(count) + " reads");
    span.innerHTML = EYE + " " + formatCompact(count);
    return span;
  }

  function initListing(counts) {
    // /blog listing cards
    document.querySelectorAll("#articlesContainer .article-item").forEach(function (card) {
      var link = card.querySelector("a[href]");
      if (!link) return;
      var slug = slugFromHref(link.getAttribute("href"));
      if (!isValidSlug(slug)) return;
      var target = card.querySelector(".article-meta") || card.querySelector(".article-content");
      if (target) target.appendChild(badge(counts[slug] || 0));
    });

    // homepage "Latest Articles" cards
    document.querySelectorAll("#blog .blog-card").forEach(function (card) {
      var link = card.querySelector("a[href]");
      if (!link) return;
      var slug = slugFromHref(link.getAttribute("href"));
      if (!isValidSlug(slug)) return;
      var b = badge(counts[slug] || 0);
      b.classList.add("read-count-badge--block");
      var content = card.querySelector(".blog-content");
      var readMore = card.querySelector(".blog-read-more");
      if (content && readMore) content.insertBefore(b, readMore);
      else if (content) content.appendChild(b);
    });
  }

  // ---- bootstrap ---------------------------------------------------------

  function start() {
    var articleSlug = slugFromPath(location.pathname);
    var onArticle = !!document.querySelector(".article-content .article-body") && isValidSlug(articleSlug);
    var hasListing = !!document.querySelector("#articlesContainer") || !!document.querySelector("#blog .blog-card");

    if (onArticle) {
      initArticle(articleSlug);
    }
    if (hasListing) {
      getAllCounts().then(function (counts) { initListing(counts); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
