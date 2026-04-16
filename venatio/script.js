const BOARD_WIDTH = 1316;
const BOARD_HEIGHT = 883;

// Node order follows your image-map order
const nodes = [
  { x: 668,  y: 66,  r: 27 }, // 0 top center
  { x: 957,  y: 66,  r: 26 }, // 1 top right-inner
  { x: 1251, y: 66,  r: 27 }, // 2 top right
  { x: 375,  y: 66,  r: 27 }, // 3 top left-inner
  { x: 84,   y: 66,  r: 26 }, // 4 top left
  { x: 1251, y: 367, r: 27 }, // 5 right upper-mid
  { x: 85,   y: 367, r: 26 }, // 6 left upper-mid
  { x: 82,   y: 518, r: 25 }, // 7 left lower-mid
  { x: 84,   y: 818, r: 28 }, // 8 bottom left
  { x: 375,  y: 818, r: 28 }, // 9 bottom left-inner
  { x: 669,  y: 817, r: 29 }, // 10 bottom center
  { x: 959,  y: 819, r: 27 }, // 11 bottom right-inner
  { x: 1250, y: 818, r: 26 }, // 12 bottom right
  { x: 1250, y: 518, r: 26 }  // 13 right lower-mid
];

// Board graph based on the lines in your diagram
const connections = {
  4:  [3, 6],
  3:  [4, 0, 6],
  0:  [3, 1, 10],
  1:  [0, 2, 5],
  2:  [1, 5],

  6:  [4, 3, 7],
  7:  [6, 8, 9],
  8:  [7, 9],
  9:  [8, 10, 7],
  10: [9, 11, 0],
  11: [10, 12, 13],
  12: [11, 13],

  5:  [2, 1, 13],
  13: [5, 12, 11]
};

// Piece types
const PREY = 1;   // white
const HUNTER = 2; // black

// Starting setup
// White starts with one in top left and bottom left
// Black starts with four on the right side
const START_BOARD = Array(14).fill(null);
START_BOARD[4] = PREY;
START_BOARD[8] = PREY;
START_BOARD[2] = HUNTER;
START_BOARD[5] = HUNTER;
START_BOARD[13] = HUNTER;
START_BOARD[12] = HUNTER;

let board = [...START_BOARD];
let currentPlayer = HUNTER; // hunter begins
let selected = null;
let gameOver = false;
let hunterMoveCount = 0;

const game = document.getElementById("game");
const holesContainer = document.getElementById("holes");
const piecesContainer = document.getElementById("pieces");

const phaseText = document.getElementById("phaseText");
const turnText = document.getElementById("turnText");
const hunterMoves = document.getElementById("hunterMoves");
const freePreyCount = document.getElementById("freePreyCount");
const trappedPreyCount = document.getElementById("trappedPreyCount");
const resetBtn = document.getElementById("resetBtn");

const winModal = document.getElementById("winModal");
const winMessage = document.getElementById("winMessage");
const playAgainBtn = document.getElementById("playAgainBtn");

function scaleX(x) {
  return (x / BOARD_WIDTH) * game.clientWidth;
}

function scaleY(y) {
  return (y / BOARD_HEIGHT) * game.clientHeight;
}

function scaleR(r) {
  const sx = game.clientWidth / BOARD_WIDTH;
  const sy = game.clientHeight / BOARD_HEIGHT;
  return r * Math.min(sx, sy);
}

function getNodePixel(index) {
  const n = nodes[index];
  return {
    x: scaleX(n.x),
    y: scaleY(n.y)
  };
}

function updatePiecePosition(pieceEl, index) {
  const p = getNodePixel(index);
  pieceEl.style.left = `${p.x}px`;
  pieceEl.style.top = `${p.y}px`;
  pieceEl.dataset.index = String(index);
}

function getPieceElementAt(index) {
  return [...document.querySelectorAll(".piece")].find(
    el => Number(el.dataset.index) === index
  );
}

function clearSelection() {
  document.querySelectorAll(".piece.selected").forEach(el => {
    el.classList.remove("selected");
  });
  selected = null;
}

function getPlayerName(player) {
  return player === HUNTER ? "Jager" : "Prooi";
}

function getLegalMoves(index) {
  const occupant = board[index];
  if (occupant === null) return [];
  return connections[index].filter(next => board[next] === null);
}

function isTrappedPrey(index) {
  return board[index] === PREY && getLegalMoves(index).length === 0;
}

function countTrappedPrey() {
  return board.reduce((count, occupant, index) => {
    return count + (occupant === PREY && isTrappedPrey(index) ? 1 : 0);
  }, 0);
}

function countFreePrey() {
  return board.reduce((count, occupant, index) => {
    return count + (occupant === PREY && !isTrappedPrey(index) ? 1 : 0);
  }, 0);
}

