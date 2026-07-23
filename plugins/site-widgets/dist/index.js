import { createRequire } from 'module';

createRequire(import.meta.url);

// node_modules/@quartz-community/utils/dist/path.js
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  if (endsWith(s2, suffix)) {
    s2 = s2.slice(0, -suffix.length);
  }
  return s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) {
    s2 = s2.substring(1);
  }
  if (!onlyStripPrefix && s2.endsWith("/")) {
    s2 = s2.slice(0, -1);
  }
  return s2;
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x2) => x2 !== "").slice(0, -1).map((_2) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}

// src/components/styles/topics.scss
var topics_default = ".topics {\n  display: flex;\n  flex-direction: column;\n}\n.topics > h3 {\n  font-size: 1rem;\n  margin: 0;\n}\n.topics > ul.topics-ul {\n  list-style: none;\n  padding: 0;\n  margin: 0.5rem 0 0 0;\n}\n.topics > ul.topics-ul > li {\n  margin: 0.35rem 0;\n}\n.topics > ul.topics-ul > li > a {\n  background-color: transparent;\n}";
var l;
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/Topics.tsx
var defaultOptions = {
  title: "\u0645\u0648\u0636\u0648\u0639\u0627\u062A \u0627\u0635\u0644\u06CC",
  items: [
    { title: "\u0630\u0647\u0646 \u062F\u0648\u0645", href: "second-mind" },
    { title: "\u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u062F\u0631 \u062F\u06CC\u062C\u06CC\u200C\u06A9\u0627\u0644\u0627", href: "digikala-pricing" },
    { title: "\u0648\u0636\u0639\u06CC\u062A \u0631\u0634\u062F \u0646\u0648\u0634\u062A\u0647\u200C\u0647\u0627", href: "growth-status" },
    { title: "\u062F\u0631\u0628\u0627\u0631\u0647", href: "about" }
  ]
};
function isExternal(href) {
  return /^https?:\/\//.test(href);
}
var Topics_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const Topics = ({ fileData, displayClass }) => {
    const items = options.items ?? [];
    if (items.length === 0) {
      return null;
    }
    const currentSlug = fileData.slug ?? "";
    return /* @__PURE__ */ u2("div", { class: `topics ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ u2("h3", { children: options.title }),
      /* @__PURE__ */ u2("ul", { class: "topics-ul", children: items.map((item) => {
        const external = isExternal(item.href);
        const href = external ? item.href : resolveRelative(currentSlug, item.href);
        return /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2(
          "a",
          {
            href,
            class: external ? "external" : "internal",
            ...external ? { target: "_blank", rel: "noopener" } : {},
            children: item.title
          }
        ) });
      }) })
    ] });
  };
  Topics.css = topics_default;
  return Topics;
});

// src/components/styles/backlinks.scss
var backlinks_default = ".backlinks {\n  display: flex;\n  flex-direction: column;\n}\n.backlinks > h3 {\n  font-size: 1rem;\n  margin: 0;\n}\n.backlinks > ul.backlinks-ul {\n  list-style: none;\n  padding: 0;\n  margin: 0.5rem 0 0 0;\n}\n.backlinks > ul.backlinks-ul > li {\n  margin: 0.35rem 0;\n}\n.backlinks > ul.backlinks-ul > li > a {\n  background-color: transparent;\n}\n.backlinks > ul.backlinks-ul > li.backlinks-empty {\n  color: var(--gray, #6e6e6e);\n  opacity: 0.7;\n  font-size: 0.9rem;\n}";

// src/components/Backlinks.tsx
var defaultOptions2 = {
  title: "\u0627\u0631\u062C\u0627\u0639\u200C\u0647\u0627 \u0628\u0647 \u0627\u06CC\u0646 \u0646\u0648\u0634\u062A\u0647",
  hideWhenEmpty: true,
  emptyText: "\u0647\u0646\u0648\u0632 \u0646\u0648\u0634\u062A\u0647\u200C\u0627\u06CC \u0628\u0647 \u0627\u06CC\u0646\u200C\u062C\u0627 \u0627\u0631\u062C\u0627\u0639 \u0646\u062F\u0627\u062F\u0647"
};
function selectBacklinkSources(allFiles, currentSlug) {
  return allFiles.filter(
    (file) => file.unlisted !== true && file.links?.includes(currentSlug)
  );
}
var Backlinks_default = ((opts) => {
  const options = { ...defaultOptions2, ...opts };
  const Backlinks = ({
    fileData,
    allFiles,
    displayClass
  }) => {
    const slug2 = simplifySlug(fileData.slug);
    const backlinks = selectBacklinkSources(allFiles, slug2);
    if (options.hideWhenEmpty && backlinks.length === 0) {
      return null;
    }
    return /* @__PURE__ */ u2("div", { class: `backlinks ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ u2("h3", { children: options.title }),
      /* @__PURE__ */ u2("ul", { class: "backlinks-ul", children: backlinks.length > 0 ? backlinks.map((f3) => /* @__PURE__ */ u2("li", { children: /* @__PURE__ */ u2(
        "a",
        {
          href: resolveRelative(fileData.slug, f3.slug),
          class: "internal",
          children: f3.frontmatter?.title ?? f3.slug
        }
      ) })) : /* @__PURE__ */ u2("li", { class: "backlinks-empty", children: options.emptyText }) })
    ] });
  };
  Backlinks.css = backlinks_default;
  return Backlinks;
});

