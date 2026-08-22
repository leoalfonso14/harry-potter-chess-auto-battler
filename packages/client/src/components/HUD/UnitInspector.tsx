import React from 'react';
import { BoardUnit, UNITS, ALL_ITEMS, UnitDefinition } from '@autobattler/shared';
import { X, Shield, Zap, Sparkles, Swords, Heart, Crosshair, Wand2 } from 'lucide-react';

export interface InspectedUnitData {
  id?: string;
  unitDefId: string;
  starLevel?: number;
  currentHp?: number;
  maxHp?: number;
  currentShield?: number;
  currentMana?: number;
  maxMana?: number;
  attackDamage?: number;
  attackSpeed?: number;
  items?: string[];
  statusEffects?: string[];
  effectiveArmor?: number;
  effectiveMagicResist?: number;
}

const roleData: Record<string, { label: string; title: string; desc: string }> = {
  Tank: {
    label: '🛡️ Tank',
    title: '🛡️ Tank Role',
    desc: 'Absorbs frontline damage. Only role gaining mana when hit (+5 mana/attack + damage taken). Prioritized by enemies on distance ties.',
  },
  Fighter: {
    label: '⚔️ Fighter',
    title: '⚔️ Fighter Role',
    desc: 'Durable melee frontliner. Gains +10 mana/attack and has inherent 10% Omnivamp (heals for 10% of damage dealt).',
  },
  Caster: {
    label: '✨ Caster',
    title: '✨ Caster Role',
    desc: 'Relies on active spells. Gains +10 mana/attack plus baseline passive mana generation per second.',
  },
  Marksman: {
    label: '🎯 Marksman',
    title: '🎯 Marksman Role',
    desc: 'Ranged physical carry scaling with attack speed. Generates +10 mana per basic attack.',
  },
  Assassin: {
    label: '🗡️ Assassin',
    title: '🗡️ Assassin Role',
    desc: 'Fragile mobile backline diver. Low targeting priority if a Tank or Fighter is nearby. Gains +10 mana/attack.',
  },
  Specialist: {
    label: '🔮 Specialist',
    title: '🔮 Specialist Role',
    desc: 'Unique champion that utilizes alternate resource mechanics or custom rules.',
  },
};

