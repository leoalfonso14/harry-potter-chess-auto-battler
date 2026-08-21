import React from 'react';
import { useGameSocket } from '../../context/GameSocketContext';
import { ALL_ITEMS, UNITS, BASE_ITEMS, BaseItemId } from '@autobattler/shared';
import { Sparkles, Wand2, Shield, Swords } from 'lucide-react';

export const ArmoryChoiceModal: React.FC = () => {
  const { matchState, playerId, sendAction } = useGameSocket();

  if (!matchState) return null;

  const player = matchState.players[playerId];
  if (!player || player.isEliminated || !player.armoryChoices) return null;

  const { components, units, chosenComponent, chosenUnit } = player.armoryChoices;

  if (chosenComponent && chosenUnit) return null;

  const handlePickComponent = (compId: string) => {
    sendAction({ type: 'CHOOSE_ARMORY_COMPONENT', componentId: compId });
  };

  const handlePickUnit = (unitId: string) => {
    sendAction({ type: 'CHOOSE_ARMORY_UNIT', unitId });
  };

  const costColorBorders: Record<number, string> = {
    1: 'border-slate-500 bg-slate-900/90 text-slate-300',
    2: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    3: 'border-blue-500 bg-blue-950/40 text-blue-300',
    4: 'border-purple-500 bg-purple-950/40 text-purple-300',
    5: 'border-amber-400 bg-amber-950/40 text-amber-300',
  };

  const costBadges: Record<number, string> = {
    1: 'bg-slate-700 text-slate-200',
    2: 'bg-emerald-600 text-white',
    3: 'bg-blue-600 text-white',
    4: 'bg-purple-600 text-white',
    5: 'bg-amber-500 text-slate-950 font-black',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-4xl w-full p-6 shadow-2xl shadow-amber-950/30 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-fantasy text-2xl font-bold">
            <Sparkles className="w-6 h-6" />
            <span>Room of Requirement Armory</span>
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-400">
            Stage {matchState.stage} Special Draft — Choose 1 Magical Component & 1 Champion
          </p>
        </div>

        {/* Section 1: Choose 1 of 5 Components */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              1. Choose a Magical Component {!chosenComponent ? '(Select 1)' : '✓ Chosen'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {components.map((cId) => {
              const itm = ALL_ITEMS[cId];
              if (!itm) return null;

              return (
                <button
                  key={cId}
                  disabled={chosenComponent}
                  onClick={() => handlePickComponent(cId)}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all duration-200 ${
                    chosenComponent
                      ? 'opacity-40 cursor-default border-slate-800 bg-slate-900/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-amber-400 hover:bg-amber-500/10 hover:scale-105 shadow-md active:scale-95'
                  }`}
                >
                  <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {itm.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100">{itm.name}</span>
                    <span className="text-[11px] text-amber-400 mt-0.5">{itm.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Choose 1 of 8 Champions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              2. Choose a Champion {!chosenUnit ? '(Select 1)' : '✓ Chosen'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {units.map((uId) => {
              const def = UNITS[uId];
              if (!def) return null;

              return (
                <button
                  key={uId}
                  disabled={chosenUnit}
                  onClick={() => handlePickUnit(uId)}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left transition-all duration-200 ${
                    chosenUnit
                      ? 'opacity-40 cursor-default border-slate-800 bg-slate-900/40'
                      : `${costColorBorders[def.cost]} hover:scale-105 hover:border-amber-300 shadow-md active:scale-95`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{def.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${costBadges[def.cost]}`}>
                      ${def.cost}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {def.origins.join('/')}
                    </span>
                    <span className="bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                      {def.classes.join('/')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">
                    {def.ability.name}: {def.ability.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
