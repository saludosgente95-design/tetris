class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Block {
  constructor(x, y, color = '') {
    this.x = x;
    this.y = y;
    this.color = color;

    let block = document.createElement("div");
    block.setAttribute("class", "block" + (color ? " " + color : ""));
    $(block).append(
      "<div class='inner-tile'><div class='inner-inner-tile'></div></div>"
    );
    this.element = block;
  }

  init() {
    $("#board").append(this.element);
  }

  render() {
    $(this.element).css({
      left: this.y * $(this.element).innerWidth() + "px",
      top: this.x * $(this.element).innerHeight() + "px"
    });
  }

  fall() {
    this.x += 1;
  }

  moveRight() {
    this.y += 1;
  }

  moveLeft() {
    this.y -= 1;
  }

  rightPosition() {
    return new Position(this.x, this.y + 1);
  }

  leftPosition() {
    return new Position(this.x, this.y - 1);
  }

  getPosition() {
    return new Position(this.x, this.y);
  }

  flash() {
    return window.animatelo.flash(this.element, {
      duration: 500
    });
  }

  destroy() {
    $(this.element).remove();
  }
}

class Shape {
  constructor(blocks) {
    this.blocks = blocks;
  }

  getBlocks() {
    return Array.from(this.blocks);
  }

  init() {
    for (let block of this.blocks) {
      block.init();
    }
  }

  render() {
    for (let block of this.blocks) {
      block.render();
    }
  }

  fallingPositions() {
    return this.blocks
      .map(b => b.getPosition())
      .map(p => new Position(p.x + 1, p.y));
  }

  fall() {
    for (let block of this.blocks) {
      block.fall();
    }
  }

  rightPositions() {
    return this.blocks.map(b => b.rightPosition());
  }

  leftPositions() {
    return this.blocks.map(b => b.leftPosition());
  }

  moveRight() {
    for (let block of this.blocks) {
      block.moveRight();
    }
  }

  moveLeft() {
    for (let block of this.blocks) {
      block.moveLeft();
    }
  }

  clear() {
    for (let block of this.blocks) {
      block.destroy();
    }
    this.blocks = [];
  }

  addBlocks(blocks) {
    for (let block of blocks) {
      this.blocks.push(block);
    }
  }

  rotate() {
    //do nothing
  }

  rotatePositions() {
    //do nothing
  }
}

class Square extends Shape {
  constructor(x, y) {
    let blocks = [];
    blocks.push(new Block(x, y, 'color-square'));
    blocks.push(new Block(x, y + 1, 'color-square'));
    blocks.push(new Block(x + 1, y, 'color-square'));
    blocks.push(new Block(x + 1, y + 1, 'color-square'));
    super(blocks);
  }
}

class LShape extends Shape {
  constructor(x, y) {
    let blocks = [];
    blocks.push(new Block(x, y, 'color-lshape'));
    blocks.push(new Block(x - 1, y, 'color-lshape'));
    blocks.push(new Block(x + 1, y, 'color-lshape'));
    blocks.push(new Block(x + 1, y + 1, 'color-lshape'));
    super(blocks);
    this.position = 0;
  }

  rotate() {
    let blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-lshape'));
    this.clear();
    this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }

  rotatePositions() {
    let pos = this.getBlocks()
      .shift()
      .getPosition();
    let x = pos.x;
    let y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x + 1, y));
          positions.push(new Position(x + 1, y + 1));
        }
        break;
      case 1:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x, y + 1));
          positions.push(new Position(x + 1, y - 1));
        }
        break;
      case 2:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y - 1));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x + 1, y));
        }
        break;
      case 3:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x, y + 1));
          positions.push(new Position(x - 1, y + 1));
        }
        break;
    }
    return positions;
  }

  getNextPosition() {
    return (this.position + 1) % 4;
  }
}

class TShape extends Shape {
  constructor(x, y) {
    let blocks = [];
    blocks.push(new Block(x, y, 'color-tshape'));
    blocks.push(new Block(x, y - 1, 'color-tshape'));
    blocks.push(new Block(x + 1, y, 'color-tshape'));
    blocks.push(new Block(x, y + 1, 'color-tshape'));
    super(blocks);
    this.position = 0;
  }

  rotate() {
    let blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-tshape'));
    this.clear();
    this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }

  rotatePositions() {
    let pos = this.getBlocks()
      .shift()
      .getPosition();
    let x = pos.x;
    let y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x + 1, y));
          positions.push(new Position(x, y + 1));
        }
        break;
      case 1:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x + 1, y));
        }
        break;
      case 2:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x, y + 1));
        }
        break;
      case 3:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x, y + 1));
          positions.push(new Position(x + 1, y));
        }
        break;
    }
    return positions;
  }

  getNextPosition() {
    return (this.position + 1) % 4;
  }
}

