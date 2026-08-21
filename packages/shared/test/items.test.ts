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

    // Check Pensieve Crystal (Mana Gem) stats
    assert.equal(BASE_ITEMS['mana_gem'].stats.startingMana, 15);
    assert.equal(BASE_ITEMS['mana_gem'].stats.manaPerSecond, 5);
  });

  it('should have 36 crafted artifacts defined', () => {
    const artifactKeys = Object.keys(ARTIFACT_ITEMS);
    assert.equal(artifactKeys.length, 36);
  });

  it('should combine Pensieve Crystal with all components correctly', () => {
    // Pensieve Crystal + Pensieve Crystal = The Goblet of Fire
    const goblet = combineItems('mana_gem', 'mana_gem');
    assert.ok(goblet);
    assert.equal(goblet.id, 'goblet_of_fire');

    // Pensieve Crystal + Wand Core = Dumbledore's Deluminator
    const deluminator = combineItems('mana_gem', 'wand_core');
    assert.ok(deluminator);
    assert.equal(deluminator.id, 'deluminator');

    // Pensieve Crystal + Basilisk Fang = Godric's Dueling Lance
    const lance = combineItems('mana_gem', 'basilisk_fang');
    assert.ok(lance);
    assert.equal(lance.id, 'godric_lance');

    // Pensieve Crystal + Golden Snitch Shard = Hermione's Time-Turner
    const timeTurner = combineItems('mana_gem', 'golden_snitch_shard');
    assert.ok(timeTurner);
    assert.equal(timeTurner.id, 'time_turner');

    // Pensieve Crystal + Dragon Scale = Azkaban Dementor's Frost
    const dementorFrost = combineItems('mana_gem', 'dragon_scale');
    assert.ok(dementorFrost);
    assert.equal(dementorFrost.id, 'dementors_frost');

    // Pensieve Crystal + Mandrake Leaf = Mandrake Restorative Draught
    const draught = combineItems('mana_gem', 'mandrake_leaf');
    assert.ok(draught);
    assert.equal(draught.id, 'mandrake_draught');

    // Pensieve Crystal + Phoenix Feather = Order's Phoenix Beacon
    const beacon = combineItems('mana_gem', 'phoenix_feather');
    assert.ok(beacon);
    assert.equal(beacon.id, 'phoenix_beacon');

    // Pensieve Crystal + Quicksilver = Storm-Charmed Wand of Grindelwald
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
});
