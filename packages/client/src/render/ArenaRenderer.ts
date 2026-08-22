import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BoardUnit, CombatResult, CombatEvent, UNITS, ALL_ITEMS } from '@autobattler/shared';

interface UnitVisual {
  container: Container;
  bgGraphic: Graphics;
  hpGraphic: Graphics;
  manaGraphic: Graphics;
  nameText: Text;
  starText: Text;
  itemContainer: Container;
  targetX: number;
  targetY: number;
  currentHp: number;
  maxHp: number;
  currentShield: number;
  currentMana: number;
  maxMana: number;
  isDead: boolean;
}

interface FloatingText {
  text: Text;
  vy: number;
  alpha: number;
  life: number;
}

interface AbilityProjectile {
  graphic: Graphics;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: number;
}

export class ArenaRenderer {
  private app: Application | null = null;
  private container: HTMLElement;
  private isDestroyed = false;

  private gridContainer = new Container();
  private highlightLayer = new Container();
  private interestLayer = new Container();
  private unitLayer = new Container();
  private effectLayer = new Container();
  private uiLayer = new Container();

  public hexRadius = 38;
  public gridOffsetX = 0;
  public gridOffsetY = 0;
  public lastEnemyDeathPos: { x: number; y: number } | null = null;

  private unitVisuals = new Map<string, UnitVisual>();
  private floatingTexts: FloatingText[] = [];
  private projectiles: AbilityProjectile[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private lastRenderedBoard: {
    board: (BoardUnit | null)[][];
    opponentBoard?: (BoardUnit | null)[][] | null;
    gold?: number;
    isScouting?: boolean;
  } | null = null;

  // Drag & Selection state
  public selectedUnit: { unit: BoardUnit | null; source: 'board' | 'bench'; x: number; y?: number } | null = null;
  public hoveredGridTile: { col: number; row: number } | null = null;
  public onMoveRequest?: (
    from: { area: 'board' | 'bench'; x: number; y?: number },
    to: { area: 'board' | 'bench'; x: number; y?: number }
  ) => void;
  public onSellRequest?: (source: 'board' | 'bench', x: number, y?: number) => void;
  public onTileClick?: (col: number, boardY: number) => void;
  public onUnitInspect?: (unit: BoardUnit) => void;
  public onUnitInspectUpdate?: (data: any) => void;
  public onUnitDeselect?: () => void;
  public onHoverUnit?: (info: { source: 'board' | 'bench'; x: number; y?: number } | null) => void;
  public onDragUnitStart?: (info: { unit?: BoardUnit | null; source: 'board' | 'bench'; x: number; y?: number; refundGold: number }) => void;
  public onDragUnitEnd?: () => void;
  public inspectedUnitId: string | null = null;

  // Combat playback state
  private activeEvents: CombatEvent[] = [];
  private currentEventIndex = 0;
  private combatSimTick = 0;
  private isSimulating = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public async init(): Promise<void> {
    this.isDestroyed = false;
    this.container.innerHTML = '';

    const app = new Application();
    await app.init({
      resizeTo: this.container,
      backgroundColor: 0x070b14,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      app.destroy(true, { children: true });
      return;
    }

    this.app = app;
    this.container.innerHTML = '';
    app.canvas.style.display = 'block';
    app.canvas.style.width = '100%';
    app.canvas.style.height = '100%';
    this.container.appendChild(app.canvas);

    app.stage.addChild(this.gridContainer);
    app.stage.addChild(this.highlightLayer);
    app.stage.addChild(this.interestLayer);
    app.stage.addChild(this.unitLayer);
    app.stage.addChild(this.effectLayer);
    app.stage.addChild(this.uiLayer);

    this.calculateDimensions();
    this.drawGrid();

    window.addEventListener('resize', this.onResize);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container);
    }

    app.ticker.add((ticker) => {
      this.update(ticker.deltaTime);
    });
  }

  private onResize = () => {
    if (!this.app || this.isDestroyed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w <= 0 || h <= 0) return;

    this.app.renderer.resize(w, h);
    this.calculateDimensions();
    this.drawGrid();

    if (this.lastRenderedBoard && !this.isSimulating) {
      this.renderPlanningState(
        this.lastRenderedBoard.board,
        this.lastRenderedBoard.opponentBoard || undefined,
        this.lastRenderedBoard.gold || 0,
        this.lastRenderedBoard.isScouting
      );
    }
  };

