import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { Bot, Eye, Flame, Skull, Snowflake, Swords, User, Activity, Users, Heart, Shield } from 'lucide-react';
import { UNITS, ALL_ITEMS } from '@autobattler/shared';

export const RightSidebar: React.FC<{
  viewingPlayerId?: string;
  onSelectPlayer?: (pId: string) => void;
}> = ({ viewingPlayerId, onSelectPlayer }) => {
  const { matchState, playerId, activeCombatResult } = useGameSocket();
  const [activeTab, setActiveTab] = useState<'players' | 'damage'>('players');

  if (!matchState) return null;

  const currentOpponentId = matchState.players[playerId]?.opponentId;
  const activeViewingId = viewingPlayerId || playerId;

  // Combat recap summaries
  const isHome = activeCombatResult?.homePlayerId === activeViewingId;
  const summaries = activeCombatResult
    ? isHome
      ? activeCombatResult.homeUnitSummaries
      : activeCombatResult.awayUnitSummaries
    : {};

  const unitList = Object.values(summaries || {}).sort((a, b) => b.damageDealt - a.damageDealt);
  const maxDamage = Math.max(1, ...unitList.map((u) => u.damageDealt));

  return (
    <aside className="w-60 bg-slate-950/95 backdrop-blur border-l border-slate-800 flex flex-col z-20 select-none overflow-hidden">
      {/* Top Tab Bar: Players vs Combat Stats */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-1">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'players'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Players</span>
        </button>

        <button
          onClick={() => setActiveTab('damage')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'damage'
              ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Combat Stats</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-2.5 overflow-y-auto scrollbar-thin">
        {activeTab === 'players' ? (
          /* Players List */
          <div className="flex flex-col gap-1.5">
            {matchState.playerOrder.map((pId) => {
              const p = matchState.players[pId];
              if (!p) return null;

              const isMe = pId === playerId;
              const isViewing = pId === activeViewingId;
              const isOpponent = pId === currentOpponentId && matchState.phase === 'COMBAT';
              const hpPercent = Math.max(0, Math.min(100, p.health));

              return (
                <div
                  key={pId}
                  onClick={() => onSelectPlayer?.(pId)}
                  title={isMe ? 'Your Board (Click or hit Spacebar to return)' : `Click to scout ${p.name}`}
                  className={`p-2 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer transform hover:-translate-x-0.5 ${
                    isViewing && !isMe
                      ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/60 shadow-lg shadow-amber-950'
                      : isMe
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-950'
                      : isOpponent
                      ? 'border-red-500/80 bg-red-950/40 shadow-sm shadow-red-950'
                      : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700'
                  } ${p.isEliminated ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                >
                  {/* Header: Name, Bot tag, Opponent indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isViewing && !isMe ? (
                        <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      ) : p.isBot ? (
                        <Bot className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-bold truncate ${
                          isViewing && !isMe
                            ? 'text-amber-300'
                            : isMe
                            ? 'text-indigo-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {p.name} {isMe ? '(You)' : ''}
                      </span>
                    </div>

                    {/* Status or Streak */}
                    {p.isEliminated ? (
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5 shrink-0">
                        <Skull className="w-3 h-3" /> #{p.placement}
                      </span>
                    ) : isOpponent ? (
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5 animate-pulse shrink-0">
                        <Swords className="w-3 h-3" /> VS
                      </span>
                    ) : p.streak !== 0 ? (
                      <span className="text-[10px] font-mono-stat font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                        {p.streak > 0 ? (
                          <Flame className="w-3 h-3 fill-amber-400" />
                        ) : (
                          <Snowflake className="w-3 h-3 text-blue-400" />
                        )}
                        {Math.abs(p.streak)}
                      </span>
                    ) : null}
                  </div>

                  {/* Health Gauge */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          hpPercent > 50
                            ? 'bg-emerald-500'
                            : hpPercent > 25
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <span className="font-mono-stat text-xs font-bold text-slate-300 w-7 text-right">
                      {p.health}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Damage Meters / Stats Tab */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                {activeCombatResult
                  ? activeCombatResult.isPve
                    ? 'Creep Battle Stats'
                    : 'Latest Duel Stats'
                  : 'Combat Stats'}
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {unitList.length} Units Fought
              </span>
            </div>

            {unitList.length === 0 ? (
              <div className="text-xs text-slate-500 italic text-center py-10">
                No combat stats recorded yet. Stats will appear after your first battle!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unitList.map((u, idx) => {
                  const def = UNITS[u.unitDefId];
                  const pct = (u.damageDealt / maxDamage) * 100;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80"
                    >
                      {/* Top row: Star Level, Name, Damage & Healing */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-amber-400 shrink-0 text-[10px]">
                            {'★'.repeat(u.starLevel)}
                          </span>
                          <span className="font-bold text-slate-100 truncate text-[11px]">
                            {def?.name || u.unitDefId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono-stat text-[10px] shrink-0">
                          <span className="text-amber-400 font-bold">{u.damageDealt} DMG</span>
                          {u.healing > 0 && (
                            <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                              <Heart className="w-2.5 h-2.5" />
                              {u.healing}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual Damage Dealt Bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Secondary metrics (Damage Taken & Items) */}
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5 text-blue-400" />
                          <span>Took {u.damageTaken} dmg</span>
                        </span>
                        {u.items && u.items.length > 0 && (
                          <div className="flex items-center gap-1">
                            {u.items.map((itmId, itmIdx) => {
                              const itm = ALL_ITEMS[itmId];
                              if (!itm) return null;
                              return (
                                <div key={itmIdx} className="relative group/itm">
                                  <span className="cursor-help text-xs hover:scale-125 transition-transform inline-block">
                                    {itm.icon}
                                  </span>

                                  {/* Floating item preview */}
                                  <div className="absolute right-0 bottom-full mb-1.5 w-56 bg-slate-950/98 backdrop-blur-md border border-amber-500/40 rounded-xl p-2.5 shadow-2xl shadow-black z-[99999] opacity-0 group-hover/itm:opacity-100 transition-opacity duration-150 pointer-events-none flex flex-col gap-1.5 text-left">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{itm.icon}</span>
                                        <span className="text-xs font-bold text-amber-300">
                                          {itm.name}
                                        </span>
                                      </div>
                                      <span className="text-[8px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                                        {itm.isArtifact ? 'Artifact' : 'Component'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 leading-snug">
                                      {itm.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
