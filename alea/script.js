document.addEventListener('DOMContentLoaded', () => {
  const tableScene = document.getElementById('tableScene');
  const rollBtn = document.getElementById('rollBtn');
  const resetBtn = document.getElementById('resetBtn');
  const dieTrigger = document.getElementById('dieTrigger');
  const resultSummary = document.getElementById('resultSummary');
  const totalValue = document.getElementById('totalValue');
  const dieSlots = Array.from(document.querySelectorAll('.die-slot'));

  if (!tableScene || !rollBtn || !resetBtn || !dieTrigger || !resultSummary || !totalValue || dieSlots.length === 0) {
    console.error('Dice game could not start: one or more required elements are missing.');
    return;
  }

  const dieImageFiles = [
    'dice1.png',
    'dice2.png',
    'dice3.png',
    'dice4.png',
    'dice5.png'
  ];

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

  function resetTransforms() {
    dieSlots.forEach((slot) => {
      const img = slot.querySelector('.result-die');
      const value = slot.querySelector('.die-value');

      if (img) {
        img.style.transform = 'translate(0, 0) rotate(0deg)';
      }

      if (value) {
        value.style.transform = 'translate(0, 0)';
        value.textContent = '?';
      }
    });
  }

  function showResults(values) {
    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      const value = slot.querySelector('.die-value');
      const rotation = randomInt(-16, 16);
      const offsetX = randomInt(-4, 4);
      const offsetY = randomInt(-3, 4);

      if (img) {
        img.src = dieImageFiles[index];
        img.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
      }

      if (value) {
        value.textContent = String(values[index]);
        value.style.transform = `translate(${randomInt(-5, 5)}px, ${randomInt(-5, 5)}px)`;
      }

      setTimeout(() => {
        slot.classList.add('visible');
      }, 100 * index);
    });

    updateSummary(values);
  }

  function rollDice() {
    if (rolling) return;

    rolling = true;
    hideResults();
    tableScene.classList.add('rolling');
    resultSummary.textContent = 'Dobbelstenen rollen...';
    totalValue.textContent = '...';

    const results = createRoll();

    window.setTimeout(() => {
      tableScene.classList.remove('rolling');
      showResults(results);
      rolling = false;
    }, 1250);
  }

  function resetGame() {
    rolling = false;
    tableScene.classList.remove('rolling');
    hideResults();
    resetTransforms();
    resultSummary.textContent = 'Nog niet gegooid';
    totalValue.textContent = '0';
  }

  rollBtn.addEventListener('click', rollDice);
  dieTrigger.addEventListener('click', rollDice);
  resetBtn.addEventListener('click', resetGame);

  resetGame();
});
