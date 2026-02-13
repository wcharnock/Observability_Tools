import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, queueDirection, tick, placeFood } from '../src/snakeLogic.js';

test('moves snake in current direction on each tick', () => {
  const state = createInitialState(8, 8);
  const next = tick(state, () => 0);

  assert.equal(next.snake[0].row, state.snake[0].row);
  assert.equal(next.snake[0].col, state.snake[0].col + 1);
  assert.equal(next.score, 0);
});

test('snake grows and score increments when food is eaten', () => {
  const state = {
    rows: 8,
    cols: 8,
    snake: [
      { row: 2, col: 2 },
      { row: 2, col: 1 }
    ],
    direction: 'ArrowRight',
    pendingDirection: 'ArrowRight',
    score: 0,
    isGameOver: false,
    food: { row: 2, col: 3 }
  };

  const next = tick(state, () => 0);

  assert.equal(next.snake.length, 3);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, state.food);
});

test('queueDirection ignores direct reversal', () => {
  const state = createInitialState(8, 8);
  const next = queueDirection(state, 'ArrowLeft');

  assert.equal(next.pendingDirection, 'ArrowRight');
});

test('game over when hitting wall', () => {
  const state = {
    rows: 4,
    cols: 4,
    snake: [{ row: 0, col: 0 }],
    direction: 'ArrowUp',
    pendingDirection: 'ArrowUp',
    score: 0,
    isGameOver: false,
    food: { row: 3, col: 3 }
  };

  const next = tick(state, () => 0);
  assert.equal(next.isGameOver, true);
});

test('food placement avoids snake cells', () => {
  const snake = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 1 }
  ];

  const food = placeFood(snake, 2, 2, () => 0);
  assert.deepEqual(food, { row: 1, col: 0 });
});
