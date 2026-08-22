import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameSocket } from '../../context/GameSocketContext';
import { TRAITS, UNITS } from '@autobattler/shared';

const costBadges: Record<number, string> = {
  1: 'bg-slate-700 text-slate-200 border-slate-600',
  2: 'bg-emerald-800 text-emerald-100 border-emerald-600',
  3: 'bg-blue-800 text-blue-100 border-blue-600',
  4: 'bg-purple-800 text-purple-100 border-purple-600',
  5: 'bg-amber-500 text-slate-950 font-black border-amber-400',
};

type VisualTier = 'none' | 'bronze' | 'silver' | 'gold';

function getVisualTier(activeTier: number, totalTiers: number): VisualTier {
  if (activeTier <= 0) return 'none';
  if (totalTiers === 1) return 'gold';
  if (totalTiers === 2) {
    return activeTier === 1 ? 'bronze' : 'gold';
  }
  if (totalTiers === 3) {
    if (activeTier === 1) return 'bronze';
    if (activeTier === 2) return 'silver';
    return 'gold';
  }
  if (activeTier === 1 || activeTier === 2) return 'bronze';
  if (activeTier === 3) return 'silver';
  return 'gold';
}

function getTierStyles(tier: VisualTier, isActive: boolean) {
  if (!isActive) {
    return {
      card: 'border-slate-800/80 bg-[#0a0e1a]/90 opacity-70 hover:opacity-100 hover:border-slate-700',
      title: 'text-slate-300',
      badge: 'bg-slate-800 text-slate-400 border border-slate-700',
      pillActive: 'bg-slate-800 text-slate-400',
      glow: '',
    };
  }

  switch (tier) {
    case 'bronze':
      return {
        card: 'border-amber-700/80 bg-gradient-to-r from-amber-950/60 to-[#0b101e] shadow-md shadow-amber-950/50 ring-1 ring-amber-600/40',
        title: 'text-amber-300 font-bold',
        badge: 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 border border-amber-500 shadow-sm',
        pillActive: 'bg-amber-700 text-amber-100 font-bold shadow-sm',
        glow: 'text-amber-400',
      };
    case 'silver':
      return {
        card: 'border-slate-300/80 bg-gradient-to-r from-slate-800/70 to-[#0b101e] shadow-md shadow-slate-900 ring-1 ring-slate-300/40',
        title: 'text-slate-100 font-bold',
        badge: 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-950 font-black border border-white shadow-sm',
        pillActive: 'bg-slate-200 text-slate-950 font-bold shadow-sm',
        glow: 'text-slate-200',
      };
    case 'gold':
      return {
        card: 'border-yellow-400/90 bg-gradient-to-r from-amber-950/80 via-yellow-950/50 to-[#0b101e] shadow-lg shadow-yellow-950/60 ring-1 ring-yellow-400/50',
        title: 'text-yellow-300 font-extrabold',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black border border-yellow-200 shadow-md shadow-yellow-500/30',
        pillActive: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black shadow-sm',
        glow: 'text-yellow-300',
      };
    default:
      return {
        card: 'border-indigo-500/60 bg-indigo-950/40 shadow-sm',
        title: 'text-indigo-300',
        badge: 'bg-indigo-600 text-white',
        pillActive: 'bg-amber-500 text-slate-950',
        glow: 'text-indigo-400',
      };
  }
}

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

  const traitUnits = hoveredTrait
    ? Object.values(UNITS)
        .filter(
          (u) =>
            u.origins.includes(hoveredTrait.traitId as any) ||
            u.classes.includes(hoveredTrait.traitId as any)
        )
        .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
    : [];

  return (
    <aside className="w-60 bg-[#070b14] border-r border-slate-800 p-3 flex flex-col gap-2.5 z-20 select-none overflow-y-auto relative scrollbar-thin">
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
            const visualTier = getVisualTier(t.activeTier, traitDef.breakpoints.length);
            const style = getTierStyles(visualTier, isActive);

            return (
              <div
                key={t.traitId}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const optimalTop = Math.min(rect.top, window.innerHeight - 440);
                  setHoveredTrait({
                    traitId: t.traitId,
                    top: Math.max(12, optimalTop),
                    left: rect.right + 12,
                  });
                }}
                onMouseLeave={() => setHoveredTrait(null)}
                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-200 cursor-help relative group ${style.card}`}
              >
                {/* Header: Icon, Name, Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{traitDef.icon}</span>
                    <span className={`text-xs truncate ${style.title}`}>
                      {t.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                      {t.count}
                    </span>
                  </div>
                </div>

                {/* All Tier Breakpoints List (e.g. 2 / 3 / 4) */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">Tiers:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {traitDef.breakpoints.map((bp, idx) => {
                      const isTierActive = t.activeTier >= idx + 1;
                      const bpVisualTier = getVisualTier(idx + 1, traitDef.breakpoints.length);
                      const bpStyle = getTierStyles(bpVisualTier, true);

                      return (
                        <span
                          key={bp.count}
                          className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                            isTierActive
                              ? `${bpStyle.pillActive} font-black`
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
            className="fixed w-88 max-w-sm bg-[#0a0e1a] border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-black z-[99999] animate-fade-in pointer-events-none flex flex-col gap-3 text-left"
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
                const bpTier = getVisualTier(idx + 1, activeTraitDef.breakpoints.length);
                const bpStyle = getTierStyles(bpTier, true);

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
                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 ${
                        isTierActive
                          ? `${bpStyle.pillActive}`
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

            {/* Champions with this Trait */}
            {traitUnits.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Champions ({traitUnits.length}):
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium font-mono">
                    {
                      traitUnits.filter(
                        (uDef) =>
                          player.board.some((row) =>
                            row.some((u) => u?.unitId === uDef.id)
                          ) || player.bench.some((u) => u?.unitId === uDef.id)
                      ).length
                    }
                    /{traitUnits.length} Owned
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {traitUnits.map((uDef) => {
                    const isOwned =
                      player.board.some((row) =>
                        row.some((u) => u?.unitId === uDef.id)
                      ) || player.bench.some((u) => u?.unitId === uDef.id);

                    return (
                      <div
                        key={uDef.id}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] transition ${
                          isOwned
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold shadow-sm'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-80'
                        }`}
                      >
                        <span
                          className={`text-[8px] font-bold px-1 py-0.1 rounded border ${costBadges[uDef.cost]}`}
                        >
                          ${uDef.cost}
                        </span>
                        <span className="truncate max-w-[110px]">{uDef.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </aside>
  );
};
