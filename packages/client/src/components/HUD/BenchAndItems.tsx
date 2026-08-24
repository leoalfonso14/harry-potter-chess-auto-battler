import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { UNITS, ALL_ITEMS, BASE_ITEMS, BaseItemId, combineItems } from '@autobattler/shared';
import { Trash2, BookOpen, Sparkles, DollarSign, Eye, ArrowLeft, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemRecipeModal } from './ItemRecipeModal';
import { SynergyGuideModal } from './SynergyGuideModal';
import { InspectedUnitData } from './UnitInspector';
import { getUnitIcon, getUnitPortraitUrl, hasUnitImage } from '../../render/unit-assets.js';

function formatStatBadge(key: string, value: number): string {
  switch (key) {
    case 'abilityPower':
      return `+${Math.round(value * 100)}% AP`;
    case 'attackDamage':
      return `+${value} AD`;
    case 'armor':
      return `+${value} Armor`;
    case 'magicResist':
      return `+${value} MR`;
    case 'hp':
      return `+${value} HP`;
    case 'attackSpeed':
      return `+${Math.round(value * 100)}% AS`;
    case 'critChance':
      return `+${Math.round(value * 100)}% Crit`;
    case 'critDamage':
      return `+${Math.round(value * 100)}% Crit Dmg`;
    case 'dodgeChance':
      return `+${Math.round(value * 100)}% Dodge`;
    case 'startingMana':
      return `+${value} Mana`;
    case 'manaPerSecond':
      return `+${value} Mana/s`;
    default:
      return `+${value} ${key}`;
  }
}

