/* ===================================================================
   main.js — LES CARTES DE PROJETS

   En bref :
   1. lit les données dans data/projects.json
   2. fabrique une carte HTML par projet (avec la zone cachée « Voir plus »)
   3. place les cartes dans <div class="container-projets">
   4. fait marcher le bouton « Voir plus / Voir moins » et les vidéos
   init(), tout en bas, lance le tout.
   =================================================================== */


/* ---------- 1. CHARGER LES DONNÉES ---------- */

// fetch demande le fichier JSON ; await attend la réponse ; .json() le convertit en tableau JavaScript.
// (fetch ne marche pas en double-cliquant la page : il faut un serveur local, ex. Live Server.)
async function loadProjects() {
  const response = await fetch("data/projects.json");
  return response.json();
}


/* ---------- 2. FABRIQUER LE HTML ----------
   Les fonctions ci-dessous retournent du TEXTE HTML (gabarits entre accents graves),
   où ${...} insère une valeur : ${project.title} met le titre du projet. */

// --- Un média de la galerie : vidéo, image, ou case vide ---

// Petit bloc média : vidéo (.mp4/.webm), image, ou placeholder si rien n'est fourni.
// Les vidéos ne se chargent qu'à la première ouverture de la carte (voir setupToggles).
function createShotHTML(media, index, title) {
  if (!media) {
    return `<div class="project-shot project-shot--empty"><span>Image ${index + 1}</span></div>`;
  }
  // Le média peut être un simple chemin (texte) ou un objet { src, alt }.
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${title}, aperçu ${index + 1}`;

  // La regex teste si le chemin finit par .mp4, .webm ou .mov (donc si c'est une vidéo).
  if (/\.(mp4|webm|mov)$/i.test(src)) {
    // data-src (et non src) : la vidéo ne se télécharge pas tout de suite.
    return `<div class="project-shot"><video data-src="${src}" aria-label="${alt}" muted loop playsinline preload="none"></video></div>`;
  }
  return `<div class="project-shot"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}

// --- Une image d'une étape du processus ---

