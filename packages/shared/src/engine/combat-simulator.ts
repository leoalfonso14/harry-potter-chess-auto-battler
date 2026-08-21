import {
  CombatEvent,
  CombatResult,
  CombatTeam,
  CombatUnit,
  UnitCombatSummary,
  StatusEffect,
  StatusEffectType,
} from '../types/combat.js';
import { BoardUnit, CombatRole, GridPosition } from '../types/unit.js';
import { UNITS } from '../data/units.js';
import { ALL_ITEMS } from '../data/items.js';
import { TRAITS } from '../data/synergies.js';
import { ActiveTraitInfo } from '../types/synergy.js';
import { getHexDistance, getHexNeighbors } from '../utils/hex.js';

export const TICK_RATE = 20; // 20 ticks per second (50ms per tick)
export const MAX_COMBAT_TICKS = 30 * TICK_RATE; // 30 seconds = 600 ticks

export class CombatSimulator {
  private homePlayerId: string;
  private awayPlayerId: string;
  private stage: number;
  private units: CombatUnit[] = [];
  private events: CombatEvent[] = [];
  private currentTick = 0;
  private homeTraits: ActiveTraitInfo[] = [];
  private awayTraits: ActiveTraitInfo[] = [];

  constructor(
    homePlayerId: string,
    awayPlayerId: string,
    homeUnits: BoardUnit[],
    awayUnits: BoardUnit[],
    homeTraits: ActiveTraitInfo[],
    awayTraits: ActiveTraitInfo[],
    stage: number = 1
  ) {
    this.homePlayerId = homePlayerId;
    this.awayPlayerId = awayPlayerId;
    this.stage = stage;
    this.homeTraits = homeTraits;
    this.awayTraits = awayTraits;

    this.initializeTeam(homePlayerId, 'home', homeUnits, homeTraits, false);
    this.initializeTeam(awayPlayerId, 'away', awayUnits, awayTraits, true);
  }

  private initializeTeam(
    ownerId: string,
    team: CombatTeam,
    boardUnits: BoardUnit[],
    traits: ActiveTraitInfo[],
    isAway: boolean
  ): void {
    for (const bu of boardUnits) {
      const def = UNITS[bu.unitId];
      if (!def) continue;

      const starIdx = bu.starLevel - 1;
      let hp = def.stats.hp[starIdx];
      let armor = def.stats.armor;
      let magicResist = def.stats.magicResist;
      let attackDamage = def.stats.attackDamage[starIdx];
      let attackSpeed = def.stats.attackSpeed;
      let range = def.stats.range;
      let startingMana = def.stats.startingMana;
      const maxMana = def.stats.maxMana;
      let abilityPower = 1.0;
      let critChance = 0.15;
      let critMultiplier = 1.5;
      
      // Role-based baseline mana per second
      // Casters possess baseline passive mana regeneration (+3 mana/sec)
      let manaPerSec = def.combatRole === 'Caster' ? 3 : 0;

      // Apply Items
      for (const itemId of bu.items) {
        const itm = ALL_ITEMS[itemId];
        if (!itm) continue;
        if (itm.stats.hp) hp += itm.stats.hp;
        if (itm.stats.armor) armor += itm.stats.armor;
        if (itm.stats.magicResist) magicResist += itm.stats.magicResist;
        if (itm.stats.attackDamage) attackDamage += itm.stats.attackDamage;
        if (itm.stats.attackSpeed) attackSpeed *= 1 + itm.stats.attackSpeed;
        if (itm.stats.abilityPower) abilityPower += itm.stats.abilityPower;
        if (itm.stats.startingMana) startingMana += itm.stats.startingMana;
        if (itm.stats.manaPerSecond) manaPerSec += itm.stats.manaPerSecond;
        if (itm.stats.range) range += itm.stats.range;
        if (itm.stats.critChance) critChance += itm.stats.critChance;
        if (itm.stats.critDamage) critMultiplier += itm.stats.critDamage;
      }

      // Apply Trait synergies
      for (const t of traits) {
        if (t.activeTier <= 0) continue;
        const traitDef = TRAITS[t.traitId];
        if (!traitDef) continue;
        const bp = traitDef.breakpoints[t.activeTier - 1];
        if (!bp) continue;

        // Global ally bonuses
        if (bp.bonus.armor) armor += bp.bonus.armor;
        if (bp.bonus.magicResist) magicResist += bp.bonus.magicResist;
        if (bp.bonus.abilityPower) abilityPower += bp.bonus.abilityPower;

        // Class/Origin specific bonuses
        const isMember =
          def.origins.includes(t.name as any) || def.classes.includes(t.name as any);

        if (isMember) {
          if (bp.bonus.health) hp += bp.bonus.health;
          if (bp.bonus.attackDamage) attackDamage += bp.bonus.attackDamage;
          if (bp.bonus.attackSpeed) attackSpeed *= 1 + bp.bonus.attackSpeed;
          if (bp.bonus.critChance) critChance += bp.bonus.critChance;
          if (bp.bonus.critDamage) critMultiplier += bp.bonus.critDamage;
          if (bp.bonus.startingMana) startingMana += bp.bonus.startingMana;
          if (bp.bonus.manaStartBonus) startingMana += bp.bonus.manaStartBonus;
          if (t.traitId === 'Sniper') {
            range += t.activeTier >= 2 ? 2 : 1;
          }
        }
      }

      // Grid position: Home team starts on player side (rows 4-7: y = 7 - bu.position.y), Away team on enemy side (rows 0-3: y = bu.position.y, mirrored x: 7 - bu.position.x)
      const initialPos: GridPosition = isAway
        ? { x: 7 - bu.position.x, y: bu.position.y }
        : { x: bu.position.x, y: 7 - bu.position.y };

      const combatUnit: CombatUnit = {
        id: `${team}_${bu.id}_${Math.random().toString(36).substring(2, 6)}`,
        ownerId,
        team,
        unitDefId: bu.unitId,
        name: def.name,
        starLevel: bu.starLevel,
        position: initialPos,
        currentHp: hp,
        maxHp: hp,
        currentMana: Math.min(startingMana, maxMana),
        maxMana,
        baseArmor: armor,
        baseMagicResist: magicResist,
        armor,
        magicResist,
        attackDamage,
        attackSpeed,
        range,
        abilityPower,
        critChance,
        critMultiplier,
        state: 'IDLE',
        targetId: null,
        attackCooldown: Math.floor(Math.random() * 5), // staggered start
        castDuration: 0,
        items: [...bu.items],
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalHealing: 0,
        shield: 0,
        manaPerSec,
        statusEffects: [],
      };

      this.units.push(combatUnit);
    }
  }

