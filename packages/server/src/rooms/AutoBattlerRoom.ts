import { WebSocket } from 'ws';
import {
  MatchState,
  PlayerState,
  ClientAction,
  BoardUnit,
  UNITS,
  ALL_ITEMS,
  BASE_ITEMS,
  BaseItemId,
  combineItems,
  calculateSynergies,
  calculateRoundIncome,
  XP_TO_LEVEL,
  addPlayerXp,
  UnitPool,
  CombatSimulator,
  REROLL_COST,
  XP_COST,
  XP_GAIN,
  checkAndCombineUnits,
} from '@autobattler/shared';
import { BotController } from '../bot/BotController.js';

const PLANNING_DURATION = 30;
const COMBAT_DURATION = 35;
const RESOLUTION_DURATION = 2;

export interface MatchPveRewards {
  stage1: { components: number; gold: number }; // 1-1 to 1-3: 1 comp + 2g each (total 3 comp, 6g)
  stage2_7: { components: number; gold: number }; // 3 comp, 6g
  stage3_7: { components: number; gold: number }; // 3 comp, 6g
  stage4_7: { components: number; gold: number }; // 3 comp, 6g (cumulative 12 comp, 24g)
  stage5_7: { components: number; gold: number }; // 4 comp, 8g
}

export class AutoBattlerRoom {
  public id: string;
  public state: MatchState;
  public pool: UnitPool;
  public clients = new Map<string, WebSocket>();
  private timerInterval: NodeJS.Timeout | null = null;
  private eliminatedCount = 0;
  private pveRewards: MatchPveRewards;
  private maxCombatDuration = 30;

  constructor(roomId: string) {
    this.id = roomId;
    this.pool = new UnitPool();

    // Generate balanced match PvE drop schedule (identical for all players in this match)
    // Stage 1 (3 rounds): 3 comp + 6g
    // Stages 2, 3, 4 PvE rounds: exactly 9 comp + 18g => total 12 comp + 24g by end of stage 4
    this.pveRewards = {
      stage1: { components: 1, gold: 2 },
      stage2_7: { components: 3, gold: 6 },
      stage3_7: { components: 3, gold: 6 },
      stage4_7: { components: 3, gold: 6 },
      stage5_7: { components: 4, gold: 8 },
    };

    this.state = {
      matchId: roomId,
      round: 1,
      stage: 1,
      roundInStage: 1,
      isPveRound: true,
      isChoiceRound: false,
      phase: 'LOBBY',
      phaseTimeRemaining: PLANNING_DURATION,
      phaseDuration: PLANNING_DURATION,
      players: {},
      playerOrder: [],
      combatResults: {},
      winnerId: null,
    };
  }

  public addClient(playerId: string, name: string, ws: WebSocket): void {
    this.clients.set(playerId, ws);

    if (!this.state.players[playerId]) {
      this.state.players[playerId] = this.createPlayerState(playerId, name, false);
      this.state.playerOrder.push(playerId);
    }

    this.sendStateTo(playerId);
    this.broadcastState();
  }

  public removeClient(playerId: string): void {
    this.clients.delete(playerId);
  }

  public fillWithBots(totalPlayers = 8): void {
    const botNames = [
      'ValiantBot',
      'DragonMaster',
      'ShadowNinja',
      'FrostQueen',
      'ArcaneMage',
      'IronTitan',
      'GaleRanger',
    ];

    let botIndex = 0;
    while (Object.keys(this.state.players).length < totalPlayers && botIndex < botNames.length) {
      const botId = `bot_${botIndex + 1}`;
      if (!this.state.players[botId]) {
        const botName = botNames[botIndex];
        this.state.players[botId] = this.createPlayerState(botId, botName, true);
        this.state.playerOrder.push(botId);
      }
      botIndex++;
    }
  }

