/**
 * Self-hosted comments widget for mrahari.com.
 * Talks to /comment-api/ (get.php, post.php). Runs on Quartz SPA "nav" events.
 * All user content is HTML-escaped server-side, so escaped fields use innerHTML safely.
 */
(function () {
  "use strict"

  // Override for local testing: set window.SELF_COMMENTS_API before this script loads.
  var API_BASE = (typeof window !== "undefined" && window.SELF_COMMENTS_API) || "/comment-api"

  function pageId() {
    var p = window.location.pathname
    p = p.replace(/index\.html$/, "").replace(/\.html$/, "")
    if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1)
    return p || "/"
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
        return
      }
      replyHolder.appendChild(buildForm(pid, c.id, "پاسختو بنویس…"))
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

  // Build a comment form (top-level or reply). parentId null = top-level.
  function buildForm(pid, parentId, placeholder) {
    var startTime = Date.now()
    var form = el("form", "sc-form")
    form.innerHTML =
      '<div class="sc-field-row">' +
      '  <input class="sc-name" type="text" name="author_name" placeholder="اسمت *" maxlength="100" required>' +
      '  <input class="sc-email" type="email" name="author_email" placeholder="ایمیل (اختیاری)" maxlength="255">' +
      "</div>" +
      '<textarea class="sc-textarea" name="body" placeholder="' + (placeholder || "نظرتو بنویس…") + '" maxlength="5000" required></textarea>' +
      // honeypot — hidden from humans, bots fill it
      '<input class="sc-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="sc-form-foot">' +
      '  <span class="sc-msg"></span>' +
      '  <button class="sc-submit" type="submit">ثبت نظر</button>' +
      "</div>"

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
    fetch(API_BASE + "/get.php?page_id=" + encodeURIComponent(pid))
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
      })
      .catch(function () {
        listEl.innerHTML = ""
        listEl.appendChild(el("p", "sc-empty", "نظرها لود نشدن."))
      })
  }

  function init() {
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
