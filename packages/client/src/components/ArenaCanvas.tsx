import React, { useEffect, useRef, useState } from 'react';
import { ArenaRenderer } from '../render/ArenaRenderer';
import { useGameSocket } from '../context/GameSocketContext';
import { BoardUnit, BASE_ITEMS, BaseItemId } from '@autobattler/shared';
import { InspectedUnitData } from './HUD/UnitInspector';
import { FlyingLootOverlay, FlyingLootData } from './HUD/FlyingLootOverlay';

function getPveEnemyBoard(stage: number, roundInStage: number): (BoardUnit | null)[][] {
  const board: (BoardUnit | null)[][] = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];

  let unitId = 'cornish_pixie';
  let count = 2;
  let hp = 190;

  if (stage === 1) {
    if (roundInStage === 1) {
      unitId = 'cornish_pixie';
      count = 2;
      hp = 190;
    } else if (roundInStage === 2) {
      unitId = 'cornish_pixie';
      count = 3;
      hp = 190;
    } else {
      unitId = 'garden_gnome';
      count = 2;
      hp = 280;
    }
  } else if (stage === 2) {
    unitId = 'garden_gnome';
    count = 3;
    hp = 750;
  } else {
    unitId = 'acromantula_hatchling';
    count = 3;
    hp = 1100;
  }

  const positions = count === 2 ? [3, 4] : [2, 4, 5];
  for (let i = 0; i < count; i++) {
    const col = positions[i];
    board[0][col] = {
      id: `pve_creep_preview_${i}`,
      unitId,
      starLevel: 1,
      position: { x: col, y: 0 },
      items: [],
      currentHp: hp,
      maxHp: hp,
      currentMana: 0,
      maxMana: 100,
    };
  }

  return board;
}

