# 🧙‍♂️ The Grand Wizard's Duel: Comprehensive Game Design, Theories & Technical Architecture
*An 8-Player Tactical Auto-Battler in the Wizarding World*

---

## 📑 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Non-Technical: Game Design & Core Systems](#2-non-technical-game-design--core-systems)
   - [A. The Core Game Loop](#a-the-core-game-loop)
   - [B. Economy, Shop & Shared Pool Mathematics](#b-economy-shop--shared-pool-mathematics)
   - [C. Combat Logic, Mana Dynamics & Board Geometry](#c-combat-logic-mana-dynamics--board-geometry)
   - [D. Damage Scaling Architecture: Attack Damage (AD) vs. Ability Power (AP)](#d-damage-scaling-architecture-attack-damage-ad-vs-ability-power-ap)
   - [E. Magical Artifacts & Complete 36-Item Combination Grid](#e-magical-artifacts--complete-36-item-combination-grid)
3. [Harry Potter Lore, Factions & Character Roster](#3-harry-potter-lore-factions--character-roster)
   - [A. House & Faction Synergies (Origins & Classes)](#a-house--faction-synergies-origins--classes)
   - [B. Full Champion Roster by Tier (Cost 1 to Cost 5)](#b-full-champion-roster-by-tier-cost-1-to-cost-5)
4. [Deep Strategic Theories & Player Psychology](#4-deep-strategic-theories--player-psychology)
   - [A. Economic Strategy & The Three Playstyles](#a-economic-strategy--the-three-playstyles)
   - [B. Board Positioning & Aggro Theory](#b-board-positioning--aggro-theory)
   - [C. Game Theory & The Shared Champion Pool](#c-game-theory--the-shared-champion-pool)
5. [Technical Architecture & Web Stack](#5-technical-architecture--web-stack)
   - [A. Architecture Diagram](#a-architecture-diagram)
   - [B. Recommended Web Stack](#b-recommended-web-stack)
   - [C. Authoritative Server & Deterministic Simulation Flow](#c-authoritative-server--deterministic-simulation-flow)
   - [D. Production TypeScript Data Schemas](#d-production-typescript-data-schemas)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Future Expansions & Thematic Ideas](#7-future-expansions--thematic-ideas)
   - [A. The Triwizard Tournament Global Events](#a-the-triwizard-tournament-global-events)
   - [B. Horcruxes & Forbidden Dark Arts (Risk / Reward)](#b-horcruxes--forbidden-dark-arts-risk--reward)
   - [C. Patronus Familiar Comeback Mechanics](#c-patronus-familiar-comeback-mechanics)
   - [D. Ollivanders Wand Choosing Ceremony (Opening Perks)](#d-ollivanders-wand-choosing-ceremony-opening-perks)
   - [E. The Hogwarts House Cup](#e-the-hogwarts-house-cup)

---

## 1. Executive Summary & Vision

**The Grand Wizard's Duel** is a browser-based, 8-player tactical auto-battler built with a full-stack TypeScript architecture. Players buy iconic witches, wizards, magical creatures, and duelists from a shared pool, arrange them on an 8x4 tactical dueling grid, manage a deep interest-based economy, synthesize legendary magical artifacts, and watch simulated battles resolve in an authoritative server engine.

### Core Pillars of the Vision:
- **Zero-Friction Accessibility:** Instant loading directly via web URL with zero installs required.
- **Cross-Platform Responsive Play:** Seamless drag-and-drop mechanics across desktop mice and mobile touchscreens.
- **Authoritative Server Model:** 20-tick/sec deterministic headless combat simulation on the backend to prevent cheating, tampering, and desynchronizations.
- **Rich Wizarding World Theme:** Authentic Hogwarts houses, iconic spells, mythical beasts, Horcruxes, and legendary duels between the Order of the Phoenix and Death Eaters.

---

## 2. Non-Technical: Game Design & Core Systems

### A. The Core Game Loop
Every match is composed of consecutive stages and rounds broken into three distinct, synchronized phases:

```
┌───────────────────────────────┐
│     Planning Phase (25-30s)   │ -> Collect income, reroll shop, buy units,
│                               │    star-up 3-of-a-kind, position & equip items
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│      Combat Phase (30-45s)    │ -> Server pairs players (or neutral PvE creeps);
│                               │    Units auto-attack, build mana, & cast spells
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│     Resolution Phase (3s)     │ -> Surviving units deal avatar damage to losers;
│                               │    Eliminated players return units to shared pool
└───────────────────────────────┘
```

1. **Opening Setup & Planning Phase (25–30s):**
   - **Match Start:** Every player starts with **0 gold** and **1 random 1-cost champion** deployed on their board.
   - **First 3 Rounds (Stage 1-1, 1-2, 1-3) - PvE Creep Encounters:** Players battle solo against neutral PvE creature waves (Cornish Pixies, Garden Gnomes, and Acromantula Hatchlings) rather than facing other players or bots. Victories grant component item and gold orb drops.
   - **Economy & Shop:** Collect round income (Base Gold + Compound Interest + Streak Bonuses), reroll the shop (2 gold), or Buy XP (4 gold for 4 XP).
   - **Star-Up Synthesis:** Combine identical champions (3 copies of 1★ $\rightarrow$ 2★; 3 copies of 2★ $\rightarrow$ 3★).
   - **Tactical Positioning:** Position units on your side of the 8x4 grid and assign equipped artifacts.
2. **Combat Phase (Dynamic Duration):**
   - **Auto-Deploy from Reserve Bench:** If a player has fewer units deployed on their board than their maximum unit capacity (Player Level), the engine automatically moves reserve bench units onto empty board tiles.
   - **Pairings & Simulation:** From Stage 2-1 onward, the authoritative server pairs players into 1v1 duels (with ghost clone matching if odd).
   - **Autonomous Simulation & Spellcasting:** Units act autonomously: pathfinding toward valid targets, basic-attacking to charge Mana, regenerating Mana passively via Pensieve Crystals, and unleashing signature spells upon reaching full Mana.
   - **Dynamic Early Resolution:** If all units on one side are eliminated in all duels across the lobby, the combat phase timer immediately shortens to **2 seconds**, transitioning cleanly into resolution without unnecessary downtime.
3. **Resolution Phase (2s):**
   - **PvP Resolution:** The losing player takes damage based on stage scaling and surviving enemy units. If the timer expires while both sides still have units standing, it is declared a **Tie** (both players take tie penalty damage and streaks reset to 0).
   - **PvE Resolution:** Defeating the creep wave awards full bonus gold and component drops. If the player takes too long (Tie) or is defeated, the player takes damage and only receives a partial consolation reward (+1g, no components).
   - **Eliminations & Pool Recirculation:** At 0 HP, a player is eliminated and their champions return to the shared pool. A brief 2-second resolution window gives players time to reset mentally before the next Planning Phase begins.

---

### B. Economy, Shop & Shared Pool Mathematics

#### Income Formula
$$\text{Total Income per Round} = \text{Base Income} + \text{Interest} + \text{Streak Bonus}$$

- **Base Income:** **3 gold/round** in Stage 1 (plus +2 bonus gold on PvE round victory), standardizing to **5 gold/round** from Stage 2 onward.
- **Compound Interest:** Grants **+1 gold per 10 gold stored** in bank at the end of the round (capped at +5 gold for holding 50+ gold).
- **Streak Bonuses:** Consecutive win or loss streaks award **+1 to +3 bonus gold** (+1 for 2-3 streak, +2 for 4 streak, +3 for 5+ streak).
- **Leveling Curve:** Spending 4 gold grants 4 XP. Player Level dictates max team size on the board (e.g., Level 7 allows 7 units) and dictates shop roll odds for legendary units.

#### Stage & Round Progression Schedule

Matches follow a structured, multi-stage cadence designed around strategic pacing, economy compounding, and item building:

| Stage | Round Cadence | Encounter Breakdown & Drops |
| :--- | :--- | :--- |
| **Stage 1** | **Rounds 1-1, 1-2, 1-3** | **Opening PvE Creep Rounds:** 3 gold base income + 2 bonus gold + 1 component item per round (Total: **3 components + 6 bonus gold**). |
| **Stage 2** | **Rounds 2-1 to 2-7** | **2-1 to 2-3:** PvP Player/Bot duels.<br>**2-4:** **Room of Requirement Armory Choice:** Choose 1 of 5 random components & 1 of 8 champions (Cost 1-3).<br>**2-5 to 2-6:** PvP duels.<br>**2-7:** **PvE Mountain Gnomes:** +6 bonus gold + 3 component items. |
| **Stage 3** | **Rounds 3-1 to 3-7** | **3-1 to 3-3:** PvP duels.<br>**3-4:** **Armory Choice Round:** Choose 1 of 5 components & 1 of 8 champions (Cost 2-4).<br>**3-5 to 3-6:** PvP duels.<br>**3-7:** **PvE Acromantula Brood:** +6 bonus gold + 3 component items. |
| **Stage 4** | **Rounds 4-1 to 4-7** | **4-1 to 4-3:** PvP duels.<br>**4-4:** **Armory Choice Round:** Choose 1 of 5 components & 1 of 8 champions (Cost 3-5).<br>**4-5 to 4-6:** PvP duels.<br>**4-7:** **PvE Forbidden Forest Boss:** +6 bonus gold + 3 component items. |
| **Stage 5+** | **Rounds 5-1 to 5-7** | **5-1 to 5-3:** Endgame PvP duels.<br>**5-4:** **Legendary Armory Choice:** Choose 1 of 5 components & 1 of 8 champions (Cost 4-5).<br>**5-5 to 5-6:** Final PvP duels.<br>**5-7:** **PvE Dragon Boss:** +8 bonus gold + 4 component items. |

> [!IMPORTANT]
> **PvE Drop Parity Guarantee:** All PvE rounds are mathematically balanced to award **exactly 12 component items + 24 bonus gold** cumulatively by the end of Stage 4-7. Every player in the lobby receives the exact same number of component drops on each PvE round.

#### Shared Unit Pool Size
All 8 players draft from one global deck of cards. Purchasing a unit removes it from the shared bag for everyone:
- **Cost 1:** 29 copies of each unit in the pool
- **Cost 2:** 22 copies of each unit in the pool
- **Cost 3:** 18 copies of each unit in the pool
- **Cost 4:** 12 copies of each unit in the pool
- **Cost 5 (Legendary):** 10 copies of each unit in the pool

#### Shop Odds Progression Matrix

| Player Level | Tier 1 (1 Gold) | Tier 2 (2 Gold) | Tier 3 (3 Gold) | Tier 4 (4 Gold) | Tier 5 (5 Gold) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Level 3** | 75% | 25% | 0% | 0% | 0% |
| **Level 4** | 55% | 30% | 15% | 0% | 0% |
| **Level 5** | 45% | 33% | 20% | 2% | 0% |
| **Level 6** | 25% | 40% | 30% | 5% | 0% |
| **Level 7** | 19% | 30% | 35% | 15% | 1% |
| **Level 8** | 16% | 25% | 35% | 20% | 4% |
| **Level 9** | 10% | 18% | 32% | 30% | 10% |
| **Level 10** | 5% | 10% | 20% | 40% | 25% |

---

### C. Hexagonal Board Geometry, 6 Innate Combat Roles & Mana Dynamics

#### 1. Hexagonal Board Geometry (TFT-Style Odd-R Offset Grid)
The tactical battlefield is composed of an **8-column $\times$ 4-row (Home) + 4-row (Away) Hexagonal Grid** where odd rows are horizontally offset by half a hex width ($0.5 \times \text{hexWidth}$):
- **Hex Distance Formula:** Converted to 3D Cube coordinates $(q, r, s)$ where:
  $$q = \text{col} - \frac{\text{row} - (\text{row} \ \& \ 1)}{2}, \quad r = \text{row}, \quad s = -q - r$$
  $$\text{HexDistance}(A, B) = \max(|q_A - q_B|, |r_A - r_B|, |s_A - s_B|)$$
- **Movement & Pathfinding:** Units step smoothly between adjacent hex neighbors, eliminating instant teleports and enabling strategic chokepoint blocking.

---

#### 2. The 6 Innate Combat Roles

Every champion in the game possesses exactly **1 Innate Combat Role** that governs baseline mana economy, survivability, and targeting priority:

| Combat Role | Attack Mana Gain | Damage Taken Mana | Inherent Mechanics & Threat Priority |
| :--- | :---: | :---: | :--- |
| **🛡️ Tank** | **+5 Mana** | **+Mana per damage taken** | **High Threat (Score 2):** Frontline anchors designed to absorb damage. **Only role that gains mana from taking damage** (~8% of damage taken, capped at 40). Prioritized by enemies on distance tie-breakers. |
| **⚔️ Fighter** | **+10 Mana** | None | **Medium Threat (Score 1):** Durable melee bruisers. Possesses **inherent 10% Omnivamp** (heals for 10% of all physical and magic damage dealt). |
| **✨ Caster** | **+10 Mana** | None | **Low Threat (Score 0):** Ability-focused sorcerers generating +10 mana per attack and possessing **baseline passive mana regeneration (+3 mana/second)**. |
| **🎯 Marksman** | **+10 Mana** | None | **Low Threat (Score 0):** Ranged physical hyper-carries scaling primarily through basic attacks and attack speed. |
| **🗡️ Assassin** | **+10 Mana** | None | **Low Threat (Score 0):** Fragile, highly mobile backline divers. Leaps to the enemy backline at Tick 0 and has low targeting priority if a Tank or Fighter is nearby. |
| **🔮 Specialist** | Custom / None | None | **Specialist:** Unique champions that bypass standard mana rules or utilize alternate resources. |

---

#### 3. Targeting & Aggro Hierarchy
1. **Primary Metric (Shortest Hex Distance):** Units always target the enemy champion that is fewest hex steps away.
2. **Distance Tie-Breaker (When 2+ enemies are equidistant):**
   - **Threat Score:** **Tank (2)** $\rightarrow$ **Fighter (1)** $\rightarrow$ **Assassin / Caster / Marksman / Specialist (0)**.
   - If threat scores are equal: lowest current Health.

---

### D. Damage Scaling Architecture: Attack Damage (AD) vs. Ability Power (AP)

Just like modern tactical auto-battlers, champions in *The Grand Wizard's Duel* scale their performance through distinct combat stats:

```
┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐
│      ATTACK DAMAGE (AD) CARRIES        │   │       ABILITY POWER (AP) MAGES         │
├────────────────────────────────────────┤   ├────────────────────────────────────────┤
│ • Scales basic auto-attack wand/melee  │   │ • Multiplies magical spell damage,     │
│   strikes on a 1:1 basis.              │   │   shields, and healing outputs.        │
│ • Powers physical abilities (e.g. Ron's│   │ • Powers magic abilities (e.g.         │
│   Knight Charge, Mad-Eye's Snipe,      │   │   Hermione's Firestorm, Dumbledore's   │
│   Sirius Black's Grim Leap).           │   │   Vortex, Voldemort's Killing Curse).  │
│ • Key Components: Basilisk Fang (🗡️)   │   │ • Key Components: Wand Core (🪄)       │
└────────────────────────────────────────┘   └────────────────────────────────────────┘
```

#### Critical Strike Dynamics (Chance & Multiplier)
- **Base Stats:** Every champion starts with a base **25% Critical Strike Chance** and **150% Critical Strike Damage**. Assassins start with an innate **40%+ Crit Chance**.
- **Physical Attacks:** Standard auto-attacks and AD-scaling abilities can critically strike naturally.
- **Spell Critical Strikes:** Magical abilities **cannot** critically strike by default unless the champion is equipped with a spell-crit artifact (*Elder Focus*, *Jeweled Resurrection Stone*, *Marauder's Map*) or possesses the Assassin/Slytherin synergy.

---

### E. Magical Artifacts & Complete 36-Item Combination Grid

Defeating neutral PvE monster rounds drops **8 Basic Components**:

1. 🪄 **Wand Core:** $+20\%$ Ability Power (Amplifies spell damage & shields)
2. 🗡️ **Basilisk Fang:** $+15$ Attack Damage (Amplifies basic attacks & physical abilities)
3. 🪙 **Golden Snitch Shard:** $+20\%$ Critical Strike Chance & $+4\%$ Dodge
4. 💎 **Pensieve Crystal (Mana Gem):** $+15$ Starting Mana & $+5$ Mana per second (Continuous Mana engine)
5. 🛡️ **Dragon Scale:** $+25$ Armor (Reduces incoming physical damage)
6. 🌿 **Mandrake Leaf:** $+25$ Magic Resist (Reduces incoming magic damage)
7. 🪶 **Phoenix Feather:** $+200$ Maximum Health
8. ⚡ **Quicksilver Mercury:** $+20\%$ Attack Speed (Faster attacks & faster Mana generation)

Equipping any **2 basic components** onto a champion automatically synthesizes a completed **Artifact** (36 total combinations):

| Component A | Component B | Resulting Artifact | Stats & Unique Passive / Scaling Effect |
| :--- | :--- | :--- | :--- |
| 🪄 **Wand Core** | 🪄 **Wand Core** | **Elder Wand Supremacy** | **+50% AP, +25% Crit Chance.** Passive: Spells can critically strike for 150% damage. |
| 🪄 **Wand Core** | 🗡️ **Basilisk Fang** | **Sword of Gryffindor** | **+25 AD, +25% AP.** Passive: Basic attacks deal 20% bonus magic damage; abilities deal 20% bonus physical damage. Grants 15% Omnivamp. |
| 🪄 **Wand Core** | 🪙 **Golden Snitch Shard** | **Resurrection Stone Signet** | **+20% AP, +25% Crit Chance, +30% Crit Damage.** Passive: Critical ability casts deal 50% bonus critical damage. |
| 🪄 **Wand Core** | 💎 **Pensieve Crystal** | **Dumbledore's Deluminator** | **+25% AP, +20 Starting Mana, +5 Mana/sec.** Passive: Permanently gains +10% AP for every 20 Mana spent in combat. |
| 🪄 **Wand Core** | 🛡️ **Dragon Scale** | **Protego Shield Brooch** | **+20% AP, +30 Armor.** Passive: Combat start grants a 300 HP shield to holder and 2 adjacent allies for 8s. |
| 🪄 **Wand Core** | 🌿 **Mandrake Leaf** | **Hufflepuff's Golden Cup** | **+20% AP, +30 MR.** Passive: On ability cast, heals the 2 lowest-health allies for 300 HP. |
| 🪄 **Wand Core** | 🪶 **Phoenix Feather** | **Philosopher's Stone Fragment** | **+20% AP, +250 HP.** Passive: Holder permanently stacks +2% AP every 2 seconds in combat. |
| 🪄 **Wand Core** | ⚡ **Quicksilver** | **Rowena's Spell-Weaver Wand** | **+20% AP, +25% AS.** Passive: Basic attacks shred 10% enemy Magic Resist (up to 50%) and grant +5% AS. |
| 🗡️ **Basilisk Fang** | 🗡️ **Basilisk Fang** | **Slytherin's Poisoned Blade** | **+45 AD.** Passive: Physical damage ignores 35% enemy Armor and inflicts stacking poison dealing 150 True Damage over 3s. |
| 🗡️ **Basilisk Fang** | 🪙 **Golden Snitch Shard** | **Seeker's Quidditch Goggles** | **+20 AD, +25% Crit Chance, +40% Crit Damage.** Passive: Physical attacks and AD abilities have 100% accuracy and cannot miss. |
| 🗡️ **Basilisk Fang** | 💎 **Pensieve Crystal** | **Godric's Dueling Lance** | **+20 AD, +15 Starting Mana, +5 Mana/sec.** Passive: Basic attacks generate +5 additional Mana per strike. |
| 🗡️ **Basilisk Fang** | 🛡️ **Dragon Scale** | **Centaur's Starlight Greatbow** | **+20 AD, +30 Armor.** Passive: Basic attacks deal bonus physical damage equal to 12% of the holder's total Armor. |
| 🗡️ **Basilisk Fang** | 🌿 **Mandrake Leaf** | **Silver Dagger of the Half-Blood Prince** | **+20 AD, +30 MR.** Passive: Holder gains +25% Physical Lifesteal. At 40% HP, instantly cleanses all CC and gains 30% Attack Speed for 4s. |
| 🗡️ **Basilisk Fang** | 🪶 **Phoenix Feather** | **Grawp's Uprooted Club** | **+20 AD, +300 HP.** Passive: Basic attacks deal bonus physical damage equal to 4% of holder's maximum HP. |
| 🗡️ **Basilisk Fang** | ⚡ **Quicksilver** | **Firebolt 2000 Striker** | **+20 AD, +25% AS.** Passive: Every 3rd basic attack unleashes a piercing wind blade dealing 175% AD physical damage in a line. |
| 🪙 **Golden Snitch Shard** | 🪙 **Golden Snitch Shard** | **Marauder's Enchanted Map** | **+30% Crit Chance, +20% Crit Damage.** Passive: Critical strikes execute non-boss enemy units below 8% maximum HP. |
| 🪙 **Golden Snitch Shard** | 💎 **Pensieve Crystal** | **Hermione's Time-Turner** | **+20% Crit Chance, +15 Starting Mana, +5 Mana/sec.** Passive: Critical strikes instantly restore 10 Mana to the holder. |
| 🪙 **Golden Snitch Shard** | 🛡️ **Dragon Scale** | **Invisibility Cloak of Ignotus** | **+30 Armor, +20% Crit Chance, +15% Dodge.** Passive: Dodges the first 2 enemy abilities or attacks, becoming untargetable for 1.5s. |
| 🪙 **Golden Snitch Shard** | 🌿 **Mandrake Leaf** | **Ravenclaw's Diadem of Wit** | **+30 MR, +20% Crit Chance.** Passive: When the holder casts their ability, silences the target for 3.0s (preventing mana gain & casting). |
| 🪙 **Golden Snitch Shard** | 🪶 **Phoenix Feather** | **Fawkes' Tears Relic** | **+250 HP, +20% Crit Chance.** Passive: Upon taking lethal damage, revives the holder with 40% max HP and full Mana after a 2s stasis. |
| 🪙 **Golden Snitch Shard** | ⚡ **Quicksilver** | **Snitch-Winged Accelerators** | **+25% AS, +25% Crit Chance.** Passive: Critical strikes grant a burst of +50% movement speed and +40% Attack Speed for 2s. |
| 💎 **Pensieve Crystal** | 💎 **Pensieve Crystal** | **The Goblet of Fire** | **+30 Starting Mana, +10 Mana/sec.** Passive: After casting an ability, immediately refunds 20 Mana. |
| 💎 **Pensieve Crystal** | 🛡️ **Dragon Scale** | **Azkaban Dementor's Frost** | **+30 Armor, +15 Starting Mana, +5 Mana/sec.** Passive: Slows the attack speed of adjacent enemies by 30%. |
| 💎 **Pensieve Crystal** | 🌿 **Mandrake Leaf** | **Mandrake Restorative Draught** | **+30 MR, +15 Starting Mana, +5 Mana/sec.** Passive: At combat start, grants +20% AP and +10 Mana/sec to holder & same-row allies. |
| 💎 **Pensieve Crystal** | 🪶 **Phoenix Feather** | **Order's Phoenix Beacon** | **+250 HP, +15 Starting Mana, +5 Mana/sec.** Passive: When holder dies, heals all surviving allies for 25% max HP and grants 20 Mana. |
| 💎 **Pensieve Crystal** | ⚡ **Quicksilver** | **Storm-Charmed Wand of Grindelwald** | **+25% AS, +15 Starting Mana, +5 Mana/sec.** Passive: Every 3rd basic attack releases lightning hitting 4 foes for 150 magic dmg & shredding MR. |
| 🛡️ **Dragon Scale** | 🛡️ **Dragon Scale** | **Hogwarts Castle Bastion Armor** | **+60 Armor.** Passive: Negates critical strike bonus damage received and reflects 100 magic damage to attackers. |
| 🛡️ **Dragon Scale** | 🌿 **Mandrake Leaf** | **Aegis of the Order** | **+30 Armor, +30 MR.** Passive: At combat start, taunts adjacent enemies and grants 25% damage reduction for 6s. |
| 🛡️ **Dragon Scale** | 🪶 **Phoenix Feather** | **Gryffindor's Lion Vest** | **+300 HP, +40 Armor.** Passive: Regenerates 2% of maximum HP every second. |
| 🛡️ **Dragon Scale** | ⚡ **Quicksilver** | **Dragonhide Quidditch Armor** | **+30 Armor, +20% AS.** Passive: Taking or dealing damage grants +2 Armor and +2% AD (stacks up to 25 times; at max stacks gains +25 MR). |
| 🌿 **Mandrake Leaf** | 🌿 **Mandrake Leaf** | **Dragonhide Cloak of Dragonologists** | **+60 MR.** Passive: Takes 50% reduced magic damage from all enemy abilities and spells. |
| 🌿 **Mandrake Leaf** | 🪶 **Phoenix Feather** | **Hufflepuff's Resilient Cloak** | **+250 HP, +35 MR.** Passive: Emits a 2-hex aura reducing magic damage taken by adjacent allies by 30%. |
| 🌿 **Mandrake Leaf** | ⚡ **Quicksilver** | **Silver Quicksilver Charm** | **+30 MR, +20% AS.** Passive: Holder is immune to crowd control and stuns for the first 10 seconds of combat. |
| 🪶 **Phoenix Feather** | 🪶 **Phoenix Feather** | **Hungarian Horntail Dragon Hide** | **+800 Maximum HP.** Passive: Holder regenerates 5% missing health every second. |
| 🪶 **Phoenix Feather** | ⚡ **Quicksilver** | **Beater's Ironwood Bludger Bat** | **+250 HP, +25% AS.** Passive: Basic attacks knock back the target and deal 5% max HP bonus physical damage. |
| ⚡ **Quicksilver** | ⚡ **Quicksilver** | **Nimbus 2001 Racing Vanes** | **+50% Attack Speed.** Passive: Basic attacks permanently stack +5% Attack Speed for the rest of combat. |

---

## 3. Harry Potter Lore, Factions & Character Roster

### A. House & Faction Synergies (Origins & Classes)

```
                       FACTION & CLASS SYNERGY MATRIX
  ┌─────────────────────────────────┐     ┌─────────────────────────────────┐
  │         HOGWARTS HOUSES         │     │         COMBAT ROLES            │
  ├─────────────────────────────────┤     ├─────────────────────────────────┤
  │ 🦁 Gryffindor: Shield & Courage │     │ 🛡️ Guardian: Teamwide Armor     │
  │ 🐍 Slytherin: Crit & Lethality  │     │ ✨ Sorcerer: Spell Amplification│
  │ 🦅 Ravenclaw: Mana & Spellhaste │     │ 🎯 Sniper: Range & Attack Speed │
  │ 🦡 Hufflepuff: Team HP Regen    │     │ 🥊 Brawler: Massive Base Health │
  ├─────────────────────────────────┤     │ 🗡️ Assassin: Backline Jump & Crit│
  │         FACTION ORIGINS         │     │ 🔮 Mystic: Team Magic Resist    │
  ├─────────────────────────────────┤     │ ⚡ Duelist: Stacking Attack Speed│
  │ 🕊️ Order of the Phoenix: Resurrect    │ 📜 Professor: Global Aura Boost │
  │ 💀 Death Eater: Dark Curse & DoTs    │                                 │
  │ 🦅 Auror: Spell Silence & Lock        │                                 │
  │ 🐺 Beast / Creature: Wild Frenzy      │                                 │
  └─────────────────────────────────┘     └─────────────────────────────────┘
```

#### House Origins:
- **🦁 Gryffindor (2/4/6):** Gryffindors gain bonus Armor and Attack Damage. When an ally dies, all remaining Gryffindors gain a shield equal to 15% / 30% / 50% of their max HP.
- **🐍 Slytherin (2/4/6):** Slytherins deal bonus Critical Strike Damage and their abilities apply *Poison/Bleed* that deals 20% / 40% / 70% True Damage over 4 seconds.
- **🦅 Ravenclaw (2/4/6):** Ravenclaws generate +3 / +6 / +12 bonus Mana per basic attack, and their spells reduce enemy Magic Resist by 20%.
- **🦡 Hufflepuff (2/4/6):** All allies gain +150 / +350 / +700 maximum Health and regenerate 2% / 4% / 7% max HP every 2 seconds.

#### Allegiance Origins:
- **🕊️ Order of the Phoenix (2/4):** When Order units cast, they cleanse crowd-control from the nearest ally. At (4), the first Order unit to die is reborn with 50% HP via Fawkes' flame.
- **💀 Death Eater (2/4/6):** Death Eaters curse enemies with the *Dark Mark*. Cursed enemies deal 20% reduced damage, and when a cursed enemy dies, Death Eaters gain +15% / +30% / +60% Ability Power for the rest of the round.
- **⚡ Auror (2/4):** Aurors gain True Sight (cannot miss) and their abilities **Silence** the target for 1.5s / 3.0s, preventing Mana gain and spell casting.
- **🐺 Beast / Magical Creature (2/4):** Gain +15% / +35% stacking Attack Speed on every attack (up to 10 stacks).

---

### A. Synergies, Origins & Role Archetypes

#### ⚔️ Combat Classes (Tactical Archetypes)
- **Guardian** 🛡️: Frontline tanks granting teamwide Armor (+35 / +80).
- **Sorcerer** ✨: Magical casters empowering all allies with Ability Power (+25% / +60% / +110%).
- **Sniper** 🎯: Long-range marksmen gaining bonus Attack Speed (+25% / +60%) and extra attack range.
- **Brawler** 🥊: Melee juggernauts surging with massive maximum Health (+350 / +800).
- **Assassin** 🗡️: Infiltrators that leap into the enemy backline, gaining Crit Chance & Crit Damage (+25%/+30% and +50%/+75%).
- **Mystic** 🔮: Protective enchanters granting teamwide Magic Resist (+40 / +100).
- **Healer / Support** 💚: Restorative enchanters granting Omnivamp healing and powerful haste/shields to allies.
- **Duelist** ⚔️: Martial duelists who gain ramping Attack Speed on every basic attack (+10% / +22% per stack up to 8 stacks).
- **Trickster** 🎭: Illusions and evasion experts (+25% / +50% Dodge Chance; burns enemy Mana on dodge).
- **Shapeshifter** 🐺: Animagi who transform on first spellcast, surging with +40% / +90% Max HP and bonus AD.
- **Handler** 🐾: Beastmasters who summon an enraged magical beast companion into battle.

#### 🏰 Origins & Lore Factions
- **Gryffindor** 🦁 *(10 Champions)*: Fierce bravery granting bonus AD (+20 / +45 / +80 / +130), low-health shields, and +50% Attack Speed with CC immunity at 8 pieces (Breakpoints: 2 / 4 / 6 / 8).
- **Slytherin** 🐍 *(10 Champions)*: Ruthless ambition granting bonus Critical Damage (+20% / +45% / +80% / +130%) and executing low-health targets below 10% / 18% / 28% / 38% HP (Breakpoints: 2 / 4 / 6 / 8).
- **Ravenclaw** 🦅 *(8 Champions)*: Supreme intellect granting bonus Starting Mana (+20 / +45 / +75 / +100 full mana) and continuous passive Mana regeneration (+3 / +7 / +12 / +20 mana/sec) plus +25% AP team stacking (Breakpoints: 2 / 4 / 6 / 8).
- **Hufflepuff** 🦡 *(8 Champions)*: Loyal resilience granting teamwide damage reduction (12% / 25% / 40% / 55%), bonus Armor/MR (+20 / +45 / +60 / +100), and 5% Max HP/sec regeneration (Breakpoints: 2 / 4 / 6 / 8).
- **Order of Phoenix** 🕊️: Brotherhood passing 25% / 50% of AD, AP, and Mana to living allies upon death.
- **Death Eater** 💀: Dark Mark magic causing abilities to inflict ticking True Damage curses.
- **Ghost** 👻: Intangible Hogwarts spirits taking 25% / 45% reduced physical damage and floating through armor.
- **Magical Creature** 🦄: Wild beasts fighting with untamed ferocity, gaining Attack Speed and Omnivamp.
- **Dragon** 🐉: Mythical dragons gaining +400 Health and 25% splash damage on basic attacks.
- **Ministry of Magic** ⚖️: Legal suppression that disarms and silences the highest-cost enemy units at combat start.
- **Professor** 🎓: Hogwarts faculty inspiring adjacent students with +25 / +60 AP and +20 / +50 AD aura.
- **Magizoologist** 🧳: Masters of Fantastic Beasts empowering all creature allies with +400 HP and +30% AD.
- **House-Elf** 🧦 *(3 Champions)*: Wandless selfless magic bestowing up to 800 HP shield and +50 Starting Mana onto your strongest carries.
- **Dark Wizard** 🔮: Forbidden arts that ignite enemies for max HP burn and 50% healing reduction.
- **Beauxbatons** 🦋 *(3 Champions)*: Veela allure and charm that reduces enemy damage output by 20% / 35%.
- **Durmstrang** ⛵ *(4 Champions)*: Relentless martial discipline granting +30% / +70% Attack Speed and +25 / +60 Armor.
- **Divine Founder** 👑: Ancient founders starting combat with 100% full Mana and double primary stats.

---

### B. Full Champion Roster by Tier (Cost 1 to Cost 5)

```
========================================================================================
 TIER 1 CHAMPIONS (1 GOLD) - EARLY GAME FOUNDATIONS
========================================================================================
 • Neville Longbottom   | Gryffindor / Guardian      | "Petrificus Totalus" [AP] (2s Stun & Dmg)
 • Colin Creevey        | Gryffindor / Sorcerer      | "Flashbulb Jinx" [AP] (Blinds Target & Dmg)
 • Draco Malfoy         | Slytherin / Assassin       | "Serpensortia" [AP] (Venomous Viper Poison)
 • Vincent Crabbe       | Slytherin / Brawler        | "Bully Tackle" [AD] (Shield & Heavy Slam)
 • Gregory Goyle        | Slytherin / Guardian       | "Brute Wall Slam" [AD] (Shield & AS Slow)
 • Luna Lovegood        | Ravenclaw / Mystic         | "Spectrespecs Lumos" [AP] (AoE Dmg & MR Aura)
 • Cho Chang            | Ravenclaw / Sniper         | "Glisseo Frost Shot" [AD] (Ice Pierce & Slow)
 • Hannah Abbott        | Hufflepuff / Healer        | "Episkey Mend" [AP] (Heals Lowest HP Ally)
 • Susan Bones          | Hufflepuff / Guardian      | "Protego Shield Wall" [AP] (Team Shield)
 • Dobby the House-Elf  | House-Elf / Trickster      | "Elf Snap & Disarm" [AP] (Disarms & Blinks)
 • Winky the House-Elf  | House-Elf / Mystic         | "Butterbeer Ward" [AP] (Shield & MR Cleanse)
 • Bowtruckle           | Magical Creature / Healer  | "Camouflage & Haste" [AP] (Grants +50% AS to Ally)
 • Niffler              | Magical Creature / Trickster| "Shiny Snatch" [AD] (Steals Mana & Bites)
 • Poliakoff            | Durmstrang / Brawler       | "Northern Heavy Cleave" [AD] (AoE Frost Cleave)
 • Gabrielle Delacour   | Beauxbatons / Healer       | "Veela Blessing" [AP] (Heals 2 Allies)
 • Moaning Myrtle       | Ghost / Ravenclaw / Mystic | "Wailing Flood" [AP] (AoE Wave & AS Slow)

========================================================================================
 TIER 2 CHAMPIONS (2 GOLD) - MID-GAME CORE ENGINES
========================================================================================
 • Ron Weasley          | Gryffindor / Brawler       | "Wizard's Chess Slam" [AD] (Knight Knockup)
 • Hermione Granger     | Gryffindor / Sorcerer      | "Incendio Vortex" [AP] (2-Hex Firestorm)
 • Ginny Weasley        | Gryffindor / Sniper        | "Bat-Bogey Hex" [AP] (Flapping Bat Sickness)
 • Dean Thomas          | Gryffindor / Sniper        | "Reducto Blast" [AD] (Armor Sundering Blast)
 • Pansy Parkinson      | Slytherin / Assassin       | "Stinging Hex" [AD] (Guaranteed Crit Strike)
 • Kreacher             | House-Elf / Slytherin / Guardian| "Black Heirloom Ward" [AP] (Shield & Bite)
 • Padma Patil          | Ravenclaw / Patil Sisters / Sorcerer | "Diffindo Crescent" [AP] (MR-Shred Waves)
 • Parvati Patil        | Gryffindor / Patil Sisters / Sniper  | "Incendio Barrage" [AD] (Explosive Flaming Arrows)
 • Cedric Diggory       | Hufflepuff / Guardian      | "Triwizard Aegis Ward" [AD] (Shield Charge & Bash)
 • Pomona Sprout        | Hufflepuff / Professor / Healer| "Tentacula Root" [AP] (Root & Team Heal)
 • Nearly Headless Nick | Ghost / Gryffindor / Guardian| "Head Toss Taunt" [AP] (AoE Taunt & Shield)
 • Viktor Krum          | Durmstrang / Duelist       | "Seeker's Dive Strike" [AD] (High AS Surge)
 • Fleur Delacour       | Beauxbatons / Sorcerer     | "Veela Allure Blast" [AP] (Cone Charm Wave)
 • Firenze the Centaur  | Magical Creature / Sniper  | "Divination Star Arrow" [AD] (Piercing Arrow)

========================================================================================
 TIER 3 CHAMPIONS (3 GOLD) - SYNERGY STABILIZERS
========================================================================================
 • Harry Potter         | Gryffindor / Sorcerer      | "Expecto Patronum" [AP] (Silver Stag Knockup)
 • Fred & George        | Gryffindor / Trickster     | "Decoy Detonators" [AD] (AoE Bouncing Fireworks)
 • Sirius Black         | Order / Gryffindor / Assassin| "Padfoot Shadow Leap" [AD] (Backline Pounce)
 • Bellatrix Lestrange  | Death Eater / Dark Wizard / Slytherin| "Crucio Torment" [True] (Ticking True Dmg)
 • Horace Slughorn      | Slytherin / Professor / Mystic| "Felix Felicis Draught" [AP] (Liquid Luck Buff)
 • Filius Flitwick      | Ravenclaw / Professor / Duelist| "Wingardium Leviosa" [AP] (Lifts 2 Frontline Foes)
 • The Grey Lady        | Ghost / Ravenclaw / Mystic | "Spectral Diadem Radiance" [AP] (AoE Mana Burst)
 • Remus Lupin          | Order / Shapeshifter / Brawler| "Moony's Lycan Claw" [AD] (Frenzied Lifesteal)
 • Nymphadora Tonks     | Order / Hufflepuff / Duelist| "Metamorph Shockwave" [AP] (Team AS Wave)
 • The Fat Friar        | Ghost / Hufflepuff / Healer| "Jovial Feast Blessing" [AP] (Team Cleanse & Heal)
 • Igor Karkaroff       | Durmstrang / Dark Wizard / Sorcerer| "Curse of the Dark North" [AP] (Black Ice Chill)
 • Rubeus Hagrid        | Magical Creature / Handler | "Fang, Fetch!" [AD] (Summons Boarhound)
 • Buckbeak             | Magical Creature / Brawler | "Razor Talon Sweep" [AD] (Eagle Talon Cleave)

========================================================================================
 TIER 4 CHAMPIONS (4 GOLD) - HIGH-IMPACT CROWD CONTROL & CARRIES
========================================================================================
 • Minerva McGonagall   | Gryffindor / Professor / Shapeshifter| "Piertotum Locomotor" [AP] (Stone Stun)
 • Severus Snape        | Slytherin / Professor / Dark Wizard| "Sectumsempra" [AP] (Dark Bleed Blades)
 • Lucius Malfoy        | Slytherin / Death Eater / Ministry| "Imperio Green Beam" [AP] (Mind Controls Enemy)
 • The Bloody Baron     | Ghost / Slytherin / Assassin| "Phantom Chain Cleave" [True] (Spectral True Cleave)
 • Sybill Trelawney     | Ravenclaw / Professor / Mystic| "Grim Prophecy Orb" [AP] (Team Dodge & Dmg)
 • Newt Scamander       | Magizoologist / Hufflepuff / Handler| "Suitcase Menagerie" [AD] (Zouwu Release)
 • Alastor 'Mad-Eye'    | Order / Ministry / Guardian| "Constant Vigilance" [AP] (Shield & Reflect)
 • Gellert Grindelwald  | Dark Wizard / Durmstrang / Sorcerer| "Protego Diabolica" [AP] (Blue Fire Ring)
 • Madame Maxime        | Beauxbatons / Guardian / Brawler| "Giantess Ground Stomp" [AD] (AoE Stun)
 • Thestral             | Magical Creature / Ghost / Assassin| "Invisible Death Swoop" [AD] (Stealth Burst)

========================================================================================
 TIER 5 CHAMPIONS (5 GOLD) - GAME-WINNING LEGENDARIES & FOUNDERS
========================================================================================
 • Godric Gryffindor    | Gryffindor / Divine / Guardian| "Sword of Gryffindor" [AD] (Frontline Cleave)
 • Salazar Slytherin    | Slytherin / Dark Wizard / Divine| "Basilisk Roar & Petrify" [AP] (Mapwide Stun)
 • Rowena Ravenclaw     | Ravenclaw / Divine / Sorcerer| "Diadem of Infinite Wisdom" [AP] (Mapwide Mana)
 • Helga Hufflepuff     | Hufflepuff / Divine / Healer| "Cup of Eternal Abundance" [AP] (Full Team Heal)
 • Albus Dumbledore     | Order / Professor / Divine / Sorcerer| "Elder Wand Firestorm" [AP] (Mapwide Vortex)
 • Lord Voldemort       | Death Eater / Dark Wizard / Divine| "Avada Kedavra" [True] (Lethal Killing Curse)
 • Fawkes the Phoenix   | Divine / Magical Creature / Healer| "Phoenix Rebirth & Tears" [AP] (Team Heal/Revive)
 • Hungarian Horntail   | Dragon / Magical Creature / Brawler| "Infernal Dragonfire" [AP] (Cone Incineration)
========================================================================================
```

---

## 4. Deep Strategic Theories & Player Psychology

### A. Economic Strategy & The Three Playstyles
1. **The Slow-Roll Theory (3-Star Low-Cost Supremacy):**
   - Accumulate 50 gold at Level 5 or 6.
   - Only spend excess gold above 50 on shop rerolls.
   - Objective: Upgrade *Neville*, *Ron*, and *Harry* to 3-Stars. Their raw HP and base damage scaling out-stat higher tier units in the mid-game.
2. **Standard Leveling Tempo (Consistent Top 4 Placement):**
   - Level to 4 at Stage 2-1, Level 6 at Stage 3-2, Level 7 at Stage 4-1, Level 8 at Stage 5-1.
   - Preserves high win-rate streaks and hits reliable 2-star 4-cost carries (*McGonagall*, *Mad-Eye Moody*).
3. **Fast-8 / Fast-9 High-Roll Greed:**
   - Sacrifices early-game health to accumulate 50+ gold rapidly.
   - Reaches Level 8 or 9 with 40+ gold to roll down for 5-cost legendaries (*Dumbledore*, *Voldemort*, *Fawkes*).

---

### B. Board Positioning & Aggro Theory
- **The Box (Anti-Assassin Clump):** When playing against *Bellatrix* or *Draco*, surround *Hermione* or *Cho Chang* in a tight 3x3 square in the bottom corner so assassins are forced to target *Ron* and *Hagrid*.
- **The Split Deployment (Anti-AoE):** When facing *Hermione* or *Hungarian Horntail*, split your army across the far-left and far-right flanks to ensure area-of-effect spells only hit one or two units.
- **The Sacrificial Pawn:** Placing a low-value 1-star tank forward to absorb the enemy's first crowd-control spell allows your primary carry to cast without disruption.

---

### C. Game Theory & The Shared Champion Pool
Because all 8 players draw from the same finite pool:
- **Scouting is Mandatory:** Checking other players' boards prevents you from competing for the same 4-cost champions.
- **Hate-Drafting:** In 1v1 end-game duels, buying up the 3rd copy of your opponent's *Lord Voldemort* prevents them from completing their 2-star upgrade, effectively locking their power ceiling.
- **The Pivot:** If 3 players are building *Gryffindor*, pivoting into an uncontested *Slytherin / Death Eater* build gives you uncontested access to all the cards in the pool.

---

## 5. Technical Architecture & Web Stack

### A. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐ │
│  │      UI Overlay (React 19)   │  │ Render Engine (PixiJS 8) │ │
│  │ Shop, HP, Bench, HUD, Items  │  │ Arena, Sprites, VFX, FCT │ │
│  └──────────────┬───────────────┘  └───────────┬──────────────┘ │
│                 └──────────────┬───────────────┘                │
│                                │ WebSocket Messages             │
└────────────────────────────────┼────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│                         Node.js Server                          │
│  ┌─────────────────────────────▼─────────────────────────────┐  │
│  │                  Room Manager (Colyseus / WS)             │  │
│  │      State Sync: Gold, Shop Pools, Health, Boards, Items  │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
│  ┌─────────────────────────────▼─────────────────────────────┐  │
│  │              Deterministic Combat Simulator               │  │
│  │   Runs at 20 ticks/sec, calculates movement, ranges,      │  │
│  │   damage mitigation, status effects & combat logs         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### B. Recommended Web Stack
- **Frontend Rendering Engine:** **PixiJS 8 (2D WebGL)**. Delivers 60 FPS hardware-accelerated sprite rendering, glowing spell particles, smooth projectile paths, and responsive tactical board rendering.
- **Frontend UI Framework:** **React 19 + Tailwind CSS + Lucide Icons**. Overlays directly on top of the WebGL canvas to manage HUD, shop tray, player health meters, item drag-and-drop tooltips, and damage charts.
- **Backend Multiplayer Engine:** **Node.js + WebSockets / Colyseus**. Manages 8-player room matchmaking, synchronized phase timers, state replication, and bot AI controllers.
- **Persistence & Matchmaking:** **PostgreSQL / MongoDB** for player stats, match history, and MMR ranks; **Redis** for active lobby state.

---

### C. Authoritative Server & Deterministic Simulation Flow
To eliminate cheating and guarantee zero client desyncs:
1. **Snapshot Submission:** At the end of the 25-second Planning Phase, each player's client sends their board placement array to the server.
2. **Headless Execution:** The server executes the combat simulation at **20 ticks per second**:
   - $A^*$ grid pathfinding and line-of-sight checks.
   - Attack range validation and wind-up frames.
   - Physical mitigation formula: $\text{Dmg Taken} = \text{Phys Dmg} \times \left(\frac{100}{100 + \text{Armor}}\right)$.
   - Magical mitigation formula: $\text{Dmg Taken} = \text{Mag Dmg} \times \left(\frac{100}{100 + \text{MR}}\right)$.
   - Event logging (e.g. `{ tick: 42, type: "SPELL_CAST", casterId: "hermione_1", targetHex: [3, 2], dmg: 450 }`).
3. **Client Playback:** The server sends the complete batch of combat event logs to paired clients. The PixiJS render engine interpolates these events into fluid animations, floating combat text, and particle effects.

---

### D. Production TypeScript Data Schemas

#### 1. Item Data Model
```typescript
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
  abilityPower?: number;
  attackSpeed?: number;
  startingMana?: number;
  manaPerSecond?: number;
  critChance?: number;
  critDamage?: number;
  dodgeChance?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  isArtifact: boolean;
  recipe?: [BaseItemId, BaseItemId];
  description: string;
  icon: string;
  stats: ItemStats;
  passiveEffect?: {
    type: string;
    value: number;
    description: string;
  };
}
```

#### 2. Unit Data Model
```typescript
export interface UnitStats {
  hp: [number, number, number];           // [1-star, 2-star, 3-star]
  armor: number;
  magicResist: number;
  attackDamage: [number, number, number]; // [1-star, 2-star, 3-star]
  attackSpeed: number;                    // Attacks per second
  range: number;                          // Hex/grid distance
  startingMana: number;
  maxMana: number;
  critChance: number;                     // Base 0.25 (25%)
  critDamage: number;                     // Base 1.50 (150%)
}

export interface UnitAbility {
  name: string;
  description: string;
  manaCost: number;
  scalingType: 'AP' | 'AD' | 'HYBRID' | 'HP';
  damageType: 'physical' | 'magic' | 'true';
  damageValues: [number, number, number];
  adRatio?: number;                       // e.g. 1.5 for 150% AD
  apRatio?: number;                       // e.g. 1.0 for 100% AP
  targetType: 'single' | 'aoe' | 'self' | 'lowest_hp';
  radius?: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  cost: 1 | 2 | 3 | 4 | 5;
  origins: string[];                      // e.g. ['Gryffindor', 'Order']
  classes: string[];                      // e.g. ['Sorcerer', 'Duelist']
  color: string;
  stats: UnitStats;
  ability: UnitAbility;
}
```

#### 3. Shared Unit Pool Definition
```typescript
export class UnitPool {
  private poolCounts: Record<number, number> = {
    1: 29, // 29 copies of each 1-cost unit
    2: 22,
    3: 18,
    4: 12,
    5: 10,
  };

  private pool: Map<string, number> = new Map();

  public drawShop(playerLevel: number, count: number = 5): string[] {
    // 1. Determine cost tier based on player level odds table
    // 2. Randomly select available units from remaining pool
    // 3. Decrement pool counts and return 5 unit IDs
    return [];
  }

  public returnToPool(unitId: string, starLevel: number): void {
    const unitCount = Math.pow(3, starLevel - 1);
    const current = this.pool.get(unitId) || 0;
    this.pool.set(unitId, current + unitCount);
  }
}
```

---

## 6. Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Combat Engine (Standalone Single-Player) | Weeks 1-3     │
├────────────────────────────────────────────────────────────────────────┤
│ • Build client-side TS prototype with 8x4 tactical grid                │
│ • Implement unit state machines (Idle, Moving, Attacking, Casting)     │
│ • Implement pathfinding, AD/AP damage formulas & health/mana gauges    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: Economy, Shop & Synergy Systems               | Weeks 4-5     │
├────────────────────────────────────────────────────────────────────────┤
│ • Implement shared unit pool generator & player level shop odds tables │
│ • Build 3x star-tier upgrade algorithm (1★ -> 2★ -> 3★)                │
│ • Implement compound interest calculations, bench inventory & traits   │
│ • Implement 36-item combination matrix and artifact equip system      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Multiplayer Networking & Server Authority     | Weeks 6-8     │
├────────────────────────────────────────────────────────────────────────┤
│ • Port combat simulator to headless Node.js 20-tick/sec loop           │
│ • Implement 8-player WebSocket lobby management & synchronized timers  │
│ • Build combat snapshot submission & client event playback stream      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Phase 4: UI/UX Polish, VFX & Sound Integration         | Weeks 9-10    │
├────────────────────────────────────────────────────────────────────────┤
│ • Layer Tailwind/React HUD over PixiJS 2D WebGL canvas                 │
│ • Add spell VFX, particle trails, floating combat text & sound effects │
│ • Implement post-game damage meters and match recap screens            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Future Expansions & Thematic Ideas

### A. The Triwizard Tournament Global Events
At Stage 3-5 and Stage 5-5, normal combat pauses for a special global tournament trial:
- **Trial 1: The Dragon's Nest:** All 8 players face a neutral Dragon boss simultaneously. The fastest sorcerer to defeat it drafts a completed Artifact from the Dragon's hoard.
- **Trial 2: The Black Lake:** Battlefield underwater modifier: movement speed is reduced by 30%, but frost and water spells gain +50% Area of Effect.
- **Trial 3: The Enchanted Maze:** Maze walls spawn across the tactical board, creating chokepoints and rewarding clever positioning.

### B. Horcruxes & Forbidden Dark Arts (Risk / Reward)
A high-stakes mechanic for Death Eater or Dark Arts builds:
- Players can sacrifice 20 HP of their own avatar to forge a **Horcrux Relic**.
- The relic grants their team +40% Ability Power and revives the first unit that dies in combat with full Mana.
- *The Risk:* If the player loses any combat round while holding a Horcrux, they take double avatar damage.

### C. Patronus Familiar Comeback Mechanics
- When a player drops below **25 HP** for the first time, their avatar casts *Expecto Patronum!*
- A glowing silvery Patronus familiar (Stag, Phoenix, Otter, or Wolf) joins the bench. When fielded, it provides a teamwide immunity shield for the first 3 seconds of every combat.

### D. Ollivanders Wand Choosing Ceremony (Opening Perks)
At Stage 1-1, each player chooses 1 of 3 custom wands:
- **Phoenix Feather Wand:** Once per match, survive lethal avatar damage with 1 HP and gain 10 gold.
- **Dragon Heartstring Wand:** Your units gain +20% Critical Strike Chance and +30% Critical Strike Damage.
- **Unicorn Hair Wand:** Your team regenerates 5% of max health at the start of every combat round.

### E. The Hogwarts House Cup
- Players select their House banner before the game begins.
- Win streaks award **House Points**. The House with the most points at the end of each Stage triggers a House celebration that grants a free bonus shop refresh each round.

---

## 8. Database Architecture & Technical Stack Analysis: "Do We Need a DB?"

### A. Current Architecture: Zero-Latency In-Memory Match Server
For real-time 8-player auto-battlers like TFT / Auto Chess, the **live game state during an active match is entirely in-memory on the authoritative Node.js server**:
- **Why In-Memory?**
  1. **Tick Rate & Speed:** Combat simulations and planning state ticks run at 20–60 updates/sec. Querying or writing to a disk/network database on every state mutation would introduce intolerable lag and latency spikes.
  2. **Transient State:** Shop decks, bench slots, unit positions, and health pools only exist for the duration of the 20-30 minute match. Once the match finishes, this memory is freed.
  3. **Authoritative Consistency:** The server holds the canonical `AutoBattlerRoom` state in RAM and pushes WebSockets snapshots down to clients.

### B. When Is a Database Needed?
A persistent database (e.g. **PostgreSQL**, **SQLite**, or **MongoDB** with **Redis** for matchmaking) is only required if/when you want **cross-session persistence**:

```
┌────────────────────────────────────────────────────────┐
│               WHEN A DATABASE IS NEEDED                │
├────────────────────────────────────────────────────────┤
│ 1. User Accounts & Authentication (Auth0 / JWT)        │
│ 2. Ranked MMR / Elo Rating & Global Leaderboards       │
│ 3. Match History & Detailed Post-Game Damage Recaps    │
│ 4. Player Progression (Account Level, Battle Passes)   │
│ 5. Cosmetic Collections (Wand skins, Arenas, Avatars)  │
│ 6. Cross-Server Matchmaking Queue & Lobby Routing      │
└────────────────────────────────────────────────────────┘
```

**Recommendation:** For single-room gameplay and local/LAN play, an in-memory server is 100% sufficient and optimal. When ready for persistent user accounts and global match history, adding a lightweight SQLite/PostgreSQL store with Prisma ORM is seamless.

---

## 9. Player Controls & Keyboard Shortcuts

To ensure maximum APM and smooth competitive play, standard auto-battler hotkeys are integrated:

| Shortcut | Action | Description |
| :---: | :--- | :--- |
| **`F`** | **Buy XP** | Spend 4 Gold to gain +4 XP towards the next level (up to Level 10). |
| **`D`** | **Reroll Shop** | Spend 2 Gold to refresh the 5 champion cards in the shop. |
| **`E`** | **Quick Sell** | Sells the hovered or selected unit on the board or bench for gold. |
| **`ESC`** | **Return / Close** | Exits scouting mode to return to your board, closes the Recipe Book, or dismisses unit inspection. |
| **`Left Click` (Player)** | **Scout Player** | Clicks any player in the right sidebar to inspect their live board, synergies, interest, and items. |
| **`Right Click` / Click Unit** | **Inspect Stats** | Opens the comprehensive character details card (stats, scalings, spells) in the top-right corner. |

---

*Authored for the Grand Wizard's Duel Tactical Auto-Battler Project.*
