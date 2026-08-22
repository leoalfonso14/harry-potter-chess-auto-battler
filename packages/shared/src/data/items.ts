import { BaseItemId, ItemDefinition } from '../types/item.js';

export const BASE_ITEMS: Record<BaseItemId, ItemDefinition> = {
  wand_core: {
    id: 'wand_core',
    name: 'Wand Core',
    isArtifact: false,
    description: '+10% Ability Power',
    icon: '🪄',
    stats: {
      abilityPower: 0.1,
    },
  },
  basilisk_fang: {
    id: 'basilisk_fang',
    name: 'Basilisk Fang',
    isArtifact: false,
    description: '+10 Attack Damage',
    icon: '🗡️',
    stats: {
      attackDamage: 10,
    },
  },
  golden_snitch_shard: {
    id: 'golden_snitch_shard',
    name: 'Golden Snitch Shard',
    isArtifact: false,
    description: '+12% Crit & +3% Dodge',
    icon: '🪙',
    stats: {
      critChance: 0.12,
      dodgeChance: 0.03,
    },
  },
  mana_gem: {
    id: 'mana_gem',
    name: 'Pensieve Crystal',
    isArtifact: false,
    description: '+10 Start Mana & +3 Mana/s',
    icon: '💎',
    stats: {
      startingMana: 10,
      manaPerSecond: 3,
    },
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    isArtifact: false,
    description: '+15 Armor',
    icon: '🛡️',
    stats: {
      armor: 15,
    },
  },
  mandrake_leaf: {
    id: 'mandrake_leaf',
    name: 'Mandrake Leaf',
    isArtifact: false,
    description: '+15 Magic Resist',
    icon: '🌿',
    stats: {
      magicResist: 15,
    },
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    isArtifact: false,
    description: '+130 Health',
    icon: '🪶',
    stats: {
      hp: 130,
    },
  },
  quicksilver: {
    id: 'quicksilver',
    name: 'Quicksilver Mercury',
    isArtifact: false,
    description: '+12% Attack Speed',
    icon: '⚡',
    stats: {
      attackSpeed: 0.12,
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
    description: '+35% Magic Damage; spells can critically strike for 150% damage.',
    icon: '🔮',
    stats: {
      abilityPower: 0.35,
      critChance: 0.2,
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
    description: '+18 AD, +18% AP. Attacks deal 15% bonus magic dmg; spells deal 15% bonus phys dmg. Grants 12% Omnivamp.',
    icon: '⚔️',
    stats: {
      attackDamage: 18,
      abilityPower: 0.18,
    },
    passiveEffect: {
      type: 'OMNIVAMP',
      value: 0.12,
      description: 'Heals for 12% of all damage dealt.',
    },
  },
  resurrection_stone: {
    id: 'resurrection_stone',
    name: 'Resurrection Stone Signet',
    isArtifact: true,
    recipe: ['wand_core', 'golden_snitch_shard'],
    description: '+15% AP, +20% Crit Chance, +22% Crit Damage. Critical spell casts deal 40% bonus critical damage.',
    icon: '💍',
    stats: {
      abilityPower: 0.15,
      critChance: 0.2,
      critDamage: 0.22,
    },
    passiveEffect: {
      type: 'SPELL_CRIT_BONUS',
      value: 0.4,
      description: 'Spells deal +40% critical damage.',
    },
  },
  deluminator: {
    id: 'deluminator',
    name: "Dumbledore's Deluminator",
    isArtifact: true,
    recipe: ['wand_core', 'mana_gem'],
    description: '+18% AP, +15 Starting Mana, +3 Mana/sec. Permanently gains +8% AP for every 20 Mana spent.',
    icon: '✨',
    stats: {
      abilityPower: 0.18,
      startingMana: 15,
      manaPerSecond: 3,
    },
  },
  protego_brooch: {
    id: 'protego_brooch',
    name: 'Protego Shield Brooch',
    isArtifact: true,
    recipe: ['wand_core', 'dragon_scale'],
    description: '+15% AP, +22 Armor. Combat start grants a 220 HP shield to holder and 2 adjacent allies for 8s.',
    icon: '🛡️',
    stats: {
      abilityPower: 0.15,
      armor: 22,
    },
    passiveEffect: {
      type: 'COMBAT_START_SHIELD',
      value: 220,
      description: 'Grants 220 HP shield to adjacent allies.',
    },
  },
  hufflepuff_cup: {
    id: 'hufflepuff_cup',
    name: "Hufflepuff's Golden Cup",
    isArtifact: true,
    recipe: ['wand_core', 'mandrake_leaf'],
    description: '+15% AP, +22 MR. On ability cast, heals the 2 lowest-health allies for 220 HP.',
    icon: '🏆',
    stats: {
      abilityPower: 0.15,
      magicResist: 22,
    },
    passiveEffect: {
      type: 'CAST_HEAL',
      value: 220,
      description: 'Heals 2 lowest-health allies for 220 HP upon cast.',
    },
  },
  philosophers_stone: {
    id: 'philosophers_stone',
    name: "Philosopher's Stone Fragment",
    isArtifact: true,
    recipe: ['wand_core', 'phoenix_feather'],
    description: '+15% AP, +180 HP. Holder permanently stacks +1.5% AP every 2 seconds in combat.',
    icon: '🪨',
    stats: {
      abilityPower: 0.15,
      hp: 180,
    },
  },
  spell_weaver_wand: {
    id: 'spell_weaver_wand',
    name: "Rowena's Spell-Weaver Wand",
    isArtifact: true,
    recipe: ['wand_core', 'quicksilver'],
    description: '+15% AP, +18% AS. Basic attacks shred 8% enemy MR (up to 40%) and grant +4% AS.',
    icon: '🪄',
    stats: {
      abilityPower: 0.15,
      attackSpeed: 0.18,
    },
    passiveEffect: {
      type: 'MR_SHRED',
      value: 0.08,
      description: 'Attacks reduce target MR by 8%.',
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
    description: '+32 AD. Physical damage ignores 25% Armor and inflicts poison dealing 110 True Damage over 3s.',
    icon: '🗡️',
    stats: {
      attackDamage: 32,
    },
    passiveEffect: {
      type: 'ARMOR_PEN',
      value: 0.25,
      description: 'Ignores 25% armor and inflicts poison.',
    },
  },
  seeker_goggles: {
    id: 'seeker_goggles',
    name: "Seeker's Quidditch Goggles",
    isArtifact: true,
    recipe: ['basilisk_fang', 'golden_snitch_shard'],
    description: '+15 AD, +20% Crit Chance, +28% Crit Damage. Physical attacks have 100% accuracy and cannot miss.',
    icon: '🥽',
    stats: {
      attackDamage: 15,
      critChance: 0.2,
      critDamage: 0.28,
    },
  },
  godric_lance: {
    id: 'godric_lance',
    name: "Godric's Dueling Lance",
    isArtifact: true,
    recipe: ['basilisk_fang', 'mana_gem'],
    description: '+15 AD, +12 Starting Mana, +3 Mana/sec. Basic attacks generate +4 additional Mana per strike.',
    icon: '🔱',
    stats: {
      attackDamage: 15,
      startingMana: 12,
      manaPerSecond: 3,
    },
    passiveEffect: {
      type: 'EXTRA_ATTACK_MANA',
      value: 4,
      description: 'Attacks generate +4 additional Mana.',
    },
  },
  centaur_greatbow: {
    id: 'centaur_greatbow',
    name: "Centaur's Starlight Greatbow",
    isArtifact: true,
    recipe: ['basilisk_fang', 'dragon_scale'],
    description: '+15 AD, +22 Armor. Basic attacks deal bonus physical damage equal to 10% of total Armor.',
    icon: '🏹',
    stats: {
      attackDamage: 15,
      armor: 22,
    },
  },
  half_blood_dagger: {
    id: 'half_blood_dagger',
    name: 'Silver Dagger of the Half-Blood Prince',
    isArtifact: true,
    recipe: ['basilisk_fang', 'mandrake_leaf'],
    description: '+15 AD, +22 MR. Holder gains +18% Physical Lifesteal. At 40% HP, cleanses CC and gains +25% AS.',
    icon: '🗡️',
    stats: {
      attackDamage: 15,
      magicResist: 22,
    },
    passiveEffect: {
      type: 'LIFESTEAL',
      value: 0.18,
      description: 'Heals for 18% of physical damage dealt.',
    },
  },
  grawp_club: {
    id: 'grawp_club',
    name: "Grawp's Uprooted Club",
    isArtifact: true,
    recipe: ['basilisk_fang', 'phoenix_feather'],
    description: '+15 AD, +220 HP. Basic attacks deal bonus physical damage equal to 3% of maximum HP.',
    icon: '🪵',
    stats: {
      attackDamage: 15,
      hp: 220,
    },
  },
  firebolt_striker: {
    id: 'firebolt_striker',
    name: 'Firebolt 2000 Striker',
    isArtifact: true,
    recipe: ['basilisk_fang', 'quicksilver'],
    description: '+15 AD, +18% AS. Every 3rd basic attack unleashes a piercing wind blade dealing 140% AD in a line.',
    icon: '⚡',
    stats: {
      attackDamage: 15,
      attackSpeed: 0.18,
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
    description: '+22% Crit Chance, +15% Crit Damage. Critical strikes execute non-boss enemy units below 6% max HP.',
    icon: '🗺️',
    stats: {
      critChance: 0.22,
      critDamage: 0.15,
    },
    passiveEffect: {
      type: 'EXECUTE',
      value: 0.06,
      description: 'Executes enemies below 6% HP on crit.',
    },
  },
  time_turner: {
    id: 'time_turner',
    name: "Hermione's Time-Turner",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mana_gem'],
    description: '+15% Crit Chance, +12 Starting Mana, +3 Mana/sec. Critical strikes instantly restore 8 Mana.',
    icon: '⏳',
    stats: {
      critChance: 0.15,
      startingMana: 12,
      manaPerSecond: 3,
    },
    passiveEffect: {
      type: 'CRIT_MANA',
      value: 8,
      description: 'Critical strikes restore 8 Mana.',
    },
  },
  invisibility_cloak: {
    id: 'invisibility_cloak',
    name: 'Invisibility Cloak of Ignotus',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'dragon_scale'],
    description: '+22 Armor, +15% Crit Chance, +10% Dodge. Dodges first 2 enemy spells/attacks and becomes untargetable for 1.2s.',
    icon: '🧥',
    stats: {
      armor: 22,
      critChance: 0.15,
      dodgeChance: 0.1,
    },
  },
  ravenclaw_diadem: {
    id: 'ravenclaw_diadem',
    name: "Ravenclaw's Diadem of Wit",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'mandrake_leaf'],
    description: '+22 MR, +15% Crit Chance. When casting an ability, silences the target for 2.2s (preventing mana gain & casting).',
    icon: '👑',
    stats: {
      magicResist: 22,
      critChance: 0.15,
    },
    passiveEffect: {
      type: 'SILENCE_ON_CAST',
      value: 2.2,
      description: 'Silences target for 2.2s on ability cast.',
    },
  },
  fawkes_tears: {
    id: 'fawkes_tears',
    name: "Fawkes' Tears Relic",
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'phoenix_feather'],
    description: '+180 HP, +15% Crit Chance. Upon taking lethal damage, revives holder with 30% max HP and full Mana.',
    icon: '💧',
    stats: {
      hp: 180,
      critChance: 0.15,
    },
    passiveEffect: {
      type: 'REVIVE',
      value: 0.3,
      description: 'Revives with 30% HP upon lethal damage.',
    },
  },
  snitch_accelerators: {
    id: 'snitch_accelerators',
    name: 'Snitch-Winged Accelerators',
    isArtifact: true,
    recipe: ['golden_snitch_shard', 'quicksilver'],
    description: '+18% AS, +18% Crit Chance. Critical strikes grant a burst of +35% movement speed and +30% AS for 2s.',
    icon: '🪽',
    stats: {
      attackSpeed: 0.18,
      critChance: 0.18,
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
    description: '+22 Starting Mana, +6 Mana/sec. After casting an ability, immediately refunds 15 Mana.',
    icon: '🏆',
    stats: {
      startingMana: 22,
      manaPerSecond: 6,
    },
    passiveEffect: {
      type: 'MANA_REFUND',
      value: 15,
      description: 'Refunds 15 Mana upon casting ability.',
    },
  },
  dementors_frost: {
    id: 'dementors_frost',
    name: "Azkaban Dementor's Frost",
    isArtifact: true,
    recipe: ['mana_gem', 'dragon_scale'],
    description: '+22 Armor, +12 Starting Mana, +3 Mana/sec. Slows attack speed of adjacent enemies by 22%.',
    icon: '❄️',
    stats: {
      armor: 22,
      startingMana: 12,
      manaPerSecond: 3,
    },
    passiveEffect: {
      type: 'AS_SLOW_AURA',
      value: 0.22,
      description: 'Slows adjacent enemies attack speed by 22%.',
    },
  },
  mandrake_draught: {
    id: 'mandrake_draught',
    name: 'Mandrake Restorative Draught',
    isArtifact: true,
    recipe: ['mana_gem', 'mandrake_leaf'],
    description: '+22 MR, +12 Starting Mana, +3 Mana/sec. Grants +15% AP and +6 Mana/sec to holder & same-row allies at start.',
    icon: '🏺',
    stats: {
      magicResist: 22,
      startingMana: 12,
      manaPerSecond: 3,
    },
  },
  phoenix_beacon: {
    id: 'phoenix_beacon',
    name: "Order's Phoenix Beacon",
    isArtifact: true,
    recipe: ['mana_gem', 'phoenix_feather'],
    description: '+180 HP, +12 Starting Mana, +3 Mana/sec. When holder dies, heals all allies for 18% max HP and gives 15 Mana.',
    icon: '🔥',
    stats: {
      hp: 180,
      startingMana: 12,
      manaPerSecond: 3,
    },
    passiveEffect: {
      type: 'DEATH_TEAM_HEAL',
      value: 0.18,
      description: 'Heals all allies for 18% HP upon death.',
    },
  },
  storm_wand: {
    id: 'storm_wand',
    name: 'Storm-Charmed Wand of Grindelwald',
    isArtifact: true,
    recipe: ['mana_gem', 'quicksilver'],
    description: '+18% AS, +12 Starting Mana, +3 Mana/sec. Every 3rd attack releases lightning hitting 4 foes for 110 magic dmg & shredding MR.',
    icon: '⚡',
    stats: {
      attackSpeed: 0.18,
      startingMana: 12,
      manaPerSecond: 3,
    },
    passiveEffect: {
      type: 'CHAIN_LIGHTNING',
      value: 110,
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
    description: '+45 Armor. Negates incoming critical strike bonus damage and reflects 75 magic damage to attackers.',
    icon: '🏰',
    stats: {
      armor: 45,
    },
    passiveEffect: {
      type: 'THORNS',
      value: 75,
      description: 'Reflects 75 magic damage on taking physical hits.',
    },
  },
  aegis_of_order: {
    id: 'aegis_of_order',
    name: 'Aegis of the Order',
    isArtifact: true,
    recipe: ['dragon_scale', 'mandrake_leaf'],
    description: '+22 Armor, +22 MR. At combat start, taunts adjacent enemies and grants 20% damage reduction for 5s.',
    icon: '🛡️',
    stats: {
      armor: 22,
      magicResist: 22,
    },
  },
  gryffindor_vest: {
    id: 'gryffindor_vest',
    name: "Gryffindor's Lion Vest",
    isArtifact: true,
    recipe: ['dragon_scale', 'phoenix_feather'],
    description: '+220 HP, +28 Armor. Regenerates 1.5% maximum HP per second.',
    icon: '🥋',
    stats: {
      hp: 220,
      armor: 28,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.015,
      description: 'Heals 1.5% max HP per second.',
    },
  },
  dragonhide_quidditch_armor: {
    id: 'dragonhide_quidditch_armor',
    name: 'Dragonhide Quidditch Armor',
    isArtifact: true,
    recipe: ['dragon_scale', 'quicksilver'],
    description: '+22 Armor, +15% AS. Dealing or taking damage grants +1.5 Armor and +1.5% AD (stacks up to 25 times).',
    icon: '🧥',
    stats: {
      armor: 22,
      attackSpeed: 0.15,
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
    description: '+45 MR. Takes 40% reduced magic damage from all enemy abilities and spells.',
    icon: '🐉',
    stats: {
      magicResist: 45,
    },
  },
  resilient_cloak: {
    id: 'resilient_cloak',
    name: "Hufflepuff's Resilient Cloak",
    isArtifact: true,
    recipe: ['mandrake_leaf', 'phoenix_feather'],
    description: '+180 HP, +25 MR. Emits an aura reducing magic damage taken by adjacent allies by 22%.',
    icon: '🦡',
    stats: {
      hp: 180,
      magicResist: 25,
    },
    passiveEffect: {
      type: 'MAGIC_DAMAGE_AURA',
      value: 0.22,
      description: 'Reduces nearby enemy magic damage by 22%.',
    },
  },
  silver_quicksilver_charm: {
    id: 'silver_quicksilver_charm',
    name: 'Silver Quicksilver Charm',
    isArtifact: true,
    recipe: ['mandrake_leaf', 'quicksilver'],
    description: '+22 MR, +15% AS. Immune to crowd control effects and stuns for the first 8 seconds of combat.',
    icon: '🔮',
    stats: {
      magicResist: 22,
      attackSpeed: 0.15,
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
    description: '+550 Maximum HP. Holder regenerates 4% missing health per second.',
    icon: '🐲',
    stats: {
      hp: 550,
    },
    passiveEffect: {
      type: 'HEALTH_REGEN',
      value: 0.04,
      description: 'Regenerates 4% missing HP per second.',
    },
  },
  beater_bat: {
    id: 'beater_bat',
    name: "Beater's Ironwood Bludger Bat",
    isArtifact: true,
    recipe: ['phoenix_feather', 'quicksilver'],
    description: '+180 HP, +18% AS. Basic attacks knock back the target and deal 4% max HP bonus physical damage.',
    icon: '🏏',
    stats: {
      hp: 180,
      attackSpeed: 0.18,
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
    description: '+35% Attack Speed. Basic attacks permanently stack +4% Attack Speed for the rest of combat.',
    icon: '🧹',
    stats: {
      attackSpeed: 0.35,
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
