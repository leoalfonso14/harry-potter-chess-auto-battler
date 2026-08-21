import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { Activity, ChevronDown, ChevronUp, Shield, Heart } from 'lucide-react';
import { UNITS } from '@autobattler/shared';

export const DamageMeters: React.FC = () => {
  const { activeCombatResult, playerId } = useGameSocket();
  const [collapsed, setCollapsed] = useState(false);

  if (!activeCombatResult) return null;

  const isHome = activeCombatResult.homePlayerId === playerId;
  const summaries = isHome
    ? activeCombatResult.homeUnitSummaries
    : activeCombatResult.awayUnitSummaries;

  const unitList = Object.values(summaries || {}).sort((a, b) => b.damageDealt - a.damageDealt);
  const maxDamage = Math.max(1, ...unitList.map((u) => u.damageDealt));

  return (
    <div className="absolute top-2 right-2 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 z-30 w-52 shadow-2xl select-none">
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
        <div className="flex flex-col gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
          {unitList.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic">No combat data yet</span>
          ) : (
            unitList.map((u, idx) => {
              const def = UNITS[u.unitDefId];
              const pct = (u.damageDealt / maxDamage) * 100;

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
                      <span className="text-orange-400 font-bold">{u.damageDealt} DMG</span>
                      {u.healing > 0 && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5" />
                          {u.healing}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual damage gauge bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
