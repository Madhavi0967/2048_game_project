import { BoardSize, GameStats, LeaderboardEntry } from '../types';
import { API_BASE } from './api';

const LEADERBOARD_KEY = '2048_leaderboard_v1';
const BEST_SCORES_KEY = '2048_best_scores_v1';
const STATS_KEY = '2048_stats_v1';
const LAST_PLAYER_NAME_KEY = '2048_last_player_name';

const DEFAULT_BENCHMARK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'TileMaster_Alex',
    score: 28460,
    highestTile: 2048,
    boardSize: 4,
    moves: 942,
    durationSeconds: 610,
    date: '2026-08-10',
  },
  {
    id: 'seed-2',
    playerName: 'GridRunner',
    score: 21980,
    highestTile: 2048,
    boardSize: 4,
    moves: 785,
    durationSeconds: 520,
    date: '2026-08-11',
  },
  {
    id: 'seed-3',
    playerName: 'QuantumSlide',
    score: 16840,
    highestTile: 1024,
    boardSize: 4,
    moves: 612,
    durationSeconds: 430,
    date: '2026-08-12',
  },
  {
    id: 'seed-4',
    playerName: 'FastPaced3x3',
    score: 3420,
    highestTile: 512,
    boardSize: 3,
    moves: 210,
    durationSeconds: 140,
    date: '2026-08-13',
  },
  {
    id: 'seed-5',
    playerName: 'MegaGrid5x5',
    score: 48900,
    highestTile: 4096,
    boardSize: 5,
    moves: 1680,
    durationSeconds: 1120,
    date: '2026-08-13',
  },
];

export async function fetchRemoteLeaderboard(): Promise<{ entries: LeaderboardEntry[]; source: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data.entries));
      }
      return data;
    }
  } catch {
    // API not reachable or offline
  }
  return null;
}

export async function fetchDbStatus(): Promise<{
  status: string;
  databaseType: string;
  uriConfigured: boolean;
  isConnected: boolean;
  message: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/api/db-status`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline or static mode
  }
  return null;
}

export async function saveRemoteLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'date'>
): Promise<LeaderboardEntry> {
  // Always save locally first for instant snappy response
  const localSaved = saveLeaderboardEntry(entry);

  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.entry) {
        return data.entry;
      }
    }
  } catch {
    // Silently fall back to local
  }

  return localSaved;
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_BENCHMARK_LEADERBOARD));
      return DEFAULT_BENCHMARK_LEADERBOARD;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BENCHMARK_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [newEntry, ...current].sort((a, b) => b.score - a.score);
  // Keep up to 100 entries
  const trimmed = updated.slice(0, 100);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    if (entry.playerName) {
      localStorage.setItem(LAST_PLAYER_NAME_KEY, entry.playerName);
    }
  } catch {
    // Storage quota or disabled
  }

  return newEntry;
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    // Storage error
  }
}

export function getBestScores(): Record<BoardSize, number> {
  const defaults: Record<BoardSize, number> = { 3: 0, 4: 0, 5: 0, 6: 0 };
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore
  }
  return defaults;
}

export function updateBestScore(size: BoardSize, score: number): number {
  const current = getBestScores();
  if (score > (current[size] || 0)) {
    current[size] = score;
    try {
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(current));
    } catch {
      // Ignore
    }
    return score;
  }
  return current[size] || 0;
}

export function getLastPlayerName(): string {
  try {
    return localStorage.getItem(LAST_PLAYER_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function getStats(): GameStats {
  const defaults: GameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    highestScore: 0,
    highestTile: 0,
    totalMerges: 0,
    totalTimeSeconds: 0,
  };

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore
  }
  return defaults;
}

export function recordGameStats(statsUpdate: {
  won: boolean;
  score: number;
  highestTile: number;
  merges: number;
  durationSeconds: number;
}): GameStats {
  const current = getStats();
  const updated: GameStats = {
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: current.gamesWon + (statsUpdate.won ? 1 : 0),
    highestScore: Math.max(current.highestScore, statsUpdate.score),
    highestTile: Math.max(current.highestTile, statsUpdate.highestTile),
    totalMerges: current.totalMerges + statsUpdate.merges,
    totalTimeSeconds: current.totalTimeSeconds + statsUpdate.durationSeconds,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}
