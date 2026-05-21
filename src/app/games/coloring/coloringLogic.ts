// @ts-nocheck
/**
 * Magic Coloring Game - game.js
 * Scratch-off reveal: draw on the canvas to reveal the colorful animal image!
 * Uses two-layer canvas: gray overlay on top, full-color image beneath.
 */

import { getAnimalImageCatalog } from "@/lib/animalCatalog";
import { loadGlobalSoundEnabled, saveGlobalSoundEnabled } from "@/lib/soundPreference";

const ANIMALS = getAnimalImageCatalog().map((animal) => ({
  id: animal.id,
  label: animal.labelTh,
  src: animal.image,
}));

// ─── Audio Synthesizer ───
const Audio$ = {
  ctx: null,
  enabled: true,
  activeOscillators: new Set(),
  winTimers: new Set(),
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  _play(f1, f2, dur, type = 'sine', vol = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
      if (f2) osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try { osc.disconnect(); } catch (e) {}
        try { gain.disconnect(); } catch (e) {}
      };
      osc.start(); osc.stop(this.ctx.currentTime + dur + 0.01);
    } catch (e) {}
  },
  stroke(pct) {
    // Pitch rises as more is revealed
    const freq = 220 + pct * 4;
    this._play(freq, freq + 40, 0.06, 'sine', 0.06);
  },
  win() {
    this.stopAll();
    if (!this.enabled) return;
    [261, 330, 392, 523, 659, 784, 1047].forEach((f, i) =>
      {
        const timerId = setTimeout(() => {
          this.winTimers.delete(timerId);
          this._play(f, f * 1.4, 0.22, 'triangle', 0.14);
        }, i * 90);
        this.winTimers.add(timerId);
      }
    );
  },
  stopAll() {
    this.winTimers.forEach((id) => clearTimeout(id));
    this.winTimers.clear();
    this.activeOscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    this.activeOscillators.clear();
  },
};

