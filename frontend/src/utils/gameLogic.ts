import { BoardSize, Direction, Tile } from '../types';

let nextTileId = 1;

export function generateTileId(): string {
  return `tile_${Date.now()}_${nextTileId++}`;
}

export function createEmptyGrid(size: BoardSize): (Tile | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function getEmptyPositions(grid: (Tile | null)[][], size: BoardSize): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

export function spawnRandomTile(tiles: Tile[], size: BoardSize): { tile: Tile | null; updatedTiles: Tile[] } {
  const grid = tilesToGrid(tiles, size);
  const empty = getEmptyPositions(grid, size);

  if (empty.length === 0) {
    return { tile: null, updatedTiles: tiles };
  }

  const randomPos = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newTile: Tile = {
    id: generateTileId(),
    value,
    row: randomPos.row,
    col: randomPos.col,
    isNew: true,
    isMerged: false,
  };

  return {
    tile: newTile,
    updatedTiles: [...tiles, newTile],
  };
}

export function initializeBoard(size: BoardSize): Tile[] {
  let tiles: Tile[] = [];
  const first = spawnRandomTile(tiles, size);
  if (first.tile) tiles = first.updatedTiles;
  const second = spawnRandomTile(tiles, size);
  if (second.tile) tiles = second.updatedTiles;
  return tiles;
}

export function tilesToGrid(tiles: Tile[], size: BoardSize): (Tile | null)[][] {
  const grid = createEmptyGrid(size);
  for (const tile of tiles) {
    if (tile.row >= 0 && tile.row < size && tile.col >= 0 && tile.col < size) {
      grid[tile.row][tile.col] = tile;
    }
  }
  return grid;
}

export interface MoveResult {
  tiles: Tile[];
  scoreGained: number;
  hasMoved: boolean;
  mergesCount: number;
  highestTile: number;
}

export function moveBoard(tiles: Tile[], size: BoardSize, direction: Direction): MoveResult {
  const grid = tilesToGrid(tiles, size);
  let scoreGained = 0;
  let hasMoved = false;
  let mergesCount = 0;

  // Clone current tiles without transient flags
  const newTiles: Tile[] = [];

  // Helper to extract lines depending on direction
  for (let i = 0; i < size; i++) {
    const line: (Tile | null)[] = [];
    for (let j = 0; j < size; j++) {
      if (direction === 'LEFT') line.push(grid[i][j]);
      else if (direction === 'RIGHT') line.push(grid[i][size - 1 - j]);
      else if (direction === 'UP') line.push(grid[j][i]);
      else if (direction === 'DOWN') line.push(grid[size - 1 - j][i]);
    }

    // Filter out empty spots
    const nonNulls = line.filter((t): t is Tile => t !== null);
    const newLine: Tile[] = [];
    let skipNext = false;

    for (let k = 0; k < nonNulls.length; k++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const current = nonNulls[k];
      const next = nonNulls[k + 1];

      if (next && current.value === next.value) {
        // Merge!
        const mergedValue = current.value * 2;
        scoreGained += mergedValue;
        mergesCount += 1;
        newLine.push({
          id: generateTileId(), // new id for merged tile to trigger merge pop animation
          value: mergedValue,
          row: 0, // will be assigned below
          col: 0,
          isMerged: true,
          isNew: false,
        });
        skipNext = true;
      } else {
        newLine.push({
          ...current,
          isMerged: false,
          isNew: false,
        });
      }
    }

    // Now map positions back to grid coordinate
    for (let k = 0; k < newLine.length; k++) {
      let targetRow = 0;
      let targetCol = 0;

      if (direction === 'LEFT') {
        targetRow = i;
        targetCol = k;
      } else if (direction === 'RIGHT') {
        targetRow = i;
        targetCol = size - 1 - k;
      } else if (direction === 'UP') {
        targetRow = k;
        targetCol = i;
      } else if (direction === 'DOWN') {
        targetRow = size - 1 - k;
        targetCol = i;
      }

      const tile = newLine[k];
      if (tile.row !== targetRow || tile.col !== targetCol || tile.isMerged) {
        hasMoved = true;
      }

      newTiles.push({
        ...tile,
        row: targetRow,
        col: targetCol,
      });
    }

    // Check if tiles that didn't merge moved positions
    if (nonNulls.length !== newLine.length) {
      hasMoved = true;
    }
  }

  // Double check if any tile actually changed coordinates
  if (!hasMoved) {
    if (tiles.length !== newTiles.length) {
      hasMoved = true;
    } else {
      const tileMap = new Map<string, Tile>();
      for (const t of tiles) tileMap.set(`${t.row},${t.col}`, t);
      for (const t of newTiles) {
        const orig = tileMap.get(`${t.row},${t.col}`);
        if (!orig || orig.value !== t.value) {
          hasMoved = true;
          break;
        }
      }
    }
  }

  const highestTile = newTiles.reduce((max, t) => Math.max(max, t.value), 0);

  return {
    tiles: newTiles,
    scoreGained,
    hasMoved,
    mergesCount,
    highestTile,
  };
}

export function checkGameOver(tiles: Tile[], size: BoardSize): boolean {
  if (tiles.length < size * size) {
    return false; // Still empty spaces
  }

  const grid = tilesToGrid(tiles, size);

  // Check horizontal and vertical neighbors for possible merges
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = grid[r][c];
      if (!current) return false;

      // Right neighbor
      if (c < size - 1) {
        const right = grid[r][c + 1];
        if (right && right.value === current.value) return false;
      }

      // Bottom neighbor
      if (r < size - 1) {
        const bottom = grid[r + 1][c];
        if (bottom && bottom.value === current.value) return false;
      }
    }
  }

  return true;
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