  public startGame(): void {
    if (this.state.phase !== 'LOBBY') return;

    this.fillWithBots(8);
    this.state.phase = 'PLANNING';
    this.state.round = 1;
    this.state.stage = 1;
    this.state.roundInStage = 1;
    this.state.isPveRound = true;
    const initialPlanningDuration = 6; // Round 1-1 prep time is 6s (fast start)
    this.state.phaseTimeRemaining = initialPlanningDuration;
    this.state.phaseDuration = initialPlanningDuration;

    // Filter starting 1-cost champion roster
    const starting1Costs = Object.values(UNITS).filter(
      (u) => u.cost === 1 && !['cornish_pixie', 'garden_gnome', 'acromantula_hatchling'].includes(u.id)
    );

    // Initial setup: 0 gold, 1 starting 1-cost unit placed on bench
    for (const p of Object.values(this.state.players)) {
      p.gold = 0;
      p.level = 1;
      p.xp = 0;
      p.shopUnits = this.pool.drawShop(p.level, 5);

      const randomDef = starting1Costs[Math.floor(Math.random() * starting1Costs.length)] || starting1Costs[0];
      const startUnit: BoardUnit = {
        id: `unit_${p.id}_init_${Math.random().toString(36).substring(2, 6)}`,
        unitId: randomDef.id,
        starLevel: 1,
        position: { x: 0, y: 0 },
        items: [],
        currentHp: randomDef.stats.hp[0],
        maxHp: randomDef.stats.hp[0],
        currentMana: randomDef.stats.startingMana,
        maxMana: randomDef.stats.maxMana,
      };

      p.bench[0] = startUnit;
      p.activeTraits = calculateSynergies(p.board);
    }

    this.broadcastState();
    this.startLoop();
  }

