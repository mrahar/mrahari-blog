/* Cursor-following spotlight for homepage cards (.home-card).
   Standalone, dependency-free, loaded as a plain `defer` script — it is NOT part
   of Quartz's module bootstrap, so it can never break navigation/darkmode.
   It only writes element-local --gx/--gy pixel vars that the CSS glow reads. */
(function () {
  "use strict";
  var els = [];
  var lastX = 0;
  var lastY = 0;
  var rafPending = false;

  function collect() {
    els = Array.prototype.slice.call(document.querySelectorAll(".home-card"));
  }

  function apply() {
    rafPending = false;
    for (var i = 0; i < els.length; i++) {
      var rect = els[i].getBoundingClientRect();
      els[i].style.setProperty("--gx", (lastX - rect.left).toFixed(1) + "px");
      els[i].style.setProperty("--gy", (lastY - rect.top).toFixed(1) + "px");
    }
  }

  function schedule() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(apply);
    }
  }

  function onPointerMove(e) {
    lastX = e.clientX;
    lastY = e.clientY;
    schedule();
  }

  var wired = false;
  function init() {
    collect();
    if (els.length === 0) return; // not the homepage — do nothing
    if (wired) return;
    wired = true;
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // Quartz SPA swaps the DOM without a reload — re-collect cards after navigation.
  document.addEventListener("nav", function () {
    collect();
    init();
  });
})();
