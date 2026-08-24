import { TraitDefinition } from "../types/synergy.js";

export const TRAITS: Record<string, TraitDefinition> = {
  // ==========================================
  // ⚔️ Classes / Unit Disciplines & Roles
  // ==========================================
  Guardian: {
    id: "Guardian",
    name: "Guardian",
    type: "class",
    icon: "🛡️",
    description:
      "Guardians (Tanks) fortify the frontline and grant bonus Armor & Magic Resist to all team allies.",
    breakpoints: [
      {
        count: 2,
        description: "(2) All allies gain +18 Armor & +18 Magic Resist.",
        bonus: { armor: 18, magicResist: 18 },
      },
      {
        count: 4,
        description:
          "(4) All allies gain +38 Armor & +38 Magic Resist; Guardians gain +250 bonus HP.",
        bonus: { armor: 38, magicResist: 38, health: 250 },
      },
      {
        count: 6,
        description:
          "(6) All allies gain +65 Armor & +65 Magic Resist; Guardians gain +600 bonus HP.",
        bonus: { armor: 65, magicResist: 65, health: 600 },
      },
    ],
  },

  Sorcerer: {
    id: "Sorcerer",
    name: "Sorcerer",
    type: "class",
    icon: "✨",
    description:
      "Sorcerers empower all allies with massive bonus Ability Power and spell amplification.",
    breakpoints: [
      {
        count: 2,
        description: "(2) All allies gain +18% Ability Power.",
        bonus: { abilityPower: 0.18 },
      },
      {
        count: 4,
        description: "(4) All allies gain +40% Ability Power.",
        bonus: { abilityPower: 0.40 },
      },
      {
        count: 6,
        description: "(6) All allies gain +75% Ability Power and spells can critically strike.",
        bonus: { abilityPower: 0.75, critChance: 0.15 },
      },
    ],
  },

  Sniper: {
    id: "Sniper",
    name: "Sniper",
    type: "class",
    icon: "🎯",
    description:
      "Innate: Snipers have +1 Attack Range. Snipers deal amplified damage per hex between them and their target.",
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
          "(4) Snipers deal +5.0% amplified damage per hex and gain +1 additional Attack Range.",
        bonus: { damageAmpPerHex: 0.05, bonusRange: 2 },
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
        description: "(2) Brawlers gain +200 bonus Health.",
        bonus: { health: 200 },
      },
      {
        count: 4,
        description: "(4) Brawlers gain +450 bonus Health and 10% physical splash damage.",
        bonus: { health: 450, splashPercent: 0.10 },
      },
      {
        count: 6,
        description: "(6) Brawlers gain +850 bonus Health and 25% physical splash damage.",
        bonus: { health: 850, splashPercent: 0.25 },
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
          "(2) Infiltrators gain +15% Crit Chance & +25% Crit Damage.",
        bonus: { critChance: 0.15, critDamage: 0.25 },
      },
      {
        count: 4,
        description:
          "(4) Infiltrators gain +30% Crit Chance & +50% Crit Damage.",
        bonus: { critChance: 0.30, critDamage: 0.50 },
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
          "(2) All allies gain +20 Magic Resist and heal for 8% of damage dealt (Omnivamp).",
        bonus: { magicResist: 20, omnivamp: 0.08 },
      },
      {
        count: 4,
        description:
          "(4) All allies gain +45 Magic Resist, 16% Omnivamp, and shields on allies are 25% stronger.",
        bonus: { magicResist: 45, omnivamp: 0.16 },
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
        description: "(2) +6% Attack Speed per attack stack (up to 10 stacks).",
        bonus: { attackSpeedPerStack: 0.06, maxStacks: 10 },
      },
      {
        count: 4,
        description: "(4) +11% Attack Speed per attack stack (up to 12 stacks).",
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
      "Tricksters weave mischief and illusions, confusing enemies and burning mana on dodge.",
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
          "(3) Tricksters gain +18% Dodge Chance and burn 4 enemy Mana on dodge.",
        bonus: { dodgeChance: 0.18, manaBurn: 4 },
      },
      {
        count: 4,
        description:
          "(4) Tricksters gain +28% Dodge Chance and burn 5 enemy Mana on dodge.",
        bonus: { dodgeChance: 0.28, manaBurn: 5 },
      },
    ],
  },

  Animagi: {
    id: "Animagi",
    name: "Animagi",
    type: "class",
    icon: "🐺",
    description:
      "Animagi transform upon their first spellcast, surging with primal beast power.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) On transform, gain +250 Max HP and +20% Attack Speed.",
        bonus: { health: 250, attackSpeed: 0.20 },
      },
      {
        count: 4,
        description:
          "(4) On transform, gain +550 Max HP, +35% Attack Speed, and heal for 15% of damage dealt.",
        bonus: { health: 550, attackSpeed: 0.35, omnivamp: 0.15 },
      },
    ],
  },

  Handler: {
    id: "Handler",
    name: "Handler",
    type: "class",
    icon: "🐾",
    description:
      "Handlers command magical beasts that enter the fray to fight alongside them.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat start: Summons a 450 HP Beast companion with 30 Attack Damage.",
        bonus: { health: 150, companionHp: 450, companionAd: 30 },
      },
    ],
  },

  Magizoologist: {
    id: "Magizoologist",
    name: "Magizoologist",
    type: "class",
    icon: "🧳",
    description:
      "Innate: Newt Scamander summons an allied Magical Beast companion from his enchanted briefcase to fight alongside him.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Combat start: Summons a loyal Magical Beast companion with 550 HP and 35 Attack Damage.",
        bonus: { companionHp: 550, companionAd: 35 },
      },
    ],
  },

  Herbologist: {
    id: "Herbologist",
    name: "Herbologist & Potioneer",
    type: "class",
    icon: "🌿",
    description:
      "Herbologists and Potion Masters brew restorative draughts and botanical concoctions.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) At combat start and every 6s, Herbologists brew a restorative elixir healing the lowest ally for 10% Max HP.",
        bonus: { hpRegenPerSec: 0.015, health: 120 },
      },
      {
        count: 4,
        description:
          "(4) Elixirs heal for 20% Max HP, grant 30 Armor & MR, and poison adjacent enemies for 140 magic damage.",
        bonus: { hpRegenPerSec: 0.035, health: 300, armor: 30, magicResist: 30 },
      },
    ],
  },

  Diviner: {
    id: "Diviner",
    name: "Diviner",
    type: "class",
    icon: "🔮",
    description:
      "Diviners peer into the future, granting precognition barriers and evasion to all team allies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) All allies gain +15% Dodge Chance and start combat with a 120 HP shield.",
        bonus: { dodgeChance: 0.15, shieldHp: 120 },
      },
      {
        count: 4,
        description:
          "(4) All allies gain +30% Dodge Chance and a 260 HP shield. Successfully dodging an attack restores 10 Mana.",
        bonus: { dodgeChance: 0.30, shieldHp: 260 },
      },
    ],
  },

  Auror: {
    id: "Auror",
    name: "Auror",
    type: "class",
    icon: "⚡",
    description:
      "Elite dark wizard hunters strike with relentless precision and execute wounded enemies.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Aurors gain +25% Attack Damage and execute enemies below 10% Max HP.",
        bonus: { attackDamage: 25, executeThreshold: 0.10 },
      },
      {
        count: 4,
        description:
          "(4) Aurors gain +55% Attack Damage, 15% Omnivamp, and deal 20% bonus True Damage against Dark Wizards & Death Eaters.",
        bonus: { attackDamage: 55, omnivamp: 0.15, trueDamagePercent: 0.20, executeThreshold: 0.15 },
      },
    ],
  },

  "Curse-Caster": {
    id: "Curse-Caster",
    name: "Curse-Caster",
    type: "class",
    icon: "🩸",
    description:
      "Masters of forbidden dark jinxes inflict lingering cursed wounds that burn max health and reduce enemy healing.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Abilities apply Curse, dealing 2.5% target max HP per second as True Damage and reducing healing by 33% for 5s.",
        bonus: { burnPercent: 0.025, healingReduction: 0.33 },
      },
      {
        count: 4,
        description:
          "(4) Curse deals 5.0% max HP per second and shreds 30% of the target's Armor and Magic Resist.",
        bonus: { burnPercent: 0.05, healingReduction: 0.50, sunderShredPercent: 0.30 },
      },
    ],
  },

  Professor: {
    id: "Professor",
    name: "Professor",
    type: "class",
    icon: "🎓",
    description:
      "Hogwarts Professors lecture and inspire, granting teamwide Mana generation and spell amplification.",
    breakpoints: [
      {
        count: 2,
        description: "(2) All allies gain +3 Mana per second.",
        bonus: { manaPerSecond: 3 },
      },
      {
        count: 4,
        description: "(4) All allies gain +7 Mana per second and +15% Ability Power.",
        bonus: { manaPerSecond: 7, abilityPower: 0.15 },
      },
      {
        count: 6,
        description: "(6) All allies gain +12 Mana per second, +30% Ability Power, and start with +20 Mana.",
        bonus: { manaPerSecond: 12, abilityPower: 0.30, startingMana: 20 },
      },
    ],
  },

  "Golden Trio": {
    id: "Golden Trio",
    name: "Golden Trio",
    type: "class",
    icon: "⚡",
    description:
      "Harry, Hermione, and Ron share an unbreakable bond. When all 3 are deployed, they resonate with spell power and grant each other shields and mana on spell casts.",
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
    type: "class",
    icon: "⚖️",
    description:
      "Dolores Umbridge's handpicked enforcers police Hogwarts with ironclad decrees. At combat start, they Detain high-threat enemies and deal bonus true damage to CC'd targets.",
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
          "(5) Inquisitors gain +360 Health and +36 Armor/MR. Combat Start: Top 2 enemies are Detained (2.4s), and Inquisitors deal +18% bonus True Damage to crowd-controlled enemies.",
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
    type: "class",
    icon: "🦁",
    description:
      "The Weasley family fights with fierce family solidarity, rallying one another with escalating attack speed, AD, AP, and emergency shields.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Weasleys gain +12% Attack Speed, +8 Attack Damage, and +10% Ability Power.",
        bonus: { attackSpeed: 0.12, attackDamage: 8, abilityPower: 0.10 },
      },
      {
        count: 4,
        description:
          "(4) Weasleys gain +28% Attack Speed, +24 Attack Damage, and +25% Ability Power. When any Weasley drops below 40% HP, all Weasleys gain a 200 HP shield.",
        bonus: {
          attackSpeed: 0.28,
          attackDamage: 24,
          abilityPower: 0.25,
          shieldHp: 200,
          shieldThreshold: 0.4,
        },
      },
    ],
  },

  Malfoy: {
    id: "Malfoy",
    name: "Malfoy",
    type: "class",
    icon: "🪙",
    description:
      "The House of Malfoy uses their wealth and influence to sunder enemy defenses at combat start and plunder bonus gold on victory.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Combat Start: Inflicts all enemies with -12% Sunder (Armor) and -12% Shred (MR) for 6s. Malfoys gain +12% Ability Power.",
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
    type: "class",
    icon: "🪞",
    description:
      "Padma and Parvati Patil share twin synchrony across houses, granting shared attack speed and protective shields on cast.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Patil Sisters gain +12% Ability Power and +12% Attack Speed. Whenever either sister casts an ability, both gain a 110 HP shield for 3.5s.",
        bonus: {
          abilityPower: 0.12,
          attackSpeed: 0.12,
          shieldHp: 110,
          shieldDuration: 3.5,
        },
      },
    ],
  },

  Headmaster: {
    id: "Headmaster",
    name: "Headmaster",
    type: "class",
    icon: "🎓",
    description:
      "Innate: Exactly ONE Headmaster can lead Hogwarts. When exactly 1 is fielded, all team allies gain +18% Ability Power and start combat with +25 Mana. If both Dumbledore and Umbridge are fielded, their authority clashes and the trait is disabled.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Exactly 1 Headmaster active: All allies gain +18% Ability Power and start combat with +25 Mana. Disabled if multiple are fielded.",
        bonus: { abilityPower: 0.18, startingMana: 25 },
      },
    ],
  },

  "Grand Sorcerer": {
    id: "Grand Sorcerer",
    name: "Grand Sorcerer",
    type: "class",
    icon: "🪄",
    description:
      "Innate: Albus Dumbledore channels legendary transfiguration and elder magic, granting himself +35% Ability Power, and his spell casts stun all living enemies for 1.5 seconds.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Albus Dumbledore gains +35% Ability Power, and his spell casts stun all living enemies for 1.5s.",
        bonus: { abilityPower: 0.35 },
      },
    ],
  },

  Founder: {
    id: "Founder",
    name: "Founder",
    type: "class",
    icon: "🏰",
    description:
      "The 4 ancient Founders of Hogwarts (Godric Gryffindor, Salazar Slytherin, Rowena Ravenclaw, Helga Hufflepuff) unite to create the Hogwarts Aegis.",
    breakpoints: [
      {
        count: 4,
        description:
          "(4) When all 4 Founders unite, all allies gain +22 Armor & Magic Resist, +18% Ability Power & Attack Damage, and a 200 HP shield at combat start.",
        bonus: {
          armor: 22,
          magicResist: 22,
          abilityPower: 0.18,
          attackDamage: 18,
          shieldHp: 200,
        },
      },
    ],
  },

  "Dark Lord": {
    id: "Dark Lord",
    name: "Dark Lord",
    type: "class",
    icon: "🐍",
    description:
      "Innate: Lord Voldemort is tethered to his Horcruxes, granting +30% Ability Power and executing any enemy he damages below 15% HP.",
    breakpoints: [
      {
        count: 1,
        description:
          "(1) Lord Voldemort gains +30% Ability Power and executes any target he damages below 15% Max HP.",
        bonus: { abilityPower: 0.30, executeThreshold: 0.15 },
      },
    ],
  },

  // ==========================================
  // 🏰 Origins / Factions & Heritage (Max 1-2 per unit)
  // ==========================================
  Gryffindor: {
    id: "Gryffindor",
    name: "Gryffindor",
    type: "origin",
    icon: "🦁",
    description:
      "Gryffindors exhibit fierce bravery in battle, gaining bonus Attack Damage, Ability Power, and low-health shields.",
    breakpoints: [
      {
        count: 3,
        description: "(3) Gryffindors gain +16 Attack Damage and +16% Ability Power.",
        bonus: { attackDamage: 16, abilityPower: 0.16 },
      },
      {
        count: 5,
        description:
          "(5) Gryffindors gain +36 Attack Damage, +36% Ability Power, and a 220 HP shield when dropping below 40% HP.",
        bonus: { attackDamage: 36, abilityPower: 0.36, shieldHp: 220, shieldThreshold: 0.4 },
      },
      {
        count: 8,
        description:
          "(8) Gryffindors gain +70 Attack Damage, +70% Ability Power, and +20% Attack Speed. At 50% HP, gain a 450 HP shield.",
        bonus: {
          attackDamage: 70,
          abilityPower: 0.70,
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

  Wild: {
    id: "Wild",
    name: "Wild",
    type: "origin",
    icon: "🍄",
    description:
      "Wild woodland creatures and dungeon vermin overwhelm foes with swarming numbers and chaotic agility.",
    breakpoints: [
      {
        count: 2,
        description:
          "(2) Wild creatures gain +15% Attack Speed and +10% Dodge Chance.",
        bonus: { attackSpeed: 0.15, dodgeChance: 0.10 },
      },
      {
        count: 3,
        description:
          "(3) Wild creatures gain +35% Attack Speed and +25% Dodge Chance.",
        bonus: { attackSpeed: 0.35, dodgeChance: 0.25 },
      },
    ],
  },
};
