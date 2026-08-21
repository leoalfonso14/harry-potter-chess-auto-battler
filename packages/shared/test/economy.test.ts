import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateBaseIncome,
  calculateInterest,
  calculateStreakBonus,
  calculateRoundIncome,
  addPlayerXp,
  XP_TO_LEVEL,
} from '../src/engine/economy.js';
import { PlayerState } from '../types/game.js';

function createMockPlayer(level = 1, xp = 0, gold = 0): PlayerState {
  return {
    id: 'p1',
    name: 'Player 1',
    isBot: false,
    health: 100,
    gold,
    level,
    xp,
    xpToNextLevel: XP_TO_LEVEL[level],
    streak: 0,
    board: Array(4).fill(null).map(() => Array(8).fill(null)),
    bench: Array(9).fill(null),
    itemBench: Array(10).fill(null),
    shopUnits: Array(5).fill(null),
    shopLocked: false,
    activeTraits: [],
    isEliminated: false,
    placement: 0,
    opponentId: null,
  };
}

describe('Economy System', () => {
  it('should calculate base income progression', () => {
    assert.strictEqual(calculateBaseIncome(1), 3); // Stage 1
    assert.strictEqual(calculateBaseIncome(2), 4); // Stage 2 (slowed down)
    assert.strictEqual(calculateBaseIncome(3), 5); // Stage 3+
    assert.strictEqual(calculateBaseIncome(4), 5);
  });

  it('should calculate interest capped at 5 gold (50+ gold held)', () => {
    assert.strictEqual(calculateInterest(0), 0);
    assert.strictEqual(calculateInterest(9), 0);
    assert.strictEqual(calculateInterest(10), 1);
    assert.strictEqual(calculateInterest(29), 2);
    assert.strictEqual(calculateInterest(50), 5);
    assert.strictEqual(calculateInterest(85), 5);
  });

  it('should calculate streak bonuses for win and loss streaks', () => {
    assert.strictEqual(calculateStreakBonus(0), 0);
    assert.strictEqual(calculateStreakBonus(1), 0);
    assert.strictEqual(calculateStreakBonus(2), 1);
    assert.strictEqual(calculateStreakBonus(-3), 1);
    assert.strictEqual(calculateStreakBonus(4), 2);
    assert.strictEqual(calculateStreakBonus(-5), 3);
    assert.strictEqual(calculateStreakBonus(8), 3);
  });

  it('should calculate total round income accurately', () => {
    const resStage2 = calculateRoundIncome(2, 52, 4); // base 4 + interest 5 + streak 2 = 11
    assert.strictEqual(resStage2.base, 4);
    assert.strictEqual(resStage2.interest, 5);
    assert.strictEqual(resStage2.streak, 2);
    assert.strictEqual(resStage2.total, 11);

    const resStage3 = calculateRoundIncome(3, 52, 4); // base 5 + interest 5 + streak 2 = 12
    assert.strictEqual(resStage3.base, 5);
    assert.strictEqual(resStage3.interest, 5);
    assert.strictEqual(resStage3.streak, 2);
    assert.strictEqual(resStage3.total, 12);
  });

  it('should handle player XP addition and level progression', () => {
    const player = createMockPlayer(1, 0, 10);
    const leveled = addPlayerXp(player, 4);
    assert.strictEqual(leveled, true);
    // 4 XP: Level 1 (2 XP req) -> Level 2, Level 2 (2 XP req) -> Level 3 (0 XP remaining)
    assert.strictEqual(player.level, 3);
    assert.strictEqual(player.xp, 0);
  });
});
