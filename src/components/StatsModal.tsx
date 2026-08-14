import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, X, Trophy, Flame, Play, Clock, Sparkles } from 'lucide-react';
import { GameStats } from '../types';
import { formatTime } from '../utils/gameLogic';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-800 p-6 overflow-hidden text-slate-100 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Career Statistics
              </h2>
            </div>
            <button
              id="close-stats-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>Games Played</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {stats.gamesPlayed}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Win Rate (2048)</span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {winRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {stats.gamesWon} wins achieved
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Best All-Time</span>
              </div>
              <div className="text-2xl font-black font-mono text-sky-400">
                {stats.highestScore.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Highest Tile</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {stats.highestTile || 0}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Total Merges</span>
              </div>
              <div className="text-2xl font-black font-mono text-purple-400">
                {stats.totalMerges.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Playtime</span>
              </div>
              <div className="text-xl font-black font-mono text-white">
                {formatTime(stats.totalTimeSeconds)}
              </div>
            </div>
          </div>

          <button
            id="close-stats-btn-bottom"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            Close Statistics
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
