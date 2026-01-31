async function loadInclude(id, url, afterLoad) {
  const container = document.getElementById(id);
  if (!container) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    container.innerHTML = await res.text();

    if (afterLoad) afterLoad(container);
  } catch (err) {
    console.error(err);
  }
}

function setActiveNav(container) {
  const currentPath = location.pathname.replace(/\/$/, "");

  container.querySelectorAll("a[href]").forEach(link => {
    const linkPath = link.getAttribute("href").replace(/\/$/, "");

    if (
      linkPath === currentPath ||
      (linkPath !== "/" && currentPath.startsWith(linkPath))
    ) {
      link.classList.add("active");
    }
  });
}

loadInclude("site-header", "/includes/header.html", setActiveNav);
loadInclude("site-footer", "/includes/footer.html");
