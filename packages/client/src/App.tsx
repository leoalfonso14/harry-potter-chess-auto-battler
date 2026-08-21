import React, { useEffect, useState } from 'react';
import { useGameSocket } from './context/GameSocketContext';
import { LobbyScreen } from './components/LobbyScreen';
import { TopBar } from './components/HUD/TopBar';
import { TraitPanel } from './components/HUD/TraitPanel';
import { RightSidebar } from './components/HUD/RightSidebar';
import { ShopTray } from './components/HUD/ShopTray';
import { BenchAndItems } from './components/HUD/BenchAndItems';
import { ArenaCanvas } from './components/ArenaCanvas';
import { ArmoryChoiceModal } from './components/HUD/ArmoryChoiceModal';
import { UnitInspector, InspectedUnitData } from './components/HUD/UnitInspector';
import { Crown, Play, RotateCcw, Skull, Trophy } from 'lucide-react';

export const App: React.FC = () => {
  const { matchState, connected, playerId, sendAction, disconnectAndReturnToLobby } = useGameSocket();
  const [selectedBenchIndex, setSelectedBenchIndex] = useState<number | null>(null);
  const [selectedItemSlot, setSelectedItemSlot] = useState<number | null>(null);
  const [inspectedUnit, setInspectedUnit] = useState<InspectedUnitData | null>(null);
  const [viewingPlayerId, setViewingPlayerId] = useState<string>(playerId);
  const [activeDraggedUnit, setActiveDraggedUnit] = useState<{
    unit?: any;
    source: 'board' | 'bench';
    x: number;
    y?: number;
    refundGold: number;
  } | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<{
    source: 'board' | 'bench';
    x: number;
    y?: number;
  } | null>(null);

  // Sync viewing player with self if playerId updates or match starts
  useEffect(() => {
    if (playerId && (!viewingPlayerId || viewingPlayerId === '')) {
      setViewingPlayerId(playerId);
    }
  }, [playerId, viewingPlayerId]);

  // Global Keyboard Shortcuts (F for XP, D for Reroll, E for Sell hovered unit, ESC to return/close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is inside an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (viewingPlayerId !== playerId) {
          setViewingPlayerId(playerId);
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        sendAction({ type: 'REROLL_SHOP' });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        sendAction({ type: 'BUY_XP' });
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        // Disallow selling on first turn (Round 1-1)
        if (matchState?.stage === 1 && matchState?.roundInStage === 1) {
          return;
        }
        if (hoveredUnit) {
          sendAction({
            type: 'SELL_UNIT',
            source: hoveredUnit.source,
            x: hoveredUnit.x,
            y: hoveredUnit.y,
          });
          setHoveredUnit(null);
        } else if (inspectedUnit?.id) {
          const p = matchState?.players[playerId];
          if (p) {
            const bIdx = p.bench.findIndex((u) => u && u.id === inspectedUnit.id);
            if (bIdx !== -1) {
              sendAction({ type: 'SELL_UNIT', source: 'bench', x: bIdx });
              setInspectedUnit(null);
              return;
            }
            for (let r = 0; r < 4; r++) {
              for (let c = 0; c < 8; c++) {
                if (p.board[r][c]?.id === inspectedUnit.id) {
                  sendAction({ type: 'SELL_UNIT', source: 'board', x: c, y: r });
                  setInspectedUnit(null);
                  return;
                }
              }
            }
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (viewingPlayerId !== playerId) {
          setViewingPlayerId(playerId);
        }
        if (inspectedUnit) {
          setInspectedUnit(null);
        }
        setSelectedBenchIndex(null);
        setSelectedItemSlot(null);
        setActiveDraggedUnit(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerId, viewingPlayerId, inspectedUnit, hoveredUnit, matchState, sendAction]);

  if (!connected || !matchState) {
    return <LobbyScreen />;
  }

  const player = matchState.players[playerId];
  const isLobby = matchState.phase === 'LOBBY';
  const isGameOver = matchState.phase === 'GAME_OVER';
  const isWinner = matchState.winnerId === playerId;

  const handleStartGame = () => {
    sendAction({ type: 'START_GAME' });
  };

  const handleClearSelection = () => {
    setSelectedBenchIndex(null);
    setSelectedItemSlot(null);
    setInspectedUnit(null);
  };

  const handleToggleInspectUnit = (data: InspectedUnitData | null) => {
    if (!data) {
      setInspectedUnit(null);
      return;
    }
    setInspectedUnit((prev) => {
      // Toggle closed if clicking on the same open unit
      if (
        prev &&
        ((data.id && prev.id === data.id) ||
          (!data.id && !prev.id && prev.unitDefId === data.unitDefId && prev.starLevel === data.starLevel))
      ) {
        return null;
      }
      return data;
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none relative">
      {/* Top HUD */}
      <TopBar />

      {/* Main Play Area */}
      <div className="flex-1 flex items-stretch overflow-hidden relative">
        {/* Left Side: Active Traits / Synergies */}
        <TraitPanel viewingPlayerId={viewingPlayerId} />

        {/* Center: Arena WebGL Canvas & Overlays */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-950">
          <ArenaCanvas
            viewingPlayerId={viewingPlayerId}
            selectedBenchIndex={selectedBenchIndex}
            selectedItemSlot={selectedItemSlot}
            onClearSelection={handleClearSelection}
            onInspectUnit={handleToggleInspectUnit}
            onInspectUnitUpdate={setInspectedUnit}
            onHoverUnit={setHoveredUnit}
            onDragUnitStart={setActiveDraggedUnit}
            onDragUnitEnd={() => setActiveDraggedUnit(null)}
          />

          {/* Lobby Waiting Overlay */}
          {isLobby && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-30 p-6">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
                <Crown className="w-10 h-10 text-amber-400" />
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold font-fantasy text-slate-100">
                    Match Room: {matchState.matchId}
                  </h3>
                  <span className="text-xs text-slate-400 mt-1">
                    Players in lobby: {Object.keys(matchState.players).length} / 8
                  </span>
                </div>
                <button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Match (Fill Bots)</span>
                </button>
              </div>
            </div>
          )}

          {/* Victory / Defeat Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fade-in">
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-amber-950/40 flex flex-col items-center text-center gap-5">
                {isWinner ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                      <Trophy className="w-9 h-9 text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-extrabold font-fantasy text-amber-300">
                        Victory!
                      </h2>
                      <span className="text-sm text-slate-400 mt-1">
                        You are the Grand Wizard Champion! (1st Place)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-950/40 border-2 border-red-500/40 flex items-center justify-center">
                      <Skull className="w-9 h-9 text-red-400" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-extrabold font-fantasy text-red-400">
                        Defeated
                      </h2>
                      <span className="text-sm text-slate-400 mt-1">
                        {player?.placement
                          ? `Placement: #${player.placement}`
                          : 'Better luck in the next duel!'}
                      </span>
                    </div>
                  </>
                )}

                <button
                  onClick={disconnectAndReturnToLobby}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl py-2.5 px-6 flex items-center gap-2 transition active:scale-95 shadow-lg text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tabbed Sidebar (Players & Combat Damage Meters) */}
        <RightSidebar
          viewingPlayerId={viewingPlayerId}
          onSelectPlayer={(pId) => setViewingPlayerId(pId)}
        />
      </div>

      {/* Bottom HUD: Bench & Shop */}
      <div className="flex flex-col w-full z-20">
        <BenchAndItems
          viewingPlayerId={viewingPlayerId}
          onReturnToMyBoard={() => setViewingPlayerId(playerId)}
          selectedIndex={selectedBenchIndex}
          selectedItemSlot={selectedItemSlot}
          onSelectItemSlot={setSelectedItemSlot}
          onInspectUnit={handleToggleInspectUnit}
          onHoverUnit={setHoveredUnit}
          onDragUnitStart={setActiveDraggedUnit}
          onDragUnitEnd={() => setActiveDraggedUnit(null)}
          onSelectBenchUnit={(idx) => {
            if (selectedBenchIndex === idx) {
              setSelectedBenchIndex(null);
              setInspectedUnit(null);
            } else {
              setSelectedBenchIndex(idx);
            }
          }}
        />
        <ShopTray
          onInspectUnit={handleToggleInspectUnit}
          activeDraggedUnit={activeDraggedUnit}
          onClearDraggedUnit={() => setActiveDraggedUnit(null)}
        />
      </div>

      {/* Special Armory / Choice Modal */}
      <ArmoryChoiceModal />

      {/* Dedicated Top-Right Unit Inspector Modal */}
      <UnitInspector
        inspectedUnit={inspectedUnit}
        onClose={() => setInspectedUnit(null)}
      />
    </div>
  );
};
