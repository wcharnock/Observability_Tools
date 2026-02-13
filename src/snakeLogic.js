export const DIRECTIONS = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 }
};

export const WASD_TO_ARROW = {
  w: 'ArrowUp',
  a: 'ArrowLeft',
  s: 'ArrowDown',
  d: 'ArrowRight'
};

export function normalizeDirection(input) {
  if (!input) return null;
  if (DIRECTIONS[input]) return input;
  const lowered = input.toLowerCase();
  return WASD_TO_ARROW[lowered] || null;
}

export function isOppositeDirection(current, next) {
  if (!current || !next) return false;
  const a = DIRECTIONS[current];
  const b = DIRECTIONS[next];
  return a.row + b.row === 0 && a.col + b.col === 0;
}

export function createInitialState(rows = 16, cols = 16) {
  const center = { row: Math.floor(rows / 2), col: Math.floor(cols / 2) };
  const snake = [
    center,
    { row: center.row, col: center.col - 1 },
    { row: center.row, col: center.col - 2 }
  ];

  return {
    rows,
    cols,
    snake,
    direction: 'ArrowRight',
    pendingDirection: 'ArrowRight',
    score: 0,
    isGameOver: false,
    food: placeFood(snake, rows, cols, Math.random)
  };
}

export function placeFood(snake, rows, cols, randomFn = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.row},${segment.col}`));
  const available = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = `${row},${col}`;
      if (!occupied.has(key)) {
        available.push({ row, col });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * available.length);
  return available[index];
}

export function queueDirection(state, inputDirection) {
  const next = normalizeDirection(inputDirection);
  if (!next) return state;
  if (isOppositeDirection(state.direction, next)) return state;
  return { ...state, pendingDirection: next };
}

export function tick(state, randomFn = Math.random) {
  if (state.isGameOver) return state;

  const direction = isOppositeDirection(state.direction, state.pendingDirection)
    ? state.direction
    : state.pendingDirection;

  const vector = DIRECTIONS[direction];
  const currentHead = state.snake[0];
  const newHead = { row: currentHead.row + vector.row, col: currentHead.col + vector.col };

  const hitWall =
    newHead.row < 0 ||
    newHead.row >= state.rows ||
    newHead.col < 0 ||
    newHead.col >= state.cols;

  if (hitWall) {
    return { ...state, direction, isGameOver: true };
  }

  const grows = state.food && newHead.row === state.food.row && newHead.col === state.food.col;
  const nextBody = grows ? state.snake : state.snake.slice(0, -1);
  const hitSelf = nextBody.some((segment) => segment.row === newHead.row && segment.col === newHead.col);

  if (hitSelf) {
    return { ...state, direction, isGameOver: true };
  }

  const snake = [newHead, ...nextBody];
  const score = state.score + (grows ? 1 : 0);
  const food = grows ? placeFood(snake, state.rows, state.cols, randomFn) : state.food;

  return {
    ...state,
    snake,
    direction,
    pendingDirection: direction,
    score,
    food,
    isGameOver: false
  };
}
