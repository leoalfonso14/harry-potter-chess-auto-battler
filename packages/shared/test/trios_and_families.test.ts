import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSynergies } from '../src/engine/synergy-calculator.js';
import { CombatSimulator } from '../src/engine/combat-simulator.js';
import { BoardUnit } from '../types/unit.js';
import { TRAITS } from '../src/data/synergies.js';

describe('New Origins: Golden Trio, Slytherin Trio, Weasley Family, Malfoy Family', () => {
  it('should verify trait definitions and breakpoints exist', () => {
    assert.ok(TRAITS['Golden Trio']);
    assert.strictEqual(TRAITS['Golden Trio'].breakpoints.length, 1);
    assert.strictEqual(TRAITS['Golden Trio'].breakpoints[0].count, 3);

    assert.ok(TRAITS['Slytherin Trio']);
    assert.strictEqual(TRAITS['Slytherin Trio'].breakpoints.length, 1);
    assert.strictEqual(TRAITS['Slytherin Trio'].breakpoints[0].count, 3);

    assert.ok(TRAITS['Weasley']);
    assert.strictEqual(TRAITS['Weasley'].breakpoints.length, 2);
    assert.strictEqual(TRAITS['Weasley'].breakpoints[0].count, 2);
    assert.strictEqual(TRAITS['Weasley'].breakpoints[1].count, 4);

    assert.ok(TRAITS['Malfoy']);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints.length, 2);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints[0].count, 2);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints[1].count, 3);
  });

  it('should activate Golden Trio synergy when Harry, Hermione, and Ron are on board', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'harry_potter', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 25, maxMana: 75 };
    board[0][1] = { id: 'u2', unitId: 'hermione_granger', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 20, maxMana: 75 };
    board[0][2] = { id: 'u3', unitId: 'ron_weasley', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 750, maxHp: 750, currentMana: 20, maxMana: 80 };

    const activeTraits = calculateSynergies(board);
    const goldenTrio = activeTraits.find((t) => t.traitId === 'Golden Trio');

    assert.ok(goldenTrio);
    assert.strictEqual(goldenTrio.count, 3);
    assert.strictEqual(goldenTrio.activeTier, 1);
  });

  it('should activate Slytherin Trio synergy when Draco, Crabbe, and Goyle are on board', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'draco_malfoy', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 520, maxHp: 520, currentMana: 10, maxMana: 60 };
    board[0][1] = { id: 'u2', unitId: 'vincent_crabbe', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 720, maxHp: 720, currentMana: 0, maxMana: 80 };
    board[0][2] = { id: 'u3', unitId: 'gregory_goyle', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 700, maxHp: 700, currentMana: 0, maxMana: 80 };

    const activeTraits = calculateSynergies(board);
    const slytherinTrio = activeTraits.find((t) => t.traitId === 'Slytherin Trio');

    assert.ok(slytherinTrio);
    assert.strictEqual(slytherinTrio.count, 3);
    assert.strictEqual(slytherinTrio.activeTier, 1);
  });

  it('should calculate Weasley family tier 1 and tier 2 breakpoints', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'ron_weasley', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 750, maxHp: 750, currentMana: 20, maxMana: 80 };
    board[0][1] = { id: 'u2', unitId: 'ginny_weasley', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 0, maxMana: 60 };

    let activeTraits = calculateSynergies(board);
    let weasleyTrait = activeTraits.find((t) => t.traitId === 'Weasley');
    assert.ok(weasleyTrait);
    assert.strictEqual(weasleyTrait.count, 2);
    assert.strictEqual(weasleyTrait.activeTier, 1);

    // Add Fred & George and Molly Weasley for tier 2
    board[0][2] = { id: 'u3', unitId: 'fred_and_george', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 10, maxMana: 60 };
    board[0][3] = { id: 'u4', unitId: 'molly_weasley', starLevel: 1, position: { x: 3, y: 0 }, items: [], currentHp: 1200, maxHp: 1200, currentMana: 30, maxMana: 80 };

    activeTraits = calculateSynergies(board);
    weasleyTrait = activeTraits.find((t) => t.traitId === 'Weasley');
    assert.ok(weasleyTrait);
    assert.strictEqual(weasleyTrait.count, 4);
    assert.strictEqual(weasleyTrait.activeTier, 2);
  });

  it('should calculate Malfoy family tier 1 and tier 2 breakpoints', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'draco_malfoy', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 520, maxHp: 520, currentMana: 10, maxMana: 60 };
    board[0][1] = { id: 'u2', unitId: 'lucius_malfoy', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 1200, maxHp: 1200, currentMana: 20, maxMana: 75 };

    let activeTraits = calculateSynergies(board);
    let malfoyTrait = activeTraits.find((t) => t.traitId === 'Malfoy');
    assert.ok(malfoyTrait);
    assert.strictEqual(malfoyTrait.count, 2);
    assert.strictEqual(malfoyTrait.activeTier, 1);

    // Add Narcissa Malfoy for tier 2
    board[0][2] = { id: 'u3', unitId: 'narcissa_malfoy', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 800, maxHp: 800, currentMana: 20, maxMana: 70 };

    activeTraits = calculateSynergies(board);
    malfoyTrait = activeTraits.find((t) => t.traitId === 'Malfoy');
    assert.ok(malfoyTrait);
    assert.strictEqual(malfoyTrait.count, 3);
    assert.strictEqual(malfoyTrait.activeTier, 2);
  });

  it('should apply Malfoy start of combat bribes (smSunder & smShred) to enemies in combat simulator', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'draco_malfoy', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 520, maxHp: 520, currentMana: 10, maxMana: 60 },
      { id: 'h2', unitId: 'lucius_malfoy', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 1200, maxHp: 1200, currentMana: 20, maxMana: 75 },
    ];

    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'neville_longbottom', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 650, maxHp: 650, currentMana: 0, maxMana: 70 },
    ];

    const malfoyTraitInfo = {
      traitId: 'Malfoy',
      name: 'Malfoy',
      type: 'origin' as const,
      count: 2,
      activeTier: 1,
      totalTiers: 2,
      currentBreakpointDescription: '',
      nextBreakpointCount: null,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [malfoyTraitInfo], [], 2);
    const result = sim.simulate();

    assert.ok(result.events.length > 0);
  });

  it('should disable both Golden Trio and Slytherin Trio if all 6 units are fielded together', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Field all 3 Golden Trio
    board[0][0] = { id: 'u1', unitId: 'harry_potter', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 620, maxHp: 620, currentMana: 20, maxMana: 70 };
    board[0][1] = { id: 'u2', unitId: 'hermione_granger', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 540, maxHp: 540, currentMana: 30, maxMana: 80 };
    board[0][2] = { id: 'u3', unitId: 'ron_weasley', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 750, maxHp: 750, currentMana: 20, maxMana: 80 };

    // Field all 3 Slytherin Trio
    board[1][0] = { id: 'u4', unitId: 'draco_malfoy', starLevel: 1, position: { x: 0, y: 1 }, items: [], currentHp: 520, maxHp: 520, currentMana: 10, maxMana: 60 };
    board[1][1] = { id: 'u5', unitId: 'vincent_crabbe', starLevel: 1, position: { x: 1, y: 1 }, items: [], currentHp: 720, maxHp: 720, currentMana: 0, maxMana: 80 };
    board[1][2] = { id: 'u6', unitId: 'gregory_goyle', starLevel: 1, position: { x: 2, y: 1 }, items: [], currentHp: 700, maxHp: 700, currentMana: 0, maxMana: 80 };

    const activeTraits = calculateSynergies(board);
    const goldenTrio = activeTraits.find((t) => t.traitId === 'Golden Trio');
    const slytherinTrio = activeTraits.find((t) => t.traitId === 'Slytherin Trio');

    // Both must be deactivated (activeTier 0)
    assert.strictEqual(goldenTrio?.activeTier || 0, 0);
    assert.strictEqual(slytherinTrio?.activeTier || 0, 0);
  });
});