  public simulate(): CombatResult {
    // Tick 0: Spawn events & Infiltrator / Assassin leap
    for (const u of this.units) {
      const def = UNITS[u.unitDefId];
      if (def?.classes.includes('Infiltrator') || def?.combatRole === 'Assassin') {
        // Infiltrators jump to backline at tick 0
        const targetRow = u.team === 'home' ? 0 : 7;
        const freeTile = this.findNearestFreeTile({ x: u.position.x, y: targetRow });
        if (freeTile) {
          u.position = freeTile;
        }
      }

      this.events.push({
        tick: 0,
        type: 'SPAWN',
        sourceId: u.id,
        unitDefId: u.unitDefId,
        starLevel: u.starLevel,
        items: [...u.items],
        toPos: { ...u.position },
        value: u.currentHp,
        remainingHp: u.currentHp,
        remainingMana: u.currentMana,
      });
    }

    // Malfoy (2+) Bribe: Inflicts all enemy units with smSunder & smShred for 8s at combat start
    if (this.homeTraits.some((t) => t.traitId === 'Malfoy' && t.activeTier >= 1)) {
      for (const u of this.units.filter((u) => u.team === 'away')) {
        this.applyStatusEffect(u, 'smSunder', 8, 0.20);
        this.applyStatusEffect(u, 'smShred', 8, 0.20);
      }
    }
    if (this.awayTraits.some((t) => t.traitId === 'Malfoy' && t.activeTier >= 1)) {
      for (const u of this.units.filter((u) => u.team === 'home')) {
        this.applyStatusEffect(u, 'smSunder', 8, 0.20);
        this.applyStatusEffect(u, 'smShred', 8, 0.20);
      }
    }

    while (this.currentTick < MAX_COMBAT_TICKS) {
      this.currentTick++;

      const homeAlive = this.units.filter((u) => u.team === 'home' && u.state !== 'DEAD');
      const awayAlive = this.units.filter((u) => u.team === 'away' && u.state !== 'DEAD');

      if (homeAlive.length === 0 || awayAlive.length === 0) {
        break;
      }

      this.stepTick();
    }

    return this.buildResult();
  }

