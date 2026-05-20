/**
 * ABC Animals Game - game.js
 * Click a letter → hear its name, phonics, and word spoken aloud.
 * Tracks which letters have been learned (⭐).
 * Uses Web Speech API — no external audio files needed.
 */

// ─── Alphabet Data ───
const ALPHABET = [
  { letter:'A', word:'Ant',      emoji:'🐜', phonics:'"แอ"',  color:'#ff6b81', color2:'#ff4757' },
  { letter:'B', word:'Bear',     emoji:'🐻', phonics:'"บี"',  color:'#fd79a8', color2:'#e84393' },
  { letter:'C', word:'Cat',      emoji:'🐱', img:'../../assets/cute_cat.png',
                                             phonics:'"ซี"',  color:'#e17055', color2:'#d63031' },
  { letter:'D', word:'Duck',     emoji:'🦆', phonics:'"ดี"',  color:'#fdcb6e', color2:'#e1b12c' },
  { letter:'E', word:'Elephant', emoji:'🐘', img:'../../assets/cute_elephant.png',
                                             phonics:'"อี"',  color:'#00b894', color2:'#00a381' },
  { letter:'F', word:'Fox',      emoji:'🦊', img:'../../assets/cute_fox.png',
                                             phonics:'"เอฟ"', color:'#e67e22', color2:'#ca6f1e' },
  { letter:'G', word:'Giraffe',  emoji:'🦒', phonics:'"จี"',  color:'#f1c40f', color2:'#d4ac0d' },
  { letter:'H', word:'Horse',    emoji:'🐴', phonics:'"เอช"', color:'#a29bfe', color2:'#6c5ce7' },
  { letter:'I', word:'Igloo',    emoji:'🏔️', phonics:'"ไอ"',  color:'#74b9ff', color2:'#0984e3' },
  { letter:'J', word:'Jellyfish',emoji:'🪼', phonics:'"เจ"',  color:'#6c5ce7', color2:'#5641e5' },
  { letter:'K', word:'Koala',    emoji:'🐨', img:'../../assets/cute_koala.png',
                                             phonics:'"เค"',  color:'#55efc4', color2:'#00b894' },
  { letter:'L', word:'Lion',     emoji:'🦁', img:'../../assets/cute_lion.png',
                                             phonics:'"แอล"', color:'#ffa502', color2:'#e67e22' },
  { letter:'M', word:'Monkey',   emoji:'🐒', img:'../../assets/cute_monkey.png',
                                             phonics:'"เอ็ม"',color:'#fd79a8', color2:'#e84393' },
  { letter:'N', word:'Narwhal',  emoji:'🐋', phonics:'"เอ็น"',color:'#0984e3', color2:'#0652dd' },
  { letter:'O', word:'Octopus',  emoji:'🐙', phonics:'"โอ"',  color:'#e84393', color2:'#c0392b' },
  { letter:'P', word:'Panda',    emoji:'🐼', img:'../../assets/cute_panda.png',
                                             phonics:'"พี"',  color:'#636e72', color2:'#2d3436' },
  { letter:'Q', word:'Quail',    emoji:'🐦', phonics:'"คิว"', color:'#b2bec3', color2:'#636e72' },
  { letter:'R', word:'Rabbit',   emoji:'🐰', img:'../../assets/cute_rabbit.png',
                                             phonics:'"อาร์"',color:'#ff7675', color2:'#d63031' },
  { letter:'S', word:'Snake',    emoji:'🐍', phonics:'"เอส"', color:'#2ed573', color2:'#1e9e55' },
  { letter:'T', word:'Tiger',    emoji:'🐯', phonics:'"ที"',  color:'#ff6348', color2:'#e74c3c' },
  { letter:'U', word:'Unicorn',  emoji:'🦄', phonics:'"ยู"',  color:'#a29bfe', color2:'#7c6ef7' },
  { letter:'V', word:'Vulture',  emoji:'🦅', phonics:'"วี"',  color:'#636e72', color2:'#4a5568' },
  { letter:'W', word:'Whale',    emoji:'🐳', phonics:'"ดับเบิ้ลยู"', color:'#74b9ff', color2:'#2980b9' },
  { letter:'X', word:'X-ray',    emoji:'🐠', phonics:'"เอ็กซ์"', color:'#00cec9', color2:'#00b3ae' },
  { letter:'Y', word:'Yak',      emoji:'🦬', phonics:'"วาย"', color:'#6ab04c', color2:'#4a8a2a' },
  { letter:'Z', word:'Zebra',    emoji:'🦓', phonics:'"แซด"', color:'#2d3436', color2:'#1a1e21' },
];

// ─── State ───
const State = {
  learned: new Set(),        // set of letter strings that have been visited
  currentIdx: 0,
  soundEnabled: true,
  modalOpen: false,
};

// ─── Speech ───
const Speech = {
  supported: 'speechSynthesis' in window,
  voice: null,

  loadVoice() {
    if (!this.supported) return;
    const tryFind = () => {
      const voices = speechSynthesis.getVoices();
      // Prefer English US
      this.voice = voices.find(v => v.lang === 'en-US')
                || voices.find(v => v.lang.startsWith('en'))
                || voices[0]
                || null;
    };
    tryFind();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = tryFind;
    }
  },

  speak(text, rate = 0.82, pitch = 1.1) {
    if (!this.supported || !State.soundEnabled) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = 'en-US';
    utt.rate  = rate;
    utt.pitch = pitch;
    if (this.voice) utt.voice = this.voice;
    speechSynthesis.speak(utt);
  },

  speakLetter(data) {
    // "A! A for Ant!" with a small pause in between
    this.speak(`${data.letter}!`, 0.75, 1.2);
    setTimeout(() => {
      this.speak(`${data.letter} for ${data.word}`, 0.78, 1.1);
    }, 700);
  },
};

