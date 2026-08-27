/* Mobile hamburger navigation drawer.
   Standalone, dependency-free, loaded as a plain `defer data-persist` script — it is
   NOT part of Quartz's module bootstrap, so it can never break navigation/darkmode.
   It adds a hamburger button to the mobile toolbar and a slide-in drawer populated
   from the curated "موضوعات اصلی" (.topics) links. Desktop is untouched: the button
   and drawer are hidden via CSS above 800px. */
(function () {
  "use strict";

  var drawer = null;
  var backdrop = null;
  var isOpen = false;

  function rootHref() {
    var t = document.querySelector(".page-title a, h2.page-title a");
    return t ? t.getAttribute("href") : "/";
  }

  function collectLinks() {
    var links = [];
    var ul = document.querySelector(".topics .topics-ul, .topics ul");
    if (ul) {
      var anchors = ul.querySelectorAll("a");
      for (var i = 0; i < anchors.length; i++) {
        var href = anchors[i].getAttribute("href");
        var text = (anchors[i].textContent || "").trim();
        if (href && text) links.push({ href: href, text: text });
      }
    }
    return links;
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    var btn = document.querySelector(".mobile-menu-toggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("mobile-menu-open");
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    var btn = document.querySelector(".mobile-menu-toggle");
    if (btn) btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("mobile-menu-open");
  }

  function toggleMenu() {
    if (isOpen) closeMenu();
    else openMenu();
  }

  function ensureBackdrop() {
    if (backdrop && document.body.contains(backdrop)) return;
    backdrop = document.createElement("div");
    backdrop.className = "mobile-menu-backdrop";
    backdrop.addEventListener("click", closeMenu);
    document.body.appendChild(backdrop);
  }

  function ensureDrawer(links) {
    if (!drawer || !document.body.contains(drawer)) {
      drawer = document.createElement("nav");
      drawer.className = "mobile-menu-drawer";
      drawer.setAttribute("aria-label", "منوی موبایل");
      document.body.appendChild(drawer);
    }
    var html =
      '<div class="mobile-menu-head"><span>منو</span>' +
      '<button class="mobile-menu-close" aria-label="بستن منو" type="button">&times;</button></div>' +
      '<ul class="mobile-menu-list">';
    html += '<li><a href="' + rootHref() + '">خانه</a></li>';
    for (var i = 0; i < links.length; i++) {
      html += '<li><a href="' + links[i].href + '">' + links[i].text + "</a></li>";
    }
    html += "</ul>";
    drawer.innerHTML = html;

    var closeX = drawer.querySelector(".mobile-menu-close");
    if (closeX) closeX.addEventListener("click", closeMenu);
    var as = drawer.querySelectorAll("a");
    for (var j = 0; j < as.length; j++) {
      as[j].addEventListener("click", closeMenu);
    }
  }

  function ensureToggle() {
    var sidebar = document.querySelector(".sidebar.left");
    if (!sidebar) return;
    if (sidebar.querySelector(".mobile-menu-toggle")) return; // already there
    var btn = document.createElement("button");
    btn.className = "mobile-menu-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "باز کردن منو");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line>' +
      '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    btn.addEventListener("click", toggleMenu);
    sidebar.insertBefore(btn, sidebar.firstChild);
  }

  function init() {
    ensureToggle();
    ensureBackdrop();
    ensureDrawer(collectLinks());
    closeMenu();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // Quartz SPA swaps the DOM without a reload — rebuild after every navigation.
  document.addEventListener("nav", init);
})();
