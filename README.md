# 🧙‍♂️ Harry Potter / Tactical Auto Battler (8-Player Browser Engine)

A browser-based, 8-player auto battler built with a full-stack TypeScript architecture. Players buy units from a shared pool, arrange them on an 8x4 tactical grid, manage economy/interest/streaks, synthesize items into artifacts, and watch simulated battles resolve in an authoritative 20-tick/second server engine.

---

## ⚡ Tech Stack & Architecture

- **Frontend UI**: React 19 + Tailwind CSS + Lucide Icons (HUD, Shop tray, Bench, Items, Leaderboard, Damage meters).
- **2D WebGL Render Engine**: PixiJS 8 (Tactical grid, sprite cards, health/mana gauges, spell effects, floating combat text).
- **Authoritative Server**: Node.js + WebSockets / Express (Lobby matchmaking, synchronized phase timer loop, 20-tick/sec deterministic combat simulation, bot controller).
- **Shared Core Library**: `@autobattler/shared` (Champion pool, item crafting matrix, trait synergies, economy math, pathfinding).

---

## 🚀 How to Run Front and Back End

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Build the Shared Package
```bash
npm run --workspace=@autobattler/shared build
```

### 3. Run Both Servers Simultaneously (Development Mode)
You can run both the Node.js backend and Vite frontend together with:
```bash
npm run dev
```

---

### Running Frontend & Backend Individually

#### **A. Start the Authoritative Game Server**
```bash
npm run dev:server
```
- Starts the WebSocket and HTTP server on **`http://localhost:3001`** (WebSocket endpoint at `ws://localhost:3001/ws`).

#### **B. Start the Frontend Client**
```bash
npm run dev:client
```
- Starts the Vite React client at **`http://localhost:3000`**.
- Open your browser to `http://localhost:3000` to play!

---

## 🧪 Running Automated Tests

Run the full suite of unit tests across economy, combat simulation, shop odds, pool depletion, and room matchmaking:
```bash
npm test
```

Or test specific packages:
```bash
# Test shared combat simulation, economy, 3-star merge, and pool:
npm run --workspace=@autobattler/shared test

# Test server room lifecycle and bot matching:
npm run --workspace=@autobattler/server test
```

---

## 🎮 Core Game Systems

### Game Loop
1. **Planning Phase (25s)**:
   - Collect income: Base (2-5g) + Interest (1g per 10g held, max 5g) + Win/Loss Streak (1-3g).
   - Reroll shop (2g) or Buy XP (4g for 4XP).
   - Star up units automatically (3x 1★ $\rightarrow$ 2★; 3x 2★ $\rightarrow$ 3★).
   - Arrange frontline/midline/backline positioning on the grid and equip items.
2. **Combat Phase (30s)**:
   - Server pairs players (or assigns bot matches).
   - Units execute autonomous deterministic combat at 20 ticks/second with pathfinding, mana gain, basic attacks, and ability spells.
3. **Resolution Phase (3s)**:
   - Losers take avatar damage based on surviving enemy unit tiers and stage progression.
   - Eliminated players return all copies back into the global shared pool.
   - Last player standing wins the crown!

### Item Combination Matrix
Combining any 2 basic components produces a completed artifact:
- **Wand Core** + **Wand Core** $\rightarrow$ **Elder Focus** (+50% Magic Damage, spells can critically strike)
- **Dragon Scale** + **Phoenix Feather** $\rightarrow$ **Gryffindor Vest** (+300 HP, +40 Armor, heals 2% max HP/s)
- **Quick-Silver** + **Wand Core** $\rightarrow$ **Spell-Weaver Bow** (Attacks shred enemy Magic Resist and grant Attack Speed)
- **Mandrake Leaf** + **Phoenix Feather** $\rightarrow$ **Resilient Cloak** (Emits an aura reducing enemy Magic Damage by 30%)
- ... and 11 additional recipes viewable in-game via the Recipe Book!
