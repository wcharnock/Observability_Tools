import { createInitialState, queueDirection, tick } from './snakeLogic.js';

const GRID_SIZE = 16;
const TICK_MS = 140;

const grid = document.querySelector('[data-grid]');
const scoreValue = document.querySelector('[data-score]');
const gameStateLabel = document.querySelector('[data-game-state]');
const restartButton = document.querySelector('[data-restart]');
const pauseButton = document.querySelector('[data-pause]');
const controlButtons = document.querySelectorAll('[data-dir]');

let state = createInitialState(GRID_SIZE, GRID_SIZE);
let isPaused = false;

function render() {
  grid.style.setProperty('--grid-size', state.rows);
  grid.replaceChildren();

  const snakeCells = new Set(state.snake.map((segment) => `${segment.row},${segment.col}`));
  const head = state.snake[0];

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const cell = document.createElement('div');
      const key = `${row},${col}`;

      cell.className = 'cell';

      if (state.food && row === state.food.row && col === state.food.col) {
        cell.classList.add('food');
      }

      if (snakeCells.has(key)) {
        cell.classList.add('snake');
      }

      if (row === head.row && col === head.col) {
        cell.classList.add('head');
      }

      grid.append(cell);
    }
  }

  scoreValue.textContent = String(state.score);

  if (state.isGameOver) {
    gameStateLabel.textContent = 'Game Over';
  } else if (isPaused) {
    gameStateLabel.textContent = 'Paused';
  } else {
    gameStateLabel.textContent = 'Running';
  }

  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

function restart() {
  state = createInitialState(GRID_SIZE, GRID_SIZE);
  isPaused = false;
  render();
}

function onDirectionInput(direction) {
  if (state.isGameOver) return;
  state = queueDirection(state, direction);
}

function togglePause() {
  if (state.isGameOver) return;
  isPaused = !isPaused;
  render();
}

function gameLoop() {
  if (!isPaused && !state.isGameOver) {
    state = tick(state);
    render();
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key.toLowerCase() === 'p') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key === 'Enter' && state.isGameOver) {
    restart();
    return;
  }

  onDirectionInput(event.key);
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    onDirectionInput(button.dataset.dir);
  });
});

restartButton.addEventListener('click', restart);
pauseButton.addEventListener('click', togglePause);

render();
setInterval(gameLoop, TICK_MS);
