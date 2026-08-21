import { BoardUnit } from './unit.js';
import { ActiveTraitInfo } from './synergy.js';
import { CombatResult } from './combat.js';

export type GamePhase = 'LOBBY' | 'PLANNING' | 'COMBAT' | 'RESOLUTION' | 'GAME_OVER';

export interface ArmoryChoiceState {
  components: string[]; // 5 random base component IDs
  units: string[];      // 8 random unit IDs
  chosenComponent: boolean;
  chosenUnit: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  health: number; // 0 - 100
  gold: number;
  level: number;  // 1 - 9
  xp: number;     // 0 to XP_REQUIRED[level]
  xpToNextLevel: number;
  streak: number; // >0 win streak, <0 loss streak, 0 none
  board: (BoardUnit | null)[][]; // 4 rows x 8 cols (player side)
  bench: (BoardUnit | null)[];   // 9 slots
  itemBench: (string | null)[];  // 10 slots
  shopUnits: (string | null)[];  // 5 slots (unit definition IDs)
  shopLocked: boolean;
  activeTraits: ActiveTraitInfo[];
  isEliminated: boolean;
  placement: number; // 1 to 8 (set upon elimination or victory)
  opponentId: string | null;
  armoryChoices?: ArmoryChoiceState | null;
}

export interface MatchState {
  matchId: string;
  round: number;
  stage: number;
  roundInStage: number;
  isPveRound: boolean;
  isChoiceRound?: boolean;
  phase: GamePhase;
  phaseTimeRemaining: number; // seconds
  phaseDuration: number;      // total seconds for this phase
  players: Record<string, PlayerState>;
  playerOrder: string[];      // player IDs in leaderboard order
  combatResults: Record<string, CombatResult>; // keyed by matchupId (e.g. "playerA_vs_playerB")
  winnerId: string | null;
}

// Client action payloads sent over WebSocket
export type ClientAction =
  | { type: 'BUY_UNIT'; shopSlot: number }
  | { type: 'SELL_UNIT'; source: 'board' | 'bench'; x: number; y?: number }
  | { type: 'MOVE_UNIT'; from: { area: 'board' | 'bench'; x: number; y?: number }; to: { area: 'board' | 'bench'; x: number; y?: number } }
  | { type: 'BUY_XP' }
  | { type: 'REROLL_SHOP' }
  | { type: 'LOCK_SHOP' }
  | { type: 'EQUIP_ITEM'; itemSlot: number; target: { area: 'board' | 'bench' | 'item_bench'; x: number; y?: number } }
  | { type: 'CHOOSE_ARMORY_COMPONENT'; componentId: string }
  | { type: 'CHOOSE_ARMORY_UNIT'; unitId: string }
  | { type: 'START_GAME' }
  | { type: 'SURRENDER' }
  | { type: 'FORFEIT' };
