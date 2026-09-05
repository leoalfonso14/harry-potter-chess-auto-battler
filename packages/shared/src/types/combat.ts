import { GridPosition, StarLevel } from './unit.js';

export type CombatTeam = 'home' | 'away';

export type CombatUnitState = 'IDLE' | 'MOVING' | 'ATTACKING' | 'CASTING' | 'STUNNED' | 'DEAD';

export type StatusEffectType =
  | 'smSunder'
  | 'sunder'
  | 'smShred'
  | 'shred'
  | 'stun'
  | 'stunned'
  | 'disarm'
  | 'disarmed'
  | 'silence'
  | 'silenced'
  | 'wound'
  | 'burn';

export interface StatusEffect {
  type: StatusEffectType;
  durationTicks: number; // Ticks remaining in simulation
  value?: number; // e.g. 0.20 for smSunder, 0.30 for sunder
}

export interface CombatUnit {
  id: string;
  ownerId: string;
  team: CombatTeam;
  unitDefId: string;
  name: string;
  starLevel: StarLevel;
  position: GridPosition;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  baseArmor: number;
  baseMagicResist: number;
  armor: number; // Effective armor after status effects
  magicResist: number; // Effective magic resist after status effects
  attackDamage: number;
  attackSpeed: number; // Attacks per second
  range: number;
  abilityPower: number; // multiplier, 1.0 = 100%
  critChance: number;   // 0.0 to 1.0
  critMultiplier: number;
  dodgeChance?: number; // 0.0 to 1.0
  state: CombatUnitState;
  targetId: string | null;
  attackCooldown: number; // ticks until next attack
  moveCooldown: number;   // ticks until next movement step (smooth pacing)
  castDuration: number;   // ticks remaining in cast
  items: string[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalPhysicalMitigated: number;
  totalMagicMitigated: number;
  totalHealing: number;
  totalShielding: number;
  shield: number;
  manaPerSec?: number;
  duelistStacks?: number;
  hasGryffindorShielded?: boolean;
  hasWeasleyShielded?: boolean;
  deathTick?: number;
  fawkesCastCount?: number;
  isJumping?: boolean;
  statusEffects: StatusEffect[];
}

export type CombatEventType =
  | 'SPAWN'
  | 'MOVE'
  | 'ATTACK_START'
  | 'ATTACK_HIT'
  | 'SPELL_CAST'
  | 'DAMAGE'
  | 'HEAL'
  | 'SHIELD'
  | 'STUN'
  | 'REVIVE'
  | 'OVERTIME'
  | 'DEATH'
  | 'COMBAT_END';

export interface CombatEvent {
  tick: number;
  type: CombatEventType;
  sourceId?: string;
  targetId?: string;
  unitDefId?: string;
  starLevel?: StarLevel;
  items?: string[];
  position?: GridPosition;
  fromPos?: GridPosition;
  toPos?: GridPosition;
  value?: number;
  isCrit?: boolean;
  damageType?: 'physical' | 'magic' | 'true';
  abilityName?: string;
  remainingHp?: number;
  remainingShield?: number;
  remainingMana?: number;
  maxHp?: number;
  maxMana?: number;
  meta?: Record<string, unknown>;
}

export interface UnitCombatSummary {
  unitDefId: string;
  starLevel: StarLevel;
  cost: number;
  damageDealt: number;
  damageTaken: number;
  physicalMitigated: number;
  magicMitigated: number;
  totalMitigated: number;
  healing: number;
  shielding: number;
  survived: boolean;
  hpPercent: number;
  items?: string[];
}

export interface CombatResult {
  winner: CombatTeam | 'tie';
  durationTicks: number;
  durationInSeconds?: number;
  homePlayerId: string;
  awayPlayerId: string;
  damageToLoser: number;
  homeSurvivors: number;
  awaySurvivors: number;
  homeUnitSummaries: Record<string, UnitCombatSummary>;
  awayUnitSummaries: Record<string, UnitCombatSummary>;
  events: CombatEvent[];
  isPve?: boolean;
}