export const ArenaCanvas: React.FC<{
  viewingPlayerId?: string;
  selectedBenchIndex: number | null;
  selectedItemSlot: number | null;
  onClearSelection: () => void;
  onInspectUnit?: (data: InspectedUnitData | null) => void;
  onInspectUnitUpdate?: (updater: (prev: InspectedUnitData | null) => InspectedUnitData | null) => void;
  onHoverUnit?: (info: { source: 'board' | 'bench'; x: number; y?: number } | null) => void;
  onDragUnitStart?: (info: { unit?: any; source: 'board' | 'bench'; x: number; y?: number; refundGold: number }) => void;
  onDragUnitEnd?: () => void;
}> = ({
  viewingPlayerId,
  selectedBenchIndex,
  selectedItemSlot,
  onClearSelection,
  onInspectUnit,
  onInspectUnitUpdate,
  onHoverUnit,
  onDragUnitStart,
  onDragUnitEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ArenaRenderer | null>(null);
  const { matchState, playerId, sendAction, activeCombatResult } = useGameSocket();
  const [isDragOver, setIsDragOver] = useState(false);

  const activeViewingId = viewingPlayerId || playerId;
  const isScouting = activeViewingId !== playerId;

  // Keep references to latest props and actions to avoid tearing down PixiJS renderer
  const selectedItemSlotRef = useRef(selectedItemSlot);
  selectedItemSlotRef.current = selectedItemSlot;

  const onClearSelectionRef = useRef(onClearSelection);
  onClearSelectionRef.current = onClearSelection;

  const onInspectUnitRef = useRef(onInspectUnit);
  onInspectUnitRef.current = onInspectUnit;

  const onInspectUnitUpdateRef = useRef(onInspectUnitUpdate);
  onInspectUnitUpdateRef.current = onInspectUnitUpdate;

  const onHoverUnitRef = useRef(onHoverUnit);
  onHoverUnitRef.current = onHoverUnit;

  const onDragUnitStartRef = useRef(onDragUnitStart);
  onDragUnitStartRef.current = onDragUnitStart;

  const onDragUnitEndRef = useRef(onDragUnitEnd);
  onDragUnitEndRef.current = onDragUnitEnd;

  const sendActionRef = useRef(sendAction);
  sendActionRef.current = sendAction;

  const lastRenderHashRef = useRef<string>('');
  const lastCombatMatchRef = useRef<string>('');

  // 1. Initialize ArenaRenderer once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new ArenaRenderer(containerRef.current);
    rendererRef.current = renderer;

    renderer.init().then(() => {
      renderer.onMoveRequest = (from, to) => {
        sendActionRef.current({ type: 'MOVE_UNIT', from, to });
      };

      renderer.onSellRequest = (source, x, y) => {
        sendActionRef.current({ type: 'SELL_UNIT', source, x, y });
      };

      renderer.onUnitInspect = (unit) => {
        renderer.inspectedUnitId = unit.id;
        if (onInspectUnitRef.current) {
          onInspectUnitRef.current({
            id: unit.id,
            unitDefId: unit.unitId,
            starLevel: unit.starLevel,
            currentHp: unit.currentHp,
            maxHp: unit.maxHp,
            currentMana: unit.currentMana,
            maxMana: unit.maxMana,
            items: unit.items,
          });
        }
      };

      renderer.onUnitInspectUpdate = (data) => {
        if (onInspectUnitUpdateRef.current) {
          onInspectUnitUpdateRef.current((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              ...data,
            };
          });
        }
      };

      renderer.onHoverUnit = (info) => {
        onHoverUnitRef.current?.(info);
      };

      renderer.onDragUnitStart = (info) => {
        onDragUnitStartRef.current?.(info);
      };

      renderer.onDragUnitEnd = () => {
        onDragUnitEndRef.current?.();
      };

      renderer.onUnitDeselect = () => {
        renderer.inspectedUnitId = null;
        if (onInspectUnitRef.current) {
          onInspectUnitRef.current(null);
        }
        if (onClearSelectionRef.current) {
          onClearSelectionRef.current();
        }
      };
    });

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // 2. Clear visual highlights on canvas if inspected unit closes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.clearHighlights();
    }
  }, []);

  // 3. Stable Canvas Updates
  useEffect(() => {
    if (!rendererRef.current || !matchState) return;

    const player = matchState.players[activeViewingId];
    if (!player) return;

    if (matchState.phase === 'PLANNING' || matchState.phase === 'LOBBY') {
      let opponentBoard: (BoardUnit | null)[][] | undefined = undefined;

      // In PvE prep time: show the enemies
      if (matchState.isPveRound) {
        opponentBoard = getPveEnemyBoard(matchState.stage, matchState.roundInStage);
      }
      // In PvP pre-start: show enemies at T - 1 second
      else if (matchState.phaseTimeRemaining <= 1) {
        const opp = player.opponentId ? matchState.players[player.opponentId] : undefined;
        opponentBoard = opp?.board;
      }

      const showOpponent = Boolean(opponentBoard);
      const currentHash = `${matchState.phase}_${activeViewingId}_${JSON.stringify(
        player.board
      )}_${showOpponent ? JSON.stringify(opponentBoard) : 'hidden'}_${player.gold}`;

      if (lastRenderHashRef.current !== currentHash) {
        lastRenderHashRef.current = currentHash;
        lastCombatMatchRef.current = '';
        rendererRef.current.renderPlanningState(
          player.board,
          opponentBoard,
          player.gold,
          isScouting
        );
      }
    } else if (matchState.phase === 'COMBAT' || matchState.phase === 'RESOLUTION') {
      // Find combat result for currently viewed board (own board or scouted player)
      const viewingCombatResult =
        matchState.combatResults[activeViewingId] ||
        matchState.combatResults[`${activeViewingId}_vs_pve`] ||
        (player.opponentId ? matchState.combatResults[`${activeViewingId}_vs_${player.opponentId}`] : undefined) ||
        (!isScouting ? activeCombatResult : undefined);

      if (viewingCombatResult) {
        const combatKey = `${matchState.stage}_${matchState.roundInStage}_${activeViewingId}_${viewingCombatResult.homePlayerId}_vs_${viewingCombatResult.awayPlayerId}`;

        if (lastCombatMatchRef.current !== combatKey) {
          lastCombatMatchRef.current = combatKey;
          lastRenderHashRef.current = '';

          // Calculate current timestamp in combat to jump into the fight at the current moment
          const elapsedSec = Math.max(0, matchState.phaseDuration - matchState.phaseTimeRemaining);
          const startTick = elapsedSec * 20; // 20 ticks per sec

          rendererRef.current.startCombatPlayback(viewingCombatResult, player.gold, startTick);
        } else {
          // Gold / econ update during combat - update interest orbs without restarting combat playback
          rendererRef.current.renderInterestMarkers(player.gold);
        }
      } else {
        // Fallback if no combat result found
        const currentHash = `scouting_combat_${activeViewingId}_${JSON.stringify(player.board)}_${player.gold}`;
        if (lastRenderHashRef.current !== currentHash) {
          lastRenderHashRef.current = currentHash;
          rendererRef.current.renderPlanningState(player.board, undefined, player.gold, true);
        }
      }
    }
  }, [matchState, activeViewingId, isScouting, activeCombatResult]);

  // 4. PvE Item Drop Flying Animation Observer
  const previousItemBenchRef = useRef<(string | null)[]>([]);
  const [flyingLoots, setFlyingLoots] = useState<FlyingLootData[]>([]);

  useEffect(() => {
    if (!matchState || !playerId) return;
    const player = matchState.players[playerId];
    if (!player) return;

    const currentItemBench = player.itemBench || [];
    const prevItemBench = previousItemBenchRef.current;

    // Detect newly gained items (e.g. from PvE round victory drops)
    if (prevItemBench.length > 0) {
      const prevInventory: Record<string, number> = {};
      for (const item of prevItemBench) {
        if (item) {
          prevInventory[item] = (prevInventory[item] || 0) + 1;
        }
      }

      const currentInventory: Record<string, number> = {};
      for (const item of currentItemBench) {
        if (item) {
          currentInventory[item] = (currentInventory[item] || 0) + 1;
        }
      }

      // Track newly added excess item instances
      const newItemsAvailable: Record<string, number> = {};
      for (const [item, count] of Object.entries(currentInventory)) {
        const prevCount = prevInventory[item] || 0;
        if (count > prevCount) {
          newItemsAvailable[item] = count - prevCount;
        }
      }

      for (let slot = 0; slot < currentItemBench.length; slot++) {
        const currentItem = currentItemBench[slot];
        const prevItem = prevItemBench[slot];

        // Only spawn flying drop animation if this slot holds a genuine newly added component drop
        if (
          currentItem &&
          !prevItem &&
          newItemsAvailable[currentItem] &&
          newItemsAvailable[currentItem] > 0 &&
          BASE_ITEMS[currentItem as BaseItemId]
        ) {
          newItemsAvailable[currentItem]--;

          // New item appeared! Spawn flying loot animation from enemy death location to item bench
          let startX = window.innerWidth / 2;
          let startY = window.innerHeight / 3;

          if (rendererRef.current && containerRef.current) {
            const canvasPos = rendererRef.current.getLastEnemyDeathCanvasPos();
            const canvasRect = containerRef.current.getBoundingClientRect();
            startX = canvasRect.left + canvasPos.x;
            startY = canvasRect.top + canvasPos.y;
          }

          // Target item slot position
          let targetX = 120 + slot * 48;
          let targetY = window.innerHeight - 60;
          const slotElem = document.getElementById(`item-bench-slot-${slot}`);
          if (slotElem) {
            const rect = slotElem.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }

          const newLoot: FlyingLootData = {
            id: `loot_${Date.now()}_${slot}_${Math.random().toString(36).substring(2, 5)}`,
            itemKey: currentItem,
            startX,
            startY,
            targetX,
            targetY,
            startTime: Date.now(),
            duration: 1100,
          };

          setFlyingLoots((prev) => [...prev, newLoot]);
        }
      }
    }

    previousItemBenchRef.current = [...currentItemBench];
  }, [matchState, playerId]);

  // 5. HTML5 Drag & Drop Handlers on the WebGL Board Canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (isScouting) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!rendererRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const coords = rendererRef.current.getGridCoords(x, y);
    if (coords && coords.row >= 4 && coords.row < 8) {
      rendererRef.current.highlightTile(coords.col, coords.row, 0x10b981);
    } else {
      rendererRef.current.clearHighlights();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isScouting) return;
    e.preventDefault();
    setIsDragOver(false);
    if (!rendererRef.current || !containerRef.current) return;

    rendererRef.current.clearHighlights();
    const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      const rect = containerRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const coords = rendererRef.current.getGridCoords(dropX, dropY);
      if (!coords || coords.row < 4 || coords.row >= 8) return;

      const { col, boardY } = coords;
      const type = (data.type || '').toUpperCase();

      if (type === 'UNIT') {
        sendAction({
          type: 'MOVE_UNIT',
          from: { area: data.source, x: data.x, y: data.y },
          to: { area: 'board', x: col, y: boardY },
        });
      } else if (type === 'ITEM') {
        const itemSlot = data.slot !== undefined ? data.slot : data.itemSlot;
        sendAction({
          type: 'EQUIP_ITEM',
          itemSlot,
          target: { area: 'board', x: col, y: boardY },
        });
      }
    } catch {
      // Ignore invalid JSON drag data
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragEnter={() => !isScouting && setIsDragOver(true)}
        onDragLeave={() => {
          setIsDragOver(false);
          rendererRef.current?.clearHighlights();
        }}
        onDrop={handleDrop}
        className={`w-full h-full relative cursor-default select-none transition-colors duration-200 ${
          isDragOver ? 'ring-2 ring-indigo-500/50 bg-indigo-950/20' : ''
        }`}
      />

      {/* Floating Animated PvE Loot Drop Overlay */}
      <FlyingLootOverlay
        flyingLoot={flyingLoots}
        onLootArrived={(id) =>
          setFlyingLoots((prev) => prev.filter((loot) => loot.id !== id))
        }
      />
    </>
  );
};
