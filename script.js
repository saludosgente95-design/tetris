/**
 * OPTIMIZED TETRIS ENGINE (Mobile First)
 * - Canvas Rendering (vs DOM)
 * - Offscreen Caching for Static Blocks
 * - Sprite Caching (ImageBitmap)
 * - requestAnimationFrame Loop
 * - Touch Optimization
 */

// --- CONFIGURATION & PALETTE ---
const BLOCK_SIZE = 28;
const SPRITE_SIZE = 40; // Block + Glow padding
const DRAW_OFFSET = (SPRITE_SIZE - BLOCK_SIZE) / 2;
const COLS = 10;
const ROWS = 16;
const COLORS = {
  'color-line': '#01cdfe',
  'color-square': '#ff71ce',
  'color-lshape': '#05ffa1',
  'color-zshape': '#b967ff',
  'color-tshape': '#fffb96',
  'color-jshape': '#0080ff',
  'color-sshape': '#00ff00',
  'empty': 'transparent'
};
const SHADOWS = {
  'color-line': '#bbf0ff',
  'color-square': '#ffb8e6',
  'color-lshape': '#ccffea',
  'color-zshape': '#e4c1ff',
  'color-tshape': '#ffffd1',
  'color-jshape': '#80c0ff',
  'color-sshape': '#80ff80'
};

// --- CLASSES ---

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Logic-only Block (Rendering is separated)
class Block {
  constructor(x, y, colorCode) {
    this.x = x;
    this.y = y;
    this.colorCode = colorCode || 'empty';
    this.flashAlpha = 0; // NEW: Flash intensity
  }

  getPosition() { return new Position(this.x, this.y); }
  fall() { this.x += 1; }
  moveRight() { this.y += 1; }
  moveLeft() { this.y -= 1; }
  destroy() { /* No DOM cleanup needed */ }
  rightPosition() { return new Position(this.x, this.y + 1); }
  leftPosition() { return new Position(this.x, this.y - 1); }
}

class Shape {
  constructor(blocks, colorCode) {
    this.blocks = blocks;
    this.colorCode = colorCode;
  }

  getBlocks() { return Array.from(this.blocks); }

  init() {
    // No-op in Canvas version (was DOM init) 
  }

  // Draw calls specific sprite from cache
  draw(ctx, sprites) {
    for (let block of this.blocks) {
      if (block.x >= 0) { // Don't draw if above board
        // Draw pre-rendered sprite
        const sprite = sprites[this.colorCode];
        if (sprite) {
          // Draw with offset for glow
          ctx.drawImage(sprite, block.y * BLOCK_SIZE - DRAW_OFFSET, block.x * BLOCK_SIZE - DRAW_OFFSET);
        }
      }
    }
  }

  fallingPositions() {
    return this.blocks
      .map(b => b.getPosition())
      .map(p => new Position(p.x + 1, p.y));
  }

  fall() { for (let b of this.blocks) b.fall(); }
  rightPositions() { return this.blocks.map(b => b.rightPosition()); }
  leftPositions() { return this.blocks.map(b => b.leftPosition()); }
  moveRight() { for (let b of this.blocks) b.moveRight(); }
  moveLeft() { for (let b of this.blocks) b.moveLeft(); }
  clear() { this.blocks = []; }
  addBlocks(blocks) { for (let b of blocks) this.blocks.push(b); }
  rotate() { /* Implemented in subclasses */ }
  rotatePositions() { return []; }
}

// Subclasses (Logic identical to original Script.js)
class Square extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-square'),
      new Block(x, y + 1, 'color-square'),
      new Block(x + 1, y, 'color-square'),
      new Block(x + 1, y + 1, 'color-square')
    ], 'color-square');
  }
}

class LShape extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-lshape'),
      new Block(x - 1, y, 'color-lshape'),
      new Block(x + 1, y, 'color-lshape'),
      new Block(x + 1, y + 1, 'color-lshape')
    ], 'color-lshape');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-lshape'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x - 1, y), new Position(x + 1, y), new Position(x + 1, y + 1)]; break;
      case 1: positions = [new Position(x, y), new Position(x, y - 1), new Position(x, y + 1), new Position(x + 1, y - 1)]; break;
      case 2: positions = [new Position(x, y), new Position(x - 1, y - 1), new Position(x - 1, y), new Position(x + 1, y)]; break;
      case 3: positions = [new Position(x, y), new Position(x, y - 1), new Position(x, y + 1), new Position(x - 1, y + 1)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 4; }
}

