import { BaseItemId, ItemDefinition } from '../types/item.js';

export const BASE_ITEMS: Record<BaseItemId, ItemDefinition> = {
  wand_core: {
    id: 'wand_core',
    name: 'Wand Core',
    isArtifact: false,
    description: '+20% Ability Power',
    icon: '🪄',
    stats: {
      abilityPower: 0.2, // +20%
    },
  },
  basilisk_fang: {
    id: 'basilisk_fang',
    name: 'Basilisk Fang',
    isArtifact: false,
    description: '+15 Attack Damage',
    icon: '🗡️',
    stats: {
      attackDamage: 15,
    },
  },
  golden_snitch_shard: {
    id: 'golden_snitch_shard',
    name: 'Golden Snitch Shard',
    isArtifact: false,
    description: '+20% Crit & +4% Dodge',
    icon: '🪙',
    stats: {
      critChance: 0.2,
      dodgeChance: 0.04,
    },
  },
  mana_gem: {
    id: 'mana_gem',
    name: 'Pensieve Crystal',
    isArtifact: false,
    description: '+15 Start Mana & +5 Mana/s',
    icon: '💎',
    stats: {
      startingMana: 15,
      manaPerSecond: 5,
    },
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    isArtifact: false,
    description: '+25 Armor',
    icon: '🛡️',
    stats: {
      armor: 25,
    },
  },
  mandrake_leaf: {
    id: 'mandrake_leaf',
    name: 'Mandrake Leaf',
    isArtifact: false,
    description: '+25 Magic Resist',
    icon: '🌿',
    stats: {
      magicResist: 25,
    },
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    isArtifact: false,
    description: '+200 Health',
    icon: '🪶',
    stats: {
      hp: 200,
    },
  },
  quicksilver: {
    id: 'quicksilver',
    name: 'Quicksilver Mercury',
    isArtifact: false,
    description: '+20% Attack Speed',
    icon: '⚡',
    stats: {
      attackSpeed: 0.2,
    },
  },
};

