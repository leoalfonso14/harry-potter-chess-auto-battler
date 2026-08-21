import { UNIT_LIST, UNITS } from '../data/units.js';
import { UnitCost } from '../types/unit.js';

export const SHOP_ODDS: Record<number, Record<UnitCost, number>> = {
  1: { 1: 1.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
  2: { 1: 1.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0 },
  3: { 1: 0.75, 2: 0.25, 3: 0.0, 4: 0.0, 5: 0.0 },
  4: { 1: 0.55, 2: 0.30, 3: 0.15, 4: 0.0, 5: 0.0 },
  5: { 1: 0.45, 2: 0.33, 3: 0.20, 4: 0.02, 5: 0.0 },
  6: { 1: 0.25, 2: 0.40, 3: 0.30, 4: 0.05, 5: 0.0 },
  7: { 1: 0.19, 2: 0.30, 3: 0.35, 4: 0.15, 5: 0.01 },
  8: { 1: 0.16, 2: 0.25, 3: 0.35, 4: 0.20, 5: 0.04 },
  9: { 1: 0.10, 2: 0.18, 3: 0.32, 4: 0.30, 5: 0.10 }, // Level 9 (tuned down from 15% to 10% 5-costs)
  10: { 1: 0.05, 2: 0.10, 3: 0.20, 4: 0.40, 5: 0.25 }, // Level 10 (25% 5-costs, 40% 4-costs)
};

export const INITIAL_POOL_COUNTS: Record<UnitCost, number> = {
  1: 29,
  2: 22,
  3: 18,
  4: 12,
  5: 10,
};

const PVE_CREEP_IDS = new Set(['cornish_pixie', 'garden_gnome', 'acromantula_hatchling']);

export class UnitPool {
  private pool: Map<string, number> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.pool.clear();
    for (const unit of UNIT_LIST) {
      if (PVE_CREEP_IDS.has(unit.id) || unit.origins.includes('Wild')) continue;
      const initialCount = INITIAL_POOL_COUNTS[unit.cost];
      this.pool.set(unit.id, initialCount);
    }
  }

  public getAvailableCount(unitId: string): number {
    return this.pool.get(unitId) || 0;
  }

  public getPoolCountsByCost(): Record<UnitCost, { remaining: number; total: number }> {
    const res: Record<UnitCost, { remaining: number; total: number }> = {
      1: { remaining: 0, total: 0 },
      2: { remaining: 0, total: 0 },
      3: { remaining: 0, total: 0 },
      4: { remaining: 0, total: 0 },
      5: { remaining: 0, total: 0 },
    };

    for (const unit of UNIT_LIST) {
      if (PVE_CREEP_IDS.has(unit.id) || unit.origins.includes('Wild')) continue;
      const rem = this.pool.get(unit.id) || 0;
      const tot = INITIAL_POOL_COUNTS[unit.cost];
      res[unit.cost].remaining += rem;
      res[unit.cost].total += tot;
    }
    return res;
  }

  private rollCostTier(playerLevel: number): UnitCost {
    const level = Math.max(1, Math.min(9, playerLevel));
    const odds = SHOP_ODDS[level];
    const rand = Math.random();

    let cumulative = 0;
    let lastValidCost: UnitCost = 1;

    for (let cost = 1 as UnitCost; cost <= 5; cost++) {
      if (odds[cost] > 0) {
        lastValidCost = cost;
        cumulative += odds[cost];
        if (rand < cumulative) {
          return cost;
        }
      }
    }
    return lastValidCost;
  }

  public drawShop(playerLevel: number, count: number = 5): string[] {
    const shop: string[] = [];
    const level = Math.max(1, Math.min(9, playerLevel));
    const odds = SHOP_ODDS[level];

    for (let i = 0; i < count; i++) {
      const cost = this.rollCostTier(playerLevel);
      const unitsOfCost = UNIT_LIST.filter((u) => u.cost === cost);

      // Filter units that still have copies in pool
      const availableUnits = unitsOfCost.filter((u) => (this.pool.get(u.id) || 0) > 0);

      if (availableUnits.length === 0) {
        // Fallback to any available unit of allowed cost tier for this level
        const fallbackUnits = UNIT_LIST.filter(
          (u) => (odds[u.cost] || 0) > 0 && (this.pool.get(u.id) || 0) > 0
        );
        if (fallbackUnits.length > 0) {
          const picked = fallbackUnits[Math.floor(Math.random() * fallbackUnits.length)];
          this.decrementPool(picked.id);
          shop.push(picked.id);
        } else {
          // If all allowed units exhausted, default to standard 1-cost
          shop.push('vanguard_knight');
        }
      } else {
        const picked = availableUnits[Math.floor(Math.random() * availableUnits.length)];
        this.decrementPool(picked.id);
        shop.push(picked.id);
      }
    }

    return shop;
  }

  public decrementPool(unitId: string): void {
    const current = this.pool.get(unitId) || 0;
    if (current > 0) {
      this.pool.set(unitId, current - 1);
    }
  }

  public returnToPool(unitId: string, starLevel: number): void {
    const unitCount = Math.pow(3, starLevel - 1);
    const current = this.pool.get(unitId) || 0;
    this.pool.set(unitId, current + unitCount);
  }
}