// src/components/styles/toc.scss
var toc_default = ".site-toc {\n  margin: 1.75rem 0 2rem;\n  padding: 0.7rem 1.1rem 0.85rem;\n  background: var(--lightgray);\n  border-radius: 10px;\n}\n.site-toc .site-toc-header {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  width: 100%;\n  background: transparent;\n  border: none;\n  padding: 0;\n  margin: 0;\n  cursor: pointer;\n  color: var(--dark);\n  text-align: inherit;\n}\n.site-toc .site-toc-header h3 {\n  margin: 0;\n  font-size: 1rem;\n}\n.site-toc .site-toc-header .site-toc-fold {\n  flex: 0 0 auto;\n  transition: transform 0.25s ease;\n  opacity: 0.8;\n}\n.site-toc .site-toc-list {\n  list-style: none;\n  margin: 0.6rem 0 0;\n  padding: 0;\n  overflow: hidden;\n  max-height: 60rem;\n  opacity: 1;\n  transition: max-height 0.3s ease, opacity 0.25s ease, margin 0.3s ease;\n}\n.site-toc .site-toc-list > li {\n  margin: 0.3rem 0;\n}\n.site-toc .site-toc-list > li > a {\n  color: var(--secondary);\n  opacity: 0.85;\n  background: transparent;\n  transition: opacity 0.3s ease, color 0.3s ease;\n}\n.site-toc .site-toc-list > li > a:hover, .site-toc .site-toc-list > li > a.in-view {\n  opacity: 1;\n  text-decoration: underline;\n}\n.site-toc .site-toc-list .depth-0 {\n  padding-inline-start: calc(0.9rem * 0);\n}\n.site-toc .site-toc-list .depth-1 {\n  padding-inline-start: calc(0.9rem * 1);\n}\n.site-toc .site-toc-list .depth-2 {\n  padding-inline-start: calc(0.9rem * 2);\n}\n.site-toc .site-toc-list .depth-3 {\n  padding-inline-start: calc(0.9rem * 3);\n}\n.site-toc .site-toc-list .depth-4 {\n  padding-inline-start: calc(0.9rem * 4);\n}\n.site-toc .site-toc-list .depth-5 {\n  padding-inline-start: calc(0.9rem * 5);\n}\n.site-toc .site-toc-list .depth-6 {\n  padding-inline-start: calc(0.9rem * 6);\n}\n.site-toc.collapsed .site-toc-fold {\n  transform: rotate(-90deg);\n}\n.site-toc.collapsed .site-toc-list {\n  max-height: 0;\n  opacity: 0;\n  margin-top: 0;\n}";

// src/components/scripts/toc.inline.ts
var toc_inline_default = '// @ts-nocheck\n// Highlight the current section\'s TOC entry as it scrolls into view.\nconst observer = new IntersectionObserver((entries) => {\n  for (const entry of entries) {\n    const slug = entry.target.id;\n    const links = document.querySelectorAll(`.site-toc a[data-for="${slug}"]`);\n    const windowHeight = entry.rootBounds?.height;\n    if (windowHeight && links.length > 0) {\n      if (entry.boundingClientRect.y < windowHeight) {\n        links.forEach((l) => l.classList.add("in-view"));\n      } else {\n        links.forEach((l) => l.classList.remove("in-view"));\n      }\n    }\n  }\n});\n\nfunction toggleToc() {\n  const toc = this.closest(".site-toc");\n  if (!toc) return;\n  const nowCollapsed = toc.classList.toggle("collapsed");\n  this.setAttribute("aria-expanded", nowCollapsed ? "false" : "true");\n}\n\nfunction setupToc() {\n  const buttons = document.querySelectorAll(".site-toc .site-toc-header");\n  buttons.forEach((button) => {\n    button.addEventListener("click", toggleToc);\n    const cleanup = () => button.removeEventListener("click", toggleToc);\n    if (window.addCleanup) window.addCleanup(cleanup);\n  });\n\n  observer.disconnect();\n  const headers = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");\n  headers.forEach((header) => observer.observe(header));\n}\n\ndocument.addEventListener("nav", setupToc);\ndocument.addEventListener("render", setupToc);\n';

// src/components/TableOfContents.tsx
var defaultOptions3 = {
  title: "\u0641\u0647\u0631\u0633\u062A \u0645\u0637\u0627\u0644\u0628",
  collapseByDefault: false
};
var TableOfContents_default = ((opts) => {
  const options = { ...defaultOptions3, ...opts };
  const TableOfContents = ({
    fileData,
    displayClass
  }) => {
    const toc = fileData.toc;
    if (!toc || toc.length === 0) {
      return null;
    }
    const collapsed = options.collapseByDefault;
    return /* @__PURE__ */ u2("div", { class: `site-toc ${collapsed ? "collapsed" : ""} ${displayClass ?? ""}`, children: [
      /* @__PURE__ */ u2(
        "button",
        {
          type: "button",
          class: "site-toc-header",
          "aria-expanded": collapsed ? "false" : "true",
          children: [
            /* @__PURE__ */ u2(
              "svg",
              {
                class: "site-toc-fold",
                xmlns: "http://www.w3.org/2000/svg",
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "aria-hidden": "true",
                children: /* @__PURE__ */ u2("polyline", { points: "6 9 12 15 18 9" })
              }
            ),
            /* @__PURE__ */ u2("h3", { children: options.title })
          ]
        }
      ),
      /* @__PURE__ */ u2("ul", { class: "site-toc-list", children: toc.map((e2) => /* @__PURE__ */ u2("li", { class: `depth-${e2.depth}`, children: /* @__PURE__ */ u2("a", { href: `#${e2.slug}`, "data-for": e2.slug, children: e2.text }) })) })
    ] });
  };
  TableOfContents.css = toc_default;
  TableOfContents.afterDOMLoaded = toc_inline_default;
  return TableOfContents;
});

export { Backlinks_default as SiteBacklinks, TableOfContents_default as SiteToc, Topics_default as Topics };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map