// ─── Game ───
const Game = {
  canvas: null,
  ctx: null,
  imageObj: null,
  currentAnimal: 'panda',
  currentAnimalIdx: 0,
  brushSize: 70,
  isDrawing: false,
  revealed: 0,        // pixels revealed count (sampled)
  totalPixels: 0,
  hasStarted: false,
  victoryThreshold: 0.72,  // 72% revealed = win
  checkInterval: null,
  checkIntervals: new Set(),
  lastSoundTime: 0,
  destroyed: false,
  hasWon: false,
  victoryTimeout: null,
  victoryModalTimeout: null,
  loadVersion: 0,
  modalActionLocked: false,

  init() {
    this.destroyed = false;
    this.canvas = document.getElementById('coloring-canvas');
    if (!this.canvas) return;
    Audio$.enabled = loadGlobalSoundEnabled(true);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.bgImg = document.getElementById('coloring-bg-img');
    this.bindUI();
    this.loadAnimal('panda');
  },

  destroy() {
    this.destroyed = true;
    this.clearAllCheckIntervals();
    clearTimeout(this.victoryTimeout);
    clearTimeout(this.victoryModalTimeout);
    this.victoryTimeout = null;
    this.victoryModalTimeout = null;
    this.isDrawing = false;
    this.hasWon = false;
    Audio$.stopAll();
  },

  clearAllCheckIntervals() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.checkIntervals.forEach((id) => clearInterval(id));
    this.checkIntervals.clear();
  },

  setVictoryButtonsDisabled(disabled) {
    const nextBtn = document.getElementById('btn-next-animal');
    const againBtn = document.getElementById('btn-play-again');
    [nextBtn, againBtn].forEach((btn) => {
      if (!btn) return;
      btn.disabled = disabled;
    });
  },

  bindUI() {
    // Animal pills
    document.querySelectorAll('.animal-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio$.init();
        document.querySelectorAll('.animal-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const animal = btn.dataset.animal;
        this.currentAnimal = animal;
        this.currentAnimalIdx = ANIMALS.findIndex(a => a.id === animal);
        this.loadAnimal(animal);
      });
    });

    // Brush buttons
    document.querySelectorAll('.brush-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.brushSize = parseInt(btn.dataset.size);
        Audio$.init();
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.textContent = Audio$.enabled ? '🔊' : '🔇';
      soundBtn.onclick = (e) => {
        Audio$.enabled = !Audio$.enabled;
        if (!Audio$.enabled) Audio$.stopAll();
        saveGlobalSoundEnabled(Audio$.enabled);
        e.currentTarget.textContent = Audio$.enabled ? '🔊' : '🔇';
      };
    }

    // New animal button
    document.getElementById('btn-new-animal').addEventListener('click', () => {
      Audio$.init();
      this.currentAnimalIdx = (this.currentAnimalIdx + 1) % ANIMALS.length;
      const next = ANIMALS[this.currentAnimalIdx];
      this.currentAnimal = next.id;
      // Update pill selection
      document.querySelectorAll('.animal-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.animal === next.id);
      });
      this.loadAnimal(next.id);
    });

    // Canvas mouse/touch drawing
    this.canvas.addEventListener('mousedown', e => { Audio$.init(); this.startDraw(e); });
    this.canvas.addEventListener('mousemove', e => this.draw(e));
    this.canvas.addEventListener('mouseup',   () => this.stopDraw());
    this.canvas.addEventListener('mouseleave',() => this.stopDraw());
    this.canvas.addEventListener('touchstart', e => { e.preventDefault(); Audio$.init(); this.startDraw(e); }, { passive: false });
    this.canvas.addEventListener('touchmove',  e => { e.preventDefault(); this.draw(e); }, { passive: false });
    this.canvas.addEventListener('touchend',   e => { e.preventDefault(); this.stopDraw(); }, { passive: false });

    // Victory buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      if (this.modalActionLocked) return;
      this.modalActionLocked = true;
      this.setVictoryButtonsDisabled(true);
      document.getElementById('victory-modal').classList.remove('active');
      this.loadAnimal(this.currentAnimal);
    });
    document.getElementById('btn-next-animal').addEventListener('click', () => {
      if (this.modalActionLocked) return;
      this.modalActionLocked = true;
      this.setVictoryButtonsDisabled(true);
      document.getElementById('victory-modal').classList.remove('active');
      this.currentAnimalIdx = (this.currentAnimalIdx + 1) % ANIMALS.length;
      const next = ANIMALS[this.currentAnimalIdx];
      this.currentAnimal = next.id;
      document.querySelectorAll('.animal-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.animal === next.id);
      });
      this.loadAnimal(next.id);
    });
  },

  loadAnimal(animalId) {
    const currentLoadVersion = ++this.loadVersion;
    const loader = document.getElementById('loading-overlay');
    if (!loader) return;
    loader.classList.add('active');
    const hintOverlay = document.getElementById('hint-overlay');
    if (hintOverlay) hintOverlay.classList.remove('hidden');
    this.hasStarted = false;
    this.hasWon = false;
    this.clearAllCheckIntervals();
    clearTimeout(this.victoryTimeout);
    clearTimeout(this.victoryModalTimeout);
    this.victoryTimeout = null;
    this.victoryModalTimeout = null;
    Audio$.stopAll();
    this.updateProgress(0);

    const animal = ANIMALS.find(a => a.id === animalId);
    this.imageObj = new Image();
    this.imageObj.crossOrigin = 'anonymous';
    this.imageObj.onload = () => {
      if (this.destroyed || currentLoadVersion !== this.loadVersion) return;
      loader.classList.remove('active');
      this.setupCanvas();
    };
    this.imageObj.onerror = () => {
      if (this.destroyed || currentLoadVersion !== this.loadVersion) return;
      loader.classList.remove('active');
    };
    this.imageObj.src = animal.src;
  },

  setupCanvas() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper || !this.canvas || !this.ctx || !this.imageObj) return;
    const wrapperWidth = wrapper.clientWidth;
    const W = Number.isFinite(wrapperWidth) && wrapperWidth > 0 ? Math.round(wrapperWidth) : 640;
    const naturalWidth = this.imageObj.naturalWidth;
    const naturalHeight = this.imageObj.naturalHeight;
    const ratio = Number.isFinite(naturalWidth) && Number.isFinite(naturalHeight) && naturalWidth > 0
      ? naturalHeight / naturalWidth
      : 1;
    const rawH = Math.round(W * ratio);
    const H = Number.isFinite(rawH) && rawH > 0 ? rawH : Math.round(W * 0.75);

    this.canvas.width  = W;
    this.canvas.height = H;

    // 1) Show the full-color image as CSS background (behind canvas)
    this.bgImg.src = this.imageObj.src;
    this.bgImg.style.display = 'block';

    // 2) Draw ONLY the fog overlay on the canvas (image NOT drawn here)
    //    destination-out will erase fog pixels, revealing bgImg beneath
    this.ctx.clearRect(0, 0, W, H);
    const radius = Math.max(W, H) * 0.7;
    const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : Math.max(W, H, 1);
    const grad = this.ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, safeRadius);
    grad.addColorStop(0, 'rgba(200,210,230,0.97)');
    grad.addColorStop(1, 'rgba(180,190,215,0.99)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, W, H);

    // Add sparkle dots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 2 + Math.random() * 5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.4})`;
      this.ctx.fill();
    }

    // "?" watermark
    this.ctx.font = `bold ${Math.floor(H * 0.4)}px 'Fredoka', sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
    this.ctx.fillText('?', W / 2, H / 2);

    this.totalPixels = W * H;
    this.revealed = 0;
    this.clearAllCheckIntervals();
    this.checkInterval = setInterval(() => this.checkReveal(), 1000);
    this.checkIntervals.add(this.checkInterval);
  },

  getCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  },

  startDraw(e) {
    this.isDrawing = true;
    if (!this.hasStarted) {
      this.hasStarted = true;
      document.getElementById('hint-overlay').classList.add('hidden');
    }
    const pos = this.getCanvasPos(e);
    this.eraseBrush(pos.x, pos.y);
  },

  draw(e) {
    if (!this.isDrawing || this.hasWon) return;
    const pos = this.getCanvasPos(e);
    this.eraseBrush(pos.x, pos.y);

    // Sound throttle: max 1 sound per 100ms
    const now = Date.now();
    if (now - this.lastSoundTime > 100) {
      this.lastSoundTime = now;
      Audio$.stroke(this.getRevealPct() * 100);
    }
  },

  stopDraw() {
    this.isDrawing = false;
  },

  eraseBrush(cx, cy) {
    const r = this.brushSize / 2;
    // Use destination-out to erase pixels (reveal image beneath)
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   'rgba(0,0,0,1)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  },

  getRevealPct() {
    // Sample a grid of pixels, count transparent ones
    const W = this.canvas.width;
    const H = this.canvas.height;
    const step = 8; // sample every 8px
    let transparent = 0;
    let total = 0;
    try {
      const data = this.ctx.getImageData(0, 0, W, H).data;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          // alpha channel
          if (data[i + 3] < 128) transparent++;
          total++;
        }
      }
    } catch (e) { return 0; }
    return total > 0 ? transparent / total : 0;
  },

  checkReveal() {
    if (this.destroyed || this.hasWon) return;
    const pct = this.getRevealPct();
    this.updateProgress(pct);
    if (pct >= this.victoryThreshold) {
      this.hasWon = true;
      this.clearAllCheckIntervals();
      this.victoryTimeout = setTimeout(() => {
        this.victoryTimeout = null;
        this.showVictory();
      }, 400);
    }
  },

  updateProgress(pct) {
    const p = Math.min(100, Math.round(pct * 100));
    const progressBar = document.getElementById('progress-bar');
    const progressPct = document.getElementById('progress-pct');
    if (!progressBar || !progressPct) return;
    progressBar.style.width = p + '%';
    progressPct.textContent = p + '%';
  },

  showVictory() {
    if (this.destroyed) return;
    this.modalActionLocked = false;
    this.setVictoryButtonsDisabled(false);
    // Clear the fog canvas entirely — bgImg already shows the full image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateProgress(1);
    Audio$.win();

    // Set preview image
    const preview = document.getElementById('victory-preview');
    const animal = ANIMALS.find(a => a.id === this.currentAnimal);
    preview.innerHTML = `<img src="${animal.src}" alt="${animal.label}">`;

    this.victoryModalTimeout = setTimeout(() => {
      this.victoryModalTimeout = null;
      document.getElementById('victory-modal').classList.add('active');
    }, 600);
  },
};

export function initColoringGame() {
  Game.init();
  return () => Game.destroy();
}
