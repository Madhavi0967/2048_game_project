import { BoardSize, GameStats, LeaderboardEntry } from '../types';
import { API_BASE } from './api';

const LEADERBOARD_KEY = '2048_leaderboard_v1';
const BEST_SCORES_KEY = '2048_best_scores_v1';
const STATS_KEY = '2048_stats_v1';
const LAST_PLAYER_NAME_KEY = '2048_last_player_name';

const EMPTY_LEADERBOARD: LeaderboardEntry[] = [];

export async function fetchRemoteLeaderboard(): Promise<{ entries: LeaderboardEntry[]; source: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (res.ok) {
      const data = await res.json();
      const entries: LeaderboardEntry[] = Array.isArray(data.entries) ? data.entries : [];
      // The database is the source of truth: always overwrite the local cache
      // (this removes any stale/demo entries) and sort by score descending.
      const sorted = [...entries].sort((a, b) => b.score - a.score);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted));
      return { entries: sorted, source: data.source || 'local' };
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
      return EMPTY_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : EMPTY_LEADERBOARD;
  } catch {
    return EMPTY_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: new Date().toISOString().split('T')[0],
  };

  // Keep only the best score per player name, then sort by score descending.
  const bestPerPlayer = new Map<string, LeaderboardEntry>();
  const all = [newEntry, ...current];
  for (const e of all) {
    const existing = bestPerPlayer.get(e.playerName);
    if (!existing || e.score > existing.score) {
      bestPerPlayer.set(e.playerName, e);
    }
  }
  const deduped = Array.from(bestPerPlayer.values());
  const trimmed = deduped.sort((a, b) => b.score - a.score).slice(0, 100);

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