export const BenchAndItems: React.FC<{
  viewingPlayerId?: string;
  onReturnToMyBoard?: () => void;
  onSelectBenchUnit?: (index: number) => void;
  selectedIndex?: number | null;
  selectedItemSlot?: number | null;
  onSelectItemSlot?: (slot: number | null) => void;
  onInspectUnit?: (data: InspectedUnitData | null) => void;
  onHoverUnit?: (info: { source: 'board' | 'bench'; x: number; y?: number } | null) => void;
  onDragUnitStart?: (info: { unit?: any; source: 'board' | 'bench'; x: number; y?: number; refundGold: number }) => void;
  onDragUnitEnd?: () => void;
}> = ({
  viewingPlayerId,
  onReturnToMyBoard,
  onSelectBenchUnit,
  selectedIndex,
  selectedItemSlot = null,
  onSelectItemSlot,
  onInspectUnit,
  onHoverUnit,
  onDragUnitStart,
  onDragUnitEnd,
}) => {
  const { matchState, playerId, sendAction } = useGameSocket();
  const [hoveredItem, setHoveredItem] = useState<{ id: string; slot: number; synthesized?: any } | null>(null);
  const [draggedItemSlot, setDraggedItemSlot] = useState<number | null>(null);
  const [itemBenchPage, setItemBenchPage] = useState(0);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isSynergyModalOpen, setIsSynergyModalOpen] = useState(false);

  if (!matchState) return null;

  const activeViewingId = viewingPlayerId || playerId;
  const isScouting = activeViewingId !== playerId;
  const player = matchState.players[activeViewingId];
  if (!player || player.isEliminated) return null;

  const handleBenchSlotClick = (benchIdx: number) => {
    const benchUnit = player.bench[benchIdx];

    if (!benchUnit) {
      onInspectUnit?.(null);
      return;
    }

    // Pure click: display more info popup only (no moving on click)
    if (onInspectUnit) {
      onInspectUnit({
        id: benchUnit.id,
        unitDefId: benchUnit.unitId,
        starLevel: benchUnit.starLevel,
        currentHp: benchUnit.currentHp,
        maxHp: benchUnit.maxHp,
        currentMana: benchUnit.currentMana,
        maxMana: benchUnit.maxMana,
        items: benchUnit.items,
      });
    }
  };

  const handleBenchSlotDrop = (targetBenchIdx: number, e: React.DragEvent) => {
    if (isScouting) return;
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);

      if (data.type === 'ITEM' || data.type === 'item') {
        const itemSlot = data.slot !== undefined ? data.slot : data.itemSlot;
        sendAction({
          type: 'EQUIP_ITEM',
          itemSlot,
          target: { area: 'bench', x: targetBenchIdx },
        });
        onSelectItemSlot?.(null);
      } else if (data.type === 'UNIT' || data.type === 'unit') {
        sendAction({
          type: 'MOVE_UNIT',
          from: { area: data.source, x: data.x, y: data.y },
          to: { area: 'bench', x: targetBenchIdx },
        });
      }
    } catch {
      // Ignore invalid JSON drag data
    }
    setDraggedItemSlot(null);
    onDragUnitEnd?.();
  };

  const handleItemSlotDrop = (targetSlotIdx: number, e: React.DragEvent) => {
    if (isScouting) return;
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!rawData) {
      setDraggedItemSlot(null);
      return;
    }

    try {
      const data = JSON.parse(rawData);
      if (data.type === 'ITEM' || data.type === 'item') {
        const fromSlot = data.slot !== undefined ? data.slot : data.itemSlot;
        if (fromSlot !== targetSlotIdx && fromSlot !== null && fromSlot !== undefined) {
          sendAction({
            type: 'EQUIP_ITEM',
            itemSlot: fromSlot,
            target: { area: 'item_bench', x: targetSlotIdx },
          });
        }
      }
    } catch {
      // Ignore invalid JSON
    }
    setDraggedItemSlot(null);
    onSelectItemSlot?.(null);
  };

  const costColorBorders: Record<number, string> = {
    1: 'border-slate-600 bg-slate-900/90 text-slate-300',
    2: 'border-emerald-500/70 bg-emerald-950/70 text-emerald-300',
    3: 'border-blue-500/70 bg-blue-950/70 text-blue-300',
    4: 'border-purple-500/70 bg-purple-950/70 text-purple-300',
    5: 'border-amber-500/80 bg-amber-950/70 text-amber-300',
  };

  const costBadges: Record<number, string> = {
    1: 'bg-slate-700 text-slate-200',
    2: 'bg-emerald-700 text-white',
    3: 'bg-blue-700 text-white',
    4: 'bg-purple-700 text-white',
    5: 'bg-amber-500 text-slate-950 font-black',
  };

  return (
    <>
      <div className="w-full bg-slate-950/95 backdrop-blur border-t border-slate-800 p-2.5 flex items-center justify-between gap-4 z-20 select-none relative">
        {/* Left Side: Item Bench (10 Slots per page) & Recipe Book Button */}
        {(() => {
          const ITEMS_PER_PAGE = 10;
          const totalBenchSlots = Math.max(10, player.itemBench.length);
          const totalPages = Math.max(1, Math.ceil(totalBenchSlots / ITEMS_PER_PAGE));
          const safePage = Math.min(itemBenchPage, totalPages - 1);
          const pageStartIndex = safePage * ITEMS_PER_PAGE;
          const currentSlots = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
            const slotIdx = pageStartIndex + i;
            return {
              slotIdx,
              itemId: player.itemBench[slotIdx] || null,
            };
          });

          return (
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <span>{isScouting ? `${player.name.split(' ')[0]}'s Items` : 'Item Bench'}</span>
                      <span className="text-amber-400 font-mono-stat">
                        ({player.itemBench.filter(Boolean).length} Items)
                      </span>
                    </span>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800 text-[10px]">
                        <button
                          onClick={() => setItemBenchPage((p) => Math.max(0, p - 1))}
                          disabled={safePage === 0}
                          className="text-slate-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none"
                          title="Previous Item Page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-slate-300 px-1 font-bold">
                          {safePage + 1}/{totalPages}
                        </span>
                        <button
                          onClick={() => setItemBenchPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={safePage >= totalPages - 1}
                          className="text-slate-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none"
                          title="Next Item Page"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsRecipeModalOpen(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition"
                      title="View Item Recipes"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Items</span>
                    </button>
                    <button
                      onClick={() => setIsSynergyModalOpen(true)}
                      className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/20 transition"
                      title="View Synergies & Champions Compendium"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Codex</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                  {currentSlots.map(({ slotIdx, itemId }) => {
                    const itemDef = itemId ? ALL_ITEMS[itemId] : null;
                    const isSelected = selectedItemSlot === slotIdx;
                    const isBeingDragged = draggedItemSlot === slotIdx;

                    let previewCombinedItem: any = null;
                    const activeSourceSlot = draggedItemSlot !== null ? draggedItemSlot : selectedItemSlot;
                    if (
                      activeSourceSlot !== null &&
                      activeSourceSlot !== slotIdx &&
                      itemId &&
                      player.itemBench[activeSourceSlot]
                    ) {
                      const sourceKey = player.itemBench[activeSourceSlot];
                      if (sourceKey && BASE_ITEMS[sourceKey as BaseItemId] && BASE_ITEMS[itemId as BaseItemId]) {
                        previewCombinedItem = combineItems(sourceKey, itemId);
                      }
                    }

                    return (
                      <div
                        key={slotIdx}
                        id={`item-bench-slot-${slotIdx}`}
                        draggable={!isScouting && Boolean(itemId)}
                        onDragStart={(e) => {
                          if (!itemId || isScouting) return;
                          const payload = JSON.stringify({ type: 'item', slot: slotIdx, itemId });
                          e.dataTransfer.setData('application/json', payload);
                          e.dataTransfer.setData('text/plain', payload);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedItemSlot(slotIdx);
                        }}
                        onDragEnd={() => setDraggedItemSlot(null)}
                        onDragOver={(e) => !isScouting && e.preventDefault()}
                        onDrop={(e) => handleItemSlotDrop(slotIdx, e)}
                        onMouseEnter={() => {
                          if (itemId) {
                            setHoveredItem({
                              id: itemId,
                              slot: slotIdx,
                              synthesized: previewCombinedItem || undefined,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        title={previewCombinedItem ? `Synthesizes into: ${previewCombinedItem.name}` : itemDef?.name}
                        className={`w-11 h-11 rounded-lg border flex items-center justify-center relative transition-all duration-150 select-none ${
                          isScouting ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                        } ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                            : isBeingDragged
                            ? 'opacity-40 border-dashed border-amber-400'
                            : previewCombinedItem
                            ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-400 animate-pulse'
                            : itemId
                            ? 'border-slate-700 bg-slate-800/90 hover:border-amber-400/80 hover:bg-slate-700 shadow'
                            : 'border-dashed border-slate-800 bg-slate-950/40'
                        }`}
                      >
                        {itemDef ? (
                          <span className="text-xl select-none transform hover:scale-110 transition">
                            {itemDef.icon}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">{slotIdx + 1}</span>
                        )}

                        {/* Synthesize Preview Tag */}
                        {previewCombinedItem && (
                          <span className="absolute -top-6 bg-emerald-900 border border-emerald-400 text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-30 pointer-events-none">
                            ✦ {previewCombinedItem.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Center/Right: Champion Reserve Bench (9 Slots) */}
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col gap-1 w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>{isScouting ? `${player.name.split(' ')[0]}'s Bench` : 'Reserve Bench'}</span>
                <span className="text-indigo-400 font-mono-stat">
                  ({player.bench.filter(Boolean).length}/9)
                </span>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                {isScouting ? 'Click units to inspect stats' : 'Drag to Board or drop items to equip • Press [E] to sell'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
              {player.bench.map((unit, idx) => {
                const def = unit ? UNITS[unit.unitId] : null;
                const isSelected = selectedIndex === idx;

                const cost = def?.cost || 1;
                const star = unit?.starLevel || 1;
                const refundValue = star === 1 ? cost : star === 2 ? (cost === 1 ? 3 : cost * 3 - 1) : (cost === 1 ? 9 : cost * 9 - 2);

                return (
                  <div
                    key={idx}
                    id={`bench-slot-${idx}`}
                    data-bench-index={idx}
                    draggable={!isScouting && Boolean(unit)}
                    onDragStart={(e) => {
                      if (!unit || !def || isScouting) return;
                      const payload = JSON.stringify({ type: 'unit', source: 'bench', x: idx });
                      e.dataTransfer.setData('application/json', payload);
                      e.dataTransfer.setData('text/plain', payload);
                      e.dataTransfer.effectAllowed = 'move';
                      onDragUnitStart?.({
                        unit,
                        source: 'bench',
                        x: idx,
                        refundGold: refundValue,
                      });
                    }}
                    onDragEnd={() => onDragUnitEnd?.()}
                    onDragOver={(e) => !isScouting && e.preventDefault()}
                    onDrop={(e) => handleBenchSlotDrop(idx, e)}
                    onClick={() => handleBenchSlotClick(idx)}
                    onMouseEnter={() => {
                      if (unit) onHoverUnit?.({ source: 'bench', x: idx });
                    }}
                    onMouseLeave={() => onHoverUnit?.(null)}
                    className={`w-16 h-20 rounded-xl border flex flex-col items-center justify-between p-1.5 relative transition-all duration-150 select-none ${
                      unit && def
                        ? `${costColorBorders[def.cost]} hover:scale-105 hover:brightness-110 shadow-md cursor-pointer`
                        : 'border-dashed border-slate-800 bg-slate-950/40 cursor-default'
                    }`}
                  >
                    {unit && def ? (
                      <>
                        {/* Top: Star Badge & Cost Badge */}
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-amber-400 drop-shadow">
                            {'★'.repeat(unit.starLevel)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1 rounded ${costBadges[def.cost]}`}
                          >
                            ${def.cost}
                          </span>
                        </div>

                        {/* Middle: Compact Champion Portrait Avatar / Name */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 relative shadow-md bg-slate-900 flex items-center justify-center mb-0.5">
                            {hasUnitImage(unit.unitId) ? (
                              <img
                                src={getUnitPortraitUrl(unit.unitId)}
                                alt={def.name}
                                className="w-full h-full object-cover object-[75%_center]"
                              />
                            ) : (
                              <span className="text-sm leading-none pointer-events-none">
                                {getUnitIcon(unit.unitId)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold truncate max-w-[56px] text-slate-200">
                            {def.name.split(' ')[0]}
                          </span>
                        </div>

                        {/* Bottom: Items equipped on unit */}
                        <div className="flex items-center gap-0.5 h-3">
                          {unit.items.map((itmId, i) => {
                            const itmDef = ALL_ITEMS[itmId];
                            return (
                              <span key={i} className="text-[10px] leading-none" title={itmDef?.name}>
                                {itmDef?.icon || '•'}
                              </span>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-700 font-mono m-auto">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Item Hover Tooltip / Synthesis Preview */}
      {hoveredItem && (
        <div className="fixed bottom-28 left-4 z-50 w-80 bg-[#0a0e1a] border border-slate-700/80 rounded-xl p-3 shadow-2xl shadow-black pointer-events-none animate-fade-in flex flex-col gap-2 text-left">
          {hoveredItem.synthesized ? (
            <>
              <div className="flex items-center gap-2 border-b border-emerald-500/40 pb-1.5">
                <span className="text-2xl">{hoveredItem.synthesized.icon}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <span>✦ {hoveredItem.synthesized.name}</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                      Synthesizes Into
                    </span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">Completed Item</span>
                </div>
              </div>
              {hoveredItem.synthesized.stats && (
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-amber-300 font-mono">
                  {Object.entries(hoveredItem.synthesized.stats).map(([k, v]) => (
                    <span key={k} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {formatStatBadge(k, v as number)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-200 leading-snug">{hoveredItem.synthesized.description}</p>
              {hoveredItem.synthesized.signatureDescription && (
                <p className="text-[10px] text-amber-300 font-medium bg-amber-950/40 p-1.5 rounded border border-amber-500/30">
                  ✨ {hoveredItem.synthesized.signatureDescription}
                </p>
              )}
            </>
          ) : ALL_ITEMS[hoveredItem.id] ? (
            <>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <span className="text-2xl">{ALL_ITEMS[hoveredItem.id].icon}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">{ALL_ITEMS[hoveredItem.id].name}</span>
                  <span className="text-[10px] text-amber-400 capitalize font-medium">
                    {ALL_ITEMS[hoveredItem.id].isArtifact ? 'Completed Item' : 'Basic Component'}
                  </span>
                </div>
              </div>
              {ALL_ITEMS[hoveredItem.id].stats && (
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-amber-300 font-mono">
                  {Object.entries(ALL_ITEMS[hoveredItem.id].stats).map(([k, v]) => (
                    <span key={k} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {formatStatBadge(k, v as number)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-300 leading-snug">{ALL_ITEMS[hoveredItem.id].description}</p>
              {ALL_ITEMS[hoveredItem.id].signatureDescription && (
                <p className="text-[10px] text-amber-300 font-medium bg-amber-950/40 p-1.5 rounded border border-amber-500/30">
                  ✨ {ALL_ITEMS[hoveredItem.id].signatureDescription}
                </p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Recipe Book Modal */}
      <ItemRecipeModal isOpen={isRecipeModalOpen} onClose={() => setIsRecipeModalOpen(false)} />
      <SynergyGuideModal isOpen={isSynergyModalOpen} onClose={() => setIsSynergyModalOpen(false)} />
    </>
  );
};
