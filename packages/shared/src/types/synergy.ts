import { Origin, Class } from './unit.js';

export interface TraitBonus {
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

  // Dynamic mechanic configuration properties for easy balancing
  attackSpeedPerStack?: number;
  maxStacks?: number;
  damageAmpPerHex?: number;
  bonusRange?: number;
  executeThreshold?: number;
  shieldHp?: number;
  shieldThreshold?: number;
  shieldDuration?: number;
  damageReduction?: number;
  manaPerSecond?: number;
  manaBurn?: number;
  detainCount?: number;
  detainDuration?: number;
  suppressCount?: number;
  suppressDuration?: number;
  bonusTrueDamage?: number;
  trueDamagePercent?: number;
  burnPercent?: number;
  healingReduction?: number;
  enemyDamageReduction?: number;
  enemySlowPercent?: number;
  sunderShredPercent?: number;
  sunderShredDuration?: number;
  bonusGoldOnWin?: number;
  companionHp?: number;
  companionAd?: number;
  splashPercent?: number;
  statPassPercent?: number;
  hpRegenPerSec?: number;
  targetCount?: number;
  duration?: number;
}

export interface TraitBreakpoint {
  count: number;
  description: string;
  bonus: TraitBonus;
}

export interface TraitDefinition {
  id: string;
  name: string;
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
