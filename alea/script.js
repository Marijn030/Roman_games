document.addEventListener('DOMContentLoaded', () => {
  const tableScene = document.getElementById('tableScene');
  const rollBtn = document.getElementById('rollBtn');
  const resetBtn = document.getElementById('resetBtn');
  const dieTrigger = document.getElementById('dieTrigger');
  const resultSummary = document.getElementById('resultSummary');
  const totalValue = document.getElementById('totalValue');
  const dieSlots = Array.from(document.querySelectorAll('.die-slot'));

  if (!tableScene) console.error('Missing #tableScene');
  if (!rollBtn) console.error('Missing #rollBtn');
  if (!resetBtn) console.error('Missing #resetBtn');
  if (!dieTrigger) console.error('Missing #dieTrigger');
  if (!resultSummary) console.error('Missing #resultSummary');
  if (!totalValue) console.error('Missing #totalValue');
  if (!dieSlots.length) console.error('Missing .die-slot elements');

  if (
    !tableScene ||
    !rollBtn ||
    !resetBtn ||
    !dieTrigger ||
    !resultSummary ||
    !totalValue ||
    dieSlots.length === 0
  ) {
    return;
  }

  let rolling = false;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function createRoll() {
    return Array.from({ length: 5 }, () => randomInt(1, 6));
  }

  function updateSummary(values) {
    const total = values.reduce((sum, value) => sum + value, 0);
    resultSummary.textContent = values.join(' - ');
    totalValue.textContent = String(total);
  }

  function hideResults() {
    dieSlots.forEach((slot) => {
      slot.classList.remove('visible');
    });
  }

  function resetDieImages() {
    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      if (img) {
        img.src = `dice${Math.min(index + 1, 5)}.png`;
      }
    });
  }

  function randomizeDicePositions() {
    const presets = [
      { x: 14, y: 8, r: -14 },
      { x: 31, y: 2, r: 9 },
      { x: 48, y: 10, r: -7 },
      { x: 65, y: 4, r: 12 },
      { x: 80, y: 11, r: -11 }
    ];

    const shuffled = [...presets].sort(() => Math.random() - 0.5);

    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      const base = shuffled[index];

      const xJitter = randomInt(-4, 4);
      const yJitter = randomInt(-3, 4);
      const rotateJitter = randomInt(-6, 6);

      slot.style.left = `${base.x + xJitter}%`;
      slot.style.bottom = `${base.y + yJitter}%`;

      if (img) {
        img.style.transform = `translate(-50%, 0) rotate(${base.r + rotateJitter}deg)`;
      }
    });
  }

  function showResults(values) {
    randomizeDicePositions();

    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      if (img) {
        img.src = `dice${values[index]}.png`;
      }

      setTimeout(() => {
        slot.classList.add('visible');
      }, index * 90);
    });

    updateSummary(values);
  }

  function rollDice() {
    if (rolling) return;

    rolling = true;
    tableScene.classList.add('rolling');
    hideResults();

    resultSummary.textContent = 'Dobbelstenen rollen...';
    totalValue.textContent = '...';

    const values = createRoll();

    setTimeout(() => {
      tableScene.classList.remove('rolling');
      showResults(values);
      rolling = false;
    }, 900);
  }

  function resetGame() {
    rolling = false;
    tableScene.classList.remove('rolling');
    hideResults();
    resetDieImages();
    randomizeDicePositions();
    resultSummary.textContent = 'Nog niet gegooid';
    totalValue.textContent = '0';
  }

  rollBtn.addEventListener('click', rollDice);
  dieTrigger.addEventListener('click', rollDice);
  resetBtn.addEventListener('click', resetGame);

  resetGame();
});
