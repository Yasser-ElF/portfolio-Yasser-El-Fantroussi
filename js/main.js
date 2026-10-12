async function loadProjects() {
  const response = await fetch("data/projects.json");
  return response.json();
}

// Petit bloc média : vidéo (.mp4/.webm), image, ou placeholder si rien n'est fourni.
function createShotHTML(media, index, title) {
  if (!media) {
    return `<div class="project-shot project-shot--empty"><span>Image ${index + 1}</span></div>`;
  }
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${title} — aperçu ${index + 1}`;

  if (/\.(mp4|webm|mov)$/i.test(src)) {
    return `<div class="project-shot"><video data-src="${src}" aria-label="${alt}" muted loop playsinline preload="none"></video></div>`;
  }
  return `<div class="project-shot"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}

// Image d'une étape du processus. Accepte "chemin.png" ou { src, alt, caption }.
// Si le fichier n'existe pas encore, onerror affiche un cadre "Image à ajouter".
function createFigureHTML(media, index, stepTitle) {
  const src = typeof media === "string" ? media : media.src;
  const alt = (typeof media === "string" ? "" : media.alt) || `${stepTitle} — image ${index + 1}`;
  const caption = typeof media === "string" ? "" : media.caption;

  return `
    <figure class="process-figure">
      <img src="${src}" alt="${alt}" loading="lazy" onerror="this.parentElement.classList.add('is-missing')">
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `;
}

// Section "Processus du projet" : liste d'étapes numérotées (project.process dans le JSON).
// Chaque étape a un titre, un texte, et 0 à 2 images (le .slice(0, 2) impose le maximum).
function createProcessHTML(project) {
  const steps = project.process ?? [];
  if (!steps.length) return "";

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

// Partie "Voir plus" : dates, consigne, processus, images & aperçus, lien final.
function createDetailsHTML(project) {
  const d = project.details ?? {};
  const dates = d.dates ?? "Dates à ajouter (ex. : septembre — décembre 2025)";
  const brief = d.brief ?? "Consigne de l'enseignant à ajouter ici : ce qui était demandé pour ce projet, les contraintes et les objectifs du cours.";
  const link = d.link ?? "#";
  const linkLabel = d.linkLabel ?? "Voir le projet";

  const images = d.images && d.images.length ? d.images : [null, null, null];
  const shotsHTML = images.map((img, i) => createShotHTML(img, i, project.title)).join("");

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

function createProjectCard(project) {
  const theme = project.theme ?? ((project.id - 1) % 4) + 1;
  const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  return `
    <article class="project-card theme-${theme}">
      <div class="project-glow" aria-hidden="true"></div>
      <div class="project-body">
        <p class="project-eyebrow">${project.num} — ${project.category}</p>
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

function setCardVideos(card, play) {
  card.querySelectorAll("video").forEach((video) => {
    if (play) {
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

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

async function init() {
  const projects = await loadProjects();

  const container = document.querySelector(".container-projets");
  container.innerHTML = projects.map(createProjectCard).join("");
  setupToggles(container);
}

init();