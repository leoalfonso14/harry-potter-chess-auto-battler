import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UnitPool, SHOP_ODDS, INITIAL_POOL_COUNTS } from '../src/engine/pool.js';
import { UNITS } from '../src/data/units.js';

describe('UnitPool and Shop Generation', () => {
  it('should initialize with correct pool counts per tier', () => {
    const pool = new UnitPool();
    const counts = pool.getPoolCountsByCost();

    const expectedCost1 = Object.values(UNITS).filter(u => u.cost === 1 && !u.origins.includes('Wild')).length * INITIAL_POOL_COUNTS[1];
    const expectedCost5 = Object.values(UNITS).filter(u => u.cost === 5 && !u.origins.includes('Wild')).length * INITIAL_POOL_COUNTS[5];

    assert.strictEqual(counts[1].total, expectedCost1);
    assert.strictEqual(counts[5].total, expectedCost5);
  });

  it('should draw exact count of 5 units and decrement pool', () => {
    const pool = new UnitPool();
    const initialNevilleCount = pool.getAvailableCount('neville_longbottom');

    const shop = pool.drawShop(3, 5);
    assert.strictEqual(shop.length, 5);

    // If neville_longbottom was in shop, its count should decrease
    const drawnNevilles = shop.filter(id => id === 'neville_longbottom').length;
    const newCount = pool.getAvailableCount('neville_longbottom');
    assert.strictEqual(newCount, initialNevilleCount - drawnNevilles);
  });

  it('should return copies correctly to pool when units are sold', () => {
    const pool = new UnitPool();
    const initialCount = pool.getAvailableCount('ron_weasley');

    // 1-star returns 1 copy
    pool.returnToPool('ron_weasley', 1);
    assert.strictEqual(pool.getAvailableCount('ron_weasley'), initialCount + 1);

    // 2-star returns 3 copies (3^1)
    pool.returnToPool('ron_weasley', 2);
    assert.strictEqual(pool.getAvailableCount('ron_weasley'), initialCount + 4);

    // 3-star returns 9 copies (3^2)
    pool.returnToPool('ron_weasley', 3);
    assert.strictEqual(pool.getAvailableCount('ron_weasley'), initialCount + 13);
  });

  it('should only roll 1-cost and 2-cost units at level 3', () => {
    const pool = new UnitPool();
    for (let i = 0; i < 50; i++) {
      const shop = pool.drawShop(3, 5);
      for (const unitId of shop) {
        const unit = UNITS[unitId];
        assert.ok(unit.cost === 1 || unit.cost === 2, `Unit ${unit.name} of cost ${unit.cost} should not appear at Level 3`);
      }
    }
  });
});
