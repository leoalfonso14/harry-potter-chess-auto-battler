import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkAndCombineUnits } from '../src/engine/economy.js';
import { PlayerState } from '../src/types/game.js';
import { BoardUnit } from '../src/types/unit.js';
import { XP_TO_LEVEL } from '../src/engine/economy.js';

function createMockPlayer(): PlayerState {
  return {
    id: 'p1',
    name: 'Player 1',
    isBot: false,
    health: 100,
    gold: 10,
    level: 3,
    xp: 0,
    xpToNextLevel: XP_TO_LEVEL[3],
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

describe('3-Star Combination Engine', () => {
  it('should combine 3 1-star units into a 2-star unit', () => {
    const player = createMockPlayer();

    // Place 1 unit on board and 2 on bench
    const u1: BoardUnit = {
      id: 'u1',
      unitId: 'neville_longbottom',
      starLevel: 1,
      position: { x: 2, y: 3 },
      items: ['wand_core'],
      currentHp: 650,
      maxHp: 650,
      currentMana: 40,
      maxMana: 90,
    };

    const u2: BoardUnit = {
      id: 'u2',
      unitId: 'neville_longbottom',
      starLevel: 1,
      position: { x: 0, y: 0 },
      items: ['dragon_scale'],
      currentHp: 650,
      maxHp: 650,
      currentMana: 40,
      maxMana: 90,
    };

    const u3: BoardUnit = {
      id: 'u3',
      unitId: 'neville_longbottom',
      starLevel: 1,
      position: { x: 1, y: 0 },
      items: [],
      currentHp: 650,
      maxHp: 650,
      currentMana: 40,
      maxMana: 90,
    };

    player.board[3][2] = u1;
    player.bench[0] = u2;
    player.bench[1] = u3;

    const result = checkAndCombineUnits(player);
    assert.strictEqual(result.combined, true);
    assert.ok(result.upgradedUnit);
    assert.strictEqual(result.upgradedUnit.starLevel, 2);
    assert.strictEqual(result.upgradedUnit.unitId, 'neville_longbottom');

    // Should be at board position (3, 2)
    assert.strictEqual(player.board[3][2]?.starLevel, 2);
    assert.strictEqual(player.bench[0], null);
    assert.strictEqual(player.bench[1], null);

    // Items from u1 and u2 should be combined on the upgraded unit
    assert.deepStrictEqual(result.upgradedUnit.items, ['wand_core', 'dragon_scale']);
  });
});
