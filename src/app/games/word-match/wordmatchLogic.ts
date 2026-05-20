// @ts-nocheck
// Word Match Game (Animal ↔ English)
// -------------------------------------------------
// This script implements a simple memory‑style matching game where the player
// clicks an animal image, then clicks the matching English word. It is designed
// for ages 2‑5, so the UI is big, the feedback is immediate, and the code is
// lightweight (vanilla JS, no build steps).

export function initWordMatchGame() {
  const assetsPath = "/assets/"; // Path to root assets directory
  const animalList = [
    { name: "Panda",    file: "cute_panda.png" },
    { name: "Lion",     file: "cute_lion.png" },
    { name: "Elephant", file: "cute_elephant.png" },
    { name: "Rabbit",   file: "cute_rabbit.png" },
    { name: "Koala",    file: "cute_koala.png" },
    { name: "Cat",      file: "cute_cat.png" },
    { name: "Fox",      file: "cute_fox.png" },
    { name: "Monkey",   file: "cute_monkey.png" }
  ];

  // ---------------------------------------------------------------------
  // UI references
  // ---------------------------------------------------------------------
  const imageGrid = document.getElementById("image-grid");
  const wordGrid   = document.getElementById("word-grid");
  const scoreVal   = document.getElementById("score-val");
  const scoreTot   = document.getElementById("score-total");
  const diffButtons = document.querySelectorAll(".diff-pill");
  const btnSound   = document.getElementById("btn-sound");
  const btnNew     = document.getElementById("btn-new");
  const victoryModal = document.getElementById("victory-modal");
  const btnNextRound = document.getElementById("btn-next-round");
  const btnReplay    = document.getElementById("btn-replay");
  const celebrateOverlay = document.getElementById("celebrate-overlay");

  // ---------------------------------------------------------------------
  // Game state
  // ---------------------------------------------------------------------
  let pairsCount = 3; // default easy
  let selectedImage = null; // HTML element
  let selectedWord  = null; // HTML element
  let matches = 0;
  let totalPairs = 0;
  let soundEnabled = true;

  // ---------------------------------------------------------------------
  // Utility – Speech synthesis (optional sound)
  // ---------------------------------------------------------------------
  const speak = (txt) => {
    if (!soundEnabled) return;
    const utter = new SpeechSynthesisUtterance(txt);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  // ---------------------------------------------------------------------
  // Build a fresh round
  // ---------------------------------------------------------------------
  function startRound() {
    // reset UI
    imageGrid.innerHTML = "";
    wordGrid.innerHTML = "";
    matches = 0;
    selectedImage = null;
    selectedWord = null;
    scoreVal.textContent = "0";
    totalPairs = pairsCount;
    scoreTot.textContent = totalPairs;
    // pick random animals
    const shuffled = animalList.slice().sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, pairsCount);
    // create image cards
    chosen.forEach(item => {
      const card = document.createElement("div");
      card.className = "card image-card";
      card.dataset.name = item.name;
      const img = document.createElement("img");
      img.src = assetsPath + item.file;
      img.alt = item.name;
      card.appendChild(img);
      imageGrid.appendChild(card);
    });
    // create word cards (shuffled order)
    const words = chosen.map(i => i.name).sort(() => 0.5 - Math.random());
    words.forEach(word => {
      const card = document.createElement("div");
      card.className = "card word-card";
      card.dataset.name = word;
      card.textContent = word;
      wordGrid.appendChild(card);
    });
    // attach listeners
    imageGrid.addEventListener("click", onImageClick);
    wordGrid.addEventListener("click", onWordClick);
  }

  // ---------------------------------------------------------------------
  // Click handlers
  // ---------------------------------------------------------------------
  function onImageClick(e) {
    const card = e.target.closest(".image-card");
    if (!card) return;
    if (card.classList.contains("selected")) return;
    // deselect previous image if any
    if (selectedImage) selectedImage.classList.remove("selected");
    selectedImage = card;
    card.classList.add("selected");
    if (selectedWord) checkMatch();
  }

  function onWordClick(e) {
    const card = e.target.closest(".word-card");
    if (!card) return;
    if (card.classList.contains("selected")) return;
    if (selectedWord) selectedWord.classList.remove("selected");
    selectedWord = card;
    card.classList.add("selected");
    if (selectedImage) checkMatch();
  }

  function checkMatch() {
    const correct = selectedImage.dataset.name === selectedWord.dataset.name;
    if (correct) {
      // mark both as solved
      selectedImage.classList.add("solved");
      selectedWord.classList.add("solved");
      matches++;
      scoreVal.textContent = matches;
      // celebrate briefly
      celebrateOverlay.classList.add("active");
      setTimeout(() => celebrateOverlay.classList.remove("active"), 800);
      speak(selectedWord.dataset.name);
      // if round finished -> victory modal
      if (matches === totalPairs) {
        setTimeout(() => victoryModal.classList.add("active"), 500);
      }
    } else {
      // wrong – shake animation then clear selection
      selectedImage.classList.add("shake");
      selectedWord.classList.add("shake");
      setTimeout(() => {
        selectedImage.classList.remove("shake", "selected");
        selectedWord.classList.remove("shake", "selected");
        selectedImage = null;
        selectedWord = null;
      }, 600);
    }
  }

  // ---------------------------------------------------------------------
  // UI controls
  // ---------------------------------------------------------------------
  diffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      diffButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      pairsCount = Number(btn.dataset.pairs);
      startRound();
    });
  });

  btnSound.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? "🔊" : "🔈";
  });

  btnNew.addEventListener("click", startRound);

  btnNextRound.addEventListener("click", () => {
    victoryModal.classList.remove("active");
    startRound();
  });
  btnReplay.addEventListener("click", () => {
    victoryModal.classList.remove("active");
    startRound();
  });

  // ---------------------------------------------------------------------
  // Initial launch
  // ---------------------------------------------------------------------
  startRound();
}
