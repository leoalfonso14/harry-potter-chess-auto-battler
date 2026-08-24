import { UnitDefinition } from '../types/unit.js';

export const UNITS: Record<string, UnitDefinition> = {
  "neville_longbottom": {
    "id": "neville_longbottom",
    "name": "Neville Longbottom",
    "cost": 1,
    "combatRole": "Tank",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Herbologist",
        "Guardian"
    ],
    "stats": {
      "hp": [
        650,
        1170,
        2340
      ],
      "armor": 40,
      "magicResist": 35,
      "attackDamage": [
        36,
        65,
        130
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 70
    },
    "ability": {
      "name": "Petrificus Totalus",
      "description": "Stuns the target in a full-body bind and deals damage.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [
        120,
        216,
        432
      ],
      "targetType": "single"
    },
    "color": "#ae0001"
  },
  "colin_creevey": {
    "id": "colin_creevey",
    "name": "Colin Creevey",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Sorcerer"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 20,
      "magicResist": 25,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.7,
      "range": 4,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Flashbulb Jinx",
      "description": "Fires a blazing flashbulb blast that damages and blinds the nearest target.",
      "manaCost": 60,
      "damageType": "magic",
      "damageValues": [
        132,
        238,
        475
      ],
      "targetType": "single"
    },
    "color": "#740001"
  },
  "draco_malfoy": {
    "id": "draco_malfoy",
    "name": "Draco Malfoy",
    "cost": 3,
    "combatRole": "Assassin",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Inquisitorial Squad",
        "Malfoy"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 35,
      "magicResist": 30,
      "attackDamage": [
        60,
        135,
        234
      ],
      "attackSpeed": 0.85,
      "range": 1,
      "startingMana": 15,
      "maxMana": 65
    },
    "ability": {
      "name": "Serpensortia Viper Strike",
      "description": "Summons an aggressive venomous serpent that strikes the target for massive poison damage.",
      "manaCost": 65,
      "damageType": "magic",
      "damageValues": [160, 250, 420],
      "targetType": "single"
    },
    "color": "#1a472a"
  },
  "vincent_crabbe": {
    "id": "vincent_crabbe",
    "name": "Vincent Crabbe",
    "cost": 1,
    "combatRole": "Fighter",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Inquisitorial Squad",
        "Brawler"
    ],
    "stats": {
      "hp": [
        720,
        1296,
        2592
      ],
      "armor": 35,
      "magicResist": 25,
      "attackDamage": [
        40,
        72,
        144
      ],
      "attackSpeed": 0.6,
      "range": 1,
      "startingMana": 0,
      "maxMana": 80
    },
    "ability": {
      "name": "Bully Tackle",
      "description": "Slams heavy bulk into the target, gaining a shield and dealing damage.",
      "manaCost": 80,
      "damageType": "physical",
      "damageValues": [110, 170, 300],
      "healValues": [130, 190, 320],
      "targetType": "single"
    },
    "color": "#2a623d"
  },
  "gregory_goyle": {
    "id": "gregory_goyle",
    "name": "Gregory Goyle",
    "cost": 2,
    "combatRole": "Tank",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Inquisitorial Squad",
        "Guardian"
    ],
    "stats": {
      "hp": [
        800,
        1440,
        2880
      ],
      "armor": 45,
      "magicResist": 35,
      "attackDamage": [
        48,
        86,
        173
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 80
    },
    "ability": {
      "name": "Brute Wall Slam",
      "description": "Plants feet and slams forward, gaining a shield and reducing target attack speed.",
      "manaCost": 80,
      "damageType": "physical",
      "damageValues": [
        160,
        288,
        576
      ],
      "targetType": "single"
    },
    "color": "#1e3f20"
  },
  "luna_lovegood": {
    "id": "luna_lovegood",
    "name": "Luna Lovegood",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Diviner"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 20,
      "magicResist": 45,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.7,
      "range": 4,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Spectrespecs Lumos",
      "description": "Radiates mystical moonlight, dealing magic damage and granting bonus Magic Resist to allies.",
      "manaCost": 70,
      "damageType": "magic",
      "damageValues": [
        128,
        230,
        461
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#000a90"
  },
  "cho_chang": {
    "id": "cho_chang",
    "name": "Cho Chang",
    "cost": 1,
    "combatRole": "Marksman",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Sniper"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 20,
      "magicResist": 20,
      "attackDamage": [
        48,
        86,
        173
      ],
      "attackSpeed": 0.8,
      "range": 5,
      "startingMana": 0,
      "maxMana": 60
    },
    "ability": {
      "name": "Glisseo Frost Shot",
      "description": "Fires an icy frost bolt that chills the target, dealing physical damage and slowing attack speed.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        136,
        245,
        490
      ],
      "targetType": "single"
    },
    "color": "#0e1a40"
  },
  "hannah_abbott": {
    "id": "hannah_abbott",
    "name": "Hannah Abbott",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Herbologist"
    ],
    "stats": {
      "hp": [
        530,
        954,
        1908
      ],
      "armor": 25,
      "magicResist": 30,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.65,
      "range": 3,
      "startingMana": 20,
      "maxMana": 80
    },
    "ability": {
      "name": "Episkey Mend",
      "description": "Heals the lowest-health ally and cleanses negative status effects.",
      "manaCost": 80,
      "damageType": "physical",
      "healValues": [120, 180, 320],
      "targetType": "lowest_hp"
    },
    "color": "#ecb939"
  },
  "susan_bones": {
    "id": "susan_bones",
    "name": "Susan Bones",
    "cost": 1,
    "combatRole": "Tank",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Guardian"
    ],
    "stats": {
      "hp": [
        660,
        1188,
        2376
      ],
      "armor": 40,
      "magicResist": 35,
      "attackDamage": [
        35,
        63,
        126
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 70
    },
    "ability": {
      "name": "Protego Shield Wall",
      "description": "Erects a protective golden ward that shields herself and adjacent allies.",
      "manaCost": 70,
      "damageType": "physical",
      "shieldValues": [140, 210, 340],
      "targetType": "allies"
    },
    "color": "#d97706"
  },
  "dobby": {
    "id": "dobby",
    "name": "Dobby the House-Elf",
    "cost": 1,
    "combatRole": "Specialist",
    "origins": [
        "House-Elf"
    ],
    "classes": [
        "Trickster"
    ],
    "stats": {
      "hp": [
        510,
        918,
        1836
      ],
      "armor": 25,
      "magicResist": 35,
      "attackDamage": [
        37,
        66,
        133
      ],
      "attackSpeed": 0.75,
      "range": 2,
      "startingMana": 20,
      "maxMana": 60
    },
    "ability": {
      "name": "Elf Snap & Disarm",
      "description": "Snaps fingers with wandless magic, disarming the target and blinking away.",
      "manaCost": 60,
      "damageType": "magic",
      "shieldValues": [120, 180, 300],
      "targetType": "single"
    },
    "color": "#a78bfa"
  },
  "winky": {
    "id": "winky",
    "name": "Winky the House-Elf",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "House-Elf"
    ],
    "classes": [
        "Mystic"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 25,
      "magicResist": 35,
      "attackDamage": [
        35,
        63,
        126
      ],
      "attackSpeed": 0.7,
      "range": 3,
      "startingMana": 15,
      "maxMana": 60
    },
    "ability": {
      "name": "Butterbeer Blast",
      "description": "Hurls an explosive bottle of enchanted domestic brew, dealing magic damage to target and adjacent enemies.",
      "manaCost": 60,
      "damageType": "magic",
      "damageValues": [180, 310, 620],
      "targetType": "aoe",
      "radius": 1
    },
    "color": "#c084fc"
  },
  "bowtruckle": {
    "id": "bowtruckle",
    "name": "Bowtruckle",
    "cost": 1,
    "combatRole": "Specialist",
    "origins": [
        "Magical Creature"
    ],
    "classes": [
        "Sniper"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 20,
      "magicResist": 25,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.75,
      "range": 3,
      "startingMana": 10,
      "maxMana": 50
    },
    "ability": {
      "name": "Camouflage & Haste",
      "description": "Shoots a soothing thorn and empowers the closest ally with bonus Attack Speed.",
      "manaCost": 50,
      "damageType": "magic",
      "damageValues": [
        112,
        202,
        403
      ],
      "targetType": "allies"
    },
    "color": "#22c55e"
  },
  "niffler": {
    "id": "niffler",
    "name": "Niffler",
    "cost": 1,
    "combatRole": "Specialist",
    "origins": [
        "Magical Creature"
    ],
    "classes": [
        "Trickster"
    ],
    "stats": {
      "hp": [
        510,
        918,
        1836
      ],
      "armor": 25,
      "magicResist": 30,
      "attackDamage": [
        37,
        66,
        133
      ],
      "attackSpeed": 0.8,
      "range": 1,
      "startingMana": 10,
      "maxMana": 55
    },
    "ability": {
      "name": "Shiny Snatch",
      "description": "Dashes behind the target, stealing Mana and dealing physical bite damage.",
      "manaCost": 55,
      "damageType": "physical",
      "damageValues": [
        120,
        216,
        432
      ],
      "targetType": "single"
    },
    "color": "#15803d"
  },
  "poliakoff": {
    "id": "poliakoff",
    "name": "Poliakoff",
    "cost": 1,
    "combatRole": "Fighter",
    "origins": [
        "Durmstrang"
    ],
    "classes": [
        "Brawler"
    ],
    "stats": {
      "hp": [
        720,
        1296,
        2592
      ],
      "armor": 35,
      "magicResist": 25,
      "attackDamage": [
        43,
        78,
        155
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 70
    },
    "ability": {
      "name": "Northern Heavy Cleave",
      "description": "Swings an icy iron staff, cleaving adjacent foes and gaining bonus Armor.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [
        128,
        230,
        461
      ],
      "targetType": "single"
    },
    "color": "#7f1d1d"
  },
  "gabrielle_delacour": {
    "id": "gabrielle_delacour",
    "name": "Gabrielle Delacour",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "Beauxbatons"
    ],
    "classes": [
        "Mystic"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 20,
      "magicResist": 30,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.7,
      "range": 3,
      "startingMana": 20,
      "maxMana": 60
    },
    "ability": {
      "name": "Veela Blessing",
      "description": "Casts a gentle radiant beam that restores Health to the lowest HP allies.",
      "manaCost": 60,
      "damageType": "magic",
      "healValues": [130, 200, 350],
      "targetType": "lowest_hp"
    },
    "color": "#7dd3fc"
  },
  "moaning_myrtle": {
    "id": "moaning_myrtle",
    "name": "Moaning Myrtle",
    "cost": 1,
    "combatRole": "Caster",
    "origins": [
        "Ghost",
        "Ravenclaw"
    ],
    "classes": [
        "Mystic"
    ],
    "stats": {
      "hp": [
        500,
        900,
        1800
      ],
      "armor": 30,
      "magicResist": 40,
      "attackDamage": [
        34,
        61,
        121
      ],
      "attackSpeed": 0.65,
      "range": 3,
      "startingMana": 40,
      "maxMana": 120
    },
    "ability": {
      "name": "Wailing Flood",
      "description": "Summons a flooding bathroom wave centered on her target, dealing magic damage and slowing enemy Attack Speed in an area.",
      "manaCost": 120,
      "damageType": "magic",
      "damageValues": [
        65,
        115,
        230
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#60a5fa"
  },
  "ron_weasley": {
    "id": "ron_weasley",
    "name": "Ron Weasley",
    "cost": 2,
    "combatRole": "Fighter",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Golden Trio",
        "Weasley"
    ],
    "stats": {
      "hp": [
        750,
        1313,
        2775
      ],
      "armor": 35,
      "magicResist": 30,
      "attackDamage": [
        51,
        90,
        190
      ],
      "attackSpeed": 0.7,
      "range": 1,
      "startingMana": 20,
      "maxMana": 80
    },
    "ability": {
      "name": "Wizard's Chess Knight Slam",
      "description": "Charges forward with giant chess piece force, dealing physical damage and knocking up enemies.",
      "manaCost": 80,
      "damageType": "physical",
      "damageValues": [180, 280, 500],
      "targetType": "single"
    },
    "color": "#d97706"
  },
  "hermione_granger": {
    "id": "hermione_granger",
    "name": "Hermione Granger",
    "cost": 2,
    "combatRole": "Caster",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Golden Trio",
        "Sorcerer"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 35,
      "attackDamage": [
        40,
        70,
        148
      ],
      "attackSpeed": 0.75,
      "range": 4,
      "startingMana": 20,
      "maxMana": 75
    },
    "ability": {
      "name": "Incendio Vortex",
      "description": "Conjures a roaring fiery vortex that scorches all enemies caught within.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#b45309"
  },
  "ginny_weasley": {
    "id": "ginny_weasley",
    "name": "Ginny Weasley",
    "cost": 2,
    "combatRole": "Marksman",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Weasley",
        "Sniper"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 25,
      "attackDamage": [
        56,
        101,
        202
      ],
      "attackSpeed": 0.8,
      "range": 5,
      "startingMana": 0,
      "maxMana": 60
    },
    "ability": {
      "name": "Bat-Bogey Hex",
      "description": "Unleashes a swarm of flapping bat bogeys that bite and sicken the target for heavy damage.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#ea580c"
  },
  "dean_thomas": {
    "id": "dean_thomas",
    "name": "Dean Thomas",
    "cost": 2,
    "combatRole": "Marksman",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Sniper"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 25,
      "attackDamage": [
        56,
        101,
        202
      ],
      "attackSpeed": 0.8,
      "range": 5,
      "startingMana": 0,
      "maxMana": 65
    },
    "ability": {
      "name": "Reducto Blast",
      "description": "Blasts the target with concussive force, sundering their armor and dealing physical damage.",
      "manaCost": 65,
      "damageType": "physical",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#c2410c"
  },
  "pansy_parkinson": {
    "id": "pansy_parkinson",
    "name": "Pansy Parkinson",
    "cost": 2,
    "combatRole": "Assassin",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Inquisitorial Squad",
        "Infiltrator"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 25,
      "attackDamage": [
        51,
        90,
        190
      ],
      "attackSpeed": 0.75,
      "range": 1,
      "startingMana": 10,
      "maxMana": 65
    },
    "ability": {
      "name": "Stinging Hex",
      "description": "Inflicts a searing hex on the target that guarantees a critical strike and slows movement.",
      "manaCost": 65,
      "damageType": "magic",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#15803d"
  },
  "kreacher": {
    "id": "kreacher",
    "name": "Kreacher",
    "cost": 2,
    "combatRole": "Tank",
    "origins": [
        "House-Elf"
    ],
    "classes": [
        "Guardian"
    ],
    "stats": {
      "hp": [
        750,
        1313,
        2775
      ],
      "armor": 45,
      "magicResist": 45,
      "attackDamage": [
        42,
        73,
        154
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 15,
      "maxMana": 75
    },
    "ability": {
      "name": "Black Heirloom Ward",
      "description": "Invokes ancient House of Black wards, gaining a shield and dealing damage with malice.",
      "manaCost": 75,
      "damageType": "magic",
      "shieldValues": [160, 240, 400],
      "targetType": "single"
    },
    "color": "#14532d"
  },
  "padma_patil": {
    "id": "padma_patil",
    "name": "Padma Patil",
    "cost": 2,
    "combatRole": "Caster",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Patil Sisters",
        "Sorcerer"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 35,
      "attackDamage": [
        40,
        70,
        148
      ],
      "attackSpeed": 0.75,
      "range": 4,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Diffindo Crescent",
      "description": "Fires crescent severing charms in a line, cutting through enemy magic resistance.",
      "manaCost": 70,
      "damageType": "magic",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#1e40af"
  },
  "parvati_patil": {
    "id": "parvati_patil",
    "name": "Parvati Patil",
    "cost": 2,
    "combatRole": "Marksman",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Patil Sisters",
        "Sniper"
    ],
    "stats": {
      "hp": [
        620,
        1116,
        2232
      ],
      "armor": 25,
      "magicResist": 25,
      "attackDamage": [
        56,
        101,
        202
      ],
      "attackSpeed": 0.75,
      "range": 5,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Incendio Barrage",
      "description": "Fires explosive flaming arrows that burst upon impact, dealing physical damage to the target.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#ae0001"
  },
  "cedric_diggory": {
    "id": "cedric_diggory",
    "name": "Cedric Diggory",
    "cost": 2,
    "combatRole": "Tank",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Guardian"
    ],
    "stats": {
      "hp": [
        780,
        1365,
        2886
      ],
      "armor": 45,
      "magicResist": 40,
      "attackDamage": [
        44,
        77,
        163
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 90
    },
    "ability": {
      "name": "Triwizard Aegis Ward",
      "description": "Raises an impervious protective barrier, granting a shield to himself and adjacent allies.",
      "manaCost": 90,
      "damageType": "physical",
      "shieldValues": [160, 250, 420],
      "targetType": "allies"
    },
    "color": "#eab308"
  },
  "professor_sprout": {
    "id": "professor_sprout",
    "name": "Pomona Sprout",
    "cost": 2,
    "combatRole": "Caster",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Professor",
        "Herbologist"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 30,
      "magicResist": 35,
      "attackDamage": [
        40,
        70,
        148
      ],
      "attackSpeed": 0.7,
      "range": 3,
      "startingMana": 25,
      "maxMana": 75
    },
    "ability": {
      "name": "Venomous Tentacula Root",
      "description": "Entangles enemies in living vines, healing nearby allies and rooting enemies.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [80, 125, 220],
      "healValues": [180, 280, 500],
      "targetType": "lowest_hp"
    },
    "color": "#ca8a04"
  },
  "nearly_headless_nick": {
    "id": "nearly_headless_nick",
    "name": "Nearly Headless Nick",
    "cost": 2,
    "combatRole": "Tank",
    "origins": [
        "Ghost",
        "Gryffindor"
    ],
    "classes": [
        "Guardian"
    ],
    "stats": {
      "hp": [
        780,
        1365,
        2886
      ],
      "armor": 45,
      "magicResist": 45,
      "attackDamage": [
        40,
        70,
        148
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 20,
      "maxMana": 80
    },
    "ability": {
      "name": "Head Toss Taunt",
      "description": "Flips his nearly severed head, taunting surrounding enemies and gaining a shield.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [60, 95, 160],
      "shieldValues": [180, 280, 460],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#93c5fd"
  },
  "viktor_krum": {
    "id": "viktor_krum",
    "name": "Viktor Krum",
    "cost": 2,
    "combatRole": "Fighter",
    "origins": [
        "Durmstrang"
    ],
    "classes": [
        "Duelist"
    ],
    "stats": {
      "hp": [
        680,
        1190,
        2516
      ],
      "armor": 35,
      "magicResist": 30,
      "attackDamage": [
        50,
        87,
        183
      ],
      "attackSpeed": 0.8,
      "range": 1,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Seeker's Dive Strike",
      "description": "Dives with supersonic speed into the target, striking with fierce physical power and surging with Attack Speed.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#991b1b"
  },
  "fleur_delacour": {
    "id": "fleur_delacour",
    "name": "Fleur Delacour",
    "cost": 2,
    "combatRole": "Caster",
    "origins": [
        "Beauxbatons"
    ],
    "classes": [
        "Duelist"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 25,
      "magicResist": 35,
      "attackDamage": [
        40,
        70,
        148
      ],
      "attackSpeed": 0.75,
      "range": 3,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Veela Allure Blast",
      "description": "Emits a blinding wave of Veela charm that damages and slows all enemies in a cone.",
      "manaCost": 70,
      "damageType": "magic",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#38bdf8"
  },
  "firenze": {
    "id": "firenze",
    "name": "Firenze the Centaur",
    "cost": 2,
    "combatRole": "Marksman",
    "origins": [
        "Magical Creature"
    ],
    "classes": [
        "Diviner"
    ],
    "stats": {
      "hp": [
        640,
        1120,
        2368
      ],
      "armor": 30,
      "magicResist": 30,
      "attackDamage": [
        58,
        104,
        209
      ],
      "attackSpeed": 0.8,
      "range": 5,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Divination Star Arrow",
      "description": "Fires an enchanted starlight arrow across the battlefield that pierces through armor.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        184,
        322,
        681
      ],
      "targetType": "single"
    },
    "color": "#059669"
  },
  "harry_potter": {
    "id": "harry_potter",
    "name": "Harry Potter",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Golden Trio",
        "Auror"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 30,
      "magicResist": 35,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 25,
      "maxMana": 75
    },
    "ability": {
      "name": "Expecto Patronum",
      "description": "Summons a majestic silver stag that rushes across the battlefield, knocking up and dealing magic damage to enemies.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#dc2626"
  },
  "fred_and_george": {
    "id": "fred_and_george",
    "name": "Fred & George Weasley",
    "cost": 3,
    "combatRole": "Marksman",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Weasley",
        "Trickster"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 30,
      "magicResist": 30,
      "attackDamage": [
        54,
        122,
        212
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Decoy Detonator Barrage",
      "description": "Tosses a cluster of exploding prank detonators that bounce and explode in an area.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#f97316"
  },
  "narcissa_malfoy": {
    "id": "narcissa_malfoy",
    "name": "Narcissa Malfoy",
    "cost": 3,
    "combatRole": "Specialist",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Malfoy",
        "Herbologist"
    ],
    "stats": {
      "hp": [
        800,
        1440,
        2880
      ],
      "armor": 35,
      "magicResist": 40,
      "attackDamage": [
        44,
        79,
        158
      ],
      "attackSpeed": 0.75,
      "range": 3,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Unbreakable Maternal Aegis",
      "description": "Pledges protection over her kin, granting the closest ally a shield and charming the farthest enemy.",
      "manaCost": 70,
      "damageType": "magic",
      "shieldValues": [220, 330, 560],
      "targetType": "lowest_hp"
    },
    "color": "#065f46"
  },
  "sirius_black": {
    "id": "sirius_black",
    "name": "Sirius Black",
    "cost": 3,
    "combatRole": "Assassin",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Animagi",
        "Duelist"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 35,
      "magicResist": 35,
      "attackDamage": [
        60,
        135,
        234
      ],
      "attackSpeed": 0.85,
      "range": 1,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Padfoot Shadow Pounce",
      "description": "Leaps from shadows in grim animagus form, tearing into the lowest-health enemy with high critical damage.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [260, 420, 800],
      "targetType": "lowest_hp"
    },
    "color": "#334155"
  },
  "bellatrix_lestrange": {
    "id": "bellatrix_lestrange",
    "name": "Bellatrix Lestrange",
    "cost": 3,
    "combatRole": "Assassin",
    "origins": [
        "Death Eater"
    ],
    "classes": [
        "Infiltrator",
        "Curse-Caster"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 30,
      "magicResist": 30,
      "attackDamage": [
        60,
        135,
        234
      ],
      "attackSpeed": 0.85,
      "range": 1,
      "startingMana": 15,
      "maxMana": 65
    },
    "ability": {
      "name": "Crucio Torment",
      "description": "Channels the Unforgivable Cruciatus Curse, dealing ticking True Damage that melts target armor.",
      "manaCost": 65,
      "damageType": "true",
      "damageValues": [280, 440, 880],
      "targetType": "single"
    },
    "color": "#450a0a"
  },
  "horace_slughorn": {
    "id": "horace_slughorn",
    "name": "Horace Slughorn",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Professor",
        "Herbologist"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 35,
      "magicResist": 45,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.7,
      "range": 3,
      "startingMana": 25,
      "maxMana": 80
    },
    "ability": {
      "name": "Felix Felicis Draught",
      "description": "Tosses a golden vial of liquid luck, granting bonus Crit Chance and Ability Power to strongest allies.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "allies"
    },
    "color": "#166534"
  },
  "filius_flitwick": {
    "id": "filius_flitwick",
    "name": "Filius Flitwick",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Professor",
        "Duelist"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 30,
      "magicResist": 40,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.85,
      "range": 4,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Wingardium Leviosa Flurry",
      "description": "Lifts frontline enemies into the air, disabling them before slamming them down.",
      "manaCost": 70,
      "damageType": "magic",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#1d4ed8"
  },
  "the_grey_lady": {
    "id": "the_grey_lady",
    "name": "The Grey Lady (Helena)",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Ghost",
        "Ravenclaw"
    ],
    "classes": [
        "Diviner"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 35,
      "magicResist": 45,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.75,
      "range": 4,
      "startingMana": 30,
      "maxMana": 75
    },
    "ability": {
      "name": "Spectral Diadem Radiance",
      "description": "Unleashes ethereal spirit light, granting all allies bonus Mana and dealing magic damage.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#64748b"
  },
  "remus_lupin": {
    "id": "remus_lupin",
    "name": "Remus Lupin",
    "cost": 3,
    "combatRole": "Fighter",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Animagi",
        "Auror"
    ],
    "stats": {
      "hp": [
        820,
        1845,
        3198
      ],
      "armor": 40,
      "magicResist": 35,
      "attackDamage": [
        58,
        130,
        225
      ],
      "attackSpeed": 0.75,
      "range": 1,
      "startingMana": 20,
      "maxMana": 70
    },
    "ability": {
      "name": "Moony's Feral Swipe",
      "description": "Transforms and slashes with werewolf claws, dealing physical damage and healing based on damage dealt.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [220, 350, 680],
      "healValues": [140, 210, 400],
      "targetType": "single"
    },
    "color": "#78716c"
  },
  "nymphadora_tonks": {
    "id": "nymphadora_tonks",
    "name": "Nymphadora Tonks",
    "cost": 3,
    "combatRole": "Specialist",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Animagi",
        "Auror"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 35,
      "magicResist": 35,
      "attackDamage": [
        53,
        119,
        206
      ],
      "attackSpeed": 0.8,
      "range": 2,
      "startingMana": 15,
      "maxMana": 65
    },
    "ability": {
      "name": "Metamorph Surge",
      "description": "Rapidly morphs combat forms, striking the enemy for magic damage and surging with stacking Attack Speed.",
      "manaCost": 50,
      "damageType": "magic",
      "damageValues": [250, 400, 780],
      "targetType": "single"
    },
    "color": "#ec4899"
  },
  "the_fat_friar": {
    "id": "the_fat_friar",
    "name": "The Fat Friar",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Ghost",
        "Hufflepuff"
    ],
    "classes": [
        "Mystic"
    ],
    "stats": {
      "hp": [
        820,
        1845,
        3198
      ],
      "armor": 40,
      "magicResist": 45,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.65,
      "range": 2,
      "startingMana": 25,
      "maxMana": 80
    },
    "ability": {
      "name": "Jovial Feast Blessing",
      "description": "Bestows a spectral feast that cleanses status effects and heals the lowest HP allies.",
      "manaCost": 80,
      "damageType": "physical",
      "healValues": [220, 340, 620],
      "targetType": "allies"
    },
    "color": "#fbbf24"
  },
  "igor_karkaroff": {
    "id": "igor_karkaroff",
    "name": "Igor Karkaroff",
    "cost": 3,
    "combatRole": "Caster",
    "origins": [
        "Durmstrang",
        "Death Eater"
    ],
    "classes": [
        "Curse-Caster"
    ],
    "stats": {
      "hp": [
        780,
        1755,
        3042
      ],
      "armor": 30,
      "magicResist": 40,
      "attackDamage": [
        48,
        108,
        187
      ],
      "attackSpeed": 0.75,
      "range": 4,
      "startingMana": 25,
      "maxMana": 75
    },
    "ability": {
      "name": "Curse of the Dark North",
      "description": "Freezes target in black ice, dealing heavy magic damage and chilling their attack speed.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "single"
    },
    "color": "#581c87"
  },
  "rubeus_hagrid": {
    "id": "rubeus_hagrid",
    "name": "Rubeus Hagrid",
    "cost": 3,
    "combatRole": "Fighter",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Handler",
        "Brawler"
    ],
    "stats": {
      "hp": [
        920,
        2070,
        3588
      ],
      "armor": 50,
      "magicResist": 45,
      "attackDamage": [
        56,
        126,
        218
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 90
    },
    "ability": {
      "name": "Fang, Fetch!",
      "description": "Summons his fierce boarhound Fang to bite and tackle the enemy, dealing physical smash damage.",
      "manaCost": 90,
      "damageType": "physical",
      "damageValues": [300, 480, 950],
      "targetType": "single"
    },
    "color": "#713f12"
  },
  "buckbeak": {
    "id": "buckbeak",
    "name": "Buckbeak the Hippogriff",
    "cost": 3,
    "combatRole": "Fighter",
    "origins": [
        "Magical Creature"
    ],
    "classes": [
        "Brawler"
    ],
    "stats": {
      "hp": [
        880,
        1980,
        3432
      ],
      "armor": 45,
      "magicResist": 40,
      "attackDamage": [
        60,
        135,
        234
      ],
      "attackSpeed": 0.8,
      "range": 1,
      "startingMana": 10,
      "maxMana": 70
    },
    "ability": {
      "name": "Razor Talon Sweep",
      "description": "Swoops with razor-sharp eagle talons, cleaving frontline enemies with fierce physical force.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [
        232,
        522,
        905
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#94a3b8"
  },
  "minerva_mcgonagall": {
    "id": "minerva_mcgonagall",
    "name": "Minerva McGonagall",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Professor",
        "Animagi"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 40,
      "magicResist": 45,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 30,
      "maxMana": 90
    },
    "ability": {
      "name": "Piertotum Locomotor",
      "description": "Animates the Hogwarts stone suits of armor, crushing enemies for AoE damage and a stun.",
      "manaCost": 90,
      "damageType": "magic",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#991b1b"
  },
  "severus_snape": {
    "id": "severus_snape",
    "name": "Severus Snape",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Death Eater"
    ],
    "classes": [
        "Professor",
        "Curse-Caster"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 45,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 25,
      "maxMana": 80
    },
    "ability": {
      "name": "Sectumsempra",
      "description": "Slashes invisible dark blades that cause enemies to bleed heavily and reduces their healing.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [380, 580, 1200],
      "targetType": "single"
    },
    "color": "#064e3b"
  },
  "lucius_malfoy": {
    "id": "lucius_malfoy",
    "name": "Lucius Malfoy",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Death Eater"
    ],
    "classes": [
        "Malfoy",
        "Curse-Caster"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 40,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 20,
      "maxMana": 75
    },
    "ability": {
      "name": "Imperio Green Beam",
      "description": "Channels the Imperius Curse, turning the highest AD enemy against their allies.",
      "manaCost": 75,
      "damageType": "magic",
      "damageValues": [340, 520, 1100],
      "targetType": "single"
    },
    "color": "#047857"
  },
  "molly_weasley": {
    "id": "molly_weasley",
    "name": "Molly Weasley",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Weasley",
        "Mystic"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 40,
      "magicResist": 40,
      "attackDamage": [
        68,
        122,
        258
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 30,
      "maxMana": 80
    },
    "ability": {
      "name": "Maternal Reductor Blast",
      "description": "Unleashes fierce protective wrath, blasting enemies in an area for heavy magic damage and granting the lowest HP ally a shield.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [110, 170, 320],
      "shieldValues": [260, 380, 680],
      "targetType": "aoeAll",
      "radius": 2
    },
    "color": "#b91c1c"
  },
  "the_bloody_baron": {
    "id": "the_bloody_baron",
    "name": "The Bloody Baron",
    "cost": 4,
    "combatRole": "Assassin",
    "origins": [
        "Ghost",
        "Slytherin"
    ],
    "classes": [
        "Infiltrator"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 40,
      "magicResist": 40,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.85,
      "range": 1,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Phantom Chain Cleave",
      "description": "Swings ghostly spectral chains with horrifying momentum, cleaving adjacent targets with true damage.",
      "manaCost": 60,
      "damageType": "true",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#475569"
  },
  "sybill_trelawney": {
    "id": "sybill_trelawney",
    "name": "Sybill Trelawney",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Professor",
        "Diviner"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 30,
      "magicResist": 50,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.75,
      "range": 4,
      "startingMana": 30,
      "maxMana": 80
    },
    "ability": {
      "name": "Grim Prophecy Orb",
      "description": "Shatters a mystical prophecy orb, granting allies bonus Dodge and dealing AoE magic damage.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#3b82f6"
  },
  "newt_scamander": {
    "id": "newt_scamander",
    "name": "Newt Scamander",
    "cost": 4,
    "combatRole": "Marksman",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Magizoologist",
        "Handler"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 40,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 30,
      "maxMana": 80
    },
    "ability": {
      "name": "Suitcase Menagerie Release",
      "description": "Opens his enchanted leather suitcase, releasing an enraged Zouwu that pounces and shreds the board.",
      "manaCost": 80,
      "damageType": "physical",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#0284c7"
  },
  "madeye_moody": {
    "id": "madeye_moody",
    "name": "Alastor 'Mad-Eye' Moody",
    "cost": 4,
    "combatRole": "Tank",
    "origins": [
        "Order of Phoenix",
        "Ministry"
    ],
    "classes": [
        "Auror"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 55,
      "magicResist": 50,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.7,
      "range": 2,
      "startingMana": 20,
      "maxMana": 85
    },
    "ability": {
      "name": "Constant Vigilance Ward",
      "description": "Erects an unbreakable auror barrier, gaining a massive shield and reflecting damage back to attackers.",
      "manaCost": 85,
      "damageType": "physical",
      "damageValues": [80, 130, 240],
      "shieldValues": [300, 450, 800],
      "targetType": "self"
    },
    "color": "#1e3a8a"
  },
  "gellert_grindelwald": {
    "id": "gellert_grindelwald",
    "name": "Gellert Grindelwald",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Dark Wizard",
        "Durmstrang"
    ],
    "classes": [
        "Sorcerer"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 45,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.85,
      "range": 4,
      "startingMana": 25,
      "maxMana": 80
    },
    "ability": {
      "name": "Protego Diabolica",
      "description": "Summons a ring of black and blue dragon fire that disintegrates enemies entering it.",
      "manaCost": 80,
      "damageType": "magic",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#0f172a"
  },
  "madame_maxime": {
    "id": "madame_maxime",
    "name": "Madame Olympe Maxime",
    "cost": 4,
    "combatRole": "Tank",
    "origins": [
        "Beauxbatons"
    ],
    "classes": [
        "Guardian",
        "Brawler"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 55,
      "magicResist": 50,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 15,
      "maxMana": 85
    },
    "ability": {
      "name": "Giantess Ground Stomp",
      "description": "Stomps with half-giant force, stunning adjacent foes and gaining a shield.",
      "manaCost": 85,
      "damageType": "physical",
      "damageValues": [90, 140, 260],
      "shieldValues": [260, 400, 700],
      "targetType": "aoe",
      "radius": 2
    },
    "color": "#0369a1"
  },
  "thestral": {
    "id": "thestral",
    "name": "Thestral",
    "cost": 4,
    "combatRole": "Assassin",
    "origins": [
        "Magical Creature",
        "Ghost"
    ],
    "classes": [
        "Infiltrator"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 40,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.85,
      "range": 1,
      "startingMana": 10,
      "maxMana": 60
    },
    "ability": {
      "name": "Invisible Death Swoop",
      "description": "Swoops unseen from the sky, striking the enemy backline for heavy physical burst and blinding them.",
      "manaCost": 60,
      "damageType": "physical",
      "damageValues": [
        280,
        504,
        1064
      ],
      "targetType": "single"
    },
    "color": "#1e293b"
  },
  "godric_gryffindor": {
    "id": "godric_gryffindor",
    "name": "Godric Gryffindor",
    "cost": 5,
    "combatRole": "Tank",
    "origins": [
        "Gryffindor"
    ],
    "classes": [
        "Founder",
        "Guardian"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 65,
      "magicResist": 60,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.8,
      "range": 1,
      "startingMana": 30,
      "maxMana": 85
    },
    "ability": {
      "name": "Sword of Gryffindor Wrath",
      "description": "Swings the ruby sword with heroic might, cleaving the entire frontline and granting team armor.",
      "manaCost": 85,
      "damageType": "physical",
      "damageValues": [120, 190, 380],
      "shieldValues": [280, 420, 750],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#dc2626"
  },
  "salazar_slytherin": {
    "id": "salazar_slytherin",
    "name": "Salazar Slytherin",
    "cost": 5,
    "combatRole": "Caster",
    "origins": [
        "Slytherin"
    ],
    "classes": [
        "Founder",
        "Sorcerer"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 50,
      "magicResist": 60,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.85,
      "range": 4,
      "startingMana": 30,
      "maxMana": 90
    },
    "ability": {
      "name": "Basilisk Roar & Petrify",
      "description": "Unleashes the King of Serpents, dealing mapwide magic damage and petrifying enemies.",
      "manaCost": 90,
      "damageType": "magic",
      "damageValues": [360, 550, 1300],
      "targetType": "aoe",
      "radius": 4
    },
    "color": "#065f46"
  },
  "rowena_ravenclaw": {
    "id": "rowena_ravenclaw",
    "name": "Rowena Ravenclaw",
    "cost": 5,
    "combatRole": "Fighter",
    "origins": [
        "Ravenclaw"
    ],
    "classes": [
        "Founder",
        "Duelist"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 45,
      "magicResist": 60,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.9,
      "range": 4,
      "startingMana": 40,
      "maxMana": 90
    },
    "ability": {
      "name": "Diadem of Infinite Wisdom",
      "description": "Channels infinite arcane brilliance, striking all enemies for magic damage and granting allies bonus Mana.",
      "manaCost": 90,
      "damageType": "magic",
      "damageValues": [320, 500, 1150],
      "targetType": "aoe",
      "radius": 4
    },
    "color": "#1e3a8a"
  },
  "helga_hufflepuff": {
    "id": "helga_hufflepuff",
    "name": "Helga Hufflepuff",
    "cost": 5,
    "combatRole": "Tank",
    "origins": [
        "Hufflepuff"
    ],
    "classes": [
        "Founder",
        "Mystic"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 55,
      "magicResist": 60,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.8,
      "range": 3,
      "startingMana": 30,
      "maxMana": 85
    },
    "ability": {
      "name": "Cup of Eternal Abundance",
      "description": "Pours golden restorative ambrosia that heals the team and grants bonus Armor and Magic Resist.",
      "manaCost": 85,
      "damageType": "physical",
      "shieldValues": [140, 210, 400],
      "healValues": [220, 340, 650],
      "targetType": "allies"
    },
    "color": "#ca8a04"
  },
  "albus_dumbledore": {
    "id": "albus_dumbledore",
    "name": "Albus Dumbledore",
    "cost": 5,
    "combatRole": "Caster",
    "origins": [
        "Order of Phoenix"
    ],
    "classes": [
        "Headmaster",
        "Grand Sorcerer"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 45,
      "magicResist": 55,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.85,
      "range": 4,
      "startingMana": 40,
      "maxMana": 100
    },
    "ability": {
      "name": "Elder Wand Firestorm Vortex",
      "description": "Summons a colossal cyclone of fire and water across the arena, dealing massive AoE magic damage.",
      "manaCost": 100,
      "damageType": "magic",
      "damageValues": [580, 920, 2100],
      "targetType": "aoe",
      "radius": 4
    },
    "color": "#6366f1"
  },
  "lord_voldemort": {
    "id": "lord_voldemort",
    "name": "Lord Voldemort",
    "cost": 5,
    "combatRole": "Assassin",
    "origins": [
        "Death Eater"
    ],
    "classes": [
        "Dark Lord",
        "Curse-Caster"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 40,
      "magicResist": 50,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.9,
      "range": 4,
      "startingMana": 30,
      "maxMana": 90
    },
    "ability": {
      "name": "Avada Kedavra",
      "description": "Casts the Killing Curse in a beam of blinding green light, dealing lethal True Damage.",
      "manaCost": 90,
      "damageType": "true",
      "damageValues": [800, 1300, 3000],
      "targetType": "single"
    },
    "color": "#047857"
  },
  "fawkes": {
    "id": "fawkes",
    "name": "Fawkes the Phoenix",
    "cost": 5,
    "combatRole": "Caster",
    "origins": [
        "Magical Creature"
    ],
    "classes": [
        "Mystic"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 45,
      "magicResist": 55,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.85,
      "range": 4,
      "startingMana": 40,
      "maxMana": 100
    },
    "ability": {
      "name": "Phoenix Rebirth & Tears",
      "description": "Erupts into brilliant golden flames, healing all allies and reviving the first fallen ally.",
      "manaCost": 90,
      "damageType": "magic",
      "damageValues": [80, 130, 260],
      "healValues": [200, 320, 600],
      "targetType": "allies"
    },
    "color": "#f59e0b"
  },
  "hungarian_horntail": {
    "id": "hungarian_horntail",
    "name": "Hungarian Horntail",
    "cost": 5,
    "combatRole": "Fighter",
    "origins": [
        "Dragon",
        "Magical Creature"
    ],
    "classes": [
        "Brawler"
    ],
    "stats": {
      "hp": [
        1040,
        1830,
        4368
      ],
      "armor": 60,
      "magicResist": 55,
      "attackDamage": [
        66,
        115,
        275
      ],
      "attackSpeed": 0.75,
      "range": 2,
      "startingMana": 20,
      "maxMana": 90
    },
    "ability": {
      "name": "Infernal Dragonfire Cone",
      "description": "Breaths a wide cone of incinerating dragon fire, dealing continuous magic burn damage.",
      "manaCost": 90,
      "damageType": "magic",
      "damageValues": [
        240,
        422,
        1200
      ],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#b91c1c"
  },
  "cornish_pixie": {
    "id": "cornish_pixie",
    "name": "Cornish Pixie",
    "cost": 1,
    "combatRole": "Specialist",
    "origins": [
        "Wild"
    ],
    "classes": [
        "Trickster"
    ],
    "stats": {
      "hp": [
        240,
        420,
        750
      ],
      "armor": 5,
      "magicResist": 5,
      "attackDamage": [
        14,
        26,
        46
      ],
      "attackSpeed": 0.65,
      "range": 2,
      "startingMana": 0,
      "maxMana": 60
    },
    "ability": {
      "name": "Pixie Mischief",
      "description": "Zips around and pinches for mild magic damage.",
      "manaCost": 60,
      "damageType": "magic",
      "damageValues": [
        48,
        80,
        144
      ],
      "targetType": "single"
    },
    "color": "#38bdf8"
  },
  "garden_gnome": {
    "id": "garden_gnome",
    "name": "Garden Gnome",
    "cost": 1,
    "combatRole": "Fighter",
    "origins": [
        "Wild"
    ],
    "classes": [
        "Brawler"
    ],
    "stats": {
      "hp": [
        280,
        500,
        900
      ],
      "armor": 5,
      "magicResist": 5,
      "attackDamage": [
        16,
        29,
        52
      ],
      "attackSpeed": 0.65,
      "range": 1,
      "startingMana": 0,
      "maxMana": 70
    },
    "ability": {
      "name": "Gnome Nibble",
      "description": "Bites the target ankle for physical damage.",
      "manaCost": 70,
      "damageType": "physical",
      "damageValues": [
        48,
        88,
        160
      ],
      "targetType": "single"
    },
    "color": "#a16207"
  },
  "acromantula_hatchling": {
    "id": "acromantula_hatchling",
    "name": "Acromantula Hatchling",
    "cost": 1,
    "combatRole": "Assassin",
    "origins": [
        "Wild"
    ],
    "classes": [
        "Infiltrator"
    ],
    "stats": {
      "hp": [
        480,
        864,
        1555
      ],
      "armor": 15,
      "magicResist": 15,
      "attackDamage": [
        28,
        50,
        90
      ],
      "attackSpeed": 0.75,
      "range": 1,
      "startingMana": 0,
      "maxMana": 60
    },
    "ability": {
      "name": "Venom Fang",
      "description": "Injects paralyzing spider venom into the target.",
      "manaCost": 60,
      "damageType": "magic",
      "damageValues": [
        96,
        176,
        320
      ],
      "targetType": "single"
    },
    "color": "#1c1917"
  },
  "argus_filch": {
    "id": "argus_filch",
    "name": "Argus Filch",
    "cost": 1,
    "combatRole": "Tank",
    "origins": [],
    "classes": [
        "Inquisitorial Squad",
        "Guardian"
    ],
    "stats": {
      "hp": [
        580,
        1044,
        2088
      ],
      "armor": 30,
      "magicResist": 25,
      "attackDamage": [
        32,
        58,
        115
      ],
      "attackSpeed": 0.6,
      "range": 1,
      "startingMana": 0,
      "maxMana": 80
    },
    "ability": {
      "name": "Mrs. Norris Prowl & Shackle",
      "description": "Sends Mrs. Norris to corner and shackle the target, stunning them with physical damage.",
      "manaCost": 80,
      "damageType": "physical",
      "damageValues": [
        60,
        108,
        216
      ],
      "targetType": "single"
    },
    "color": "#78350f"
  },
  "dolores_umbridge": {
    "id": "dolores_umbridge",
    "name": "Dolores Umbridge",
    "cost": 4,
    "combatRole": "Caster",
    "origins": [
        "Ministry"
    ],
    "classes": [
        "Headmaster",
        "Inquisitorial Squad"
    ],
    "stats": {
      "hp": [
        1200,
        2160,
        4560
      ],
      "armor": 35,
      "magicResist": 45,
      "attackDamage": [
        74,
        133,
        280
      ],
      "attackSpeed": 0.8,
      "range": 4,
      "startingMana": 30,
      "maxMana": 85
    },
    "ability": {
      "name": "Educational Decree #137",
      "description": "Enforces strict disciplinary order, silencing and disarming high-threat enemies and dealing magic damage.",
      "manaCost": 85,
      "damageType": "magic",
      "damageValues": [240, 380, 780],
      "targetType": "aoe",
      "radius": 3
    },
    "color": "#ec4899"
  }
};

export const UNIT_LIST: UnitDefinition[] = Object.values(UNITS);
