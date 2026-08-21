import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { MatchState, ClientAction, CombatResult } from '@autobattler/shared';

const PLAYER_ID_KEY = 'autobattler_player_id';
const PLAYER_NAME_KEY = 'autobattler_player_name';
const ACTIVE_ROOM_KEY = 'autobattler_active_room_id';

interface GameSocketContextValue {
  connected: boolean;
  matchState: MatchState | null;
  playerId: string;
  playerName: string;
  activeCombatResult: CombatResult | null;
  sendAction: (action: ClientAction) => void;
  connectToRoom: (roomId: string, name: string) => void;
  disconnectAndReturnToLobby: () => void;
}

const GameSocketContext = createContext<GameSocketContextValue | null>(null);

export const GameSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [playerId] = useState(() => {
    const stored = localStorage.getItem(PLAYER_ID_KEY);
    if (stored) return stored;
    const newId = `p_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(PLAYER_ID_KEY, newId);
    return newId;
  });
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem(PLAYER_NAME_KEY) || 'Tactician';
  });
  const [activeCombatResult, setActiveCombatResult] = useState<CombatResult | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const connectToRoom = useCallback((roomId: string, name: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setPlayerName(name);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    sessionStorage.setItem(ACTIVE_ROOM_KEY, roomId);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}&playerName=${encodeURIComponent(name)}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'STATE_UPDATE' && msg.state) {
          const newState = msg.state as MatchState;
          setMatchState(newState);

          // Check if there is an active combat result for the player (PvE or PvP)
          if (newState.phase === 'COMBAT' || newState.phase === 'RESOLUTION' || Object.keys(newState.combatResults).length > 0) {
            const player = newState.players[playerId];
            if (player) {
              const res =
                newState.combatResults[playerId] ||
                newState.combatResults[`${playerId}_vs_pve`] ||
                (player.opponentId ? newState.combatResults[`${playerId}_vs_${player.opponentId}`] : undefined);
              if (res) {
                setActiveCombatResult(res);
              }
            }
          }
        }
      } catch (err) {
        console.error('[WS] Failed to parse server message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected from server');
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error('[WS] Socket error:', err);
    };
  }, [playerId]);

  const disconnectAndReturnToLobby = useCallback(() => {
    sessionStorage.removeItem(ACTIVE_ROOM_KEY);
    if (socketRef.current) {
      socketRef.current.close();
    }
    setConnected(false);
    setMatchState(null);
    setActiveCombatResult(null);
  }, []);

  // Auto-reconnect to room on mount if activeRoomId was saved in sessionStorage
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem(ACTIVE_ROOM_KEY);
    const savedName = localStorage.getItem(PLAYER_NAME_KEY) || 'Tactician';
    if (savedRoomId && !socketRef.current) {
      connectToRoom(savedRoomId, savedName);
    }
  }, [connectToRoom]);

  const sendAction = useCallback((action: ClientAction) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'ACTION', action }));
    }
  }, []);

  return (
    <GameSocketContext.Provider
      value={{
        connected,
        matchState,
        playerId,
        playerName,
        activeCombatResult,
        sendAction,
        connectToRoom,
        disconnectAndReturnToLobby,
      }}
    >
      {children}
    </GameSocketContext.Provider>
  );
};

export const useGameSocket = () => {
  const context = useContext(GameSocketContext);
  if (!context) {
    throw new Error('useGameSocket must be used within a GameSocketProvider');
  }
  return context;
};
