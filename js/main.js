/*
  main.js - Affichage des projets du portfolio

  Ce fichier lit les informations des projets dans le fichier data/projects.json,
  puis construit une carte HTML pour chacun d'eux et les affiche dans la section
  Projets de la page. Chaque carte contient une partie visible (titre, rôle,
  description, outils utilisés) et une partie cachée qui s'ouvre avec le bouton
  Voir plus (dates, consigne, processus de création, images et lien du projet).
  Ajouter ou modifier un projet se fait uniquement dans le fichier JSON, sans
  toucher au code.
*/


/* Chargement des données */

// Récupère le fichier JSON et le convertit en tableau JavaScript.
// Un serveur est nécessaire pour que fetch fonctionne (Live Server en local, GitHub Pages en ligne).
async function loadProjects() {
  const response = await fetch("data/projects.json");
  return response.json();
}


/* Construction du HTML
   Chaque fonction ci-dessous retourne un texte HTML. Rien n'est affiché
   tant que la fonction init(), en bas du fichier, n'insère pas ce texte dans la page. */

// Crée un média de la galerie : une vidéo, une image, ou une case vide si aucun fichier n'est fourni.
// Les vidéos utilisent data-src afin de ne se télécharger qu'à l'ouverture de la carte.
function createShotHTML(media, index, title) {
  if (!media) {
    return `<div class="project-shot project-shot--empty"><span>Image ${index + 1}</span></div>`;
  }

  // Le JSON peut donner un simple chemin ou un objet avec le chemin et un texte alternatif.
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${title}, aperçu ${index + 1}`;

  // Le type de média est déterminé selon l'extension du fichier.
  if (/\.(mp4|webm|mov)$/i.test(src)) {
    return `<div class="project-shot"><video data-src="${src}" aria-label="${alt}" muted loop playsinline preload="none"></video></div>`;
  }
  return `<div class="project-shot"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}

// Crée une image illustrant une étape du processus de création.
// Si le fichier est introuvable, la classe is-missing est ajoutée pour afficher un cadre de remplacement.
function createFigureHTML(media, index, stepTitle) {
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${stepTitle}, image ${index + 1}`;
  const caption = typeof media === "string" ? "" : media.caption;

  return `
    <figure class="process-figure">
      <img src="${src}" alt="${alt}" loading="lazy" onerror="this.parentElement.classList.add('is-missing')">
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `;
}

// Crée la section Processus du projet, sous forme de liste d'étapes numérotées.
// Chaque étape a un titre, un texte et au maximum deux images.
// Si le projet n'a pas de processus dans le JSON, la fonction retourne un texte vide et rien n'est affiché.
function createProcessHTML(project) {
  const steps = project.process ?? [];
  if (!steps.length) return "";

  const stepsHTML = steps
    .map((step) => {
      // Limite volontaire de deux images par étape.
      const images = (step.images ?? []).slice(0, 2);

      // data-count permet au CSS d'adapter la disposition selon le nombre d'images.
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

// Crée la partie cachée de la carte, visible après un clic sur Voir plus.
// Elle contient dans l'ordre : les dates et la consigne, le processus de création,
// la galerie d'images et de vidéos, puis le lien vers le projet.
// Des valeurs par défaut sont utilisées lorsque le JSON ne fournit pas une information.
function createDetailsHTML(project) {
  const d = project.details ?? {};
  const dates = d.dates ?? "Dates à ajouter (ex. : septembre à décembre 2025)";
  const brief = d.brief ?? "Consigne de l'enseignant à ajouter ici : ce qui était demandé pour ce projet, les contraintes et les objectifs du cours.";
  const link = d.link ?? "#";
  const linkLabel = d.linkLabel ?? "Voir le projet";

  // Sans média dans le JSON, trois cases vides sont affichées.
  const images = d.images && d.images.length ? d.images : [null, null, null];
  const shotsHTML = images.map((img, i) => createShotHTML(img, i, project.title)).join("");

  // L'attribut id est relié au bouton Voir plus par aria-controls, pour l'accessibilité.
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

// Crée la carte complète d'un projet : la partie visible et la partie cachée.
function createProjectCard(project) {
  // Le thème de couleur (de 1 à 4) vient du JSON, sinon il est calculé à partir de l'identifiant du projet.
  const theme = project.theme ?? ((project.id - 1) % 4) + 1;

  // Un élément par outil utilisé (Max, TouchDesigner, Figma, etc.).
  const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  // La ligne du temps de réalisation n'apparaît que si le projet l'indique dans le JSON.
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


/* Interactions */

// Lance ou met en pause les vidéos d'une carte.
// Au premier lancement, la source de chaque vidéo est chargée à partir de data-src.
function setCardVideos(card, play) {
  card.querySelectorAll("video").forEach((video) => {
    if (play) {
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      // Le navigateur peut refuser la lecture automatique, l'erreur est donc ignorée.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

// Ouvre ou ferme une carte lors d'un clic sur Voir plus ou Voir moins.
// Un seul écouteur est placé sur le conteneur plutôt qu'un par bouton, car les cartes
// sont créées après le chargement de la page. L'animation d'ouverture est gérée par le CSS.
function setupToggles(container) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest(".project-toggle");
    if (!button) return;

    const card = button.closest(".project-card");
    const isOpen = card.classList.toggle("is-open");

    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector(".project-toggle-label").textContent = isOpen ? "Voir moins" : "Voir plus";
    setCardVideos(card, isOpen);
  });
}


/* Démarrage */

// Charge les projets, insère les cartes dans la page puis active les boutons.
// L'insertion avec innerHTML doit précéder setupToggles, car les boutons n'existent pas avant.
async function init() {
  const projects = await loadProjects();

  const container = document.querySelector(".container-projets");
  container.innerHTML = projects.map(createProjectCard).join("");
  setupToggles(container);
}

init();