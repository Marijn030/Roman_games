const positions = [
  {x: 200, y: 40},   // 0
  {x: 320, y: 120},  // 1
  {x: 360, y: 200},  // 2
  {x: 320, y: 280},  // 3
  {x: 200, y: 360},  // 4
  {x: 80, y: 280},   // 5
  {x: 40, y: 200},   // 6
  {x: 80, y: 120},   // 7
  {x: 200, y: 200}   // midden (8)
];

let board = Array(9).fill(null);
let currentPlayer = 1;
let piecesPlaced = {1: 0, 2: 0};
let selectedPiece = null;

const container = document.getElementById("pieces");

// mogelijke verbindingen (lijnen via midden)
const winningLines = [
  [0, 8, 4],
  [1, 8, 5],
  [2, 8, 6],
  [3, 8, 7]
];

function createPiece(player, posIndex) {
  const el = document.createElement("img");
  el.src = player === 1 ? "stone1.png" : "stone2.png";
  el.classList.add("piece");

  updatePosition(el, posIndex);

  el.onclick = () => onPieceClick(el, posIndex, player);

  container.appendChild(el);
  return el;
}

function updatePosition(el, index) {
  el.style.left = (positions[index].x - 20) + "px";
  el.style.top = (positions[index].y - 20) + "px";
}

function checkWin(player) {
  return winningLines.some(line =>
    line.every(i => board[i] === player)
  );
}

function onBoardClick(index) {
  // plaatsfase
  if (piecesPlaced[currentPlayer] < 3) {
    if (board[index] !== null) return;

    board[index] = currentPlayer;
    createPiece(currentPlayer, index);
    piecesPlaced[currentPlayer]++;

    if (checkWin(currentPlayer)) {
      alert("Speler " + currentPlayer + " wint!");
      return;
    }

    currentPlayer = 3 - currentPlayer;
  }
  // verplaatsfase
  else if (selectedPiece !== null) {
    if (board[index] !== null) return;

    const {el, from} = selectedPiece;

    board[from] = null;
    board[index] = currentPlayer;

    updatePosition(el, index);

    if (checkWin(currentPlayer)) {
      alert("Speler " + currentPlayer + " wint!");
      return;
    }

    selectedPiece = null;
    currentPlayer = 3 - currentPlayer;
  }
}

function onPieceClick(el, index, player) {
  if (piecesPlaced[1] < 3 || piecesPlaced[2] < 3) return;
  if (player !== currentPlayer) return;

  selectedPiece = {el, from: index};
}

// klikbare velden
positions.forEach((pos, index) => {
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = (pos.x - 10) + "px";
  dot.style.top = (pos.y - 10) + "px";
  dot.style.width = "20px";
  dot.style.height = "20px";
  dot.style.cursor = "pointer";

  dot.onclick = () => onBoardClick(index);

  document.getElementById("game").appendChild(dot);
});
