import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { UNITS, TRAITS, SHOP_ODDS, XP_COST, REROLL_COST, calculateStreakBonus } from '@autobattler/shared';
import { RefreshCw, Zap, Lock, Unlock, Coins, Info, Flame, Snowflake, TrendingUp, HelpCircle, Trash2 } from 'lucide-react';
import { InspectedUnitData } from './UnitInspector';
import { getUnitPortraitUrl, getUnitIcon } from '../../render/unit-assets.js';

function getOwnedUnitStatus(player: any, unitDefId: string): { totalCopies: number; label: string; isCloseToUpgrade: boolean } {
  let count1 = 0;
  let count2 = 0;
  let count3 = 0;

  for (const u of player.bench) {
    if (u && u.unitId === unitDefId) {
      if (u.starLevel === 1) count1++;
      else if (u.starLevel === 2) count2++;
      else if (u.starLevel === 3) count3++;
    }
  }

  for (const row of player.board) {
    for (const u of row) {
      if (u && u.unitId === unitDefId) {
        if (u.starLevel === 1) count1++;
        else if (u.starLevel === 2) count2++;
        else if (u.starLevel === 3) count3++;
      }
    }
  }

  const totalCopies = count1 + count2 * 3 + count3 * 9;
  if (totalCopies === 0) {
    return { totalCopies: 0, label: '', isCloseToUpgrade: false };
  }

  if (count3 > 0) {
    return { totalCopies, label: '3★ (Max)', isCloseToUpgrade: false };
  }

  if (count2 === 0) {
    if (count1 === 1) return { totalCopies, label: '1/3 ★', isCloseToUpgrade: false };
    if (count1 === 2) return { totalCopies, label: '2/3 ★ (1 away!)', isCloseToUpgrade: true };
  } else if (count2 === 1) {
    if (count1 === 0) return { totalCopies, label: '1x 2★', isCloseToUpgrade: false };
    if (count1 === 1) return { totalCopies, label: '2★ (1/3)', isCloseToUpgrade: false };
    if (count1 === 2) return { totalCopies, label: '2★ (2/3 - 1 away!)', isCloseToUpgrade: true };
  } else if (count2 === 2) {
    if (count1 === 0) return { totalCopies, label: '2x 2★', isCloseToUpgrade: false };
    if (count1 === 1) return { totalCopies, label: '2x 2★ (1/3)', isCloseToUpgrade: false };
    if (count1 === 2) return { totalCopies, label: '3★ READY! (1 away)', isCloseToUpgrade: true };
  }

  return { totalCopies, label: `${totalCopies} Owned`, isCloseToUpgrade: false };
}

