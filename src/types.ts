export type BoardSize = 3 | 4 | 5 | 6;

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isMerged?: boolean;
  isNew?: boolean;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  tiles: Tile[];
  score: number;
  bestScore: number;
  size: BoardSize;
  moveCount: number;
  status: 'playing' | 'won' | 'over';
  hasWon: boolean;
  hasContinuedAfterWin: boolean;
  startTime: number;
  elapsedSeconds: number;
}

export interface BoardHistoryItem {
  tiles: Tile[];
  score: number;
  moveCount: number;
}

export type PowerUpType = 'swap' | 'delete' | null;

export interface PowerUpsState {
  undo: number;
  swap: number;
  delete: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  highestTile: number;
  boardSize: BoardSize;
  moves: number;
  durationSeconds: number;
  date: string;
  theme?: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  highestScore: number;
  highestTile: number;
  totalMerges: number;
  totalTimeSeconds: number;
}

export type ThemeName = 'immersive' | 'classic' | 'cyber' | 'pastel' | 'obsidian';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  bg: string;
  boardBg: string;
  emptyCellBg: string;
  textColor: string;
  tileColors: Record<number, { bg: string; text: string; glow?: string }>;
}
