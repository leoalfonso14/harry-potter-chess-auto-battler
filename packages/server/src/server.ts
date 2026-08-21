import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { AutoBattlerRoom } from './rooms/AutoBattlerRoom.js';
import { ClientAction } from '@autobattler/shared';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const rooms = new Map<string, AutoBattlerRoom>();

// Get default or existing room
function getOrCreateRoom(roomId: string = 'default'): AutoBattlerRoom {
  let room = rooms.get(roomId);
  if (!room) {
    room = new AutoBattlerRoom(roomId);
    rooms.set(roomId, room);
  }
  return room;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), activeRooms: rooms.size });
});

app.get('/api/rooms', (_req, res) => {
  const roomList = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    phase: r.state.phase,
    round: r.state.round,
    players: Object.keys(r.state.players).length,
    clients: r.clients.size,
  }));
  res.json({ rooms: roomList });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const roomId = url.searchParams.get('roomId') || 'default';
  const playerId =
    url.searchParams.get('playerId') || `player_${Math.random().toString(36).substring(2, 7)}`;
  const playerName = url.searchParams.get('playerName') || 'Summoner';

  const room = getOrCreateRoom(roomId);
  room.addClient(playerId, playerName, ws);

  console.log(`[WS] Player connected: ${playerName} (${playerId}) in room: ${roomId}`);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'ACTION' && data.action) {
        room.handleAction(playerId, data.action as ClientAction);
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Player disconnected: ${playerId}`);
    room.removeClient(playerId);
  });
});

server.listen(port, () => {
  console.log(`🚀 Auto Battler Game Server running on port ${port}`);
});
