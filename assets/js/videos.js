const grid = document.getElementById("video-grid");
const nav = document.getElementById("category-nav");
const title = document.getElementById("page-title");

const modal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const closeBtn = document.getElementById("modal-close");

let allVideos = [];
let currentCategory = "All";

/* ---------- Load data ---------- */

fetch("/data/videos.enriched.json")
  .then(r => r.json())
  .then(videos => {
    allVideos = videos.filter(v => v.provider === "youtube" && v.videoId);
    buildCategoryNav();
    applyUrlState();
  });

/* ---------- Category Navigation ---------- */

function buildCategoryNav() {
  const categories = ["All", ...new Set(allVideos.map(v => v.category))];
  nav.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = cat === currentCategory ? "active" : "";

    btn.onclick = () => {
      currentCategory = cat;
      render();
      updateUrl();
      setActiveCategory();
    };

    nav.appendChild(btn);
  });
}

function setActiveCategory() {
  nav.querySelectorAll("button").forEach(btn => {
    btn.classList.toggle("active", btn.textContent === currentCategory);
  });
}

/* ---------- Rendering ---------- */

function render() {
  grid.innerHTML = "";

  if (title) {
    title.textContent =
      currentCategory === "All" ? "Videos" : currentCategory;
  }

  allVideos
    .filter(v => currentCategory === "All" || v.category === currentCategory)
    .forEach(v => {
      const card = document.createElement("div");
      card.className = "video-card";
      card.tabIndex = 0;

      card.innerHTML = `
        <img src="https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg" alt="${v.title}">
        <h3>${v.title}</h3>
        ${v.performer ? `<p>${v.performer}</p>` : ""}
      `;

      card.onclick = () => openModal(v);
      card.onkeydown = e => e.key === "Enter" && openModal(v);

      grid.appendChild(card);
    });
}

/* ---------- Modal ---------- */

function openModal(video) {
  modalTitle.textContent = video.title;
  modalMeta.textContent = video.performer || "";

  modalVideo.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${video.videoId}?autoplay=1"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  const url = new URL(window.location);
  url.searchParams.set("video", video.slug);
  history.replaceState({}, "", url);
}

function closeModal() {
  modal.classList.remove("open");
  modalVideo.innerHTML = "";
  document.body.style.overflow = "";
  updateUrl();
}

closeBtn.onclick = closeModal;
modal.querySelector(".modal-backdrop").onclick = closeModal;
document.addEventListener("keydown", e => e.key === "Escape" && closeModal());

/* ---------- Deep Linking ---------- */

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);

  const category = params.get("category");
  const slug = params.get("video");

  if (category) currentCategory = category;

  render();
  setActiveCategory();

  if (slug) {
    const video = allVideos.find(v => v.slug === slug);
    if (video) openModal(video);
  }
}

function updateUrl() {
  const url = new URL(window.location);
  url.searchParams.delete("video");

  if (currentCategory !== "All") {
    url.searchParams.set("category", currentCategory);
  } else {
    url.searchParams.delete("category");
  }

  history.replaceState({}, "", url);
}

/* ---------- Back/forward support ---------- */

window.addEventListener("popstate", applyUrlState);