class JShape extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-jshape'),
      new Block(x - 1, y, 'color-jshape'),
      new Block(x + 1, y, 'color-jshape'),
      new Block(x + 1, y - 1, 'color-jshape')
    ], 'color-jshape');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-jshape'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x - 1, y), new Position(x + 1, y), new Position(x + 1, y - 1)]; break;
      case 1: positions = [new Position(x, y), new Position(x, y - 1), new Position(x, y + 1), new Position(x - 1, y - 1)]; break;
      case 2: positions = [new Position(x, y), new Position(x - 1, y), new Position(x + 1, y), new Position(x - 1, y + 1)]; break;
      case 3: positions = [new Position(x, y), new Position(x, y - 1), new Position(x, y + 1), new Position(x + 1, y + 1)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 4; }
}

class SShape extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-sshape'),
      new Block(x, y + 1, 'color-sshape'),
      new Block(x + 1, y, 'color-sshape'),
      new Block(x + 1, y - 1, 'color-sshape')
    ], 'color-sshape');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-sshape'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x, y + 1), new Position(x + 1, y), new Position(x + 1, y - 1)]; break;
      case 1: positions = [new Position(x, y), new Position(x - 1, y), new Position(x, y + 1), new Position(x + 1, y + 1)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 2; }
}

class TShape extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-tshape'),
      new Block(x, y - 1, 'color-tshape'),
      new Block(x + 1, y, 'color-tshape'),
      new Block(x, y + 1, 'color-tshape')
    ], 'color-tshape');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-tshape'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x, y - 1), new Position(x + 1, y), new Position(x, y + 1)]; break;
      case 1: positions = [new Position(x, y), new Position(x - 1, y), new Position(x, y - 1), new Position(x + 1, y)]; break;
      case 2: positions = [new Position(x, y), new Position(x, y - 1), new Position(x - 1, y), new Position(x, y + 1)]; break;
      case 3: positions = [new Position(x, y), new Position(x - 1, y), new Position(x, y + 1), new Position(x + 1, y)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 4; }
}

class ZShape extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-zshape'),
      new Block(x, y - 1, 'color-zshape'),
      new Block(x + 1, y, 'color-zshape'),
      new Block(x + 1, y + 1, 'color-zshape')
    ], 'color-zshape');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-zshape'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x, y - 1), new Position(x + 1, y), new Position(x + 1, y + 1)]; break;
      case 1: positions = [new Position(x, y), new Position(x - 1, y), new Position(x, y - 1), new Position(x + 1, y - 1)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 2; }
}

class Line extends Shape {
  constructor(x, y) {
    super([
      new Block(x, y, 'color-line'),
      new Block(x - 1, y, 'color-line'),
      new Block(x + 1, y, 'color-line'),
      new Block(x + 2, y, 'color-line')
    ], 'color-line');
    this.position = 0;
  }
  rotate() {
    const blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-line'));
    this.clear(); this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }
  rotatePositions() {
    let pos = this.blocks[0].getPosition();
    let x = pos.x, y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0: positions = [new Position(x, y), new Position(x - 1, y), new Position(x + 1, y), new Position(x + 2, y)]; break;
      case 1: positions = [new Position(x, y), new Position(x, y - 1), new Position(x, y + 1), new Position(x, y + 2)]; break;
    }
    return positions;
  }
  getNextPosition() { return (this.position + 1) % 2; }
}


// --- MAIN ENGINE ---

