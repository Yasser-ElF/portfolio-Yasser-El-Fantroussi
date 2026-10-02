// Les mots du bandeau défilant. Pour changer le contenu du ticker,
// il suffit de modifier ce tableau — plus besoin de toucher au HTML.
const TICKER_WORDS = [
  "Motion Design",
  "Interactif",
  "Ableton Live",
  "Unity",
  "Wwise",
  "Creative Code",
  "PureData",
  "Design Sonore",
  "Jeux Vidéo",
  "Multimédia",
];

function buildTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  // On duplique la liste une fois (comme dans le HTML d'origine)
  // pour que la boucle d'animation soit continue, sans trou visible.
  const words = [...TICKER_WORDS, ...TICKER_WORDS];

  track.innerHTML = words
    .map((word) => `<span>${word}</span><span class="dot">•</span>`)
    .join("");
}

buildTicker();