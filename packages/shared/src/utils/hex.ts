import { GridPosition } from '../types/unit.js';

export interface CubeCoordinates {
  q: number;
  r: number;
  s: number;
}

/**
 * Converts odd-r offset coordinates (where odd rows are horizontally shifted right by 0.5)
 * into standard 3D Cube coordinates (q, r, s).
 */
export function offsetToCube(col: number, row: number): CubeCoordinates {
  const q = col - (row - (row & 1)) / 2;
  const r = row;
  const s = -q - r;
  return { q, r, s };
}

/**
 * Converts 3D Cube coordinates back into odd-r offset coordinates (col, row).
 */
export function cubeToOffset(cube: CubeCoordinates): GridPosition {
  const col = cube.q + (cube.r - (cube.r & 1)) / 2;
  const row = cube.r;
  return { x: col, y: row };
}

/**
 * Calculates the exact Hex Distance (number of hex steps) between any two grid positions.
 */
export function getHexDistance(a: GridPosition, b: GridPosition): number {
  const aCube = offsetToCube(a.x, a.y);
  const bCube = offsetToCube(b.x, b.y);
  return (
    Math.max(
      Math.abs(aCube.q - bCube.q),
      Math.abs(aCube.r - bCube.r),
      Math.abs(aCube.s - bCube.s)
    )
  );
}

/**
 * Directional hex offsets for odd-r grid layouts (odd rows shifted right).
 */
const EVEN_ROW_NEIGHBORS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: 1 },
];

const ODD_ROW_NEIGHBORS = [
  { dx: 1, dy: 0 },
  { dx: 1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
];

/**
 * Returns all valid neighboring hex positions within grid boundaries.
 */
export function getHexNeighbors(
  pos: GridPosition,
  minX = 0,
  maxX = 7,
  minY = 0,
  maxY = 7
): GridPosition[] {
  const offsets = pos.y % 2 === 1 ? ODD_ROW_NEIGHBORS : EVEN_ROW_NEIGHBORS;
  const neighbors: GridPosition[] = [];

  for (const { dx, dy } of offsets) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}
