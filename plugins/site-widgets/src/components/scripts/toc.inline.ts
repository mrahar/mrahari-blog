// @ts-nocheck
// Highlight the current section's TOC entry as it scrolls into view.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const slug = entry.target.id;
    const links = document.querySelectorAll(`.site-toc a[data-for="${slug}"]`);
    const windowHeight = entry.rootBounds?.height;
    if (windowHeight && links.length > 0) {
      if (entry.boundingClientRect.y < windowHeight) {
        links.forEach((l) => l.classList.add("in-view"));
      } else {
        links.forEach((l) => l.classList.remove("in-view"));
      }
    }
  }
});

function toggleToc() {
  const toc = this.closest(".site-toc");
  if (!toc) return;
  const nowCollapsed = toc.classList.toggle("collapsed");
  this.setAttribute("aria-expanded", nowCollapsed ? "false" : "true");
}

function setupToc() {
  const buttons = document.querySelectorAll(".site-toc .site-toc-header");
  buttons.forEach((button) => {
    button.addEventListener("click", toggleToc);
    const cleanup = () => button.removeEventListener("click", toggleToc);
    if (window.addCleanup) window.addCleanup(cleanup);
  });

  observer.disconnect();
  const headers = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
  headers.forEach((header) => observer.observe(header));
}

document.addEventListener("nav", setupToc);
document.addEventListener("render", setupToc);
