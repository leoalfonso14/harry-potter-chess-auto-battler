import {
  PlayerState,
  UNITS,
  UnitPool,
  checkAndCombineUnits,
  addPlayerXp,
  calculateSynergies,
  combineItems,
  XP_COST,
  XP_GAIN,
  REROLL_COST,
  BoardUnit,
  ALL_ITEMS,
} from '@autobattler/shared';

export class BotController {
  public static executeBotTurn(
    bot: PlayerState,
    unitPool: UnitPool,
    stage = 1,
    roundInStage = 1
  ): void {
    if (bot.isEliminated) return;

    // 1. Star-combine check first
    checkAndCombineUnits(bot);

    // 2. Synthesize & Equip Items
    this.synthesizeAndEquipItems(bot);

    // 3. Leveling & Economy Management
    this.handleLeveling(bot, stage, roundInStage);

    // 4. Shop Buying (Target Upgrades & Synergies)
    this.buyFromShop(bot, unitPool);

    // 5. Rerolling (Slow-roll > 50g or Panic roll if low HP)
    this.handleRerolling(bot, unitPool, stage);

    // 6. Best Board Optimization & Role-based Hex Positioning
    this.optimizeBoard(bot);

    // 7. Re-calculate active synergies
    bot.activeTraits = calculateSynergies(bot.board);
  }

  /**
   * Synthesizes base item components into powerful artifacts and equips them smartly.
   */
  private static synthesizeAndEquipItems(bot: PlayerState): void {
    // Step A: Combine components on bench if pairs exist
    let combined = true;
    while (combined) {
      combined = false;
      const compIndices: number[] = [];
      for (let i = 0; i < bot.itemBench.length; i++) {
        if (bot.itemBench[i]) compIndices.push(i);
      }

      if (compIndices.length < 2) break;

      for (let i = 0; i < compIndices.length && !combined; i++) {
        for (let j = i + 1; j < compIndices.length && !combined; j++) {
          const idxA = compIndices[i];
          const idxB = compIndices[j];
          const itemA = bot.itemBench[idxA];
          const itemB = bot.itemBench[idxB];
          if (!itemA || !itemB) continue;

          const recipe = combineItems(itemA, itemB);
          if (recipe) {
            bot.itemBench[idxA] = recipe.id;
            bot.itemBench[idxB] = null;
            combined = true;
          }
        }
      }
    }

    // Step B: Equip items to best board units
    const boardUnits: BoardUnit[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const u = bot.board[r][c];
        if (u) boardUnits.push(u);
      }
    }

    if (boardUnits.length === 0) return;

