import React, { useState } from 'react';
import { Trophy, Search, Clock, Footprints, RotateCcw, Award, Sparkles } from 'lucide-react';
import { BoardSize, GameStats, LeaderboardEntry } from '../types';
import { formatTime } from '../utils/gameLogic';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  currentSize: BoardSize;
  stats: GameStats;
  onClearLeaderboard: () => void;
  onOpenFullLeaderboard: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  entries,
  currentSize,
  stats,
  onClearLeaderboard,
  onOpenFullLeaderboard,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(String(currentSize));
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter entries
  const filtered = entries.filter((entry) => {
    const matchesSize =
      selectedFilter === 'all' ? true : entry.boardSize === Number(selectedFilter);
    const matchesSearch = entry.playerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    return matchesSize && matchesSearch;
  });

  // Sort entries by score descending
  const sorted = [...filtered].sort((a, b) => b.score - a.score);

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-[0_0_10px_rgba(251,191,36,0.5)]">
          1
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-[11px] shadow-[0_0_10px_rgba(203,213,225,0.4)]">
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-[11px]">
          3
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[11px]">
        {index + 1}
      </div>
    );
  };

  const getTileBadgeStyle = (tile: number) => {
    if (tile >= 2048) return 'bg-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    if (tile >= 1024) return 'bg-emerald-500 text-white font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (tile >= 512) return 'bg-teal-500 text-white font-bold';
    if (tile >= 256) return 'bg-blue-600 text-white font-bold';
    if (tile >= 128) return 'bg-indigo-600 text-white font-semibold';
    return 'bg-slate-700 text-slate-200 font-semibold';
  };

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl h-full min-h-[480px]">
      {/* HUD Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-800/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-100 tracking-tight leading-tight">
              High Scores Leaderboard
            </h2>
            <p className="text-[11px] text-slate-400">
              Real-time records & best runs
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {[3, 4, 5, 6].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedFilter(String(s))}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedFilter === String(s)
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 focus:border-sky-500 focus:outline-hidden text-slate-200 placeholder-slate-500"
          />
        </div>

        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
          {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Leaderboard Table List */}
      <div className="flex-1 overflow-y-auto max-h-[340px] divide-y divide-slate-800/50 p-2 sm:p-3 scrollbar-thin">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Award className="w-9 h-9 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-semibold">No high scores recorded yet.</p>
            <p className="text-[11px] opacity-75 mt-0.5">Finish a game to claim your spot!</p>
          </div>
        ) : (
          sorted.map((item, idx) => (
            <div
              key={item.id}
              className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 rounded-xl transition-all"
            >
              {/* Rank & Player Info */}
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(idx)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                      {item.playerName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 font-semibold text-slate-400">
                      {item.boardSize}×{item.boardSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-sky-400/80" />
                      {item.moves}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-violet-400/80" />
                      {formatTime(item.durationSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile Badge & Score */}
              <div className="flex items-center gap-3 text-right">
                <div
                  className={`text-[11px] px-2 py-0.5 rounded-md ${getTileBadgeStyle(
                    item.highestTile
                  )}`}
                  title="Highest tile"
                >
                  {item.highestTile}
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black font-mono text-slate-100">
                    {item.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] uppercase font-bold tracking-widest text-sky-400">
                    pts
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Career Stats Summary Footer */}
      <div className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800/80">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Games
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-200 font-mono">
              {stats.gamesPlayed}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Win Rate
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              {winRate}%
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Best Tile
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              {stats.highestTile || 0}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Merges
            </span>
            <span className="text-xs sm:text-sm font-black text-purple-400 font-mono">
              {stats.totalMerges.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/50 text-xs text-slate-500">
          <button
            onClick={onOpenFullLeaderboard}
            className="text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Expanded View</span>
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 text-[11px]">Clear all?</span>
              <button
                onClick={() => {
                  onClearLeaderboard();
                  setConfirmClear(false);
                }}
                className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-slate-500 hover:text-rose-400 text-[11px] transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