class Board {
  constructor() {
    // Game Physics
    this.loopInterval = 1000;
    this.baseLoopInterval = 1000;
    this.lastTime = 0;
    this.accumulator = 0;
    this.gameOver = true;
    this.isPaused = false;

    // State
    this.blocks = [];
    this.shapes = []; // Active shape (len 1 usually)
    this.score = 0;
    this.level = 1;
    this.nextShapeType = this.getRandomRange(0, 6);
    this.highScore = parseInt(localStorage.getItem('tetris_high_score')) || 0;
    this.currentBaseSpeed = 1000; // Track normal speed

    // UI Refs
    $("#high-score").text(this.highScore);

    // Canvas Setup
    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    // Offscreen Canvas for Static Blocks (Performance)
    this.staticCanvas = document.createElement('canvas');
    this.staticCanvas.width = 280; // Logic coords usually fine for internal offscreen copy
    this.staticCanvas.height = 448;
    this.staticCtx = this.staticCanvas.getContext('2d', { alpha: true });

    // Sprite Cache
    this.sprites = {};
    this.generateSprites();

    // Initialize
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Fetch Data
    this.fetchLeaderboard();
    this.updateUserStatusDisplay();

    // Input Handling (Touch Optimized)
    this.setupControls();
  }

  // Generate cached sprites for each block color (avoids drawing paths every frame)
  generateSprites() {
    const classes = Object.keys(COLORS);

    classes.forEach(cls => {
      const c = document.createElement('canvas');
      c.width = SPRITE_SIZE;
      c.height = SPRITE_SIZE;
      const ctx = c.getContext('2d');
      const color = COLORS[cls];
      const shadow = SHADOWS[cls] || '#fff';

      // Center drawing in sprite
      const x = DRAW_OFFSET;
      const y = DRAW_OFFSET;

      if (cls === 'empty') {
        // Dotted grid (no glow needed)
        ctx.fillStyle = 'rgba(5, 217, 232, 0.1)';
        ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      } else {
        // 0. Outer Glow (The "Neon" Effect)
        ctx.shadowBlur = 10;
        ctx.shadowColor = (cls === 'color-line') ? color : shadow; // Cyan gets self-color glow, others shadow

        // 1. Background
        ctx.fillStyle = color;
        ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

        // Reset shadow for inner details or keep it? 
        // Better to keep shadow only for the main rect.
        ctx.shadowBlur = 0;

        // 2. Inner Tile (Inset)
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

        // 3. Border (Bright rim)
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

        // 4. Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 2 - 2);
      }

      this.sprites[cls] = c;
    });
  }

  resize() {
    // Auto-scale to fit viewport while maintaining aspect ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // Set internal resolution match CSS size * DPR
    // Fixed logic size: 280x448
    this.canvas.width = 280 * dpr;
    this.canvas.height = 448 * dpr;

    this.ctx.scale(dpr, dpr);

    // Resize Offscreen
    this.staticCanvas.width = 280 * dpr;
    this.staticCanvas.height = 448 * dpr;
    this.staticCtx.scale(dpr, dpr);

    this.redrawStaticLayer();
  }

  setupControls() {
    // Touch repeat handling
    let touchInterval = null;
    let touchStartTime = 0;

    // Generic handlers for Left/Right
    const startTouch = (action) => {
      if (this.gameOver) return;
      action();
      if (touchInterval) clearInterval(touchInterval);
      touchInterval = setInterval(action, 150);
    };

    // Specific handler for Down (Tap vs Hold)
    const startTouchDown = () => {
      if (this.gameOver) return;
      touchStartTime = Date.now();

      // Start Fast Drop immediately (visual feedback)
      this.downKeyPress();

      if (touchInterval) clearInterval(touchInterval);
      // Repeat fast drop if held
      touchInterval = setInterval(() => this.downKeyPress(), 100);
    };

    const endTouch = () => {
      if (touchInterval) clearInterval(touchInterval);
      touchInterval = null;
      if (this.loopInterval === 50) this.resetSpeed();
    };

    const endTouchDown = () => {
      endTouch();
      const duration = Date.now() - touchStartTime;
      if (duration < 200) {
        // It was a tap!
        this.hardDrop();
      }
    };

    // Bind Buttons
    const bindBtn = (id, action, endAction) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      // Touch
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, { passive: false });
      btn.addEventListener('touchend', endAction || endTouch);

