import { Origin, Class } from './unit.js';

export interface TraitBreakpoint {
  count: number;
  description: string;
  bonus: {
    armor?: number;
    magicResist?: number;
    attackDamage?: number;
    abilityPower?: number; // % bonus e.g. 0.25
    attackSpeed?: number;
    health?: number;
    startingMana?: number;
    manaStartBonus?: number;
    magicDamageReduction?: number; // e.g. 0.40
    critChance?: number;
    critDamage?: number;
    dodgeChance?: number;
    trueDamage?: boolean;
    omnivamp?: number;
  };
}

export interface TraitDefinition {
  id: string;
  name: Origin | Class;
  type: 'origin' | 'class';
  icon: string;
  description: string;
  breakpoints: TraitBreakpoint[];
}

export interface ActiveTraitInfo {
  traitId: string;
  name: string;
  type: 'origin' | 'class';
  count: number;
  activeTier: number; // 0 if below first breakpoint, 1 for first, etc.
  totalTiers: number;
  currentBreakpointDescription: string;
  nextBreakpointCount: number | null;
}
