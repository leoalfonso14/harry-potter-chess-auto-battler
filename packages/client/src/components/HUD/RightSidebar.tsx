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
  const [combatSubTab, setCombatSubTab] = useState<'damage' | 'mitigation' | 'healShield'>('damage');

  if (!matchState) return null;

  const currentOpponentId = matchState.players[playerId]?.opponentId;
  const activeViewingId = viewingPlayerId || playerId;

  // Combat recap summaries for currently viewed board
  const viewingResult =
    matchState.combatResults[activeViewingId] ||
    matchState.combatResults[`${activeViewingId}_vs_pve`] ||
    (matchState.players[activeViewingId]?.opponentId
      ? matchState.combatResults[`${activeViewingId}_vs_${matchState.players[activeViewingId].opponentId}`]
      : undefined) ||
    (activeViewingId === playerId ? activeCombatResult : undefined);

  const isHome = viewingResult?.homePlayerId === activeViewingId;
  const summaries = viewingResult
    ? isHome
      ? viewingResult.homeUnitSummaries
      : viewingResult.awayUnitSummaries
    : {};

  const rawUnitList = Object.values(summaries || {});

  const unitList = [...rawUnitList].sort((a, b) => {
    if (combatSubTab === 'damage') {
      return b.damageDealt - a.damageDealt;
    }
    if (combatSubTab === 'mitigation') {
      const totB = b.damageTaken + (b.totalMitigated || 0);
      const totA = a.damageTaken + (a.totalMitigated || 0);
      return totB - totA;
    }
    const hsB = (b.healing || 0) + (b.shielding || 0);
    const hsA = (a.healing || 0) + (a.shielding || 0);
    return hsB - hsA;
  });

  const maxStatVal = Math.max(
    1,
    ...unitList.map((u) => {
      if (combatSubTab === 'damage') return u.damageDealt;
      if (combatSubTab === 'mitigation') return u.damageTaken + (u.totalMitigated || 0);
      return (u.healing || 0) + (u.shielding || 0);
    })
  );

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
                            ? 'text-indigo-200'
                            : isOpponent
                            ? 'text-red-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded font-bold border border-indigo-500/30">
                          YOU
                        </span>
                      )}
                      {isViewing && !isMe && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold border border-amber-500/30">
                          SCOUT
                        </span>
                      )}
                    </div>

                    {/* Streak & Gold Indicators */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {Math.abs(p.streak) >= 2 && (
                        <span
                          className={`flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${
                            p.streak > 0
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {p.streak > 0 ? (
                            <Flame className="w-2.5 h-2.5 fill-amber-400" />
                          ) : (
                            <Snowflake className="w-2.5 h-2.5" />
                          )}
                          {Math.abs(p.streak)}
                        </span>
                      )}
                      <span className="font-mono text-amber-400 font-bold">{p.gold}g</span>
                    </div>
                  </div>

                  {/* Level and Health Bar */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-stat">
                      <span>Lvl {p.level}</span>
                      <span
                        className={
                          p.health > 50
                            ? 'text-emerald-400'
                            : p.health > 20
                            ? 'text-amber-400'
                            : 'text-red-400 font-bold'
                        }
                      >
                        {p.health} HP
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          hpPercent > 50
                            ? 'bg-emerald-500'
                            : hpPercent > 20
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Combat Stats Tab */
          <div className="flex flex-col gap-2">
            {/* 3 Sub-Tabs Pill Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCombatSubTab('damage')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                  combatSubTab === 'damage'
                    ? 'bg-orange-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Swords className="w-3 h-3" />
                <span>Damage</span>
              </button>

              <button
                onClick={() => setCombatSubTab('mitigation')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                  combatSubTab === 'mitigation'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Defense</span>
              </button>

              <button
                onClick={() => setCombatSubTab('healShield')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                  combatSubTab === 'healShield'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Heal/Shield</span>
              </button>
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-300">
                {activeViewingId !== playerId
                  ? `${matchState.players[activeViewingId]?.name.split(' ')[0]}'s Battle`
                  : viewingResult?.isPve
                  ? 'Creep Battle Stats'
                  : 'Latest Duel Stats'}
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                {unitList.length} Units
              </span>
            </div>

            {unitList.length === 0 ? (
              <div className="text-xs text-slate-500 italic text-center py-10">
                No combat stats recorded yet. Stats will update live during battle!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unitList.map((u, idx) => {
                  const def = UNITS[u.unitDefId];

                  let barPct = 0;
                  let primaryMetricText = '';
                  let barGradient = 'from-orange-500 to-amber-400';

                  if (combatSubTab === 'damage') {
                    barPct = (u.damageDealt / maxStatVal) * 100;
                    primaryMetricText = `${u.damageDealt} DMG`;
                    barGradient = 'from-orange-500 to-amber-400';
                  } else if (combatSubTab === 'mitigation') {
                    const totalDefended = u.damageTaken + (u.totalMitigated || 0);
                    barPct = (totalDefended / maxStatVal) * 100;
                    primaryMetricText = `${u.damageTaken} Took`;
                    barGradient = 'from-blue-600 to-cyan-400';
                  } else {
                    const totalHealShield = (u.healing || 0) + (u.shielding || 0);
                    barPct = (totalHealShield / maxStatVal) * 100;
                    primaryMetricText = `${totalHealShield} Total`;
                    barGradient = 'from-emerald-500 to-teal-400';
                  }

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80"
                    >
                      {/* Top row: Star Level, Name, Primary Metric */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-amber-400 shrink-0 text-[10px]">
                            {'★'.repeat(u.starLevel)}
                          </span>
                          <span className="font-bold text-slate-100 truncate text-[11px]">
                            {def?.name || u.unitDefId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono-stat text-[10px] shrink-0">
                          <span
                            className={`font-bold ${
                              combatSubTab === 'damage'
                                ? 'text-amber-400'
                                : combatSubTab === 'mitigation'
                                ? 'text-cyan-300'
                                : 'text-emerald-400'
                            }`}
                          >
                            {primaryMetricText}
                          </span>
                        </div>
                      </div>

                      {/* Visual Metric Bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                          style={{ width: `${Math.max(2, barPct)}%` }}
                        />
                      </div>

                      {/* Secondary metrics row */}
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        {combatSubTab === 'damage' && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5 text-blue-400" />
                            <span>Took {u.damageTaken} dmg</span>
                          </span>
                        )}

                        {combatSubTab === 'mitigation' && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Shield className="w-2.5 h-2.5 text-cyan-400" />
                            <span>
                              Mitigated: {u.physicalMitigated || 0} Phys • {u.magicMitigated || 0} Mag
                            </span>
                          </span>
                        )}

                        {combatSubTab === 'healShield' && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Heart className="w-2.5 h-2.5 text-emerald-400" />
                            <span>
                              {u.healing || 0} Healed • {u.shielding || 0} Shielded
                            </span>
                          </span>
                        )}

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
