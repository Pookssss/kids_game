/**
 * Animal Memory Match Game - game.js
 * Flip cards to find matching animal pairs!
 */

const ANIMALS = [
  { id: 'panda',    label: 'แพนด้า',    src: '../../assets/cute_panda.png' },
  { id: 'lion',     label: 'สิงโต',     src: '../../assets/cute_lion.png' },
  { id: 'elephant', label: 'ช้างน้อย',  src: '../../assets/cute_elephant.png' },
  { id: 'fox',      label: 'จิ้งจอก',   src: '../../assets/cute_fox.png' },
  { id: 'cat',      label: 'แมวเหมียว', src: '../../assets/cute_cat.png' },
  { id: 'koala',    label: 'โคอาล่า',   src: '../../assets/cute_koala.png' },
  { id: 'rabbit',   label: 'กระต่าย',   src: '../../assets/cute_rabbit.png' },
  { id: 'monkey',   label: 'ลิงซน',     src: '../../assets/cute_monkey.png' },
];

const MODES = {
  easy:   { pairs: 4,  cols: 4 },
  medium: { pairs: 6,  cols: 4 },
  hard:   { pairs: 8,  cols: 4 },
};

// ─── Audio Synthesizer ───
const Audio$ = {
  ctx: null,
  enabled: true,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  _play(freq1, freq2, dur, type = 'sine', vol = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq1, this.ctx.currentTime);
      if (freq2) osc.frequency.exponentialRampToValueAtTime(freq2, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur + 0.02);
    } catch(e) {}
  },
  flip()   { this._play(330, 520, 0.1, 'sine', 0.12); },
  match()  {
    this._play(523, 659, 0.12, 'triangle', 0.18);
    setTimeout(() => this._play(659, 784, 0.12, 'triangle', 0.18), 120);
    setTimeout(() => this._play(784, 1047, 0.2, 'triangle', 0.15), 240);
  },
  wrong()  { this._play(300, 200, 0.18, 'sawtooth', 0.1); },
  win()    {
    const notes = [261, 330, 392, 523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this._play(f, f * 1.5, 0.25, 'triangle', 0.14), i * 100));
  },
};

// ─── Game State ───
const Game = {
  mode: 'easy',
  cards: [],           // [{id, src, label, el, matched, flipped}]
  flipped: [],         // max 2 at a time
  locked: false,
  matches: 0,
  moves: 0,
  total: 0,

  init() {
    this.bindUI();
    this.start('easy');
  },

  bindUI() {
    document.querySelectorAll('.diff-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio$.flip();
        document.querySelectorAll('.diff-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.start(btn.dataset.mode);
      });
    });

    document.getElementById('btn-new-game').addEventListener('click', () => {
      Audio$.flip();
      this.start(this.mode);
    });

    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      Audio$.enabled = !Audio$.enabled;
      e.currentTarget.textContent = Audio$.enabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      document.getElementById('victory-modal').classList.remove('active');
      this.start(this.mode);
    });
  },

  start(mode) {
    this.mode = mode;
    this.matches = 0;
    this.moves = 0;
    this.flipped = [];
    this.locked = false;

    const { pairs, cols } = MODES[mode];
    this.total = pairs;

    // Pick random animals
    const pool = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, pairs);
    const deck = [...pool, ...pool].sort(() => Math.random() - 0.5);

    this.cards = deck.map((animal, i) => ({
      ...animal,
      uid: i,
      matched: false,
      flipped: false,
      el: null,
    }));

    this.updateScore();
    this.renderGrid(cols);
  },

  renderGrid(cols) {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    grid.className = `card-grid grid-${cols}`;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    this.cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.setAttribute('data-idx', idx);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `ไพ่ ${idx + 1}`);
      el.style.animationDelay = `${idx * 0.04}s`;

      el.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back"></div>
          <div class="card-face card-front">
            <img src="${card.src}" alt="${card.label}" draggable="false">
          </div>
        </div>`;

      el.addEventListener('click', () => { Audio$.init(); this.onFlip(idx); });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Audio$.init(); this.onFlip(idx); }
      });

      card.el = el;
      grid.appendChild(el);
    });
  },

  onFlip(idx) {
    if (this.locked) return;
    const card = this.cards[idx];
    if (card.matched || card.flipped) return;
    if (this.flipped.length === 2) return;

    // Flip card
    card.flipped = true;
    card.el.classList.add('flipped');
    Audio$.flip();
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.moves++;
      this.updateScore();
      this.checkMatch();
    }
  },

  checkMatch() {
    this.locked = true;
    const [a, b] = this.flipped;

    if (a.id === b.id) {
      // Match!
      setTimeout(() => {
        a.matched = b.matched = true;
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        Audio$.match();
        this.matches++;
        this.updateScore();
        this.flipped = [];
        this.locked = false;

        if (this.matches === this.total) {
          setTimeout(() => this.showVictory(), 500);
        }
      }, 400);
    } else {
      // No match
      setTimeout(() => {
        Audio$.wrong();
        a.flipped = b.flipped = false;
        a.el.classList.remove('flipped');
        b.el.classList.remove('flipped');
        this.flipped = [];
        this.locked = false;
      }, 1000);
    }
  },

  updateScore() {
    document.getElementById('score-display').textContent = this.matches;
    document.getElementById('moves-display').textContent = this.moves;
  },

  showVictory() {
    Audio$.win();
    const emojis = ['🏆', '⭐', '🦁', '🐼', '🎉', '🌟'];
    document.getElementById('victory-emoji').textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.getElementById('victory-stats').textContent =
      `จับคู่ได้ ${this.total} คู่ ใช้เวลาพลิก ${this.moves} ครั้ง ${this.moves <= this.total * 2 ? '🌟 ยอดเยี่ยม!' : '👏 เก่งมาก!'}`;
    document.getElementById('victory-modal').classList.add('active');
  },
};

window.addEventListener('DOMContentLoaded', () => Game.init());
