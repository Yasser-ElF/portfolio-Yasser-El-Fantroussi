/* ticker.js — le bandeau défilant.
   Remplit <div id="ticker-track"> avec les mots de TICKER_WORDS, assez de fois pour dépasser la largeur de l'écran,
   puis double le tout. L'animation CSS (de 0 à -50 %) boucle alors sans coupure. */

// Les mots du bandeau : pour changer le contenu, on modifie seulement cette liste.
const TICKER_WORDS = [
  "Motion Design",
  "Interactif",
  "Unity",
  "PureData",
  "Design Sonore",
  "Jeux Vidéo",
  "Multimédia",
];

const TICKER_SPEED = 60; // vitesse en pixels par seconde

// Transforme un tableau de mots en texte HTML : un <span> par mot, suivi d'une puce.
function itemsHTML(words) {
  return words
    .map((word) => `<span>${word}</span><span class="dot">•</span>`)
    .join("");
}

// Construit le contenu du bandeau.
function buildTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  // 1) Mesure la largeur d'UNE copie de la liste.
  track.innerHTML = itemsHTML(TICKER_WORDS);
  const singleWidth = track.scrollWidth;
  if (!singleWidth) return;

  // 2) Répète la liste jusqu'à ce qu'un « bloc » soit plus large que l'écran (sinon on verrait un trou).
  const repeats = Math.max(1, Math.ceil(window.innerWidth / singleWidth));
  const block = itemsHTML(TICKER_WORDS).repeat(repeats);

  // 3) Double le bloc : l'animation va de 0 à -50 %, donc la copie remplace exactement l'original.
  track.innerHTML = block + block;

  // 4) Vitesse constante : temps = distance ÷ vitesse.
  const blockWidth = track.scrollWidth / 2;
  track.style.animationDuration = `${blockWidth / TICKER_SPEED}s`;
}

// Construit le bandeau, lance l'animation (classe is-ready) et le reconstruit si on redimensionne la fenêtre.
function startTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  buildTicker();
  track.classList.add("is-ready");

  // Anti-rebond : « resize » se déclenche des dizaines de fois, on ne recalcule qu'une fois après 200 ms de calme.
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(buildTicker, 200);
  });
}

// On attend que les polices soient chargées avant de mesurer : sinon la largeur change et le bandeau « saute ».
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startTicker);
} else {
  window.addEventListener("load", startTicker);
}