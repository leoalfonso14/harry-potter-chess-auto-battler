import { BoardUnit, StarLevel } from '../types/unit.js';
import { UNITS } from '../data/units.js';
import { PlayerState } from '../types/game.js';
import { calculateSynergies } from './synergy-calculator.js';

export const XP_COST = 4;
export const XP_GAIN = 4;
export const REROLL_COST = 2;

export const XP_TO_LEVEL: Record<number, number> = {
  1: 2,   // Level 1 -> 2 (2 XP)
  2: 2,   // Level 2 -> 3 (2 XP)
  3: 6,   // Level 3 -> 4 (6 XP)
  4: 10,  // Level 4 -> 5 (10 XP)
  5: 20,  // Level 5 -> 6 (20 XP)
  6: 36,  // Level 6 -> 7 (36 XP)
  7: 48,  // Level 7 -> 8 (48 XP)
  8: 76,  // Level 8 -> 9 (76 XP)
  9: 84,  // Level 9 -> 10 (84 XP)
  10: 0,  // Max level 10
};

export function calculateBaseIncome(stage: number): number {
  if (stage <= 1) return 3; // Stage 1 base income is 3 gold
  if (stage === 2) return 4; // Stage 2 base income is 4 gold (slowed down)
  return 5; // Stage 3+ base income is 5 gold
}

export function calculateInterest(gold: number): number {
  return Math.min(5, Math.floor(gold / 10));
}

export function calculateStreakBonus(streak: number): number {
  const absStreak = Math.abs(streak);
  if (absStreak >= 5) return 3;
  if (absStreak >= 4) return 2;
  if (absStreak >= 2) return 1;
  return 0;
}

export function calculateRoundIncome(stage: number, gold: number, streak: number): {
  base: number;
  interest: number;
  streak: number;
  total: number;
} {
  const base = calculateBaseIncome(stage);
  const interest = calculateInterest(gold);
  const streakBonus = calculateStreakBonus(streak);
  return {
    base,
    interest,
    streak: streakBonus,
    total: base + interest + streakBonus,
  };
}

export function addPlayerXp(player: PlayerState, xpAmount: number): boolean {
  if (player.level >= 10) return false;

  player.xp += xpAmount;
  let leveledUp = false;

  while (player.level < 10 && player.xp >= player.xpToNextLevel) {
    player.xp -= player.xpToNextLevel;
    player.level += 1;
    player.xpToNextLevel = XP_TO_LEVEL[player.level];
    leveledUp = true;
  }

  if (player.level >= 10) {
    player.xp = 0;
    player.xpToNextLevel = 0;
  }

  return leveledUp;
}

export interface CombineResult {
  combined: boolean;
  upgradedUnit: BoardUnit | null;
  returnedItems: string[];
}

/**
 * Checks and combines 3 identical 1★ or 2★ units into a 2★ or 3★ unit.
 * Priority of position: keep the unit currently on the board or earliest bench slot.
 * If benchOnly is true, units fighting on the active board are ignored.
 */
export function checkAndCombineUnits(player: PlayerState, benchOnly = false): CombineResult {
  let combinedAny = false;
  let lastUpgradedUnit: BoardUnit | null = null;
  const allReturnedItems: string[] = [];

  let changed = true;
  while (changed) {
    changed = false;

    const allUnits: { unit: BoardUnit; location: 'board' | 'bench'; x: number; y?: number }[] = [];

    if (!benchOnly) {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 8; x++) {
          const u = player.board[y][x];
          if (u) {
            allUnits.push({ unit: u, location: 'board', x, y });
          }
        }
      }
    }

    for (let i = 0; i < player.bench.length; i++) {
      const u = player.bench[i];
      if (u) {
        allUnits.push({ unit: u, location: 'bench', x: i });
      }
    }

    // Check for 3-of-a-kind (check 1-star first, then 2-star)
    for (const targetStar of [1, 2] as StarLevel[]) {
      const grouped = new Map<string, typeof allUnits>();

      for (const item of allUnits) {
        if (item.unit.starLevel === targetStar) {
          const list = grouped.get(item.unit.unitId) || [];
          list.push(item);
          grouped.set(item.unit.unitId, list);
        }
      }

      for (const [unitId, matches] of grouped.entries()) {
        if (matches.length >= 3) {
          const [first, second, third] = matches.slice(0, 3);
          const def = UNITS[unitId];
          if (!def) continue;

          const newStarLevel = (targetStar + 1) as StarLevel;

          // Collect all items from the 3 units
          const combinedItems: string[] = [
            ...first.unit.items,
            ...second.unit.items,
            ...third.unit.items,
          ];

          // Max 3 items on a unit, rest return to item bench
          const unitItems = combinedItems.slice(0, 3);
          const returnedItems = combinedItems.slice(3);
          allReturnedItems.push(...returnedItems);

          const starIdx = newStarLevel - 1;
          const newMaxHp = def.stats.hp[starIdx];

          const upgradedUnit: BoardUnit = {
            id: first.unit.id,
            unitId: unitId,
            starLevel: newStarLevel,
            position: first.unit.position,
            items: unitItems,
            currentHp: newMaxHp,
            maxHp: newMaxHp,
            currentMana: def.stats.startingMana,
            maxMana: def.stats.maxMana,
          };

          // Put upgraded unit in first unit's spot
          if (first.location === 'board' && first.y !== undefined) {
            player.board[first.y][first.x] = upgradedUnit;
          } else {
            player.bench[first.x] = upgradedUnit;
          }

          // Clear second and third units
          if (second.location === 'board' && second.y !== undefined) {
            player.board[second.y][second.x] = null;
          } else {
            player.bench[second.x] = null;
          }

          if (third.location === 'board' && third.y !== undefined) {
            player.board[third.y][third.x] = null;
          } else {
            player.bench[third.x] = null;
          }

          // Add returned items to item bench
          for (const itm of returnedItems) {
            const emptySlot = player.itemBench.indexOf(null);
            if (emptySlot !== -1) {
              player.itemBench[emptySlot] = itm;
            }
          }

          combinedAny = true;
          lastUpgradedUnit = upgradedUnit;
          changed = true;
          break;
        }
      }

      if (changed) break;
    }
  }

  // Recalculate synergies
  player.activeTraits = calculateSynergies(player.board);

  return {
    combined: combinedAny,
    upgradedUnit: lastUpgradedUnit,
    returnedItems: allReturnedItems,
  };
}
