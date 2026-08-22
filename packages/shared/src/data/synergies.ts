import { TraitDefinition } from "../types/synergy.js";

export const TRAITS: Record<string, TraitDefinition> = {
  // ==========================================
  // ⚔️ Classes / Unit Types (Roles)
  // ==========================================
  Guardian: {
    id: "Guardian",
    name: "Guardian",
    type: "class",
    icon: "🛡️",
    description:
      "Guardians (Tanks) fortify the frontline and grant bonus Armor to all team allies.",
    breakpoints: [
      {
        count: 2,
        description: "(2) All allies gain +16 Armor.",
        bonus: { armor: 16 },
      },
      {
        count: 3,
        description: "(3) All allies gain +30 Armor.",
        bonus: { armor: 30 },
      },
      {
        count: 4,
        description: "(4) All allies gain +48 Armor.",
        bonus: { armor: 48 },
      },
    ],
  },

  Sorcerer: {
    id: "Sorcerer",
    name: "Sorcerer",
    type: "class",
    icon: "✨",
    description:
      "Sorcerers (Casters) empower all allies with bonus Ability Power and spell acceleration.",
    breakpoints: [
      {
        count: 2,
        description: "(2) All allies gain +15% Ability Power.",
        bonus: { abilityPower: 0.15 },
      },
      {
        count: 4,
        description: "(4) All allies gain +32% Ability Power.",
        bonus: { abilityPower: 0.32 },
      },
      {
        count: 6,
        description: "(6) All allies gain +55% Ability Power.",
        bonus: { abilityPower: 0.55 },
      },
    ],
  },

  Sniper: {
    id: "Sniper",
    name: "Sniper",
    type: "class",
    icon: "🎯",
    description:
      "Innate: Snipers have +1 Attack Range (5 Range). Snipers deal amplified damage per hex between them and their target.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Snipers deal +2.0% amplified damage per hex between them and their target.",
        bonus: { damageAmpPerHex: 0.02, bonusRange: 1 },
      },
      {
        count: 3,
        description:
          "(3) Snipers deal +3.5% amplified damage per hex between them and their target.",
        bonus: { damageAmpPerHex: 0.035, bonusRange: 1 },
      },
      {
        count: 4,
        description:
          "(4) Snipers deal +5.0% amplified damage per hex between them and their target.",
        bonus: { damageAmpPerHex: 0.05, bonusRange: 1 },
      },
    ],
  },

  Brawler: {
    id: "Brawler",
    name: "Brawler",
    type: "class",
    icon: "🥊",
    description:
      "Brawlers gain massive bonus maximum health and physical strike power.",
    breakpoints: [
      {
        count: 2,
        description: "(2) Brawlers gain +160 bonus Health.",
        bonus: { health: 160 },
      },
      {
        count: 3,
        description: "(3) Brawlers gain +300 bonus Health.",
        bonus: { health: 300 },
      },
      {
        count: 4,
        description: "(4) Brawlers gain +480 bonus Health.",
        bonus: { health: 480 },
      },
    ],
  },

  Infiltrator: {
    id: "Infiltrator",
    name: "Infiltrator",
    type: "class",
    icon: "🗡️",
    description:
      "Innate: Infiltrators jump to the enemy backline at combat start. Gain Crit Chance & Crit Damage.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Infiltrators gain +15% Crit Chance & +18% Crit Damage.",
        bonus: { critChance: 0.15, critDamage: 0.18 },
      },
      {
        count: 4,
        description:
          "(4) Infiltrators gain +28% Crit Chance & +38% Crit Damage.",
        bonus: { critChance: 0.28, critDamage: 0.38 },
      },
    ],
  },

  Mystic: {
    id: "Mystic",
    name: "Mystic",
    type: "class",
    icon: "🔮",
    description:
      "Mystics grant bonus Magic Resist, increased shield strength, and omnivamp to all allies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) All allies gain +18 Magic Resist and heal for 6% of damage dealt.",
        bonus: { magicResist: 18, omnivamp: 0.06 },
      },
      {
        count: 3,
        description:
          "(3) All allies gain +32 Magic Resist and heal for 10% of damage dealt.",
        bonus: { magicResist: 32, omnivamp: 0.10 },
      },
      {
        count: 4,
        description:
          "(4) All allies gain +50 Magic Resist and heal for 16% of damage dealt.",
        bonus: { magicResist: 50, omnivamp: 0.16 },
      },
    ],
  },

  Duelist: {
    id: "Duelist",
    name: "Duelist",
    type: "class",
    icon: "⚔️",
    description:
      "Duelists gain stacking Attack Speed with every basic attack.",
    breakpoints: [
      {
        count: 2,
        description: "(2) +6% Attack Speed per attack stack (up to +60%).",
        bonus: { attackSpeedPerStack: 0.06, maxStacks: 10 },
      },
      {
        count: 4,
        description: "(4) +11% Attack Speed per attack stack (up to +132%).",
        bonus: { attackSpeedPerStack: 0.11, maxStacks: 12 },
      },
    ],
  },

  Trickster: {
    id: "Trickster",
    name: "Trickster",
    type: "class",
    icon: "🎭",
    description:
      "Tricksters weave illusions, gaining Dodge Chance and disrupting enemy spellcasting.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Tricksters gain +10% Dodge Chance and burn 3 enemy Mana on dodge.",
        bonus: { dodgeChance: 0.10, manaBurn: 3 },
      },
      {
        count: 3,
        description:
          "(3) Tricksters gain +18% Dodge Chance and burn 5 enemy Mana on dodge.",
        bonus: { dodgeChance: 0.18, manaBurn: 5 },
      },
      {
        count: 4,
        description:
          "(4) Tricksters gain +28% Dodge Chance and burn 8 enemy Mana on dodge.",
        bonus: { dodgeChance: 0.28, manaBurn: 8 },
      },
    ],
  },

  Animagi: {
    id: "Animagi",
    name: "Animagi",
    type: "class",
    icon: "🐺",
    description:
      "Animagi transform upon their first spellcast, surging with raw primal beast power.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) On transform, gain +22% Maximum Health and +14 Attack Damage.",
        bonus: { health: 180, attackDamage: 14 },
      },
      {
        count: 4,
        description:
          "(4) On transform, gain +45% Maximum Health and +32 Attack Damage.",
        bonus: { health: 380, attackDamage: 32 },
      },
    ],
  },

  Handler: {
    id: "Handler",
    name: "Handler",
    type: "class",
    icon: "🐾",
    description:
      "Handlers command magical companions that enter the fray to fight alongside them.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat start: Summons a 450 HP Beast companion with 28 AD.",
        bonus: { health: 150, companionHp: 450, companionAd: 28 },
      },
    ],
  },

  // ==========================================
  // 🏰 Origins / Factions (Lore & Allegiances)
  // ==========================================
  Gryffindor: {
    id: "Gryffindor",
    name: "Gryffindor",
    type: "origin",
    icon: "🦁",
    description:
      "Gryffindors exhibit fierce bravery in battle, gaining bonus Attack Damage and low-health shields.",
    breakpoints: [
      {
        count: 3,
        description: "(3) Gryffindors gain +16 Attack Damage.",
        bonus: { attackDamage: 16 },
      },
      {
        count: 5,
        description:
          "(5) Gryffindors gain +36 Attack Damage and a 220 HP shield when dropping below 40% HP.",
        bonus: { attackDamage: 36, shieldHp: 220, shieldThreshold: 0.4 },
      },
      {
        count: 8,
        description:
          "(8) Gryffindors gain +70 Attack Damage and +20% Attack Speed. At 50% HP, gain a 450 HP shield.",
        bonus: {
          attackDamage: 70,
          attackSpeed: 0.2,
          shieldHp: 450,
          shieldThreshold: 0.5,
        },
      },
    ],
  },

  Slytherin: {
    id: "Slytherin",
    name: "Slytherin",
    type: "origin",
    icon: "🐍",
    description:
      "Slytherins strike ruthlessly, gaining bonus Critical Damage and executing low-health targets.",
    breakpoints: [
      {
        count: 3,
        description:
          "(3) Slytherins gain +18% Critical Damage; attacks execute enemies below 8% HP.",
        bonus: { critDamage: 0.18, executeThreshold: 0.08 },
      },
      {
        count: 5,
        description:
          "(5) Slytherins gain +38% Critical Damage and +15% Crit Chance; attacks execute enemies below 14% HP.",
        bonus: { critDamage: 0.38, critChance: 0.15, executeThreshold: 0.14 },
      },
      {
        count: 8,
        description:
          "(8) Slytherins gain +65% Crit Damage, +25% Crit Chance, and +15% AP; attacks execute enemies below 20% HP.",
        bonus: {
          critDamage: 0.65,
          critChance: 0.25,
          abilityPower: 0.15,
          executeThreshold: 0.2,
        },
      },
    ],
  },

  Ravenclaw: {
    id: "Ravenclaw",
    name: "Ravenclaw",
    type: "origin",
    icon: "🦅",
    description:
      "Ravenclaws possess supreme intellect, starting combat with bonus Mana and generating Mana faster.",
    breakpoints: [
      {
        count: 3,
        description:
          "(3) Ravenclaws start combat with +15 Mana and generate +2 Mana per second.",
        bonus: { startingMana: 15, manaPerSecond: 2 },
      },
      {
        count: 5,
        description:
          "(5) Ravenclaws start combat with +35 Mana and generate +4 Mana per second.",
        bonus: { startingMana: 35, manaPerSecond: 4 },
      },
      {
        count: 8,
        description:
          "(8) Ravenclaws start with +60 Mana and generate +8 Mana/sec; spells empower all allies with +15% AP.",
        bonus: { startingMana: 60, manaPerSecond: 8, abilityPower: 0.15 },
      },
    ],
  },

  Hufflepuff: {
    id: "Hufflepuff",
    name: "Hufflepuff",
    type: "origin",
    icon: "🦡",
    description:
      "Hufflepuffs stand loyal and unyielding, granting teamwide damage reduction and defense.",
    breakpoints: [
      {
        count: 3,
        description:
          "(3) All allies take 8% reduced damage from all sources and gain +15 Armor & Magic Resist.",
        bonus: { damageReduction: 0.08, armor: 15, magicResist: 15 },
      },
      {
        count: 5,
        description:
          "(5) All allies take 18% reduced damage from all sources and gain +32 Armor & Magic Resist.",
        bonus: { damageReduction: 0.18, armor: 32, magicResist: 32 },
      },
      {
        count: 8,
        description:
          "(8) All allies take 28% reduced damage, gain +55 Armor & MR, and regenerate 2.0% Max HP per second.",
        bonus: {
          damageReduction: 0.28,
          armor: 55,
          magicResist: 55,
          hpRegenPerSec: 0.02,
        },
      },
    ],
  },

  "Order of Phoenix": {
    id: "Order of Phoenix",
    name: "Order of Phoenix",
    type: "origin",
    icon: "🕊️",
    description:
      "The Order of the Phoenix fights as one. When an Order ally falls, they pass their stats to living allies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) On death, grants 15% of their AD, AP, and remaining Mana to the nearest Order ally.",
        bonus: { statPassPercent: 0.15, health: 90 },
      },
      {
        count: 4,
        description:
          "(4) On death, grants 30% of their AD, AP, and Mana to ALL surviving allies.",
        bonus: { statPassPercent: 0.3, health: 200 },
      },
    ],
  },

  "Death Eater": {
    id: "Death Eater",
    name: "Death Eater",
    type: "origin",
    icon: "💀",
    description:
      "Death Eaters channel the Dark Mark, causing their spells to inflict Dark Curses dealing True Damage.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Death Eater abilities deal 12% bonus True Damage over 3 seconds.",
        bonus: { trueDamagePercent: 0.12, abilityPower: 0.12 },
      },
      {
        count: 4,
        description:
          "(4) Death Eater abilities deal 28% bonus True Damage and reduce target healing by 30%.",
        bonus: {
          trueDamagePercent: 0.28,
          healingReduction: 0.3,
          abilityPower: 0.26,
        },
      },
    ],
  },

  Ghost: {
    id: "Ghost",
    name: "Ghost",
    type: "origin",
    icon: "👻",
    description:
      "Hogwarts ghosts are intangible spirits who take reduced physical damage and float freely.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Ghosts take 14% reduced physical damage and gain +12% Dodge Chance.",
        bonus: { dodgeChance: 0.12, damageReduction: 0.14 },
      },
      {
        count: 4,
        description:
          "(4) Ghosts take 25% reduced physical damage and gain +22% Dodge Chance.",
        bonus: { dodgeChance: 0.22, damageReduction: 0.25, armor: 22 },
      },
    ],
  },

  "Magical Creature": {
    id: "Magical Creature",
    name: "Magical Creature",
    type: "origin",
    icon: "🦄",
    description:
      "Beasts and magical fauna fight with untamed ferocity, gaining bonus Attack Speed and Omnivamp.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Magical Creatures gain +14% Attack Speed and 8% Omnivamp.",
        bonus: { attackSpeed: 0.14, omnivamp: 0.08 },
      },
      {
        count: 4,
        description:
          "(4) Magical Creatures gain +30% Attack Speed and 16% Omnivamp.",
        bonus: { attackSpeed: 0.3, omnivamp: 0.16 },
      },
    ],
  },

  Ministry: {
    id: "Ministry",
    name: "Ministry",
    type: "origin",
    icon: "⚖️",
    description:
      "Ministry officials and Aurors enforce magical law, suppressing the strongest enemy unit.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat start: Disarms and silences the highest-cost enemy unit for 1.2 seconds.",
        bonus: { suppressCount: 1, suppressDuration: 1.2, abilityPower: 0.08 },
      },
      {
        count: 4,
        description:
          "(4) Combat start: Disarms and silences the 2 highest-cost enemy units for 2.0 seconds.",
        bonus: { suppressCount: 2, suppressDuration: 2.0, abilityPower: 0.2 },
      },
    ],
  },

  Professor: {
    id: "Professor",
    name: "Professor",
    type: "origin",
    icon: "🎓",
    description:
      "Hogwarts Professors lecture and inspire, granting massive AP & AD aura to adjacent allies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Professors grant +15 AP and +12 AD to themselves and 2 adjacent allies.",
        bonus: { abilityPower: 0.15, attackDamage: 12 },
      },
      {
        count: 4,
        description:
          "(4) Professors grant +32 AP and +25 AD to all team allies.",
        bonus: { abilityPower: 0.32, attackDamage: 25 },
      },
    ],
  },

  Magizoologist: {
    id: "Magizoologist",
    name: "Magizoologist",
    type: "origin",
    icon: "🧳",
    description:
      "Masters of Fantastic Beasts empower all Magical Creature allies with health and power.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) All Magical Creature allies gain +200 Max HP and +16% Attack Damage.",
        bonus: { health: 200, attackDamage: 16 },
      },
    ],
  },

  "House-Elf": {
    id: "House-Elf",
    name: "House-Elf",
    type: "origin",
    icon: "🧦",
    description:
      "House-Elves possess powerful wandless magic, protecting and shielding their master carry.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat start: Bestows a 160 HP shield and +10 Starting Mana onto your highest-cost ally.",
        bonus: { shieldHp: 160, startingMana: 10, targetCount: 1 },
      },
      {
        count: 3,
        description:
          "(3) Combat start: Bestows a 280 HP shield and +18 Starting Mana onto your 2 highest-cost allies.",
        bonus: { shieldHp: 280, startingMana: 18, targetCount: 2 },
      },
    ],
  },

  "Dark Wizard": {
    id: "Dark Wizard",
    name: "Dark Wizard",
    type: "origin",
    icon: "🔮",
    description:
      "Practitioners of the Dark Arts wield destructive curses that burn and incinerate enemies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Dark Wizard spells ignite targets, dealing 8% max HP as magic burn and reducing healing by 30%.",
        bonus: { burnPercent: 0.08, healingReduction: 0.3, abilityPower: 0.14 },
      },
      {
        count: 4,
        description:
          "(4) Dark Wizard spells deal 18% max HP burn and execute enemies below 8% HP.",
        bonus: {
          burnPercent: 0.18,
          executeThreshold: 0.08,
          abilityPower: 0.28,
        },
      },
    ],
  },

  Beauxbatons: {
    id: "Beauxbatons",
    name: "Beauxbatons",
    type: "origin",
    icon: "🦋",
    description:
      "Beauxbatons sorcerers charm opponents, reducing enemy damage output.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) All enemies deal 12% less damage for the first 6 seconds of combat.",
        bonus: {
          enemyDamageReduction: 0.12,
          duration: 6.0,
          abilityPower: 0.12,
        },
      },
      {
        count: 3,
        description:
          "(3) All enemies deal 20% less damage and are slowed by 15% for 7 seconds.",
        bonus: {
          enemyDamageReduction: 0.2,
          enemySlowPercent: 0.15,
          duration: 7.0,
          abilityPower: 0.24,
        },
      },
    ],
  },

  Durmstrang: {
    id: "Durmstrang",
    name: "Durmstrang",
    type: "origin",
    icon: "⛵",
    description:
      "Durmstrang champions train relentlessly in martial magic, gaining Attack Speed and Armor.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Durmstrang units gain +18% Attack Speed and +15 Armor.",
        bonus: { attackSpeed: 0.18, armor: 15 },
      },
      {
        count: 4,
        description:
          "(4) Durmstrang units gain +38% Attack Speed and +32 Armor.",
        bonus: { attackSpeed: 0.38, armor: 32 },
      },
    ],
  },

  Dragon: {
    id: "Dragon",
    name: "Dragon",
    type: "origin",
    icon: "🐉",
    description:
      "Ancient Dragons possess indestructible scales and breath attacks that cleave adjacent foes.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Dragons gain +240 Health and basic attacks deal 15% splash damage to adjacent enemies.",
        bonus: { health: 240, attackDamage: 18, splashPercent: 0.15 },
      },
    ],
  },

  Divine: {
    id: "Divine",
    name: "Divine",
    type: "origin",
    icon: "👑",
    description:
      "Ancient Founders and mythical legends start combat with full Mana and surge with power.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Divine units start combat with 100% Mana and gain +20% Ability Power & +20 AD.",
        bonus: { startingMana: 100, abilityPower: 0.2, attackDamage: 20 },
      },
    ],
  },

  "Golden Trio": {
    id: "Golden Trio",
    name: "Golden Trio",
    type: "origin",
    icon: "⚡",
    description:
      "Harry, Hermione, and Ron share an unbreakable bond. When all 3 are deployed, they resonate with spell power, starting mana, and grant each other shields and mana on spell casts.",
    breakpoints: [
      {
        count: 3,
        description:
          "(3) Golden Trio units gain +15% Ability Power, +15% Attack Speed, and start with +12 Mana. Whenever any member casts, the other two gain 10 Mana and a 120 HP shield.",
        bonus: {
          abilityPower: 0.15,
          attackSpeed: 0.15,
          startingMana: 12,
          health: 100,
          shieldHp: 120,
        },
      },
    ],
  },

  "Inquisitorial Squad": {
    id: "Inquisitorial Squad",
    name: "Inquisitorial Squad",
    type: "origin",
    icon: "⚖️",
    description:
      "Dolores Umbridge's handpicked enforcers police Hogwarts with ironclad decrees. Inquisitorial Squad members gain bonus Health, Armor, and Magic Resist. At combat start, they issue Educational Decrees to Detain (stun & disarm) high-threat enemies.",
    breakpoints: [
      {
        count: 3,
        description:
          "(3) Inquisitors gain +180 Health and +18 Armor/MR. Combat Start: The highest-damage enemy is Detained (Stunned & Disarmed for 1.8s).",
        bonus: {
          health: 180,
          armor: 18,
          magicResist: 18,
          detainCount: 1,
          detainDuration: 1.8,
        },
      },
      {
        count: 5,
        description:
          "(5) Inquisitors gain +360 Health and +36 Armor/MR. Combat Start: The top 2 highest-damage enemies are Detained (Stunned & Disarmed for 2.4s), and Inquisitors deal +18% bonus True Damage to crowd-controlled enemies.",
        bonus: {
          health: 360,
          armor: 36,
          magicResist: 36,
          detainCount: 2,
          detainDuration: 2.4,
          bonusTrueDamage: 0.18,
        },
      },
    ],
  },

  Weasley: {
    id: "Weasley",
    name: "Weasley",
    type: "origin",
    icon: "🦁",
    description:
      "The Weasley family fights with fierce family solidarity, rallying one another with escalating attack speed and attack damage.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Weasleys gain +12% Attack Speed and +8 Attack Damage.",
        bonus: { attackSpeed: 0.12, attackDamage: 8 },
      },
      {
        count: 4,
        description:
          "(4) Weasleys gain +28% Attack Speed and +24 Attack Damage. When any Weasley drops below 40% HP, all Weasleys gain a 200 HP shield.",
        bonus: {
          attackSpeed: 0.28,
          attackDamage: 24,
          shieldHp: 200,
          shieldThreshold: 0.4,
        },
      },
    ],
  },

  Malfoy: {
    id: "Malfoy",
    name: "Malfoy",
    type: "origin",
    icon: "🪙",
    description:
      "The noble House of Malfoy uses their vast wealth and influence to bribe the duel arbiters, sundering and shredding all enemy defenses at combat start and plundering extra gold.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat Start: Inflicts all enemies with -12% Sunder (Armor) and -12% Shred (MR) for 6 seconds. Malfoys gain +12% Ability Power.",
        bonus: {
          sunderShredPercent: 0.12,
          sunderShredDuration: 6.0,
          abilityPower: 0.12,
        },
      },
      {
        count: 3,
        description:
          "(3) Malfoys gain +28% Ability Power. Winning combat with at least one surviving Malfoy grants +2 bonus Gold.",
        bonus: { abilityPower: 0.28, bonusGoldOnWin: 2 },
      },
    ],
  },

  "Patil Sisters": {
    id: "Patil Sisters",
    name: "Patil Sisters",
    type: "origin",
    icon: "🪞",
    description:
      "Padma and Parvati Patil share twin synchrony across Gryffindor and Ravenclaw. When fielded together, their spells resonate, granting them shared Ability Power and generating a synchronized protective ward on ability cast.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Patil Sisters gain +12% Ability Power and +12% Attack Speed. Whenever either sister casts an ability, both gain a 110 HP shield for 3.5 seconds.",
        bonus: {
          abilityPower: 0.12,
          attackSpeed: 0.12,
          shieldHp: 110,
          shieldDuration: 3.5,
        },
      },
    ],
  },
};
