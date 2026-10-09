/* animation.js — animations au scroll.
   Ajoute la classe .reveal aux éléments voulus, puis un IntersectionObserver
   ajoute .is-visible quand l'élément entre dans l'écran (une seule fois). */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);   // on n'anime qu'une fois
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

// Prépare un élément : type d'effet + délai (pour décaler les éléments d'un groupe).
function reveal(el, type = "up", delay = 0) {
  if (el.classList.contains("reveal")) return;   // déjà préparé
  el.classList.add("reveal");
  if (type !== "up") el.classList.add(`reveal-${type}`);
  el.style.setProperty("--delay", `${delay}s`);
  observer.observe(el);
}

// Applique un effet à tous les éléments d'un sélecteur, avec décalage progressif (stagger).
function revealAll(selector, type = "up", stagger = 0.12) {
  document.querySelectorAll(selector).forEach((el, i) => reveal(el, type, i * stagger));
}

function setupScrollAnimations() {
  // Ticker
  revealAll(".ticker", "up", 0);

  // À propos
  revealAll(".about-portrait-wrap", "left", 0);
  revealAll(".about-text > *", "up", 0.12);

  // Titre de la section projets
  revealAll(".projects-header", "up", 0);

  // Compétences
  revealAll(".skills-inner > .eyebrow, .skills-inner > .section-title", "up", 0.1);
  revealAll(".skill-group", "up", 0.15);

  // Contact
  revealAll(".contact-inner > div", "left", 0);
  revealAll(".contact-inner > .btn", "right", 0.2);

  // Footer
  revealAll(".footer-inner", "up", 0);
}

// Les cartes de projets sont créées par main.js APRÈS le chargement (fetch du JSON) :
// on surveille le conteneur et on prépare chaque carte dès qu'elle apparaît.
function setupProjectCards() {
  const container = document.querySelector(".container-projets");
  if (!container) return;

  const prepare = () =>
    container.querySelectorAll(".project-card").forEach((card) => reveal(card, "up", 0));

  prepare();
  new MutationObserver(prepare).observe(container, { childList: true });
}

setupScrollAnimations();
setupProjectCards();