class ZShape extends Shape {
  constructor(x, y) {
    let blocks = [];
    blocks.push(new Block(x, y, 'color-zshape'));
    blocks.push(new Block(x, y - 1, 'color-zshape'));
    blocks.push(new Block(x + 1, y, 'color-zshape'));
    blocks.push(new Block(x + 1, y + 1, 'color-zshape'));
    super(blocks);
    this.position = 0;
  }

  rotate() {
    let blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-zshape'));
    this.clear();
    this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }

  rotatePositions() {
    let pos = this.getBlocks()
      .shift()
      .getPosition();
    let x = pos.x;
    let y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x + 1, y));
          positions.push(new Position(x + 1, y + 1));
        }
        break;
      case 1:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x + 1, y - 1));
        }
        break;
    }
    return positions;
  }

  getNextPosition() {
    return (this.position + 1) % 2;
  }
}

class Line extends Shape {
  constructor(x, y) {
    let blocks = [];
    blocks.push(new Block(x, y, 'color-line'));
    blocks.push(new Block(x - 1, y, 'color-line'));
    blocks.push(new Block(x + 1, y, 'color-line'));
    blocks.push(new Block(x + 2, y, 'color-line'));
    super(blocks);
    this.position = 0;
  }

  rotate() {
    let blocks = this.rotatePositions().map(p => new Block(p.x, p.y, 'color-line'));
    this.clear();
    this.addBlocks(blocks);
    this.position = this.getNextPosition();
  }

  rotatePositions() {
    let pos = this.getBlocks()
      .shift()
      .getPosition();
    let x = pos.x;
    let y = pos.y;
    let positions = [];
    switch (this.getNextPosition()) {
      case 0:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x - 1, y));
          positions.push(new Position(x + 1, y));
          positions.push(new Position(x + 2, y));
        }
        break;
      case 1:
        {
          positions.push(new Position(x, y));
          positions.push(new Position(x, y - 1));
          positions.push(new Position(x, y + 1));
          positions.push(new Position(x, y + 2));
        }
        break;
    }
    return positions;
  }

  getNextPosition() {
    return (this.position + 1) % 2;
  }
}

class Board {
  constructor() {
    this.blocks = [];
    this.shapes = [];
    this.interval = undefined;
    this.loopInterval = 1000;
    this.baseLoopInterval = 1000;
    this.gameOver = true;
    this.loopIntervalFast = parseInt(1000 / 27);
    this.init();
    this.score = 0;
    this.level = 1;
    this.nextShapeType = this.getRandomRange(0, 4);
    this.combo = 0;
    this.lastClearedLines = 0;
  }

  setScore(value) {
    this.score = value;
    $("#score").text(this.score);
    this.updateLevel();
  }

  getScore() {
    return this.score;
  }