  public calculateDimensions(): void {
    if (!this.app) return;
    const w = this.container.clientWidth || this.app.screen.width;
    const h = this.container.clientHeight || this.app.screen.height;

    const availableW = Math.max(340, w - 30);
    const availableH = Math.max(340, h - 20);

    // For 8 columns with 0.5 hex width offset and 8 rows:
    // Total Width = (8 + 0.5) * sqrt(3) * R ~= 14.72 * R
    // Total Height = (7 * 1.5 + 2) * R = 12.5 * R
    const radiusByW = Math.floor(availableW / 15.2);
    const radiusByH = Math.floor(availableH / 13.0);

    this.hexRadius = Math.max(22, Math.min(46, Math.min(radiusByW, radiusByH)));

    const hexWidth = this.hexRadius * Math.sqrt(3);
    const totalGridW = 8 * hexWidth + hexWidth * 0.5;
    const totalGridH = 7 * (this.hexRadius * 1.5) + this.hexRadius * 2;

    this.gridOffsetX = Math.floor((w - totalGridW) / 2);
    this.gridOffsetY = Math.floor((h - totalGridH) / 2);
  }

  public getHexCenter(col: number, row: number): { x: number; y: number } {
    const hexWidth = this.hexRadius * Math.sqrt(3);
    const rowOffset = row % 2 === 1 ? hexWidth * 0.5 : 0;
    const x = this.gridOffsetX + col * hexWidth + rowOffset + hexWidth * 0.5;
    const y = this.gridOffsetY + row * (this.hexRadius * 1.5) + this.hexRadius;
    return { x, y };
  }