  private stepTick(): void {
    // Sort units deterministically by ID
    const activeUnits = this.units
      .filter((u) => u.state !== 'DEAD')
      .sort((a, b) => a.id.localeCompare(b.id));

    for (const unit of activeUnits) {
      if (unit.state === 'DEAD') continue;

      // Decrement status effects and update effective armor/magic resist if any expired
      if (unit.statusEffects && unit.statusEffects.length > 0) {
        let effectsChanged = false;
        for (let i = unit.statusEffects.length - 1; i >= 0; i--) {
          unit.statusEffects[i].durationTicks--;
          if (unit.statusEffects[i].durationTicks <= 0) {
            unit.statusEffects.splice(i, 1);
            effectsChanged = true;
          }
        }
        if (effectsChanged) {
          this.updateEffectiveStats(unit);
        }
      }

      // Decrement cast duration
      if (unit.state === 'CASTING') {
        unit.castDuration--;
        if (unit.castDuration <= 0) {
          unit.state = 'IDLE';
          this.executeAbility(unit);
        }
        continue;
      }

      // Decrement attack cooldown
      if (unit.attackCooldown > 0) {
        unit.attackCooldown--;
      }

      // Periodic item passives (every 1 second = 20 ticks)
      if (this.currentTick % TICK_RATE === 0) {
        this.processItemTick(unit);
      }

      // Mana check: Cast ability when at 100% mana
      if (unit.currentMana >= unit.maxMana && unit.state === 'IDLE') {
        unit.state = 'CASTING';
        unit.castDuration = Math.round(0.4 * TICK_RATE); // 0.4s cast time (8 ticks)
        unit.currentMana = 0;

        let currentTarget = this.getUnitById(unit.targetId);
        if (!currentTarget || currentTarget.state === 'DEAD') {
          currentTarget = this.findBestTarget(unit);
          unit.targetId = currentTarget ? currentTarget.id : null;
        }

        const def = UNITS[unit.unitDefId];
        this.events.push({
          tick: this.currentTick,
          type: 'SPELL_CAST',
          sourceId: unit.id,
          targetId: currentTarget ? currentTarget.id : undefined,
          abilityName: def?.ability.name || 'Ability',
          remainingMana: 0,
        });
        continue;
      }

      // Find or validate target
      let target = this.getUnitById(unit.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(unit);
        unit.targetId = target ? target.id : null;
      }

      if (!target) continue;

      const dist = getHexDistance(unit.position, target.position);

      if (dist <= unit.range) {
        // In range: Attack target
        if (unit.attackCooldown <= 0 && unit.state === 'IDLE') {
          this.executeBasicAttack(unit, target);
        }
      } else {
        // Out of range: Move towards target
        if (unit.state === 'IDLE') {
          this.moveUnitTowards(unit, target.position);
        }
      }
    }
  }