function refreshPieceStates() {
  document.querySelectorAll(".piece").forEach(piece => {
    const index = Number(piece.dataset.index);
    piece.classList.toggle("trapped", isTrappedPrey(index));
  });
}

function refreshHoles() {
  document.querySelectorAll(".hole").forEach((holeEl, index) => {
    holeEl.classList.remove("occupied", "valid-target");

    if (gameOver || board[index] !== null) {
      holeEl.classList.add("occupied");
      return;
    }

    if (!selected) return;

    if (connections[selected.from].includes(index)) {
      holeEl.classList.add("valid-target");
    } else {
      holeEl.classList.add("occupied");
    }
  });
}

function updateStatus() {
  hunterMoves.textContent = hunterMoveCount;
  freePreyCount.textContent = countFreePrey();
  trappedPreyCount.textContent = countTrappedPrey();

  if (gameOver) {
    phaseText.textContent = "Afgelopen";
    turnText.textContent = "De jacht is voorbij";
    turnText.className = "value";
    return;
  }

  phaseText.textContent = "Spelen";

  if (!selected) {
    turnText.textContent = `${getPlayerName(currentPlayer)} (${currentPlayer === HUNTER ? "zwart" : "wit"}) is aan zet`;
  } else {
    turnText.textContent = `${getPlayerName(currentPlayer)}: kies een aangrenzend leeg kruispunt`;
  }

  turnText.className = `value player-${currentPlayer}`;
}

function showWinPopup() {
  gameOver = true;
  clearSelection();
  refreshHoles();
  refreshPieceStates();
  updateStatus();

  winMessage.textContent =
    `De jager heeft beide prooipionnen ingesloten in ${hunterMoveCount} zetten.`;
  winModal.classList.remove("hidden");
}

function hideWinPopup() {
  winModal.classList.add("hidden");
}

function switchPlayer() {
  currentPlayer = currentPlayer === HUNTER ? PREY : HUNTER;
  refreshPieceStates();
  refreshHoles();
  updateStatus();
}

function createPiece(player, index) {
  const el = document.createElement("img");
  el.src = player === PREY ? "stone1.png" : "stone2.png";
  el.className = "piece";
  el.dataset.player = String(player);
  el.draggable = false;

  updatePiecePosition(el, index);

  el.addEventListener("click", event => {
    event.stopPropagation();

    if (gameOver) return;
    if (player !== currentPlayer) return;

    clearSelection();
    el.classList.add("selected");
    selected = {
      el,
      from: Number(el.dataset.index)
    };

    refreshHoles();
    updateStatus();
  });

  piecesContainer.appendChild(el);
}

function handleHoleClick(index) {
  if (gameOver) return;
  if (!selected) return;
  if (board[index] !== null) return;
  if (!connections[selected.from].includes(index)) return;

  board[selected.from] = null;
  board[index] = currentPlayer;

  updatePiecePosition(selected.el, index);
  selected.el.classList.remove("selected");
  selected = null;

  if (currentPlayer === HUNTER) {
    hunterMoveCount++;
  }

  refreshPieceStates();
  refreshHoles();
  updateStatus();

  if (countTrappedPrey() === 2) {
    showWinPopup();
    return;
  }

  switchPlayer();
}

function createHoles() {
  holesContainer.innerHTML = "";

  nodes.forEach((node, index) => {
    const hole = document.createElement("div");
    const x = scaleX(node.x);
    const y = scaleY(node.y);
    const r = Math.max(scaleR(node.r), 16);

    hole.className = "hole";
    hole.style.left = `${x}px`;
    hole.style.top = `${y}px`;
    hole.style.width = `${r * 2}px`;
    hole.style.height = `${r * 2}px`;

    hole.addEventListener("click", () => handleHoleClick(index));

    holesContainer.appendChild(hole);
  });

  refreshHoles();
}

function createAllPieces() {
  piecesContainer.innerHTML = "";

  board.forEach((player, index) => {
    if (player !== null) {
      createPiece(player, index);
    }
  });

  refreshPieceStates();
}

function repositionPieces() {
  document.querySelectorAll(".piece").forEach(pieceEl => {
    const index = Number(pieceEl.dataset.index);
    updatePiecePosition(pieceEl, index);
  });
}

function resetGame() {
  board = [...START_BOARD];
  currentPlayer = HUNTER;
  selected = null;
  gameOver = false;
  hunterMoveCount = 0;

  hideWinPopup();
  createHoles();
  createAllPieces();
  updateStatus();
}

resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", resetGame);

window.addEventListener("load", () => {
  createHoles();
  createAllPieces();
  updateStatus();
});

window.addEventListener("resize", () => {
  createHoles();
  repositionPieces();
  refreshPieceStates();
});