  private startLoop(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick(): void {
    if (this.state.phase === 'GAME_OVER') {
      if (this.timerInterval) clearInterval(this.timerInterval);
      return;
    }

    this.state.phaseTimeRemaining--;

    if (this.state.phase === 'PLANNING') {
      // Execute bot AI behaviors periodically during planning
      if (this.state.phaseTimeRemaining % 5 === 0) {
        for (const p of Object.values(this.state.players)) {
          if (p.isBot && !p.isEliminated) {
            BotController.executeBotTurn(p, this.pool);
            if (p.armoryChoices && (!p.armoryChoices.chosenComponent || !p.armoryChoices.chosenUnit)) {
              this.executeBotArmoryChoice(p);
            }
          }
        }
      }

      // Right before combat starts (at T - 1 second), auto-deploy units from bench to board to fill empty capacity
      if (this.state.phaseTimeRemaining === 1) {
        for (const p of Object.values(this.state.players)) {
          if (!p.isEliminated) {
            this.autoFillBoardFromBench(p);
          }
        }
      }

      if (this.state.phaseTimeRemaining <= 0) {
        this.transitionToCombat();
      }
    } else if (this.state.phase === 'COMBAT') {
      const elapsedCombatTime = COMBAT_DURATION - this.state.phaseTimeRemaining;

      // If all matches in the room finished, shorten remaining time to 2 seconds
      if (elapsedCombatTime >= this.maxCombatDuration && this.state.phaseTimeRemaining > 2) {
        this.state.phaseTimeRemaining = 2;
      }

      if (this.state.phaseTimeRemaining <= 0) {
        this.transitionToResolution();
      }
    } else if (this.state.phase === 'RESOLUTION') {
      if (this.state.phaseTimeRemaining <= 0) {
        this.transitionToPlanning();
      }
    }

    this.broadcastState();
  }

  /**
   * Auto-deploys units from bench to board up to player level capacity.
   */
  private autoFillBoardFromBench(player: PlayerState): void {
    const currentBoardCount = this.getBoardUnits(player).length;
    let needed = player.level - currentBoardCount;
    if (needed <= 0) return;

    for (let bIdx = 0; bIdx < player.bench.length && needed > 0; bIdx++) {
      const unit = player.bench[bIdx];
      if (!unit) continue;

      let placed = false;
      for (let r = 0; r < 4 && !placed; r++) {
        for (let c = 0; c < 8 && !placed; c++) {
          if (!player.board[r][c]) {
            player.board[r][c] = unit;
            unit.position = { x: c, y: r };
            player.bench[bIdx] = null;
            needed--;
            placed = true;
          }
        }
      }
    }

    player.activeTraits = calculateSynergies(player.board);
  }

  private isCurrentRoundPve(): boolean {
    if (this.state.stage === 1) {
      return this.state.roundInStage <= 3; // 1-1, 1-2, 1-3 are PvE
    }
    return this.state.roundInStage === 7; // X-7 is the PvE round at end of stage
  }

  private isCurrentRoundChoice(): boolean {
    return this.state.stage >= 2 && this.state.roundInStage === 4; // X-4 is the Armory choice round
  }

  private getPveCreeps(stage: number, roundInStage: number): BoardUnit[] {
    if (stage === 1) {
      if (roundInStage === 1) {
        const def = UNITS['cornish_pixie'];
        return [
          { id: 'pve_pixie_1', unitId: 'cornish_pixie', starLevel: 1, position: { x: 3, y: 0 }, items: [], currentHp: def.stats.hp[0], maxHp: def.stats.hp[0], currentMana: 0, maxMana: def.stats.maxMana },
          { id: 'pve_pixie_2', unitId: 'cornish_pixie', starLevel: 1, position: { x: 4, y: 0 }, items: [], currentHp: def.stats.hp[0], maxHp: def.stats.hp[0], currentMana: 0, maxMana: def.stats.maxMana },
        ];
      } else if (roundInStage === 2) {
        const def = UNITS['cornish_pixie'];
        return [
          { id: 'pve_pixie_1', unitId: 'cornish_pixie', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: def.stats.hp[0], maxHp: def.stats.hp[0], currentMana: 0, maxMana: def.stats.maxMana },
          { id: 'pve_pixie_2', unitId: 'cornish_pixie', starLevel: 1, position: { x: 4, y: 0 }, items: [], currentHp: def.stats.hp[0], maxHp: def.stats.hp[0], currentMana: 0, maxMana: def.stats.maxMana },
          { id: 'pve_pixie_3', unitId: 'cornish_pixie', starLevel: 1, position: { x: 5, y: 0 }, items: [], currentHp: def.stats.hp[0], maxHp: def.stats.hp[0], currentMana: 0, maxMana: def.stats.maxMana },
        ];
      } else {
        const gnomeDef = UNITS['garden_gnome'];
        const spiderDef = UNITS['acromantula_hatchling'];
        return [
          { id: 'pve_gnome_1', unitId: 'garden_gnome', starLevel: 1, position: { x: 2, y: 0 }, items: [], currentHp: gnomeDef.stats.hp[0], maxHp: gnomeDef.stats.hp[0], currentMana: 0, maxMana: gnomeDef.stats.maxMana },
          { id: 'pve_spider_1', unitId: 'acromantula_hatchling', starLevel: 1, position: { x: 4, y: 0 }, items: [], currentHp: spiderDef.stats.hp[0], maxHp: spiderDef.stats.hp[0], currentMana: 0, maxMana: spiderDef.stats.maxMana },
          { id: 'pve_gnome_2', unitId: 'garden_gnome', starLevel: 1, position: { x: 5, y: 0 }, items: [], currentHp: gnomeDef.stats.hp[0], maxHp: gnomeDef.stats.hp[0], currentMana: 0, maxMana: gnomeDef.stats.maxMana },
        ];
      }
    } else if (stage === 2) {
      // Stage 2-7: 3x Mountain Gnomes
      const def = UNITS['garden_gnome'];
      return [
        { id: 'pve_g1', unitId: 'garden_gnome', starLevel: 2, position: { x: 2, y: 0 }, items: [], currentHp: 900, maxHp: 900, currentMana: 0, maxMana: def.stats.maxMana },
        { id: 'pve_g2', unitId: 'garden_gnome', starLevel: 2, position: { x: 4, y: 0 }, items: [], currentHp: 900, maxHp: 900, currentMana: 0, maxMana: def.stats.maxMana },
        { id: 'pve_g3', unitId: 'garden_gnome', starLevel: 2, position: { x: 5, y: 0 }, items: [], currentHp: 900, maxHp: 900, currentMana: 0, maxMana: def.stats.maxMana },
      ];
    } else if (stage === 3) {
      // Stage 3-7: 4x Acromantulas
      const def = UNITS['acromantula_hatchling'];
      return [
        { id: 'pve_s1', unitId: 'acromantula_hatchling', starLevel: 2, position: { x: 1, y: 0 }, items: [], currentHp: 1100, maxHp: 1100, currentMana: 0, maxMana: def.stats.maxMana },
        { id: 'pve_s2', unitId: 'acromantula_hatchling', starLevel: 2, position: { x: 3, y: 0 }, items: [], currentHp: 1100, maxHp: 1100, currentMana: 0, maxMana: def.stats.maxMana },
        { id: 'pve_s3', unitId: 'acromantula_hatchling', starLevel: 2, position: { x: 5, y: 0 }, items: [], currentHp: 1100, maxHp: 1100, currentMana: 0, maxMana: def.stats.maxMana },
        { id: 'pve_s4', unitId: 'acromantula_hatchling', starLevel: 2, position: { x: 6, y: 0 }, items: [], currentHp: 1100, maxHp: 1100, currentMana: 0, maxMana: def.stats.maxMana },
      ];
    } else {
      // Stage 4-7+: 1 Boss + 2 Guardians
      const def = UNITS['acromantula_hatchling'];
      return [
        { id: 'pve_boss', unitId: 'acromantula_hatchling', starLevel: 3, position: { x: 4, y: 0 }, items: ['elder_wand'], currentHp: 3500, maxHp: 3500, currentMana: 0, maxMana: 100 },
        { id: 'pve_minion_1', unitId: 'garden_gnome', starLevel: 2, position: { x: 2, y: 0 }, items: [], currentHp: 1200, maxHp: 1200, currentMana: 0, maxMana: 90 },
        { id: 'pve_minion_2', unitId: 'garden_gnome', starLevel: 2, position: { x: 5, y: 0 }, items: [], currentHp: 1200, maxHp: 1200, currentMana: 0, maxMana: 90 },
      ];
    }
  }

  private generateArmoryChoices(stage: number): { components: string[]; units: string[] } {
    const baseItemKeys = Object.keys(BASE_ITEMS) as BaseItemId[];
    // Pick 5 random components
    const shuffledItems = [...baseItemKeys].sort(() => Math.random() - 0.5);
    const chosenComponents = shuffledItems.slice(0, 5);

    // Pick 8 units with stage-scaled costs
    // Stage 2: costs 1, 2, 3
    // Stage 3: costs 2, 3, 4
    // Stage 4: costs 3, 4, 5
    // Stage 5+: costs 4, 5
    let allowedCosts = [1, 2, 3];
    if (stage === 3) allowedCosts = [2, 3, 4];
    else if (stage === 4) allowedCosts = [3, 4, 5];
    else if (stage >= 5) allowedCosts = [4, 5];

    const eligibleUnits = Object.values(UNITS).filter(
      (u) => allowedCosts.includes(u.cost) && !['cornish_pixie', 'garden_gnome', 'acromantula_hatchling'].includes(u.id)
    );

    const shuffledUnits = [...eligibleUnits].sort(() => Math.random() - 0.5);
    const chosenUnits = shuffledUnits.slice(0, 8).map((u) => u.id);

    return {
      components: chosenComponents,
      units: chosenUnits,
    };
  }

  private executeBotArmoryChoice(bot: PlayerState): void {
    if (!bot.armoryChoices) return;
    if (!bot.armoryChoices.chosenComponent && bot.armoryChoices.components.length > 0) {
      const comp = bot.armoryChoices.components[0];
      const emptySlot = bot.itemBench.indexOf(null);
      if (emptySlot !== -1) bot.itemBench[emptySlot] = comp;
      bot.armoryChoices.chosenComponent = true;
    }
    if (!bot.armoryChoices.chosenUnit && bot.armoryChoices.units.length > 0) {
      const unitId = bot.armoryChoices.units[0];
      const emptyBench = bot.bench.indexOf(null);
      const def = UNITS[unitId];
      if (emptyBench !== -1 && def) {
        bot.bench[emptyBench] = {
          id: `unit_${bot.id}_armory_${Math.random().toString(36).substring(2, 6)}`,
          unitId,
          starLevel: 1,
          position: { x: emptyBench, y: 0 },
          items: [],
          currentHp: def.stats.hp[0],
          maxHp: def.stats.hp[0],
          currentMana: def.stats.startingMana,
          maxMana: def.stats.maxMana,
        };
        checkAndCombineUnits(bot);
      }
      bot.armoryChoices.chosenUnit = true;
    }
  }

  private transitionToCombat(): void {
    this.state.phase = 'COMBAT';
    this.state.phaseTimeRemaining = COMBAT_DURATION;
    this.state.phaseDuration = COMBAT_DURATION;
    this.state.combatResults = {};

    const activePlayers = Object.values(this.state.players).filter((p) => !p.isEliminated);

    // 1. Auto-fill board from bench for all active players
    for (const p of activePlayers) {
      this.autoFillBoardFromBench(p);
    }

    // 2. Determine PvE vs PvP mode
    const isPve = this.isCurrentRoundPve();
    this.state.isPveRound = isPve;

    if (isPve) {
      // PvE Creep Combat
      const pveCreeps = this.getPveCreeps(this.state.stage, this.state.roundInStage);

      for (const p of activePlayers) {
        const pUnits = this.getBoardUnits(p);
        p.opponentId = null;

        const sim = new CombatSimulator(
          p.id,
          'pve_creeps',
          pUnits,
          pveCreeps,
          p.activeTraits,
          [],
          this.state.stage
        );

        const result = sim.simulate();
        this.state.combatResults[p.id] = result;
        this.state.combatResults[`${p.id}_vs_pve`] = result;
      }
    } else {
      // PvP Combat
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
      const pairs: [PlayerState, PlayerState][] = [];

      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
          pairs.push([shuffled[i], shuffled[i + 1]]);
          shuffled[i].opponentId = shuffled[i + 1].id;
          shuffled[i + 1].opponentId = shuffled[i].id;
        } else {
          const ghostOpponent = shuffled[0];
          pairs.push([shuffled[i], ghostOpponent]);
          shuffled[i].opponentId = ghostOpponent.id;
        }
      }

      for (const p of activePlayers) {
        const opp = p.opponentId ? this.state.players[p.opponentId] : activePlayers[0];
        if (!opp) continue;

        const pUnits = this.getBoardUnits(p);
        const oppUnits = this.getBoardUnits(opp);

        const sim = new CombatSimulator(
          p.id,
          opp.id,
          pUnits,
          oppUnits,
          p.activeTraits,
          opp.activeTraits,
          this.state.stage
        );

        const result = sim.simulate();
        this.state.combatResults[p.id] = result;
        this.state.combatResults[`${p.id}_vs_${opp.id}`] = result;
      }
    }