// ─── UI Helpers ───
function $(id) { return document.getElementById(id); }

function updateLearnedCount() {
  $('learned-count').textContent = State.learned.size;
  $('progress-emoji').textContent = State.learned.size === 26 ? '🏆' : '⭐';
}

function markCardLearned(letter) {
  const card = document.querySelector(`.letter-card[data-letter="${letter}"]`);
  if (card) card.classList.add('learned');
}

// ─── Modal ───
function openModal(idx) {
  State.currentIdx = idx;
  State.modalOpen = true;
  renderModal(idx);
  $('letter-modal').classList.add('active');
  // Auto-speak when opening
  setTimeout(() => Speech.speakLetter(ALPHABET[idx]), 300);
}

function closeModal() {
  State.modalOpen = false;
  $('letter-modal').classList.remove('active');
  speechSynthesis.cancel();
}

function renderModal(idx) {
  const d = ALPHABET[idx];

  // Letter display
  $('modal-big-letter').textContent = d.letter;
  $('modal-big-letter').style.color = d.color;
  $('modal-small-letter').textContent = d.letter.toLowerCase();
  $('modal-small-letter').style.color = d.color2;

  // Animal display
  const display = $('modal-animal-display');
  display.style.borderColor = d.color;
  if (d.img) {
    display.innerHTML = `<img src="${d.img}" alt="${d.word}">`;
  } else {
    display.textContent = d.emoji;
  }

  // Word and phonics
  $('modal-word').textContent = d.word;
  $('modal-word').style.color = d.color;
  $('modal-phonics').textContent = `${d.phonics}`;

  // Speak button color
  const btn = $('btn-speak');
  btn.style.background = `linear-gradient(135deg, ${d.color}, ${d.color2})`;
  btn.style.boxShadow  = `0 8px 22px ${d.color}55`;

  // Learned star
  const star = $('modal-star');
  if (State.learned.has(d.letter)) {
    star.classList.add('show');
  } else {
    star.classList.remove('show');
  }

  // Mark as learned
  if (!State.learned.has(d.letter)) {
    State.learned.add(d.letter);
    markCardLearned(d.letter);
    updateLearnedCount();
    // Small delay so ⭐ appears after speak
    setTimeout(() => {
      star.classList.add('show');
      if (State.learned.size === 26) {
        setTimeout(() => {
          closeModal();
          $('victory-modal').classList.add('active');
          Speech.speak('Congratulations! You learned all 26 letters!', 0.8, 1.1);
        }, 1200);
      }
    }, 1200);
  }
}

// ─── Grid Render ───
function renderGrid() {
  const grid = $('alphabet-grid');
  grid.innerHTML = '';

  ALPHABET.forEach((d, idx) => {
    const card = document.createElement('div');
    card.className = 'letter-card' + (State.learned.has(d.letter) ? ' learned' : '');
    card.dataset.letter = d.letter;
    card.style.background = `linear-gradient(145deg, ${d.color}, ${d.color2})`;
    card.style.animationDelay = `${idx * 0.03}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${d.letter} for ${d.word}`);

    card.innerHTML = `
      <span class="card-letter-upper">${d.letter}</span>
      <span class="card-letter-lower">${d.letter.toLowerCase()}</span>
      <span class="card-emoji">${d.emoji}</span>
      <span class="card-word">${d.word}</span>`;

    card.addEventListener('click', () => openModal(idx));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(idx); }
    });

    grid.appendChild(card);
  });
}

// ─── Init ───
function init() {
  Speech.loadVoice();
  renderGrid();
  updateLearnedCount();

  // Modal close
  $('modal-close').addEventListener('click', closeModal);
  $('letter-modal').addEventListener('click', e => {
    if (e.target === $('letter-modal')) closeModal();
  });

  // Nav arrows
  $('btn-prev').addEventListener('click', () => {
    const prev = (State.currentIdx - 1 + 26) % 26;
    renderModal(prev);
    State.currentIdx = prev;
    Speech.speakLetter(ALPHABET[prev]);
  });

  $('btn-next').addEventListener('click', () => {
    const next = (State.currentIdx + 1) % 26;
    renderModal(next);
    State.currentIdx = next;
    Speech.speakLetter(ALPHABET[next]);
  });

  // Speak button
  $('btn-speak').addEventListener('click', () => {
    Speech.speakLetter(ALPHABET[State.currentIdx]);
  });

  // Keyboard navigation inside modal
  document.addEventListener('keydown', e => {
    if (!State.modalOpen) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') {
      const prev = (State.currentIdx - 1 + 26) % 26;
      renderModal(prev); State.currentIdx = prev;
      Speech.speakLetter(ALPHABET[prev]);
    }
    if (e.key === 'ArrowRight') {
      const next = (State.currentIdx + 1) % 26;
      renderModal(next); State.currentIdx = next;
      Speech.speakLetter(ALPHABET[next]);
    }
  });

  // Sound toggle
  $('btn-sound-toggle').addEventListener('click', e => {
    State.soundEnabled = !State.soundEnabled;
    e.currentTarget.textContent = State.soundEnabled ? '🔊' : '🔇';
    if (!State.soundEnabled) speechSynthesis.cancel();
  });

  // Reset
  $('btn-reset').addEventListener('click', () => {
    if (!confirm('รีเซ็ตความก้าวหน้าทั้งหมด?')) return;
    State.learned.clear();
    renderGrid();
    updateLearnedCount();
  });

  // Victory play again
  $('btn-play-again').addEventListener('click', () => {
    $('victory-modal').classList.remove('active');
    State.learned.clear();
    renderGrid();
    updateLearnedCount();
  });
}

window.addEventListener('DOMContentLoaded', init);
