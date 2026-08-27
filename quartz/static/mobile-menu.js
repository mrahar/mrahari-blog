/* Mobile hamburger navigation drawer + site social row + mobile footer.
   Standalone, dependency-free, loaded as a plain `defer data-persist` script — it is
   NOT part of Quartz's module bootstrap, so it can never break navigation/darkmode.
   - Mobile: injects a hamburger button + slide-in drawer (logo, socials, links).
   - All viewports: injects a social row into the <footer>.
   - Mobile: relocates the "آخرین دیدگاه‌ها" widget (built by comments.js) into the
     footer, since the sidebar copy is hidden on phones.
   Desktop layout is otherwise untouched (drawer/toggle hidden via CSS >800px). */
(function () {
  "use strict";

  var EMAIL = "mrahari.com@gmail.com";

  var SVG = {
    telegram:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.31l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.22.22-.4.36-.83.36z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.65c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-4V8z"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.4.6.11.82-.26.82-.58v-2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58C20.57 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"/></svg>',
    email:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  };

  var SOCIALS = {
    telegram: { href: "https://t.me/Mohamadreza_ahari", label: "تلگرام", title: "تلگرام" },
    linkedin: {
      href: "https://www.linkedin.com/in/mohammadreza-ahari-b7343a414",
      label: "لینکدین",
      title: "لینکدین",
    },
    github: { href: "https://github.com/mrahar", label: "گیت‌هاب", title: "گیت‌هاب" },
    email: { label: "کپی ایمیل", title: EMAIL + " — کلیک برای کپی" },
  };

  var ORDER = ["telegram", "linkedin", "github", "email"];

  var drawer = null;
  var backdrop = null;
  var isOpen = false;

  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  function rootHref() {
    var t = document.querySelector(".page-title a, h2.page-title a");
    return t ? t.getAttribute("href") : "/";
  }

  /* ---------- toast (email-copied feedback) ---------- */
  function showToast(msg) {
    var t = document.createElement("div");
    t.className = "mm-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("show");
    });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 300);
    }, 1600);
  }

  function copyEmail(e) {
    if (e) e.preventDefault();
    function done() {
      showToast("ایمیل کپی شد ✅");
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (_) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- social row (used in drawer + footer) ---------- */
  function socialItem(kind) {
    var data = SOCIALS[kind];
    var node;
    if (kind === "email") {
      node = document.createElement("button");
      node.type = "button";
      node.addEventListener("click", copyEmail);
    } else {
      node = document.createElement("a");
      node.href = data.href;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    }
    node.className = "mm-social mm-social-" + kind;
    node.setAttribute("aria-label", data.label);
    node.title = data.title;
    node.innerHTML = SVG[kind];
    return node;
  }

  function buildSocials() {
    var row = document.createElement("div");
    row.className = "social-row";
    for (var i = 0; i < ORDER.length; i++) {
      row.appendChild(socialItem(ORDER[i]));
    }
    return row;
  }

  /* ---------- navigation links (from curated Topics) ---------- */
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

  /* ---------- drawer open/close ---------- */
  function setExpanded(v) {
    var btn = document.querySelector(".mobile-menu-toggle");
    if (btn) btn.setAttribute("aria-expanded", v ? "true" : "false");
  }
  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    setExpanded(false);
    document.documentElement.classList.remove("mobile-menu-open");
  }
  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    setExpanded(true);
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
    drawer.innerHTML = "";

    var close = document.createElement("button");
    close.className = "mobile-menu-close";
    close.type = "button";
    close.setAttribute("aria-label", "بستن منو");
    close.innerHTML = "&times;";
    close.addEventListener("click", closeMenu);
    drawer.appendChild(close);

    var logoWrap = document.createElement("div");
    logoWrap.className = "mm-logo";
    var logoLink = document.createElement("a");
    logoLink.href = rootHref();
    logoLink.addEventListener("click", closeMenu);
    var img = document.createElement("img");
    img.src = rootHref() + "static/logo.svg";
    img.alt = "محمدرضا آهاری";
    logoLink.appendChild(img);
    logoWrap.appendChild(logoLink);
    drawer.appendChild(logoWrap);

    var divider = document.createElement("div");
    divider.className = "mm-divider";
    drawer.appendChild(divider);

    drawer.appendChild(buildSocials());

    var ul = document.createElement("ul");
    ul.className = "mobile-menu-list";
    var items = [{ href: rootHref(), text: "خانه" }];
    for (var i = 0; i < links.length; i++) items.push(links[i]);
    for (var j = 0; j < items.length; j++) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = items[j].href;
      a.textContent = items[j].text;
      a.addEventListener("click", closeMenu);
      li.appendChild(a);
      ul.appendChild(li);
    }
    drawer.appendChild(ul);
  }

  function ensureToggle() {
    var sidebar = document.querySelector(".sidebar.left");
    if (!sidebar) return;
    if (sidebar.querySelector(".mobile-menu-toggle")) return;
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

  /* ---------- footer: social row + (mobile) recent comments ---------- */
  function setupFooter() {
    var footer = document.querySelector("footer");
    if (!footer) return;
    var extra = footer.querySelector(".footer-extra");
    if (!extra) {
      extra = document.createElement("div");
      extra.className = "footer-extra";
      var recentHost = document.createElement("div");
      recentHost.className = "footer-recent-host";
      extra.appendChild(recentHost);
      extra.appendChild(buildSocials());
      footer.insertBefore(extra, footer.firstChild);
    }
    relocateRecent();
  }

  function relocateRecent() {
    if (!isMobile()) return;
    var rec = document.getElementById("sc-recent");
    var host = document.querySelector(".footer-extra .footer-recent-host");
    if (rec && host && rec.parentNode !== host) host.appendChild(rec);
  }

  function scheduleRelocate() {
    var delays = [150, 500, 1200, 2500, 4500];
    for (var i = 0; i < delays.length; i++) setTimeout(relocateRecent, delays[i]);
  }

  /* ---------- init ---------- */
  function init() {
    ensureToggle();
    ensureBackdrop();
    ensureDrawer(collectLinks());
    setupFooter();
    closeMenu();
    scheduleRelocate();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  document.addEventListener("nav", init);
})();