// Image d'une étape du processus. Accepte "chemin.png" ou { src, alt, caption }.
// Si le fichier n'existe pas encore, onerror affiche un cadre "Image à ajouter".
function createFigureHTML(media, index, stepTitle) {
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${stepTitle}, image ${index + 1}`;
  const caption = typeof media === "string" ? "" : media.caption;

  // onerror : si l'image ne charge pas, on ajoute la classe is-missing sur la <figure> (le CSS affiche alors le cadre pointillé).
  return `
    <figure class="process-figure">
      <img src="${src}" alt="${alt}" loading="lazy" onerror="this.parentElement.classList.add('is-missing')">
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `;
}

// --- La section « Processus du projet » ---

// Section "Processus du projet" : liste d'étapes numérotées (project.process dans le JSON).
// Chaque étape a un titre, un texte, et 0 à 2 images (le .slice(0, 2) impose le maximum).
function createProcessHTML(project) {
  const steps = project.process ?? [];   // pas d'étapes dans le JSON → liste vide
  if (!steps.length) return "";          // rien à afficher

  const stepsHTML = steps
    .map((step) => {
      const images = (step.images ?? []).slice(0, 2);
      const figuresHTML = images.length
        ? `<div class="process-figures" data-count="${images.length}">
             ${images.map((img, i) => createFigureHTML(img, i, step.title)).join("")}
           </div>`
        : "";

      return `
        <li class="process-step">
          <h4 class="process-step-title">${step.title}</h4>
          <p class="project-detail-text">${step.text}</p>
          ${figuresHTML}
        </li>
      `;
    })
    .join("");

  return `
    <div class="project-detail-block project-process">
      <p class="project-detail-label">Processus du projet</p>
      <ol class="process-list">${stepsHTML}</ol>
    </div>
  `;
}

// --- La zone cachée qui s'ouvre avec « Voir plus » ---

// Partie "Voir plus" : dates, consigne, processus, images & aperçus, lien final.
// « ?? » = valeur par défaut quand le JSON ne donne pas l'information.
function createDetailsHTML(project) {
  const d = project.details ?? {};
  const dates = d.dates ?? "Dates à ajouter (ex. : septembre à décembre 2025)";
  const brief = d.brief ?? "Consigne de l'enseignant à ajouter ici : ce qui était demandé pour ce projet, les contraintes et les objectifs du cours.";
  const link = d.link ?? "#";
  const linkLabel = d.linkLabel ?? "Voir le projet";

  // Sans médias dans le JSON : 3 cases vides.
  const images = d.images && d.images.length ? d.images : [null, null, null];
  const shotsHTML = images.map((img, i) => createShotHTML(img, i, project.title)).join("");

  // data-count (nombre de médias) sert au CSS pour choisir la disposition de la galerie.
  return `
    <div class="project-details" id="project-details-${project.id}">
      <div class="project-details-inner">
        <div class="project-details-content">
          <div class="project-detail-grid">
            <div class="project-detail-block">
              <p class="project-detail-label">Dates</p>
              <p class="project-detail-text">${dates}</p>
            </div>
            <div class="project-detail-block">
              <p class="project-detail-label">Consigne de l'enseignant</p>
              <p class="project-detail-text">${brief}</p>
            </div>
          </div>

          ${createProcessHTML(project)}

          <div class="project-detail-block">
            <p class="project-detail-label">Images &amp; aperçus</p>
            <div class="project-gallery" data-count="${images.length}">${shotsHTML}</div>
          </div>

          <a href="${link}" class="project-link" target="_blank" rel="noopener">
            ${linkLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

// --- La carte complète (partie visible + zone cachée) ---

function createProjectCard(project) {
  // Thème de 1 à 4 : celui du JSON, sinon calculé à partir de l'id (le % revient à 1 après 4)
  const theme = project.theme ?? ((project.id - 1) % 4) + 1;
  const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  // aria-expanded / aria-controls : informent les lecteurs d'écran de l'état du bouton et de la zone qu'il contrôle.
  return `
    <article class="project-card theme-${theme}">
      <div class="project-glow" aria-hidden="true"></div>
      <div class="project-body">
        <p class="project-eyebrow">${project.num} ${project.category}</p>
        <h3>${project.title}</h3>
        <p class="project-role">${project.role}</p>
        ${project.time ? `<p class="project-time">${project.time}</p>` : ""}
        <p class="project-desc">${project.desc}</p>
        <div class="project-tags">${tagsHTML}</div>
        <div class="project-actions">
          <a href="${project.ctaHref}" class="project-cta">
            ${project.ctaLabel}
            <span class="icon-placeholder cta-icon" aria-hidden="true">▸</span>
          </a>
          <button type="button" class="project-toggle" aria-expanded="false" aria-controls="project-details-${project.id}">
            <span class="project-toggle-label">Voir plus</span>
            <span class="project-toggle-chevron" aria-hidden="true">▾</span>
          </button>
        </div>
      </div>
      ${createDetailsHTML(project)}
    </article>
  `;
}


/* ---------- 3. LES INTERACTIONS : VIDÉOS ET « VOIR PLUS » ---------- */

// Lance (play = true) ou met en pause les vidéos d'UNE carte.
function setCardVideos(card, play) {
  card.querySelectorAll("video").forEach((video) => {
    if (play) {
      // Première ouverture : on copie data-src dans src, ce qui déclenche le téléchargement.
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      video.play().catch(() => {});   // ignore l'erreur si le navigateur refuse la lecture automatique
    } else {
      video.pause();
    }
  });
}

// Ouvre / ferme la carte quand on clique sur "Voir plus" / "Voir moins".
// Délégation d'événements : UN seul écouteur sur le conteneur reçoit les clics de tous les boutons
// (pratique car les cartes sont créées par le JS, après le chargement).
function setupToggles(container) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest(".project-toggle");   // remonte du clic jusqu'au bouton
    if (!button) return;

    const card = button.closest(".project-card");
    // toggle ajoute is-open si absente, la retire sinon : le CSS fait le reste (ouverture, flèche).
    const isOpen = card.classList.toggle("is-open");

    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector(".project-toggle-label").textContent = isOpen ? "Voir moins" : "Voir plus";
    setCardVideos(card, isOpen);
  });
}


/* ---------- 4. DÉMARRAGE ---------- */

// Chef d'orchestre : charge les données, affiche les cartes, active les boutons.
async function init() {
  const projects = await loadProjects();

  const container = document.querySelector(".container-projets");
  container.innerHTML = projects.map(createProjectCard).join("");
  setupToggles(container);
}

init();