async function loadProjects() {
  const response = await fetch("data/projects.json");
  return response.json();
}

function createProjectCard(project) {
  // Thème de 1 à 4 : celui du JSON, sinon calculé à partir de l'id
  const theme = project.theme ?? ((project.id - 1) % 4) + 1;
  const tagsHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  return `
    <article class="project-card theme-${theme}">
      <div class="project-glow" aria-hidden="true"></div>
      <div class="project-body">
        <p class="project-eyebrow">${project.num} — ${project.category}</p>
        <h3>${project.title}</h3>
        <p class="project-role">${project.role}</p>
        <p class="project-desc">${project.desc}</p>
        <div class="project-tags">${tagsHTML}</div>
        <a href="${project.ctaHref}" class="project-cta">
          ${project.ctaLabel}
          <span class="icon-placeholder cta-icon" aria-hidden="true">▸</span>
        </a>
      </div>
    </article>
  `;
}

async function init() {
  const projects = await loadProjects();
  console.table(projects);

  document.querySelector(".container-projets").innerHTML =
    projects.map(createProjectCard).join("");
}

init();