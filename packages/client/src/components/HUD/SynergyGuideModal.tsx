import React, { useState, useEffect, useMemo } from 'react';
import { TRAITS, UNITS, UnitDefinition, UnitCost } from '@autobattler/shared';
import { getUnitPortraitUrl, hasUnitImage } from '../../render/unit-assets';
import {
  X,
  Sparkles,
  Search,
  Users,
  Filter,
  Layers,
  ChevronRight,
  Wand2,
} from 'lucide-react';

interface SynergyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'synergies' | 'champions';
  initialSelectedTrait?: string | null;
}

// Cost border & background themes for champion cards
const COST_CARD_STYLES: Record<
  number,
  {
    border: string;
    bg: string;
    badge: string;
    chipBorder: string;
    label: string;
  }
> = {
  1: {
    border: 'border-slate-700 hover:border-slate-500 shadow-slate-900/40',
    bg: 'bg-slate-950/90',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    chipBorder: 'border-slate-600 text-slate-300',
    label: '$1',
  },
  2: {
    border: 'border-emerald-600/80 hover:border-emerald-400 shadow-emerald-950/20',
    bg: 'bg-[#081510]/95',
    badge: 'bg-emerald-900/80 text-emerald-200 border-emerald-600',
    chipBorder: 'border-emerald-500/80 text-emerald-200',
    label: '$2',
  },
  3: {
    border: 'border-blue-600/80 hover:border-blue-400 shadow-blue-950/20',
    bg: 'bg-[#081120]/95',
    badge: 'bg-blue-900/80 text-blue-200 border-blue-600',
    chipBorder: 'border-blue-500/80 text-blue-200',
    label: '$3',
  },
  4: {
    border: 'border-purple-600/80 hover:border-purple-400 shadow-purple-950/20',
    bg: 'bg-[#120a1f]/95',
    badge: 'bg-purple-900/80 text-purple-200 border-purple-600',
    chipBorder: 'border-purple-500/80 text-purple-200',
    label: '$4',
  },
  5: {
    border: 'border-amber-400 hover:border-amber-300 shadow-lg shadow-amber-500/15',
    bg: 'bg-[#181105]/95',
    badge: 'bg-amber-500 text-slate-950 font-black border-amber-300',
    chipBorder: 'border-amber-400 text-amber-200 font-bold',
    label: '$5',
  },
};

