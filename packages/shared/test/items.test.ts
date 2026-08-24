import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE_ITEMS, ARTIFACT_ITEMS, ALL_ITEMS, combineItems, BaseItemId } from '../src/data/items.js';

describe('Item Synthesis & Combination Matrix', () => {
  it('should have 8 base items defined with valid stats', () => {
    const baseKeys = Object.keys(BASE_ITEMS) as BaseItemId[];
    assert.equal(baseKeys.length, 8);
    assert.ok(BASE_ITEMS['mana_gem']);
    assert.ok(BASE_ITEMS['basilisk_fang']);
    assert.ok(BASE_ITEMS['golden_snitch_shard']);
    assert.ok(BASE_ITEMS['wand_core']);
    assert.ok(BASE_ITEMS['dragon_scale']);
    assert.ok(BASE_ITEMS['mandrake_leaf']);
    assert.ok(BASE_ITEMS['phoenix_feather']);
    assert.ok(BASE_ITEMS['quicksilver']);

    // Check Pensieve Tear (mana_gem) stats
    assert.equal(BASE_ITEMS['mana_gem'].name, 'Pensieve Tear');
    assert.equal(BASE_ITEMS['mana_gem'].stats.startingMana, 8);
    assert.equal(BASE_ITEMS['mana_gem'].stats.manaPerSecond, 2);
  });

  it('should have 36 crafted completed items defined', () => {
    const artifactKeys = Object.keys(ARTIFACT_ITEMS);
    assert.equal(artifactKeys.length, 36);
  });

  it('should combine Pensieve Tear with all components correctly', () => {
    // Pensieve Tear + Pensieve Tear = The Goblet of Fire
    const goblet = combineItems('mana_gem', 'mana_gem');
    assert.ok(goblet);
    assert.equal(goblet.id, 'goblet_of_fire');

    // Pensieve Tear + Wand Core = Dumbledore's Deluminator
    const deluminator = combineItems('mana_gem', 'wand_core');
    assert.ok(deluminator);
    assert.equal(deluminator.id, 'deluminator');

    // Pensieve Tear + Basilisk Fang = Godric's Dueling Lance
    const lance = combineItems('mana_gem', 'basilisk_fang');
    assert.ok(lance);
    assert.equal(lance.id, 'godric_lance');

    // Pensieve Tear + Golden Snitch Shard = Hermione's Time-Turner
    const timeTurner = combineItems('mana_gem', 'golden_snitch_shard');
    assert.ok(timeTurner);
    assert.equal(timeTurner.id, 'time_turner');

    // Pensieve Tear + Dragon Scale = Azkaban Dementor's Frost
    const dementorFrost = combineItems('mana_gem', 'dragon_scale');
    assert.ok(dementorFrost);
    assert.equal(dementorFrost.id, 'dementors_frost');

    // Pensieve Tear + Mandrake Leaf = Mandrake Restorative Draught
    const draught = combineItems('mana_gem', 'mandrake_leaf');
    assert.ok(draught);
    assert.equal(draught.id, 'mandrake_draught');

    // Pensieve Tear + Phoenix Feather = Order's Phoenix Beacon
    const beacon = combineItems('mana_gem', 'phoenix_feather');
    assert.ok(beacon);
    assert.equal(beacon.id, 'phoenix_beacon');

    // Pensieve Tear + Quicksilver = Grindelwald's Storm Wand
    const stormWand = combineItems('mana_gem', 'quicksilver');
    assert.ok(stormWand);
    assert.equal(stormWand.id, 'storm_wand');
  });

  it('should resolve reverse recipes identically', () => {
    const r1 = combineItems('wand_core', 'basilisk_fang');
    const r2 = combineItems('basilisk_fang', 'wand_core');
    assert.ok(r1);
    assert.ok(r2);
    assert.equal(r1.id, r2.id);
    assert.equal(r1.id, 'sword_of_gryffindor');
  });

  it('should verify signature lore item affinity definitions', () => {
    const sword = ARTIFACT_ITEMS['sword_of_gryffindor'];
    assert.ok(sword.signatureUnits?.includes('godric_gryffindor'));

    const diademWand = ARTIFACT_ITEMS['spell_weaver_wand'];
    assert.ok(diademWand.signatureUnits?.includes('rowena_ravenclaw'));

    const poisonBlade = ARTIFACT_ITEMS['slytherin_blade'];
    assert.ok(poisonBlade.signatureUnits?.includes('salazar_slytherin'));

    const cup = ARTIFACT_ITEMS['hufflepuff_cup'];
    assert.ok(cup.signatureDescription?.includes('All Hufflepuff'));

    const crest = ARTIFACT_ITEMS['aegis_of_order'];
    assert.ok(crest.signatureDescription?.includes('All Order of the Phoenix'));

    // Universal items should not have restrictive signature unit lists
    const firebolt = ARTIFACT_ITEMS['firebolt_striker'];
    assert.equal(firebolt.signatureUnits, undefined);
  });
});
