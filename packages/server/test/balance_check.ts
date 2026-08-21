import { CombatSimulator, UNITS, BoardUnit } from '@autobattler/shared';

function runDuel(u1Id: string, star1: 1|2|3, u2Id: string, star2: 1|2|3): 'u1' | 'u2' | 'tie' {
  const b1: BoardUnit = {
    id: 'u1',
    unitId: u1Id,
    starLevel: star1,
    currentHp: UNITS[u1Id].stats.hp[star1 - 1],
    maxHp: UNITS[u1Id].stats.hp[star1 - 1],
    currentMana: UNITS[u1Id].stats.startingMana,
    maxMana: UNITS[u1Id].stats.maxMana,
    items: [],
    position: { x: 3, y: 3 },
  };

  const b2: BoardUnit = {
    id: 'u2',
    unitId: u2Id,
    starLevel: star2,
    currentHp: UNITS[u2Id].stats.hp[star2 - 1],
    maxHp: UNITS[u2Id].stats.hp[star2 - 1],
    currentMana: UNITS[u2Id].stats.startingMana,
    maxMana: UNITS[u2Id].stats.maxMana,
    items: [],
    position: { x: 4, y: 3 },
  };

  const sim = new CombatSimulator('p1', 'p2', [b1], [b2], [], [], 1);
  const res = sim.simulate();
  if (res.winner === 'home') return 'u1';
  if (res.winner === 'away') return 'u2';
  return 'tie';
}

console.log('Testing 1v1 matchups with current stats...');
const c1Units = Object.values(UNITS).filter(u => u.cost === 1 && !['cornish_pixie', 'garden_gnome', 'acromantula_hatchling'].includes(u.id)).map(u => u.id);
const c2Units = Object.values(UNITS).filter(u => u.cost === 2).map(u => u.id);
const c3Units = Object.values(UNITS).filter(u => u.cost === 3).map(u => u.id);
const c4Units = Object.values(UNITS).filter(u => u.cost === 4).map(u => u.id);
const c5Units = Object.values(UNITS).filter(u => u.cost === 5).map(u => u.id);

function testAvgWinrate(group1: string[], star1: 1|2|3, group2: string[], star2: 1|2|3) {
  let wins = 0;
  let total = 0;
  for (const u1 of group1) {
    for (const u2 of group2) {
      const outcome = runDuel(u1, star1, u2, star2);
      if (outcome === 'u1') wins++;
      else if (outcome === 'tie') wins += 0.5;
      total++;
    }
  }
  return (wins / total * 100).toFixed(1);
}

console.log('--- 3★ 1-Cost Matchups ---');
console.log('3★ 1-Cost vs 1★ 1-Cost Winrate:', testAvgWinrate(c1Units, 3, c1Units, 1) + '%');
console.log('3★ 1-Cost vs 2★ 1-Cost Winrate:', testAvgWinrate(c1Units, 3, c1Units, 2) + '%');
console.log('3★ 1-Cost vs 1★ 2-Cost Winrate:', testAvgWinrate(c1Units, 3, c2Units, 1) + '%');
console.log('3★ 1-Cost vs 2★ 2-Cost Winrate:', testAvgWinrate(c1Units, 3, c2Units, 2) + '%');
console.log('3★ 1-Cost vs 1★ 3-Cost Winrate:', testAvgWinrate(c1Units, 3, c3Units, 1) + '%');
console.log('3★ 1-Cost vs 2★ 3-Cost Winrate:', testAvgWinrate(c1Units, 3, c3Units, 2) + '%');
console.log('3★ 1-Cost vs 1★ 4-Cost Winrate:', testAvgWinrate(c1Units, 3, c4Units, 1) + '%');
console.log('3★ 1-Cost vs 1★ 5-Cost Winrate:', testAvgWinrate(c1Units, 3, c5Units, 1) + '%');
console.log('3★ 1-Cost vs 2★ 4-Cost Winrate:', testAvgWinrate(c1Units, 3, c4Units, 2) + '%');
console.log('3★ 1-Cost vs 2★ 5-Cost Winrate (3★ 1-Cost side):', testAvgWinrate(c1Units, 3, c5Units, 2) + '%');
console.log('2★ 5-Cost vs 3★ 1-Cost Winrate (2★ 5-Cost side):', testAvgWinrate(c5Units, 2, c1Units, 3) + '%');
console.log('3★ 1-Cost vs 3★ 2-Cost Winrate:', testAvgWinrate(c1Units, 3, c2Units, 3) + '%');
console.log('3★ 1-Cost vs 3★ 3-Cost Winrate:', testAvgWinrate(c1Units, 3, c3Units, 3) + '%');
console.log('3★ 1-Cost vs 3★ 4-Cost Winrate:', testAvgWinrate(c1Units, 3, c4Units, 3) + '%');
console.log('3★ 1-Cost vs 3★ 5-Cost Winrate:', testAvgWinrate(c1Units, 3, c5Units, 3) + '%');

console.log('--- 2★ 2-Cost Matchups ---');
console.log('2★ 2-Cost vs 1★ 1-Cost Winrate:', testAvgWinrate(c2Units, 2, c1Units, 1) + '%');
console.log('2★ 2-Cost vs 1★ 2-Cost Winrate:', testAvgWinrate(c2Units, 2, c2Units, 1) + '%');
console.log('2★ 2-Cost vs 1★ 4-Cost Winrate:', testAvgWinrate(c2Units, 2, c4Units, 1) + '%');
console.log('2★ 2-Cost vs 1★ 5-Cost Winrate:', testAvgWinrate(c2Units, 2, c5Units, 1) + '%');

console.log('--- 2★ 1-Cost Matchups ---');
console.log('2★ 1-Cost vs 1★ 3-Cost Winrate:', testAvgWinrate(c1Units, 2, c3Units, 1) + '%');