export const ARTIFACT_ITEMS: Record<string, ItemDefinition> = {
  // ==========================================
  // 🪄 Wand Core Combinations
  // ==========================================
  elder_wand: {
    id: 'elder_wand',
    name: 'Elder Wand Supremacy',
    isArtifact: true,
    recipe: ['wand_core', 'wand_core'],
    description: '+50% Magic Damage; spells can critically strike for 150% damage.',
    icon: '🔮',
    stats: {
      abilityPower: 0.5,
      critChance: 0.25,
    },
    passiveEffect: {
      type: 'SPELL_CRIT',
      value: 0.5,
      description: 'Spells can critically strike for 150% damage.',
    },
  },
  sword_of_gryffindor: {
    id: 'sword_of_gryffindor',
    name: 'Sword of Gryffindor',
    isArtifact: true,
    recipe: ['wand_core', 'basilisk_fang'],
    description: '+25 AD, +25% AP. Attacks deal 20% bonus magic dmg; spells deal 20% bonus phys dmg. Grants 15% Omnivamp.',
    icon: '⚔️',
    stats: {
      attackDamage: 25,
      abilityPower: 0.25,
    },
    passiveEffect: {
      type: 'OMNIVAMP',
      value: 0.15,
      description: 'Heals for 15% of all damage dealt.',
    },
  },
  resurrection_stone: {
    id: 'resurrection_stone',
    name: 'Resurrection Stone Signet',
    isArtifact: true,
    recipe: ['wand_core', 'golden_snitch_shard'],
    description: '+20% AP, +25% Crit Chance, +30% Crit Damage. Critical spell casts deal 50% bonus critical damage.',
    icon: '💍',
    stats: {
      abilityPower: 0.2,
      critChance: 0.25,
      critDamage: 0.3,
    },
    passiveEffect: {
      type: 'SPELL_CRIT_BONUS',
      value: 0.5,
      description: 'Spells deal +50% critical damage.',
    },
  },
  deluminator: {
    id: 'deluminator',
    name: "Dumbledore's Deluminator",
    isArtifact: true,
    recipe: ['wand_core', 'mana_gem'],
    description: '+25% AP, +20 Starting Mana, +5 Mana/sec. Permanently gains +10% AP for every 20 Mana spent.',
    icon: '✨',
    stats: {
      abilityPower: 0.25,
      startingMana: 20,
      manaPerSecond: 5,
    },
  },
  protego_brooch: {
    id: 'protego_brooch',
    name: 'Protego Shield Brooch',
    isArtifact: true,
    recipe: ['wand_core', 'dragon_scale'],
    description: '+20% AP, +30 Armor. Combat start grants a 300 HP shield to holder and 2 adjacent allies for 8s.',
    icon: '🛡️',
    stats: {
      abilityPower: 0.2,
      armor: 30,
    },
    passiveEffect: {
      type: 'COMBAT_START_SHIELD',
      value: 300,
      description: 'Grants 300 HP shield to adjacent allies.',
    },
  },
  hufflepuff_cup: {
    id: 'hufflepuff_cup',
    name: "Hufflepuff's Golden Cup",
    isArtifact: true,
    recipe: ['wand_core', 'mandrake_leaf'],
    description: '+20% AP, +30 MR. On ability cast, heals the 2 lowest-health allies for 300 HP.',
    icon: '🏆',
    stats: {
      abilityPower: 0.2,
      magicResist: 30,
    },
    passiveEffect: {
      type: 'CAST_HEAL',
      value: 300,
      description: 'Heals 2 lowest-health allies for 300 HP upon cast.',
    },
  },
  philosophers_stone: {
    id: 'philosophers_stone',
    name: "Philosopher's Stone Fragment",
    isArtifact: true,
    recipe: ['wand_core', 'phoenix_feather'],
    description: '+20% AP, +250 HP. Holder permanently stacks +2% AP every 2 seconds in combat.',
    icon: '🪨',
    stats: {
      abilityPower: 0.2,
      hp: 250,
    },
  },
  spell_weaver_wand: {
    id: 'spell_weaver_wand',
    name: "Rowena's Spell-Weaver Wand",
    isArtifact: true,
    recipe: ['wand_core', 'quicksilver'],
    description: '+20% AP, +25% AS. Basic attacks shred 10% enemy MR (up to 50%) and grant +5% AS.',
    icon: '🪄',
    stats: {
      abilityPower: 0.2,
      attackSpeed: 0.25,
    },
    passiveEffect: {
      type: 'MR_SHRED',
      value: 0.1,
      description: 'Attacks reduce target MR by 10%.',
    },
  },

  // ==========================================
  // 🗡️ Basilisk Fang Combinations
  // ==========================================
  slytherin_blade: {
    id: 'slytherin_blade',
    name: "Slytherin's Poisoned Blade",
    isArtifact: true,
    recipe: ['basilisk_fang', 'basilisk_fang'],
    description: '+45 AD. Physical damage ignores 35% Armor and inflicts poison dealing 150 True Damage over 3s.',
    icon: '🗡️',
    stats: {
      attackDamage: 45,
    },
    passiveEffect: {
      type: 'ARMOR_PEN',
      value: 0.35,
      description: 'Ignores 35% armor and inflicts poison.',
    },
  },
  seeker_goggles: {
    id: 'seeker_goggles',
    name: "Seeker's Quidditch Goggles",
    isArtifact: true,
    recipe: ['basilisk_fang', 'golden_snitch_shard'],
    description: '+20 AD, +25% Crit Chance, +40% Crit Damage. Physical attacks have 100% accuracy and cannot miss.',
    icon: '🥽',
    stats: {
      attackDamage: 20,
      critChance: 0.25,
      critDamage: 0.4,
    },
  },
  godric_lance: {
    id: 'godric_lance',
    name: "Godric's Dueling Lance",
    isArtifact: true,
    recipe: ['basilisk_fang', 'mana_gem'],
    description: '+20 AD, +15 Starting Mana, +5 Mana/sec. Basic attacks generate +5 additional Mana per strike.',
    icon: '🔱',
    stats: {
      attackDamage: 20,
      startingMana: 15,
      manaPerSecond: 5,
    },
    passiveEffect: {
      type: 'EXTRA_ATTACK_MANA',
      value: 5,
      description: 'Attacks generate +5 additional Mana.',
    },
  },
  centaur_greatbow: {
    id: 'centaur_greatbow',
    name: "Centaur's Starlight Greatbow",
    isArtifact: true,
    recipe: ['basilisk_fang', 'dragon_scale'],
    description: '+20 AD, +30 Armor. Basic attacks deal bonus physical damage equal to 12% of total Armor.',
    icon: '🏹',
    stats: {
      attackDamage: 20,
      armor: 30,
    },
  },
  half_blood_dagger: {
    id: 'half_blood_dagger',
    name: 'Silver Dagger of the Half-Blood Prince',
    isArtifact: true,
    recipe: ['basilisk_fang', 'mandrake_leaf'],
    description: '+20 AD, +30 MR. Holder gains +25% Physical Lifesteal. At 40% HP, cleanses CC and gains +30% AS.',
    icon: '🗡️',
    stats: {
      attackDamage: 20,
      magicResist: 30,
    },
    passiveEffect: {
      type: 'LIFESTEAL',
      value: 0.25,
      description: 'Heals for 25% of physical damage dealt.',
    },
  },
  grawp_club: {
    id: 'grawp_club',
    name: "Grawp's Uprooted Club",
    isArtifact: true,
    recipe: ['basilisk_fang', 'phoenix_feather'],
    description: '+20 AD, +300 HP. Basic attacks deal bonus physical damage equal to 4% of maximum HP.',
    icon: '🪵',
    stats: {
      attackDamage: 20,
      hp: 300,
    },
  },
  firebolt_striker: {
    id: 'firebolt_striker',
    name: 'Firebolt 2000 Striker',
    isArtifact: true,
    recipe: ['basilisk_fang', 'quicksilver'],
    description: '+20 AD, +25% AS. Every 3rd basic attack unleashes a piercing wind blade dealing 175% AD in a line.',
    icon: '⚡',
    stats: {
      attackDamage: 20,
      attackSpeed: 0.25,
    },
  },

  // ==========================================
  // 🪙 Golden Snitch Shard Combinations
  // ==========================================
  marauders_map: {
    id: 'marauders_map',
    name: "Marauder's Enchanted Map",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'golden_snitch_shard'],
    description: '+30% Crit Chance, +20% Crit Damage. Critical strikes execute non-boss enemy units below 8% max HP.',
    icon: '🗺️',
    stats: {
      critChance: 0.3,
      critDamage: 0.2,
    },
    passiveEffect: {
      type: 'EXECUTE',
      value: 0.08,
      description: 'Executes enemies below 8% HP on crit.',
    },
  },
  time_turner: {
    id: 'time_turner',
    name: "Hermione's Time-Turner",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mana_gem'],
    description: '+20% Crit Chance, +15 Starting Mana, +5 Mana/sec. Critical strikes instantly restore 10 Mana.',
    icon: '⏳',
    stats: {
      critChance: 0.2,
      startingMana: 15,
      manaPerSecond: 5,
    },
    passiveEffect: {
      type: 'CRIT_MANA',
      value: 10,
      description: 'Critical strikes restore 10 Mana.',
    },
  },
  invisibility_cloak: {
    id: 'invisibility_cloak',
    name: 'Invisibility Cloak of Ignotus',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'dragon_scale'],
    description: '+30 Armor, +20% Crit Chance, +15% Dodge. Dodges first 2 enemy spells/attacks and becomes untargetable for 1.5s.',
    icon: '🧥',
    stats: {
      armor: 30,
      critChance: 0.2,
      dodgeChance: 0.15,
    },
  },
  ravenclaw_diadem: {
    id: 'ravenclaw_diadem',
    name: "Ravenclaw's Diadem of Wit",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mandrake_leaf'],
    description: '+30 MR, +20% Crit Chance. When casting an ability, silences the target for 3.0s (preventing mana gain & casting).',
    icon: '👑',
    stats: {
      magicResist: 30,
      critChance: 0.2,
    },
    passiveEffect: {
      type: 'SILENCE_ON_CAST',
      value: 3.0,
      description: 'Silences target for 3s on ability cast.',
    },
  },
  fawkes_tears: {
    id: 'fawkes_tears',
    name: "Fawkes' Tears Relic",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'phoenix_feather'],
    description: '+250 HP, +20% Crit Chance. Upon taking lethal damage, revives holder with 40% max HP and full Mana.',
    icon: '💧',
    stats: {
      hp: 250,
      critChance: 0.2,
    },
    passiveEffect: {
      type: 'REVIVE',
      value: 0.4,
      description: 'Revives with 40% HP upon lethal damage.',
    },
  },
  snitch_accelerators: {
    id: 'snitch_accelerators',
    name: 'Snitch-Winged Accelerators',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'quicksilver'],
    description: '+25% AS, +25% Crit Chance. Critical strikes grant a burst of +50% movement speed and +40% AS for 2s.',
    icon: '🪽',
    stats: {
      attackSpeed: 0.25,
      critChance: 0.25,
    },
  },

  // ==========================================
  // 💎 Mana Gem Combinations
  // ==========================================
  goblet_of_fire: {
    id: 'goblet_of_fire',
    name: 'The Goblet of Fire',
    isArtifact: true,
    recipe: ['mana_gem', 'mana_gem'],
    description: '+30 Starting Mana, +10 Mana/sec. After casting an ability, immediately refunds 20 Mana.',
    icon: '🏆',
    stats: {
      startingMana: 30,
      manaPerSecond: 10,
    },
    passiveEffect: {
      type: 'MANA_REFUND',
      value: 20,
      description: 'Refunds 20 Mana upon casting ability.',
    },
  },
  dementors_frost: {
    id: 'dementors_frost',
    name: "Azkaban Dementor's Frost",
    isArtifact: true,
    recipe: ['mana_gem', 'dragon_scale'],
    description: '+30 Armor, +15 Starting Mana, +5 Mana/sec. Slows attack speed of adjacent enemies by 30%.',
    icon: '❄️',
    stats: {
      armor: 30,
      startingMana: 15,
      manaPerSecond: 5,
    },
    passiveEffect: {
      type: 'AS_SLOW_AURA',
      value: 0.3,
      description: 'Slows adjacent enemies attack speed by 30%.',
    },
  },
  mandrake_draught: {
    id: 'mandrake_draught',
    name: 'Mandrake Restorative Draught',
    isArtifact: true,
    recipe: ['mana_gem', 'mandrake_leaf'],
    description: '+30 MR, +15 Starting Mana, +5 Mana/sec. Grants +20% AP and +10 Mana/sec to holder & same-row allies at start.',
    icon: '🏺',
    stats: {
      magicResist: 30,
      startingMana: 15,
      manaPerSecond: 5,
    },
  },
  phoenix_beacon: {
    id: 'phoenix_beacon',
    name: "Order's Phoenix Beacon",
    isArtifact: true,
    recipe: ['mana_gem', 'phoenix_feather'],
    description: '+250 HP, +15 Starting Mana, +5 Mana/sec. When holder dies, heals all allies for 25% max HP and gives 20 Mana.',
    icon: '🔥',
    stats: {
      hp: 250,
      startingMana: 15,
      manaPerSecond: 5,
    },
    passiveEffect: {
      type: 'DEATH_TEAM_HEAL',
      value: 0.25,
      description: 'Heals all allies for 25% HP upon death.',
    },
  },
  storm_wand: {
    id: 'storm_wand',
    name: 'Storm-Charmed Wand of Grindelwald',
    isArtifact: true,
    recipe: ['mana_gem', 'quicksilver'],
    description: '+25% AS, +15 Starting Mana, +5 Mana/sec. Every 3rd attack releases lightning hitting 4 foes for 150 magic dmg & shredding MR.',
    icon: '⚡',
    stats: {
      attackSpeed: 0.25,
      startingMana: 15,
      manaPerSecond: 5,
    },
    passiveEffect: {
      type: 'CHAIN_LIGHTNING',
      value: 150,
      description: 'Every 3rd attack hits 4 enemies with lightning.',
    },
  },

  // ==========================================
  // 🛡️ Dragon Scale Combinations
  // ==========================================
  hogwarts_bastion: {
    id: 'hogwarts_bastion',
    name: 'Hogwarts Castle Bastion Armor',
    isArtifact: true,
    recipe: ['dragon_scale', 'dragon_scale'],
    description: '+60 Armor. Negates incoming critical strike bonus damage and reflects 100 magic damage to attackers.',
    icon: '🏰',
    stats: {
      armor: 60,
    },
    passiveEffect: {
      type: 'THORNS',
      value: 100,
      description: 'Reflects 100 magic damage on taking physical hits.',
    },
  },
  aegis_of_order: {
    id: 'aegis_of_order',
    name: 'Aegis of the Order',
    isArtifact: true,
    recipe: ['dragon_scale', 'mandrake_leaf'],
    description: '+30 Armor, +30 MR. At combat start, taunts adjacent enemies and grants 25% damage reduction for 6s.',
    icon: '🛡️',
    stats: {
      armor: 30,
      magicResist: 30,
    },
  },
  gryffindor_vest: {
    id: 'gryffindor_vest',
    name: "Gryffindor's Lion Vest",
    isArtifact: true,
    recipe: ['dragon_scale', 'phoenix_feather'],
    description: '+300 HP, +40 Armor. Regenerates 2% maximum HP per second.',
    icon: '🥋',
    stats: {
      hp: 300,
      armor: 40,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.02,
      description: 'Heals 2% max HP per second.',
    },
  },
  dragonhide_quidditch_armor: {
    id: 'dragonhide_quidditch_armor',
    name: 'Dragonhide Quidditch Armor',
    isArtifact: true,
    recipe: ['dragon_scale', 'quicksilver'],
    description: '+30 Armor, +20% AS. Dealing or taking damage grants +2 Armor and +2% AD (stacks up to 25 times).',
    icon: '🧥',
    stats: {
      armor: 30,
      attackSpeed: 0.2,
    },
  },

  // ==========================================
  // 🌿 Mandrake Leaf Combinations
  // ==========================================
  dragonhide_cloak: {
    id: 'dragonhide_cloak',
    name: 'Dragonhide Cloak of Dragonologists',
    isArtifact: true,
    recipe: ['mandrake_leaf', 'mandrake_leaf'],
    description: '+60 MR. Takes 50% reduced magic damage from all enemy abilities and spells.',
    icon: '🐉',
    stats: {
      magicResist: 60,
    },
  },
  resilient_cloak: {
    id: 'resilient_cloak',
    name: "Hufflepuff's Resilient Cloak",
    isArtifact: true,
    recipe: ['mandrake_leaf', 'phoenix_feather'],
    description: '+250 HP, +35 MR. Emits an aura reducing magic damage taken by adjacent allies by 30%.',
    icon: '🦡',
    stats: {
      hp: 250,
      magicResist: 35,
    },
    passiveEffect: {
      type: 'MAGIC_DAMAGE_AURA',
      value: 0.3,
      description: 'Reduces nearby enemy magic damage by 30%.',
    },
  },
  silver_quicksilver_charm: {
    id: 'silver_quicksilver_charm',
    name: 'Silver Quicksilver Charm',
    isArtifact: true,
    recipe: ['mandrake_leaf', 'quicksilver'],
    description: '+30 MR, +20% AS. Immune to crowd control effects and stuns for the first 10 seconds of combat.',
    icon: '🔮',
    stats: {
      magicResist: 30,
      attackSpeed: 0.2,
    },
  },

  // ==========================================
  // 🪶 Phoenix Feather Combinations
  // ==========================================
  horntail_hide: {
    id: 'horntail_hide',
    name: 'Hungarian Horntail Dragon Hide',
    isArtifact: true,
    recipe: ['phoenix_feather', 'phoenix_feather'],
    description: '+800 Maximum HP. Holder regenerates 5% missing health per second.',
    icon: '🐲',
    stats: {
      hp: 800,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.05,
      description: 'Regenerates 5% missing HP per second.',
    },
  },
  beater_bat: {
    id: 'beater_bat',
    name: "Beater's Ironwood Bludger Bat",
    isArtifact: true,
    recipe: ['phoenix_feather', 'quicksilver'],
    description: '+250 HP, +25% AS. Basic attacks knock back the target and deal 5% max HP bonus physical damage.',
    icon: '🏏',
    stats: {
      hp: 250,
      attackSpeed: 0.25,
    },
  },

  // ==========================================
  // ⚡ Quick-Silver Combinations
  // ==========================================
  nimbus_2001: {
    id: 'nimbus_2001',
    name: 'Nimbus 2001 Racing Vanes',
    isArtifact: true,
    recipe: ['quicksilver', 'quicksilver'],
    description: '+50% Attack Speed. Basic attacks permanently stack +5% Attack Speed for the rest of combat.',
    icon: '🧹',
    stats: {
      attackSpeed: 0.5,
    },
  },
};

export const ALL_ITEMS: Record<string, ItemDefinition> = {
  ...BASE_ITEMS,
  ...ARTIFACT_ITEMS,
};

export function combineItems(itemA: string, itemB: string): ItemDefinition | null {
  for (const artifact of Object.values(ARTIFACT_ITEMS)) {
    if (!artifact.recipe) continue;
    const [r1, r2] = artifact.recipe;
    if ((r1 === itemA && r2 === itemB) || (r1 === itemB && r2 === itemA)) {
      return artifact;
    }
  }
  return null;
}
