export type BaseItemId =
  | 'wand_core'
  | 'basilisk_fang'
  | 'golden_snitch_shard'
  | 'mana_gem'
  | 'dragon_scale'
  | 'mandrake_leaf'
  | 'phoenix_feather'
  | 'quicksilver';

export interface ItemStats {
  hp?: number;
  armor?: number;
  magicResist?: number;
  attackDamage?: number;
  abilityPower?: number; // % bonus or flat
  attackSpeed?: number;  // % bonus
  startingMana?: number;
  manaPerSecond?: number; // mana regenerated per second (1s = TICK_RATE ticks)
  critChance?: number;   // % bonus
  critDamage?: number;   // % bonus
  dodgeChance?: number;  // % bonus
  range?: number;        // grid tiles
}

export interface ItemDefinition {
  id: string;
  name: string;
  isArtifact: boolean;
  recipe?: [BaseItemId, BaseItemId];
  description: string;
  stats: ItemStats;
  icon: string;
  passiveEffect?: {
    type: string;
    value: number;
    description: string;
  };
}
