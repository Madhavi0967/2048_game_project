import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Save, Flame, Check } from 'lucide-react';
import { BoardSize } from '../types';
import { formatTime } from '../utils/gameLogic';

interface GameOverModalProps {
  isOpen: boolean;
  isWin: boolean;
  score: number;
  highestTile: number;
  boardSize: BoardSize;
  moves: number;
  elapsedSeconds: number;
  initialPlayerName: string;
  onSaveScore: (playerName: string) => void;
  onRestart: () => void;
  onContinue: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWin,
  score,
  highestTile,
  boardSize,
  moves,
  elapsedSeconds,
  initialPlayerName,
  onSaveScore,
  onRestart,
  onContinue,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState(initialPlayerName || 'Player 1');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSaved(false);
      if (initialPlayerName) setPlayerName(initialPlayerName);

      if (isWin) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#8b5cf6', '#34d399'],
        });
      }
    }
  }, [isOpen, isWin, initialPlayerName]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved && playerName.trim()) {
      onSaveScore(playerName.trim());
      setSaved(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-slate-900/95 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 text-center text-slate-100 backdrop-blur-xl"
        >
          {/* Header Badge */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            {isWin ? (
              <div className="w-full h-full rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(251,191,36,0.6)]">
                🏆
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                💥
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isWin ? '2048 Achieved!' : 'Game Over!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isWin
              ? 'Outstanding performance! You merged the legendary 2048 tile!'
              : 'No more valid moves available on this board.'}
          </p>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5 my-5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Final Score
              </span>
              <div className="text-xl font-black font-mono text-sky-400">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Highest Tile
              </span>
              <div className="text-xl font-black font-mono text-amber-400">
                {highestTile}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs font-semibold text-slate-400">
              Moves: <span className="font-bold text-slate-100">{moves}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs font-semibold text-slate-400">
              Time: <span className="font-bold text-slate-100">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Submit to Leaderboard Form */}
          <form onSubmit={handleSave} className="mb-5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Record to Leaderboard
            </label>
            <div className="flex gap-2">
              <input
                id="player-name-input"
                type="text"
                maxLength={20}
                required
                disabled={saved}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-100 focus:outline-hidden focus:border-sky-500 disabled:opacity-60 placeholder-slate-600"
              />
              <button
                id="save-score-btn"
                type="submit"
                disabled={saved || !playerName.trim()}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  saved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black shadow-[0_0_15px_rgba(14,165,233,0.35)]'
                } disabled:opacity-50`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
            {saved && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="text-xs text-sky-400 font-bold hover:underline mt-2 inline-block cursor-pointer"
              >
                View rank in Leaderboard →
              </button>
            )}
          </form>

          {/* Action Buttons */}
          <div className="space-y-2">
            {isWin && (
              <button
                id="continue-game-btn"
                onClick={onContinue}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-transform active:scale-98 cursor-pointer"
              >
                <span>Continue to 4096 & Beyond</span>
                <Flame className="w-4 h-4" />
              </button>
            )}

            <button
              id="try-again-btn"
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isWin ? 'Start New Board' : 'Try Again'}</span>
            </button>

            <button
              id="open-leaderboard-btn"
              onClick={onOpenLeaderboard}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Leaderboard</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
