import {
  PlayerState,
  UNITS,
  UnitPool,
  checkAndCombineUnits,
  addPlayerXp,
  calculateSynergies,
  XP_COST,
  XP_GAIN,
  BoardUnit,
} from '@autobattler/shared';

export class BotController {
  public static executeBotTurn(bot: PlayerState, unitPool: UnitPool): void {
    if (bot.isEliminated) return;

    // 1. Buy XP if rich or early game
    if (bot.gold >= 20 && bot.level < 8) {
      if (bot.gold >= XP_COST) {
        bot.gold -= XP_COST;
        addPlayerXp(bot, XP_GAIN);
      }
    }

    // 2. Buy units from shop
    for (let slot = 0; slot < bot.shopUnits.length; slot++) {
      const unitId = bot.shopUnits[slot];
      if (!unitId) continue;

      const def = UNITS[unitId];
      if (!def || bot.gold < def.cost) continue;

      // Find free bench slot
      const emptyBenchIdx = bot.bench.indexOf(null);
      if (emptyBenchIdx === -1) break; // Bench full

      // Buy unit
      bot.gold -= def.cost;
      const newUnit: BoardUnit = {
        id: `bot_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        unitId: def.id,
        starLevel: 1,
        position: { x: emptyBenchIdx, y: 0 },
        items: [],
        currentHp: def.stats.hp[0],
        maxHp: def.stats.hp[0],
        currentMana: def.stats.startingMana,
        maxMana: def.stats.maxMana,
      };

      bot.bench[emptyBenchIdx] = newUnit;
      bot.shopUnits[slot] = null;

      // Check combine
      checkAndCombineUnits(bot);
    }

    // 3. Deploy units from bench to board if under level cap
    let boardCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        if (bot.board[r][c]) boardCount++;
      }
    }

    while (boardCount < bot.level) {
      const benchIdx = bot.bench.findIndex((u) => u !== null);
      if (benchIdx === -1) break;

      const unit = bot.bench[benchIdx]!;
      const def = UNITS[unit.unitId];
      bot.bench[benchIdx] = null;

      // Determine smart placement row:
      // Front row (row 3): Guardians, Brawlers
      // Mid row (row 2): Assassins, Duelists
      // Back row (row 0 or 1): Snipers, Sorcerers, Mystics
      let targetRow = 3;
      if (def?.classes.includes('Sniper') || def?.classes.includes('Sorcerer') || def?.combatRole === 'Marksman' || def?.combatRole === 'Caster') {
        targetRow = 0;
      } else if (def?.classes.includes('Infiltrator') || def?.combatRole === 'Assassin') {
        targetRow = 1;
      }

      // Find free col in preferred row, or fallback to any free cell
      let placed = false;
      for (let c = 0; c < 8; c++) {
        if (!bot.board[targetRow][c]) {
          unit.position = { x: c, y: targetRow };
          bot.board[targetRow][c] = unit;
          placed = true;
          boardCount++;
          break;
        }
      }

      if (!placed) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 8; c++) {
            if (!bot.board[r][c]) {
              unit.position = { x: c, y: r };
              bot.board[r][c] = unit;
              placed = true;
              boardCount++;
              break;
            }
          }
          if (placed) break;
        }
      }
    }

    // 4. Update synergies
    bot.activeTraits = calculateSynergies(bot.board);
  }
}
