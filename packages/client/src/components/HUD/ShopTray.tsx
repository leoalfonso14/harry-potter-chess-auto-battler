import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { UNITS, SHOP_ODDS, XP_COST, REROLL_COST, calculateStreakBonus } from '@autobattler/shared';
import { RefreshCw, Zap, Lock, Unlock, Coins, Info, Flame, Snowflake, TrendingUp, HelpCircle, Trash2 } from 'lucide-react';
import { InspectedUnitData } from './UnitInspector';

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
    { border: string; bg: string; badge: string; text: string }
  > = {
    1: {
      border: 'border-slate-600',
      bg: 'bg-slate-900/90',
      badge: 'bg-slate-700 text-slate-200',
      text: 'text-slate-200',
    },
    2: {
      border: 'border-emerald-500/70',
      bg: 'bg-emerald-950/40',
      badge: 'bg-emerald-800 text-emerald-100',
      text: 'text-emerald-300',
    },
    3: {
      border: 'border-blue-500/70',
      bg: 'bg-blue-950/40',
      badge: 'bg-blue-800 text-blue-100',
      text: 'text-blue-300',
    },
    4: {
      border: 'border-purple-500/70',
      bg: 'bg-purple-950/40',
      badge: 'bg-purple-800 text-purple-100',
      text: 'text-purple-300',
    },
    5: {
      border: 'border-amber-500/80',
      bg: 'bg-amber-950/40',
      badge: 'bg-amber-800 text-amber-100',
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
          <div className="relative flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-3 py-1 rounded-lg shadow-inner cursor-help group">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-base font-extrabold font-mono text-amber-300">
              {player.gold}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">
              (+{interestGold} Interest)
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
          <button
            onClick={handleBuyXp}
            disabled={player.gold < XP_COST || player.level >= 10}
            className="flex-1 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl p-2.5 flex items-center justify-between border border-indigo-500/50 shadow font-bold text-xs transition active:scale-95 group"
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
            className={`flex-1 h-28 rounded-xl border-2 flex items-center justify-center gap-4 transition-all duration-150 shadow-2xl cursor-pointer ${
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
                    className="h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-xs text-slate-600"
                  >
                    Sold
                  </div>
                );
              }

              const def = UNITS[unitId];
              if (!def) return null;

              const style = costStyles[def.cost];
              const canAfford = player.gold >= def.cost;

              return (
                <div
                  key={`${unitId}_${idx}`}
                  onClick={() => canAfford && handleBuy(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onInspectUnit?.({ unitDefId: unitId });
                  }}
                  className={`h-28 rounded-xl border ${style.border} ${style.bg} p-2 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg active:scale-95 group relative ${
                    !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  {/* Header: Name and Cost */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold truncate ${style.text}`}>
                        {def.name}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {def.origins.map((o) => (
                          <span key={o} className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded">
                            {o}
                          </span>
                        ))}
                        {def.classes.map((c) => (
                          <span key={c} className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectUnit?.({ unitDefId: unitId });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-white bg-slate-800 rounded transition"
                        title="Inspect Unit Stats"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-0.5 text-amber-300 font-extrabold font-mono text-xs bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded">
                        <span>{def.cost}</span>
                        <Coins className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Footer: Ability snippet */}
                  <div className="text-[10px] text-slate-400 line-clamp-1 border-t border-slate-800/80 pt-1">
                    <span className="font-semibold text-slate-300">{def.ability.name}:</span> {def.ability.description}
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