    for (let i = 0; i < bot.itemBench.length; i++) {
      const itemId = bot.itemBench[i];
      if (!itemId) continue;

      const itemDef = ALL_ITEMS[itemId];
      if (!itemDef) continue;

      // Find best target unit with < 3 items
      const eligibleUnits = boardUnits.filter((u) => u.items.length < 3);
      if (eligibleUnits.length === 0) break;

      const isTankItem = Boolean(
        itemDef.stats.armor ||
        itemDef.stats.magicResist ||
        itemDef.stats.hp
      );

      const isCarryItem = Boolean(
        itemDef.stats.attackDamage ||
        itemDef.stats.abilityPower ||
        itemDef.stats.attackSpeed ||
        itemDef.stats.critChance ||
        itemDef.stats.startingMana
      );

      let targetUnit: BoardUnit;

      if (isTankItem) {
        // Prioritize Tank / Guardian / Brawler with highest star level & cost
        targetUnit = eligibleUnits.sort((a, b) => {
          const defA = UNITS[a.unitId];
          const defB = UNITS[b.unitId];
          const tankScoreA = (defA?.combatRole === 'Tank' || defA?.classes.includes('Guardian') ? 50 : 0) + (a.starLevel * 10) + (defA?.cost ?? 1);
          const tankScoreB = (defB?.combatRole === 'Tank' || defB?.classes.includes('Guardian') ? 50 : 0) + (b.starLevel * 10) + (defB?.cost ?? 1);
          return tankScoreB - tankScoreA;
        })[0];
      } else if (isCarryItem) {
        // Prioritize Marksman / Caster / Assassin carry with highest star level & cost
        targetUnit = eligibleUnits.sort((a, b) => {
          const defA = UNITS[a.unitId];
          const defB = UNITS[b.unitId];
          const carryScoreA = (defA?.combatRole === 'Marksman' || defA?.combatRole === 'Caster' || defA?.combatRole === 'Assassin' ? 50 : 0) + (a.starLevel * 10) + (defA?.cost ?? 1);
          const carryScoreB = (defB?.combatRole === 'Marksman' || defB?.combatRole === 'Caster' || defB?.combatRole === 'Assassin' ? 50 : 0) + (b.starLevel * 10) + (defB?.cost ?? 1);
          return carryScoreB - carryScoreA;
        })[0];
      } else {
        targetUnit = eligibleUnits.sort((a, b) => (b.starLevel * 10 + (UNITS[b.unitId]?.cost ?? 1)) - (a.starLevel * 10 + (UNITS[a.unitId]?.cost ?? 1)))[0];
      }

      if (targetUnit) {
        // If equipping a component onto a unit with an existing component, combine them!
        const existingCompIdx = targetUnit.items.findIndex((it) => !ALL_ITEMS[it]?.isArtifact);
        if (!itemDef.isArtifact && existingCompIdx !== -1) {
          const existingComp = targetUnit.items[existingCompIdx];
          const recipe = combineItems(existingComp as any, itemId as any);
          if (recipe) {
            targetUnit.items[existingCompIdx] = recipe.id;
            bot.itemBench[i] = null;
            continue;
          }
        }

        if (targetUnit.items.length < 3) {
          targetUnit.items.push(itemId);
          bot.itemBench[i] = null;

          // Double check if target unit now has any combineable component pair
          this.combineUnitComponents(targetUnit);
        }
      }
    }

