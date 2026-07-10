// ==============================================
// ARTWORK DATA
// Replace these entries with your real pieces.
// image: leave blank ('') to keep the generated placeholder canvas,
// or set to a real image URL/path (e.g. 'images/piece-01.jpg').
// ==============================================
const artworks = [
  { title: "Study in Waiting",        medium: "oil",        style: "nocturne", year: 2025, dims: "30 × 40 in", image: "" },
  { title: "Low Tide at Dusk",        medium: "watercolor", style: "luminous", year: 2024, dims: "11 × 15 in", image: "" },
  { title: "Ember Sketchbook I",      medium: "sketch",     style: "nocturne", year: 2025, dims: "9 × 12 in",  image: "" },
  { title: "Morning, Unfinished",     medium: "oil",        style: "luminous", year: 2023, dims: "24 × 30 in", image: "" },
  { title: "Signal, Night Frequency", medium: "acrylic",    style: "nocturne", year: 2024, dims: "36 × 36 in", image: "" },
  { title: "Fog Breaking Over Water", medium: "watercolor", style: "luminous", year: 2025, dims: "14 × 18 in", image: "" },
  { title: "Afterimage",              medium: "acrylic",    style: "nocturne", year: 2023, dims: "20 × 24 in", image: "" },
  { title: "Window Light, No. 3",     medium: "oil",        style: "luminous", year: 2024, dims: "18 × 24 in", image: "" },
  { title: "Static Bloom",            medium: "sketch",     style: "nocturne", year: 2025, dims: "8 × 10 in",  image: "" },
  { title: "Quiet Room, West Side",   medium: "acrylic",    style: "luminous", year: 2023, dims: "22 × 28 in", image: "" },
];

const mediumLabels = {
  oil: "Oil on canvas",
  acrylic: "Acrylic on canvas",
  watercolor: "Watercolor on paper",
  sketch: "Graphite on paper",
};

const gallery = document.getElementById("gallery");
let activeStyle = "all";
let activeMedium = "all";

function renderGallery(){
  gallery.innerHTML = "";

  const filtered = artworks.filter(a =>
    (activeStyle === "all" || a.style === activeStyle) &&
    (activeMedium === "all" || a.medium === activeMedium)
  );

  if(filtered.length === 0){
    const empty = document.createElement("div");
    empty.className = "gallery__empty";
    empty.textContent = "No pieces match this combination — try another filter.";
    gallery.appendChild(empty);
    return;
  }

  filtered.forEach((art, i) => {
    const card = document.createElement("article");
    card.className = "card";

    // slight per-card glow offset so the grid doesn't feel mechanically identical
    const gx = 25 + ((i * 37) % 50);
    const gy = 20 + ((i * 53) % 45);

    const mediaHTML = art.image
      ? `<img src="${art.image}" alt="${art.title}, ${mediumLabels[art.medium]}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
      : `<div class="hero__texture"></div><div class="card__glow"></div>`;

    card.innerHTML = `
      <div class="card__canvas" data-style="${art.style}" style="--gx:${gx}%; --gy:${gy}%;">
        ${mediaHTML}
        <span class="card__tag card__tag--${art.style}">${art.style}</span>
      </div>
      <div class="card__label">
        <span class="card__title">${art.title}</span>
        <span class="card__meta">${mediumLabels[art.medium]} · ${art.dims} · ${art.year}</span>
      </div>
    `;
    gallery.appendChild(card);
  });
}

// Filter buttons
document.querySelectorAll(".pill").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.filterType;
    const value = btn.dataset.filter;

    document.querySelectorAll(`.pill[data-filter-type="${type}"]`).forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    if(type === "style") activeStyle = value;
    if(type === "medium") activeMedium = value;

    renderGallery();
  });
});

renderGallery();

// ==============================================
// SPOTLIGHT CURSOR (signature interactive element)
// ==============================================
const spotlight = document.querySelector(".spotlight");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if(!prefersReducedMotion){
  let targetX = 50, targetY = 30, curX = 50, curY = 30;

  window.addEventListener("mousemove", (e) => {
    targetX = (e.clientX / window.innerWidth) * 100;
    targetY = (e.clientY / window.innerHeight) * 100;
  });

  function animateSpotlight(){
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    spotlight.style.setProperty("--sx", curX + "%");
    spotlight.style.setProperty("--sy", curY + "%");
    requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();
} else {
  spotlight.style.display = "none";
}

// ==============================================
// NAV: scroll state + mobile toggle
// ==============================================
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
}, { passive: true });

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ==============================================
// SCROLL REVEAL for gallery cards + sections
// ==============================================
if(!prefersReducedMotion && "IntersectionObserver" in window){
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function observeReveals(){
    document.querySelectorAll(".card").forEach(card => {
      if(card.dataset.observed) return;
      card.dataset.observed = "true";
      card.style.opacity = "0";
      card.style.transform = "translateY(16px)";
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      revealObserver.observe(card);
    });
  }

  observeReveals();
  // Re-observe whenever the gallery re-renders after a filter change
  const galleryObserver = new MutationObserver(observeReveals);
  galleryObserver.observe(gallery, { childList: true });
}

// ==============================================
// FOOTER YEAR
// ==============================================
document.getElementById("year").textContent = new Date().getFullYear();
