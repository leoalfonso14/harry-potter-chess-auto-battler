import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameSocket } from '../../context/GameSocketContext';
import { TRAITS } from '@autobattler/shared';

export const TraitPanel: React.FC<{
  viewingPlayerId?: string;
}> = ({ viewingPlayerId }) => {
  const { matchState, playerId } = useGameSocket();
  const [hoveredTrait, setHoveredTrait] = useState<{
    traitId: string;
    top: number;
    left: number;
  } | null>(null);

  if (!matchState) return null;

  const activeViewingId = viewingPlayerId || playerId;
  const player = matchState.players[activeViewingId];
  if (!player || player.isEliminated) return null;

  const isScouting = activeViewingId !== playerId;
  const activeTraitDef = hoveredTrait ? TRAITS[hoveredTrait.traitId] : null;
  const activeTraitInfo = hoveredTrait
    ? player.activeTraits.find((t) => t.traitId === hoveredTrait.traitId)
    : null;

  return (
    <aside className="w-60 bg-slate-950/95 backdrop-blur border-r border-slate-800 p-3 flex flex-col gap-2.5 z-20 select-none overflow-y-auto relative scrollbar-thin">
      {/* Clean Minimalist Header with No Logo */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {isScouting ? `${player.name.split(' ')[0]}'s Synergies` : 'Synergies'}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {player.activeTraits.filter((t) => t.activeTier > 0).length} Active
        </span>
      </div>

      {player.activeTraits.length === 0 ? (
        <div className="text-xs text-slate-500 italic text-center py-6">
          Deploy units on the board to activate synergies!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {player.activeTraits.map((t) => {
            const traitDef = TRAITS[t.traitId];
            if (!traitDef) return null;

            const isActive = t.activeTier > 0;

            return (
              <div
                key={t.traitId}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const optimalTop = Math.min(rect.top, window.innerHeight - 380);
                  setHoveredTrait({
                    traitId: t.traitId,
                    top: Math.max(12, optimalTop),
                    left: rect.right + 12,
                  });
                }}
                onMouseLeave={() => setHoveredTrait(null)}
                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-200 cursor-help relative group ${
                  isActive
                    ? 'border-indigo-500/60 bg-indigo-950/40 shadow-sm shadow-indigo-950/50'
                    : 'border-slate-800/80 bg-slate-900/40 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {/* Header: Icon, Name, Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{traitDef.icon}</span>
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-indigo-300' : 'text-slate-300'
                      }`}
                    >
                      {t.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.count}
                    </span>
                  </div>
                </div>

                {/* All Tier Breakpoints List (e.g. 2 / 4 / 6 / 8) */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">Tiers:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {traitDef.breakpoints.map((bp, idx) => {
                      const isTierActive = t.activeTier >= idx + 1;
                      return (
                        <span
                          key={bp.count}
                          className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                            isTierActive
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {bp.count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Viewport-Anchored Tooltip Overlay rendered into Portal */}
      {hoveredTrait &&
        activeTraitDef &&
        createPortal(
          <div
            className="fixed w-80 bg-slate-950/98 backdrop-blur-md border border-indigo-500/60 rounded-2xl p-4 shadow-2xl shadow-black z-[99999] animate-fade-in pointer-events-none flex flex-col gap-3 text-left"
            style={{
              top: `${hoveredTrait.top}px`,
              left: `${hoveredTrait.left}px`,
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeTraitDef.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-100">{activeTraitDef.name}</span>
                  <span className="text-[10px] text-indigo-400 font-bold capitalize">
                    {activeTraitDef.type} Synergy
                  </span>
                </div>
              </div>
              {activeTraitInfo && (
                <span className="text-xs font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-mono">
                  {activeTraitInfo.count} Active
                </span>
              )}
            </div>

            {/* Base description */}
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {activeTraitDef.description}
            </p>

            {/* Breakdown by Tier */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tier Bonuses:
              </span>
              {activeTraitDef.breakpoints.map((bp, idx) => {
                const isTierActive = activeTraitInfo ? activeTraitInfo.activeTier >= idx + 1 : false;
                return (
                  <div
                    key={bp.count}
                    className={`p-2 rounded-xl text-[11px] flex items-start gap-2 border transition ${
                      isTierActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-medium'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold font-mono text-[10px] shrink-0 ${
                        isTierActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ({bp.count})
                    </span>
                    <span className="leading-tight">{bp.description}</span>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
};
