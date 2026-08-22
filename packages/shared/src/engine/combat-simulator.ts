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
export const REGULAR_COMBAT_TICKS = 25 * TICK_RATE; // 25 seconds = 500 ticks (shortened by 5s)
export const OVERTIME_TICKS = 20 * TICK_RATE; // 20 seconds = 400 ticks (sudden death)
export const MAX_COMBAT_TICKS = REGULAR_COMBAT_TICKS + OVERTIME_TICKS; // 45 seconds = 900 ticks total

export class CombatSimulator {
  private homePlayerId: string;
  private awayPlayerId: string;
  private stage: number;
  private units: CombatUnit[] = [];
  private events: CombatEvent[] = [];
  private currentTick = 0;
  private inOvertime = false;
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
      let dodgeChance = 0.0;
      
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
          if (bp.bonus.manaPerSecond) manaPerSec += bp.bonus.manaPerSecond;
          if (bp.bonus.dodgeChance) dodgeChance += bp.bonus.dodgeChance;
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
        dodgeChance,
        duelistStacks: 0,
        hasGryffindorShielded: false,
        hasWeasleyShielded: false,
        state: 'IDLE',
        targetId: null,
        attackCooldown: Math.floor(Math.random() * 5), // staggered start
        moveCooldown: 0,
        castDuration: 0,
        items: [...bu.items],
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalPhysicalMitigated: 0,
        totalMagicMitigated: 0,
        totalHealing: 0,
        totalShielding: 0,
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

    // Malfoy (2+) Bribe: Inflicts all enemy units with smSunder & smShred for duration at combat start
    const applyMalfoyBribe = (teamTraits: ActiveTraitInfo[], opposingTeam: 'home' | 'away') => {
      const malfoyTrait = teamTraits.find((t) => t.traitId === 'Malfoy' && t.activeTier >= 1);
      if (malfoyTrait) {
        const bp = TRAITS['Malfoy']?.breakpoints[malfoyTrait.activeTier - 1];
        const sunderVal = bp?.bonus.sunderShredPercent ?? 0.12;
        const duration = bp?.bonus.sunderShredDuration ?? 6.0;
        for (const u of this.units.filter((u) => u.team === opposingTeam)) {
          this.applyStatusEffect(u, 'smSunder', duration, sunderVal);
          this.applyStatusEffect(u, 'smShred', duration, sunderVal);
        }
      }
    };
    applyMalfoyBribe(this.homeTraits, 'away');
    applyMalfoyBribe(this.awayTraits, 'home');

    // Inquisitorial Squad (3/5) Detention: Detains (stuns & disarms) highest-damage enemies at combat start
    const applyInquisitorialDetention = (traitTier: number, opposingTeam: 'home' | 'away') => {
      const bp = TRAITS['Inquisitorial Squad']?.breakpoints[traitTier - 1];
      const countToDetain = bp?.bonus.detainCount ?? (traitTier >= 2 ? 2 : 1);
      const duration = bp?.bonus.detainDuration ?? 2.8;
      if (countToDetain > 0) {
        const opposingUnits = this.units
          .filter((u) => u.team === opposingTeam && u.state !== 'DEAD')
          .sort((a, b) => (b.attackDamage + b.abilityPower * 100) - (a.attackDamage + a.abilityPower * 100))
          .slice(0, countToDetain);
        for (const target of opposingUnits) {
          this.applyStatusEffect(target, 'stunned', duration);
          this.applyStatusEffect(target, 'disarmed', duration);
        }
      }
    };

    const homeInquisitorial = this.homeTraits.find((t) => t.traitId === 'Inquisitorial Squad' && t.activeTier >= 1);
    if (homeInquisitorial) {
      applyInquisitorialDetention(homeInquisitorial.activeTier, 'away');
    }
    const awayInquisitorial = this.awayTraits.find((t) => t.traitId === 'Inquisitorial Squad' && t.activeTier >= 1);
    if (awayInquisitorial) {
      applyInquisitorialDetention(awayInquisitorial.activeTier, 'home');
    }

