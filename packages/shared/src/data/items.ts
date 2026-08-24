import { BaseItemId, ItemDefinition } from '../types/item.js';

export const BASE_ITEMS: Record<BaseItemId, ItemDefinition> = {
  wand_core: {
    id: 'wand_core',
    name: 'Wand Core',
    isArtifact: false,
    description: '+8% Ability Power',
    icon: '🪄',
    stats: {
      abilityPower: 0.08,
    },
  },
  basilisk_fang: {
    id: 'basilisk_fang',
    name: 'Basilisk Fang',
    isArtifact: false,
    description: '+8 Attack Damage',
    icon: '🐍',
    stats: {
      attackDamage: 8,
    },
  },
  golden_snitch_shard: {
    id: 'golden_snitch_shard',
    name: 'Golden Snitch Shard',
    isArtifact: false,
    description: '+10% Crit & +2% Dodge',
    icon: '🪙',
    stats: {
      critChance: 0.1,
      dodgeChance: 0.02,
    },
  },
  mana_gem: {
    id: 'mana_gem',
    name: 'Pensieve Tear',
    isArtifact: false,
    description: '+8 Start Mana & +2 Mana/s',
    icon: '💧',
    stats: {
      startingMana: 8,
      manaPerSecond: 2,
    },
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    isArtifact: false,
    description: '+12 Armor',
    icon: '🐉',
    stats: {
      armor: 12,
    },
  },
  mandrake_leaf: {
    id: 'mandrake_leaf',
    name: 'Mandrake Leaf',
    isArtifact: false,
    description: '+12 Magic Resist',
    icon: '🪴',
    stats: {
      magicResist: 12,
    },
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    isArtifact: false,
    description: '+100 Health',
    icon: '🪶',
    stats: {
      hp: 100,
    },
  },
  quicksilver: {
    id: 'quicksilver',
    name: 'Liquid Quicksilver',
    isArtifact: false,
    description: '+10% Attack Speed',
    icon: '🧪',
    stats: {
      attackSpeed: 0.1,
    },
  },
};

