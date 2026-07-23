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

// src/components/styles/contentMeta.scss
var contentMeta_default = "p.content-meta {\n  margin-top: 0.6rem;\n  margin-bottom: 0.4rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  row-gap: 0.35rem;\n  width: fit-content;\n  max-width: 100%;\n  padding: 0.42rem 0.85rem;\n  border-radius: 0.7rem;\n  background: color-mix(in srgb, var(--secondary) 7%, var(--light));\n  border: 1px solid color-mix(in srgb, var(--secondary) 16%, transparent);\n  font-family: var(--bodyFont);\n  font-size: 0.78rem;\n  line-height: 1.65;\n  letter-spacing: 0;\n  color: var(--darkgray);\n}\np.content-meta .cm-item {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  gap: 0.3rem;\n  white-space: nowrap;\n  cursor: help;\n  color: inherit;\n  padding: 0.12rem 0.32rem;\n  border-radius: 0.4rem;\n}\np.content-meta .cm-sep {\n  color: color-mix(in srgb, var(--gray) 55%, transparent);\n  user-select: none;\n}\np.content-meta a.cm-item {\n  cursor: pointer;\n  color: inherit;\n  font-weight: inherit;\n  line-height: inherit;\n  text-decoration: none;\n  background-color: transparent;\n  background-image: none;\n  transition: color 0.12s ease, background-color 0.12s ease;\n}\np.content-meta a.cm-item:hover {\n  color: var(--secondary);\n  background-color: color-mix(in srgb, var(--secondary) 13%, transparent);\n}\np.content-meta a.cm-item .cm-text {\n  text-decoration: none;\n}\np.content-meta .cm-item[data-tip]:hover::before, p.content-meta .cm-item[data-tip]:focus-visible::before {\n  content: attr(data-tip);\n  position: absolute;\n  bottom: calc(100% + 0.5rem);\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 20;\n  padding: 0.32rem 0.6rem;\n  border-radius: 0.45rem;\n  background: var(--dark);\n  color: var(--light);\n  font-family: var(--bodyFont);\n  font-size: 0.72rem;\n  font-weight: 400;\n  line-height: 1.5;\n  letter-spacing: 0;\n  white-space: normal;\n  width: max-content;\n  max-width: min(72vw, 250px);\n  text-align: center;\n  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);\n  pointer-events: none;\n}\np.content-meta .cm-emoji {\n  font-size: 0.98em;\n  line-height: 1;\n  unicode-bidi: isolate;\n}\np.content-meta .cm-text {\n  font-variant-numeric: tabular-nums;\n}\np.content-meta time.cm-text {\n  color: inherit;\n  border: none;\n}";
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