  private drawHexagon(g: Graphics, centerX: number, centerY: number, radius: number): void {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30); // Pointy-topped hexes
      points.push(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    }
    g.poly(points);
  }

  public drawGrid(): void {
    this.gridContainer.removeChildren();
    const g = new Graphics();

    // 1. Draw 8x8 Hexagonal Grid (Rows 0-3 away, Rows 4-7 home)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const { x, y } = this.getHexCenter(col, row);
        const isPlayerSide = row >= 4;
        const isEven = (row + col) % 2 === 0;

        const fillColor = isPlayerSide
          ? isEven
            ? 0x0f172a
            : 0x0c1322
          : isEven
          ? 0x1a0f1d
          : 0x140a16;

        const borderColor = isPlayerSide ? 0x1e293b : 0x3b142c;

        // Draw Hexagon Cell
        this.drawHexagon(g, x, y, this.hexRadius - 2.5);
        g.fill({ color: fillColor, alpha: 0.92 });
        g.stroke({ width: 1.5, color: borderColor, alpha: 0.85 });
      }
    }

    // 2. Center Magical Energy Divider Line
    const hexWidth = this.hexRadius * Math.sqrt(3);
    const dividerY = this.gridOffsetY + 4 * (this.hexRadius * 1.5) + 3;
    const dividerStartX = this.gridOffsetX - 10;
    const dividerEndX = this.gridOffsetX + 8 * hexWidth + hexWidth * 0.5 + 10;

    g.moveTo(dividerStartX, dividerY);
    g.lineTo(dividerEndX, dividerY);
    g.stroke({ width: 2.5, color: 0x6366f1, alpha: 0.85 });

    g.moveTo(dividerStartX, dividerY);
    g.lineTo(dividerEndX, dividerY);
    g.stroke({ width: 8, color: 0x6366f1, alpha: 0.18 });

    this.gridContainer.addChild(g);
    this.gridContainer.eventMode = 'static';
    this.gridContainer.on('pointerdown', (e) => this.onGridClick(e.global.x, e.global.y));
  }

  public highlightTile(col: number, row: number, color = 0x10b981): void {
    this.highlightLayer.removeChildren();
    if (col < 0 || col >= 8 || row < 0 || row >= 8) return;

    const g = new Graphics();
    const { x, y } = this.getHexCenter(col, row);

    this.drawHexagon(g, x, y, this.hexRadius - 2);
    g.fill({ color, alpha: 0.25 });
    g.stroke({ width: 2.5, color, alpha: 0.95 });

    this.highlightLayer.addChild(g);
  }

  public clearHighlights(): void {
    this.highlightLayer.removeChildren();
  }

  public getGridCoords(globalX: number, globalY: number): { col: number; row: number; boardY: number } | null {
    let closestDist = Infinity;
    let bestMatch: { col: number; row: number } | null = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const center = this.getHexCenter(c, r);
        const dist = Math.hypot(globalX - center.x, globalY - center.y);
        if (dist < closestDist) {
          closestDist = dist;
          bestMatch = { col: c, row: r };
        }
      }
    }

    if (bestMatch && closestDist <= this.hexRadius * 1.15) {
      const boardY = 7 - bestMatch.row;
      return { col: bestMatch.col, row: bestMatch.row, boardY };
    }

    return null;
  }

  private onGridClick(globalX: number, globalY: number): void {
    const coords = this.getGridCoords(globalX, globalY);
    if (!coords) return;

    const { col, row, boardY } = coords;

    // Only player side (rows 4..7) can receive units
    if (row >= 4 && row < 8) {
      if (this.onTileClick) {
        this.onTileClick(col, boardY);
      }

      if (this.selectedUnit && this.onMoveRequest) {
        this.onMoveRequest(
          { area: this.selectedUnit.source, x: this.selectedUnit.x, y: this.selectedUnit.y },
          { area: 'board', x: col, y: boardY }
        );
        this.selectedUnit = null;
        this.clearHighlights();
        this.onUnitDeselect?.();
      } else {
        this.clearHighlights();
        this.onUnitDeselect?.();
      }
    }
  }

  public renderInterestMarkers(gold: number): void {
    this.interestLayer.removeChildren();
    const activeOrbs = Math.min(5, Math.floor(gold / 10));

    const g = new Graphics();
    const startY = this.gridOffsetY + 4 * (this.hexRadius * 1.5) + 10;
    const orbX = Math.max(14, this.gridOffsetX - 28);

    for (let i = 0; i < 5; i++) {
      const orbY = startY + i * 34;
      const isActive = i < activeOrbs;

      // Outer ring
      g.circle(orbX, orbY, 11);
      g.fill({ color: isActive ? 0x78350f : 0x0f172a, alpha: 0.95 });
      g.stroke({
        width: 2,
        color: isActive ? 0xfbbf24 : 0x334155,
        alpha: isActive ? 1.0 : 0.6,
      });

      if (isActive) {
        // Glowing gold core
        g.circle(orbX, orbY, 6.5);
        g.fill({ color: 0xf59e0b, alpha: 1.0 });

        // Specular gold shine
        g.circle(orbX - 2, orbY - 2, 2.5);
        g.fill({ color: 0xfef3c7, alpha: 0.95 });
      } else {
        // Inactive hollow dot
        g.circle(orbX, orbY, 3);
        g.fill({ color: 0x1e293b, alpha: 0.8 });
      }
    }

    this.interestLayer.addChild(g);
  }

  public renderPlanningState(
    board: (BoardUnit | null)[][],
    opponentBoard?: (BoardUnit | null)[][],
    gold = 0,
    isScouting = false
  ): void {
    this.isSimulating = false;
    this.lastRenderedBoard = { board, opponentBoard, gold, isScouting };
    this.unitLayer.removeChildren();
    this.unitVisuals.clear();
    this.renderInterestMarkers(gold);

    // Render Home Player Units (rows 4..7 on canvas: y = 7 - r)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const unit = board[r][c];
        if (unit) {
          const canvasRow = 7 - r;
          this.createUnitSprite(unit, c, canvasRow, 'home', r, isScouting);
        }
      }
    }

    // Render Opponent Ghost Units if provided (rows 0..3 on canvas)
    if (opponentBoard) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
          const unit = opponentBoard[r][c];
          if (unit) {
            this.createUnitSprite(unit, 7 - c, r, 'away', r, true);
          }
        }
      }
    }
  }

  public createUnitSprite(
    unit: BoardUnit,
    col: number,
    row: number,
    team: 'home' | 'away',
    originalBoardRow?: number,
    isScouting = false
  ): void {
    const def = UNITS[unit.unitId];
    if (!def) return;

    const { x, y } = this.getHexCenter(col, row);

    const container = new Container();
    container.x = x;
    container.y = y;
    container.eventMode = 'static';
    container.cursor = 'pointer';

    const radius = this.hexRadius * 0.72;

    // Cost color borders
    const costColors: Record<number, number> = {
      1: 0x94a3b8, // Grey
      2: 0x22c55e, // Emerald
      3: 0x3b82f6, // Blue
      4: 0xa855f7, // Purple
      5: 0xeab308, // Gold
    };
    const borderColor = costColors[def.cost] || 0xffffff;

    // Outer glow ring
    const bgGraphic = new Graphics();
    bgGraphic.circle(0, 0, radius);
    bgGraphic.fill({ color: team === 'home' ? 0x1e293b : 0x381024, alpha: 0.95 });
    bgGraphic.stroke({ width: 2.5, color: borderColor, alpha: 1.0 });

    // Inner subtle pattern
    bgGraphic.circle(0, 0, radius - 3);
    bgGraphic.stroke({ width: 1, color: team === 'home' ? 0x334155 : 0x581c3f, alpha: 0.6 });

    container.addChild(bgGraphic);

    // Champion Name
    const nameStyle = new TextStyle({
      fill: 0xf8fafc,
      fontSize: Math.max(9, Math.min(12, Math.floor(radius * 0.42))),
      fontWeight: 'bold',
      fontFamily: 'Inter',
      align: 'center',
    });
    const firstName = def.name.split(' ')[0];
    const nameText = new Text({ text: firstName, style: nameStyle });
    nameText.anchor.set(0.5);
    nameText.y = -2;
    container.addChild(nameText);

    // Star Level Badge
    const stars = '★'.repeat(unit.starLevel);
    const starStyle = new TextStyle({
      fill: unit.starLevel === 3 ? 0xf59e0b : unit.starLevel === 2 ? 0xe2e8f0 : 0x94a3b8,
      fontSize: 10,
      fontWeight: 'bold',
      fontFamily: 'Inter',
    });
    const starText = new Text({ text: stars, style: starStyle });
    starText.anchor.set(0.5);
    starText.y = -radius - 6;
    container.addChild(starText);

    // HP Bar
    const hpGraphic = new Graphics();
    this.updateHpBar(hpGraphic, unit.currentHp, unit.maxHp, radius);
    container.addChild(hpGraphic);

    // Mana Bar
    const manaGraphic = new Graphics();
    this.updateManaBar(manaGraphic, unit.currentMana, unit.maxMana, radius);
    container.addChild(manaGraphic);

    // Equipped Items Mini-Chips (up to 3 items)
    const itemContainer = new Container();
    itemContainer.y = radius + 9;
    if (unit.items && unit.items.length > 0) {
      unit.items.forEach((itmId, idx) => {
        const itmDef = ALL_ITEMS[itmId];
        if (!itmDef) return;

        const itmText = new Text({
          text: itmDef.icon,
          style: new TextStyle({ fontSize: 10 }),
        });
        itmText.anchor.set(0.5);
        itmText.x = (idx - (unit.items.length - 1) / 2) * 13;
        itemContainer.addChild(itmText);
      });
    }
    container.addChild(itemContainer);

    // Unit Click & Drag interaction (pure click only opens inspector, dragging moves unit)
    if (team === 'home' && originalBoardRow !== undefined && !isScouting) {
      let isDragging = false;
      let dragStartGlobal = { x: 0, y: 0 };
      const initialPos = { x, y };

      const onPointerMove = (moveEv: PointerEvent) => {
        if (!isDragging) {
          const dist = Math.hypot(moveEv.clientX - dragStartGlobal.x, moveEv.clientY - dragStartGlobal.y);
          if (dist > 6) {
            isDragging = true;
            container.alpha = 0.85;
            container.scale.set(1.08);
            this.unitLayer.addChild(container); // Bring to front during drag

            const def = UNITS[unit.unitId];
            const cost = def?.cost || 1;
            const star = unit.starLevel || 1;
            const refundGold = star === 1 ? cost : star === 2 ? (cost === 1 ? 3 : cost * 3 - 1) : (cost === 1 ? 9 : cost * 9 - 2);

            this.onDragUnitStart?.({
              unit,
              source: 'board',
              x: col,
              y: originalBoardRow,
              refundGold,
            });
          }
        }

        if (isDragging) {
          const rect = this.container.getBoundingClientRect();
          const canvasX = moveEv.clientX - rect.left;
          const canvasY = moveEv.clientY - rect.top;

          container.x = canvasX;
          container.y = canvasY;

          const coords = this.getGridCoords(canvasX, canvasY);
          if (coords && coords.row >= 4 && coords.row < 8) {
            this.highlightTile(coords.col, coords.row, 0x10b981);
          } else {
            this.clearHighlights();
          }
        }
      };

      const onPointerUp = (upEv: PointerEvent) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);

        container.alpha = 1.0;
        container.scale.set(1.0);
        this.clearHighlights();

        if (isDragging) {
          isDragging = false;
          this.onDragUnitEnd?.();

          // Check if released over DOM elements (Shop sell zone or bench slots)
          const el = document.elementFromPoint(upEv.clientX, upEv.clientY);
          const sellTarget = el ? (el.closest('#shop-sell-drop-zone') || el.closest('.shop-tray-container') || el.closest('#shop-tray-area')) : null;
          const benchSlotEl = el ? el.closest('[data-bench-index]') : null;

          if (sellTarget) {
            // Sold unit from board
            this.onSellRequest?.('board', col, originalBoardRow);
          } else if (benchSlotEl) {
            const benchIdxStr = benchSlotEl.getAttribute('data-bench-index');
            const benchIdx = benchIdxStr !== null ? parseInt(benchIdxStr, 10) : NaN;
            if (!isNaN(benchIdx)) {
              this.onMoveRequest?.(
                { area: 'board', x: col, y: originalBoardRow },
                { area: 'bench', x: benchIdx }
              );
            } else {
              container.x = initialPos.x;
              container.y = initialPos.y;
            }
          } else {
            const rect = this.container.getBoundingClientRect();
            const canvasX = upEv.clientX - rect.left;
            const canvasY = upEv.clientY - rect.top;

            const coords = this.getGridCoords(canvasX, canvasY);
            if (coords && coords.row >= 4 && coords.row < 8) {
              if (coords.col !== col || coords.boardY !== originalBoardRow) {
                this.onMoveRequest?.(
                  { area: 'board', x: col, y: originalBoardRow },
                  { area: 'board', x: coords.col, y: coords.boardY }
                );
              } else {
                container.x = initialPos.x;
                container.y = initialPos.y;
              }
            } else {
              container.x = initialPos.x;
              container.y = initialPos.y;
            }
          }
        }
      };

      container.on('pointerdown', (e) => {
        e.stopPropagation();
        dragStartGlobal = { x: e.client.x, y: e.client.y };
        isDragging = false;

        // On Click: Open More Info Inspector only (never move on click)
        if (this.onUnitInspect) {
          this.onUnitInspect(unit);
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      });

      container.on('pointerenter', () => {
        this.onHoverUnit?.({ source: 'board', x: col, y: originalBoardRow });
      });

      container.on('pointerleave', () => {
        this.onHoverUnit?.(null);
      });
    } else {
      container.on('pointerdown', (e) => {
        e.stopPropagation();
        if (this.onUnitInspect) {
          this.onUnitInspect(unit);
        }
      });
    }

    this.unitLayer.addChild(container);

    this.unitVisuals.set(unit.id, {
      container,
      bgGraphic,
      hpGraphic,
      manaGraphic,
      nameText,
      starText,
      itemContainer,
      targetX: x,
      targetY: y,
      currentHp: unit.currentHp,
      maxHp: unit.maxHp,
      currentShield: 0,
      currentMana: unit.currentMana,
      maxMana: unit.maxMana,
      isDead: false,
    });
  }

  private updateHpBar(g: Graphics, hp: number, maxHp: number, radius: number, shield = 0): void {
    g.clear();
    const barW = radius * 2;
    const barH = 4;
    const barX = -radius;
    const barY = radius + 2;

    // Background track
    g.rect(barX, barY, barW, barH);
    g.fill({ color: 0x0f172a, alpha: 0.95 });

    // HP fill
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    g.rect(barX, barY, barW * pct, barH);
    g.fill({ color: pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xeab308 : 0xef4444 });

    // Shield overlay
    if (shield > 0) {
      const shieldPct = Math.min(1, shield / maxHp);
      const shieldW = barW * shieldPct;
      g.rect(barX + barW * pct, barY, Math.min(barW - barW * pct, shieldW), barH);
      g.fill({ color: 0x38bdf8, alpha: 0.85 });
    }

    g.stroke({ width: 0.75, color: shield > 0 ? 0x38bdf8 : 0x020617 });
  }

  private updateManaBar(g: Graphics, mana: number, maxMana: number, radius: number): void {
    g.clear();
    const barW = radius * 2;
    const barH = 3;
    const barX = -radius;
    const barY = radius + 6;

    g.rect(barX, barY, barW, barH);
    g.fill({ color: 0x0f172a, alpha: 0.95 });

    const pct = Math.max(0, Math.min(1, mana / maxMana));
    g.rect(barX, barY, barW * pct, barH);
    g.fill({ color: 0x06b6d4 });
  }

  public startCombatPlayback(result: CombatResult, gold = 0, startTick = 0): void {
    this.unitLayer.removeChildren();
    this.unitVisuals.clear();
    this.effectLayer.removeChildren();
    this.highlightLayer.removeChildren();
    this.renderInterestMarkers(gold);
    for (const p of this.projectiles) {
      if (p.graphic) {
        this.effectLayer.removeChild(p.graphic);
        p.graphic.destroy();
      }
    }
    this.projectiles = [];
    this.floatingTexts = [];
    this.activeEvents = result.events;
    this.currentEventIndex = 0;
    this.combatSimTick = startTick;

    // Fast-forward initial state if starting midway through combat
    if (startTick > 0 && this.activeEvents.length > 0) {
      while (
        this.currentEventIndex < this.activeEvents.length &&
        this.activeEvents[this.currentEventIndex].tick <= startTick
      ) {
        const ev = this.activeEvents[this.currentEventIndex];
        this.processCombatEvent(ev, true);
        this.currentEventIndex++;
      }
    }

    this.isSimulating = true;
  }

  private update(delta: number): void {
    // Combat event step
    if (this.isSimulating && this.activeEvents.length > 0) {
      this.combatSimTick += delta * 0.45;

      while (
        this.currentEventIndex < this.activeEvents.length &&
        this.activeEvents[this.currentEventIndex].tick <= this.combatSimTick
      ) {
        const ev = this.activeEvents[this.currentEventIndex];
        this.processCombatEvent(ev, false);
        this.currentEventIndex++;
      }
    }

    // Smooth unit sliding movement between hex tiles
    for (const visual of this.unitVisuals.values()) {
      if (visual.isDead) continue;
      const dx = visual.targetX - visual.container.x;
      const dy = visual.targetY - visual.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1.0) {
        const slideStep = Math.min(dist, (2.8 + dist * 0.05) * delta);
        visual.container.x += (dx / dist) * slideStep;
        visual.container.y += (dy / dist) * slideStep;
      } else {
        visual.container.x = visual.targetX;
        visual.container.y = visual.targetY;
      }
    }

    // Ability projectile simulation (blue dot for allied, red dot for enemy)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.targetX - p.currentX;
      const dy = p.targetY - p.currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= p.speed * delta || dist < 8.0) {
        // Impact burst spark
        const burst = new Graphics();
        burst.circle(p.targetX, p.targetY, 14);
        burst.stroke({ width: 2.5, color: p.color, alpha: 0.85 });
        this.effectLayer.addChild(burst);
        setTimeout(() => {
          if (burst && !burst.destroyed) {
            this.effectLayer.removeChild(burst);
            burst.destroy();
          }
        }, 180);

        this.effectLayer.removeChild(p.graphic);
        p.graphic.destroy();
        this.projectiles.splice(i, 1);
      } else {
        p.currentX += (dx / dist) * p.speed * delta;
        p.currentY += (dy / dist) * p.speed * delta;
        p.graphic.x = p.currentX;
        p.graphic.y = p.currentY;
      }
    }

    // Floating text update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.text.y += ft.vy;
      ft.life -= delta * 0.03;
      ft.text.alpha = Math.max(0, ft.life);

      if (ft.life <= 0) {
        this.uiLayer.removeChild(ft.text);
        ft.text.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private processCombatEvent(ev: CombatEvent, isFastForward = false): void {
    if (ev.type === 'SPAWN' && ev.sourceId && ev.toPos) {
      const isAway = ev.sourceId.startsWith('away');
      const unitDefId = ev.unitDefId || 'neville_longbottom';
      const starLevel = ev.starLevel || 1;
      const def = UNITS[unitDefId];

      const maxHp = ev.value || def?.stats.hp[starLevel - 1] || 800;
      const startingMana = ev.remainingMana !== undefined ? ev.remainingMana : (def?.stats.startingMana || 0);
      const maxMana = def?.stats.maxMana || 100;

      const mockUnit: BoardUnit = {
        id: ev.sourceId,
        unitId: unitDefId,
        starLevel,
        position: ev.toPos,
        items: ev.items || [],
        currentHp: maxHp,
        maxHp: maxHp,
        currentMana: startingMana,
        maxMana: maxMana,
      };

      this.createUnitSprite(mockUnit, ev.toPos.x, ev.toPos.y, isAway ? 'away' : 'home');
    } else if (ev.type === 'MOVE' && ev.sourceId && ev.toPos) {
      const vis = this.unitVisuals.get(ev.sourceId);
      if (vis) {
        const hexPos = this.getHexCenter(ev.toPos.x, ev.toPos.y);
        vis.targetX = hexPos.x;
        vis.targetY = hexPos.y;
        if (isFastForward) {
          vis.container.x = hexPos.x;
          vis.container.y = hexPos.y;
        }
      }
    } else if (ev.type === 'DAMAGE' && ev.targetId) {
      const vis = this.unitVisuals.get(ev.targetId);
      if (vis && ev.value !== undefined) {
        if (ev.remainingHp !== undefined) vis.currentHp = ev.remainingHp;
        if (ev.remainingMana !== undefined) vis.currentMana = ev.remainingMana;
        const radius = this.hexRadius * 0.72;
        this.updateHpBar(vis.hpGraphic, vis.currentHp, vis.maxHp, radius, vis.currentShield);
        this.updateManaBar(vis.manaGraphic, vis.currentMana, vis.maxMana, radius);

        if (!isFastForward) {
          this.spawnFloatingCombatText(
            vis.container.x,
            vis.container.y - 20,
            `-${ev.value}`,
            ev.isCrit ? 0xef4444 : ev.damageType === 'magic' ? 0x38bdf8 : 0xf97316,
            ev.isCrit ? 15 : 12,
            Boolean(ev.isCrit)
          );
        }

        if (this.inspectedUnitId === ev.targetId && this.onUnitInspectUpdate) {
          this.onUnitInspectUpdate({
            id: ev.targetId,
            currentHp: Math.max(0, vis.currentHp),
            maxHp: vis.maxHp,
            currentShield: vis.currentShield,
            currentMana: Math.max(0, vis.currentMana),
            maxMana: vis.maxMana,
          });
        }
      }
    } else if (ev.type === 'HEAL' && ev.targetId) {
      const vis = this.unitVisuals.get(ev.targetId);
      if (vis && ev.value !== undefined) {
        if (ev.remainingHp !== undefined) vis.currentHp = ev.remainingHp;
        const radius = this.hexRadius * 0.72;
        this.updateHpBar(vis.hpGraphic, vis.currentHp, vis.maxHp, radius, vis.currentShield);

        if (!isFastForward) {
          this.spawnFloatingCombatText(
            vis.container.x,
            vis.container.y - 20,
            `+${ev.value}`,
            0x22c55e,
            13,
            false
          );
        }

        if (this.inspectedUnitId === ev.targetId && this.onUnitInspectUpdate) {
          this.onUnitInspectUpdate({
            id: ev.targetId,
            currentHp: Math.max(0, vis.currentHp),
            maxHp: vis.maxHp,
            currentShield: vis.currentShield,
            currentMana: Math.max(0, vis.currentMana),
            maxMana: vis.maxMana,
          });
        }
      }
    } else if (ev.type === 'SHIELD' && ev.targetId) {
      const vis = this.unitVisuals.get(ev.targetId);
      if (vis && ev.value !== undefined) {
        vis.currentShield = ev.value;
        const radius = this.hexRadius * 0.72;
        this.updateHpBar(vis.hpGraphic, vis.currentHp, vis.maxHp, radius, vis.currentShield);

        if (!isFastForward) {
          this.spawnFloatingCombatText(
            vis.container.x,
            vis.container.y - 20,
            `+${ev.value} 🛡️`,
            0x38bdf8,
            13,
            true
          );
        }

        if (this.inspectedUnitId === ev.targetId && this.onUnitInspectUpdate) {
          this.onUnitInspectUpdate({
            id: ev.targetId,
            currentHp: Math.max(0, vis.currentHp),
            maxHp: vis.maxHp,
            currentShield: vis.currentShield,
            currentMana: Math.max(0, vis.currentMana),
            maxMana: vis.maxMana,
          });
        }
      }
    } else if (ev.type === 'OVERTIME') {
      if (!isFastForward) {
        const center = this.getHexCenter(4, 4);
        this.spawnFloatingCombatText(
          center.x,
          center.y - 40,
          '⚡ OVERTIME! (+50% AS & DMG) ⚡',
          0xf59e0b,
          18,
          true
        );
      }
    } else if (ev.type === 'SPELL_CAST' && ev.sourceId) {
      const vis = this.unitVisuals.get(ev.sourceId);
      if (vis) {
        vis.currentMana = 0;
        const radius = this.hexRadius * 0.72;
        this.updateManaBar(vis.manaGraphic, 0, vis.maxMana, radius);

        if (this.inspectedUnitId === ev.sourceId && this.onUnitInspectUpdate) {
          this.onUnitInspectUpdate({
            id: ev.sourceId,
            currentHp: Math.max(0, vis.currentHp),
            maxHp: vis.maxHp,
            currentMana: 0,
            maxMana: vis.maxMana,
          });
        }

        if (!isFastForward) {
          const isAllied = !ev.sourceId.startsWith('away');
          const projColor = isAllied ? 0x38bdf8 : 0xef4444; // Blue for allied, Red for enemy

          // Find target position
          let targetX = vis.container.x;
          let targetY = isAllied ? vis.container.y - 120 : vis.container.y + 120;

          if (ev.targetId && this.unitVisuals.has(ev.targetId)) {
            const targetVis = this.unitVisuals.get(ev.targetId)!;
            targetX = targetVis.container.x;
            targetY = targetVis.container.y;
          } else {
            // Find closest alive opponent
            let closestDist = Infinity;
            for (const [id, enemyVis] of this.unitVisuals.entries()) {
              if (enemyVis.isDead) continue;
              const enemyIsAway = id.startsWith('away');
              if (enemyIsAway !== isAllied) continue; // Opponent team
              const d = Math.hypot(enemyVis.container.x - vis.container.x, enemyVis.container.y - vis.container.y);
              if (d < closestDist) {
                closestDist = d;
                targetX = enemyVis.container.x;
                targetY = enemyVis.container.y;
              }
            }
          }

          // Spawn Glowing Ability Projectile Dot
          const projGraphic = new Graphics();
          projGraphic.circle(0, 0, 8);
          projGraphic.fill({ color: projColor, alpha: 0.95 });
          projGraphic.circle(0, 0, 12);
          projGraphic.fill({ color: projColor, alpha: 0.35 });
          projGraphic.x = vis.container.x;
          projGraphic.y = vis.container.y;
          this.effectLayer.addChild(projGraphic);

          this.projectiles.push({
            graphic: projGraphic,
            currentX: vis.container.x,
            currentY: vis.container.y,
            targetX,
            targetY,
            speed: 10.0,
            color: projColor,
          });

          // Spell cast announcement text
          this.spawnFloatingCombatText(
            vis.container.x,
            vis.container.y - 35,
            ev.abilityName || 'CAST!',
            isAllied ? 0x38bdf8 : 0xf87171,
            12,
            true
          );
        }
      }
    } else if (ev.type === 'DEATH' && ev.targetId) {
      const vis = this.unitVisuals.get(ev.targetId);
      if (vis) {
        vis.isDead = true;
        vis.container.visible = false;
        vis.container.alpha = 0;
        if (ev.targetId.startsWith('away')) {
          this.lastEnemyDeathPos = { x: vis.container.x, y: vis.container.y };
        }
      }
    }
  }

  public getLastEnemyDeathCanvasPos(): { x: number; y: number } {
    if (this.lastEnemyDeathPos) {
      return { ...this.lastEnemyDeathPos };
    }
    return this.getHexCenter(4, 1);
  }

  private spawnFloatingCombatText(
    x: number,
    y: number,
    str: string,
    color: number,
    fontSize: number,
    bold: boolean
  ): void {
    const style = new TextStyle({
      fill: color,
      fontSize,
      fontWeight: bold ? 'bold' : 'normal',
      fontFamily: 'Inter',
      stroke: { color: 0x000000, width: 3 },
    });

    const txt = new Text({ text: str, style });
    txt.anchor.set(0.5);
    txt.x = x + (Math.random() * 20 - 10);
    txt.y = y;

    this.uiLayer.addChild(txt);
    this.floatingTexts.push({
      text: txt,
      vy: -1.2,
      alpha: 1.0,
      life: 1.0,
    });
  }

  public destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