  private processItemTick(unit: CombatUnit): void {
    // 1. Passive Mana Generation (Caster baseline + Mana Gem/artifacts)
    if (unit.manaPerSec && unit.manaPerSec > 0 && unit.state !== 'DEAD' && unit.state !== 'CASTING') {
      unit.currentMana = Math.min(unit.maxMana, unit.currentMana + unit.manaPerSec);
    }

    // 2. Gryffindor Vest / Warmog's Heart / HP regen items
    for (const itmId of unit.items) {
      const itm = ALL_ITEMS[itmId];
      if (itm?.passiveEffect?.type === 'HEALTH_REGEN') {
        const healAmt = Math.round(unit.maxHp * itm.passiveEffect.value);
        if (unit.currentHp < unit.maxHp) {
          unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healAmt);
          unit.totalHealing += healAmt;
          this.events.push({
            tick: this.currentTick,
            type: 'HEAL',
            sourceId: unit.id,
            targetId: unit.id,
            value: healAmt,
            remainingHp: unit.currentHp,
          });
        }
      }
    }
  }

  private executeBasicAttack(attacker: CombatUnit, target: CombatUnit): void {
    const attackerDef = UNITS[attacker.unitDefId];
    const isCrit = Math.random() < attacker.critChance;
    let rawDmg = isCrit
      ? attacker.attackDamage * attacker.critMultiplier
      : attacker.attackDamage;

    // Sniper class damage amplification: +3% damage amp per hex tile
    if (attackerDef?.classes.includes('Sniper')) {
      const hexDist = getHexDistance(attacker.position, target.position);
      const ampMultiplier = 1 + hexDist * 0.03;
      rawDmg *= ampMultiplier;
    }

    // Armor damage reduction formula: Damage * 100 / (100 + Armor)
    let effectiveArmor = Math.max(0, target.armor);
    if (attacker.items.includes('slytherin_blade')) {
      effectiveArmor = Math.round(effectiveArmor * 0.65); // 35% armor pen
    }
    const mitigation = 100 / (100 + effectiveArmor);
    const finalDamage = Math.max(1, Math.round(rawDmg * mitigation));

    this.events.push({
      tick: this.currentTick,
      type: 'ATTACK_START',
      sourceId: attacker.id,
      targetId: target.id,
    });

    // Innate Role Mana Gain on basic attack:
    // - Tanks gain +5 mana per attack
    // - Fighters, Casters, Marksmen, Assassins gain +10 mana per attack
    let manaGain = attackerDef?.combatRole === 'Tank' ? 5 : 10;
    if (attacker.items.includes('godric_lance')) {
      manaGain += 5;
    }
    if (isCrit && attacker.items.includes('time_turner')) {
      manaGain += 10;
    }
    attacker.currentMana = Math.min(attacker.maxMana, attacker.currentMana + manaGain);

    // Apply damage
    this.applyDamage(attacker, target, finalDamage, 'physical', isCrit);

    // Inherent Fighter 10% Omnivamp (heals for 10% of damage dealt)
    if (attackerDef?.combatRole === 'Fighter') {
      const fighterHeal = Math.round(finalDamage * 0.1);
      if (fighterHeal > 0 && attacker.currentHp < attacker.maxHp) {
        attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + fighterHeal);
        attacker.totalHealing += fighterHeal;
      }
    }

    // Reset attack cooldown based on attack speed (attacks per second)
    const cooldownTicks = Math.max(4, Math.round(TICK_RATE / Math.max(0.2, attacker.attackSpeed)));
    attacker.attackCooldown = cooldownTicks;
  }

  private executeAbility(caster: CombatUnit): void {
    const def = UNITS[caster.unitDefId];
    if (!def) return;

    const starIdx = caster.starLevel - 1;
    const baseVal = def.ability.damageValues[starIdx];
    const scaledVal = Math.round(baseVal * caster.abilityPower);

    // Goblet of Fire mana refund
    if (caster.items.includes('goblet_of_fire')) {
      caster.currentMana = Math.min(caster.maxMana, caster.currentMana + 20);
    }

    // Hufflepuff's Golden Cup cast heal
    if (caster.items.includes('hufflepuff_cup')) {
      const allies = this.units.filter((u) => u.team === caster.team && u.state !== 'DEAD');
      allies.sort((a, b) => a.currentHp - b.currentHp);
      for (const lowAlly of allies.slice(0, 2)) {
        lowAlly.currentHp = Math.min(lowAlly.maxHp, lowAlly.currentHp + 300);
        caster.totalHealing += 300;
        this.events.push({
          tick: this.currentTick,
          type: 'HEAL',
          sourceId: caster.id,
          targetId: lowAlly.id,
          value: 300,
          remainingHp: lowAlly.currentHp,
        });
      }
    }

    if (def.ability.targetType === 'lowest_hp' || def.ability.targetType === 'ally' || def.ability.targetType === 'allies') {
      // Friendly heal / buff
      const allies = this.units.filter((u) => u.team === caster.team && u.state !== 'DEAD');
      allies.sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);
      const targetAlly = allies[0] || caster;

      targetAlly.currentHp = Math.min(targetAlly.maxHp, targetAlly.currentHp + scaledVal);
      caster.totalHealing += scaledVal;

      this.events.push({
        tick: this.currentTick,
        type: 'HEAL',
        sourceId: caster.id,
        targetId: targetAlly.id,
        value: scaledVal,
        abilityName: def.ability.name,
        remainingHp: targetAlly.currentHp,
      });
      return;
    }

    if (def.ability.targetType === 'self') {
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + scaledVal);
      caster.totalHealing += scaledVal;

      this.events.push({
        tick: this.currentTick,
        type: 'HEAL',
        sourceId: caster.id,
        targetId: caster.id,
        value: scaledVal,
        abilityName: def.ability.name,
        remainingHp: caster.currentHp,
      });
      return;
    }

    if (def.ability.targetType === 'aoeAll' || def.ability.targetType === 'aoe') {
      // Area of Effect - Full damage to all enemies hit within radius of the target
      let target = this.getUnitById(caster.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(caster);
      }
      const targetCenter = target ? target.position : caster.position;
      const enemies = this.units.filter((u) => u.team !== caster.team && u.state !== 'DEAD');
      const radius = def.ability.radius || 2;

      for (const enemy of enemies) {
        const dist = getHexDistance(enemy.position, targetCenter);
        if (dist <= radius) {
          this.dealAbilityDamage(caster, enemy, scaledVal, def.ability.damageType);
        }
      }
    } else if (def.ability.targetType === 'aoeSplit') {
      // Area of Effect - Splits total damage evenly among all enemies hit around target
      let target = this.getUnitById(caster.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(caster);
      }
      const targetCenter = target ? target.position : caster.position;
      const enemies = this.units.filter((u) => u.team !== caster.team && u.state !== 'DEAD');
      const radius = def.ability.radius || 2;
      const hitEnemies = enemies.filter((e) => getHexDistance(e.position, targetCenter) <= radius);

      if (hitEnemies.length > 0) {
        const splitDamage = Math.max(1, Math.round(scaledVal / hitEnemies.length));
        for (const enemy of hitEnemies) {
          this.dealAbilityDamage(caster, enemy, splitDamage, def.ability.damageType);
        }
      }
    } else {
      // Single target
      let target = this.getUnitById(caster.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(caster);
      }
      if (target) {
        this.dealAbilityDamage(caster, target, scaledVal, def.ability.damageType);
      }
    }

    // Specific Unit Ability Secondary Effects & Real-Time Stat Modifiers
    if (caster.unitDefId === 'poliakoff') {
      // Northern Heavy Cleave: permanently gains +20 Armor on cast
      caster.baseArmor += 20;
      this.updateEffectiveStats(caster);
    } else if (caster.unitDefId === 'vincent_crabbe') {
      // Heavy Smash: heals for 200 HP on cast
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + 200);
      caster.totalHealing += 200;
    } else if (caster.unitDefId === 'gregory_goyle') {
      // Bulwark Slam: gains +15 Armor on cast
      caster.baseArmor += 15;
      this.updateEffectiveStats(caster);
    } else if (caster.unitDefId === 'moaning_myrtle') {
      // Wailing Flood: slows attack speed of all enemies within 2-hex flood radius of her TARGET by 35%
      let target = this.getUnitById(caster.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(caster);
      }
      const targetCenter = target ? target.position : caster.position;
      const enemies = this.units.filter((u) => u.team !== caster.team && u.state !== 'DEAD');
      const radius = def.ability.radius || 2;
      for (const enemy of enemies) {
        if (getHexDistance(enemy.position, targetCenter) <= radius) {
          enemy.attackSpeed = Math.max(0.2, Math.round(enemy.attackSpeed * 0.65 * 100) / 100);
        }
      }
    } else if (caster.unitDefId === 'viktor_krum') {
      // Quidditch Dive: gains +30% Attack Speed for combat
      caster.attackSpeed = Math.round(caster.attackSpeed * 1.3 * 100) / 100;
    } else if (caster.unitDefId === 'nymphadora_tonks') {
      // Metamorph Surge: stacks +35% Attack Speed on every cast
      caster.attackSpeed = Math.round(caster.attackSpeed * 1.35 * 100) / 100;
    } else if (caster.unitDefId === 'madeye_moody') {
      // Constant Vigilance: gains +25 Armor and +25 MR
      caster.baseArmor += 25;
      caster.baseMagicResist += 25;
      this.updateEffectiveStats(caster);
    } else if (caster.unitDefId === 'cedric_diggory') {
      // Hufflepuff Valour: grants 250 shield to self and closest ally
      caster.shield += 250;
      const allies = this.units.filter((u) => u.team === caster.team && u.state !== 'DEAD' && u.id !== caster.id);
      if (allies.length > 0) {
        allies.sort((a, b) => getHexDistance(a.position, caster.position) - getHexDistance(b.position, caster.position));
        allies[0].shield += 250;
      }
    } else if (caster.unitDefId === 'molly_weasley') {
      // Maternal Reductor Blast: grants 450 HP shield to lowest HP ally
      const lowestAlly = this.units
        .filter((u) => u.team === caster.team && u.state !== 'DEAD')
        .sort((a, b) => a.currentHp - b.currentHp)[0];
      if (lowestAlly) {
        lowestAlly.shield += 450;
        this.events.push({
          tick: this.currentTick,
          type: 'SHIELD',
          sourceId: caster.id,
          targetId: lowestAlly.id,
          value: 450,
          remainingHp: lowestAlly.currentHp,
        });
      }
    } else if (caster.unitDefId === 'narcissa_malfoy') {
      // Unbreakable Maternal Aegis: grants 400 shield to closest ally & charms farthest enemy for 2.0s
      const closestAlly = this.units
        .filter((u) => u.team === caster.team && u.state !== 'DEAD' && u.id !== caster.id)
        .sort((a, b) => getHexDistance(a.position, caster.position) - getHexDistance(b.position, caster.position))[0];
      if (closestAlly) {
        closestAlly.shield += 400;
      }
      const farthestEnemy = this.units
        .filter((u) => u.team !== caster.team && u.state !== 'DEAD')
        .sort((a, b) => getHexDistance(b.position, caster.position) - getHexDistance(a.position, caster.position))[0];
      if (farthestEnemy) {
        farthestEnemy.attackCooldown = Math.max(farthestEnemy.attackCooldown, 40);
      }
    }

    // Golden Trio Synergy Resonance: grants 15 mana and 200 shield to other Golden Trio allies on cast
    const casterTeamTraits = caster.team === 'home' ? this.homeTraits : this.awayTraits;
    const hasGoldenTrio = casterTeamTraits.some((t) => t.traitId === 'Golden Trio' && t.activeTier >= 1);
    if (
      hasGoldenTrio &&
      (caster.unitDefId === 'harry_potter' || caster.unitDefId === 'hermione_granger' || caster.unitDefId === 'ron_weasley')
    ) {
      const trioAllies = this.units.filter(
        (u) =>
          u.team === caster.team &&
          u.state !== 'DEAD' &&
          u.id !== caster.id &&
          (u.unitDefId === 'harry_potter' || u.unitDefId === 'hermione_granger' || u.unitDefId === 'ron_weasley')
      );
      for (const ally of trioAllies) {
        ally.currentMana = Math.min(ally.maxMana, ally.currentMana + 15);
        ally.shield += 200;
        this.events.push({
          tick: this.currentTick,
          type: 'SHIELD',
          sourceId: caster.id,
          targetId: ally.id,
          value: 200,
          remainingHp: ally.currentHp,
        });
      }
    }
  }

  public applyStatusEffect(
    target: CombatUnit,
    type: StatusEffectType,
    durationSeconds: number,
    value?: number
  ): void {
    const durationTicks = Math.round(durationSeconds * TICK_RATE);
    const existing = target.statusEffects.find((e) => e.type === type);
    if (existing) {
      existing.durationTicks = Math.max(existing.durationTicks, durationTicks);
      if (value !== undefined) existing.value = value;
    } else {
      target.statusEffects.push({ type, durationTicks, value });
    }
    this.updateEffectiveStats(target);
  }

  public updateEffectiveStats(unit: CombatUnit): void {
    // Sunder Check (Armor Reduction): major 'sunder' (-30%) takes priority over 'smSunder' (-20%)
    let armorMultiplier = 1.0;
    if (unit.statusEffects.some((e) => e.type === 'sunder')) {
      armorMultiplier = 0.70;
    } else if (unit.statusEffects.some((e) => e.type === 'smSunder')) {
      armorMultiplier = 0.80;
    }
    unit.armor = Math.max(0, Math.round(unit.baseArmor * armorMultiplier));

    // Shred Check (Magic Resist Reduction): major 'shred' (-30%) takes priority over 'smShred' (-20%)
    let mrMultiplier = 1.0;
    if (unit.statusEffects.some((e) => e.type === 'shred')) {
      mrMultiplier = 0.70;
    } else if (unit.statusEffects.some((e) => e.type === 'smShred')) {
      mrMultiplier = 0.80;
    }
    unit.magicResist = Math.max(0, Math.round(unit.baseMagicResist * mrMultiplier));
  }

  private dealAbilityDamage(
    caster: CombatUnit,
    target: CombatUnit,
    rawDamage: number,
    damageType: 'physical' | 'magic' | 'true'
  ): void {
    const casterDef = UNITS[caster.unitDefId];
    let finalDmg = rawDamage;

    // Check spell crit artifacts (elder_wand, resurrection_stone, marauders_map)
    const canSpellCrit =
      caster.items.includes('elder_wand') ||
      caster.items.includes('resurrection_stone') ||
      caster.items.includes('marauders_map');

    let isCrit = false;
    if (canSpellCrit && Math.random() < caster.critChance) {
      isCrit = true;
      const multiplier = caster.items.includes('resurrection_stone') ? 2.0 : 1.5;
      finalDmg = Math.round(finalDmg * multiplier);
    }

    // Secondary Ability Debuffs (Sunder, Shred, Stuns)
    if (caster.unitDefId === 'dean_thomas') {
      // Reducto Blast: Applies 20% Armor smSunder for 5s (refreshed on hit)
      this.applyStatusEffect(target, 'smSunder', 5, 0.20);
    } else if (caster.unitDefId === 'pansy_parkinson') {
      // Slytherin Sting: Applies 20% Magic Resist smShred for 5s (refreshed on hit)
      this.applyStatusEffect(target, 'smShred', 5, 0.20);
    } else if (caster.unitDefId === 'neville_longbottom' || caster.unitDefId === 'fleur_delacour') {
      // Stun / Charm target for 1.5s
      target.attackCooldown = Math.max(target.attackCooldown, 30);
    }

    if (damageType === 'magic') {
      const effectiveMR = Math.max(0, target.magicResist);
      const mitigation = 100 / (100 + effectiveMR);
      finalDmg = Math.max(1, Math.round(finalDmg * mitigation));
    } else if (damageType === 'physical') {
      const effectiveArmor = Math.max(0, target.armor);
      const mitigation = 100 / (100 + effectiveArmor);
      finalDmg = Math.max(1, Math.round(finalDmg * mitigation));
    }

    this.applyDamage(caster, target, finalDmg, damageType, isCrit);

    // Inherent Fighter 10% Omnivamp on spell damage
    if (casterDef?.combatRole === 'Fighter') {
      const healAmt = Math.round(finalDmg * 0.1);
      if (healAmt > 0 && caster.currentHp < caster.maxHp) {
        caster.currentHp = Math.min(caster.maxHp, caster.currentHp + healAmt);
        caster.totalHealing += healAmt;
      }
    }

    // Omnivamp (Sword of Gryffindor)
    if (caster.items.includes('sword_of_gryffindor')) {
      const healAmount = Math.round(finalDmg * 0.15);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + healAmount);
      caster.totalHealing += healAmount;
    }
  }

  private applyDamage(
    attacker: CombatUnit,
    target: CombatUnit,
    damage: number,
    damageType: 'physical' | 'magic' | 'true',
    isCrit: boolean = false
  ): void {
    const targetDef = UNITS[target.unitDefId];
    let remainingDmg = damage;

    // Negate crit damage if target has Hogwarts Castle Bastion Armor
    if (isCrit && target.items.includes('hogwarts_bastion')) {
      remainingDmg = Math.round(remainingDmg / 1.5);
    }

    // Shield absorption
    if (target.shield > 0) {
      if (target.shield >= remainingDmg) {
        target.shield -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= target.shield;
        target.shield = 0;
      }
    }

    target.currentHp = Math.max(0, target.currentHp - remainingDmg);
    attacker.totalDamageDealt += damage;
    target.totalDamageTaken += damage;

    // Innate Role Mana Gain on taking damage:
    // Only Tank role gains mana from taking damage (~8% of pre-mitigation damage, capped at 40)
    if (targetDef?.combatRole === 'Tank') {
      const manaGainFromDamage = Math.min(40, Math.round(damage * 0.08));
      target.currentMana = Math.min(target.maxMana, target.currentMana + manaGainFromDamage);
    }

    this.events.push({
      tick: this.currentTick,
      type: 'DAMAGE',
      sourceId: attacker.id,
      targetId: target.id,
      value: damage,
      damageType,
      isCrit,
      remainingHp: target.currentHp,
      remainingMana: target.currentMana,
    });

    // Hogwarts Castle Bastion Armor reflection
    if (target.items.includes('hogwarts_bastion') && damageType === 'physical') {
      const reflectDmg = 100;
      attacker.currentHp = Math.max(0, attacker.currentHp - reflectDmg);
      this.events.push({
        tick: this.currentTick,
        type: 'DAMAGE',
        sourceId: target.id,
        targetId: attacker.id,
        value: reflectDmg,
        damageType: 'magic',
        remainingHp: attacker.currentHp,
      });
      if (attacker.currentHp <= 0) {
        this.killUnit(attacker);
      }
    }

    if (target.currentHp <= 0) {
      this.killUnit(target);
    }
  }

  private killUnit(unit: CombatUnit): void {
    unit.state = 'DEAD';
    unit.currentHp = 0;

    this.events.push({
      tick: this.currentTick,
      type: 'DEATH',
      targetId: unit.id,
      position: { ...unit.position },
    });
  }

  private getRoleThreatScore(role?: CombatRole): number {
    if (role === 'Tank') return 2;
    if (role === 'Fighter') return 1;
    return 0; // Assassin, Caster, Marksman, Specialist
  }

  private findBestTarget(unit: CombatUnit): CombatUnit | null {
    const enemies = this.units.filter((u) => u.team !== unit.team && u.state !== 'DEAD');
    if (enemies.length === 0) return null;

    // Primary: Closest Hex Distance
    // Distance Tie-Breaker: Tank (2) > Fighter (1) > Assassin/Caster/Marksman/Specialist (0)
    // Sub Tie-Breaker: Lowest HP
    enemies.sort((a, b) => {
      const distA = getHexDistance(unit.position, a.position);
      const distB = getHexDistance(unit.position, b.position);
      if (distA !== distB) return distA - distB;

      const defA = UNITS[a.unitDefId];
      const defB = UNITS[b.unitDefId];
      const threatA = this.getRoleThreatScore(defA?.combatRole);
      const threatB = this.getRoleThreatScore(defB?.combatRole);
      if (threatA !== threatB) return threatB - threatA; // Higher threat prioritized on tie

      return a.currentHp - b.currentHp;
    });

    return enemies[0] || null;
  }

  private moveUnitTowards(unit: CombatUnit, targetPos: GridPosition): void {
    const occupiedTiles = new Set(
      this.units
        .filter((u) => u.state !== 'DEAD' && u.id !== unit.id)
        .map((u) => `${u.position.x},${u.position.y}`)
    );

    const neighbors = getHexNeighbors(unit.position, 0, 7, 0, 7);
    const freeNeighbors = neighbors.filter((p) => !occupiedTiles.has(`${p.x},${p.y}`));

    if (freeNeighbors.length === 0) return;

    // Pick hex neighbor that minimizes distance to target
    freeNeighbors.sort(
      (a, b) => getHexDistance(a, targetPos) - getHexDistance(b, targetPos)
    );

    const nextTile = freeNeighbors[0];
    const fromPos = { ...unit.position };
    unit.position = nextTile;

    this.events.push({
      tick: this.currentTick,
      type: 'MOVE',
      sourceId: unit.id,
      fromPos,
      toPos: { ...nextTile },
    });
  }

  private findNearestFreeTile(targetPos: GridPosition): GridPosition | null {
    const occupiedTiles = new Set(
      this.units.filter((u) => u.state !== 'DEAD').map((u) => `${u.position.x},${u.position.y}`)
    );

    if (!occupiedTiles.has(`${targetPos.x},${targetPos.y}`)) {
      return targetPos;
    }

    const visited = new Set<string>([`${targetPos.x},${targetPos.y}`]);
    const queue: GridPosition[] = [targetPos];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getHexNeighbors(current, 0, 7, 0, 7);

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (!occupiedTiles.has(key)) {
            return n;
          }
          queue.push(n);
        }
      }
    }

    return null;
  }

  private getUnitById(id: string | null): CombatUnit | null {
    if (!id) return null;
    return this.units.find((u) => u.id === id) || null;
  }

  private buildResult(): CombatResult {
    const homeSurvivors = this.units.filter((u) => u.team === 'home' && u.state !== 'DEAD');
    const awaySurvivors = this.units.filter((u) => u.team === 'away' && u.state !== 'DEAD');

    let winner: CombatTeam | 'tie' = 'tie';
    let damageToLoser = 0;

    if (homeSurvivors.length > 0 && awaySurvivors.length === 0) {
      winner = 'home';
      const survivorStars = homeSurvivors.reduce((acc, u) => acc + u.starLevel, 0);
      damageToLoser = Math.max(2, this.stage * 2 + survivorStars);
    } else if (awaySurvivors.length > 0 && homeSurvivors.length === 0) {
      winner = 'away';
      const survivorStars = awaySurvivors.reduce((acc, u) => acc + u.starLevel, 0);
      damageToLoser = Math.max(2, this.stage * 2 + survivorStars);
    }

    const homeSummaries: Record<string, UnitCombatSummary> = {};
    const awaySummaries: Record<string, UnitCombatSummary> = {};

    for (const u of this.units) {
      const def = UNITS[u.unitDefId];
      const summary: UnitCombatSummary = {
        unitDefId: u.unitDefId,
        starLevel: u.starLevel,
        cost: def?.cost || 1,
        damageDealt: u.totalDamageDealt,
        damageTaken: u.totalDamageTaken,
        healing: u.totalHealing,
        survived: u.state !== 'DEAD',
        hpPercent: Math.round((u.currentHp / u.maxHp) * 100),
        items: [...u.items],
      };

      if (u.team === 'home') {
        homeSummaries[u.id] = summary;
      } else {
        awaySummaries[u.id] = summary;
      }
    }

    this.events.push({
      tick: this.currentTick,
      type: 'COMBAT_END',
      value: damageToLoser,
      meta: { winner, duration: this.currentTick },
    });

    return {
      winner,
      durationTicks: this.currentTick,
      durationInSeconds: Math.ceil(this.currentTick / TICK_RATE),
      homePlayerId: this.homePlayerId,
      awayPlayerId: this.awayPlayerId,
      damageToLoser,
      homeSurvivors: homeSurvivors.length,
      awaySurvivors: awaySurvivors.length,
      homeUnitSummaries: homeSummaries,
      awayUnitSummaries: awaySummaries,
      events: this.events,
      isPve: this.awayPlayerId === 'pve_creeps',
    };
  }
}
