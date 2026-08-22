import { BoardUnit } from '../types/unit.js';
import { ActiveTraitInfo } from '../types/synergy.js';
import { UNITS } from '../data/units.js';
import { TRAITS } from '../data/synergies.js';

export function calculateSynergies(board: (BoardUnit | null)[][]): ActiveTraitInfo[] {
  // Set of unique unit IDs on board (duplicates don't give additional synergy count)
  const uniqueUnitIds = new Set<string>();

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const unit = board[r][c];
      if (unit && UNITS[unit.unitId]) {
        uniqueUnitIds.add(unit.unitId);
      }
    }
  }

  // Count origins and classes
  const counts: Record<string, number> = {};

  for (const unitId of uniqueUnitIds) {
    const def = UNITS[unitId];
    if (!def) continue;

    for (const origin of def.origins) {
      counts[origin] = (counts[origin] || 0) + 1;
    }
    for (const cls of def.classes) {
      counts[cls] = (counts[cls] || 0) + 1;
    }
  }

  const result: ActiveTraitInfo[] = [];

  for (const [traitName, count] of Object.entries(counts)) {
    const traitDef = TRAITS[traitName];
    if (!traitDef) continue;

    let activeTier = 0;
    let currentDesc = '';
    let nextCount: number | null = null;

    for (let i = 0; i < traitDef.breakpoints.length; i++) {
      const bp = traitDef.breakpoints[i];
      if (count >= bp.count) {
        activeTier = i + 1;
        currentDesc = bp.description;
      } else {
        if (nextCount === null) {
          nextCount = bp.count;
        }
      }
    }

    result.push({
      traitId: traitDef.id,
      name: traitDef.name,
      type: traitDef.type,
      count,
      activeTier,
      totalTiers: traitDef.breakpoints.length,
      currentBreakpointDescription: currentDesc,
      nextBreakpointCount: nextCount,
    });
  }

  // Sort by activeTier descending, then count descending
  return result.sort((a, b) => {
    if (b.activeTier !== a.activeTier) {
      return b.activeTier - a.activeTier;
    }
    return b.count - a.count;
  });
}