export const ShopTray: React.FC<{
  onInspectUnit?: (data: InspectedUnitData) => void;
  activeDraggedUnit?: {
    unit?: any;
    source: 'board' | 'bench';
    x: number;
    y?: number;
    refundGold: number;
  } | null;
  onClearDraggedUnit?: () => void;
}> = ({ onInspectUnit, activeDraggedUnit, onClearDraggedUnit }) => {
  const { matchState, playerId, sendAction } = useGameSocket();
  const [showGoldTooltip, setShowGoldTooltip] = useState(false);
  const [isSellHovered, setIsSellHovered] = useState(false);

  if (!matchState) return null;

  const player = matchState.players[playerId];
  if (!player || player.isEliminated) return null;

  // Round 1-1: Shop is locked during opening duel, maintaining stable HUD height
  if (matchState.stage === 1 && matchState.roundInStage === 1) {
    return (
      <div id="shop-tray-area" className="w-full max-w-7xl mx-auto px-4 pb-2 pt-1">
        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 shadow-xl flex items-center justify-between h-[126px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-slate-900/30 to-indigo-500/5 pointer-events-none" />
          <div className="flex items-center gap-3.5 z-10 px-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-200 font-fantasy tracking-wide">
                Shop Opens in Round 1-2
              </span>
              <span className="text-xs text-slate-400 mt-0.5">
                Defeat the opening minion wave to unlock your gold income, champion shop, and rerolls!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 z-10 px-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Current Gold:</span>
              <strong className="text-amber-400 text-sm font-black">{player.gold}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const odds = SHOP_ODDS[player.level] || SHOP_ODDS[1];
  const nextOdds = player.level < 10 ? SHOP_ODDS[player.level + 1] : null;
  const interestGold = Math.min(5, Math.floor(player.gold / 10));

  // Economic calculations for next round
  const baseIncome = matchState.stage <= 1 ? 3 : matchState.stage === 2 ? 4 : 5;
  const nextWinStreak = player.streak >= 0 ? player.streak + 1 : 1;
  const winStreakBonus = calculateStreakBonus(nextWinStreak);
  const pvpWinGold = matchState.isPveRound ? 0 : 1;
  const interestIfWin = Math.min(5, Math.floor((player.gold + pvpWinGold) / 10));
  const totalIfWin = baseIncome + interestIfWin + pvpWinGold + winStreakBonus;

  const nextLossStreak = player.streak <= 0 ? player.streak - 1 : -1;
  const lossStreakBonus = calculateStreakBonus(nextLossStreak);
  const interestIfLose = Math.min(5, Math.floor(player.gold / 10));
  const totalIfLose = baseIncome + interestIfLose + lossStreakBonus;

  const handleBuy = (slotIndex: number) => {
    sendAction({ type: 'BUY_UNIT', shopSlot: slotIndex });
  };

  const handleReroll = () => {
    sendAction({ type: 'REROLL_SHOP' });
  };

  const handleBuyXp = () => {
    sendAction({ type: 'BUY_XP' });
  };

  const handleLock = () => {
    sendAction({ type: 'LOCK_SHOP' });
  };

  const costStyles: Record<
    number,
    { border: string; banner: string; glow: string; text: string }
  > = {
    1: {
      border: 'border-slate-600/90',
      banner: 'bg-slate-800/95 text-slate-100',
      glow: 'hover:border-slate-400 hover:shadow-slate-700/30',
      text: 'text-slate-200',
    },
    2: {
      border: 'border-emerald-600/90',
      banner: 'bg-emerald-800/95 text-emerald-100',
      glow: 'hover:border-emerald-400 hover:shadow-emerald-950/50',
      text: 'text-emerald-300',
    },
    3: {
      border: 'border-blue-600/90',
      banner: 'bg-blue-800/95 text-blue-100',
      glow: 'hover:border-blue-400 hover:shadow-blue-950/50',
      text: 'text-blue-300',
    },
    4: {
      border: 'border-purple-600/90',
      banner: 'bg-purple-800/95 text-purple-100',
      glow: 'hover:border-purple-400 hover:shadow-purple-950/50',
      text: 'text-purple-300',
    },
    5: {
      border: 'border-amber-500',
      banner: 'bg-amber-700/95 text-amber-100',
      glow: 'hover:border-amber-300 hover:shadow-amber-500/30',
      text: 'text-amber-300',
    },
  };

  const xpProgress =
    player.level >= 9
      ? 100
      : Math.min(100, (player.xp / (player.xpToNextLevel || 1)) * 100);

  return (
    <div className="w-full bg-slate-950/98 backdrop-blur border-t border-slate-800 p-3 flex flex-col gap-2 z-20 shadow-2xl">
      {/* Top Shop Bar: Left Econ Info & Right Odds/Lock */}
      <div className="flex items-center justify-between px-1 text-xs">
        {/* Bottom-Left: Level, Gold, Streak, and Interest */}
        <div className="flex items-center gap-4">
          {/* Level & XP Gauge */}
          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="font-extrabold text-slate-100">
              Lvl {player.level}
            </span>
            <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-indigo-300 font-bold">
              {player.level >= 10 ? 'MAX' : `${player.xp}/${player.xpToNextLevel} XP`}
            </span>
          </div>

          {/* Gold Counter with Detailed Expected Income Tooltip on Hover */}
          <div className="relative flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 cursor-help group">
            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="font-mono text-amber-300 font-extrabold">
              {player.gold}g
            </span>
            <span className="text-[10px] text-amber-400/70 font-normal">
              (+{interestGold} int)
            </span>

            {/* Floating Gold Hover Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-950/98 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl shadow-black z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-2.5 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Income Breakdown
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Current: {player.gold}g
                </span>
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Income:</span>
                  <span className="font-mono text-slate-200">+{baseIncome}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest (1g per 10g, max 5g):</span>
                  <span className="font-mono text-amber-300">+{interestGold}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Streak Bonus:</span>
                  <span className="font-mono text-indigo-300">+{calculateStreakBonus(player.streak)}g</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800 text-[11px]">
                {/* Win Outcome */}
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>If You Win This Round:</span>
                    <span className="text-sm font-mono font-black">+{totalIfWin}g</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/80 flex items-center justify-between">
                    <span>
                      {baseIncome} base + {interestIfWin} int {pvpWinGold > 0 ? '+ 1 win' : ''}{' '}
                      {winStreakBonus > 0 ? `+ ${winStreakBonus} streak` : ''}
                    </span>
                    <span>({nextWinStreak} streak)</span>
                  </div>
                </div>

                {/* Loss Outcome */}
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span>If You Lose This Round:</span>
                    <span className="text-sm font-mono font-black">+{totalIfLose}g</span>
                  </div>
                  <div className="text-[10px] text-rose-400/80 flex items-center justify-between">
                    <span>
                      {baseIncome} base + {interestIfLose} int{' '}
                      {lossStreakBonus > 0 ? `+ ${lossStreakBonus} streak` : '+ 0 streak'}
                    </span>
                    <span>({Math.abs(nextLossStreak)} streak)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Indicator with Hover Breakdown Tooltip */}
          {player.streak !== 0 && (
            <div
              className={`relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-help group ${
                player.streak > 0
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                  : 'bg-blue-950/60 text-blue-400 border border-blue-500/40'
              }`}
            >
              {player.streak > 0 ? (
                <>
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{player.streak} Win Streak</span>
                </>
              ) : (
                <>
                  <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                  <span>{Math.abs(player.streak)} Loss Streak</span>
                </>
              )}

              {/* Floating Streak Hover Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0e1a] border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-black z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    {player.streak > 0 ? (
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    Streak Gold Bonus
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    +{calculateStreakBonus(player.streak)}g / round
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[10px] text-slate-300">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                    <span className="text-slate-400">1 Streak:</span>
                    <span className="font-mono text-slate-400">+0g (No bonus)</span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-0.5 border-b border-slate-800/50 ${
                      Math.abs(player.streak) >= 2 && Math.abs(player.streak) <= 3
                        ? 'text-amber-300 font-bold'
                        : ''
                    }`}
                  >
                    <span className="text-slate-400">2–3 Streak:</span>
                    <span className="font-mono text-amber-400">+1g per round</span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-0.5 border-b border-slate-800/50 ${
                      Math.abs(player.streak) === 4 ? 'text-amber-300 font-bold' : ''
                    }`}
                  >
                    <span className="text-slate-400">4 Streak:</span>
                    <span className="font-mono text-amber-400">+2g per round</span>
                  </div>
                  <div
                    className={`flex justify-between items-center py-0.5 ${
                      Math.abs(player.streak) >= 5 ? 'text-amber-300 font-bold' : ''
                    }`}
                  >
                    <span className="text-slate-400">5+ Streak:</span>
                    <span className="font-mono text-amber-400">+3g per round</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1">
                  <div className="flex justify-between text-emerald-400">
                    <span>Next win:</span>
                    <span className="font-mono font-bold">
                      +{winStreakBonus}g ({nextWinStreak} streak)
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Next loss:</span>
                    <span className="font-mono font-bold">
                      +{lossStreakBonus}g ({Math.abs(nextLossStreak)} streak)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Shop Odds Matrix & Lock Button */}
        <div className="flex items-center gap-4">
          {/* Odds Matrix */}
          <div className="flex items-center gap-2.5 bg-[#0a0e1a] px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-medium">
            <span className="text-slate-400 font-semibold">Shop Odds:</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-slate-300">{Math.round(odds[1] * 100)}%</span>
              <span className="text-emerald-400">{Math.round(odds[2] * 100)}%</span>
              <span className="text-blue-400">{Math.round(odds[3] * 100)}%</span>
              <span className="text-purple-400">{Math.round(odds[4] * 100)}%</span>
              <span className="text-amber-400">{Math.round(odds[5] * 100)}%</span>
            </div>
          </div>

          {/* Lock Shop Button */}
          <button
            onClick={handleLock}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition shadow-sm ${
              player.shopLocked
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {player.shopLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{player.shopLocked ? 'Locked' : 'Lock Shop'}</span>
          </button>
        </div>
      </div>

      {/* Main Shop Container */}
      <div className="flex items-stretch gap-3">
        {/* Left Action Buttons: Reroll & Buy XP with [F] and [D] Shortcuts */}
        <div className="flex flex-col gap-2 w-44">
          <div className="relative flex-1 group/xp">
            <button
              onClick={handleBuyXp}
              disabled={player.gold < XP_COST || player.level >= 10}
              className="w-full h-full bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl p-2.5 flex items-center justify-between border border-indigo-500/50 shadow font-bold text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-200" />
                <div className="flex items-center gap-1">
                  <span>Buy XP</span>
                  <span className="text-[10px] font-mono bg-indigo-900/80 px-1 rounded text-indigo-200 border border-indigo-400/30">
                    F
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-mono text-xs">
                <span>{XP_COST}</span>
                <Coins className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Next Level Shop Odds Comparison Tooltip */}
            {nextOdds && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0e1a] border border-indigo-500/40 rounded-xl p-2.5 shadow-2xl shadow-black z-[9999] opacity-0 group-hover/xp:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-xs font-bold text-indigo-300">
                  <span>Next Level ({player.level + 1}) Shop Odds</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-mono font-bold">
                  <div className="flex flex-col">
                    <span className="text-slate-400">$1</span>
                    <span className="text-slate-200">{Math.round(nextOdds[1] * 100)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-emerald-400">$2</span>
                    <span className="text-emerald-300">{Math.round(nextOdds[2] * 100)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-blue-400">$3</span>
                    <span className="text-blue-300">{Math.round(nextOdds[3] * 100)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-purple-400">$4</span>
                    <span className="text-purple-300">{Math.round(nextOdds[4] * 100)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-amber-400">$5</span>
                    <span className="text-amber-300">{Math.round(nextOdds[5] * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReroll}
            disabled={player.gold < REROLL_COST}
            className="flex-1 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-xl p-2.5 flex items-center justify-between border border-slate-600 shadow font-bold text-xs transition active:scale-95 group"
          >
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-slate-300" />
              <div className="flex items-center gap-1">
                <span>Reroll</span>
                <span className="text-[10px] font-mono bg-slate-900/80 px-1 rounded text-slate-300 border border-slate-500/30">
                  D
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-mono text-xs">
              <span>{REROLL_COST}</span>
              <Coins className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* 5 Champion Cards OR Sell Unit Drop Zone */}
        {activeDraggedUnit ? (
          <div
            id="shop-sell-drop-zone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsSellHovered(true);
            }}
            onDragLeave={() => setIsSellHovered(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsSellHovered(false);
              sendAction({
                type: 'SELL_UNIT',
                source: activeDraggedUnit.source,
                x: activeDraggedUnit.x,
                y: activeDraggedUnit.y,
              });
              onClearDraggedUnit?.();
            }}
            onPointerUp={() => {
              setIsSellHovered(false);
              sendAction({
                type: 'SELL_UNIT',
                source: activeDraggedUnit.source,
                x: activeDraggedUnit.x,
                y: activeDraggedUnit.y,
              });
              onClearDraggedUnit?.();
            }}
            className={`flex-1 h-32 rounded-xl border-2 flex items-center justify-center gap-4 transition-all duration-150 shadow-2xl cursor-pointer ${
              isSellHovered
                ? 'border-red-500 bg-red-950/90 text-red-100 scale-[1.01] ring-4 ring-red-500/50'
                : 'border-red-500/80 bg-slate-900/95 text-red-300 animate-pulse'
            }`}
          >
            <Trash2 className="w-8 h-8 text-red-400 animate-bounce" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-base font-black tracking-wide">
                <span>SELL UNIT FOR</span>
                <span className="text-amber-400 font-mono flex items-center text-lg drop-shadow">
                  <Coins className="w-5 h-5 mr-1" />
                  {activeDraggedUnit.refundGold} GOLD
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Drop here or press [E] while hovering any unit</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-5 gap-2.5">
            {player.shopUnits.map((unitId, idx) => {
              if (!unitId) {
                return (
                  <div
                    key={idx}
                    className="h-32 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-xs text-slate-600 font-semibold"
                  >
                    Sold
                  </div>
                );
              }

              const def = UNITS[unitId];
              if (!def) return null;

              const style = costStyles[def.cost] || costStyles[1];
              const canAfford = player.gold >= def.cost;
              const portraitUrl = getUnitPortraitUrl(unitId);
              const ownedInfo = getOwnedUnitStatus(player, unitId);

              return (
                <div
                  key={`${unitId}_${idx}`}
                  onClick={() => canAfford && handleBuy(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onInspectUnit?.({ unitDefId: unitId });
                  }}
                  className={`h-32 rounded-xl border-2 ${style.border} ${style.glow} flex flex-col justify-between cursor-pointer transition-all duration-150 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 group relative overflow-hidden select-none ${
                    !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : ''
                  }`}
                  title={`${def.name} ($${def.cost}) - Click to Buy, Right-Click to Inspect`}
                >
                  {/* Hero Portrait Background */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
                    <img
                      src={portraitUrl}
                      alt={def.name}
                      className="w-full h-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Dark gradient vignettes for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/25 pointer-events-none" />
                  </div>

                  {/* Top: Traits Column on the Left & Scaling / Quick Inspect on Right */}
                  <div className="relative z-10 flex items-start justify-between p-1.5 min-h-0">
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      {def.origins.map((o) => {
                        const tr = TRAITS[o];
                        const isActive = player.activeTraits.some((t) => t.traitId === o && t.activeTier > 0);
                        return (
                          <div
                            key={o}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] leading-none font-semibold truncate shadow-sm backdrop-blur-md transition ${
                              isActive
                                ? 'bg-amber-950/90 border border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                                : 'bg-black/80 border border-slate-700/60 text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] leading-none">{tr?.icon || '🏛️'}</span>
                            <span className="truncate">{o}</span>
                          </div>
                        );
                      })}
                      {def.classes.map((c) => {
                        const tr = TRAITS[c];
                        const isActive = player.activeTraits.some((t) => t.traitId === c && t.activeTier > 0);
                        return (
                          <div
                            key={c}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] leading-none font-semibold truncate shadow-sm backdrop-blur-md transition ${
                              isActive
                                ? 'bg-indigo-950/90 border border-indigo-400 text-indigo-200 ring-1 ring-indigo-400/50'
                                : 'bg-black/80 border border-slate-700/60 text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] leading-none">{tr?.icon || '⚔️'}</span>
                            <span className="truncate">{c}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Owned Status Badge and Quick Inspect */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {ownedInfo.label ? (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border backdrop-blur-md shadow leading-tight ${
                            ownedInfo.isCloseToUpgrade
                              ? 'bg-amber-500 text-slate-950 border-amber-300 font-black animate-pulse'
                              : 'bg-slate-900/90 text-slate-200 border-slate-600'
                          }`}
                        >
                          {ownedInfo.label}
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border backdrop-blur-md shadow leading-tight ${
                            def.ability.damageType === 'magic'
                              ? 'bg-cyan-950/85 text-cyan-300 border-cyan-500/50'
                              : def.ability.damageType === 'true'
                              ? 'bg-fuchsia-950/85 text-fuchsia-300 border-fuchsia-500/50'
                              : 'bg-amber-950/85 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          {def.ability.damageType === 'magic' ? '✨ AP' : def.ability.damageType === 'true' ? '⚡ True' : '⚔️ AD'}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectUnit?.({ unitDefId: unitId });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-white bg-black/70 hover:bg-black/90 rounded-md border border-slate-700 transition shrink-0"
                        title="Inspect Unit"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Cost Banner: Fixed Height & shrink-0 */}
                  <div className={`relative z-10 h-7 shrink-0 ${style.banner} px-2 flex items-center justify-between border-t border-black/50`}>
                    <span className="text-xs font-black text-white tracking-wide truncate drop-shadow-md">
                      {def.name}
                    </span>
                    <div className="flex items-center gap-1 text-amber-300 font-mono font-black text-xs shrink-0 drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>{def.cost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