    // Determine the duration of the longest battle in this round
    const durations = Object.values(this.state.combatResults).map(
      (r) => r.durationInSeconds || 15
    );
    this.maxCombatDuration = Math.max(3, Math.ceil(Math.max(...durations)));
  }

  private transitionToResolution(): void {
    this.state.phase = 'RESOLUTION';
    this.state.phaseTimeRemaining = RESOLUTION_DURATION;
    this.state.phaseDuration = RESOLUTION_DURATION;

    if (this.state.isPveRound) {
      // PvE resolution: compute rewards
      let compCount = 1;
      let goldBonus = 2;

      if (this.state.stage === 1) {
        compCount = this.pveRewards.stage1.components;
        // Last fight of Stage 1 (1-3) gives 1 gold instead of 2
        goldBonus = this.state.roundInStage === 3 ? 1 : this.pveRewards.stage1.gold;
      } else if (this.state.stage === 2) {
        compCount = this.pveRewards.stage2_7.components;
        goldBonus = this.pveRewards.stage2_7.gold;
      } else if (this.state.stage === 3) {
        compCount = this.pveRewards.stage3_7.components;
        goldBonus = this.pveRewards.stage3_7.gold;
      } else if (this.state.stage === 4) {
        compCount = this.pveRewards.stage4_7.components;
        goldBonus = this.pveRewards.stage4_7.gold;
      } else {
        compCount = this.pveRewards.stage5_7.components;
        goldBonus = this.pveRewards.stage5_7.gold;
      }

      const baseItemKeys = Object.keys(BASE_ITEMS) as BaseItemId[];

      for (const p of Object.values(this.state.players)) {
        if (p.isEliminated) continue;
        const res = this.state.combatResults[p.id];
        if (!res) continue;

        if (res.winner === 'home') {
          // PvE Victory: grant full bonus gold + component items
          p.gold += goldBonus;

          for (let i = 0; i < compCount; i++) {
            const emptySlot = p.itemBench.indexOf(null);
            if (emptySlot !== -1) {
              p.itemBench[emptySlot] = baseItemKeys[Math.floor(Math.random() * baseItemKeys.length)];
            } else {
              p.gold += 1;
            }
          }
        } else {
          // PvE Tie or Defeat: take damage and receive only partial consolation gold (no components)
          p.health = Math.max(0, p.health - (res.winner === 'tie' ? 2 : 4));
          p.gold += 1;
        }
      }
    } else {
      // PvP resolution per active player
      for (const p of Object.values(this.state.players)) {
        if (p.isEliminated) continue;
        const result = this.state.combatResults[p.id];
        if (!result) continue;

        if (result.winner === 'home') {
          // Player won their home battle: +1 Win Gold awarded instantly
          p.gold += 1;
          p.streak = p.streak >= 0 ? p.streak + 1 : 1;

          // Malfoy (3) Synergy Bonus: +2 Gold on win with a surviving Malfoy
          const malfoyTrait = p.activeTraits.find((t) => t.traitId === 'Malfoy');
          if (malfoyTrait && malfoyTrait.count >= 3) {
            const hasSurvivingMalfoy = Object.values(result.homeUnitSummaries).some((u) => {
              const def = UNITS[u.unitDefId];
              return def?.origins.includes('Malfoy') && u.survived;
            });
            if (hasSurvivingMalfoy) {
              p.gold += 2;
            }
          }
        } else if (result.winner === 'away') {
          // Player lost their home battle
          p.streak = p.streak <= 0 ? p.streak - 1 : -1;
          p.health = Math.max(0, p.health - result.damageToLoser);
        } else {
          // Tie: player takes damage and streaks reset
          const tieDamage = 2 + this.state.stage;
          p.health = Math.max(0, p.health - tieDamage);
          p.streak = 0;
        }
      }
    }

    // Handle Eliminations
    for (const p of Object.values(this.state.players)) {
      if (!p.isEliminated && p.health <= 0) {
        p.isEliminated = true;
        this.eliminatedCount++;
        p.placement = 8 - (this.eliminatedCount - 1);

        for (const row of p.board) {
          for (const u of row) {
            if (u) this.pool.returnToPool(u.unitId, u.starLevel);
          }
        }
        for (const u of p.bench) {
          if (u) this.pool.returnToPool(u.unitId, u.starLevel);
        }
      }
    }

    // Check for match winner
    const alivePlayers = Object.values(this.state.players).filter((p) => !p.isEliminated);
    if (alivePlayers.length === 1) {
      this.state.phase = 'GAME_OVER';
      this.state.winnerId = alivePlayers[0].id;
      alivePlayers[0].placement = 1;
    } else if (alivePlayers.length === 0) {
      this.state.phase = 'GAME_OVER';
    }

    this.updateLeaderboardOrder();
  }

  private transitionToPlanning(): void {
    this.state.phase = 'PLANNING';

    // Advance round & stage (Stage 1 has 3 rounds, Stage 2+ has 7 rounds)
    this.state.round++;
    this.state.roundInStage++;

    if (this.state.stage === 1 && this.state.roundInStage > 3) {
      this.state.stage = 2;
      this.state.roundInStage = 1;
    } else if (this.state.stage >= 2 && this.state.roundInStage > 7) {
      this.state.stage++;
      this.state.roundInStage = 1;
    }

    // Prep time duration: Round 1-1 is 6s, subsequent Stage 1 creep rounds (1-2, 1-3) are 18s, Stage 2+ is 30s
    const planningDuration =
      this.state.stage === 1
        ? this.state.roundInStage === 1
          ? 6
          : 18
        : PLANNING_DURATION;

    this.state.phaseTimeRemaining = planningDuration;
    this.state.phaseDuration = planningDuration;

    this.state.isPveRound = this.isCurrentRoundPve();
    this.state.isChoiceRound = this.isCurrentRoundChoice();

    // If Armory / Choice Round X-4, generate choices for all alive players
    if (this.state.isChoiceRound) {
      for (const p of Object.values(this.state.players)) {
        if (p.isEliminated) continue;
        const choices = this.generateArmoryChoices(this.state.stage);
        p.armoryChoices = {
          components: choices.components,
          units: choices.units,
          chosenComponent: false,
          chosenUnit: false,
        };
      }
    } else {
      for (const p of Object.values(this.state.players)) {
        p.armoryChoices = null;
      }
    }

    // Grant round income and refresh shops for alive players
    for (const p of Object.values(this.state.players)) {
      if (p.isEliminated) continue;

      const inc = calculateRoundIncome(this.state.stage, p.gold, p.streak);
      p.gold += inc.total;
      addPlayerXp(p, 2);

      // Star-combine check across full board & bench at start of planning
      checkAndCombineUnits(p, false);

      if (!p.shopLocked) {
        p.shopUnits = this.pool.drawShop(p.level, 5);
      } else {
        p.shopLocked = false;
      }
    }
  }

  public handleAction(playerId: string, action: ClientAction): void {
    const player = this.state.players[playerId];
    if (!player || player.isEliminated) return;

    if (action.type === 'START_GAME') {
      if (this.state.phase === 'LOBBY') {
        this.startGame();
      }
      return;
    }

    // Armory choices can be made in PLANNING
    if (action.type === 'CHOOSE_ARMORY_COMPONENT') {
      if (player.armoryChoices && !player.armoryChoices.chosenComponent) {
        const emptySlot = player.itemBench.indexOf(null);
        if (emptySlot !== -1) {
          player.itemBench[emptySlot] = action.componentId;
          player.armoryChoices.chosenComponent = true;
        }
      }
      this.broadcastState();
      return;
    }

    if (action.type === 'CHOOSE_ARMORY_UNIT') {
      if (player.armoryChoices && !player.armoryChoices.chosenUnit) {
        const emptyBench = player.bench.indexOf(null);
        const def = UNITS[action.unitId];
        if (emptyBench !== -1 && def) {
          player.bench[emptyBench] = {
            id: `unit_${playerId}_armory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            unitId: action.unitId,
            starLevel: 1,
            position: { x: emptyBench, y: 0 },
            items: [],
            currentHp: def.stats.hp[0],
            maxHp: def.stats.hp[0],
            currentMana: def.stats.startingMana,
            maxMana: def.stats.maxMana,
          };
          player.armoryChoices.chosenUnit = true;
          checkAndCombineUnits(player, this.state.phase === 'COMBAT');
        }
      }
      this.broadcastState();
      return;
    }

    // Moving units on/off the board is restricted to PLANNING phase, but bench-to-bench swapping is allowed during COMBAT
    if (action.type === 'MOVE_UNIT') {
      const isBenchToBench = action.from.area === 'bench' && action.to.area === 'bench';
      if (this.state.phase !== 'PLANNING' && !isBenchToBench) {
        return;
      }
    }

    switch (action.type) {
      case 'BUY_UNIT': {
        const unitId = player.shopUnits[action.shopSlot];
        if (!unitId) return;

        const def = UNITS[unitId];
        if (!def || player.gold < def.cost) return;

        const emptyBenchIdx = player.bench.indexOf(null);
        if (emptyBenchIdx === -1) return;

        player.gold -= def.cost;
        player.shopUnits[action.shopSlot] = null;

        const newUnit: BoardUnit = {
          id: `unit_${playerId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          unitId,
          starLevel: 1,
          position: { x: emptyBenchIdx, y: 0 },
          items: [],
          currentHp: def.stats.hp[0],
          maxHp: def.stats.hp[0],
          currentMana: def.stats.startingMana,
          maxMana: def.stats.maxMana,
        };

        player.bench[emptyBenchIdx] = newUnit;

        // If in COMBAT, only combine units on bench (don't disturb combat units)
        const isBenchOnly = this.state.phase === 'COMBAT';
        checkAndCombineUnits(player, isBenchOnly);
        break;
      }

      case 'SELL_UNIT': {
        // Disallow selling units on first turn (Round 1-1)
        if (this.state.stage === 1 && this.state.roundInStage === 1) {
          return;
        }

        const { source, x, y } = action;
        let unit: BoardUnit | null = null;

        if (source === 'board' && y !== undefined) {
          unit = player.board[y][x];
          player.board[y][x] = null;
        } else if (source === 'bench') {
          unit = player.bench[x];
          player.bench[x] = null;
        }

        if (!unit) return;

        const def = UNITS[unit.unitId];
        if (!def) return;

        const refundGold = def.cost * Math.pow(3, unit.starLevel - 1);
        player.gold += refundGold;

        // Return equipped items to item bench
        for (const itemKey of unit.items) {
          const emptySlot = player.itemBench.indexOf(null);
          if (emptySlot !== -1) {
            player.itemBench[emptySlot] = itemKey;
          }
        }

        this.pool.returnToPool(unit.unitId, unit.starLevel);
        player.activeTraits = calculateSynergies(player.board);
        break;
      }

      case 'MOVE_UNIT': {
        const { from, to } = action;
        let sourceUnit: BoardUnit | null = null;

        if (from.area === 'board' && from.y !== undefined) {
          sourceUnit = player.board[from.y][from.x];
        } else if (from.area === 'bench') {
          sourceUnit = player.bench[from.x];
        }

        if (!sourceUnit) return;

        let targetUnit: BoardUnit | null = null;
        if (to.area === 'board' && to.y !== undefined) {
          targetUnit = player.board[to.y][to.x];
        } else if (to.area === 'bench') {
          targetUnit = player.bench[to.x];
        }

        // Check board unit capacity limit if moving from bench to empty board tile
        if (from.area === 'bench' && to.area === 'board' && !targetUnit) {
          const currentBoardCount = this.getBoardUnits(player).length;
          if (currentBoardCount >= player.level) {
            return;
          }
        }

        // Clear source
        if (from.area === 'board' && from.y !== undefined) {
          player.board[from.y][from.x] = targetUnit;
          if (targetUnit) targetUnit.position = { x: from.x, y: from.y };
        } else {
          player.bench[from.x] = targetUnit;
          if (targetUnit) targetUnit.position = { x: from.x, y: 0 };
        }

        // Set target
        if (to.area === 'board' && to.y !== undefined) {
          player.board[to.y][to.x] = sourceUnit;
          sourceUnit.position = { x: to.x, y: to.y };
        } else {
          player.bench[to.x] = sourceUnit;
          sourceUnit.position = { x: to.x, y: 0 };
        }

        player.activeTraits = calculateSynergies(player.board);
        break;
      }

      case 'BUY_XP': {
        if (player.gold >= XP_COST && player.level < 9) {
          player.gold -= XP_COST;
          addPlayerXp(player, XP_GAIN);
        }
        break;
      }

      case 'REROLL_SHOP': {
        if (player.gold >= REROLL_COST) {
          player.gold -= REROLL_COST;
          player.shopUnits = this.pool.drawShop(player.level, 5);
        }
        break;
      }

      case 'LOCK_SHOP': {
        player.shopLocked = !player.shopLocked;
        break;
      }

      case 'EQUIP_ITEM': {
        const itemKey = player.itemBench[action.itemSlot];
        if (!itemKey) return;

        // 1. Direct item bench interaction (drag item onto another item slot to combine or move)
        if (action.target.area === 'item_bench') {
          const targetSlot = action.target.x;
          if (targetSlot === action.itemSlot || targetSlot < 0 || targetSlot >= 10) return;
          const targetItemKey = player.itemBench[targetSlot];

          if (!targetItemKey) {
            player.itemBench[targetSlot] = itemKey;
            player.itemBench[action.itemSlot] = null;
          } else if (BASE_ITEMS[targetItemKey as BaseItemId] && BASE_ITEMS[itemKey as BaseItemId]) {
            const combined = combineItems(targetItemKey, itemKey);
            if (combined) {
              player.itemBench[targetSlot] = combined.id;
              player.itemBench[action.itemSlot] = null;
            }
          }
          break;
        }

        // 2. Equip or combine onto a unit (board or bench) - allowed during COMBAT or PLANNING
        let targetUnit: BoardUnit | null = null;
        if (action.target.area === 'board' && action.target.y !== undefined) {
          targetUnit = player.board[action.target.y][action.target.x];
        } else if (action.target.area === 'bench') {
          targetUnit = player.bench[action.target.x];
        }

        if (!targetUnit) return;

        if (targetUnit.items.length === 1 && BASE_ITEMS[targetUnit.items[0] as BaseItemId] && BASE_ITEMS[itemKey as BaseItemId]) {
          const combined = combineItems(targetUnit.items[0], itemKey);
          if (combined) {
            targetUnit.items = [combined.id];
            player.itemBench[action.itemSlot] = null;
            break;
          }
        }

        if (targetUnit.items.length < 3) {
          targetUnit.items.push(itemKey);
          player.itemBench[action.itemSlot] = null;
        }
        break;
      }

      case 'SURRENDER':
      case 'FORFEIT': {
        if (player.isEliminated) break;
        player.isEliminated = true;
        player.health = 0;
        this.eliminatedCount++;
        player.placement = 8 - (this.eliminatedCount - 1);

        // Return player's champions to the shared pool
        for (const row of player.board) {
          for (const u of row) {
            if (u) this.pool.returnToPool(u.unitId, u.starLevel);
          }
        }
        for (const u of player.bench) {
          if (u) this.pool.returnToPool(u.unitId, u.starLevel);
        }

        // Clear player board and bench
        player.board = Array(4).fill(null).map(() => Array(8).fill(null));
        player.bench = Array(9).fill(null);
        player.activeTraits = [];

        // Check if only 1 active player remains
        const activeRemaining = Object.values(this.state.players).filter((p) => !p.isEliminated);
        if (activeRemaining.length <= 1) {
          this.state.phase = 'GAME_OVER';
          this.state.winnerId = activeRemaining.length === 1 ? activeRemaining[0].id : player.id;
        }
        break;
      }
    }

    this.updateLeaderboardOrder();
    this.broadcastState();
  }

  private getBoardUnits(player: PlayerState): BoardUnit[] {
    const units: BoardUnit[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const u = player.board[r][c];
        if (u) units.push(u);
      }
    }
    return units;
  }

  private updateLeaderboardOrder(): void {
    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => {
        if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
        return b.health - a.health;
      })
      .map((p) => p.id);
  }

  private createPlayerState(id: string, name: string, isBot: boolean): PlayerState {
    return {
      id,
      name,
      isBot,
      health: 100,
      gold: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: XP_TO_LEVEL[1],
      streak: 0,
      board: Array(4)
        .fill(null)
        .map(() => Array(8).fill(null)),
      bench: Array(9).fill(null),
      itemBench: Array(10).fill(null),
      shopUnits: Array(5).fill(null),
      shopLocked: false,
      activeTraits: [],
      isEliminated: false,
      placement: 0,
      opponentId: null,
      armoryChoices: null,
    };
  }

  private sendStateTo(playerId: string): void {
    const ws = this.clients.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: this.state }));
    }
  }

  public broadcastState(): void {
    const payload = JSON.stringify({ type: 'STATE_UPDATE', state: this.state });
    for (const ws of this.clients.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}
