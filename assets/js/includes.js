/* =========================================================
   Global include loader + base-path handling
   ========================================================= */

/* ---- Base path detection ---- */
const BASE_PATH = location.hostname.includes("github.io")
  ? "/internationalshitoryu-a"
  : "";

/* ---- Load HTML includes ---- */
async function loadInclude(id, url, afterLoad) {
  const container = document.getElementById(id);
  if (!container) return;

  try {
    const res = await fetch(BASE_PATH + url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    container.innerHTML = await res.text();

    if (afterLoad) afterLoad(container);
  } catch (err) {
    console.error(err);
  }
}

/* ---- Fix internal links to respect BASE_PATH ---- */
function fixBasePaths(container) {
  container.querySelectorAll("[data-href]").forEach(el => {
    el.setAttribute("href", BASE_PATH + el.dataset.href);
  });

  container.querySelectorAll("[data-src]").forEach(el => {
    el.setAttribute("src", BASE_PATH + el.dataset.src);
  });
}

/* ---- Active navigation state ---- */
function setActiveNav(container) {
  const currentPath = location.pathname
    .replace(BASE_PATH, "")
    .replace(/\/$/, "") || "/";

  container.querySelectorAll("a[href]").forEach(link => {
    const rawHref = link.getAttribute("href");
    if (!rawHref.startsWith(BASE_PATH)) return;

    const linkPath = rawHref
      .replace(BASE_PATH, "")
      .replace(/\/$/, "") || "/";

    if (
      linkPath === currentPath ||
      (linkPath !== "/" && currentPath.startsWith(linkPath))
    ) {
      link.classList.add("active");
    }
  });
}

/* ---- Mobile navigation (hamburger) ---- */
function setupMobileNav(container) {
  const toggle = container.querySelector(".nav-toggle");
  const nav = container.querySelector("nav ul");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Close menu when clicking a link (mobile UX)
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}


/* ---- Load header + footer ---- */
loadInclude("site-header", "/includes/header.html", container => {
  fixBasePaths(container);
  setActiveNav(container);
  setupMobileNav(container);
});

loadInclude("site-footer", "/includes/footer.html", fixBasePaths);