    while (this.currentTick < MAX_COMBAT_TICKS) {
      this.currentTick++;

      // Sudden Death / Overtime at 25 seconds (tick 500)
      if (this.currentTick === REGULAR_COMBAT_TICKS && !this.inOvertime) {
        this.inOvertime = true;
        for (const u of this.units) {
          if (u.state !== 'DEAD') {
            u.attackSpeed *= 1.5;
            u.abilityPower *= 1.5;
            u.attackCooldown = Math.min(
              u.attackCooldown,
              Math.max(4, Math.round(TICK_RATE / Math.max(0.2, u.attackSpeed)))
            );
          }
        }
        this.events.push({
          tick: this.currentTick,
          type: 'OVERTIME',
          value: 20,
          meta: { attackSpeedMultiplier: 1.5, damageMultiplier: 1.5 },
        });
      }

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

      // Decrement attack and move cooldowns
      if (unit.attackCooldown > 0) {
        unit.attackCooldown--;
      }
      if (unit.moveCooldown > 0) {
        unit.moveCooldown--;
      }

      // Periodic item passives (every 1 second = 20 ticks)
      if (this.currentTick % TICK_RATE === 0) {
        this.processItemTick(unit);
      }

      const isStunned = unit.statusEffects?.some((e) => e.type === 'stun' || e.type === 'stunned');
      if (isStunned) {
        unit.state = 'STUNNED';
        continue;
      } else if (unit.state === 'STUNNED') {
        unit.state = 'IDLE';
      }

      const isSilenced = unit.statusEffects?.some((e) => e.type === 'silence' || e.type === 'silenced');
      const isDisarmed = unit.statusEffects?.some((e) => e.type === 'disarm' || e.type === 'disarmed');

      // Mana check: Cast ability when at 100% mana (if not silenced)
      if (unit.currentMana >= unit.maxMana && unit.state === 'IDLE' && !isSilenced) {
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

      let dist = getHexDistance(unit.position, target.position);

      // If current target is outside attack range, check if any living enemy is already in range to avoid walking past
      if (dist > unit.range) {
        const inRangeEnemy = this.units.find(
          (u) =>
            u.team !== unit.team &&
            u.state !== 'DEAD' &&
            getHexDistance(unit.position, u.position) <= unit.range
        );
        if (inRangeEnemy) {
          target = inRangeEnemy;
          unit.targetId = inRangeEnemy.id;
          dist = getHexDistance(unit.position, target.position);
        }
      }

      if (dist <= unit.range) {
        // In range: Attack target (if not disarmed)
        if (unit.attackCooldown <= 0 && unit.state === 'IDLE' && !isDisarmed) {
          this.executeBasicAttack(unit, target);
        }
      } else {
        // Out of range: Move towards target with tactical move cooldown
        if (unit.state === 'IDLE' && unit.moveCooldown <= 0) {
          this.moveUnitTowards(unit, target);
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

    // 3. Hufflepuff (8) Teamwide HP Regeneration
    const unitTeamTraits = unit.team === 'home' ? this.homeTraits : this.awayTraits;
    const huffTrait = unitTeamTraits.find((t) => t.traitId === 'Hufflepuff' && t.activeTier >= 3);
    if (huffTrait) {
      const bp = TRAITS['Hufflepuff']?.breakpoints[huffTrait.activeTier - 1];
      if (bp?.bonus.hpRegenPerSec && unit.currentHp < unit.maxHp) {
        const healAmt = Math.round(unit.maxHp * bp.bonus.hpRegenPerSec);
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

  private executeBasicAttack(attacker: CombatUnit, target: CombatUnit): void {
    const attackerDef = UNITS[attacker.unitDefId];
    const targetDef = UNITS[target.unitDefId];
    const attackerTeamTraits = attacker.team === 'home' ? this.homeTraits : this.awayTraits;
    const targetTeamTraits = target.team === 'home' ? this.homeTraits : this.awayTraits;

    // Check Dodge
    if (target.dodgeChance && Math.random() < target.dodgeChance) {
      // Trickster Mana Burn on dodge
      if (targetDef?.classes.includes('Trickster')) {
        const tricksterTrait = targetTeamTraits.find((t) => t.traitId === 'Trickster' && t.activeTier >= 1);
        if (tricksterTrait) {
          const bp = TRAITS['Trickster']?.breakpoints[tricksterTrait.activeTier - 1];
          const burn = bp?.bonus.manaBurn ?? 6;
          attacker.currentMana = Math.max(0, attacker.currentMana - burn);
        }
      }

      // Reset attack cooldown and return
      const cooldownTicks = Math.max(4, Math.round(TICK_RATE / Math.max(0.2, attacker.attackSpeed)));
      attacker.attackCooldown = cooldownTicks;
      return;
    }

    const isCrit = Math.random() < attacker.critChance;
    let rawDmg = isCrit
      ? attacker.attackDamage * attacker.critMultiplier
      : attacker.attackDamage;

    // Sniper class damage amplification per hex tile
    if (attackerDef?.classes.includes('Sniper')) {
      const sniperTrait = attackerTeamTraits.find((t) => t.traitId === 'Sniper' && t.activeTier >= 1);
      if (sniperTrait) {
        const bp = TRAITS['Sniper']?.breakpoints[sniperTrait.activeTier - 1];
        const ampPerHex = bp?.bonus.damageAmpPerHex ?? 0.02;
        const hexDist = getHexDistance(attacker.position, target.position);
        const ampMultiplier = 1 + hexDist * ampPerHex;
        rawDmg *= ampMultiplier;
      }
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

    // Duelist class stacking attack speed with max stacks
    if (attackerDef?.classes.includes('Duelist')) {
      const duelistTrait = attackerTeamTraits.find((t) => t.traitId === 'Duelist' && t.activeTier >= 1);
      if (duelistTrait) {
        const bp = TRAITS['Duelist']?.breakpoints[duelistTrait.activeTier - 1];
        const asPerStack = bp?.bonus.attackSpeedPerStack ?? (duelistTrait.activeTier >= 2 ? 0.12 : 0.06);
        const maxStacks = bp?.bonus.maxStacks ?? 8;
        attacker.duelistStacks = attacker.duelistStacks ?? 0;
        if (attacker.duelistStacks < maxStacks) {
          attacker.duelistStacks += 1;
          attacker.attackSpeed *= (1 + asPerStack);
        }
      }
    }

    // Apply damage
    this.applyDamage(attacker, target, finalDamage, 'physical', isCrit);

    // Dragon origin: cleaves adjacent foes with splash damage
    const dragonTrait = attackerTeamTraits.find((t) => t.traitId === 'Dragon' && t.activeTier >= 1);
    if (dragonTrait && attackerDef?.origins.includes('Dragon')) {
      const bp = TRAITS['Dragon']?.breakpoints[0];
      const splashPct = bp?.bonus.splashPercent ?? 0.15;
      const splashDmg = Math.max(1, Math.round(finalDamage * splashPct));
      const adjEnemies = this.units.filter(
        (u) => u.team !== attacker.team && u.state !== 'DEAD' && u.id !== target.id && getHexDistance(u.position, target.position) <= 1
      );
      for (const adj of adjEnemies) {
        this.applyDamage(attacker, adj, splashDmg, 'physical');
      }
    }

    // Inquisitorial Squad: Bonus True Damage to crowd-controlled / detained enemies
    const inqTrait = attackerTeamTraits.find((t) => t.traitId === 'Inquisitorial Squad' && t.activeTier >= 1);
    if (inqTrait && attackerDef?.origins.includes('Inquisitorial Squad')) {
      const bp = TRAITS['Inquisitorial Squad']?.breakpoints[inqTrait.activeTier - 1];
      if (bp?.bonus.bonusTrueDamage) {
        const isCCed = target.statusEffects.some((e) => e.type === 'stunned' || e.type === 'disarmed' || e.type === 'silenced');
        if (isCCed) {
          const bonusTrue = Math.max(1, Math.round(finalDamage * bp.bonus.bonusTrueDamage));
          this.applyDamage(attacker, target, bonusTrue, 'true');
        }
      }
    }

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
    } else if (caster.unitDefId === 'filius_flitwick') {
      // Swarm of charms: grants +35% Attack Speed to all living allies
      const allies = this.units.filter((u) => u.team === caster.team && u.state !== 'DEAD');
      for (const a of allies) {
        a.attackSpeed = Math.round(a.attackSpeed * 1.35 * 100) / 100;
      }
    } else if (caster.unitDefId === 'madeye_moody') {
      // Constant Vigilance: gains +25 Armor and +25 MR
      caster.baseArmor += 25;
      caster.baseMagicResist += 25;
      this.updateEffectiveStats(caster);
    } else if (caster.unitDefId === 'cedric_diggory') {
      // Hufflepuff Valour: grants 250 shield to self and closest ally
      caster.shield += 250;
      caster.totalShielding += 250;
      const allies = this.units.filter((u) => u.team === caster.team && u.state !== 'DEAD' && u.id !== caster.id);
      if (allies.length > 0) {
        allies.sort((a, b) => getHexDistance(a.position, caster.position) - getHexDistance(b.position, caster.position));
        allies[0].shield += 250;
        allies[0].totalShielding += 250;
      }
    } else if (caster.unitDefId === 'molly_weasley') {
      // Maternal Reductor Blast: grants 450 HP shield to lowest HP ally
      const lowestAlly = this.units
        .filter((u) => u.team === caster.team && u.state !== 'DEAD')
        .sort((a, b) => a.currentHp - b.currentHp)[0];
      if (lowestAlly) {
        lowestAlly.shield += 450;
        lowestAlly.totalShielding += 450;
        caster.totalShielding += 450;
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
        closestAlly.totalShielding += 400;
        caster.totalShielding += 400;
      }
      const farthestEnemy = this.units
        .filter((u) => u.team !== caster.team && u.state !== 'DEAD')
        .sort((a, b) => getHexDistance(b.position, caster.position) - getHexDistance(a.position, caster.position))[0];
      if (farthestEnemy) {
        farthestEnemy.attackCooldown = Math.max(farthestEnemy.attackCooldown, 32); // 1.6s charm
      }
    } else if (caster.unitDefId === 'argus_filch') {
      // Mrs. Norris Prowl & Shackle: stuns target for 1.0s (1-cost)
      let target = this.getUnitById(caster.targetId);
      if (!target || target.state === 'DEAD') {
        target = this.findBestTarget(caster);
      }
      if (target) {
        this.applyStatusEffect(target, 'stunned', 1.0);
      }
    } else if (caster.unitDefId === 'dolores_umbridge') {
      // Educational Decree #137: silences and disarms 3 highest threat enemies for 2.2s (4-cost)
      const enemies = this.units
        .filter((u) => u.team !== caster.team && u.state !== 'DEAD')
        .sort((a, b) => (b.attackDamage + b.abilityPower * 100) - (a.attackDamage + a.abilityPower * 100))
        .slice(0, 3);
      for (const e of enemies) {
        this.applyStatusEffect(e, 'silenced', 2.2);
        this.applyStatusEffect(e, 'disarmed', 2.2);
      }
    }

    // Golden Trio Synergy Resonance: grants 12 mana and 150 shield to other Golden Trio allies on cast
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
        ally.currentMana = Math.min(ally.maxMana, ally.currentMana + 12);
        ally.shield += 150;
        ally.totalShielding += 150;
        caster.totalShielding += 150;
        this.events.push({
          tick: this.currentTick,
          type: 'SHIELD',
          sourceId: caster.id,
          targetId: ally.id,
          value: 150,
          remainingHp: ally.currentHp,
        });
      }
    }

    // Weasley Family Synergy: heals all Weasleys for 120 HP on ability cast
    const hasWeasleyFamily = casterTeamTraits.some((t) => t.traitId === 'Weasley' && t.activeTier >= 1);
    if (
      hasWeasleyFamily &&
      (caster.unitDefId === 'ron_weasley' || caster.unitDefId === 'ginny_weasley' || caster.unitDefId === 'fred_and_george' || caster.unitDefId === 'molly_weasley' || caster.unitDefId === 'arthur_weasley')
    ) {
      const weasleyAllies = this.units.filter(
        (u) =>
          u.team === caster.team &&
          u.state !== 'DEAD' &&
          (u.unitDefId === 'ron_weasley' || u.unitDefId === 'ginny_weasley' || u.unitDefId === 'fred_and_george' || u.unitDefId === 'molly_weasley' || u.unitDefId === 'arthur_weasley')
      );
      for (const w of weasleyAllies) {
        if (w.currentHp < w.maxHp) {
          const heal = Math.min(120, w.maxHp - w.currentHp);
          w.currentHp += heal;
          caster.totalHealing += heal;
          this.events.push({
            tick: this.currentTick,
            type: 'HEAL',
            sourceId: caster.id,
            targetId: w.id,
            value: heal,
            remainingHp: w.currentHp,
          });
        }
      }
    }

    // Patil Sisters Synergy: grants 140 HP shield to both sisters on ability cast
    const hasPatilSisters = casterTeamTraits.some((t) => t.traitId === 'Patil Sisters' && t.activeTier >= 1);
    if (
      hasPatilSisters &&
      (caster.unitDefId === 'padma_patil' || caster.unitDefId === 'parvati_patil')
    ) {
      const patilAllies = this.units.filter(
        (u) =>
          u.team === caster.team &&
          u.state !== 'DEAD' &&
          (u.unitDefId === 'padma_patil' || u.unitDefId === 'parvati_patil')
      );
      for (const p of patilAllies) {
        p.shield += 140;
        p.totalShielding += 140;
        caster.totalShielding += 140;
        this.events.push({
          tick: this.currentTick,
          type: 'SHIELD',
          sourceId: caster.id,
          targetId: p.id,
          value: 140,
          remainingHp: p.currentHp,
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
    } else if (caster.unitDefId === 'neville_longbottom') {
      // Petrificus Totalus: 1.0s stun (1-cost)
      target.attackCooldown = Math.max(target.attackCooldown, 20);
    } else if (caster.unitDefId === 'fleur_delacour') {
      // Alluring Charm: 1.4s charm (2-cost)
      target.attackCooldown = Math.max(target.attackCooldown, 28);
    }

    if (damageType === 'magic') {
      const effectiveMR = Math.max(0, target.magicResist);
      const mitigation = 100 / (100 + effectiveMR);
      finalDmg = Math.max(1, Math.round(finalDmg * mitigation));
      target.totalMagicMitigated += Math.max(0, Math.round(rawDamage - finalDmg));
    } else if (damageType === 'physical') {
      const effectiveArmor = Math.max(0, target.armor);
      const mitigation = 100 / (100 + effectiveArmor);
      finalDmg = Math.max(1, Math.round(finalDmg * mitigation));
      target.totalPhysicalMitigated += Math.max(0, Math.round(rawDamage - finalDmg));
    }

    this.applyDamage(caster, target, finalDmg, damageType, isCrit);

    // Inquisitorial Squad (5): +18% bonus True Damage to crowd-controlled / detained enemies
    const casterTeamTraits = caster.team === 'home' ? this.homeTraits : this.awayTraits;
    const hasInquisitorial5 = casterTeamTraits.some((t) => t.traitId === 'Inquisitorial Squad' && t.activeTier >= 2);
    if (hasInquisitorial5 && casterDef?.origins.includes('Inquisitorial Squad')) {
      const isCCed = target.statusEffects.some((e) => e.type === 'stunned' || e.type === 'disarmed' || e.type === 'silenced');
      if (isCCed) {
        const bonusTrue = Math.max(1, Math.round(finalDmg * 0.18));
        this.applyDamage(caster, target, bonusTrue, 'true');
      }
    }

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
    const attackerDef = UNITS[attacker.unitDefId];
    const targetTeamTraits = target.team === 'home' ? this.homeTraits : this.awayTraits;
    const attackerTeamTraits = attacker.team === 'home' ? this.homeTraits : this.awayTraits;
    let effectiveDmg = damage;

    // Overtime / Sudden Death 50% damage amplification
    if (this.inOvertime) {
      effectiveDmg = Math.round(effectiveDmg * 1.5);
    }

    // Hufflepuff teamwide damage reduction
    const huffTrait = targetTeamTraits.find((t) => t.traitId === 'Hufflepuff' && t.activeTier >= 1);
    if (huffTrait) {
      const bp = TRAITS['Hufflepuff']?.breakpoints[huffTrait.activeTier - 1];
      const dr = bp?.bonus.damageReduction ?? 0.08;
      effectiveDmg = Math.max(1, Math.round(effectiveDmg * (1 - dr)));
    }

    // Ghost physical damage reduction
    if (damageType === 'physical' && targetDef?.origins.includes('Ghost')) {
      const ghostTrait = targetTeamTraits.find((t) => t.traitId === 'Ghost' && t.activeTier >= 1);
      if (ghostTrait) {
        const bp = TRAITS['Ghost']?.breakpoints[ghostTrait.activeTier - 1];
        const dr = bp?.bonus.damageReduction ?? 0.14;
        effectiveDmg = Math.max(1, Math.round(effectiveDmg * (1 - dr)));
      }
    }

    // Negate crit damage if target has Hogwarts Castle Bastion Armor
    if (isCrit && target.items.includes('hogwarts_bastion')) {
      effectiveDmg = Math.round(effectiveDmg / 1.5);
    }

    let remainingDmg = effectiveDmg;

    // Shield absorption
    if (target.shield > 0) {
      if (target.shield >= remainingDmg) {
        target.shield -= remainingDmg;
        target.totalShielding += remainingDmg;
        remainingDmg = 0;
      } else {
        target.totalShielding += target.shield;
        remainingDmg -= target.shield;
        target.shield = 0;
      }
    }

    target.currentHp = Math.max(0, target.currentHp - remainingDmg);
    attacker.totalDamageDealt += effectiveDmg;
    target.totalDamageTaken += effectiveDmg;

    // Gryffindor shield when dropping below threshold
    const gryffTrait = targetTeamTraits.find((t) => t.traitId === 'Gryffindor' && t.activeTier >= 2);
    if (gryffTrait && targetDef?.origins.includes('Gryffindor') && !target.hasGryffindorShielded) {
      const bp = TRAITS['Gryffindor']?.breakpoints[gryffTrait.activeTier - 1];
      const threshold = bp?.bonus.shieldThreshold ?? 0.40;
      const shieldAmount = bp?.bonus.shieldHp ?? 220;
      if (target.currentHp > 0 && target.currentHp / target.maxHp <= threshold) {
        target.hasGryffindorShielded = true;
        target.shield += shieldAmount;
        target.totalShielding += shieldAmount;
        this.events.push({
          tick: this.currentTick,
          type: 'SHIELD',
          sourceId: target.id,
          targetId: target.id,
          value: shieldAmount,
          remainingHp: target.currentHp,
        });
      }
    }

    // Slytherin execution below threshold
    const slytherinTrait = attackerTeamTraits.find((t) => t.traitId === 'Slytherin' && t.activeTier >= 1);
    if (slytherinTrait && attackerDef?.origins.includes('Slytherin')) {
      const bp = TRAITS['Slytherin']?.breakpoints[slytherinTrait.activeTier - 1];
      const threshold = bp?.bonus.executeThreshold ?? 0.08;
      if (target.currentHp > 0 && target.currentHp / target.maxHp <= threshold) {
        target.currentHp = 0;
        target.state = 'DEAD';
      }
    }

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

  private findNextHexStep(unit: CombatUnit, target: CombatUnit): GridPosition | null {
    const occupiedTiles = new Set(
      this.units
        .filter((u) => u.state !== 'DEAD' && u.id !== unit.id)
        .map((u) => `${u.position.x},${u.position.y}`)
    );

    const startKey = `${unit.position.x},${unit.position.y}`;
    const queue: GridPosition[] = [unit.position];
    const visited = new Set<string>([startKey]);
    const parentMap = new Map<string, GridPosition>();

    let destinationTile: GridPosition | null = null;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currDist = getHexDistance(curr, target.position);

      // Found a tile within attack range of target!
      if (currDist <= unit.range) {
        destinationTile = curr;
        break;
      }

      const neighbors = getHexNeighbors(curr, 0, 7, 0, 7);
      for (const n of neighbors) {
        const nKey = `${n.x},${n.y}`;
        if (!visited.has(nKey) && !occupiedTiles.has(nKey)) {
          visited.add(nKey);
          parentMap.set(nKey, curr);
          queue.push(n);
        }
      }
    }

    // If no path to current target (target completely blocked/surrounded), find path to ANY accessible enemy
    if (!destinationTile) {
      const otherEnemies = this.units.filter(
        (u) => u.team !== unit.team && u.state !== 'DEAD' && u.id !== target.id
      );
      if (otherEnemies.length > 0) {
        const altQueue: GridPosition[] = [unit.position];
        const altVisited = new Set<string>([startKey]);
        const altParentMap = new Map<string, GridPosition>();

        while (altQueue.length > 0) {
          const curr = altQueue.shift()!;
          const reachableEnemy = otherEnemies.find(
            (e) => getHexDistance(curr, e.position) <= unit.range
          );
          if (reachableEnemy) {
            destinationTile = curr;
            unit.targetId = reachableEnemy.id;
            let step = destinationTile;
            let prev = altParentMap.get(`${step.x},${step.y}`);
            while (prev && `${prev.x},${prev.y}` !== startKey) {
              step = prev;
              prev = altParentMap.get(`${step.x},${step.y}`);
            }
            return step;
          }

          const neighbors = getHexNeighbors(curr, 0, 7, 0, 7);
          for (const n of neighbors) {
            const nKey = `${n.x},${n.y}`;
            if (!altVisited.has(nKey) && !occupiedTiles.has(nKey)) {
              altVisited.add(nKey);
              altParentMap.set(nKey, curr);
              altQueue.push(n);
            }
          }
        }
      }
      return null;
    }

    // Reconstruct the first step from unit.position towards destinationTile
    let step = destinationTile;
    let prev = parentMap.get(`${step.x},${step.y}`);
    while (prev && `${prev.x},${prev.y}` !== startKey) {
      step = prev;
      prev = parentMap.get(`${step.x},${step.y}`);
    }

    return step;
  }

  private moveUnitTowards(unit: CombatUnit, target: CombatUnit): void {
    const nextTile = this.findNextHexStep(unit, target);
    if (!nextTile) return;

    const fromPos = { ...unit.position };
    unit.position = nextTile;
    unit.moveCooldown = 6; // 6 ticks = 0.3s per step (smooth tactical speed)

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
        physicalMitigated: u.totalPhysicalMitigated,
        magicMitigated: u.totalMagicMitigated,
        totalMitigated: u.totalPhysicalMitigated + u.totalMagicMitigated,
        healing: u.totalHealing,
        shielding: u.totalShielding,
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
