// Animal Sound Piano Game Logic
// ---------------------------------------------------------------------
(() => {
  // Frequencies for our 8 musical keys (C4 to C5)
  const noteFreqs = {
    "C4": 261.63,
    "D4": 293.66,
    "E4": 329.63,
    "F4": 349.23,
    "G4": 392.00,
    "A4": 440.00,
    "B4": 493.88,
    "C5": 523.25
  };

  // Animal Vocalizations config (soundFile maps to assets/sounds/*.mp3, thai = display bubble)
  const animalSounds = [
    { name: "cat",      soundFile: "cat",     thai: "เหมียว!" },
    { name: "dog",      soundFile: "dog",     thai: "โฮ่ง!" },
    { name: "elephant", soundFile: "elephant",thai: "แปร๋น!" },
    { name: "chick",    soundFile: "chicken", thai: "เจี๊ยบ!" },
    { name: "duck",     soundFile: "duck",    thai: "ก๊าบ!" },
    { name: "frog",     soundFile: "frog",    thai: "อบๆ!" },
    { name: "monkey",   soundFile: "monkey",  thai: "เจี๊ยก!" },
    { name: "lion",     soundFile: "lion",    thai: "โฮก!" }
  ];

  // Preload all animal sounds for snappy playback
  const SOUNDS_PATH = "../../assets/sounds/";
  const audioCache = animalSounds.map(a => {
    const audio = new Audio(`${SOUNDS_PATH}${a.soundFile}.mp3`);
    audio.preload = "auto";
    return audio;
  });

  // Song sheets (array of piano key indices)
  const songs = {
    free: null,
    twinkle: {
      name: "Twinkle Twinkle Little Star",
      notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0]
    },
    mary: {
      name: "Mary Had a Little Lamb",
      notes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4]
    },
    jingle: {
      name: "Jingle Bells",
      notes: [2, 2, 2, 2, 2, 2, 2, 4, 0, 1, 2]
    }
  };

  // Key colors (match --key-color in HTML)
  const keyColors = [
    "#ff6b6b", // C4 - Red
    "#ffa502", // D4 - Orange
    "#ffd23f", // E4 - Yellow
    "#10ac84", // F4 - Green
    "#0984e3", // G4 - Blue
    "#6c5ce7", // A4 - Purple
    "#a29bfe", // B4 - Lavender
    "#fd79a8"  // C5 - Pink
  ];

  // Key display labels (Thai solfege + note name)
  const keyLabels = [
    "โด (C)", "เร (D)", "มี (E)", "ฟา (F)",
    "ซอล (G)", "ลา (A)", "ที (B)", "โด๊ (C')"
  ];

  // Game States
  let currentMode = "synth"; // synth, animal, mix
  let selectedSongKey = "free";
  let songProgressIndex = 0;
  let songRoundTarget = 1;   // how many rounds to play
  let songRoundsCompleted = 0;
  let audioContext = null;

  // ---------------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------------
  const pianoKeys = document.querySelectorAll(".piano-key");
  const stageAnimals = document.querySelectorAll(".stage-animal");
  const modePills = document.querySelectorAll(".mode-pill");
  const songSelect = document.getElementById("song-select");
  const songHelper = document.getElementById("song-helper");
  const songTitleLabel = document.getElementById("song-title-label");
  const songProgressText = document.getElementById("song-progress");
  const guideColorSwatch = document.getElementById("guide-color-swatch");
  const guideKeyName = document.getElementById("guide-key-name");
  const repeatCountEl = document.getElementById("repeat-count");
  const btnRepeatMinus = document.getElementById("btn-repeat-minus");
  const btnRepeatPlus = document.getElementById("btn-repeat-plus");
  const particleContainer = document.getElementById("particle-container");
  const victoryModal = document.getElementById("victory-modal");
  const btnNextSong = document.getElementById("btn-next-song");
  // Song Guide Panel elements
  const gameMain = document.querySelector(".game-main");
  const songGuidePanel = document.getElementById("song-guide-panel");
  const sgpNoteBlock = document.getElementById("sgp-note-block");
  const sgpNoteEmoji = document.getElementById("sgp-note-emoji");
  const sgpNoteLetter = document.getElementById("sgp-note-letter");
  const sgpNoteSolfege = document.getElementById("sgp-note-solfege");
  const sgpSequence = document.getElementById("sgp-sequence");

  // ---------------------------------------------------------------------
  // Audio Synthesis Setup
  // ---------------------------------------------------------------------
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  }

  // Synthesizes a warm chime/bell musical note
  function playSynthNote(freq) {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    
    // Warm tone generator: Main triangle wave + secondary sine wave
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, now);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, now); // Overtones
    
    // Envelope: Quick attack, slow organic decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  // Play real animal sound file (with playback rate tuned to the piano key)
  function playAnimalSpeech(index, noteName) {
    const audio = audioCache[index];
    if (!audio) return;

    // Map piano note to playback rate so the sound feels tuned to the key
    const rateMap = {
      "C4": 0.80,
      "D4": 0.90,
      "E4": 1.00,
      "F4": 1.06,
      "G4": 1.12,
      "A4": 1.20,
      "B4": 1.28,
      "C5": 1.40
    };

    // Clone the audio node so rapid presses don't cut each other off
    const clip = audio.cloneNode();
    clip.playbackRate = rateMap[noteName] || 1.0;
    clip.volume = 0.85;
    clip.play().catch(() => {}); // Silently swallow autoplay policy errors
  }

  // ---------------------------------------------------------------------
  // Visual Feedback & Particles
  // ---------------------------------------------------------------------
  function animateKeyAndAnimal(index, noteName) {
    // 1. Highlight Piano Key
    const key = pianoKeys[index];
    if (key) {
      key.classList.add("active");
      setTimeout(() => key.classList.remove("active"), 150);
    }

    // 2. Bounce Animal on Stage
    const animal = document.getElementById(`animal-${index}`);
    if (animal) {
      animal.classList.remove("bounce");
      void animal.offsetWidth; // Trigger reflow
      animal.classList.add("bounce");
      setTimeout(() => animal.classList.remove("bounce"), 450);
    }

    // 3. Spawn Floating Particles from Key
    if (key) {
      const rect = key.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top;
      spawnParticles(originX, originY, index);
    }
  }

  function spawnParticles(x, y, index) {
    const emojis = ["🎵", "⭐", "✨", "🎵", animalSounds[index].thai];
    const particleCount = 4;

    for (let i = 0; i < particleCount; i++) {
      const part = document.createElement("span");
      part.className = "music-particle";
      part.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Random spread coordinates
      const dx = (Math.random() - 0.5) * 80;
      const dy = (Math.random() - 0.5) * 40;
      
      part.style.left = `${x + dx}px`;
      part.style.top = `${y + dy}px`;
      
      // Random animation variables
      const scale = 0.5 + Math.random() * 0.7;
      part.style.transform = `scale(${scale})`;
      
      particleContainer.appendChild(part);
      
      // Cleanup
      setTimeout(() => part.remove(), 1200);
    }
  }

  // ---------------------------------------------------------------------
  // Game Actions
  // ---------------------------------------------------------------------
  function triggerKey(index) {
    initAudio();
    const key = pianoKeys[index];
    if (!key) return;

    const note = key.dataset.note;
    const freq = noteFreqs[note];

    // Trigger Sound depending on Mode
    if (currentMode === "synth") {
      playSynthNote(freq);
    } else if (currentMode === "animal") {
      playAnimalSpeech(index, note);
    } else if (currentMode === "mix") {
      playSynthNote(freq);
      playAnimalSpeech(index, note);
    }

    // Animate
    animateKeyAndAnimal(index, note);

    // Process Song Guide progression
    if (selectedSongKey !== "free") {
      const songSheet = songs[selectedSongKey];
      const targetIndex = songSheet.notes[songProgressIndex];

      if (index === targetIndex) {
        // Correct note pressed!
        songProgressIndex++;
        
        if (songProgressIndex >= songSheet.notes.length) {
          // Finished one round
          songRoundsCompleted++;
          if (songRoundsCompleted >= songRoundTarget) {
            // All rounds done — show victory!
            setTimeout(() => {
              victoryModal.classList.add("active");
              // Victory fanfare using synth chime
              initAudio();
              playSynthNote(523.25); // C5
              setTimeout(() => playSynthNote(659.25), 150); // E5
              setTimeout(() => playSynthNote(783.99), 300); // G5
              setTimeout(() => playSynthNote(1046.50), 450); // C6
            }, 600);
          } else {
            // Start next round
            songProgressIndex = 0;
            updateSongGuide();
          }
        } else {
          // Next note
          updateSongGuide();
        }
      }
    }
  }

  // ---------------------------------------------------------------------
  // Song Guide Management
  // ---------------------------------------------------------------------
  function updateSongGuide() {
    // Clear all existing highlights
    pianoKeys.forEach(k => k.classList.remove("guide-highlight"));

    if (selectedSongKey === "free") {
      songHelper.style.display = "none";
      songGuidePanel.style.display = "none";
      gameMain.classList.remove("song-mode");
      return;
    }

    const songSheet = songs[selectedSongKey];
    if (!songSheet) return;

    // Activate song-mode layout
    gameMain.classList.add("song-mode");
    songGuidePanel.style.display = "flex";

    // Show helper details
    songHelper.style.display = "flex";
    songTitleLabel.textContent = `เพลง: ${songSheet.name}`;
    const totalNotes = songSheet.notes.length * songRoundTarget;
    const notesPlayed = (songRoundsCompleted * songSheet.notes.length) + songProgressIndex;
    songProgressText.textContent = `${notesPlayed} / ${totalNotes}`;

    // Highlight the target key on the keyboard
    const targetKeyIndex = songSheet.notes[songProgressIndex];
    const targetKey = pianoKeys[targetKeyIndex];
    if (targetKey) {
      targetKey.classList.add("guide-highlight");
    }

    // Update small color swatch in hint bar
    if (guideColorSwatch) guideColorSwatch.style.background = keyColors[targetKeyIndex];
    if (guideKeyName) guideKeyName.textContent = keyLabels[targetKeyIndex];

    // --- Update big Song Guide Panel ---
    // Note letter (C, D, E ...)
    const noteLetters = ["C", "D", "E", "F", "G", "A", "B", "C'"];
    const noteSolfege = ["โด", "เร", "มี", "ฟา", "ซอล", "ลา", "ที", "โด๊"];
    const animalEmojis = ["🐱", "🐶", "🐘", "🐥", "🦆", "🐸", "🐵", "🦁"];

    sgpNoteBlock.style.background = keyColors[targetKeyIndex];
    sgpNoteBlock.style.boxShadow = `0 8px 24px ${keyColors[targetKeyIndex]}88`;
    sgpNoteEmoji.textContent = animalEmojis[targetKeyIndex];
    sgpNoteLetter.textContent = noteLetters[targetKeyIndex];
    sgpNoteSolfege.textContent = noteSolfege[targetKeyIndex];

    // Build the upcoming-note sequence dots (next 12 notes)
    sgpSequence.innerHTML = "";
    const allNotes = [];
    // Build full sequence including rounds
    for (let r = 0; r < songRoundTarget; r++) {
      songSheet.notes.forEach(n => allNotes.push(n));
    }
    const globalPos = songRoundsCompleted * songSheet.notes.length + songProgressIndex;
    const windowStart = Math.max(0, globalPos - 1);
    const windowEnd = Math.min(allNotes.length, globalPos + 12);
    allNotes.slice(windowStart, windowEnd).forEach((noteIdx, i) => {
      const absPos = windowStart + i;
      const dot = document.createElement("div");
      dot.className = "sgp-dot";
      if (absPos < globalPos)      dot.classList.add("sgp-dot-done");
      else if (absPos === globalPos) dot.classList.add("sgp-dot-next");
      dot.style.background = keyColors[noteIdx];
      dot.title = noteLetters[noteIdx];
      sgpSequence.appendChild(dot);
    });
  }

  function resetSongRound() {
    songProgressIndex = 0;
    songRoundsCompleted = 0;
    victoryModal.classList.remove("active");
    updateSongGuide();
  }

  // ---------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------
  
  // 1. Piano Keyboard Click and Touch events
  pianoKeys.forEach((key, index) => {
    // Mouse Click
    key.addEventListener("mousedown", (e) => {
      e.preventDefault();
      triggerKey(index);
    });

    // Touch Event (responsive for iPads/Mobiles)
    key.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Prevents double‑triggering
      triggerKey(index);
    });
  });

  // 2. Animal Stage clicks (bounces them as well!)
  stageAnimals.forEach((animal) => {
    animal.addEventListener("click", () => {
      const keyIndex = parseInt(animal.dataset.key);
      triggerKey(keyIndex);
    });
  });

  // 3. Keyboard input support for computers (1 to 8 keys)
  window.addEventListener("keydown", (e) => {
    const keyMap = {
      "1": 0, "2": 1, "3": 2, "4": 3,
      "5": 4, "6": 5, "7": 6, "8": 7
    };
    if (e.key in keyMap) {
      triggerKey(keyMap[e.key]);
    }
  });

  // 4. Mode Selection Toggles
  modePills.forEach(pill => {
    pill.addEventListener("click", () => {
      modePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentMode = pill.dataset.mode;
      initAudio();
    });
  });

  // 5. Song Guide Selector
  songSelect.addEventListener("change", (e) => {
    selectedSongKey = e.target.value;
    resetSongRound();
  });

  // 6. Modal controls
  btnNextSong.addEventListener("click", () => {
    resetSongRound();
  });

  // 7. Repeat +/- buttons
  btnRepeatPlus.addEventListener("click", () => {
    songRoundTarget = Math.min(songRoundTarget + 1, 10);
    repeatCountEl.textContent = songRoundTarget;
    if (selectedSongKey !== "free") updateSongGuide(); // refresh progress display
  });
  btnRepeatMinus.addEventListener("click", () => {
    songRoundTarget = Math.max(songRoundTarget - 1, 1);
    repeatCountEl.textContent = songRoundTarget;
    if (selectedSongKey !== "free") updateSongGuide();
  });

  // Auto-init audio on document click to satisfy browser security policies
  window.addEventListener("click", initAudio, { once: true });
  window.addEventListener("touchstart", initAudio, { once: true });

})();