      // Mouse
      btn.addEventListener('mousedown', () => action());
      btn.addEventListener('mouseup', endAction || endTouch);
      btn.addEventListener('mouseleave', endAction || endTouch);
    };

    bindBtn('left', () => startTouch(() => this.leftKeyPress()));
    bindBtn('right', () => startTouch(() => this.rightKeyPress()));

    // Special binding for Down
    bindBtn('down', startTouchDown, endTouchDown);

    // Rotate (No repeat)
    const rotBtn = document.getElementById('rotate');
    if (rotBtn) {
      const rotAction = (e) => {
        if (e) e.preventDefault();
        this.upKeyPress();
      };
      rotBtn.addEventListener('touchstart', rotAction, { passive: false });
      rotBtn.addEventListener('click', rotAction);
    }

    // Keyboard
    $(document).keydown((e) => {
      if (this.gameOver) return;
      switch (e.which) {
        case 37: this.leftKeyPress(); break;
        case 38: this.upKeyPress(); break;
        case 39: this.rightKeyPress(); break;
        case 40: this.downKeyPress(); break;
        case 78: this.newGame(); break;
      }
    });

    $(document).keyup((e) => {
      if (e.which === 40) this.resetSpeed();
    });

    // Start Button
    $("#new-game").click(() => {
      if (typeof audioManager !== 'undefined') {
        audioManager.initAudioContext();
        audioManager.playMusic();
      }
      this.checkCreditAndStart();
    });
  }

  checkCreditAndStart() {
    const tg = window.Telegram?.WebApp;
    const urlParams = new URLSearchParams(window.location.search);
    let userId = tg?.initDataUnsafe?.user?.id || urlParams.get('userId');

    // Localhost Hack
    if (!userId && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      userId = "12345";
    }

    if (!userId) {
      alert("Error: No user ID found from Telegram.");
      return;
    }

    $("#message").text("Checking Credits...");
    $("#new-game").hide();

    if (userId === "12345") { // Bypass
      this.newGame();
      return;
    }

    const apiBase = urlParams.get('api_url') || '';
    fetch(`${apiBase}/api/check_play?ts=${Date.now()}`, {
      method: 'POST', body: JSON.stringify({ user_id: userId })
    }).then(r => r.json()).then(data => {
      if (data.can_play) {
        this.newGame();
      } else {
        $("#message").text(data.message || "No Credits.");
        $("#new-game").text("Add Credits").show();
      }
    }).catch(e => {
      $("#message").text("Connection Error");
      $("#new-game").text("Retry").show();
    });
  }

  newGame() {
    this.blocks = [];
    this.shapes = [];
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.loopInterval = this.baseLoopInterval;
    this.nextShapeType = this.getRandomRange(0, 6);

    $("#level").text(this.level);
    $("#score").text(0);
    $("#banner").hide();
    $("#board").removeClass("hard-mode panic-mode");

    this.spawnShapes(); // Start first piece
    this.redrawStaticLayer(); // Clear board

    this.lastTime = performance.now();
    this.accumulator = 0;

    // Start RAF Loop
    requestAnimationFrame((t) => this.loop(t));
  }

  // MAIN GAME LOOP (RAF)
  loop(now) {
    if (this.gameOver) return;

    const dt = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += dt;

    // Logic Step (Fixed Time Step)
    if (this.accumulator > this.loopInterval) {
      this.update();
      this.accumulator = 0;
    }

    // ALWAYS Redraw static layer to animate fades/flashes smoothly
    // (Optimization: Could flag 'needsRedraw' but this is fine for now)
    this.redrawStaticLayer();

    // Render Step
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    // Move active shape down
    let landed = false;
    for (const shape of this.shapes) {
      if (this.canMove(shape.fallingPositions())) {
        shape.fall();
      } else {
        this.handleLanding(shape);
        landed = true;
      }
    }

    if (landed) { // Check lines + Panic check
      this.redrawStaticLayer();
      this.checkLines();
      this.checkPanic(); // Re-check panic on landing
      this.spawnShapes();
    }
  }

  checkPanic() {
    // Find highest block
    let minX = ROWS;
    for (let b of this.blocks) if (b.x < minX) minX = b.x;

    const isPanic = (minX <= 4) || (this.level % 10 === 0);
    if (isPanic) $("#board").addClass("panic-mode");
    else $("#board").removeClass("panic-mode");
  }

  canMove(positions) {
    return this.arePositonsWithinBoard(positions) && this.areBlocksEmpty(positions);
  }

  handleLanding(shape) {
    // Add blocks to static pile
    const blocks = shape.getBlocks();
    blocks.forEach(b => b.flashAlpha = 0.8); // Trigger flash on impact
    this.addBlocks(blocks);
    this.removeShape(shape);

    // FX
    if (typeof audioManager !== 'undefined') audioManager.playLand();
  }

  draw() {
    // 1. Clear Main Canvas
    const w = 280, h = 448;
    this.ctx.clearRect(0, 0, w, h);

    // 2. Draw Static Layer (Cached)
    this.ctx.drawImage(this.staticCanvas, 0, 0, w, h);

    // 3. Draw Active Shape
    for (const shape of this.shapes) {
      shape.draw(this.ctx, this.sprites);
    }
  }

  // Optimised: Only called when blocks land/clear
  redrawStaticLayer() {
    const w = 280, h = 448;
    this.staticCtx.clearRect(0, 0, w, h);

    // Draw Grid Background (Optional, implicit?)
    // We previously had .empty divs. We can draw the grid here.
    if (!$("#board").hasClass("hard-mode")) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          this.staticCtx.drawImage(this.sprites['empty'], c * BLOCK_SIZE - DRAW_OFFSET, r * BLOCK_SIZE - DRAW_OFFSET);
        }
      }
    }

    // Draw Static Blocks
    for (const block of this.blocks) {
      const sprite = this.sprites[block.colorCode];
      if (sprite) {
        this.staticCtx.drawImage(sprite, block.y * BLOCK_SIZE - DRAW_OFFSET, block.x * BLOCK_SIZE - DRAW_OFFSET);

        // NEW: Draw Flash Overlay
        if (block.flashAlpha > 0) {
          this.staticCtx.fillStyle = `rgba(255, 255, 255, ${block.flashAlpha})`;
          this.staticCtx.fillRect(block.y * BLOCK_SIZE, block.x * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          block.flashAlpha -= 0.1; // Fade out
          if (block.flashAlpha < 0) block.flashAlpha = 0;
        }
      }
    }
  }

  // LOGIC HELPERS
  arePositonsWithinBoard(positions) {
    for (let p of positions) {
      if (p.x >= ROWS || p.y < 0 || p.y >= COLS) return false;
    }
    return true;
  }

  areBlocksEmpty(positions) {
    for (let p of positions) {
      for (let b of this.blocks) {
        if (b.x === p.x && b.y === p.y) return false;
      }
    }
    return true;
  }

  getBlock(x, y) { return this.blocks.find(b => b.x === x && b.y === y); }

  checkLines() {
    let lines = 0;
    let clearedBlocks = [];

    for (let x = 0; x < ROWS; x++) {
      const rowBlocks = this.blocks.filter(b => b.x === x);
      if (rowBlocks.length === COLS) {
        lines++;
        clearedBlocks.push(...rowBlocks);

        // Remove blocks from logic
        this.blocks = this.blocks.filter(b => b.x !== x);

        // Shift blocks above down
        this.blocks.forEach(b => {
          if (b.x < x) b.x++;
        });

        // Flash Board Effect
        $('#board').addClass('board-flash');
        setTimeout(() => $('#board').removeClass('board-flash'), 200);

        // FX: Explode
        if (typeof particleSystem !== 'undefined') particleSystem.explodeLine(x);
      }
    }

    if (lines > 0) {
      this.score += lines * 10;
      if (lines >= 4) {
        this.score += 40;
        if (typeof audioManager !== 'undefined') audioManager.playTetris();
        // Visual FX for Tetris
        this.showActionText("TETRIS!", "anim-tetris");
      } else {
        if (typeof audioManager !== 'undefined') audioManager.playSingle();
      }

      this.setScore(this.score);
      this.redrawStaticLayer(); // Re-cache
    }
  }

  spawnShapes() {
    if (this.gameOver) return;
    if (this.shapes.length === 0) {
      const type = this.nextShapeType;
      let shape;
      switch (type) {
        case 0: shape = new Line(0, 4); break;
        case 1: shape = new Square(0, 4); break;
        case 2: shape = new LShape(0, 4); break;
        case 3: shape = new ZShape(0, 4); break;
        case 4: shape = new TShape(0, 4); break;
        case 5: shape = new JShape(0, 4); break;
        case 6: shape = new SShape(0, 4); break;
      }

      // Game Over Check Immediate
      if (!this.canMove(shape.blocks.map(b => b.getPosition()))) {
        this.gameOver = true;
        this.handleGameOver();
        return;
      }

      this.shapes.push(shape);

      this.nextShapeType = this.getRandomRange(0, 6);
      this.renderNextPiece();

      this.resetSpeed(); // Ensure new piece starts slow
    }
  }

  renderNextPiece() {
    // DOM based preview is fine since it's static and small
    const preview = $("#next-piece-preview");
    preview.empty();
    const miniSize = 10;
    let offsetX = 10, offsetY = 10;
    let positions = [];

    switch (this.nextShapeType) {
      case 0: positions = [[0, 0], [0, 1], [0, 2], [0, 3]]; offsetX = 10; offsetY = 15; break;
      case 1: positions = [[0, 0], [0, 1], [1, 0], [1, 1]]; offsetX = 20; offsetY = 10; break;
      case 2: positions = [[0, 0], [0, 1], [0, 2], [1, 0]]; offsetX = 15; offsetY = 10; break;
      case 3: positions = [[0, 0], [0, 1], [1, 1], [1, 2]]; offsetX = 15; offsetY = 10; break;
      case 4: positions = [[0, 0], [0, 1], [0, 2], [1, 1]]; offsetX = 15; offsetY = 10; break;
      case 5: positions = [[0, 0], [0, 1], [0, 2], [1, 2]]; offsetX = 15; offsetY = 10; break;
      case 6: positions = [[0, 1], [0, 2], [1, 0], [1, 1]]; offsetX = 15; offsetY = 10; break;
    }

    positions.forEach(([x, y]) => {
      const d = document.createElement("div");
      $(d).css({
        position: 'absolute', width: miniSize + 'px', height: miniSize + 'px',
        left: (offsetX + y * miniSize) + 'px', top: (offsetY + x * miniSize) + 'px',
        background: '#fff', border: '1px solid var(--neon-cyan)', boxShadow: '0 0 5px var(--neon-pink)'
      });
      preview.append(d);
    });
  }

  handleGameOver() {
    if (typeof audioManager !== 'undefined') audioManager.playGameOverMusic();
    this.submitScore();
    $("#banner").show();
    $("#message").text("GAME OVER");
    $("#new-game").text("Tap to Restart").show();
    this.updateUserStatusDisplay();
  }

  setScore(s) {
    this.score = s;
    $("#score").text(s);
    if (s > this.highScore) {
      this.highScore = s;
      $("#high-score").text(s);
      localStorage.setItem('tetris_high_score', s);
    }
    this.updateLevel();
  }

  updateLevel() {
    const lvl = Math.floor(this.score / 100) + 1;
    if (lvl !== this.level) {
      this.level = lvl;
      $("#level").text(lvl);

      let speedRed = 0;
      if (this.level <= 4) speedRed = (this.level - 1) * 60;
      else speedRed = 180 + (this.level - 4) * 80;
      this.currentBaseSpeed = Math.max(150, this.baseLoopInterval - speedRed);
      this.loopInterval = this.currentBaseSpeed;

      // Boss Music Logic
      if (typeof audioManager !== 'undefined') {
        if (lvl % 10 === 0) audioManager.playBossMusic();
        else if (this.level % 10 === 0) audioManager.loadRandomMusic();
      }

      // Hard Mode
      if (lvl > 10) $("#board").addClass("hard-mode");
      else $("#board").removeClass("hard-mode");

      this.redrawStaticLayer(); // Update grid visibility
    }
  }

  // --- API / NETWORKING ---
  fetchLeaderboard() {
    const u = new URLSearchParams(window.location.search);
    const base = u.get('api_url') || '';
    fetch(`${base}/api/leaderboard`).then(r => r.json()).then(d => {
      const l = $("#lb-list"); l.empty();
      d.forEach((e, i) => l.append(`<li><span>${i + 1}. ${e.username}</span><span>${e.score}</span></li>`));
    });
  }

  updateUserStatusDisplay() {
    const u = new URLSearchParams(window.location.search);
    const uid = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || u.get('userId');
    if (!uid) return;
    const base = u.get('api_url') || '';
    fetch(`${base}/api/user_status?user_id=${uid}&ts=${Date.now()}`).then(r => r.json()).then(d => {
      if (d.free_remaining > 0) $("#play-status").html(`FREE (${d.free_remaining})`).css('color', '#00ffcc');
      else $("#play-status").html(`${d.cost} 🪙`).css('color', '#ffcc00');
      $("#credits-status").html(`Credits: ${d.credits}`);
    });
  }

  submitScore() {
    const tg = window.Telegram?.WebApp;
    const u = new URLSearchParams(window.location.search);
    const base = u.get('api_url') || '';
    const user = tg?.initDataUnsafe?.user;
    fetch(`${base}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user?.username || "Guest",
        user_id: user?.id,
        score: this.score,
        level: this.level
      })
    }).then(r => r.json()).then(d => {
      this.fetchLeaderboard();
      if (d.reward) this.showAward(d.reward);
    });
  }

  showAward(txt) {
    if (typeof audioManager !== 'undefined') audioManager.playSound('clear');
    $("body").append(`<div class="reward-popup">${txt}</div>`);
    setTimeout(() => $(".reward-popup").remove(), 3500);
  }

  showActionText(txt, cls) {
    const el = $("#action-text"); // Mobile handling needed here?
    // Simplified for now
  }

  randomColor() { return Object.keys(COLORS)[Math.floor(Math.random() * 7)]; }
  getRandomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Method mapping from old code
  leftKeyPress() { for (let s of this.shapes) if (this.canMove(s.leftPositions())) { s.moveLeft(); this.draw(); } }
  rightKeyPress() { for (let s of this.shapes) if (this.canMove(s.rightPositions())) { s.moveRight(); this.draw(); } }
  upKeyPress() { for (let s of this.shapes) if (this.canMove(s.rotatePositions())) { s.rotate(); this.draw(); } }
  downKeyPress() {
    this.loopInterval = 50;
  }

  hardDrop() {
    // Move down until collision
    while (true) {
      if (this.canMove(this.shapes[0].fallingPositions())) {
        this.shapes[0].fall();
        this.score += 2; // Bonus for hard drop
      } else {
        break;
      }
    }
    this.draw();
    this.handleLanding(this.shapes[0]);
    // The update loop will pick up the landing in next frame or we force update?
    // Better to manually call similar logic to update()
    this.redrawStaticLayer();
    this.checkLines();
    this.checkPanic();
    this.spawnShapes();
    this.resetSpeed();
  }

  resetSpeed() {
    this.loopInterval = this.currentBaseSpeed || 1000;
  }

  addBlocks(blocks) { blocks.forEach(b => this.blocks.push(b)); }
  removeShape(s) { this.shapes = this.shapes.filter(x => x !== s); }
}

// Global Particle System (Already Optimized Canvas)
// Just ensure it targets the right canvas
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = r.width * dpr;
    this.canvas.height = r.height * dpr;
    this.ctx.scale(dpr, dpr);
  }
  explodeLine(row) {
    const y = row * BLOCK_SIZE + (BLOCK_SIZE / 2);
    for (let x = 0; x < 280; x += 10) this.createParticle(x, y, this.rndCol());
  }
  createParticle(x, y, c) {
    this.particles.push({ x, y, vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10, life: 1, color: c, size: Math.random() * 4 + 2 });
  }
  rndCol() { return ['#ff2a6d', '#05d9e8', '#d23be7', '#ffe600'].sort(() => Math.random() - .5)[0]; }
  loop() {
    this.ctx.clearRect(0, 0, 280, 448);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) this.particles.splice(i, 1);
      else {
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.loop());
  }
}

// Startup
let board;
let particleSystem;
$(document).ready(() => {
  board = new Board();
  particleSystem = new ParticleSystem();

  // Resize Board Fit
  const resizeBoard = () => {
    const b = document.getElementById('board');
    b.style.transform = 'none';
    const h = window.innerHeight, w = window.innerWidth;
    const scale = Math.min((h - 180) / 448, (w - 10) / 280, 1);
    if (scale < 1) b.style.transform = `scale(${scale})`;
  };
  window.addEventListener('resize', resizeBoard);
  resizeBoard();

  // Leaderboard Toggle
  $("#lb-toggle").click(() => $("#leaderboard-panel").toggleClass("open"));
});