// src/components/ContentMeta.tsx
var SLUG_STATUS = "growth-status";
var SLUG_PLANTED = "by-planting";
var SLUG_WATERED = "by-watering";
var defaultOptions = {
  showStatus: true,
  showWordCount: true,
  showDates: true
};
var SEEDLING = { emoji: "\u{1F331}", label: "\u0646\u0648\u067E\u0627" };
var BUDDING = { emoji: "\u{1F33F}", label: "\u062F\u0631 \u062D\u0627\u0644 \u0631\u0634\u062F" };
var EVERGREEN = { emoji: "\u{1F333}", label: "\u0628\u0627\u0644\u063A" };
var GROWTH_STATES = {
  seedling: SEEDLING,
  budding: BUDDING,
  evergreen: EVERGREEN
};
var GROWTH_ALIASES = {
  seed: "seedling",
  sprout: "seedling",
  growing: "budding",
  mature: "evergreen",
  "\u0646\u0648\u067E\u0627": "seedling",
  "\u062F\u0631 \u062D\u0627\u0644 \u0631\u0634\u062F": "budding",
  "\u062F\u0631\u062D\u0627\u0644 \u0631\u0634\u062F": "budding",
  "\u0628\u0627\u0644\u063A": "evergreen"
};
function resolveGrowth(raw) {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (GROWTH_STATES[lower]) {
      return GROWTH_STATES[lower];
    }
    const canonical = GROWTH_ALIASES[trimmed] ?? GROWTH_ALIASES[lower];
    if (canonical && GROWTH_STATES[canonical]) {
      return GROWTH_STATES[canonical];
    }
  }
  return SEEDLING;
}
function countWords(text) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}
function toFaDigits(n2) {
  return n2.toLocaleString("fa-IR");
}
function formatFa(date) {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
var ContentMeta_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  function ContentMetadata({ fileData, displayClass }) {
    const text = fileData.text;
    if (!text) {
      return null;
    }
    const here = fileData.slug ?? "";
    const segments = [];
    if (options.showStatus) {
      const fm = fileData.frontmatter;
      const growth = resolveGrowth(fm?.growth ?? fm?.status);
      segments.push(
        /* @__PURE__ */ u2(
          "a",
          {
            class: "cm-item cm-status",
            href: resolveRelative(here, SLUG_STATUS),
            "data-tip": `\u0648\u0636\u0639\u06CC\u062A \u0631\u0634\u062F: ${growth.label} \u2014 \u0641\u0644\u0633\u0641\u0647\u200C\u0627\u0634`,
            "aria-label": `\u0648\u0636\u0639\u06CC\u062A \u0631\u0634\u062F: ${growth.label}`,
            children: [
              /* @__PURE__ */ u2("span", { class: "cm-emoji", "aria-hidden": "true", children: growth.emoji }),
              /* @__PURE__ */ u2("span", { class: "cm-text", children: growth.label })
            ]
          }
        )
      );
    }
    if (options.showWordCount) {
      const words = countWords(text);
      segments.push(
        /* @__PURE__ */ u2(
          "span",
          {
            class: "cm-item cm-words",
            "data-tip": "\u062A\u0639\u062F\u0627\u062F \u06A9\u0644\u0645\u0627\u062A \u0627\u06CC\u0646 \u0646\u0648\u0634\u062A\u0647",
            "aria-label": "\u062A\u0639\u062F\u0627\u062F \u06A9\u0644\u0645\u0627\u062A \u0627\u06CC\u0646 \u0646\u0648\u0634\u062A\u0647",
            children: [
              /* @__PURE__ */ u2("span", { class: "cm-emoji", "aria-hidden": "true", children: "\u{1F4C4}" }),
              /* @__PURE__ */ u2("span", { class: "cm-text", children: [
                toFaDigits(words),
                " \u06A9\u0644\u0645\u0647"
              ] })
            ]
          }
        )
      );
    }
    if (options.showDates && fileData.dates) {
      const created = fileData.dates.created;
      const modified = fileData.dates.modified;
      if (created) {
        segments.push(
          /* @__PURE__ */ u2(
            "a",
            {
              class: "cm-item cm-planted",
              href: resolveRelative(here, SLUG_PLANTED),
              "data-tip": "\u062A\u0627\u0631\u06CC\u062E\u0650 \u06A9\u0627\u0634\u062A (\u0627\u0648\u0644\u06CC\u0646 \u0627\u0646\u062A\u0634\u0627\u0631) \u2014 \u0647\u0645\u0647 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0627\u0646\u062A\u0634\u0627\u0631",
              "aria-label": "\u062A\u0627\u0631\u06CC\u062E\u0650 \u06A9\u0627\u0634\u062A (\u0627\u0648\u0644\u06CC\u0646 \u0627\u0646\u062A\u0634\u0627\u0631)",
              children: [
                /* @__PURE__ */ u2("span", { class: "cm-emoji", "aria-hidden": "true", children: "\u{1F331}" }),
                /* @__PURE__ */ u2("time", { datetime: created.toISOString(), class: "cm-text", children: formatFa(created) })
              ]
            }
          )
        );
      }
      if (modified) {
        segments.push(
          /* @__PURE__ */ u2(
            "a",
            {
              class: "cm-item cm-watered",
              href: resolveRelative(here, SLUG_WATERED),
              "data-tip": "\u0622\u062E\u0631\u06CC\u0646 \u0622\u0628\u06CC\u0627\u0631\u06CC (\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC) \u2014 \u0647\u0645\u0647 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0622\u062E\u0631\u06CC\u0646 \u062A\u063A\u06CC\u06CC\u0631",
              "aria-label": "\u0622\u062E\u0631\u06CC\u0646 \u0622\u0628\u06CC\u0627\u0631\u06CC (\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC)",
              children: [
                /* @__PURE__ */ u2("span", { class: "cm-emoji", "aria-hidden": "true", children: "\u{1F4A7}" }),
                /* @__PURE__ */ u2("time", { datetime: modified.toISOString(), class: "cm-text", children: formatFa(modified) })
              ]
            }
          )
        );
      }
    }
    if (segments.length === 0) {
      return null;
    }
    const withSeparators = [];
    segments.forEach((seg, i2) => {
      if (i2 > 0) {
        withSeparators.push(
          /* @__PURE__ */ u2("span", { class: "cm-sep", "aria-hidden": "true", children: "\xB7" })
        );
      }
      withSeparators.push(seg);
    });
    return /* @__PURE__ */ u2("p", { class: ["content-meta", displayClass].filter(Boolean).join(" "), children: withSeparators });
  }
  ContentMetadata.css = contentMeta_default;
  return ContentMetadata;
});

