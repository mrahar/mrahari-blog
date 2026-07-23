/**
 * Self-hosted comments widget for mrahari.com.
 * Talks to /comment-api/ (get.php, post.php). Runs on Quartz SPA "nav" events.
 * All user content is HTML-escaped server-side, so escaped fields use innerHTML safely.
 */
(function () {
  "use strict"

  // Override for local testing: set window.SELF_COMMENTS_API before this script loads.
  var API_BASE = (typeof window !== "undefined" && window.SELF_COMMENTS_API) || "/comment-api"

  // Page addresses this note answers to: canonical slug first, then any aliases
  // (old slugs). Injected by Head as a <meta name="comment-slugs"> (newline-list).
  function commentSlugs() {
    var meta = document.querySelector('meta[name="comment-slugs"]')
    if (!meta || !meta.content) return []
    return meta.content
      .split("\n")
      .map(function (s) {
        return s.trim()
      })
      .filter(Boolean)
  }

  // The canonical page_id new comments are stored under.
  function pageId() {
    var slugs = commentSlugs()
    if (slugs.length) return "/" + slugs[0]
    // Fallback for pages without the meta: derive from the URL (old behaviour).
    var p = window.location.pathname
    p = p.replace(/index\.html$/, "").replace(/\.html$/, "")
    if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1)
    return p || "/"
  }

  // Every page_id variant to read comments from: canonical + aliases, each in raw
  // and percent-encoded form (so comments left under an old Persian URL still show).
  function relatedIds() {
    var slugs = commentSlugs()
    if (!slugs.length) return [pageId()]
    var ids = []
    function add(v) {
      if (ids.indexOf(v) === -1) ids.push(v)
    }
    slugs.forEach(function (s) {
      add("/" + s)
      add(
        "/" +
          s
            .split("/")
            .map(encodeURIComponent)
            .join("/"),
      )
    })
    return ids
  }

  function shamsi(dateStr) {
    try {
      var d = new Date(dateStr.replace(" ", "T"))
      if (isNaN(d.getTime())) return dateStr
      return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d)
    } catch (e) {
      return dateStr
    }
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (html != null) n.innerHTML = html
    return n
  }

  // Build one comment node (recursively renders replies).
  function renderComment(c, pid, depth) {
    var node = el("div", "sc-comment")
    node.id = "comment-" + c.id // anchor target for deep links from the recent-comments widget
    if (depth > 0) node.classList.add("sc-reply")

    var head = el("div", "sc-head")
    head.appendChild(el("span", "sc-author", c.author_name)) // pre-escaped
    head.appendChild(el("span", "sc-date", shamsi(c.created_at)))
    node.appendChild(head)

    node.appendChild(el("div", "sc-body", c.body)) // pre-escaped + <br>

    var actions = el("div", "sc-actions")
    var replyBtn = el("button", "sc-reply-btn", "پاسخ")
    actions.appendChild(replyBtn)
    node.appendChild(actions)

    var replyHolder = el("div", "sc-reply-form")
    node.appendChild(replyHolder)

    replyBtn.addEventListener("click", function () {
      if (replyHolder.firstChild) {
        replyHolder.innerHTML = ""
        replyBtn.textContent = "پاسخ"
        return
      }
      replyBtn.textContent = "لغو"
      replyHolder.appendChild(
        buildForm(pid, c.id, {
          placeholder: "پاسختو بنویس…",
          replyTo: c.author_name, // pre-escaped by server
          onCancel: function () {
            replyHolder.innerHTML = ""
            replyBtn.textContent = "پاسخ"
          },
        }),
      )
    })

    if (c.replies && c.replies.length) {
      var kids = el("div", "sc-children")
      for (var i = 0; i < c.replies.length; i++) {
        kids.appendChild(renderComment(c.replies[i], pid, depth + 1))
      }
      node.appendChild(kids)
    }
    return node
  }

  // Build a comment form. opts = { placeholder, replyTo, onCancel }. No opts = top-level.
  function buildForm(pid, parentId, opts) {
    opts = opts || {}
    var startTime = Date.now()
    var form = el("form", "sc-form")
    if (opts.replyTo) form.classList.add("sc-form-reply")

    var head = ""
    if (opts.replyTo) {
      head =
        '<div class="sc-reply-head">' +
        '<span>در پاسخ به <b class="sc-reply-to"></b></span>' +
        '<button type="button" class="sc-cancel">لغو</button>' +
        "</div>"
    }

    form.innerHTML =
      head +
      '<div class="sc-field-row">' +
      '  <input class="sc-name" type="text" name="author_name" placeholder="اسمت *" maxlength="100" required>' +
      '  <input class="sc-email" type="email" name="author_email" placeholder="ایمیل (اختیاری)" maxlength="255">' +
      "</div>" +
      '<textarea class="sc-textarea" name="body" placeholder="' + (opts.placeholder || "نظرتو بنویس…") + '" maxlength="5000" required></textarea>' +
      // honeypot — hidden from humans, bots fill it
      '<input class="sc-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="sc-form-foot">' +
      '  <span class="sc-msg"></span>' +
      '  <button class="sc-submit" type="submit">ثبت نظر</button>' +
      "</div>"

    if (opts.replyTo) {
      form.querySelector(".sc-reply-to").innerHTML = opts.replyTo // pre-escaped
      form.querySelector(".sc-cancel").addEventListener("click", function () {
        if (opts.onCancel) opts.onCancel()
      })
    }

    var msg = form.querySelector(".sc-msg")
    var submitBtn = form.querySelector(".sc-submit")

    form.addEventListener("submit", function (ev) {
      ev.preventDefault()
      msg.className = "sc-msg"
      msg.textContent = ""
      submitBtn.disabled = true

      var payload = {
        page_id: pid,
        parent_id: parentId,
        author_name: form.author_name.value.trim(),
        author_email: form.author_email.value.trim(),
        body: form.body.value.trim(),
        website: form.website.value, // honeypot
        elapsed_ms: Date.now() - startTime,
      }

      fetch(API_BASE + "/post.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: false, error: "خطای سرور" }
          })
        })
        .then(function (res) {
          if (res.ok) {
            msg.className = "sc-msg sc-ok"
            msg.textContent = res.message || "ثبت شد."
            form.reset()
          } else {
            msg.className = "sc-msg sc-err"
            msg.textContent = res.error || "یه مشکلی پیش اومد."
          }
        })
        .catch(function () {
          msg.className = "sc-msg sc-err"
          msg.textContent = "به سرور وصل نشد."
        })
        .finally(function () {
          submitBtn.disabled = false
        })
    })
    return form
  }

  function loadInto(listEl, pid) {
    var qs = "page_id=" + encodeURIComponent(pid)
    var aliases = relatedIds().filter(function (x) {
      return x !== pid
    })
    if (aliases.length) qs += "&aliases=" + encodeURIComponent(aliases.join("\n"))
    fetch(API_BASE + "/get.php?" + qs)
      .then(function (r) {
        return r.json()
      })
      .then(function (res) {
        listEl.innerHTML = ""
        if (!res.ok || !res.comments || res.comments.length === 0) {
          listEl.appendChild(el("p", "sc-empty", "هنوز نظری نیست. اولین نفر باش."))
          return
        }
        for (var i = 0; i < res.comments.length; i++) {
          listEl.appendChild(renderComment(res.comments[i], pid, 0))
        }
        // Comments render async, so honour a #comment-<id> hash only after they exist.
        scrollToHashComment()
      })
      .catch(function () {
        listEl.innerHTML = ""
        listEl.appendChild(el("p", "sc-empty", "نظرها لود نشدن."))
      })
  }

  // If the URL points at a specific comment (e.g. from "آخرین دیدگاه‌ها"),
  // scroll to it and flash a highlight so it's easy to spot.
  function scrollToHashComment() {
    var h = window.location.hash
    if (!/^#comment-\d+$/.test(h)) return
    var target = document.getElementById(h.slice(1))
    if (!target) return
    target.scrollIntoView({ behavior: "smooth", block: "center" })
    target.classList.remove("sc-highlight")
    // reflow so the animation restarts even if the class was just removed
    void target.offsetWidth
    target.classList.add("sc-highlight")
    setTimeout(function () {
      target.classList.remove("sc-highlight")
    }, 2600)
  }

  // The landing page must never show comments.
  function isHome() {
    var slug = document.body && document.body.dataset ? document.body.dataset.slug : ""
    return slug === "index" || pageId() === "/"
  }

  // Turn a page_id like "/foo-bar/baz" into a readable label "baz".
  function pageLabel(pid) {
    try {
      var parts = decodeURIComponent(pid).split("/").filter(Boolean)
      var last = parts.length ? parts[parts.length - 1] : pid
      return last.replace(/-/g, " ")
    } catch (e) {
      return pid
    }
  }

  // Quartz's content index maps slug -> { title }. Cached across nav events.
  var _indexCache = null
  function loadContentIndex() {
    if (_indexCache) return _indexCache
    _indexCache = fetch("/static/contentIndex.json")
      .then(function (r) {
        return r.json()
      })
      .catch(function () {
        return {}
      })
    return _indexCache
  }

  // Real post title for a page_id ("/foo" -> index["foo"].title), or a readable fallback.
  function pageTitle(index, pid) {
    var slug = pid.replace(/^\//, "")
    if (index && index[slug] && index[slug].title) return index[slug].title
    return pageLabel(pid)
  }

  // Sidebar widget ("آخرین دیدگاه‌ها"): newest approved comments across the whole site.
  // Mounts in the "مطالب" sidebar (the RTL-right one that holds the explorer).
  function initRecent() {
    // Runs everywhere INCLUDING the landing page — only the comment thread/form is hidden on home.
    var sidebar = document.querySelector(".left.sidebar")
    if (!sidebar) return
    if (document.getElementById("sc-recent")) return // already mounted

    var box = el("div", "sc-recent")
    box.id = "sc-recent"
    box.appendChild(el("h3", "sc-recent-heading", "آخرین دیدگاه‌ها"))
    var list = el("ul", "sc-recent-list")
    box.appendChild(list)
    sidebar.appendChild(box)

    Promise.all([
      fetch(API_BASE + "/recent.php?limit=5").then(function (r) {
        return r.json()
      }),
      loadContentIndex(),
    ])
      .then(function (out) {
        var res = out[0]
        var index = out[1]
        list.innerHTML = ""
        if (!res.ok || !res.comments || res.comments.length === 0) {
          box.style.display = "none"
          return
        }
        for (var i = 0; i < res.comments.length; i++) {
          var c = res.comments[i]
          var li = el("li", "sc-recent-item")
          var a = el("a", "sc-recent-link")
          // Link straight to the exact comment (anchor handled by scrollToHashComment).
          a.href = c.page_id + (c.id ? "#comment-" + c.id : "") // absolute path from site root
          a.appendChild(el("span", "sc-recent-author", c.author_name)) // pre-escaped
          a.appendChild(document.createTextNode(" در "))
          var t = el("span", "sc-recent-post")
          t.textContent = pageTitle(index, c.page_id) // plain text — safe
          a.appendChild(t)
          li.appendChild(a)
          list.appendChild(li)
        }
      })
      .catch(function () {
        box.style.display = "none"
      })
  }

  function init() {
    initRecent()

    if (isHome()) return // no comment thread/form on the landing page
    var article = document.querySelector("article")
    if (!article) return
    if (document.getElementById("self-comments")) return // already mounted

    var pid = pageId()

    var section = el("section", "sc-wrap")
    section.id = "self-comments"
    section.appendChild(el("h2", "sc-title", "نظرها"))

    var list = el("div", "sc-list")
    section.appendChild(list)

    section.appendChild(el("div", "sc-form-title", "نظرت رو بنویس"))
    section.appendChild(buildForm(pid, null, null))

    article.appendChild(section)
    loadInto(list, pid)
  }

  document.addEventListener("nav", init)
  if (document.readyState !== "loading") {
    init()
  } else {
    document.addEventListener("DOMContentLoaded", init)
  }
})()
