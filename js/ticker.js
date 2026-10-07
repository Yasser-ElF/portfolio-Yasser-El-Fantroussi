/* ===================================================================
   ticker.js — LE BANDEAU DÉFILANT (le « ticker »)

   Ce que fait ce fichier, en bref :
   1. Il prend une liste de mots (TICKER_WORDS).
   2. Il fabrique le HTML du bandeau et le place dans <div id="ticker-track">.
   3. Il répète la liste assez de fois pour dépasser la largeur de l'écran,
      puis il DOUBLE le tout : comme ça l'animation CSS boucle sans coupure.
   4. Il ajoute la classe « is-ready » : c'est elle qui DÉMARRE l'animation
      (voir .ticker-track.is-ready dans style.css).
   =================================================================== */


/* ---------- RÉGLAGES : les seules choses à modifier pour changer le bandeau ---------- */

// Les mots affichés dans le bandeau.
// Pour changer le contenu : on modifie ce tableau (liste entre crochets), sans toucher au HTML.
// Chaque mot est un texte entre guillemets, séparé du suivant par une virgule.
const TICKER_WORDS = [
  "Motion Design",
  "Interactif",
  "Unity",
  "PureData",
  "Design Sonore",
  "Jeux Vidéo",
  "Multimédia",
];

// Vitesse du défilement, en pixels par seconde.
// Plus le nombre est grand, plus le bandeau va vite. La vitesse reste la même sur tous les écrans.
const TICKER_SPEED = 60;


/* ---------- FONCTIONS ---------- */

// Transforme un tableau de mots en TEXTE HTML.
// Exemple : ["A", "B"]  devient  '<span>A</span><span class="dot">•</span><span>B</span><span class="dot">•</span>'
function itemsHTML(words) {
  return words
    // .map(...) : pour CHAQUE mot du tableau, on fabrique un petit morceau de HTML.
    // Les accents graves (`...`) permettent d'insérer une valeur avec ${...}.
    .map((word) => `<span>${word}</span><span class="dot">•</span>`)
    // .join("") : on colle tous les morceaux ensemble (sans rien entre eux) pour obtenir un seul grand texte.
    .join("");
}

// Construit (ou reconstruit) le contenu du bandeau.
function buildTicker() {
  // On va chercher la bande dans le HTML grâce à son id (voir index.html : id="ticker-track").
  const track = document.getElementById("ticker-track");

  // Sécurité : si la bande n'existe pas dans la page, on arrête la fonction ici
  // (sinon le code plus bas provoquerait une erreur).
  if (!track) return;

  // ÉTAPE 1 — Mesurer la largeur d'UNE copie de la liste.
  // On met une seule copie dans la bande, puis scrollWidth nous donne sa largeur totale en pixels.
  track.innerHTML = itemsHTML(TICKER_WORDS);
  const singleWidth = track.scrollWidth;

  // Si la mesure vaut 0 (page pas prête, élément caché…), on arrête pour éviter une division par zéro.
  if (!singleWidth) return;

  // ÉTAPE 2 — Répéter la liste assez de fois pour qu'un « bloc » soit plus large que l'écran.
  // Sinon on verrait un trou avant que la boucle recommence.
  // - window.innerWidth = largeur de la fenêtre.
  // - Math.ceil(...) = arrondi vers le HAUT (ex. 2,3 devient 3).
  // - Math.max(1, ...) = au moins 1 copie, jamais 0.
  const repeats = Math.max(1, Math.ceil(window.innerWidth / singleWidth));
  // .repeat(n) répète le texte n fois.
  const block = itemsHTML(TICKER_WORDS).repeat(repeats);

  // ÉTAPE 3 — DOUBLER le bloc.
  // L'animation CSS déplace la bande de 0 à -50% (la moitié de sa largeur) :
  // à la fin, la 2e copie se trouve exactement à la place de la 1re → la boucle est invisible.
  track.innerHTML = block + block;

  // ÉTAPE 4 — Régler la durée pour avoir une vitesse constante.
  // Formule : temps = distance ÷ vitesse.
  const blockWidth = track.scrollWidth / 2;               // largeur d'UN bloc (la moitié de la bande)
  track.style.animationDuration = `${blockWidth / TICKER_SPEED}s`; // écrit la durée en style « en ligne » (remplace les 30s du CSS)
}

// Démarre le bandeau : construit son contenu, lance l'animation, puis surveille le redimensionnement.
function startTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  buildTicker();

  // On ajoute la classe « is-ready » : le CSS (.ticker-track.is-ready) lance alors l'animation.
  track.classList.add("is-ready");

  // Si la personne change la taille de la fenêtre, il faut recalculer le nombre de copies.
  // ANTI-REBOND (« debounce ») : l'événement « resize » se déclenche des dizaines de fois quand on tire la fenêtre.
  // À chaque fois on annule le minuteur précédent (clearTimeout) et on en relance un de 200 ms :
  // le recalcul n'a donc lieu qu'UNE fois, 200 ms après la fin du mouvement.
  let timer; // « let » car la valeur change à chaque événement
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(buildTicker, 200);
  });
}


/* ---------- DÉMARRAGE ---------- */

// On attend que les polices soient chargées AVANT de mesurer la largeur :
// sinon la largeur change quand la vraie police remplace la police de secours,
// et le bandeau « saute » (c'était le bug du début).
// document.fonts.ready est une PROMESSE (« Promise ») : « je te préviens quand c'est prêt ».
// .then(startTicker) = « quand c'est prêt, exécute startTicker ».
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startTicker);
} else {
  // Plan B pour les vieux navigateurs : on attend simplement que toute la page soit chargée.
  window.addEventListener("load", startTicker);
}