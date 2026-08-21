import { TraitDefinition } from '../types/synergy.js';

export const TRAITS: Record<string, TraitDefinition> = {
  // ==========================================
  // ⚔️ Classes / Unit Types (Roles)
  // ==========================================
  Guardian: {
    id: 'Guardian',
    name: 'Guardian',
    type: 'class',
    icon: '🛡️',
    description: 'Guardians (Tanks) fortify the frontline and grant bonus Armor to all team allies.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All allies gain +35 Armor.',
        bonus: { armor: 35 },
      },
      {
        count: 4,
        description: '(4) All allies gain +80 Armor.',
        bonus: { armor: 80 },
      },
    ],
  },

  Sorcerer: {
    id: 'Sorcerer',
    name: 'Sorcerer',
    type: 'class',
    icon: '✨',
    description: 'Sorcerers (Casters) empower all allies with bonus Ability Power and spell acceleration.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All allies gain +25% Ability Power.',
        bonus: { abilityPower: 0.25 },
      },
      {
        count: 4,
        description: '(4) All allies gain +60% Ability Power.',
        bonus: { abilityPower: 0.6 },
      },
      {
        count: 6,
        description: '(6) All allies gain +110% Ability Power.',
        bonus: { abilityPower: 1.1 },
      },
    ],
  },

  Sniper: {
    id: 'Sniper',
    name: 'Sniper',
    type: 'class',
    icon: '🎯',
    description: 'Snipers gain extended attack range and deal amplified damage to distant foes.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Snipers gain +1 Attack Range and deal +3% amplified damage per hex between them and their target.',
        bonus: { attackSpeed: 0.2 },
      },
      {
        count: 4,
        description: '(4) Snipers gain +2 Attack Range and deal +6% amplified damage per hex between them and their target.',
        bonus: { attackSpeed: 0.5 },
      },
    ],
  },

  Brawler: {
    id: 'Brawler',
    name: 'Brawler',
    type: 'class',
    icon: '🥊',
    description: 'Brawlers gain massive bonus maximum health and physical strike power.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Brawlers gain +350 bonus Health.',
        bonus: { health: 350 },
      },
      {
        count: 4,
        description: '(4) Brawlers gain +800 bonus Health.',
        bonus: { health: 800 },
      },
    ],
  },

  Infiltrator: {
    id: 'Infiltrator',
    name: 'Infiltrator',
    type: 'class',
    icon: '🗡️',
    description: 'Innate: Infiltrators jump to the enemy backline at combat start. Gain Crit Chance & Crit Damage.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Infiltrators gain +25% Crit Chance & +30% Crit Damage.',
        bonus: { critChance: 0.25, critDamage: 0.3 },
      },
      {
        count: 4,
        description: '(4) Infiltrators gain +50% Crit Chance & +75% Crit Damage.',
        bonus: { critChance: 0.5, critDamage: 0.75 },
      },
    ],
  },

  Mystic: {
    id: 'Mystic',
    name: 'Mystic',
    type: 'class',
    icon: '🔮',
    description: 'Mystics grant bonus Magic Resist, increased shield strength, and omnivamp to all allies.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All allies gain +40 Magic Resist and heal for 15% of damage dealt.',
        bonus: { magicResist: 40, omnivamp: 0.15 },
      },
      {
        count: 4,
        description: '(4) All allies gain +100 Magic Resist and heal for 30% of damage dealt.',
        bonus: { magicResist: 100, omnivamp: 0.3 },
      },
    ],
  },

  Duelist: {
    id: 'Duelist',
    name: 'Duelist',
    type: 'class',
    icon: '⚔️',
    description: 'Duelists gain stacking Attack Speed with every basic attack (up to 8 stacks).',
    breakpoints: [
      {
        count: 2,
        description: '(2) +10% Attack Speed per attack stack (up to +80%).',
        bonus: { attackSpeed: 0.2 },
      },
      {
        count: 4,
        description: '(4) +22% Attack Speed per attack stack (up to +176%).',
        bonus: { attackSpeed: 0.55 },
      },
    ],
  },

  Trickster: {
    id: 'Trickster',
    name: 'Trickster',
    type: 'class',
    icon: '🎭',
    description: 'Tricksters weave illusions, gaining Dodge Chance and disrupting enemy spellcasting.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Tricksters gain +25% Dodge Chance and burn 10 enemy Mana on dodge.',
        bonus: { dodgeChance: 0.25 },
      },
      {
        count: 4,
        description: '(4) Tricksters gain +50% Dodge Chance and burn 25 enemy Mana on dodge.',
        bonus: { dodgeChance: 0.5 },
      },
    ],
  },

  Animagi: {
    id: 'Animagi',
    name: 'Animagi',
    type: 'class',
    icon: '🐺',
    description: 'Animagi transform upon their first spellcast, surging with raw primal beast power.',
    breakpoints: [
      {
        count: 2,
        description: '(2) On transform, gain +40% Maximum Health and +25 Attack Damage.',
        bonus: { health: 300, attackDamage: 25 },
      },
      {
        count: 4,
        description: '(4) On transform, gain +90% Maximum Health and +60 Attack Damage.',
        bonus: { health: 700, attackDamage: 60 },
      },
    ],
  },

  Handler: {
    id: 'Handler',
    name: 'Handler',
    type: 'class',
    icon: '🐾',
    description: 'Handlers command magical companions that enter the fray to fight alongside them.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Combat start: Summons a 700 HP Beast companion with 45 AD.',
        bonus: { health: 250 },
      },
    ],
  },

  // ==========================================
  // 🏰 Origins / Factions (Lore & Allegiances)
  // ==========================================
  Gryffindor: {
    id: 'Gryffindor',
    name: 'Gryffindor',
    type: 'origin',
    icon: '🦁',
    description: 'Gryffindors exhibit fierce bravery in battle, gaining bonus Attack Damage and low-health shields.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Gryffindors gain +20 Attack Damage.',
        bonus: { attackDamage: 20 },
      },
      {
        count: 4,
        description: '(4) Gryffindors gain +45 Attack Damage and a 300 HP shield when dropping below 40% HP.',
        bonus: { attackDamage: 45 },
      },
      {
        count: 6,
        description: '(6) Gryffindors gain +80 Attack Damage and a 650 HP shield when dropping below 50% HP.',
        bonus: { attackDamage: 80 },
      },
      {
        count: 8,
        description: '(8) Gryffindors gain +130 Attack Damage. At 50% HP, gain a 1,000 HP shield and +50% Attack Speed.',
        bonus: { attackDamage: 130, health: 400, attackSpeed: 0.5 },
      },
    ],
  },

  Slytherin: {
    id: 'Slytherin',
    name: 'Slytherin',
    type: 'origin',
    icon: '🐍',
    description: 'Slytherins strike ruthlessly, gaining bonus Critical Damage and executing low-health targets.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Slytherins gain +20% Critical Damage; attacks execute enemies below 10% HP.',
        bonus: { critDamage: 0.2 },
      },
      {
        count: 4,
        description: '(4) Slytherins gain +45% Critical Damage; attacks execute enemies below 18% HP.',
        bonus: { critDamage: 0.45 },
      },
      {
        count: 6,
        description: '(6) Slytherins gain +80% Critical Damage; attacks execute enemies below 28% HP.',
        bonus: { critDamage: 0.8 },
      },
      {
        count: 8,
        description: '(8) Slytherins gain +130% Crit Damage & +35% Crit Chance; attacks execute enemies below 38% HP.',
        bonus: { critDamage: 1.3, critChance: 0.35, abilityPower: 0.3 },
      },
    ],
  },

  Ravenclaw: {
    id: 'Ravenclaw',
    name: 'Ravenclaw',
    type: 'origin',
    icon: '🦅',
    description: 'Ravenclaws possess supreme intellect, starting combat with bonus Mana and generating Mana faster.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Ravenclaws start combat with +20 Mana and generate +3 Mana per second.',
        bonus: { startingMana: 20 },
      },
      {
        count: 4,
        description: '(4) Ravenclaws start combat with +45 Mana and generate +7 Mana per second.',
        bonus: { startingMana: 45 },
      },
      {
        count: 6,
        description: '(6) Ravenclaws start combat with +75 Mana and generate +12 Mana per second.',
        bonus: { startingMana: 75 },
      },
      {
        count: 8,
        description: '(8) Ravenclaws start with 100% full Mana and generate +20 Mana/sec; spells empower all allies with +25% AP.',
        bonus: { startingMana: 100, abilityPower: 0.5 },
      },
    ],
  },

  Hufflepuff: {
    id: 'Hufflepuff',
    name: 'Hufflepuff',
    type: 'origin',
    icon: '🦡',
    description: 'Hufflepuffs stand loyal and unyielding, granting teamwide damage reduction and defense.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All allies take 12% reduced damage from all sources.',
        bonus: { armor: 20, magicResist: 20 },
      },
      {
        count: 4,
        description: '(4) All allies take 25% reduced damage from all sources.',
        bonus: { armor: 45, magicResist: 45 },
      },
      {
        count: 6,
        description: '(6) All allies take 40% reduced damage and gain +60 Armor and Magic Resist.',
        bonus: { armor: 60, magicResist: 60 },
      },
      {
        count: 8,
        description: '(8) All allies take 55% reduced damage, gain +100 Armor & MR, and regenerate 5% Max HP per second.',
        bonus: { armor: 100, magicResist: 100, health: 500, omnivamp: 0.2 },
      },
    ],
  },

  'Order of Phoenix': {
    id: 'Order of Phoenix',
    name: 'Order of Phoenix',
    type: 'origin',
    icon: '🕊️',
    description: 'The Order of the Phoenix fights as one. When an Order ally falls, they pass their stats to living allies.',
    breakpoints: [
      {
        count: 2,
        description: '(2) On death, grants 25% of their AD, AP, and remaining Mana to the nearest Order ally.',
        bonus: { health: 150 },
      },
      {
        count: 4,
        description: '(4) On death, grants 50% of their AD, AP, and Mana to ALL surviving allies.',
        bonus: { health: 350 },
      },
    ],
  },

  'Death Eater': {
    id: 'Death Eater',
    name: 'Death Eater',
    type: 'origin',
    icon: '💀',
    description: 'Death Eaters channel the Dark Mark, causing their spells to inflict Dark Curses dealing True Damage.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Death Eater abilities deal 20% bonus True Damage over 3 seconds.',
        bonus: { abilityPower: 0.2 },
      },
      {
        count: 4,
        description: '(4) Death Eater abilities deal 50% bonus True Damage and reduce target healing by 50%.',
        bonus: { abilityPower: 0.45 },
      },
    ],
  },

  Ghost: {
    id: 'Ghost',
    name: 'Ghost',
    type: 'origin',
    icon: '👻',
    description: 'Hogwarts ghosts are intangible spirits who take reduced physical damage and float freely.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Ghosts take 25% reduced physical damage and gain +20% Dodge Chance.',
        bonus: { dodgeChance: 0.2 },
      },
      {
        count: 4,
        description: '(4) Ghosts take 45% reduced physical damage and gain +35% Dodge Chance.',
        bonus: { dodgeChance: 0.35, armor: 40 },
      },
    ],
  },

  'Magical Creature': {
    id: 'Magical Creature',
    name: 'Magical Creature',
    type: 'origin',
    icon: '🦄',
    description: 'Beasts and magical fauna fight with untamed ferocity, gaining bonus Attack Speed and Omnivamp.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Magical Creatures gain +25% Attack Speed and 15% Omnivamp.',
        bonus: { attackSpeed: 0.25, omnivamp: 0.15 },
      },
      {
        count: 4,
        description: '(4) Magical Creatures gain +60% Attack Speed and 30% Omnivamp.',
        bonus: { attackSpeed: 0.6, omnivamp: 0.3 },
      },
    ],
  },

  Ministry: {
    id: 'Ministry',
    name: 'Ministry',
    type: 'origin',
    icon: '⚖️',
    description: 'Ministry officials and Aurors enforce magical law, suppressing the strongest enemy unit.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Combat start: Disarms and silences the highest-cost enemy unit for 2.5 seconds.',
        bonus: { abilityPower: 0.15 },
      },
      {
        count: 4,
        description: '(4) Combat start: Disarms and silences the 2 highest-cost enemy units for 4.0 seconds.',
        bonus: { abilityPower: 0.35 },
      },
    ],
  },

  Professor: {
    id: 'Professor',
    name: 'Professor',
    type: 'origin',
    icon: '🎓',
    description: 'Hogwarts Professors lecture and inspire, granting massive AP & AD aura to adjacent allies.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Professors grant +25 AP and +20 AD to themselves and 2 adjacent allies.',
        bonus: { abilityPower: 0.25, attackDamage: 20 },
      },
      {
        count: 4,
        description: '(4) Professors grant +60 AP and +50 AD to all team allies.',
        bonus: { abilityPower: 0.6, attackDamage: 50 },
      },
    ],
  },

  Magizoologist: {
    id: 'Magizoologist',
    name: 'Magizoologist',
    type: 'origin',
    icon: '🧳',
    description: 'Masters of Fantastic Beasts empower all Magical Creature allies with health and power.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All Magical Creature allies gain +400 Max HP and +30% Attack Damage.',
        bonus: { health: 400, attackDamage: 30 },
      },
    ],
  },

  'House-Elf': {
    id: 'House-Elf',
    name: 'House-Elf',
    type: 'origin',
    icon: '🧦',
    description: 'House-Elves possess powerful wandless magic, protecting and shielding their master carry.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Combat start: Bestows a 400 HP shield and +25 Starting Mana onto your highest-cost ally.',
        bonus: { startingMana: 25 },
      },
      {
        count: 3,
        description: '(3) Combat start: Bestows an 800 HP shield and +50 Starting Mana onto your 2 highest-cost allies.',
        bonus: { startingMana: 50 },
      },
    ],
  },

  'Dark Wizard': {
    id: 'Dark Wizard',
    name: 'Dark Wizard',
    type: 'origin',
    icon: '🔮',
    description: 'Practitioners of the Dark Arts wield destructive curses that burn and incinerate enemies.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Dark Wizard spells ignite targets, dealing 15% max HP as magic burn and reducing healing by 50%.',
        bonus: { abilityPower: 0.25 },
      },
      {
        count: 4,
        description: '(4) Dark Wizard spells deal 35% max HP burn and execute enemies below 15% HP.',
        bonus: { abilityPower: 0.5 },
      },
    ],
  },

  Beauxbatons: {
    id: 'Beauxbatons',
    name: 'Beauxbatons',
    type: 'origin',
    icon: '🦋',
    description: 'Beauxbatons sorcerers charm opponents, reducing enemy damage output.',
    breakpoints: [
      {
        count: 2,
        description: '(2) All enemies deal 20% less damage for the first 8 seconds of combat.',
        bonus: { abilityPower: 0.2 },
      },
      {
        count: 3,
        description: '(3) All enemies deal 35% less damage and are slowed by 25% for 10 seconds.',
        bonus: { abilityPower: 0.4 },
      },
    ],
  },

  Durmstrang: {
    id: 'Durmstrang',
    name: 'Durmstrang',
    type: 'origin',
    icon: '⛵',
    description: 'Durmstrang champions train relentlessly in martial magic, gaining Attack Speed and Armor.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Durmstrang units gain +30% Attack Speed and +25 Armor.',
        bonus: { attackSpeed: 0.3, armor: 25 },
      },
      {
        count: 4,
        description: '(4) Durmstrang units gain +70% Attack Speed and +60 Armor.',
        bonus: { attackSpeed: 0.7, armor: 60 },
      },
    ],
  },

  Dragon: {
    id: 'Dragon',
    name: 'Dragon',
    type: 'origin',
    icon: '🐉',
    description: 'Ancient Dragons possess indestructible scales and breath attacks that cleave adjacent foes.',
    breakpoints: [
      {
        count: 1,
        description: '(1) Dragons gain +400 Health and basic attacks deal 25% splash damage to adjacent enemies.',
        bonus: { health: 400, attackDamage: 30 },
      },
    ],
  },

  Divine: {
    id: 'Divine',
    name: 'Divine',
    type: 'origin',
    icon: '👑',
    description: 'Ancient Founders and mythical legends start combat with full Mana and double their primary stat.',
    breakpoints: [
      {
        count: 1,
        description: '(1) Divine units start combat with 100% Mana and gain +40% Ability Power & +40 AD.',
        bonus: { startingMana: 100, abilityPower: 0.4, attackDamage: 40 },
      },
    ],
  },

  'Golden Trio': {
    id: 'Golden Trio',
    name: 'Golden Trio',
    type: 'origin',
    icon: '⚡',
    description: 'Harry, Hermione, and Ron share an unbreakable bond. When all 3 are deployed, they resonate with massive spell power, starting mana, and grant each other shields and mana on spell casts. (Incompatible with Slytherin Trio: both deactivate if all 6 are fielded).',
    breakpoints: [
      {
        count: 3,
        description: '(3) Golden Trio units gain +25% Ability Power, +25% Attack Speed, and start with +20 Mana. Whenever any member casts, the other two gain 15 Mana and a 200 HP shield. (Disabled if Slytherin Trio is also fielded).',
        bonus: { abilityPower: 0.25, attackSpeed: 0.25, startingMana: 20, health: 150 },
      },
    ],
  },

  'Slytherin Trio': {
    id: 'Slytherin Trio',
    name: 'Slytherin Trio',
    type: 'origin',
    icon: '🐍',
    description: 'Draco Malfoy commands his loyal enforcers Crabbe & Goyle. Crabbe and Goyle become fortified frontline juggernauts, while Draco gains massive Critical Strike Chance and bonus AD. (Incompatible with Golden Trio: both deactivate if all 6 are fielded).',
    breakpoints: [
      {
        count: 3,
        description: '(3) Vincent Crabbe & Gregory Goyle gain +400 Health and +30 Armor/MR. Draco Malfoy gains +35% Critical Strike Chance and +35% Attack Damage. (Disabled if Golden Trio is also fielded).',
        bonus: { health: 300, armor: 25, magicResist: 25, critChance: 0.35, attackDamage: 25 },
      },
    ],
  },

  Weasley: {
    id: 'Weasley',
    name: 'Weasley',
    type: 'origin',
    icon: '🦁',
    description: 'The Weasley family fights with fierce family solidarity, rallying one another with escalating attack speed and attack damage.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Weasleys gain +20% Attack Speed and +15 Attack Damage.',
        bonus: { attackSpeed: 0.2, attackDamage: 15 },
      },
      {
        count: 4,
        description: '(4) Weasleys gain +50% Attack Speed and +45 Attack Damage. When any Weasley drops below 40% HP, all Weasleys gain a 350 HP shield.',
        bonus: { attackSpeed: 0.5, attackDamage: 45, health: 350 },
      },
    ],
  },

  Malfoy: {
    id: 'Malfoy',
    name: 'Malfoy',
    type: 'origin',
    icon: '🪙',
    description: 'The noble House of Malfoy uses their vast wealth and influence to bribe the duel arbiters, sundering and shredding all enemy defenses at combat start and plundering extra gold.',
    breakpoints: [
      {
        count: 2,
        description: '(2) Combat Start: Inflicts all enemies with -20% Sunder (Armor) and -20% Shred (MR) for 8 seconds. Malfoys gain +20% Ability Power.',
        bonus: { abilityPower: 0.2 },
      },
      {
        count: 3,
        description: '(3) Malfoys gain +50% Ability Power. Winning combat with at least one surviving Malfoy grants +2 bonus Gold.',
        bonus: { abilityPower: 0.5 },
      },
    ],
  },
};
