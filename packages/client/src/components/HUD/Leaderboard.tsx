import React from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { Bot, Eye, Flame, Skull, Snowflake, Swords, User } from 'lucide-react';

export const Leaderboard: React.FC<{
  viewingPlayerId?: string;
  onSelectPlayer?: (pId: string) => void;
}> = ({ viewingPlayerId, onSelectPlayer }) => {
  const { matchState, playerId } = useGameSocket();

  if (!matchState) return null;

  const currentOpponentId = matchState.players[playerId]?.opponentId;
  const activeViewingId = viewingPlayerId || playerId;

  return (
    <aside className="w-56 bg-slate-950/95 backdrop-blur border-l border-slate-800 p-2.5 flex flex-col gap-2 z-10 select-none overflow-y-auto">
      {/* Clean list of players */}
      <div className="flex flex-col gap-1.5 pt-1">
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
              className={`p-2 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer transform hover:-translate-x-1 ${
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
                        ? 'text-indigo-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {p.name} {isMe ? '(You)' : ''}
                  </span>
                </div>

                {/* Status or Streak */}
                {p.isEliminated ? (
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5 shrink-0">
                    <Skull className="w-3 h-3" /> #{p.placement}
                  </span>
                ) : isOpponent ? (
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5 animate-pulse shrink-0">
                    <Swords className="w-3 h-3" /> VS
                  </span>
                ) : p.streak !== 0 ? (
                  <span className="text-[10px] font-mono-stat font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                    {p.streak > 0 ? (
                      <Flame className="w-3 h-3 fill-amber-400" />
                    ) : (
                      <Snowflake className="w-3 h-3 text-blue-400" />
                    )}
                    {Math.abs(p.streak)}
                  </span>
                ) : null}
              </div>

              {/* Health Gauge */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      hpPercent > 50
                        ? 'bg-emerald-500'
                        : hpPercent > 25
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono-stat font-extrabold text-slate-300 w-6 text-right">
                  {p.health}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