  updateLevel() {
    const newLevel = Math.floor(this.score / 100) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      $("#level").text(this.level);
      // Increase speed: reduce interval by 50ms per level, min 200ms
      this.loopInterval = Math.max(200, this.baseLoopInterval - (this.level - 1) * 50);
      if (!this.moveFast && !this.gameOver) {
        this.initGameLoop(this.loopInterval);
      }
    }
  }

  renderNextPiece() {
    const preview = $("#next-piece-preview");
    preview.empty();

    // Mini blocks for preview (smaller scale)
    const miniBlockSize = 12;
    const offsetX = 20;
    const offsetY = 15;

    let positions = [];
    switch (this.nextShapeType) {
      case 0: // Line
        positions = [[0, 0], [1, 0], [2, 0], [3, 0]];
        break;
      case 1: // Square
        positions = [[0, 0], [0, 1], [1, 0], [1, 1]];
        break;
      case 2: // LShape
        positions = [[0, 0], [1, 0], [2, 0], [2, 1]];
        break;
      case 3: // ZShape
        positions = [[0, 0], [0, 1], [1, 1], [1, 2]];
        break;
      case 4: // TShape
        positions = [[0, 0], [0, 1], [0, 2], [1, 1]];
        break;
    }

    positions.forEach(([x, y]) => {
      const miniBlock = $('<div></div>').css({
        position: 'absolute',
        width: miniBlockSize + 'px',
        height: miniBlockSize + 'px',
        left: (offsetX + y * miniBlockSize) + 'px',
        top: (offsetY + x * miniBlockSize) + 'px',
        background: 'linear-gradient(145deg, #e8b4d9, #c89ff5)',
        border: '1px solid #d8a7e8',
        borderRadius: '2px',
        boxShadow: '0 0 6px rgba(200, 159, 245, 0.4)'
      });
      preview.append(miniBlock);
    });
  }

  init() {
    $(".empty").each(function (index, ele) {
      let x = parseInt(index / 10);
      let y = index % 10;
      $(ele).css({
        left: y * $(ele).innerWidth() + "px",
        top: x * $(ele).innerHeight() + "px"
      });
    });
    $("#message").text("Tetris");
    window.animatelo.flash("#new-game", {
      duration: 2500,
      iterations: Infinity
    });
  }

  newGame() {
    for (let shape of this.shapes) {
      this.removeShape(shape);
      this.addBlocks(shape.getBlocks());
    }
    for (let block of this.blocks) {
      block.destroy();
    }
    this.blocks = [];
    this.gameOver = false;
    this.level = 1;
    this.loopInterval = this.baseLoopInterval;
    $("#level").text(this.level);
    this.nextShapeType = this.getRandomRange(0, 4);
    this.renderNextPiece();
    this.initGameLoop(this.loopInterval);
    this.setScore(0);
    this.combo = 0;
    this.lastClearedLines = 0;
    $("#banner").hide();
  }

  initGameLoop(value) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    let ref = this;
    this.interval = setInterval(function () {
      ref.gameLoop();
    }, value);
  }

  gameLoop() {
    this.renderShapes();
    this.renderBlocks();
    this.spawnShapes();
    this.gameUpdate();
    console.log("Shapes Length:" + this.shapes.length);
    console.log("Blocks Length:" + this.blocks.length);
  }

  gameUpdate() {
    if (this.isGameOver()) {
      this.gameOver = true;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
      }
      $("#banner").show();
      $("#message").text("Game Over!");
      $("#new-game").text("Tap here to start again!");
    }
  }

  isGameOver() {
    for (let block of this.blocks) {
      let pos = block.getPosition();
      if (pos.x === 0 && pos.y === 4) {
        return true;
      }
    }
    return false;
  }

  renderShapes() {
    for (let shape of this.getShapes()) {
      if (
        this.arePositonsWithinBoard(shape.fallingPositions()) &&
        this.areBlocksEmpty(shape.fallingPositions())
      ) {
        shape.fall();
        shape.render();
      } else {
        // Piece has landed - add subtle sparkle only on contact edges
        let blocks = shape.getBlocks();
        for (let block of blocks) {
          let pos = block.getPosition();
          // Check if this block is touching the bottom or another block below
          let blockBelow = this.getBlock(pos.x + 1, pos.y);
          let touchingBottom = (pos.x >= 15);

          if (blockBelow || touchingBottom) {
            // Add sparkle to this specific block
            $(block.element).addClass('landing-sparkle');
            setTimeout(() => {
              $(block.element).removeClass('landing-sparkle');
            }, 400);
          }
        }

        // Play landing sound
        try {
          if (typeof audioManager !== 'undefined') audioManager.playLand();
        } catch (e) { console.warn("Audio error:", e); }

        this.removeShape(shape);
        this.addBlocks(blocks);
        if (this.moveFast) {
          this.initGameLoop(this.loopInterval);
          this.moveFast = false;
        }
      }
    }
  }

  dropShape() {
    if (!this.gameOver) {
      this.initGameLoop(this.loopIntervalFast);
      this.moveFast = true;
    }
  }

  renderBlocks() {
    let linesCleared = 0;
    let allClearedBlocks = [];

    for (let x = 0; x < 16; x++) {
      let blocks = [];
      for (let y = 0; y < 10; y++) {
        let block = this.getBlock(x, y);
        if (!block) {
          break;
        }
        blocks.push(block);
      }
      if (blocks.length == 10) {
        linesCleared++;
        allClearedBlocks.push(...blocks);
        let ref = this;
        this.removeBlocks(blocks);
        this.flashBlocks(blocks, function () {
          ref.destroyBlocks(blocks);
          ref.fallBlocks(x);
          ref.setScore(ref.getScore() + 10);
        });
      }
      // Add sound effects to line clears
      try {
        if (linesCleared > 0 && typeof audioManager !== 'undefined') {
          if (linesCleared === 1) audioManager.playSingle();
          else if (linesCleared === 2) audioManager.playDouble();
          else if (linesCleared === 3) audioManager.playTriple();
          else if (linesCleared >= 4) audioManager.playTetris();
        }
      } catch (e) { console.warn("Audio clear error:", e); }
    }

    // Tetris! (4 lines cleared)
    if (linesCleared >= 4) {
      // Add explosion effect to all cleared blocks
      for (let block of allClearedBlocks) {
        $(block.element).addClass('tetris-explosion');
      }
      // Flash the board
      $('#board').addClass('board-flash');
      setTimeout(() => {
        $('#board').removeClass('board-flash');
      }, 600);
      // Bonus points for Tetris
      this.setScore(this.getScore() + 40);
    }
  }

  flashBlocks(blocks, callback) {
    let anim = null;
    for (let block of blocks) {
      anim = block.flash();
    }
    anim[0].onfinish = callback;
  }

  fallBlocks(i) {
    for (let x = 0; x < i; x++) {
      for (let y = 0; y < 10; y++) {
        let block = this.getBlock(x, y);
        if (block) {
          block.fall();
          block.render();
        }
      }
    }
  }

  removeBlocks(blocks) {
    for (let block of blocks) {
      this.blocks.splice(this.blocks.indexOf(block), 1);
    }
  }

  destroyBlocks(blocks) {
    for (let block of blocks) {
      block.destroy();
    }
  }

  getBlock(x, y) {
    for (let block of this.blocks) {
      if (block.x == x && block.y == y) {
        return block;
      }
    }
    return undefined;
  }

  spawnShapes() {
    if (this.shapes.length == 0) {
      let shape = null;
      // Use the pre-generated next shape
      let shapeType = this.nextShapeType;

      switch (shapeType) {
        case 0:
          {
            shape = new Line(0, 4);
          }
          break;
        case 1:
          {
            shape = new Square(0, 4);
          }
          break;
        case 2:
          {
            shape = new LShape(0, 4);
          }
          break;
        case 3:
          {
            shape = new ZShape(0, 4);
          }
          break;
        case 4:
          {
            shape = new TShape(0, 4);
          }
          break;
      }

      shape.init();
      shape.render();
      this.shapes.push(shape);

      // Generate next shape and update preview
      this.nextShapeType = this.getRandomRange(0, 4);
      this.renderNextPiece();
    }
  }

  getShapes() {
    return Array.from(this.shapes);
  }

  removeShape(shape) {
    this.shapes.splice(this.shapes.indexOf(shape), 1);
  }

  addBlocks(blocks) {
    for (let block of blocks) {
      this.blocks.push(block);
    }
  }

  arePositonsWithinBoard(positions) {
    for (let position of positions) {
      if (position.x >= 16 || position.y < 0 || position.y >= 10) {
        return false;
      }
    }
    return true;
  }

  areBlocksEmpty(positions) {
    for (let position of positions) {
      for (let block of this.blocks) {
        let pos = block.getPosition();
        if (pos.x == position.x && pos.y == position.y) {
          return false;
        }
      }
    }
    return true;
  }

  leftKeyPress() {
    for (let shape of this.shapes) {
      if (
        this.arePositonsWithinBoard(shape.leftPositions()) &&
        this.areBlocksEmpty(shape.leftPositions())
      ) {
        shape.moveLeft();
        shape.render();
      }
    }
  }

  rotate() {
    for (let shape of this.shapes) {
      if (
        this.arePositonsWithinBoard(shape.rotatePositions()) &&
        this.areBlocksEmpty(shape.rotatePositions())
      )
        shape.rotate();
      shape.init();
      shape.render();
    }
  }

  rightKeyPress() {
    for (let shape of this.shapes) {
      if (
        this.arePositonsWithinBoard(shape.rightPositions()) &&
        this.areBlocksEmpty(shape.rightPositions())
      ) {
        shape.moveRight();
        shape.render();
      }
    }
  }

  upKeyPress() {
    this.rotate();
  }

  downKeyPress() {
    this.dropShape();
  }

  getRandomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

let board = new Board();

$(document).keydown(function (e) {
  switch (e.which) {
    case 37: // left
      board.leftKeyPress();
      break;

    case 38: // up
      board.upKeyPress();
      break;

    case 39: // right
      board.rightKeyPress();
      break;

    case 40: // down
      board.downKeyPress();
      break;

    case 78: // n
      board.newGame();
      break;

    default:
      console.log(e.which);
      break; // exit this handler for other keys
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
});

$("#new-game").click(function () {
  board.newGame();
});

$("#down").click(function () {
  board.downKeyPress();
});

$("#rotate").click(function () {
  board.upKeyPress();
});

$("#left").click(function () {
  board.leftKeyPress();
});

$("#right").click(function () {
  board.rightKeyPress();
});