    // Step C: Scan all board & bench units and ensure any 2 components on any unit are merged
    for (const u of boardUnits) {
      this.combineUnitComponents(u);
    }
    for (const u of bot.bench) {
      if (u) this.combineUnitComponents(u);
    }
  }

  /**
   * Merges any pairs of base item components on a unit into a completed artifact item.
   */
  private static combineUnitComponents(unit: BoardUnit): void {
    let combined = true;
    while (combined) {
      combined = false;
      for (let i = 0; i < unit.items.length; i++) {
        const itemA = unit.items[i];
        if (!itemA || ALL_ITEMS[itemA]?.isArtifact) continue;

        for (let j = i + 1; j < unit.items.length; j++) {
          const itemB = unit.items[j];
          if (!itemB || ALL_ITEMS[itemB]?.isArtifact) continue;

          const combo = combineItems(itemA as any, itemB as any);
          if (combo) {
            unit.items[i] = combo.id;
            unit.items.splice(j, 1);
            combined = true;
            break;
          }
        }
        if (combined) break;
      }
    }
  }

  /**
   * Manages XP purchases according to standard auto-battler pacing & interest thresholds.
   */
  private static handleLeveling(bot: PlayerState, stage: number, roundInStage: number): void {
    if (bot.level >= 9) return;

    let targetLevel = 3;
    if (stage >= 2) targetLevel = 4;
    if (stage >= 2 && roundInStage >= 5) targetLevel = 5;
    if (stage >= 3 && roundInStage >= 2) targetLevel = 6;
    if (stage >= 4 && roundInStage >= 1) targetLevel = 7;
    if (stage >= 4 && roundInStage >= 5) targetLevel = 8;
    if (stage >= 5 && roundInStage >= 5) targetLevel = 9;

    // Push level if below target level and can afford it reasonably
    while (bot.level < targetLevel && bot.gold >= XP_COST) {
      // Don't break zero economy in early rounds
      if (bot.gold < 4) break;
      bot.gold -= XP_COST;
      addPlayerXp(bot, XP_GAIN);
    }

    // Slow-level with excess gold above 50
    while (bot.gold >= 50 + XP_COST && bot.level < 9) {
      bot.gold -= XP_COST;
      addPlayerXp(bot, XP_GAIN);
    }
  }

  /**
   * Evaluates shop units and buys upgrades or synergy-matching champions.
   */
  private static buyFromShop(bot: PlayerState, unitPool?: UnitPool): void {
    // Inventory copy counts
    const ownedUnitCounts: Record<string, number> = {};
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const u = bot.board[r][c];
        if (u) {
          ownedUnitCounts[u.unitId] = (ownedUnitCounts[u.unitId] || 0) + (u.starLevel === 2 ? 3 : u.starLevel === 3 ? 9 : 1);
        }
      }
    }
    for (const u of bot.bench) {
      if (u) {
        ownedUnitCounts[u.unitId] = (ownedUnitCounts[u.unitId] || 0) + (u.starLevel === 2 ? 3 : u.starLevel === 3 ? 9 : 1);
      }
    }

    // Active board traits
    const activeTraits = calculateSynergies(bot.board);
    const activeTraitNames = new Set(activeTraits.map((t) => t.name));

    for (let slot = 0; slot < bot.shopUnits.length; slot++) {
      const unitId = bot.shopUnits[slot];
      if (!unitId) continue;

      const def = UNITS[unitId];
      if (!def || bot.gold < def.cost) continue;

      const ownedCount = ownedUnitCounts[unitId] || 0;
      const isCombineUpgrade = (ownedCount % 3 === 2) || (ownedCount % 3 === 1);
      const matchesSynergy = def.origins.some((o) => activeTraitNames.has(o)) || def.classes.some((c) => activeTraitNames.has(c));

      // Calculate purchase priority score
      let priorityScore = 0;
      if (isCombineUpgrade) priorityScore += 80;
      if (ownedCount > 0) priorityScore += 40;
      if (matchesSynergy) priorityScore += 30;
      if (def.cost >= 4 && bot.level >= 7) priorityScore += 25;
      if (bot.level <= 4 && def.cost <= 2) priorityScore += 20;

      // Econ check: Keep 10/20/30/40/50 interest thresholds unless high priority
      const currentInterest = Math.min(5, Math.floor(bot.gold / 10));
      const postBuyInterest = Math.min(5, Math.floor((bot.gold - def.cost) / 10));
      const losesInterest = postBuyInterest < currentInterest;

      if (losesInterest && priorityScore < 50 && bot.gold < 50) {
        continue; // Protect interest
      }

      if (priorityScore >= 20) {
        const emptyBench = bot.bench.indexOf(null);
        if (emptyBench === -1 && !isCombineUpgrade) continue; // Bench full

        bot.gold -= def.cost;
        const newUnit: BoardUnit = {
          id: `bot_u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          unitId: def.id,
          starLevel: 1,
          position: { x: emptyBench !== -1 ? emptyBench : 0, y: 0 },
          items: [],
          currentHp: def.stats.hp[0],
          maxHp: def.stats.hp[0],
          currentMana: def.stats.startingMana,
          maxMana: def.stats.maxMana,
        };

        if (emptyBench !== -1) {
          bot.bench[emptyBench] = newUnit;
        }
        bot.shopUnits[slot] = null;
        if (unitPool) {
          unitPool.decrementPool(unitId);
        }
        ownedUnitCounts[unitId] = (ownedUnitCounts[unitId] || 0) + 1;

        checkAndCombineUnits(bot);
      }
    }
  }

  /**
   * Rerolls shop when rich (slow roll > 50g) or in panic mode (health <= 30).
   */
  private static handleRerolling(bot: PlayerState, unitPool: UnitPool, stage: number): void {
    const isPanic = bot.health <= 30 && stage >= 3;
    const isSlowRoll = bot.gold > 50 && bot.level >= 6;

    if (!isPanic && !isSlowRoll) return;

    let rollsAllowed = isPanic ? Math.min(6, Math.floor(bot.gold / REROLL_COST)) : Math.min(3, Math.floor((bot.gold - 50) / REROLL_COST));

    while (rollsAllowed > 0 && bot.gold >= REROLL_COST) {
      if (!isPanic && bot.gold <= 50) break;
      bot.gold -= REROLL_COST;
      rollsAllowed--;
      bot.shopUnits = unitPool.drawShop(bot.level, 5);
      this.buyFromShop(bot, unitPool);
    }
  }

  /**
   * Selects the highest-power board from board + bench units and positions them intelligently.
   */
  private static optimizeBoard(bot: PlayerState): void {
    // 1. Collect all units
    const allUnits: BoardUnit[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const u = bot.board[r][c];
        if (u) {
          allUnits.push(u);
          bot.board[r][c] = null;
        }
      }
    }
    for (let i = 0; i < bot.bench.length; i++) {
      const u = bot.bench[i];
      if (u) {
        allUnits.push(u);
        bot.bench[i] = null;
      }
    }

    if (allUnits.length === 0) return;

    // 2. Score units based on star level, cost, items, and role
    const scoreUnit = (u: BoardUnit): number => {
      const def = UNITS[u.unitId];
      if (!def) return 0;
      const starMultiplier = u.starLevel === 3 ? 3.8 : u.starLevel === 2 ? 2.0 : 1.0;
      const costScore = def.cost * 12;
      const itemScore = u.items.length * 18;
      return (costScore * starMultiplier) + itemScore;
    };

    allUnits.sort((a, b) => scoreUnit(b) - scoreUnit(a));

    // 3. Take top N units for board
    const boardCapacity = Math.min(bot.level, allUnits.length);
    const fieldedUnits = allUnits.slice(0, boardCapacity);
    const benchUnits = allUnits.slice(boardCapacity);

    // 4. Populate bench
    for (let i = 0; i < Math.min(benchUnits.length, 9); i++) {
      const u = benchUnits[i];
      u.position = { x: i, y: 0 };
      bot.bench[i] = u;
    }

    // 5. Intelligent Grid Positioning for Fielded Units
    // Row 3: Frontline Tanks (Guardians, Brawlers)
    // Row 2: Midline Fighters (Duelists, Assassins)
    // Row 0-1: Backline Carries (Snipers, Sorcerers, Mystics, Marksmen)
    for (const unit of fieldedUnits) {
      const def = UNITS[unit.unitId];
      let preferredRow = 3; // Default front

      if (
        def?.classes.includes('Sniper') ||
        def?.classes.includes('Sorcerer') ||
        def?.classes.includes('Mystic') ||
        def?.combatRole === 'Marksman' ||
        def?.combatRole === 'Caster'
      ) {
        preferredRow = 0; // Backline
      } else if (
        def?.classes.includes('Infiltrator') ||
        def?.classes.includes('Duelist') ||
        def?.combatRole === 'Assassin' ||
        def?.combatRole === 'Fighter'
      ) {
        preferredRow = 2; // Midline
      }

      // Find free slot in preferred row or search outward
      let placed = false;
      const searchOrder = [preferredRow, preferredRow === 0 ? 1 : preferredRow === 3 ? 2 : 1, 3, 0, 1, 2];

      for (const row of searchOrder) {
        if (placed) break;
        for (let col = 0; col < 8; col++) {
          if (!bot.board[row][col]) {
            unit.position = { x: col, y: row };
            bot.board[row][col] = unit;
            placed = true;
            break;
          }
        }
      }
    }
  }
}

