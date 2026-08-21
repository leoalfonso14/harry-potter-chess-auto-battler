export type StarLevel = 1 | 2 | 3;
export type UnitCost = 1 | 2 | 3 | 4 | 5;

export type Origin =
  | 'Gryffindor'
  | 'Slytherin'
  | 'Ravenclaw'
  | 'Hufflepuff'
  | 'Order of Phoenix'
  | 'Death Eater'
  | 'Ghost'
  | 'Magical Creature'
  | 'Ministry'
  | 'Professor'
  | 'Magizoologist'
  | 'House-Elf'
  | 'Dark Wizard'
  | 'Beauxbatons'
  | 'Durmstrang'
  | 'Divine'
  | 'Wild'
  | 'Dragon'
  | 'Golden Trio'
  | 'Slytherin Trio'
  | 'Weasley'
  | 'Malfoy';

export type CombatRole =
  | 'Tank'
  | 'Fighter'
  | 'Caster'
  | 'Marksman'
  | 'Assassin'
  | 'Specialist';

export type Class =
  | 'Guardian'
  | 'Sorcerer'
  | 'Sniper'
  | 'Brawler'
  | 'Infiltrator'
  | 'Mystic'
  | 'Duelist'
  | 'Trickster'
  | 'Animagi'
  | 'Handler';

export interface UnitStats {
  hp: [number, number, number]; // [1-star, 2-star, 3-star]
  armor: number;
  magicResist: number;
  attackDamage: [number, number, number];
  attackSpeed: number; // Attacks per second
  range: number;       // Grid tile range (1 = melee, 2-4 = ranged)
  startingMana: number;
  maxMana: number;
}

export type AbilityTargetType =
  | 'single'
  | 'aoeAll'
  | 'aoeSplit'
  | 'aoe'
  | 'self'
  | 'lowest_hp'
  | 'allies'
  | 'ally';

export interface UnitAbility {
  name: string;
  description: string;
  manaCost: number;
  damageType: 'physical' | 'magic' | 'true';
  damageValues: [number, number, number]; // [1-star, 2-star, 3-star]
  targetType: AbilityTargetType;
  radius?: number;
  duration?: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  cost: UnitCost;
  combatRole: CombatRole;
  origins: Origin[];
  classes: Class[];
  stats: UnitStats;
  ability: UnitAbility;
  color: string;
  icon?: string;
}

export interface GridPosition {
  x: number; // 0 to 7 (columns)
  y: number; // 0 to 3 for player board, or 0 to 7 full board
}

export interface BoardUnit {
  id: string;
  unitId: string;
  starLevel: StarLevel;
  position: GridPosition;
  items: string[];
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  isDead?: boolean;
  statusEffects?: string[];
  effectiveArmor?: number;
  effectiveMagicResist?: number;
}
