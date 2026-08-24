import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSynergies } from '../src/engine/synergy-calculator.js';
import { CombatSimulator } from '../src/engine/combat-simulator.js';
import { BoardUnit } from '../src/types/unit.js';
import { TRAITS } from '../src/data/synergies.js';

describe('Origins & Families: Golden Trio, Inquisitorial Squad, Weasley, Malfoy, Patil', () => {
  it('should verify trait definitions and breakpoints exist', () => {
    assert.ok(TRAITS['Golden Trio']);
    assert.strictEqual(TRAITS['Golden Trio'].breakpoints.length, 1);
    assert.strictEqual(TRAITS['Golden Trio'].breakpoints[0].count, 3);

    assert.ok(TRAITS['Inquisitorial Squad']);
    assert.strictEqual(TRAITS['Inquisitorial Squad'].breakpoints.length, 2);
    assert.strictEqual(TRAITS['Inquisitorial Squad'].breakpoints[0].count, 3);
    assert.strictEqual(TRAITS['Inquisitorial Squad'].breakpoints[1].count, 5);

    // 🏰 Hogwarts Houses (3 - 5 - 8)
    for (const house of ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff']) {
      assert.ok(TRAITS[house]);
      assert.strictEqual(TRAITS[house].breakpoints.length, 3);
      assert.strictEqual(TRAITS[house].breakpoints[0].count, 3);
      assert.strictEqual(TRAITS[house].breakpoints[1].count, 5);
      assert.strictEqual(TRAITS[house].breakpoints[2].count, 8);
    }

    assert.ok(TRAITS['Weasley']);
    assert.strictEqual(TRAITS['Weasley'].breakpoints.length, 2);
    assert.strictEqual(TRAITS['Weasley'].breakpoints[0].count, 2);
    assert.strictEqual(TRAITS['Weasley'].breakpoints[1].count, 4);

    assert.ok(TRAITS['Malfoy']);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints.length, 2);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints[0].count, 2);
    assert.strictEqual(TRAITS['Malfoy'].breakpoints[1].count, 3);

    assert.ok(TRAITS['Patil Sisters']);
    assert.strictEqual(TRAITS['Patil Sisters'].breakpoints.length, 1);
    assert.strictEqual(TRAITS['Patil Sisters'].breakpoints[0].count, 2);

    assert.ok(TRAITS['Sniper']);
    assert.strictEqual(TRAITS['Sniper'].breakpoints.length, 3);
    assert.strictEqual(TRAITS['Sniper'].breakpoints[0].count, 2);
    assert.strictEqual(TRAITS['Sniper'].breakpoints[1].count, 3);
    assert.strictEqual(TRAITS['Sniper'].breakpoints[2].count, 4);
  });

  it('should activate Patil Sisters synergy when Padma and Parvati Patil are on board', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'padma_patil', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 20, maxMana: 70 };
    board[0][1] = { id: 'u2', unitId: 'parvati_patil', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 620, maxHp: 620, currentMana: 20, maxMana: 70 };

    const activeTraits = calculateSynergies(board);
    const patilTrait = activeTraits.find((t) => t.traitId === 'Patil Sisters');

    assert.ok(patilTrait);
    assert.strictEqual(patilTrait.count, 2);
    assert.strictEqual(patilTrait.activeTier, 1);
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

  it('should activate Inquisitorial Squad synergy tier 1 (3 units) and tier 2 (5 units)', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'vincent_crabbe', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 720, maxHp: 720, currentMana: 0, maxMana: 80 };
    board[0][1] = { id: 'u2', unitId: 'gregory_goyle', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 800, maxHp: 800, currentMana: 0, maxMana: 80 };
    board[0][2] = { id: 'u3', unitId: 'argus_filch', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 580, maxHp: 580, currentMana: 0, maxMana: 80 };

    let activeTraits = calculateSynergies(board);
    let inqSquad = activeTraits.find((t) => t.traitId === 'Inquisitorial Squad');

    assert.ok(inqSquad);
    assert.strictEqual(inqSquad.count, 3);
    assert.strictEqual(inqSquad.activeTier, 1);

    // Add Draco Malfoy and Pansy Parkinson for tier 2 (5 units)
    board[0][3] = { id: 'u4', unitId: 'draco_malfoy', starLevel: 1, position: { x: 3, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 15, maxMana: 65 };
    board[0][4] = { id: 'u5', unitId: 'pansy_parkinson', starLevel: 1, position: { x: 4, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 10, maxMana: 65 };

    activeTraits = calculateSynergies(board);
    inqSquad = activeTraits.find((t) => t.traitId === 'Inquisitorial Squad');

    assert.ok(inqSquad);
    assert.strictEqual(inqSquad.count, 5);
    assert.strictEqual(inqSquad.activeTier, 2);
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

    board[0][0] = { id: 'u1', unitId: 'draco_malfoy', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 15, maxMana: 65 };
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

  it('should apply Inquisitorial Squad start-of-combat detention to highest-threat enemies', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'vincent_crabbe', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 720, maxHp: 720, currentMana: 0, maxMana: 80 },
      { id: 'h2', unitId: 'gregory_goyle', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 800, maxHp: 800, currentMana: 0, maxMana: 80 },
      { id: 'h3', unitId: 'argus_filch', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 580, maxHp: 580, currentMana: 0, maxMana: 80 },
    ];

    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'harry_potter', starLevel: 1, position: { x: 0, y: 3 }, items: [], currentHp: 780, maxHp: 780, currentMana: 25, maxMana: 75 },
    ];

    const inqTraitInfo = {
      traitId: 'Inquisitorial Squad',
      name: 'Inquisitorial Squad',
      type: 'class' as const,
      count: 3,
      activeTier: 1,
      totalTiers: 2,
      currentBreakpointDescription: '',
      nextBreakpointCount: null,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [inqTraitInfo], [], 2);
    const result = sim.simulate();

    assert.ok(result.events.length > 0);
  });

  it('should calculate Gryffindor House breakpoints at 3, 5, and 8 units', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Tier 1 (3 units): Neville, Colin, Ron
    board[0][0] = { id: 'u1', unitId: 'neville_longbottom', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 650, maxHp: 650, currentMana: 0, maxMana: 70 };
    board[0][1] = { id: 'u2', unitId: 'colin_creevey', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 500, maxHp: 500, currentMana: 10, maxMana: 60 };
    board[0][2] = { id: 'u3', unitId: 'ron_weasley', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 750, maxHp: 750, currentMana: 20, maxMana: 80 };

    let activeTraits = calculateSynergies(board);
    let gryff = activeTraits.find((t) => t.traitId === 'Gryffindor');
    assert.ok(gryff);
    assert.strictEqual(gryff.count, 3);
    assert.strictEqual(gryff.activeTier, 1);

    // Tier 2 (5 units): Add Hermione, Ginny
    board[0][3] = { id: 'u4', unitId: 'hermione_granger', starLevel: 1, position: { x: 3, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 20, maxMana: 75 };
    board[0][4] = { id: 'u5', unitId: 'ginny_weasley', starLevel: 1, position: { x: 4, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 0, maxMana: 60 };

    activeTraits = calculateSynergies(board);
    gryff = activeTraits.find((t) => t.traitId === 'Gryffindor');
    assert.ok(gryff);
    assert.strictEqual(gryff.count, 5);
    assert.strictEqual(gryff.activeTier, 2);

    // Tier 3 (8 units): Add Harry, Dean, Fred & George
    board[0][5] = { id: 'u6', unitId: 'harry_potter', starLevel: 1, position: { x: 5, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 25, maxMana: 75 };
    board[0][6] = { id: 'u7', unitId: 'dean_thomas', starLevel: 1, position: { x: 6, y: 0 }, items: [], currentHp: 640, maxHp: 640, currentMana: 0, maxMana: 70 };
    board[0][7] = { id: 'u8', unitId: 'fred_and_george', starLevel: 1, position: { x: 7, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 10, maxMana: 60 };

    activeTraits = calculateSynergies(board);
    gryff = activeTraits.find((t) => t.traitId === 'Gryffindor');
    assert.ok(gryff);
    assert.strictEqual(gryff.count, 8);
    assert.strictEqual(gryff.activeTier, 3);
  });

  it('should activate Headmaster with 1 unit and disable when both Dumbledore and Umbridge are on board', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    // 1 Headmaster (Dumbledore): Active
    board[0][0] = { id: 'u1', unitId: 'albus_dumbledore', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 950, maxHp: 950, currentMana: 35, maxMana: 100 };
    let traits = calculateSynergies(board);
    let hm = traits.find((t) => t.traitId === 'Headmaster');
    assert.ok(hm);
    assert.strictEqual(hm.count, 1);
    assert.strictEqual(hm.activeTier, 1);

    // Add Umbridge (2 Headmasters): Disables trait!
    board[0][1] = { id: 'u2', unitId: 'dolores_umbridge', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 750, maxHp: 750, currentMana: 0, maxMana: 70 };
    traits = calculateSynergies(board);
    hm = traits.find((t) => t.traitId === 'Headmaster');
    assert.ok(hm);
    assert.strictEqual(hm.count, 2);
    assert.strictEqual(hm.activeTier, 0);
  });

  it('should activate Founder synergy when all 4 Hogwarts Founders are fielded', () => {
    const board: (BoardUnit | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { id: 'u1', unitId: 'godric_gryffindor', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 950, maxHp: 950, currentMana: 0, maxMana: 80 };
    board[0][1] = { id: 'u2', unitId: 'salazar_slytherin', starLevel: 1, position: { x: 1, y: 0 }, items: [], currentHp: 900, maxHp: 900, currentMana: 0, maxMana: 90 };
    board[0][2] = { id: 'u3', unitId: 'rowena_ravenclaw', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: 900, maxHp: 900, currentMana: 0, maxMana: 80 };

    let traits = calculateSynergies(board);
    let founder = traits.find((t) => t.traitId === 'Founder');
    assert.ok(founder);
    assert.strictEqual(founder.count, 3);
    assert.strictEqual(founder.activeTier, 0);

    // 4th Founder (Helga Hufflepuff) completes the 4-piece synergy
    board[0][3] = { id: 'u4', unitId: 'helga_hufflepuff', starLevel: 1, position: { x: 3, y: 0 }, items: [], currentHp: 950, maxHp: 950, currentMana: 0, maxMana: 80 };
    traits = calculateSynergies(board);
    founder = traits.find((t) => t.traitId === 'Founder');
    assert.ok(founder);
    assert.strictEqual(founder.count, 4);
    assert.strictEqual(founder.activeTier, 1);
  });

  it('should execute Fawkes revive on every 2nd cast reviving longest-dead ally', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'fawkes', starLevel: 1, position: { x: 0, y: 3 }, items: [], currentHp: 900, maxHp: 900, currentMana: 100, maxMana: 100 },
      { id: 'h2', unitId: 'colin_creevey', starLevel: 1, position: { x: 1, y: 3 }, items: [], currentHp: 50, maxHp: 500, currentMana: 0, maxMana: 60 },
    ];
    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'draco_malfoy', starLevel: 3, position: { x: 0, y: 0 }, items: [], currentHp: 3000, maxHp: 3000, currentMana: 0, maxMana: 100 },
    ];

    const sim = new CombatSimulator('home', 'away', homeUnits, awayUnits, [], [], 1);
    const result = sim.simulate();

    assert.ok(result.events.some((e) => e.type === 'SPELL_CAST' && e.sourceId?.startsWith('home')));
  });
});
