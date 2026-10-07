// Les mots du bandeau défilant. Pour changer le contenu du ticker,
// il suffit de modifier ce tableau — plus besoin de toucher au HTML.
const TICKER_WORDS = [
  "Motion Design",
  "Interactif",
  "Unity",
  "PureData",
  "Design Sonore",
  "Jeux Vidéo",
  "Multimédia",
];

const TICKER_SPEED = 60; // pixels par seconde (même vitesse sur tous les écrans)

function itemsHTML(words) {
  return words
    .map((word) => `<span>${word}</span><span class="dot">•</span>`)
    .join("");
}

function buildTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  // 1) Mesure la largeur d'UNE copie de la liste.
  track.innerHTML = itemsHTML(TICKER_WORDS);
  const singleWidth = track.scrollWidth;
  if (!singleWidth) return;

  // 2) Répète la liste assez de fois pour qu'un "bloc" soit plus large
  //    que l'écran (sinon on voit un trou avant que la boucle recommence).
  const repeats = Math.max(1, Math.ceil(window.innerWidth / singleWidth));
  const block = itemsHTML(TICKER_WORDS).repeat(repeats);

  // 3) Duplique le bloc une fois : l'animation va de 0 à -50%,
  //    donc exactement une largeur de bloc → boucle parfaite.
  track.innerHTML = block + block;

  // 4) Vitesse constante : durée = largeur d'un bloc / vitesse.
  const blockWidth = track.scrollWidth / 2;
  track.style.animationDuration = `${blockWidth / TICKER_SPEED}s`;
}

function startTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  buildTicker();
  track.classList.add("is-ready");

  // Reconstruit si la fenêtre change de taille (avec un petit délai).
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(buildTicker, 200);
  });
}

// On attend que les polices soient chargées avant de mesurer, sinon la
// largeur change quand la police finale remplace la police de secours.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startTicker);
} else {
  window.addEventListener("load", startTicker);
}