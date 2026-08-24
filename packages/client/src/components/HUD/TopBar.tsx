import React, { useState } from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { Check, Flag, AlertTriangle } from 'lucide-react';
import ReactDOM from 'react-dom';

interface RoundNodeInfo {
  round: number;
  type: 'pvp' | 'pve' | 'choice' | 'boss';
  icon: string;
  label: string;
}

function getStageRounds(stage: number): RoundNodeInfo[] {
  if (stage === 1) {
    return [
      { round: 1, type: 'pve', icon: '👾', label: '1-1 Pixies' },
      { round: 2, type: 'pve', icon: '👾', label: '1-2 Swarm' },
      { round: 3, type: 'pve', icon: '👾', label: '1-3 Gnomes' },
    ];
  }

  return [
    { round: 1, type: 'pvp', icon: '🪖', label: `${stage}-1 PvP` },
    { round: 2, type: 'pvp', icon: '🪖', label: `${stage}-2 PvP` },
    { round: 3, type: 'pvp', icon: '🪖', label: `${stage}-3 PvP` },
    { round: 4, type: 'choice', icon: '✦', label: `${stage}-4 Armory` },
    { round: 5, type: 'pvp', icon: '🪖', label: `${stage}-5 PvP` },
    { round: 6, type: 'pvp', icon: '🪖', label: `${stage}-6 PvP` },
    { round: 7, type: 'boss', icon: '🐉', label: `${stage}-7 Boss` },
  ];
}

export const TopBar: React.FC = () => {
  const { matchState, playerId, sendAction, disconnectAndReturnToLobby } = useGameSocket();
  const [showForfeitModal, setShowForfeitModal] = useState(false);

  if (!matchState) return null;

  const player = matchState.players[playerId];
  if (!player) return null;

  const boardCount = player.board.flat().filter(Boolean).length;
  const stageRounds = getStageRounds(matchState.stage);

  const phaseLabel =
    matchState.phase === 'PLANNING'
      ? 'Planning'
      : matchState.phase === 'COMBAT'
      ? 'Combat'
      : matchState.phase === 'RESOLUTION'
      ? 'Resolution'
      : matchState.phase === 'LOBBY'
      ? 'Lobby'
      : 'Game Over';

  const handleConfirmForfeit = () => {
    sendAction({ type: 'SURRENDER' });
    setShowForfeitModal(false);
    disconnectAndReturnToLobby();
  };

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-2 flex items-center justify-between z-30 select-none shadow-xl">
      {/* Left: Minimal Match Brand */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Hogwarts Tactics
          </span>
          <span className="text-sm font-extrabold font-fantasy tracking-wider text-amber-200">
            AUTO BATTLER 8P
          </span>
        </div>
      </div>

      {/* Center: Stage Timeline & Panning Phase Dial */}
      <div className="flex flex-col items-center gap-1">
        {/* Top: TFT-style Stage Timeline Bar with Stage Counter on the Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800 shadow-inner">
            {stageRounds.map((node) => {
              const isPast = node.round < matchState.roundInStage;
              const isCurrent = node.round === matchState.roundInStage;

              return (
                <div
                  key={node.round}
                  title={node.label}
                  className={`relative flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 font-black'
                      : isPast
                      ? 'bg-slate-800/80 text-slate-400 border border-slate-700'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/80 opacity-60'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-3 h-3 text-amber-400/80 stroke-[3]" />
                  ) : (
                    <span>{node.icon}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage Counter placed directly to the right of timeline bar */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Stage
            </span>
            <span className="font-mono-stat font-extrabold text-sm text-amber-300">
              {matchState.stage}-{matchState.roundInStage}
            </span>
          </div>
        </div>

        {/* Bottom: Smaller Planning / Counting Down Pill */}
        <div className="flex items-center justify-between gap-4 px-4 py-1 rounded-full bg-slate-900/95 border border-slate-800/90 shadow-lg min-w-[240px]">
          {/* Phase Name */}
          <span className="text-xs font-extrabold tracking-wide text-slate-200 uppercase min-w-[65px]">
            {phaseLabel}
          </span>

          {/* Central Circular Countdown Dial */}
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-black text-xs shadow-inner ring-1 transition-all ${
              matchState.phase === 'PLANNING' && matchState.phaseTimeRemaining <= 5
                ? 'border-red-500 bg-red-950 text-red-300 ring-red-500/50 animate-pulse scale-110'
                : 'border-amber-400 bg-slate-950 text-amber-300 ring-slate-800'
            }`}
          >
            {matchState.phaseTimeRemaining}
          </div>

          {/* Board Unit Count vs Level Capacity */}
          <span className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1.5 min-w-[65px]">
            <span className="text-xs">🛡️</span>
            <span className="font-mono-stat font-extrabold text-indigo-300">
              {boardCount}/{player.level}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Round State Description & Forfeit Button */}
      <div className="flex items-center gap-4">
        <div className="text-right flex flex-col hidden sm:flex">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Current Match
          </span>
          <span className="text-xs font-bold text-amber-300">
            {matchState.isChoiceRound
              ? '✦ Armory Round'
              : matchState.isPveRound
              ? '👾 Creep Encounter'
              : player.opponentId
              ? `⚔️ vs ${matchState.players[player.opponentId]?.name.split(' ')[0]}`
              : '⚔️ PvP Battle'}
          </span>
        </div>

        {/* Forfeit / Surrender Button */}
        <button
          onClick={() => setShowForfeitModal(true)}
          className="text-xs font-bold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900 border border-rose-700/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Forfeit / Surrender Match"
        >
          <Flag className="w-3.5 h-3.5 text-rose-400" />
          <span>Forfeit</span>
        </button>
      </div>

      {/* Forfeit Confirmation Modal */}
      {showForfeitModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-slate-950 border border-rose-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-extrabold text-slate-100">Forfeit Match?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to surrender? You will take your current placement and return to the main lobby.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowForfeitModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmForfeit}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-lg shadow-rose-900/50"
                >
                  Confirm Forfeit
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
