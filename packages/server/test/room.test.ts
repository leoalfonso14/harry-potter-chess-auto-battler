import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AutoBattlerRoom } from '../src/rooms/AutoBattlerRoom.js';
import { UNITS } from '@autobattler/shared';

describe('AutoBattlerRoom Game Lifecycle & Stage System', () => {
  it('should initialize room and add player', () => {
    const room = new AutoBattlerRoom('test-room');
    assert.strictEqual(room.state.phase, 'LOBBY');

    const mockWs = {
      readyState: 1,
      send: () => {},
    } as any;

    room.addClient('p1', 'Player1', mockWs);
    assert.ok(room.state.players['p1']);
    assert.strictEqual(room.state.players['p1'].name, 'Player1');
    assert.strictEqual(room.state.players['p1'].health, 100);
  });

  it('should fill lobby with 7 bots, start with 0 gold, 1 starting unit on bench, and PvE mode', () => {
    const room = new AutoBattlerRoom('test-room-2');
    const mockWs = {
      readyState: 1,
      send: () => {},
    } as any;

    room.addClient('human_1', 'Champion', mockWs);
    room.startGame();

    assert.strictEqual(room.state.phase, 'PLANNING');
    assert.strictEqual(Object.keys(room.state.players).length, 8);
    const p = room.state.players['human_1'];
    assert.strictEqual(p.gold, 0);
    assert.strictEqual(p.shopUnits.length, 5);
    assert.strictEqual(room.state.isPveRound, true);

    // Should have 1 starting 1-cost unit on the bench (not deployed on board initially)
    assert.ok(p.bench[0] !== null);
    assert.strictEqual(p.bench[0]?.starLevel, 1);

    // Selling on first turn (Round 1-1) must be rejected
    assert.strictEqual(room.state.stage, 1);
    assert.strictEqual(room.state.roundInStage, 1);
    room.handleAction('human_1', { type: 'SELL_UNIT', source: 'bench', x: 0 });
    assert.ok(p.bench[0] !== null, 'Unit must not be sold on Round 1-1');
    assert.strictEqual(p.gold, 0);

    // Later rounds (e.g. Round 1-2): selling is permitted
    room.state.roundInStage = 2;
    room.handleAction('human_1', { type: 'SELL_UNIT', source: 'bench', x: 0 });
    assert.strictEqual(p.bench[0], null, 'Unit can be sold on Round 1-2+');
    assert.strictEqual(p.gold, 1);
  });

  it('should allow buying units and equipping items during COMBAT phase', () => {
    const room = new AutoBattlerRoom('test-room-combat-buy');
    const mockWs = { readyState: 1, send: () => {} } as any;

    room.addClient('p1', 'Player1', mockWs);
    room.startGame();

    const p = room.state.players['p1'];
    p.gold = 20;
    p.bench.fill(null);
    p.shopUnits[0] = 'neville_longbottom';
    p.itemBench[0] = 'wand_core';

    // Switch to COMBAT phase
    room.state.phase = 'COMBAT';

    // Buy unit during COMBAT
    room.handleAction('p1', { type: 'BUY_UNIT', shopSlot: 0 });
    assert.strictEqual(p.gold, 20 - UNITS['neville_longbottom'].cost);
    assert.ok(p.bench[0] !== null);
    assert.strictEqual(p.bench[0]?.unitId, 'neville_longbottom');

    // Equip item onto bench unit during COMBAT
    room.handleAction('p1', {
      type: 'EQUIP_ITEM',
      itemSlot: 0,
      target: { area: 'bench', x: 0 },
    });
    assert.strictEqual(p.itemBench[0], null);
    assert.deepStrictEqual(p.bench[0]?.items, ['wand_core']);
  });

  it('should auto-deploy bench units to board on combat start up to level capacity', () => {
    const room = new AutoBattlerRoom('test-room-4');
    const mockWs = { readyState: 1, send: () => {} } as any;

    room.addClient('p1', 'Player1', mockWs);
    room.startGame();

    const p = room.state.players['p1'];
    p.level = 2;
    p.board[0][4] = null; // clear board

    // Place 2 units on bench
    p.bench[0] = {
      id: 'bench_1',
      unitId: 'neville_longbottom',
      starLevel: 1,
      position: { x: 0, y: 0 },
      items: [],
      currentHp: 650,
      maxHp: 650,
      currentMana: 0,
      maxMana: 80,
    };
    p.bench[1] = {
      id: 'bench_2',
      unitId: 'cho_chang',
      starLevel: 1,
      position: { x: 1, y: 0 },
      items: [],
      currentHp: 480,
      maxHp: 480,
      currentMana: 0,
      maxMana: 70,
    };

    // Transition to combat
    (room as any).transitionToCombat();

    let boardCount = 0;
    for (const r of p.board) {
      for (const u of r) {
        if (u) boardCount++;
      }
    }
    assert.strictEqual(boardCount, 2);
    assert.strictEqual(p.bench[0], null);
    assert.strictEqual(p.bench[1], null);
  });

  it('should accumulate exactly 12 components and 23 gold across all PvE rounds up to Stage 4-7', () => {
    const room = new AutoBattlerRoom('test-room-pve-totals');
    const pveSchedule = (room as any).pveRewards;

    // Stage 1 (3 rounds: 1-1 = 2g, 1-2 = 2g, 1-3 = 1g)
    const stage1Comps = pveSchedule.stage1.components * 3;
    const stage1Gold = 2 + 2 + 1; // 5 gold

    // Stage 2-7, 3-7, 4-7
    const totalComps =
      stage1Comps +
      pveSchedule.stage2_7.components +
      pveSchedule.stage3_7.components +
      pveSchedule.stage4_7.components;

    const totalGold =
      stage1Gold +
      pveSchedule.stage2_7.gold +
      pveSchedule.stage3_7.gold +
      pveSchedule.stage4_7.gold;

    assert.strictEqual(totalComps, 12, 'Total PvE components by stage 4-7 must equal 12');
    assert.strictEqual(totalGold, 23, 'Total PvE bonus gold by stage 4-7 must equal 23');
  });

  it('should support SURRENDER action and seamless client reconnection on refresh', () => {
    const room = new AutoBattlerRoom('test-reconnect-surrender');
    const mockWs1 = { readyState: 1, send: () => {} } as any;

    room.addClient('p1', 'Player1', mockWs1);
    room.startGame();

    // Reconnecting with the same playerId (as when page is refreshed)
    const mockWs2 = { readyState: 1, send: () => {} } as any;
    room.addClient('p1', 'Player1', mockWs2);

    // Verify player is retained and not duplicated
    assert.strictEqual(Object.keys(room.state.players).length, 8);
    const p1 = room.state.players['p1'];
    assert.strictEqual(p1.isEliminated, false);

    // Surrender action
    room.handleAction('p1', { type: 'SURRENDER' });
    assert.strictEqual(p1.isEliminated, true);
    assert.strictEqual(p1.health, 0);
    assert.strictEqual(p1.placement, 8);
  });
});