export const UnitInspector: React.FC<{
  inspectedUnit: InspectedUnitData | null;
  onClose: () => void;
}> = ({ inspectedUnit, onClose }) => {
  if (!inspectedUnit) return null;

  const def: UnitDefinition | undefined = UNITS[inspectedUnit.unitDefId];
  if (!def) return null;

  const starLevel = inspectedUnit.starLevel || 1;
  const starIdx = Math.max(0, Math.min(2, starLevel - 1));

  const maxHp = inspectedUnit.maxHp || def.stats.hp[starIdx];
  const currentHp = inspectedUnit.currentHp !== undefined ? Math.max(0, inspectedUnit.currentHp) : maxHp;
  const currentShield = inspectedUnit.currentShield || 0;
  const maxMana = inspectedUnit.maxMana || def.stats.maxMana;
  const currentMana = inspectedUnit.currentMana !== undefined ? Math.max(0, inspectedUnit.currentMana) : def.stats.startingMana;
  const currentSpeed = inspectedUnit.attackSpeed !== undefined ? inspectedUnit.attackSpeed.toFixed(2) : def.stats.attackSpeed.toFixed(2);
  const currentAD = inspectedUnit.attackDamage !== undefined ? inspectedUnit.attackDamage : def.stats.attackDamage[starIdx];

  const hasSunder = inspectedUnit.statusEffects?.includes('sunder');
  const hasSmSunder = inspectedUnit.statusEffects?.includes('smSunder');
  const hasShred = inspectedUnit.statusEffects?.includes('shred');
  const hasSmShred = inspectedUnit.statusEffects?.includes('smShred');

  const baseArmor = def.stats.armor;
  const effectiveArmor =
    inspectedUnit.effectiveArmor !== undefined
      ? inspectedUnit.effectiveArmor
      : hasSunder
      ? Math.round(baseArmor * 0.7)
      : hasSmSunder
      ? Math.round(baseArmor * 0.8)
      : baseArmor;

  const baseMR = def.stats.magicResist;
  const effectiveMR =
    inspectedUnit.effectiveMagicResist !== undefined
      ? inspectedUnit.effectiveMagicResist
      : hasShred
      ? Math.round(baseMR * 0.7)
      : hasSmShred
      ? Math.round(baseMR * 0.8)
      : baseMR;

  const costBadges: Record<number, string> = {
    1: 'bg-slate-700 text-slate-200',
    2: 'bg-emerald-700 text-white',
    3: 'bg-blue-700 text-white',
    4: 'bg-purple-700 text-white',
    5: 'bg-amber-500 text-slate-950 font-black',
  };

  const currentRole = def.combatRole && roleData[def.combatRole];

  return (
    <div className="fixed top-14 right-60 z-50 max-w-sm w-80 bg-[#0a0e1a] border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-black flex flex-col gap-3 animate-fade-in select-none">
      {/* Header: Name, Star Level, Cost, Close */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-100">{def.name}</span>
            <span className="text-xs text-amber-400 font-bold">{'★'.repeat(starLevel)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${costBadges[def.cost]}`}>
              ${def.cost} Gold
            </span>
            {currentRole && (
              <div className="relative group/role">
                <span className="text-[10px] bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold border border-amber-500/30 cursor-help transition flex items-center gap-1">
                  {currentRole.label}
                </span>
                {/* Floating Combat Role Tooltip */}
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#0a0e1a] border border-slate-700/80 rounded-xl p-2.5 shadow-2xl shadow-black z-[9999] opacity-0 group-hover/role:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-1 text-left">
                  <span className="text-xs font-bold text-amber-300 border-b border-slate-800 pb-1">
                    {currentRole.title}
                  </span>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {currentRole.desc}
                  </p>
                </div>
              </div>
            )}
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
              {def.origins.join('/')} • {def.classes.join('/')}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Base Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Heart className="w-3.5 h-3.5" />
          <span>
            HP:{' '}
            <strong className="text-white">
              {currentHp}/{maxHp}
            </strong>
            {currentShield > 0 && (
              <span className="ml-1 text-cyan-300 font-mono text-[10px] font-bold">
                (+{currentShield})
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-400">
          <Zap className="w-3.5 h-3.5" />
          <span>
            Mana:{' '}
            <strong className="text-white">
              {currentMana}/{maxMana}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-orange-400">
          <Swords className="w-3.5 h-3.5" />
          <span>
            AD: <strong className="text-white">{currentAD}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            Speed: <strong className="text-white">{currentSpeed}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-blue-400">
          <Shield className="w-3.5 h-3.5" />
          <span>
            Armor/MR:{' '}
            <strong className={hasSunder || hasSmSunder ? 'text-rose-400' : 'text-white'}>
              {effectiveArmor}
            </strong>
            /
            <strong className={hasShred || hasSmShred ? 'text-purple-300' : 'text-white'}>
              {effectiveMR}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-purple-400">
          <Crosshair className="w-3.5 h-3.5" />
          <span>
            Range:{' '}
            <strong className="text-white">
              {def.stats.range === 1 ? 'Melee (1)' : `${def.stats.range} Tiles`}
            </strong>
          </span>
        </div>
      </div>

      {/* Ability Section */}
      <div className="flex flex-col gap-1.5 bg-[#0e1628] p-2.5 rounded-xl border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            {def.ability.name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">
              {def.ability.targetType}
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-amber-500/30">
              {def.ability.damageType}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {def.ability.description}
        </p>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-indigo-500/20">
          <span className="text-slate-400">Mana Cost:</span>
          <span className="font-mono text-cyan-300 font-bold">{def.ability.manaCost} Mana</span>
        </div>

        {def.ability.damageValues && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Scaling (1★ / 2★ / 3★):</span>
            <span className="font-mono text-amber-300 font-bold">
              {def.ability.damageValues[0]} / {def.ability.damageValues[1]} /{' '}
              {def.ability.damageValues[2]}
            </span>
          </div>
        )}
      </div>

      {/* Equipped Items with Rich Hover Tooltip */}
      {inspectedUnit.items && inspectedUnit.items.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Equipped Items ({inspectedUnit.items.length}/3):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {inspectedUnit.items.map((itmId, idx) => {
              const itm = ALL_ITEMS[itmId];
              if (!itm) return null;

              const statBadges: string[] = [];
              if (itm.stats.hp) statBadges.push(`+${itm.stats.hp} HP`);
              if (itm.stats.attackDamage) statBadges.push(`+${itm.stats.attackDamage} AD`);
              if (itm.stats.abilityPower) statBadges.push(`+${Math.round(itm.stats.abilityPower * 100)}% AP`);
              if (itm.stats.armor) statBadges.push(`+${itm.stats.armor} Armor`);
              if (itm.stats.magicResist) statBadges.push(`+${itm.stats.magicResist} MR`);
              if (itm.stats.attackSpeed) statBadges.push(`+${Math.round(itm.stats.attackSpeed * 100)}% AS`);
              if (itm.stats.critChance) statBadges.push(`+${Math.round(itm.stats.critChance * 100)}% Crit`);
              if (itm.stats.critDamage) statBadges.push(`+${Math.round(itm.stats.critDamage * 100)}% Crit Dmg`);
              if (itm.stats.dodgeChance) statBadges.push(`+${Math.round(itm.stats.dodgeChance * 100)}% Dodge`);
              if (itm.stats.startingMana) statBadges.push(`+${itm.stats.startingMana} Mana`);
              if (itm.stats.manaPerSecond) statBadges.push(`+${itm.stats.manaPerSecond} Mana/s`);

              return (
                <div key={idx} className="relative group/itm">
                  <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 hover:border-amber-500/50 text-xs text-slate-200 cursor-help transition shadow-sm">
                    <span className="text-base leading-none">{itm.icon}</span>
                    <span className="font-semibold text-[11px] text-amber-200">{itm.name}</span>
                  </div>

                  {/* Rich Floating Item Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0e1a] border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-black z-[9999] opacity-0 group-hover/itm:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-2 text-left">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{itm.icon}</span>
                        <span className="text-xs font-bold text-amber-300">{itm.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {itm.isArtifact ? 'Artifact' : 'Component'}
                      </span>
                    </div>

                    {statBadges.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {statBadges.map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[9px] font-mono font-bold bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {itm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
