import React from 'react';
import { BoardUnit, UNITS, ALL_ITEMS, UnitDefinition, TRAITS } from '@autobattler/shared';
import { X, Shield, Zap, Sparkles, Swords, Heart, Crosshair, Wand2 } from 'lucide-react';
import { getUnitPortraitUrl, getUnitIcon, hasUnitImage } from '../../render/unit-assets.js';

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

const COST_CARD_STYLES: Record<number, { border: string; bg: string; badge: string }> = {
  1: { border: 'border-slate-600/90 shadow-slate-900/40', bg: 'bg-[#0b101b]/95', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  2: { border: 'border-emerald-600/90 shadow-emerald-950/40', bg: 'bg-[#081510]/95', badge: 'bg-emerald-900/80 text-emerald-200 border-emerald-600' },
  3: { border: 'border-blue-600/90 shadow-blue-950/40', bg: 'bg-[#081120]/95', badge: 'bg-blue-900/80 text-blue-200 border-blue-600' },
  4: { border: 'border-purple-600/90 shadow-purple-950/40', bg: 'bg-[#120a1f]/95', badge: 'bg-purple-900/80 text-purple-200 border-purple-600' },
  5: { border: 'border-amber-400 shadow-amber-500/20', bg: 'bg-[#181105]/95', badge: 'bg-amber-500 text-slate-950 font-black border-amber-300' },
};

const ROLE_ICONS: Record<string, { icon: string; color: string; desc: string }> = {
  Tank: {
    icon: '🛡️',
    color: 'bg-blue-950/80 text-blue-300 border-blue-600/40',
    desc: 'Absorbs frontline damage. Only role gaining mana when hit (+5 mana/attack + damage taken). Prioritized by enemies on distance ties.',
  },
  Fighter: {
    icon: '⚔️',
    color: 'bg-orange-950/80 text-orange-300 border-orange-600/40',
    desc: 'Durable melee frontliner. Gains +10 mana/attack and has inherent 10% Omnivamp (heals for 10% of damage dealt).',
  },
  Caster: {
    icon: '✨',
    color: 'bg-purple-950/80 text-purple-300 border-purple-600/40',
    desc: 'Relies on active spells. Gains +10 mana/attack plus baseline passive mana generation per second.',
  },
  Marksman: {
    icon: '🎯',
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
    desc: 'Ranged physical carry scaling with attack speed. Generates +10 mana per basic attack.',
  },
  Assassin: {
    icon: '🗡️',
    color: 'bg-rose-950/80 text-rose-300 border-rose-600/40',
    desc: 'Fragile mobile backline diver. Low targeting priority if a Tank or Fighter is nearby. Gains +10 mana/attack.',
  },
  Specialist: {
    icon: '🔮',
    color: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
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

  const costStyle = COST_CARD_STYLES[def.cost] || COST_CARD_STYLES[1];
  const roleInfo = def.combatRole && ROLE_ICONS[def.combatRole];

  return (
    <div className={`fixed top-14 right-60 z-50 max-w-sm w-84 border-2 ${costStyle.border} ${costStyle.bg} backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-fade-in select-none`}>
      {/* Header: Name, Portrait, Star Level, Cost, Close */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/20 relative shadow-inner bg-slate-900 shrink-0 flex items-center justify-center">
            {hasUnitImage(def.id) ? (
              <img
                src={getUnitPortraitUrl(def.id)}
                alt={def.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl pointer-events-none">
                {getUnitIcon(def.id)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 truncate">{def.name}</h3>
              <span className="text-xs text-amber-400 font-bold tracking-widest shrink-0">
                {'★'.repeat(starLevel)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
            {/* Scaling Type Badge (AD / AP / True) */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                def.ability.damageType === 'magic'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                  : def.ability.damageType === 'true'
                  ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              }`}
              title={
                def.ability.damageType === 'magic'
                  ? 'Magic Damage: Scales with Ability Power (AP)'
                  : def.ability.damageType === 'true'
                  ? 'True Damage: Pure Damage ignoring defenses'
                  : 'Physical Damage: Scales with Attack Damage (AD)'
              }
            >
              {def.ability.damageType === 'magic' ? '✨ AP' : def.ability.damageType === 'true' ? '⚡ True' : '⚔️ AD'}
            </span>

            {roleInfo && (
              <div className="relative group/role">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 cursor-help transition ${roleInfo.color}`}
                >
                  <span>{roleInfo.icon}</span>
                  <span>{def.combatRole}</span>
                </span>
                {/* Floating Combat Role Tooltip */}
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#0a0e1a] border border-slate-700/80 rounded-xl p-2.5 shadow-2xl shadow-black z-[9999] opacity-0 group-hover/role:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-1 text-left">
                  <span className="text-xs font-bold text-amber-300 border-b border-slate-800 pb-1">
                    {roleInfo.icon} {def.combatRole} Role
                  </span>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {roleInfo.desc}
                  </p>
                </div>
              </div>
            )}

            {/* Origin & Class Tags */}
            {def.origins.map((orig) => {
              const trDef = TRAITS[orig];
              return (
                <span
                  key={orig}
                  className="text-[10px] font-medium bg-amber-950/50 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <span>{trDef?.icon || '🏛️'}</span>
                  <span>{orig}</span>
                </span>
              );
            })}
            {def.classes.map((cls) => {
              const trDef = TRAITS[cls];
              return (
                <span
                  key={cls}
                  className="text-[10px] font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-600/40 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <span>{trDef?.icon || '⚔️'}</span>
                  <span>{cls}</span>
                </span>
              );
            })}
          </div>
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

      {/* Two-Tone Health & Shield Visual Progress Bar */}
      <div className="flex flex-col gap-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">HP: {currentHp}/{maxHp}</span>
            {currentShield > 0 && (
              <span className="bg-slate-800 text-white border border-slate-600 px-1.5 py-0.2 rounded shadow-sm text-[9px]">
                🛡️ +{currentShield} Shield
              </span>
            )}
          </div>
          <span className="text-cyan-400">
            {currentMana}/{maxMana} Mana
          </span>
        </div>

        {/* Dual HP + Shield Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 flex relative">
          {/* Green Health Portion */}
          <div
            className="h-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${Math.min(100, (currentHp / maxHp) * 100)}%` }}
          />
          {/* Solid White Shield Portion extending to the right */}
          {currentShield > 0 && (
            <div
              className="h-full bg-white border-l border-slate-400 transition-all duration-200 shadow-sm"
              style={{ width: `${Math.min(100 - Math.min(100, (currentHp / maxHp) * 100), (currentShield / maxHp) * 100)}%` }}
            />
          )}
        </div>

        {/* Mana Bar */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-200"
            style={{ width: `${Math.min(100, (currentMana / maxMana) * 100)}%` }}
          />
        </div>
      </div>

      {/* Primary Base Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Heart className="w-3.5 h-3.5" />
          <span>
            HP: <strong className="text-white">{currentHp}/{maxHp}</strong>
          </span>
        </div>

        {currentShield > 0 ? (
          <div className="flex items-center gap-1.5 text-white font-bold bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span>
              Shield: <strong className="text-white">+{currentShield}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>
              Mana: <strong className="text-white">{currentMana}/{maxMana}</strong>
            </span>
          </div>
        )}

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
              {def.stats.range === 1 ? 'Melee (1)' : `${def.stats.range} Hexes`}
            </strong>
          </span>
        </div>
      </div>

      {/* Ability Section */}
      <div className="flex flex-col gap-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              {def.ability.name}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-950 border border-blue-800/80 text-blue-300 px-1.5 py-0.2 rounded">
            {def.ability.manaCost} Mana
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          {def.ability.description}
        </p>

        {/* Dynamic Ability Values (Damage, Shield, Heal) */}
        <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold uppercase">🎯 Scaling:</span>
            <span className={`font-bold ${
              def.ability.damageType === 'magic'
                ? 'text-cyan-300'
                : def.ability.damageType === 'true'
                ? 'text-fuchsia-300'
                : 'text-amber-300'
            }`}>
              {def.ability.damageType === 'magic'
                ? '✨ Magic (Ability Power)'
                : def.ability.damageType === 'true'
                ? '⚡ True Damage (Pure)'
                : '⚔️ Physical (Attack Damage)'}
            </span>
          </div>

          {def.ability.damageValues && (
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-semibold uppercase">💥 Damage:</span>
              <span className="text-red-300 font-bold">
                {def.ability.damageValues[0]} / {def.ability.damageValues[1]} /{' '}
                {def.ability.damageValues[2]}
              </span>
            </div>
          )}
          {def.ability.shieldValues && (
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-semibold uppercase">🛡️ Shield:</span>
              <span className="text-blue-300 font-bold">
                {def.ability.shieldValues[0]} / {def.ability.shieldValues[1]} /{' '}
                {def.ability.shieldValues[2]}
              </span>
            </div>
          )}
          {def.ability.healValues && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold uppercase">💚 Heal:</span>
              <span className="text-emerald-300 font-bold">
                {def.ability.healValues[0]} / {def.ability.healValues[1]} /{' '}
                {def.ability.healValues[2]}
              </span>
            </div>
          )}
        </div>
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

              const isSignature = Boolean(itm.signatureUnits && itm.signatureUnits.includes(def.id));
              const buffPct = itm.signatureUnits && itm.signatureUnits.length === 1 ? 10 : 5;

              return (
                <div key={idx} className="relative group/itm">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs cursor-help transition shadow-sm ${
                      isSignature
                        ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-amber-500/10'
                        : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50 text-slate-200'
                    }`}
                  >
                    <span className="text-base leading-none">{itm.icon}</span>
                    <span className="font-semibold text-[11px] text-amber-200">{itm.name}</span>
                    {isSignature && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1 rounded">
                        +{buffPct}%
                      </span>
                    )}
                  </div>

                  {/* Rich Floating Item Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0e1a] border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-black z-[9999] opacity-0 group-hover/itm:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col gap-2 text-left">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{itm.icon}</span>
                        <span className="text-xs font-bold text-amber-300">{itm.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {itm.isArtifact ? 'Completed Item' : 'Component'}
                      </span>
                    </div>

                    {isSignature && (
                      <div className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                        ✨ Empowered: +{buffPct}% Stats!
                      </div>
                    )}

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

                    {itm.signatureDescription && (
                      <p className="text-[10px] text-amber-300/80 leading-snug pt-1 border-t border-slate-800">
                        ✨ {itm.signatureDescription}
                      </p>
                    )}
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
