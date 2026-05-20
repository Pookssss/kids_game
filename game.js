/**
 * Jigsaw Puzzle Game Logic - Simplified for Toddlers
 * Features Parent Gate, 2x2 difficulty, and Web Audio synth
 */

// Sound Synthesizer via Web Audio API
const AudioSynth = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playPick() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn("Audio context not allowed yet:", e);
    }
  },

  playSnap() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {
      console.warn("Audio context error:", e);
    }
  },

  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      const playNote = (freq, start, duration, type = 'sine') => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Playful chord progression (C Major arpeggio)
      playNote(261.63, now, 0.35, 'triangle');        // C4
      playNote(329.63, now + 0.1, 0.35, 'triangle');   // E4
      playNote(392.00, now + 0.2, 0.35, 'triangle');   // G4
      playNote(523.25, now + 0.3, 0.5, 'triangle');    // C5
      
      // Happy victory accent chord
      playNote(659.25, now + 0.55, 0.7, 'sine');       // E5
      playNote(783.99, now + 0.55, 0.7, 'sine');       // G5
      playNote(1046.50, now + 0.55, 0.9, 'sine');      // C6
    } catch (e) {
      console.warn("Audio context error:", e);
    }
  }
};

// Particle Effects Engine
const ParticleEngine = {
  particles: [],

  spawnSnap(x, y) {
    const colors = ['#ffeaa7', '#ff7675', '#74b9ff', '#55efc4', '#a29bfe', '#fd79a8'];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        isConfetti: false
      });
    }
  },

  spawnConfetti(canvasWidth) {
    const colors = ['#ff6b81', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#fd79a8'];
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: Math.random() * canvasWidth,
        y: -10,
        vx: -1 + Math.random() * 2,
        vy: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        alpha: 1,
        decay: 0.005 + Math.random() * 0.005,
        isConfetti: true,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.05
      });
    }
  },

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.isConfetti) {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.5;
        p.vy += 0.02; // gravity for confetti
      } else {
        p.vx *= 0.95; // drag for snap sparkles
        p.vy *= 0.95;
      }

      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > 600) {
        this.particles.splice(i, 1);
      }
    }
  },

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.isConfetti) {
        ctx.fillRect(p.x, p.y, p.size * 1.5, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
};

// Game Logic
const Game = {
  // Config & State
  canvas: null,
  ctx: null,
  currentAnimal: 'panda',
  gridSize: 3, // Default 3 (3x3)
  pieces: [],
  draggedPiece: null,
  dragOffsetX: 0,
  dragOffsetY: 0,

  // Puzzle Dimensions inside Canvas (960x540)
  boardX: 280,
  boardY: 70,
  boardWidth: 400,
  boardHeight: 400,

  // Game Stats
  timerInterval: null,
  startTime: 0,
  elapsedSeconds: 0,
  movesCount: 0,
  isWon: false,
  imageObj: null,

  // Options (Active)
  showHint: false, // Default to false (closed by default)
  showBordersOnly: false,

  // Parent Gate Verification State
  gateAnswer: 0,

  // Temp settings (inside modal before saving)
  tempSettings: {
    animal: 'panda',
    grid: 3,
    hint: false,
    border: false,
    sound: true
  },

  // Init Game
  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Set internal canvas resolution (960x540 16:9 widescreen layout)
    this.canvas.width = 960;
    this.canvas.height = 540;

    // Load animal image
    this.imageObj = new Image();
    
    // Wire up events
    this.setupEventListeners();
    this.loadPuzzle();

    // Start animation loop
    this.animate();
  },

  setupEventListeners() {
    // 1. Parent settings triggers
    const mainShuffleBtn = document.getElementById('btn-main-shuffle');
    if (mainShuffleBtn) {
      mainShuffleBtn.addEventListener('click', () => {
        AudioSynth.playPick();
        this.shufflePieces();
      });
    }

    document.getElementById('btn-parent-settings').addEventListener('click', () => {
      this.openParentGate();
    });

    document.getElementById('btn-close-gate').addEventListener('click', () => {
      document.getElementById('parent-gate-modal').classList.remove('active');
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => {
      document.getElementById('parent-settings-modal').classList.remove('active');
    });

    // Submitting answer to Parent Gate
    document.getElementById('btn-submit-gate').addEventListener('click', () => {
      this.verifyParentGate();
    });

    document.getElementById('gate-answer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.verifyParentGate();
      }
    });

    // 2. Selectors inside Parent Settings Modal
    const parentAnimalGrid = document.getElementById('parent-animal-grid');
    parentAnimalGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.animal-card');
      if (card) {
        parentAnimalGrid.querySelectorAll('.animal-card').forEach(btn => btn.classList.remove('active'));
        card.classList.add('active');
        this.tempSettings.animal = card.getAttribute('data-animal');
        AudioSynth.playPick();
      }
    });

    // Difficulty Settings inside Parent modal
    document.querySelectorAll('.diff-btn-settings').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        document.querySelectorAll('.diff-btn-settings').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        this.tempSettings.grid = parseInt(target.getAttribute('data-grid'));
        AudioSynth.playPick();
      });
    });

    // Toggle options inside Parent modal
    const pBtnHint = document.getElementById('parent-btn-hint');
    pBtnHint.addEventListener('click', () => {
      this.tempSettings.hint = !this.tempSettings.hint;
      pBtnHint.classList.toggle('active', this.tempSettings.hint);
      AudioSynth.playPick();
    });

    const pBtnBorder = document.getElementById('parent-btn-border');
    pBtnBorder.addEventListener('click', () => {
      this.tempSettings.border = !this.tempSettings.border;
      pBtnBorder.classList.toggle('active', this.tempSettings.border);
      AudioSynth.playPick();
    });

    const pBtnSound = document.getElementById('parent-btn-sound');
    pBtnSound.addEventListener('click', () => {
      this.tempSettings.sound = !this.tempSettings.sound;
      pBtnSound.classList.toggle('active', this.tempSettings.sound);
      const icon = document.getElementById('parent-sound-icon');
      icon.textContent = this.tempSettings.sound ? '🔊' : '🔇';
      AudioSynth.playPick();
    });

    // Shuffle/Reset button inside settings modal
    document.getElementById('parent-btn-shuffle').addEventListener('click', () => {
      AudioSynth.playPick();
      this.shufflePieces();
      document.getElementById('parent-settings-modal').classList.remove('active');
    });

    // Save Settings button (ตกลง & เริ่มเกม)
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      this.saveParentSettings();
    });

    // Drag-and-drop Events
    this.canvas.addEventListener('mousedown', (e) => this.onDragStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.onDragMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onDragEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.onDragEnd(e));

    // Touch support for mobiles/tablets
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onDragStart(e);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.onDragMove(e);
    }, { passive: false });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.onDragEnd(e);
    }, { passive: false });

    // Kid-friendly Hint toggle on main screen
    const kidHintBtn = document.getElementById('btn-kid-hint');
    if (kidHintBtn) {
      kidHintBtn.addEventListener('click', () => {
        this.showHint = !this.showHint;
        kidHintBtn.classList.toggle('active', this.showHint);
        
        // Sync parent settings modal button state
        const pBtnHint = document.getElementById('parent-btn-hint');
        if (pBtnHint) {
          pBtnHint.classList.toggle('active', this.showHint);
        }
        
        AudioSynth.playPick();
      });
    }

    // Victory modal button: Load the NEXT animal automatically!
    document.getElementById('btn-play-again').addEventListener('click', () => {
      document.getElementById('victory-modal').classList.remove('active');
      
      const animalList = ['panda', 'lion', 'elephant', 'fox', 'cat', 'koala', 'rabbit', 'monkey'];
      const currentIdx = animalList.indexOf(this.currentAnimal);
      const nextIdx = (currentIdx + 1) % animalList.length;
      this.currentAnimal = animalList[nextIdx];
      
      this.loadPuzzle();
    });
  },

  // Parent Gate - Generate Math Challenge
  openParentGate() {
    // Generate simple addition puzzle suitable for adults, child-proof for 2-3 years old
    const num1 = Math.floor(2 + Math.random() * 8); // 2 to 9
    const num2 = Math.floor(2 + Math.random() * 8); // 2 to 9
    this.gateAnswer = num1 + num2;

    document.getElementById('math-question').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('gate-answer').value = '';
    document.getElementById('gate-error-msg').style.display = 'none';

    // Show Parent Gate Modal
    document.getElementById('parent-gate-modal').classList.add('active');
    setTimeout(() => {
      document.getElementById('gate-answer').focus();
    }, 150);
  },

  // Parent Gate - Verification
  verifyParentGate() {
    const inputVal = parseInt(document.getElementById('gate-answer').value);
    
    if (inputVal === this.gateAnswer) {
      // Correct! Close Gate and open Settings panel
      document.getElementById('parent-gate-modal').classList.remove('active');
      this.openParentSettings();
    } else {
      // Wrong answer
      const errMsg = document.getElementById('gate-error-msg');
      errMsg.style.display = 'block';
      
      const input = document.getElementById('gate-answer');
      input.value = '';
      input.focus();
      
      // Gentle bounce effect on error
      input.style.borderColor = '#ff4757';
      setTimeout(() => {
        input.style.borderColor = '#e1e8ed';
      }, 500);
    }
  },

  // Open settings with current state loaded
  openParentSettings() {
    // Populate current variables into temp variables
    this.tempSettings.animal = this.currentAnimal;
    this.tempSettings.grid = this.gridSize;
    this.tempSettings.hint = this.showHint;
    this.tempSettings.border = this.showBordersOnly;
    this.tempSettings.sound = AudioSynth.enabled;

    // Update UI elements in settings modal to match current active values
    const animalGrid = document.getElementById('parent-animal-grid');
    animalGrid.querySelectorAll('.animal-card').forEach(card => {
      if (card.getAttribute('data-animal') === this.currentAnimal) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    document.querySelectorAll('.diff-btn-settings').forEach(btn => {
      if (parseInt(btn.getAttribute('data-grid')) === this.gridSize) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const pBtnHint = document.getElementById('parent-btn-hint');
    pBtnHint.classList.toggle('active', this.showHint);

    const pBtnBorder = document.getElementById('parent-btn-border');
    pBtnBorder.classList.toggle('active', this.showBordersOnly);

    const pBtnSound = document.getElementById('parent-btn-sound');
    pBtnSound.classList.toggle('active', AudioSynth.enabled);
    document.getElementById('parent-sound-icon').textContent = AudioSynth.enabled ? '🔊' : '🔇';

    // Show Parent Settings Modal
    document.getElementById('parent-settings-modal').classList.add('active');
  },

  // Save Settings from modal
  saveParentSettings() {
    // Apply options
    this.currentAnimal = this.tempSettings.animal;
    this.gridSize = this.tempSettings.grid;
    this.showHint = this.tempSettings.hint;
    this.showBordersOnly = this.tempSettings.border;
    AudioSynth.enabled = this.tempSettings.sound;

    // Sync Kid Screen Hint button state
    const kidHintBtn = document.getElementById('btn-kid-hint');
    if (kidHintBtn) {
      kidHintBtn.classList.toggle('active', this.showHint);
    }

    // Close Settings Modal
    document.getElementById('parent-settings-modal').classList.remove('active');

    // Reload the puzzle with new configuration
    this.loadPuzzle();
  },

  // Map mouse/touch to canvas internal space
  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (clientY - rect.top) * (this.canvas.height / rect.height);
    return { x, y };
  },

  onDragStart(e) {
    if (this.isWon) return;
    const coords = this.getCanvasCoords(e);
    
    // Find clicked piece (search reverse order so topmost drawn is picked)
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (p.isLocked) continue;

      // If borders filter is on, ignore middle pieces
      if (this.showBordersOnly && p.isMiddle) continue;

      // Bounding box hit detection
      if (coords.x >= p.x && coords.x <= p.x + p.w &&
          coords.y >= p.y && coords.y <= p.y + p.h) {
        
        // Lazy-init audio context on user gesture
        AudioSynth.init();
        
        this.draggedPiece = p;
        this.dragOffsetX = coords.x - p.x;
        this.dragOffsetY = coords.y - p.y;
        
        // Push dragged piece to end of array so it draws on top
        this.pieces.splice(i, 1);
        this.pieces.push(p);
        
        AudioSynth.playPick();
        break;
      }
    }
  },

  onDragMove(e) {
    if (!this.draggedPiece) return;
    const coords = this.getCanvasCoords(e);
    
    // Move and clamp to canvas edges
    let newX = coords.x - this.dragOffsetX;
    let newY = coords.y - this.dragOffsetY;
    
    const clampBufferX = this.draggedPiece.w * 0.5;
    const clampBufferY = this.draggedPiece.h * 0.5;
    
    this.draggedPiece.x = Math.max(-clampBufferX, Math.min(this.canvas.width - clampBufferX, newX));
    this.draggedPiece.y = Math.max(-clampBufferY, Math.min(this.canvas.height - clampBufferY, newY));
  },

  onDragEnd() {
    if (!this.draggedPiece) return;
    
    const p = this.draggedPiece;
    this.draggedPiece = null;
    this.movesCount++;

    // Snapping distance tolerance (adaptive based on size, larger/easier for kids)
    let snapTolerance;
    if (this.gridSize === 2) {
      snapTolerance = 46; // Very large snap range for toddlers (2x2)
    } else if (this.gridSize === 3) {
      snapTolerance = 30; // Easy snap range for 3x3
    } else {
      snapTolerance = Math.max(14, Math.min(22, p.w * 0.28)); // Standard
    }

    const dx = p.x - p.correctX;
    const dy = p.y - p.correctY;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if (distance < snapTolerance) {
      // Snap to correct spot!
      p.x = p.correctX;
      p.y = p.correctY;
      p.isLocked = true;
      
      AudioSynth.playSnap();
      ParticleEngine.spawnSnap(p.correctX + p.w / 2, p.correctY + p.h / 2);
      
      this.checkVictory();
    }
  },

  // Load a new game
  loadPuzzle() {
    const loader = document.getElementById('loading-overlay');
    loader.classList.add('active');
    
    this.isWon = false;
    this.movesCount = 0;
    this.elapsedSeconds = 0;
    
    // Clear old timer
    clearInterval(this.timerInterval);

    // Sync hint button active states
    const kidHintBtn = document.getElementById('btn-kid-hint');
    if (kidHintBtn) {
      kidHintBtn.classList.toggle('active', this.showHint);
    }

    // Set source image
    this.imageObj.src = `assets/cute_${this.currentAnimal}.png`;
    
    this.imageObj.onload = () => {
      loader.classList.remove('active');
      this.generatePieces();
      this.shufflePieces();
      
      // Start stats timer
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds++;
      }, 1000);
    };
  },

  // Compute interlocking tab arrangements
  generatePieces() {
    const cols = this.gridSize;
    const rows = this.gridSize;
    const pW = this.boardWidth / cols;
    const pH = this.boardHeight / rows;
    
    this.pieces = [];

    // First generate a 2D tab layout
    // tab structure: [top, right, bottom, left]
    // 0 = flat, 1 = tab (outward), -1 = socket (inward)
    const tabGrid = [];
    for (let r = 0; r < rows; r++) {
      tabGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        tabGrid[r][c] = [0, 0, 0, 0];
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Top edge
        if (r === 0) {
          tabGrid[r][c][0] = 0;
        } else {
          tabGrid[r][c][0] = -tabGrid[r-1][c][2];
        }

        // Left edge
        if (c === 0) {
          tabGrid[r][c][3] = 0;
        } else {
          tabGrid[r][c][3] = -tabGrid[r][c-1][1];
        }

        // Right edge
        if (c === cols - 1) {
          tabGrid[r][c][1] = 0;
        } else {
          tabGrid[r][c][1] = Math.random() < 0.5 ? 1 : -1;
        }

        // Bottom edge
        if (r === rows - 1) {
          tabGrid[r][c][2] = 0;
        } else {
          tabGrid[r][c][2] = Math.random() < 0.5 ? 1 : -1;
        }
      }
    }

    // Now build pieces objects
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const correctX = this.boardX + c * pW;
        const correctY = this.boardY + r * pH;
        
        const isBorder = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1);
        
        this.pieces.push({
          r: r,
          c: c,
          w: pW,
          h: pH,
          correctX: correctX,
          correctY: correctY,
          x: correctX,
          y: correctY,
          isLocked: false,
          tabs: tabGrid[r][c],
          isMiddle: !isBorder
        });
      }
    }
  },

  // Scatter pieces outside the board margins (strictly left and right)
  shufflePieces() {
    this.pieces.forEach((p, idx) => {
      if (p.isLocked) return;

      // Mathematically separate pieces into left and right zones (outside the center image board)
      const goLeft = idx % 2 === 0;
      
      let targetX, targetY;
      if (goLeft) {
        // Left margin: x in [15 .. boardX - p.w - 15]
        const maxX = this.boardX - p.w - 15;
        const minX = 15;
        targetX = minX + Math.random() * Math.max(1, maxX - minX);
      } else {
        // Right margin: x in [boardX + boardWidth + 15 .. canvas.width - p.w - 15]
        const minX = this.boardX + this.boardWidth + 15;
        const maxX = this.canvas.width - p.w - 15;
        targetX = minX + Math.random() * Math.max(1, maxX - minX);
      }
      
      // Height margin: y in [15 .. canvas.height - p.h - 15]
      const minY = 15;
      const maxY = this.canvas.height - p.h - 15;
      targetY = minY + Math.random() * Math.max(1, maxY - minY);

      p.x = targetX;
      p.y = targetY;
    });
  },

  checkVictory() {
    const allLocked = this.pieces.every(p => p.isLocked);
    if (allLocked && !this.isWon) {
      this.isWon = true;
      clearInterval(this.timerInterval);

      AudioSynth.playWin();
      
      // Store stats silently for parent verification
      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      document.getElementById('victory-time').textContent = `${mins}:${secs}`;
      document.getElementById('victory-moves').textContent = this.movesCount;
      
      let diffStr = "ง่ายที่สุด (2x2)";
      if (this.gridSize === 3) diffStr = "ง่าย (3x3)";
      if (this.gridSize === 6) diffStr = "ปานกลาง (6x6)";
      if (this.gridSize === 9) diffStr = "ท้าทาย (9x9)";
      document.getElementById('victory-diff').textContent = diffStr;

      // Show toddler victory modal after a tiny delay
      setTimeout(() => {
        document.getElementById('victory-modal').classList.add('active');
      }, 700);
    }
  },

  // Drawing functions
  drawJigsawEdge(x1, y1, x2, y2, T) {
    if (T === 0) {
      this.ctx.lineTo(x2, y2);
      return;
    }
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.sqrt(dx*dx + dy*dy);
    const ux = dx / L;
    const uy = dy / L;
    const nx = -uy;
    const ny = ux;
    
    // Shape dimensions relative to piece length
    const tabDepth = L * 0.22 * T;
    
    const p1_x = x1 + ux * (L * 0.38);
    const p1_y = y1 + uy * (L * 0.38);
    
    const p3_x = x1 + ux * (L * 0.42) + nx * tabDepth;
    const p3_y = y1 + uy * (L * 0.42) + ny * tabDepth;
    
    const p5_x = x1 + ux * (L * 0.58) + nx * tabDepth;
    const p5_y = y1 + uy * (L * 0.58) + ny * tabDepth;
    
    const p7_x = x1 + ux * (L * 0.62);
    const p7_y = y1 + uy * (L * 0.62);
    
    this.ctx.lineTo(p1_x, p1_y);
    
    // Left side of tab curve
    this.ctx.bezierCurveTo(
      x1 + ux * (L * 0.42), y1 + uy * (L * 0.42),
      x1 + ux * (L * 0.40) + nx * (tabDepth * 0.45), y1 + uy * (L * 0.40) + ny * (tabDepth * 0.45),
      p3_x, p3_y
    );
    // Outer loop curve
    this.ctx.bezierCurveTo(
      x1 + ux * (L * 0.44) + nx * (tabDepth * 1.35), y1 + uy * (L * 0.44) + ny * (tabDepth * 1.35),
      x1 + ux * (L * 0.56) + nx * (tabDepth * 1.35), y1 + uy * (L * 0.56) + ny * (tabDepth * 1.35),
      p5_x, p5_y
    );
    // Right side of tab curve back to baseline
    this.ctx.bezierCurveTo(
      x1 + ux * (L * 0.60) + nx * (tabDepth * 0.45), y1 + uy * (L * 0.60) + ny * (tabDepth * 0.45),
      x1 + ux * (L * 0.58), y1 + uy * (L * 0.58),
      p7_x, p7_y
    );
    this.ctx.lineTo(x2, y2);
  },

  // Draw the piece path on canvas relative to its position
  setPiecePath(p) {
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
    
    // Top Edge (L -> R)
    this.drawJigsawEdge(p.x, p.y, p.x + p.w, p.y, p.tabs[0]);
    // Right Edge (T -> B)
    this.drawJigsawEdge(p.x + p.w, p.y, p.x + p.w, p.y + p.h, p.tabs[1]);
    // Bottom Edge (R -> L)
    this.drawJigsawEdge(p.x + p.w, p.y + p.h, p.x, p.y + p.h, p.tabs[2]);
    // Left Edge (B -> T)
    this.drawJigsawEdge(p.x, p.y + p.h, p.x, p.y, p.tabs[3]);
    
    this.ctx.closePath();
  },

  drawBoardGuides() {
    this.ctx.save();
    
    // Soft shadow/background for the central board
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.fillRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);
    
    // Draw guide photo if Hint option is active
    if (this.showHint) {
      this.ctx.globalAlpha = 0.22;
      this.ctx.drawImage(this.imageObj, this.boardX, this.boardY, this.boardWidth, this.boardHeight);
      this.ctx.globalAlpha = 1.0;
    }
    
    // Thin dashed grid lines for assistance
    this.ctx.strokeStyle = 'rgba(116, 125, 139, 0.12)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    
    const cols = this.gridSize;
    const pW = this.boardWidth / cols;
    const pH = this.boardHeight / cols;
    
    for (let c = 1; c < cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.boardX + c * pW, this.boardY);
      this.ctx.lineTo(this.boardX + c * pW, this.boardY + this.boardHeight);
      this.ctx.stroke();
    }
    for (let r = 1; r < cols; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.boardX, this.boardY + r * pH);
      this.ctx.lineTo(this.boardX + this.boardWidth, this.boardY + r * pH);
      this.ctx.stroke();
    }
    
    // Outer border of board
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = 'rgba(116, 125, 139, 0.25)';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);
    
    this.ctx.restore();
  },

  // Main animation frame update
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Board background guides
    this.drawBoardGuides();

    // Split pieces into categories: locked, normal unlocked, and dragged
    const lockedPieces = [];
    const unlockedPieces = [];
    let activeDragged = null;

    this.pieces.forEach(p => {
      if (p.isLocked) {
        lockedPieces.push(p);
      } else if (p === this.draggedPiece) {
        activeDragged = p;
      } else {
        unlockedPieces.push(p);
      }
    });

    // 1. Draw locked pieces first (no shadow needed, sit directly on board)
    lockedPieces.forEach(p => this.drawPiece(p));

    // 2. Draw normal unlocked pieces (ignore middle pieces if borders only toggle is active)
    unlockedPieces.forEach(p => {
      this.ctx.save();
      if (this.showBordersOnly && p.isMiddle) {
        // Draw middle pieces in transparent mode and unclickable
        this.ctx.globalAlpha = 0.12;
      }
      this.drawPiece(p);
      this.ctx.restore();
    });

    // 3. Draw active dragged piece on top of everything, with prominent shadow
    if (activeDragged) {
      this.drawPiece(activeDragged, true);
    }

    // 4. Update and draw particles/sparks
    if (this.isWon) {
      ParticleEngine.spawnConfetti(this.canvas.width);
    }
    ParticleEngine.update();
    ParticleEngine.draw(this.ctx);
  },

  drawPiece(p, isDragged = false) {
    this.ctx.save();
    
    // Step A: Draw Drop Shadow silhouette for unlocked pieces
    if (!p.isLocked) {
      this.setPiecePath(p);
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      this.ctx.shadowBlur = isDragged ? 14 : 7;
      this.ctx.shadowOffsetX = isDragged ? 6 : 2;
      this.ctx.shadowOffsetY = isDragged ? 9 : 4;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
    }
    
    // Step B: Clip and draw piece image
    this.ctx.save();
    this.setPiecePath(p);
    this.ctx.clip();
    
    // Draw the image positioned relative to this piece coordinates
    const imgX = p.x - (p.correctX - this.boardX);
    const imgY = p.y - (p.correctY - this.boardY);
    this.ctx.drawImage(this.imageObj, imgX, imgY, this.boardWidth, this.boardHeight);
    this.ctx.restore();

    // Step C: Stroke outer borders
    this.setPiecePath(p);
    if (p.isLocked) {
      // Semi-transparent border for snapped/locked pieces
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = Math.max(1.2, 4 - this.gridSize * 0.35);
    } else if (isDragged) {
      // Glow border for active dragged piece
      this.ctx.strokeStyle = '#ffa502';
      this.ctx.lineWidth = Math.max(3.5, 7.5 - this.gridSize * 0.35);
    } else {
      // High contrast dark stroke border for floating pieces (very clear outlines)
      this.ctx.strokeStyle = 'rgba(47, 53, 66, 0.65)';
      this.ctx.lineWidth = Math.max(2.5, 5.5 - this.gridSize * 0.35);
    }
    this.ctx.stroke();
    
    this.ctx.restore();
  }
};

// Start when document loaded
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
