import React, { useState } from 'react';
import { useGameSocket } from '../context/GameSocketContext';
import { Shield, Sparkles, Swords, Users, Bot, BookOpen, Layers } from 'lucide-react';
import { ItemRecipeModal } from './HUD/ItemRecipeModal';
import { SynergyGuideModal } from './HUD/SynergyGuideModal';

export const LobbyScreen: React.FC = () => {
  const { connectToRoom } = useGameSocket();
  const [name, setName] = useState('Tactician');
  const [roomId, setRoomId] = useState('default');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSynergyModal, setShowSynergyModal] = useState(false);

  const handleStartSolo = () => {
    const soloRoomId = `solo_${Date.now()}`;
    connectToRoom(soloRoomId, name.trim() || 'Tactician');
  };

  const handleJoinMultiplayer = () => {
    connectToRoom(roomId.trim() || 'default', name.trim() || 'Tactician');
  };

  return (
    <div className="flex-1 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-indigo-500/10 animate-pulse pointer-events-none" />
      <div className="absolute w-[900px] h-[900px] rounded-full border border-amber-500/5 pointer-events-none" />

      {/* Main Card */}
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 z-10">
        {/* Title & Badge */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-2xl shadow-lg">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-slate-100 to-indigo-300">
            AUTO BATTLER 8P
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            8-Player Authoritative Tactical Auto Battler
          </p>
        </div>

        {/* Player Name Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tactician Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            placeholder="Enter summoner name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Game Mode Buttons */}
        <div className="flex flex-col gap-3">
          {/* Solo Match (Instant Bots) */}
          <button
            onClick={handleStartSolo}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm"
          >
            <Bot className="w-5 h-5 text-slate-950" />
            <span>Play Solo vs 7 Bots</span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] text-slate-500 font-bold uppercase">or multiplayer</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Multiplayer Room */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleJoinMultiplayer}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg py-2.5 px-4 flex items-center gap-1.5 transition active:scale-95 text-sm shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>Join</span>
            </button>
          </div>
        </div>

        {/* Recipe Book & Synergy Compendium Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowItemModal(true)}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Item Matrix</span>
          </button>

          <button
            onClick={() => setShowSynergyModal(true)}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
          >
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">Synergies & Units</span>
          </button>
        </div>

        {/* Quick Rules Footer */}
        <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-500 flex flex-col gap-1 text-center">
          <span>• 3 copies of 1★ $\rightarrow$ 2★ unit; 3 copies of 2★ $\rightarrow$ 3★ unit</span>
          <span>• Save gold for interest (max +5 gold at 50g)</span>
          <span>• Last tactician standing wins the match!</span>
        </div>
      </div>

      <ItemRecipeModal isOpen={showItemModal} onClose={() => setShowItemModal(false)} />
      <SynergyGuideModal isOpen={showSynergyModal} onClose={() => setShowSynergyModal(false)} />
    </div>
  );
};

