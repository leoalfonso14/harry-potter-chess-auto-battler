import React, { useEffect, useState } from 'react';
import { ALL_ITEMS } from '@autobattler/shared';

export interface FlyingLootData {
  id: string;
  itemKey: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startTime: number;
  duration: number; // e.g. 1100ms
}

export const FlyingLootOverlay: React.FC<{
  flyingLoot: FlyingLootData[];
  onLootArrived?: (id: string) => void;
}> = ({ flyingLoot, onLootArrived }) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [impactBursts, setImpactBursts] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);

  useEffect(() => {
    if (flyingLoot.length === 0 && impactBursts.length === 0) return;

    let animFrame: number;
    const update = () => {
      const now = Date.now();
      setCurrentTime(now);

      // Check for arrived loot
      for (const loot of flyingLoot) {
        const progress = (now - loot.startTime) / loot.duration;
        if (progress >= 1.0) {
          // Spawn impact burst
          setImpactBursts((prev) => [
            ...prev,
            {
              id: `${loot.id}_burst`,
              x: loot.targetX,
              y: loot.targetY,
              color: '#fbbf24',
            },
          ]);

          onLootArrived?.(loot.id);
        }
      }

      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [flyingLoot, impactBursts.length, onLootArrived]);

  // Clean up finished impact bursts
  useEffect(() => {
    if (impactBursts.length === 0) return;
    const timer = setTimeout(() => {
      setImpactBursts([]);
    }, 600);
    return () => clearTimeout(timer);
  }, [impactBursts]);

  if (flyingLoot.length === 0 && impactBursts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* 1. Flying Loot Items */}
      {flyingLoot.map((loot) => {
        const itemDef = ALL_ITEMS[loot.itemKey];
        const elapsed = currentTime - loot.startTime;
        const progress = Math.max(0, Math.min(1, elapsed / loot.duration));

        // Ease Out Cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        // Bezier Arc: Control point curves upwards
        const cpX = (loot.startX + loot.targetX) / 2 + 30;
        const cpY = Math.min(loot.startX, loot.targetY) - 140;

        const currentX =
          Math.pow(1 - ease, 2) * loot.startX +
          2 * (1 - ease) * ease * cpX +
          Math.pow(ease, 2) * loot.targetX;

        const currentY =
          Math.pow(1 - ease, 2) * loot.startY +
          2 * (1 - ease) * ease * cpY +
          Math.pow(ease, 2) * loot.targetY;

        const scale = progress < 0.2 ? 0.6 + progress * 3.5 : 1.3 - (progress - 0.2) * 0.35;
        const rotation = (progress * 360) % 360;

        return (
          <div
            key={loot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{
              left: `${currentX}px`,
              top: `${currentY}px`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            {/* Glowing Aura Orb */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 rounded-full bg-amber-400/30 blur-md animate-pulse" />
              <div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-slate-950 border-2 border-amber-300 shadow-2xl shadow-amber-500/50 flex items-center justify-center relative overflow-hidden"
                style={{ transform: `rotate(${rotation * 0.2}deg)` }}
              >
                <span className="text-2xl drop-shadow select-none">
                  {itemDef?.icon || '📦'}
                </span>
                {/* Shimmer light bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer" />
              </div>
            </div>

            {/* Item Name Floating Badge */}
            {itemDef && progress > 0.15 && progress < 0.85 && (
              <span className="bg-slate-950/95 border border-amber-400/80 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-fade-in">
                ✦ {itemDef.name}
              </span>
            )}
          </div>
        );
      })}

      {/* 2. Impact Sparkle Bursts */}
      {impactBursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-amber-300 animate-ping opacity-75" />
          <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-amber-400/80 rounded-full blur-sm animate-pulse" />
        </div>
      ))}
    </div>
  );
};
