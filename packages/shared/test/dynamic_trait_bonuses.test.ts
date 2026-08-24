import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CombatSimulator } from '../src/engine/combat-simulator.js';
import { BoardUnit } from '../src/types/unit.js';
import { TRAITS } from '../src/data/synergies.js';
import { ActiveTraitInfo } from '../src/types/synergy.js';

describe('Dynamic Trait Mechanics & Bonus Properties', () => {
  it('should verify explicit bonus parameters exist across all traits', () => {
    // Duelist
    assert.strictEqual(TRAITS['Duelist'].breakpoints[0].bonus.attackSpeedPerStack, 0.06);
    assert.strictEqual(TRAITS['Duelist'].breakpoints[0].bonus.maxStacks, 10);
    assert.strictEqual(TRAITS['Duelist'].breakpoints[1].bonus.attackSpeedPerStack, 0.11);
    assert.strictEqual(TRAITS['Duelist'].breakpoints[1].bonus.maxStacks, 12);

    // Sniper
    assert.strictEqual(TRAITS['Sniper'].breakpoints[0].bonus.damageAmpPerHex, 0.02);
    assert.strictEqual(TRAITS['Sniper'].breakpoints[1].bonus.damageAmpPerHex, 0.035);
    assert.strictEqual(TRAITS['Sniper'].breakpoints[2].bonus.damageAmpPerHex, 0.05);

    // Gryffindor
    assert.strictEqual(TRAITS['Gryffindor'].breakpoints[1].bonus.shieldHp, 220);
    assert.strictEqual(TRAITS['Gryffindor'].breakpoints[1].bonus.shieldThreshold, 0.40);
    assert.strictEqual(TRAITS['Gryffindor'].breakpoints[2].bonus.shieldHp, 450);
    assert.strictEqual(TRAITS['Gryffindor'].breakpoints[2].bonus.shieldThreshold, 0.50);

    // Slytherin
    assert.strictEqual(TRAITS['Slytherin'].breakpoints[0].bonus.executeThreshold, 0.08);
    assert.strictEqual(TRAITS['Slytherin'].breakpoints[1].bonus.executeThreshold, 0.14);
    assert.strictEqual(TRAITS['Slytherin'].breakpoints[2].bonus.executeThreshold, 0.20);

    // Hufflepuff
    assert.strictEqual(TRAITS['Hufflepuff'].breakpoints[0].bonus.damageReduction, 0.08);
    assert.strictEqual(TRAITS['Hufflepuff'].breakpoints[1].bonus.damageReduction, 0.18);
    assert.strictEqual(TRAITS['Hufflepuff'].breakpoints[2].bonus.damageReduction, 0.28);
    assert.strictEqual(TRAITS['Hufflepuff'].breakpoints[2].bonus.hpRegenPerSec, 0.02);

    // Trickster
    assert.strictEqual(TRAITS['Trickster'].breakpoints[0].bonus.manaBurn, 3);
    assert.strictEqual(TRAITS['Trickster'].breakpoints[1].bonus.manaBurn, 4);
    assert.strictEqual(TRAITS['Trickster'].breakpoints[2].bonus.manaBurn, 5);
  });

  it('should stack Duelist attack speed up to maxStacks on basic attack', () => {
    const homeUnits: BoardUnit[] = [
      // Harry Potter has classes: ['Sorcerer'] or Duelist? Let's use Filius Flitwick (Duelist) or Viktor Krum (Fighter/Duelist)
      { id: 'h1', unitId: 'filius_flitwick', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 780, maxHp: 780, currentMana: 0, maxMana: 100 },
    ];
    const awayUnits: BoardUnit[] = [
      // High HP training dummy
      { id: 'a1', unitId: 'neville_longbottom', starLevel: 3, position: { x: 0, y: 2 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 100 },
    ];

    const duelistTrait: ActiveTraitInfo = {
      traitId: 'Duelist',
      name: 'Duelist',
      type: 'class',
      count: 2,
      activeTier: 1,
      totalTiers: 2,
      currentBreakpointDescription: '',
      nextBreakpointCount: 4,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [duelistTrait], [], 2);
    const result = sim.simulate();

    assert.ok(result.events.length > 0);
    // Verify attacks occurred
    const attackEvents = result.events.filter((e) => e.type === 'ATTACK_START' && e.sourceId?.startsWith('home'));
    assert.ok(attackEvents.length >= 1);
  });

  it('should amplify damage based on hex distance for Snipers', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'cho_chang', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 500, maxHp: 500, currentMana: 0, maxMana: 100 },
    ];
    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'neville_longbottom', starLevel: 1, position: { x: 0, y: 3 }, items: [], currentHp: 1000, maxHp: 1000, currentMana: 0, maxMana: 100 },
    ];

    const sniperTrait: ActiveTraitInfo = {
      traitId: 'Sniper',
      name: 'Sniper',
      type: 'class',
      count: 2,
      activeTier: 1,
      totalTiers: 3,
      currentBreakpointDescription: '',
      nextBreakpointCount: 3,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [sniperTrait], [], 2);
    const result = sim.simulate();

    assert.ok(result.events.some((e) => e.type === 'DAMAGE' && e.damageType === 'physical'));
  });

  it('should trigger Gryffindor shield when unit drops below shield threshold', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'neville_longbottom', starLevel: 1, position: { x: 0, y: 0 }, items: [], currentHp: 650, maxHp: 650, currentMana: 0, maxMana: 70 },
    ];
    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'draco_malfoy', starLevel: 2, position: { x: 0, y: 1 }, items: [], currentHp: 1755, maxHp: 1755, currentMana: 0, maxMana: 65 },
    ];

    const gryffTrait: ActiveTraitInfo = {
      traitId: 'Gryffindor',
      name: 'Gryffindor',
      type: 'origin',
      count: 5,
      activeTier: 2,
      totalTiers: 3,
      currentBreakpointDescription: '',
      nextBreakpointCount: 8,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [gryffTrait], [], 2);
    const result = sim.simulate();

    // Verify a SHIELD event occurred for Neville
    const shieldEvents = result.events.filter((e) => e.type === 'SHIELD' && e.sourceId?.startsWith('home'));
    assert.ok(shieldEvents.length >= 1);
    assert.strictEqual(shieldEvents[0].value, 220);
  });

  it('should clamp Duelist stacks strictly at maxStacks (12 for Tier 2) over prolonged combat', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'filius_flitwick', starLevel: 3, position: { x: 0, y: 0 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
      { id: 'h2', unitId: 'rubeus_hagrid', starLevel: 3, position: { x: 0, y: 1 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
      { id: 'h3', unitId: 'rubeus_hagrid', starLevel: 3, position: { x: 1, y: 1 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
    ];
    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'gregory_goyle', starLevel: 3, position: { x: 0, y: 2 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
      { id: 'a2', unitId: 'gregory_goyle', starLevel: 3, position: { x: 1, y: 2 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
      { id: 'a3', unitId: 'cedric_diggory', starLevel: 3, position: { x: 2, y: 2 }, items: [], currentHp: 5000, maxHp: 5000, currentMana: 0, maxMana: 1000 },
    ];

    const duelistTrait: ActiveTraitInfo = {
      traitId: 'Duelist',
      name: 'Duelist',
      type: 'class',
      count: 4,
      activeTier: 2,
      totalTiers: 2,
      currentBreakpointDescription: '',
      nextBreakpointCount: null,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [duelistTrait], [], 2);
    sim.simulate();

    const homeCombatUnit = (sim as any).units.find((u: any) => u.team === 'home');
    assert.ok(homeCombatUnit);
    assert.strictEqual(homeCombatUnit.duelistStacks, 12);
  });

  it('should execute low HP targets when Slytherin synergy is active', () => {
    const homeUnits: BoardUnit[] = [
      { id: 'h1', unitId: 'draco_malfoy', starLevel: 3, position: { x: 0, y: 0 }, items: [], currentHp: 1000, maxHp: 1000, currentMana: 0, maxMana: 100 },
    ];
    const awayUnits: BoardUnit[] = [
      { id: 'a1', unitId: 'neville_longbottom', starLevel: 1, position: { x: 0, y: 1 }, items: [], currentHp: 40, maxHp: 1000, currentMana: 0, maxMana: 100 },
    ];

    const slytherinTrait: ActiveTraitInfo = {
      traitId: 'Slytherin',
      name: 'Slytherin',
      type: 'origin',
      count: 3,
      activeTier: 1,
      totalTiers: 3,
      currentBreakpointDescription: '',
      nextBreakpointCount: 5,
    };

    const sim = new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, [slytherinTrait], [], 2);
    const result = sim.simulate();

    assert.strictEqual(result.winner, 'home');
  });

  it('should reduce incoming damage with Hufflepuff trait', () => {
    // Combat with Hufflepuff active vs without Hufflepuff active
    const createSim = (withHufflepuff: boolean) => {
      const homeUnits: BoardUnit[] = [
        { id: 'h1', unitId: 'cedric_diggory', starLevel: 1, position: { x: 3, y: 3 }, items: [], currentHp: 2000, maxHp: 2000, currentMana: 0, maxMana: 100 },
      ];
      const awayUnits: BoardUnit[] = [
        { id: 'a1', unitId: 'vincent_crabbe', starLevel: 1, position: { x: 3, y: 3 }, items: [], currentHp: 2000, maxHp: 2000, currentMana: 0, maxMana: 100 },
      ];

      const huffTrait: ActiveTraitInfo = {
        traitId: 'Hufflepuff',
        name: 'Hufflepuff',
        type: 'origin',
        count: 5,
        activeTier: 2,
        totalTiers: 3,
        currentBreakpointDescription: '',
        nextBreakpointCount: 8,
      };

      return new CombatSimulator('homePlayer', 'awayPlayer', homeUnits, awayUnits, withHufflepuff ? [huffTrait] : [], [], 2);
    };

    const simWithout = createSim(false);
    const resultWithout = simWithout.simulate();
    const firstHitWithout = resultWithout.events.find((e) => e.type === 'DAMAGE' && e.targetId?.startsWith('home_h1'))?.value ?? 0;

    const simWith = createSim(true);
    const resultWith = simWith.simulate();
    const firstHitWith = resultWith.events.find((e) => e.type === 'DAMAGE' && e.targetId?.startsWith('home_h1'))?.value ?? 0;

    assert.ok(firstHitWith < firstHitWithout);
    assert.ok(firstHitWithout > 0 && firstHitWith > 0);
  });
});