const ROLE_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  Tank: { icon: '🛡️', label: 'Tank', color: 'text-blue-300 bg-blue-950/60 border-blue-800/80' },
  Fighter: { icon: '⚔️', label: 'Fighter', color: 'text-red-300 bg-red-950/60 border-red-800/80' },
  Caster: { icon: '✨', label: 'Caster', color: 'text-purple-300 bg-purple-950/60 border-purple-800/80' },
  Marksman: { icon: '🎯', label: 'Marksman', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80' },
  Assassin: { icon: '🗡️', label: 'Assassin', color: 'text-amber-300 bg-amber-950/60 border-amber-800/80' },
  Specialist: { icon: '🔮', label: 'Specialist', color: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/80' },
};

export const SynergyGuideModal: React.FC<SynergyGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'synergies',
  initialSelectedTrait = null,
}) => {
  const [activeTab, setActiveTab] = useState<'synergies' | 'champions'>(initialTab);
  const [traitTypeFilter, setTraitTypeFilter] = useState<'all' | 'origin' | 'class'>('all');
  const [traitSearch, setTraitSearch] = useState('');
  const [hoveredTraitId, setHoveredTraitId] = useState<string | null>(null);

  // Champions tab state
  const [championSearch, setChampionSearch] = useState('');
  const [selectedCostFilter, setSelectedCostFilter] = useState<number | 'all'>('all');
  const [selectedTraitFilter, setSelectedTraitFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      if (initialSelectedTrait) {
        setSelectedTraitFilter(initialSelectedTrait);
      }
    }
  }, [isOpen, initialSelectedTrait]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const allTraits = useMemo(() => Object.values(TRAITS), []);
  const allUnits = useMemo(() => {
    return Object.values(UNITS).sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Map each trait to its member units
  const traitMembersMap = useMemo(() => {
    const map: Record<string, UnitDefinition[]> = {};
    allTraits.forEach((trait) => {
      map[trait.id] = allUnits
        .filter(
          (u) =>
            u.origins.includes(trait.id as any) ||
            u.classes.includes(trait.id as any)
        )
        .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
    });
    return map;
  }, [allTraits, allUnits]);

  // Filtered traits for Tab 1
  const filteredTraits = useMemo(() => {
    return allTraits.filter((t) => {
      if (traitTypeFilter !== 'all' && t.type !== traitTypeFilter) return false;
      if (traitSearch.trim()) {
        const query = traitSearch.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesMembers = traitMembersMap[t.id]?.some((u) =>
          u.name.toLowerCase().includes(query)
        );
        return matchesName || matchesDesc || matchesMembers;
      }
      return true;
    });
  }, [allTraits, traitTypeFilter, traitSearch, traitMembersMap]);

  // Filtered units for Tab 2
  const filteredUnits = useMemo(() => {
    return allUnits.filter((u) => {
      if (selectedCostFilter !== 'all' && u.cost !== selectedCostFilter) return false;
      if (selectedRoleFilter !== 'all' && u.combatRole !== selectedRoleFilter) return false;
      if (selectedTraitFilter !== 'all') {
        const hasOrigin = u.origins.includes(selectedTraitFilter as any);
        const hasClass = u.classes.includes(selectedTraitFilter as any);
        if (!hasOrigin && !hasClass) return false;
      }
      if (championSearch.trim()) {
        const q = championSearch.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesAbility = u.ability.name.toLowerCase().includes(q);
        const matchesDesc = u.ability.description.toLowerCase().includes(q);
        const matchesOrigins = u.origins.some((orig) => orig.toLowerCase().includes(q));
        const matchesClasses = u.classes.some((cls) => cls.toLowerCase().includes(q));
        return matchesName || matchesAbility || matchesDesc || matchesOrigins || matchesClasses;
      }
      return true;
    });
  }, [allUnits, selectedCostFilter, selectedRoleFilter, selectedTraitFilter, championSearch]);

  const handleSelectTraitForFilter = (traitId: string) => {
    setSelectedTraitFilter(traitId);
    setActiveTab('champions');
  };

  const handleClearChampionFilters = () => {
    setChampionSearch('');
    setSelectedCostFilter('all');
    setSelectedTraitFilter('all');
    setSelectedRoleFilter('all');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#090d16] border border-amber-500/30 rounded-2xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl shadow-amber-950/30 flex flex-col gap-4 max-h-[92vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-fantasy text-slate-100 flex items-center gap-2">
                Hogwarts Compendium & Synergies
              </h2>
              <p className="text-xs text-slate-400">
                Explore all House Origins, Combat Classes, trait thresholds, and Champion statistics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setActiveTab('synergies')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === 'synergies'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Origins & Classes</span>
                <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded font-mono">
                  {allTraits.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('champions')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === 'champions'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Champions</span>
                <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded font-mono">
                  {allUnits.length}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: ORIGINS & CLASSES */}
        {activeTab === 'synergies' && (
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTraitTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    traitTypeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All Synergies ({allTraits.length})
                </button>
                <button
                  onClick={() => setTraitTypeFilter('origin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    traitTypeFilter === 'origin'
                      ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Origins ({allTraits.filter((t) => t.type === 'origin').length})
                </button>
                <button
                  onClick={() => setTraitTypeFilter('class')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    traitTypeFilter === 'class'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Classes ({allTraits.filter((t) => t.type === 'class').length})
                </button>
              </div>

              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={traitSearch}
                  onChange={(e) => setTraitSearch(e.target.value)}
                  placeholder="Search traits or member champions..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
                {traitSearch && (
                  <button
                    onClick={() => setTraitSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Synergy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1 pb-4">
              {filteredTraits.map((trait) => {
                const members = traitMembersMap[trait.id] || [];
                const isHovered = hoveredTraitId === trait.id;
                const isOrigin = trait.type === 'origin';

                return (
                  <div
                    key={trait.id}
                    onMouseEnter={() => setHoveredTraitId(trait.id)}
                    onMouseLeave={() => setHoveredTraitId(null)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 relative group ${
                      isHovered
                        ? isOrigin
                          ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-950/20 scale-[1.01]'
                          : 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/20 scale-[1.01]'
                        : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Trait Header */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                            {trait.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm font-bold transition ${
                                  isOrigin
                                    ? 'text-slate-100 group-hover:text-amber-300'
                                    : 'text-slate-100 group-hover:text-indigo-300'
                                }`}
                              >
                                {trait.name}
                              </h3>
                              {/* Unified 1-color Origin badge vs 1-color Class badge */}
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                  isOrigin
                                    ? 'bg-amber-950/50 text-amber-300 border-amber-600/40'
                                    : 'bg-indigo-950/50 text-indigo-300 border-indigo-600/40'
                                }`}
                              >
                                {trait.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {members.length} {members.length === 1 ? 'Champion' : 'Champions'}
                            </span>
                          </div>
                        </div>

                        {/* Quick filter button */}
                        <button
                          onClick={() => handleSelectTraitForFilter(trait.id)}
                          className="text-[10px] text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 transition shrink-0"
                          title="View all units with this trait in the Champions tab"
                        >
                          <span>Filter</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {trait.description}
                      </p>
                    </div>

                    {/* Breakpoints List */}
                    {trait.breakpoints && trait.breakpoints.length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Threshold Bonuses:
                        </span>
                        <div className="flex flex-col gap-1">
                          {trait.breakpoints.map((bp) => (
                            <div
                              key={bp.count}
                              className="text-[11px] text-slate-300 flex items-start gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/50"
                            >
                              <span
                                className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] shrink-0 border ${
                                  isOrigin
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                }`}
                              >
                                ({bp.count})
                              </span>
                              <span className="leading-snug">{bp.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Champions Preview (On Hover & Clickable) */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>Member Champions ({members.length}):</span>
                        </span>
                        <span className="text-[9px] text-slate-500 italic">Click champion to view</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {members.map((u) => {
                          const costStyle = COST_CARD_STYLES[u.cost] || COST_CARD_STYLES[1];
                          const roleInfo = ROLE_ICONS[u.combatRole];

                          return (
                            <button
                              key={u.id}
                              onClick={() => {
                                setChampionSearch(u.name);
                                setActiveTab('champions');
                              }}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] transition duration-150 ${
                                isHovered
                                  ? `${costStyle.chipBorder} bg-slate-900 shadow-sm scale-105`
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                              }`}
                              title={`${u.name} ($${u.cost} ${u.combatRole}) - Click to inspect`}
                            >
                              {roleInfo && <span className="text-xs">{roleInfo.icon}</span>}
                              <span className="font-medium truncate max-w-[110px]">{u.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ALL CHAMPIONS */}
        {activeTab === 'champions' && (
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            {/* Filter Bar */}
            <div className="flex flex-col gap-2.5 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              {/* Row 1: Search & Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search by Name / Ability */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={championSearch}
                    onChange={(e) => setChampionSearch(e.target.value)}
                    placeholder="Search champion name, spell, or keywords..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                  {championSearch && (
                    <button
                      onClick={() => setChampionSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter by Synergy (Origin or Class) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">
                    Trait:
                  </span>
                  <select
                    value={selectedTraitFilter}
                    onChange={(e) => setSelectedTraitFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Origins & Classes</option>
                    <optgroup label="🏰 Origins & Factions">
                      {allTraits
                        .filter((t) => t.type === 'origin')
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.icon} {t.name}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="⚔️ Combat Classes">
                      {allTraits
                        .filter((t) => t.type === 'class')
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.icon} {t.name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Filter by Role */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">
                    Role:
                  </span>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Tank">🛡️ Tank</option>
                    <option value="Fighter">⚔️ Fighter</option>
                    <option value="Caster">✨ Caster</option>
                    <option value="Marksman">🎯 Marksman</option>
                    <option value="Assassin">🗡️ Assassin</option>
                    <option value="Specialist">🔮 Specialist</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(championSearch ||
                  selectedCostFilter !== 'all' ||
                  selectedTraitFilter !== 'all' ||
                  selectedRoleFilter !== 'all') && (
                  <button
                    onClick={handleClearChampionFilters}
                    className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Row 2: Cost Filter Pills & Results count */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-1">Cost:</span>
                  <button
                    onClick={() => setSelectedCostFilter('all')}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition ${
                      selectedCostFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    All Costs
                  </button>
                  {([1, 2, 3, 4, 5] as UnitCost[]).map((cost) => {
                    const costStyle = COST_CARD_STYLES[cost];
                    const isSelected = selectedCostFilter === cost;
                    const count = allUnits.filter((u) => u.cost === cost).length;

                    return (
                      <button
                        key={cost}
                        onClick={() => setSelectedCostFilter(isSelected ? 'all' : cost)}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border transition flex items-center gap-1 ${
                          isSelected
                            ? `${costStyle.badge} ring-2 ring-amber-400/60 shadow-md`
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>${cost}</span>
                        <span className="text-[10px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Showing <span className="text-amber-400 font-bold">{filteredUnits.length}</span> of{' '}
                  {allUnits.length} Champions
                </span>
              </div>
            </div>

            {/* Champions Cards Grid (Ordered by Cost 1 -> 5, Border Colored by Cost) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1 pb-4">
              {filteredUnits.map((unit) => {
                const costStyle = COST_CARD_STYLES[unit.cost] || COST_CARD_STYLES[1];
                const roleInfo = ROLE_ICONS[unit.combatRole];

                return (
                  <div
                    key={unit.id}
                    className={`p-4 rounded-2xl border-2 ${costStyle.border} ${costStyle.bg} transition-all duration-200 flex flex-col justify-between gap-3 shadow-md hover:shadow-xl group`}
                  >
                    {/* Unit Header: Avatar, Name without cost label next to it, role badge & AD/AP badge below */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 relative shadow-inner bg-slate-900 shrink-0">
                          {hasUnitImage(unit.id) && (
                            <img
                              src={getUnitPortraitUrl(unit.id)}
                              alt={unit.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition truncate">
                            {unit.name}
                          </h3>

                          {/* Role & Scaling Badges */}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {/* Scaling Badge */}
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border leading-tight ${
                                unit.ability.damageType === 'magic'
                                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                                  : unit.ability.damageType === 'true'
                                  ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                              }`}
                            >
                              {unit.ability.damageType === 'magic' ? '✨ AP' : unit.ability.damageType === 'true' ? '⚡ True' : '⚔️ AD'}
                            </span>

                            {roleInfo && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${roleInfo.color}`}
                              >
                                <span>{roleInfo.icon}</span>
                                <span>{unit.combatRole}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Origin & Class Tags: 1 color for Origins (Amber), 1 color for Classes (Indigo) */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {unit.origins.map((orig) => {
                          const def = TRAITS[orig];
                          return (
                            <button
                              key={orig}
                              onClick={() => setSelectedTraitFilter(orig)}
                              className="text-[10px] font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                              title={`Filter by Origin: ${orig}`}
                            >
                              <span>{def?.icon || '🏛️'}</span>
                              <span>{orig}</span>
                            </button>
                          );
                        })}
                        {unit.classes.map((cls) => {
                          const def = TRAITS[cls];
                          return (
                            <button
                              key={cls}
                              onClick={() => setSelectedTraitFilter(cls)}
                              className="text-[10px] font-medium bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-600/40 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                              title={`Filter by Class: ${cls}`}
                            >
                              <span>{def?.icon || '⚔️'}</span>
                              <span>{cls}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ability Card */}
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-slate-200">
                            {unit.ability.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-950 border border-blue-800/80 text-blue-300 px-1.5 py-0.2 rounded">
                          {unit.stats.startingMana}/{unit.stats.maxMana} Mana
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug">
                        {unit.ability.description}
                      </p>

                      {/* Dynamic Ability Values (Damage, Shield, Heal) */}
                      <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                        {unit.ability.damageValues && (
                          <div className="flex items-center justify-between">
                            <span className="text-red-400 font-semibold uppercase">⚔️ Damage:</span>
                            <span className="text-red-300 font-bold">
                              {unit.ability.damageValues[0]} / {unit.ability.damageValues[1]} /{' '}
                              {unit.ability.damageValues[2]}
                            </span>
                          </div>
                        )}
                        {unit.ability.shieldValues && (
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 font-semibold uppercase">🛡️ Shield:</span>
                            <span className="text-blue-300 font-bold">
                              {unit.ability.shieldValues[0]} / {unit.ability.shieldValues[1]} /{' '}
                              {unit.ability.shieldValues[2]}
                            </span>
                          </div>
                        )}
                        {unit.ability.healValues && (
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-semibold uppercase">💚 Heal:</span>
                            <span className="text-emerald-300 font-bold">
                              {unit.ability.healValues[0]} / {unit.ability.healValues[1]} /{' '}
                              {unit.ability.healValues[2]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Base Stats Row */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-900/50 p-2 rounded-xl border border-slate-800/60 text-[10px] font-mono">
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">❤️ Health</span>
                        <span className="text-slate-200 font-bold">
                          {unit.stats.hp[0]} / {unit.stats.hp[1]} / {unit.stats.hp[2]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">⚔️ Attack</span>
                        <span className="text-slate-200 font-bold">
                          {unit.stats.attackDamage[0]} / {unit.stats.attackDamage[1]} /{' '}
                          {unit.stats.attackDamage[2]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">🛡️ Defenses</span>
                        <span className="text-slate-200 font-bold">
                          {unit.stats.armor} Ar / {unit.stats.magicResist} MR
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">⚡ Speed</span>
                        <span className="text-slate-200 font-bold">{unit.stats.attackSpeed} AS</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">🎯 Range</span>
                        <span className="text-slate-200 font-bold">
                          {unit.stats.range === 1 ? '1 (Melee)' : `${unit.stats.range} Hexes`}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 font-medium">✨ Type</span>
                        <span className="text-indigo-300 font-bold capitalize">
                          {unit.ability.damageType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
