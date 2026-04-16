const positions = [
  {x: 0.5, y: 0.12}, // 0
  {x: 0.78, y: 0.28}, // 1
  {x: 0.88, y: 0.5}, // 2
  {x: 0.78, y: 0.72}, // 3
  {x: 0.5, y: 0.88}, // 4
  {x: 0.22, y: 0.72}, // 5
  {x: 0.12, y: 0.5}, // 6
  {x: 0.22, y: 0.28}, // 7
  {x: 0.5, y: 0.5}   // midden
];

// verbindingen (BELANGRIJK voor regels)
const connections = {
  0: [1,7,8],
  1: [0,2,8],
  2: [1,3,8],
  3: [2,4,8],
  4: [3,5,8],
  5: [4,6,8],
  6: [5,7,8],
  7: [6,0,8],
  8: [0,1,2,3,4,5,6,7]
};

const winningLines = [
  [0,8,4],
  [1,8,5],
  [2,8,6],
  [3,8,7]
];

let board = Array(9).fill(null);
let currentPlayer = 1;
let placed = {1:0, 2:0};
let selected = null;

const game = document.getElementById("game");
const piecesContainer = document.getElementById("pieces");
const boardImg = document.getElementById("board");

// ---- helpers ----
function getPixelPos(index) {
  const rect = boardImg.getBoundingClientRect();
  return {
    x: positions[index].x * rect.width,
    y: positions[index].y * rect.height
  };
}

function updatePiece(el, index) {
  const p = getPixelPos(index);
  el.style.left = (p.x - 20) + "px";
  el.style.top = (p.y - 20) + "px";
}

// ---- game logic ----
function checkWin(player) {
  return winningLines.some(line =>
    line.every(i => board[i] === player)
  );
}

function hasMove(index) {
  return connections[index].some(n => board[n] === null);
}

// ---- pieces ----
function createPiece(player, index) {
  const el = document.createElement("img");
  el.src = player === 1 ? "stone1.png" : "stone2.png";
  el.classList.add("piece");

  updatePiece(el, index);

  el.onclick = () => {
    if (placed[1] < 3 || placed[2] < 3) return;
    if (player !== currentPlayer) return;
    if (!hasMove(index)) return; // ingesloten

    document.querySelectorAll(".piece").forEach(p => p.classList.remove("selected"));
    el.classList.add("selected");

    selected = {el, from:index};
  };

  piecesContainer.appendChild(el);
}

// ---- clicks ----
function onClick(index) {

  // fase 1: plaatsen
  if (placed[currentPlayer] < 3) {
    if (board[index] !== null) return;

    board[index] = currentPlayer;
    createPiece(currentPlayer, index);
    placed[currentPlayer]++;

    if (checkWin(currentPlayer)) {
      setTimeout(()=>alert("Speler " + currentPlayer + " wint!"),100);
      return;
    }

    currentPlayer = 3 - currentPlayer;
  }

  // fase 2: bewegen
  else if (selected) {
    if (board[index] !== null) return;

    // alleen verbonden
    if (!connections[selected.from].includes(index)) return;

    board[selected.from] = null;
    board[index] = currentPlayer;

    updatePiece(selected.el, index);
    selected.el.classList.remove("selected");
    selected = null;

    if (checkWin(currentPlayer)) {
      setTimeout(()=>alert("Speler " + currentPlayer + " wint!"),100);
      return;
    }

    currentPlayer = 3 - currentPlayer;
  }
}

// ---- clickable dots ----
function createDots() {
  document.querySelectorAll(".dot").forEach(e => e.remove());

  positions.forEach((pos, index) => {
    const d = document.createElement("div");
    d.classList.add("dot");

    const p = getPixelPos(index);
    d.style.left = (p.x - 11) + "px";
    d.style.top = (p.y - 11) + "px";

    d.onclick = () => onClick(index);

    game.appendChild(d);
  });
}

// ---- init ----
window.onload = () => {
  createDots();
};

window.onresize = () => {
  createDots();
  document.querySelectorAll(".piece").forEach((el, i) => {
    const index = board.findIndex((v, idx) => v && el === piecesContainer.children[idx]);
    if (index !== -1) updatePiece(el, index);
  });
};
