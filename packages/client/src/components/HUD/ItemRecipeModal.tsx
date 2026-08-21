import React, { useState, useEffect } from 'react';
import { BASE_ITEMS, ARTIFACT_ITEMS, BaseItemId } from '@autobattler/shared';
import { X, BookOpen, Sparkles, Filter } from 'lucide-react';

export const ItemRecipeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<BaseItemId | null>(null);

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

  if (!isOpen) return null;

  const baseKeys = Object.keys(BASE_ITEMS) as BaseItemId[];
  const allArtifacts = Object.values(ARTIFACT_ITEMS);

  // Filter artifacts if a component is selected
  const displayedArtifacts = selectedFilter
    ? allArtifacts.filter((art) => art.recipe?.includes(selectedFilter))
    : allArtifacts;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-amber-500/30 rounded-2xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl shadow-amber-950/20 flex flex-col gap-5 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-fantasy text-slate-100 flex items-center gap-2">
                Hogwarts Artifact Synthesis Book
                <Sparkles className="w-4 h-4 text-amber-400/80" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Combine any 2 basic magical components to synthesize completed artifacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Recipe Book (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Section 1: Basic Components (Spacious, Interactive Filter) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
                  Basic Components ({baseKeys.length})
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  • Click any component to filter combinations
                </span>
              </div>
              {selectedFilter && (
                <button
                  onClick={() => setSelectedFilter(null)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 transition"
                >
                  <Filter className="w-3 h-3" />
                  Show All ({allArtifacts.length})
                </button>
              )}
            </div>

            {/* Component Cards Grid (Spacious 4-column wrap) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {baseKeys.map((k) => {
                const itm = BASE_ITEMS[k];
                const isSelected = selectedFilter === k;

                return (
                  <button
                    key={k}
                    onClick={() => setSelectedFilter(isSelected ? null : k)}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      {itm.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-100 truncate">{itm.name}</span>
                      <span className="text-[11px] font-medium text-amber-400 mt-0.5">{itm.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Completed Magical Artifacts (Spacious 3-column Grid) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Crafted Artifacts ({displayedArtifacts.length})
              </span>
              {selectedFilter && (
                <span className="text-xs text-slate-400">
                  Showing recipes using <span className="text-amber-300 font-bold">{BASE_ITEMS[selectedFilter].name}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
              {displayedArtifacts.map((art) => {
                const comp1 = art.recipe ? BASE_ITEMS[art.recipe[0]] : null;
                const comp2 = art.recipe ? BASE_ITEMS[art.recipe[1]] : null;

                return (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
                  >
                    {/* Item Title & Icon */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0 p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                        {art.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-100 leading-tight">{art.name}</span>
                        <p className="text-xs text-amber-400/90 mt-1 leading-snug">{art.description}</p>
                      </div>
                    </div>

                    {/* Recipe Components Formula */}
                    {comp1 && comp2 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Recipe:</span>
                        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                          <span>{comp1.icon}</span>
                          <span className="text-xs text-slate-200">{comp1.name}</span>
                          <span className="text-slate-400 font-bold">+</span>
                          <span>{comp2.icon}</span>
                          <span className="text-xs text-slate-200">{comp2.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