// src/components/styles/archiveList.scss
var archiveList_default = ".archive-list {\n  margin-top: 0.5rem;\n}\n.archive-list ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.archive-list .archive-row {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0.5rem 0.2rem;\n  border-bottom: 1px solid color-mix(in srgb, var(--gray) 22%, transparent);\n}\n.archive-list .archive-row:last-child {\n  border-bottom: none;\n}\n.archive-list .archive-title {\n  font-family: var(--bodyFont);\n  font-weight: 600;\n  font-size: 1rem;\n}\n.archive-list .archive-date {\n  flex: none;\n  font-family: var(--bodyFont);\n  font-size: 0.78rem;\n  color: var(--gray);\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}";

// src/components/ArchiveList.tsx
function archiveKind(slug2) {
  if (slug2 === "by-planting") return "created";
  if (slug2 === "by-watering") return "modified";
  return null;
}
function isSystemSlug(slug2) {
  if (!slug2) return true;
  if (slug2 === "index" || slug2.endsWith("/index")) return true;
  if (slug2 === "404") return true;
  if (slug2 === "tags" || slug2.startsWith("tags/")) return true;
  if (slug2 === "by-planting" || slug2 === "by-watering" || slug2 === "growth-status") return true;
  return false;
}
function formatFa2(date) {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
var ArchiveList_default = (() => {
  function ArchiveList({ fileData, allFiles }) {
    const currentSlug = fileData.slug ?? "";
    const kind = archiveKind(currentSlug);
    if (!kind) {
      return null;
    }
    const pages = allFiles.filter((p2) => {
      const slug2 = p2.slug ?? "";
      if (isSystemSlug(slug2)) return false;
      if (p2.unlisted === true) return false;
      return Boolean(p2.dates?.[kind]);
    }).sort((a2, b2) => (b2.dates[kind].getTime() ?? 0) - (a2.dates[kind].getTime() ?? 0));
    if (pages.length === 0) {
      return null;
    }
    return /* @__PURE__ */ u2("div", { class: `archive-list archive-${kind}`, children: /* @__PURE__ */ u2("ul", { children: pages.map((p2) => {
      const date = p2.dates[kind];
      const title = p2.frontmatter?.title ?? p2.slug;
      return /* @__PURE__ */ u2("li", { class: "archive-row", children: [
        /* @__PURE__ */ u2(
          "a",
          {
            class: "archive-title",
            href: resolveRelative(currentSlug, p2.slug),
            children: title
          }
        ),
        /* @__PURE__ */ u2("time", { class: "archive-date", datetime: date.toISOString(), children: formatFa2(date) })
      ] });
    }) }) });
  }
  ArchiveList.css = archiveList_default;
  return ArchiveList;
});

export { ArchiveList_default as ArchiveList, ContentMeta_default as ContentMeta };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map