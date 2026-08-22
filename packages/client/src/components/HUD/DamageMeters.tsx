import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { Activity, ChevronDown, ChevronUp, Shield, Heart, Swords } from 'lucide-react';
import { UNITS } from '@autobattler/shared';

export const DamageMeters: React.FC = () => {
  const { activeCombatResult, playerId } = useGameSocket();
  const [collapsed, setCollapsed] = useState(false);
  const [subTab, setSubTab] = useState<'damage' | 'mitigation' | 'healShield'>('damage');

  if (!activeCombatResult) return null;

  const isHome = activeCombatResult.homePlayerId === playerId;
  const summaries = isHome
    ? activeCombatResult.homeUnitSummaries
    : activeCombatResult.awayUnitSummaries;

  const rawList = Object.values(summaries || {});
  const unitList = [...rawList].sort((a, b) => {
    if (subTab === 'damage') return b.damageDealt - a.damageDealt;
    if (subTab === 'mitigation') {
      return (b.damageTaken + (b.totalMitigated || 0)) - (a.damageTaken + (a.totalMitigated || 0));
    }
    return ((b.healing || 0) + (b.shielding || 0)) - ((a.healing || 0) + (a.shielding || 0));
  });

  const maxVal = Math.max(
    1,
    ...unitList.map((u) => {
      if (subTab === 'damage') return u.damageDealt;
      if (subTab === 'mitigation') return u.damageTaken + (u.totalMitigated || 0);
      return (u.healing || 0) + (u.shielding || 0);
    })
  );

  return (
    <div className="absolute top-2 right-2 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 z-30 w-56 shadow-2xl select-none">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer pb-1 border-b border-slate-800"
      >
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Combat Recap
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-2 mt-2">
          {/* Sub-tab pills */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[9px]">
            <button
              onClick={() => setSubTab('damage')}
              className={`flex-1 py-0.5 rounded font-bold transition flex items-center justify-center gap-0.5 ${
                subTab === 'damage' ? 'bg-orange-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-2.5 h-2.5" />
              <span>Dmg</span>
            </button>
            <button
              onClick={() => setSubTab('mitigation')}
              className={`flex-1 py-0.5 rounded font-bold transition flex items-center justify-center gap-0.5 ${
                subTab === 'mitigation' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-2.5 h-2.5" />
              <span>Def</span>
            </button>
            <button
              onClick={() => setSubTab('healShield')}
              className={`flex-1 py-0.5 rounded font-bold transition flex items-center justify-center gap-0.5 ${
                subTab === 'healShield' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-2.5 h-2.5" />
              <span>Heal</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {unitList.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">No combat data yet</span>
            ) : (
              unitList.map((u, idx) => {
                const def = UNITS[u.unitDefId];

                let pct = 0;
                let text = '';
                let gradient = 'from-orange-500 to-amber-400';

                if (subTab === 'damage') {
                  pct = (u.damageDealt / maxVal) * 100;
                  text = `${u.damageDealt} DMG`;
                  gradient = 'from-orange-500 to-amber-400';
                } else if (subTab === 'mitigation') {
                  const tot = u.damageTaken + (u.totalMitigated || 0);
                  pct = (tot / maxVal) * 100;
                  text = `${u.damageTaken} / ${u.totalMitigated || 0}m`;
                  gradient = 'from-blue-600 to-cyan-400';
                } else {
                  const hs = (u.healing || 0) + (u.shielding || 0);
                  pct = (hs / maxVal) * 100;
                  text = `${hs} H/S`;
                  gradient = 'from-emerald-500 to-teal-400';
                }

                return (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-amber-400 shrink-0">{'★'.repeat(u.starLevel)}</span>
                        <span className="font-semibold text-slate-200 truncate">
                          {def?.name || u.unitDefId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-mono-stat text-[10px] shrink-0">
                        <span
                          className={`font-bold ${
                            subTab === 'damage'
                              ? 'text-orange-400'
                              : subTab === 'mitigation'
                              ? 'text-cyan-300'
                              : 'text-emerald-400'
                          }`}
                        >
                          {text}
                        </span>
                      </div>
                    </div>

                    {/* Visual metric gauge bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
