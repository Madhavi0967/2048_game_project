import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Clock, Footprints, Search, RotateCcw, Award } from 'lucide-react';
import { BoardSize, LeaderboardEntry } from '../types';
import { formatTime } from '../utils/gameLogic';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onClear: () => void;
  currentSize: BoardSize;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onClear,
  currentSize,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(String(currentSize));
  const [sortBy, setSortBy] = useState<'score' | 'tile' | 'time' | 'moves'>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  // Filter entries
  const filtered = entries.filter((entry) => {
    const matchesSize =
      selectedFilter === 'all' ? true : entry.boardSize === Number(selectedFilter);
    const matchesSearch = entry.playerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    return matchesSize && matchesSearch;
  });

  // Sort entries
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'tile') return b.highestTile - a.highestTile || b.score - a.score;
    if (sortBy === 'time') return a.durationSeconds - b.durationSeconds;
    if (sortBy === 'moves') return a.moves - b.moves;
    return b.score - a.score;
  });

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-[0_0_12px_rgba(251,191,36,0.6)] ring-2 ring-amber-300/40">
          1
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-xs shadow-[0_0_10px_rgba(203,213,225,0.4)] ring-2 ring-slate-400/40">
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs ring-2 ring-amber-600/40">
          3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs border border-slate-700">
        #{index + 1}
      </div>
    );
  };

  const getTileBadgeStyle = (tile: number) => {
    if (tile >= 2048) return 'bg-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    if (tile >= 1024) return 'bg-emerald-500 text-white font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (tile >= 512) return 'bg-teal-500 text-white font-bold';
    if (tile >= 256) return 'bg-blue-600 text-white font-bold';
    return 'bg-slate-700 text-slate-200 font-medium';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-100 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  High Scores Leaderboard
                </h2>
                <p className="text-xs text-slate-400">
                  Hall of Fame and top runs across all grid sizes
                </p>
              </div>
            </div>

            <button
              id="close-leaderboard-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Filters & Search */}
          <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between">
            {/* Grid Size Filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                id="filter-all"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {[3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  id={`filter-size-${s}`}
                  onClick={() => setSelectedFilter(String(s))}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFilter === String(s)
                      ? 'bg-sky-500 text-slate-950 font-black shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}×{s}
                </button>
              ))}
            </div>

            {/* Sort & Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[220px] justify-end">
              <div className="relative flex-1 max-w-[170px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="leaderboard-search"
                  type="text"
                  placeholder="Find player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-hidden text-slate-100 placeholder-slate-500"
                />
              </div>

              <select
                id="leaderboard-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'tile' | 'time' | 'moves')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="score">Highest Score</option>
                <option value="tile">Highest Tile</option>
                <option value="time">Fastest Time</option>
                <option value="moves">Fewest Moves</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table / List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold">No records found for this filter.</p>
                <p className="text-xs opacity-75 mt-0.5">Play a game to set a high score!</p>
              </div>
            ) : (
              sorted.map((item, idx) => (
                <div
                  key={item.id}
                  id={`leaderboard-entry-${item.id}`}
                  className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 rounded-2xl transition-colors"
                >
                  {/* Rank & Player Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getRankBadge(idx)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {item.playerName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-semibold text-slate-400">
                          {item.boardSize}×{item.boardSize}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5 text-sky-400/70" />
                          {item.moves} moves
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-violet-400/70" />
                          {formatTime(item.durationSeconds)}
                        </span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tile & Total Score */}
                  <div className="flex items-center gap-4 text-right">
                    <div
                      className={`text-xs px-2.5 py-1 rounded-lg ${getTileBadgeStyle(
                        item.highestTile
                      )}`}
                      title="Highest tile merged"
                    >
                      {item.highestTile}
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black font-mono text-slate-100">
                        {item.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                        pts
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {sorted.length} recorded runs</span>

            <div className="flex items-center gap-2">
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-semibold">Delete all records?</span>
                  <button
                    onClick={() => {
                      onClear();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold cursor-pointer hover:bg-rose-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="reset-leaderboard-btn"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Records</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