export const ARTIFACT_ITEMS: Record<string, ItemDefinition> = {
  // ==========================================
  // 🪄 Wand Core Combinations
  // ==========================================
  elder_wand: {
    id: 'elder_wand',
    name: 'The Elder Wand',
    isArtifact: true,
    recipe: ['wand_core', 'wand_core'],
    description: '+28% Magic Damage; spells can critically strike for 140% damage.',
    icon: '🪄',
    stats: {
      abilityPower: 0.28,
      critChance: 0.16,
    },
    passiveEffect: {
      type: 'SPELL_CRIT',
      value: 0.4,
      description: 'Spells can critically strike for 140% damage.',
    },
  },
  sword_of_gryffindor: {
    id: 'sword_of_gryffindor',
    name: 'Sword of Gryffindor',
    isArtifact: true,
    recipe: ['wand_core', 'basilisk_fang'],
    description: '+14 AD, +14% AP. Attacks deal 12% bonus magic dmg; spells deal 12% bonus phys dmg. Grants 10% Omnivamp.',
    icon: '⚔️',
    signatureUnits: ['godric_gryffindor'],
    signatureDescription: 'Founder Resonance: Godric Gryffindor gains +35% Attack Damage & 20% Omnivamp.',
    stats: {
      attackDamage: 14,
      abilityPower: 0.14,
    },
    passiveEffect: {
      type: 'OMNIVAMP',
      value: 0.1,
      description: 'Heals for 10% of all damage dealt.',
    },
  },
  resurrection_stone: {
    id: 'resurrection_stone',
    name: 'Resurrection Stone Ring',
    isArtifact: true,
    recipe: ['wand_core', 'golden_snitch_shard'],
    description: '+12% AP, +16% Crit Chance, +18% Crit Damage. Critical spell casts deal 32% bonus critical damage.',
    icon: '💍',
    stats: {
      abilityPower: 0.12,
      critChance: 0.16,
      critDamage: 0.18,
    },
    passiveEffect: {
      type: 'SPELL_CRIT_BONUS',
      value: 0.32,
      description: 'Spells deal +32% critical damage.',
    },
  },
  deluminator: {
    id: 'deluminator',
    name: "Dumbledore's Deluminator",
    isArtifact: true,
    recipe: ['wand_core', 'mana_gem'],
    description: '+14% AP, +12 Starting Mana, +2 Mana/sec. Permanently gains +6% AP for every 20 Mana spent.',
    icon: '✨',
    stats: {
      abilityPower: 0.14,
      startingMana: 12,
      manaPerSecond: 2,
    },
  },
  protego_brooch: {
    id: 'protego_brooch',
    name: 'Protego Shield Brooch',
    isArtifact: true,
    recipe: ['wand_core', 'dragon_scale'],
    description: '+12% AP, +18 Armor. Combat start grants a 180 HP shield to holder and 2 adjacent allies for 8s.',
    icon: '🛡️',
    stats: {
      abilityPower: 0.12,
      armor: 18,
    },
    passiveEffect: {
      type: 'COMBAT_START_SHIELD',
      value: 180,
      description: 'Grants 180 HP shield to adjacent allies.',
    },
  },
  hufflepuff_cup: {
    id: 'hufflepuff_cup',
    name: "Hufflepuff's Golden Cup",
    isArtifact: true,
    recipe: ['wand_core', 'mandrake_leaf'],
    description: '+12% AP, +18 MR. On ability cast, heals the 2 lowest-health allies for 180 HP.',
    icon: '🏆',
    signatureDescription: 'House Resonance: All Hufflepuff units gain +250 Max HP and heal for 15% of damage dealt.',
    stats: {
      abilityPower: 0.12,
      magicResist: 18,
    },
    passiveEffect: {
      type: 'CAST_HEAL',
      value: 180,
      description: 'Heals 2 lowest-health allies for 180 HP upon cast.',
    },
  },
  philosophers_stone: {
    id: 'philosophers_stone',
    name: "Philosopher's Stone Fragment",
    isArtifact: true,
    recipe: ['wand_core', 'phoenix_feather'],
    description: '+12% AP, +140 HP. Holder permanently stacks +1.2% AP every 2 seconds in combat.',
    icon: '💎',
    stats: {
      abilityPower: 0.12,
      hp: 140,
    },
  },
  spell_weaver_wand: {
    id: 'spell_weaver_wand',
    name: "Rowena's Diadem",
    isArtifact: true,
    recipe: ['wand_core', 'quicksilver'],
    description: '+12% AP, +14% AS. Basic attacks shred 30% enemy MR for 5s and grant +3% AS.',
    icon: '👑',
    signatureUnits: ['rowena_ravenclaw'],
    signatureDescription: 'Founder Resonance: Rowena Ravenclaw gains +35% Ability Power & +30 Starting Mana.',
    stats: {
      abilityPower: 0.12,
      attackSpeed: 0.14,
    },
    passiveEffect: {
      type: 'MR_SHRED',
      value: 0.3,
      description: 'Attacks shred target MR by 30% for 5s.',
    },
  },

  // ==========================================
  // 🐍 Basilisk Fang Combinations
  // ==========================================
  slytherin_blade: {
    id: 'slytherin_blade',
    name: "Slytherin's Poisoned Blade",
    isArtifact: true,
    recipe: ['basilisk_fang', 'basilisk_fang'],
    description: '+25 AD. Physical damage sunders 30% Armor for 5s and inflicts poison dealing 90 True Damage over 3s.',
    icon: '🐍',
    signatureUnits: ['salazar_slytherin'],
    signatureDescription: 'Founder Resonance: Salazar Slytherin executes enemies below 20% HP and basic attacks apply deadly venom.',
    stats: {
      attackDamage: 25,
    },
    passiveEffect: {
      type: 'ARMOR_PEN',
      value: 0.3,
      description: 'Sunders 30% armor and inflicts poison.',
    },
  },
  seeker_goggles: {
    id: 'seeker_goggles',
    name: "Seeker's Quidditch Goggles",
    isArtifact: true,
    recipe: ['basilisk_fang', 'golden_snitch_shard'],
    description: '+12 AD, +16% Crit Chance, +22% Crit Damage. Physical attacks have 100% accuracy and cannot miss.',
    icon: '🥽',
    stats: {
      attackDamage: 12,
      critChance: 0.16,
      critDamage: 0.22,
    },
  },
  godric_lance: {
    id: 'godric_lance',
    name: "Godric's Dueling Lance",
    isArtifact: true,
    recipe: ['basilisk_fang', 'mana_gem'],
    description: '+12 AD, +10 Starting Mana, +2 Mana/sec. Basic attacks generate +3 additional Mana per strike.',
    icon: '🔱',
    stats: {
      attackDamage: 12,
      startingMana: 10,
      manaPerSecond: 2,
    },
    passiveEffect: {
      type: 'EXTRA_ATTACK_MANA',
      value: 3,
      description: 'Attacks generate +3 additional Mana.',
    },
  },
  centaur_greatbow: {
    id: 'centaur_greatbow',
    name: "Centaur's Starlight Greatbow",
    isArtifact: true,
    recipe: ['basilisk_fang', 'dragon_scale'],
    description: '+12 AD, +18 Armor. Basic attacks deal bonus physical damage equal to 8% of total Armor.',
    icon: '🏹',
    stats: {
      attackDamage: 12,
      armor: 18,
    },
  },
  half_blood_dagger: {
    id: 'half_blood_dagger',
    name: 'Silver Dagger of the Half-Blood Prince',
    isArtifact: true,
    recipe: ['basilisk_fang', 'mandrake_leaf'],
    description: '+12 AD, +18 MR. Holder gains +14% Physical Lifesteal. At 40% HP, cleanses CC and gains +20% AS.',
    icon: '🗡️',
    stats: {
      attackDamage: 12,
      magicResist: 18,
    },
    passiveEffect: {
      type: 'LIFESTEAL',
      value: 0.14,
      description: 'Heals for 14% of physical damage dealt.',
    },
  },
  grawp_club: {
    id: 'grawp_club',
    name: "Grawp's Uprooted Club",
    isArtifact: true,
    recipe: ['basilisk_fang', 'phoenix_feather'],
    description: '+12 AD, +180 HP. Basic attacks deal bonus physical damage equal to 2.5% of maximum HP.',
    icon: '🪵',
    stats: {
      attackDamage: 12,
      hp: 180,
    },
  },
  firebolt_striker: {
    id: 'firebolt_striker',
    name: 'The Firebolt',
    isArtifact: true,
    recipe: ['basilisk_fang', 'quicksilver'],
    description: '+12 AD, +14% AS. Every 3rd basic attack unleashes a piercing wind blade dealing 120% AD in a line.',
    icon: '🧹',
    stats: {
      attackDamage: 12,
      attackSpeed: 0.14,
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
    description: '+18% Crit Chance, +12% Crit Damage. Critical strikes execute non-boss enemy units below 5% max HP.',
    icon: '🗺️',
    stats: {
      critChance: 0.18,
      critDamage: 0.12,
    },
    passiveEffect: {
      type: 'EXECUTE',
      value: 0.05,
      description: 'Executes enemies below 5% HP on crit.',
    },
  },
  time_turner: {
    id: 'time_turner',
    name: "Hermione's Time-Turner",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mana_gem'],
    description: '+12% Crit Chance, +10 Starting Mana, +2 Mana/sec. Critical strikes instantly restore 6 Mana.',
    icon: '⏳',
    stats: {
      critChance: 0.12,
      startingMana: 10,
      manaPerSecond: 2,
    },
    passiveEffect: {
      type: 'CRIT_MANA',
      value: 6,
      description: 'Critical strikes restore 6 Mana.',
    },
  },
  invisibility_cloak: {
    id: 'invisibility_cloak',
    name: 'Invisibility Cloak of Ignotus',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'dragon_scale'],
    description: '+18 Armor, +12% Crit Chance, +8% Dodge. Dodges first 2 enemy spells/attacks and becomes untargetable for 1.0s.',
    icon: '🧥',
    stats: {
      armor: 18,
      critChance: 0.12,
      dodgeChance: 0.08,
    },
  },
  ravenclaw_diadem: {
    id: 'ravenclaw_diadem',
    name: "Ravenclaw's Lost Diadem",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mandrake_leaf'],
    description: '+18 MR, +12% Crit Chance. When casting an ability, silences the target for 1.8s.',
    icon: '👑',
    stats: {
      magicResist: 18,
      critChance: 0.12,
    },
    passiveEffect: {
      type: 'SILENCE_ON_CAST',
      value: 1.8,
      description: 'Silences target for 1.8s on ability cast.',
    },
  },
  fawkes_tears: {
    id: 'fawkes_tears',
    name: "Fawkes' Tears Relic",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'phoenix_feather'],
    description: '+140 HP, +12% Crit Chance. Upon taking lethal damage, revives holder with 25% max HP and full Mana.',
    icon: '💧',
    stats: {
      hp: 140,
      critChance: 0.12,
    },
    passiveEffect: {
      type: 'REVIVE',
      value: 0.25,
      description: 'Revives with 25% HP upon lethal damage.',
    },
  },
  snitch_accelerators: {
    id: 'snitch_accelerators',
    name: 'Snitch-Winged Quidditch Boots',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'quicksilver'],
    description: '+14% AS, +14% Crit Chance. Critical strikes grant a burst of +30% movement speed and +25% AS for 2s.',
    icon: '🪽',
    stats: {
      attackSpeed: 0.14,
      critChance: 0.14,
    },
  },

  // ==========================================
  // 💧 Pensieve Tear Combinations
  // ==========================================
  goblet_of_fire: {
    id: 'goblet_of_fire',
    name: 'The Goblet of Fire',
    isArtifact: true,
    recipe: ['mana_gem', 'mana_gem'],
    description: '+18 Starting Mana, +4 Mana/sec. After casting an ability, immediately refunds 12 Mana.',
    icon: '🏆',
    stats: {
      startingMana: 18,
      manaPerSecond: 4,
    },
    passiveEffect: {
      type: 'MANA_REFUND',
      value: 12,
      description: 'Refunds 12 Mana upon casting ability.',
    },
  },
  dementors_frost: {
    id: 'dementors_frost',
    name: "Azkaban Dementor's Frost",
    isArtifact: true,
    recipe: ['mana_gem', 'dragon_scale'],
    description: '+18 Armor, +10 Starting Mana, +2 Mana/sec. Slows attack speed of adjacent enemies by 18%.',
    icon: '❄️',
    stats: {
      armor: 18,
      startingMana: 10,
      manaPerSecond: 2,
    },
    passiveEffect: {
      type: 'AS_SLOW_AURA',
      value: 0.18,
      description: 'Slows adjacent enemies attack speed by 18%.',
    },
  },
  mandrake_draught: {
    id: 'mandrake_draught',
    name: 'Mandrake Restorative Draught',
    isArtifact: true,
    recipe: ['mana_gem', 'mandrake_leaf'],
    description: '+18 MR, +10 Starting Mana, +2 Mana/sec. Grants +12% AP and +4 Mana/sec to holder & same-row allies at start.',
    icon: '🏺',
    stats: {
      magicResist: 18,
      startingMana: 10,
      manaPerSecond: 2,
    },
  },
  phoenix_beacon: {
    id: 'phoenix_beacon',
    name: "Order's Phoenix Beacon",
    isArtifact: true,
    recipe: ['mana_gem', 'phoenix_feather'],
    description: '+140 HP, +10 Starting Mana, +2 Mana/sec. When holder dies, heals all allies for 15% max HP and gives 12 Mana.',
    icon: '🔥',
    stats: {
      hp: 140,
      startingMana: 10,
      manaPerSecond: 2,
    },
    passiveEffect: {
      type: 'DEATH_TEAM_HEAL',
      value: 0.15,
      description: 'Heals all allies for 15% HP upon death.',
    },
  },
  storm_wand: {
    id: 'storm_wand',
    name: "Grindelwald's Storm Wand",
    isArtifact: true,
    recipe: ['mana_gem', 'quicksilver'],
    description: '+14% AS, +10 Starting Mana, +2 Mana/sec. Every 3rd attack releases lightning hitting 4 foes for 90 magic dmg & shredding 30% MR.',
    icon: '⚡',
    stats: {
      attackSpeed: 0.14,
      startingMana: 10,
      manaPerSecond: 2,
    },
    passiveEffect: {
      type: 'CHAIN_LIGHTNING',
      value: 90,
      description: 'Every 3rd attack hits 4 enemies with lightning and shreds 30% MR.',
    },
  },

  // ==========================================
  // 🐉 Dragon Scale Combinations
  // ==========================================
  hogwarts_bastion: {
    id: 'hogwarts_bastion',
    name: 'Hogwarts Castle Bastion Armor',
    isArtifact: true,
    recipe: ['dragon_scale', 'dragon_scale'],
    description: '+36 Armor. Negates incoming critical strike bonus damage and reflects 60 magic damage to attackers.',
    icon: '🏰',
    stats: {
      armor: 36,
    },
    passiveEffect: {
      type: 'THORNS',
      value: 60,
      description: 'Reflects 60 magic damage on taking physical hits.',
    },
  },
  aegis_of_order: {
    id: 'aegis_of_order',
    name: 'Order of the Phoenix Crest',
    isArtifact: true,
    recipe: ['dragon_scale', 'mandrake_leaf'],
    description: '+18 Armor, +18 MR. At combat start, taunts adjacent enemies and grants 16% damage reduction for 5s.',
    icon: '🛡️',
    signatureDescription: 'Alliance Resonance: All Order of the Phoenix units gain +20% Attack Speed and +20 Armor/MR.',
    stats: {
      armor: 18,
      magicResist: 18,
    },
  },
  gryffindor_vest: {
    id: 'gryffindor_vest',
    name: "Gryffindor's Lion Vest",
    isArtifact: true,
    recipe: ['dragon_scale', 'phoenix_feather'],
    description: '+180 HP, +22 Armor. Regenerates 1.2% maximum HP per second.',
    icon: '🦁',
    stats: {
      hp: 180,
      armor: 22,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.012,
      description: 'Heals 1.2% max HP per second.',
    },
  },
  dragonhide_quidditch_armor: {
    id: 'dragonhide_quidditch_armor',
    name: 'Dragonhide Quidditch Armor',
    isArtifact: true,
    recipe: ['dragon_scale', 'quicksilver'],
    description: '+18 Armor, +12% AS. Dealing or taking damage grants +1.2 Armor and +1.2% AD (stacks up to 25 times).',
    icon: '🧥',
    stats: {
      armor: 18,
      attackSpeed: 0.12,
    },
  },

  // ==========================================
  // 🪴 Mandrake Leaf Combinations
  // ==========================================
  dragonhide_cloak: {
    id: 'dragonhide_cloak',
    name: 'Dragonhide Dragonologist Cloak',
    isArtifact: true,
    recipe: ['mandrake_leaf', 'mandrake_leaf'],
    description: '+36 MR. Takes 32% reduced magic damage from all enemy abilities and spells.',
    icon: '🐉',
    stats: {
      magicResist: 36,
    },
  },
  resilient_cloak: {
    id: 'resilient_cloak',
    name: "Hufflepuff's Resilient Cloak",
    isArtifact: true,
    recipe: ['mandrake_leaf', 'phoenix_feather'],
    description: '+140 HP, +20 MR. Emits an aura reducing magic damage taken by adjacent allies by 18%.',
    icon: '🦡',
    stats: {
      hp: 140,
      magicResist: 20,
    },
    passiveEffect: {
      type: 'MAGIC_DAMAGE_AURA',
      value: 0.18,
      description: 'Reduces nearby enemy magic damage by 18%.',
    },
  },
  silver_quicksilver_charm: {
    id: 'silver_quicksilver_charm',
    name: 'Silver Quicksilver Charm',
    isArtifact: true,
    recipe: ['mandrake_leaf', 'quicksilver'],
    description: '+18 MR, +12% AS. Immune to crowd control effects and stuns for the first 7 seconds of combat.',
    icon: '🧪',
    stats: {
      magicResist: 18,
      attackSpeed: 0.12,
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
    description: '+440 Maximum HP. Holder regenerates 3.2% missing health per second.',
    icon: '🐲',
    stats: {
      hp: 440,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.032,
      description: 'Regenerates 3.2% missing HP per second.',
    },
  },
  beater_bat: {
    id: 'beater_bat',
    name: "Beater's Ironwood Bludger Bat",
    isArtifact: true,
    recipe: ['phoenix_feather', 'quicksilver'],
    description: '+140 HP, +14% AS. Basic attacks knock back the target and deal 3.2% max HP bonus physical damage.',
    icon: '🏏',
    stats: {
      hp: 140,
      attackSpeed: 0.14,
    },
  },

  // ==========================================
  // 🧪 Liquid Quicksilver Combinations
  // ==========================================
  nimbus_2001: {
    id: 'nimbus_2001',
    name: 'Nimbus 2001 Racing Broom',
    isArtifact: true,
    recipe: ['quicksilver', 'quicksilver'],
    description: '+28% Attack Speed. Basic attacks permanently stack +3% Attack Speed for the rest of combat.',
    icon: '🧹',
    stats: {
      attackSpeed: 0.28,
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
