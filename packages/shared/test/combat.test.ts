import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CombatSimulator } from '../src/engine/combat-simulator.js';
import { BoardUnit } from '../src/types/unit.js';

describe('Deterministic Combat Simulator', () => {
  it('should run deterministic combat and resolve a winner', () => {
    const homeUnits: BoardUnit[] = [
      {
        id: 'h1',
        unitId: 'neville_longbottom',
        starLevel: 2,
        position: { x: 3, y: 3 },
        items: ['elder_focus'],
        currentHp: 1170,
        maxHp: 1170,
        currentMana: 40,
        maxMana: 90,
      },
      {
        id: 'h2',
        unitId: 'cho_chang',
        starLevel: 2,
        position: { x: 3, y: 0 },
        items: ['rapidfire_tempest'],
        currentHp: 900,
        maxHp: 900,
        currentMana: 0,
        maxMana: 70,
      },
    ];

    const awayUnits: BoardUnit[] = [
      {
        id: 'a1',
        unitId: 'neville_longbottom',
        starLevel: 1,
        position: { x: 3, y: 3 },
        items: [],
        currentHp: 650,
        maxHp: 650,
        currentMana: 40,
        maxMana: 90,
      },
    ];

    const sim = new CombatSimulator('playerHome', 'playerAway', homeUnits, awayUnits, [], [], 2);
    const result = sim.simulate();

    assert.ok(result.events.length > 0);
    assert.strictEqual(result.winner, 'home');
    assert.ok(result.damageToLoser > 0);
    assert.strictEqual(result.awaySurvivors, 0);
    assert.ok(result.homeSurvivors >= 1);
  });

  it('should ensure non-stacking single application of Sunder and Shred', () => {
    const homeUnits: BoardUnit[] = [
      {
        id: 'h1',
        unitId: 'gregory_goyle',
        starLevel: 1,
        position: { x: 3, y: 3 },
        items: [],
        currentHp: 750,
        maxHp: 750,
        currentMana: 0,
        maxMana: 90,
      },
    ];

    const sim = new CombatSimulator('playerHome', 'playerAway', homeUnits, [], [], [], 1);
    const unit = (sim as any).units[0];
    const initialBaseArmor = unit.baseArmor; // 40 armor
    const initialBaseMR = unit.baseMagicResist; // 25 MR

    // Apply smSunder (-20%)
    sim.applyStatusEffect(unit, 'smSunder', 5, 0.20);
    assert.strictEqual(unit.armor, Math.round(initialBaseArmor * 0.8)); // 32

    // Reapply smSunder: should refresh timer and NOT double-sunder
    sim.applyStatusEffect(unit, 'smSunder', 5, 0.20);
    assert.strictEqual(unit.armor, Math.round(initialBaseArmor * 0.8)); // Still 32, not 26!

    // Apply major sunder (-30%): should take priority over smSunder, never multiply together
    sim.applyStatusEffect(unit, 'sunder', 5, 0.30);
    assert.strictEqual(unit.armor, Math.round(initialBaseArmor * 0.7)); // 28, not 22!

    // Test Shred: smShred (-20%)
    sim.applyStatusEffect(unit, 'smShred', 5, 0.20);
    assert.strictEqual(unit.magicResist, Math.round(initialBaseMR * 0.8)); // 20

    // Apply major shred (-30%): should override smShred
    sim.applyStatusEffect(unit, 'shred', 5, 0.30);
    assert.strictEqual(unit.magicResist, Math.round(initialBaseMR * 0.7)); // 18
  });

  it('should verify Moaning Myrtle stats, targeting and Kreacher origins', async () => {
    const { UNITS } = await import('../src/data/units.js');
    const myrtle = UNITS['moaning_myrtle'];
    assert.ok(myrtle);
    assert.strictEqual(myrtle.stats.maxMana, 120);
    assert.strictEqual(myrtle.stats.startingMana, 40);
    assert.strictEqual(myrtle.ability.manaCost, 120);
    assert.strictEqual(myrtle.ability.targetType, 'aoe');
    assert.strictEqual(myrtle.ability.radius, 2);

    const kreacher = UNITS['kreacher'];
    assert.ok(kreacher);
    assert.deepStrictEqual(kreacher.origins, ['House-Elf']);
    assert.strictEqual(kreacher.origins.includes('Slytherin' as any), false);
  });

  it('should track damage dealt, damage taken, mitigation and shielding in combat summaries', () => {
    const homeUnits: BoardUnit[] = [
      {
        id: 'h1',
        unitId: 'cedric_diggory',
        starLevel: 2,
        position: { x: 3, y: 3 },
        items: [],
        currentHp: 1200,
        maxHp: 1200,
        currentMana: 60,
        maxMana: 60,
      },
    ];

    const awayUnits: BoardUnit[] = [
      {
        id: 'a1',
        unitId: 'gregory_goyle',
        starLevel: 2,
        position: { x: 3, y: 3 },
        items: [],
        currentHp: 1350,
        maxHp: 1350,
        currentMana: 0,
        maxMana: 90,
      },
    ];

    const sim = new CombatSimulator('playerHome', 'playerAway', homeUnits, awayUnits, [], [], 2);
    const result = sim.simulate();

    assert.ok(result.durationTicks > 0);
    const homeSummaries = Object.values(result.homeUnitSummaries);
    const awaySummaries = Object.values(result.awayUnitSummaries);

    assert.strictEqual(homeSummaries.length, 1);
    assert.strictEqual(awaySummaries.length, 1);

    const cedric = homeSummaries[0];
    const goyle = awaySummaries[0];

    assert.ok(cedric.damageDealt > 0);
    assert.ok(goyle.damageDealt > 0);
    assert.ok(cedric.damageTaken > 0);
    assert.ok(goyle.damageTaken > 0);
    assert.ok(cedric.physicalMitigated >= 0);
    assert.ok(goyle.physicalMitigated >= 0);
    assert.strictEqual(cedric.totalMitigated, cedric.physicalMitigated + cedric.magicMitigated);
    assert.strictEqual(goyle.totalMitigated, goyle.physicalMitigated + goyle.magicMitigated);
    assert.ok(cedric.shielding >= 0);
  });
});
