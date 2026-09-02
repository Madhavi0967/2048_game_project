import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Undo2, Timer, Footprints, ArrowLeftRight, Trash2, X, Sparkles } from 'lucide-react';
import { BoardSize, ThemeConfig, PowerUpsState, PowerUpType } from '../types';
import { formatTime } from '../utils/gameLogic';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  size: BoardSize;
  moveCount: number;
  elapsedSeconds: number;
  canUndo: boolean;
  powerUps: PowerUpsState;
  activePowerUp: PowerUpType;
  selectedTileForSwap: string | null;
  theme: ThemeConfig;
  pointsAdded: { id: string; amount: number }[];
  onUndo: () => void;
  onTogglePowerUp: (type: 'swap' | 'delete') => void;
  onCancelPowerUp: () => void;
  onRestart: () => void;
  onSizeChange: (newSize: BoardSize) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  bestScore,
  size,
  moveCount,
  elapsedSeconds,
  canUndo,
  powerUps,
  activePowerUp,
  selectedTileForSwap,
  theme,
  pointsAdded,
  onUndo,
  onTogglePowerUp,
  onCancelPowerUp,
  onRestart,
  onSizeChange,
}) => {
  const sizes: { value: BoardSize; label: string }[] = [
    { value: 3, label: '3×3' },
    { value: 4, label: '4×4' },
    { value: 5, label: '5×5' },
    { value: 6, label: '6×6' },
  ];

  const [confirmRestart, setConfirmRestart] = useState(false);

  useEffect(() => {
    if (confirmRestart) {
      const timer = setTimeout(() => setConfirmRestart(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmRestart]);

  const handleRestartClick = () => {
    if (score > 100 && !confirmRestart) {
      setConfirmRestart(true);
    } else {
      setConfirmRestart(false);
      onRestart();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Floating Score Animation Overlay */}
      <div className="relative">
        <div className="absolute -top-4 right-6 pointer-events-none z-30">
          <AnimatePresence>
            {pointsAdded.map((pop) => (
              <motion.div
                key={pop.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -30, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute text-emerald-400 font-extrabold text-base sm:text-lg drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              >
                +{pop.amount}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Metrics Bar & Grid Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 text-xs">
        {/* Moves and Timer metrics */}
        <div className="flex items-center gap-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-1.5 backdrop-blur-md">
          <div id="metric-moves" className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Footprints className="w-3.5 h-3.5 text-sky-400" />
            <span>{moveCount} moves</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-800" />
          <div id="metric-time" className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Timer className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Grid Mode Selector */}
        <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 backdrop-blur-md">
          {sizes.map((s) => {
            const isActive = size === s.value;
            return (
              <button
                key={s.value}
                id={`grid-size-${s.value}`}
                onClick={() => onSizeChange(s.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Power-Ups Header Label */}
      <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-sky-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Game Power-Ups & Rewinds</span>
        </div>
        <span className="text-slate-500 font-medium lowercase">per game session</span>
      </div>

      {/* Power-Ups Deck: Undo, Swap, Delete + New Game */}
      <div className="grid grid-cols-4 gap-2">
        {/* 1. Undo Power-Up */}
        <button
          id="undo-button"
          onClick={onUndo}
          disabled={!canUndo || powerUps.undo <= 0}
          title={
            powerUps.undo > 0
              ? `Undo last move (${powerUps.undo} left)`
              : 'No undos remaining (available on Game Over)'
          }
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl font-bold text-xs transition-all border backdrop-blur-md cursor-pointer ${
            canUndo && powerUps.undo > 0
              ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 text-slate-200 shadow-md active:scale-95 hover:border-sky-500/50'
              : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4 text-sky-400" />
          <span className="text-[11px] sm:text-xs">Undo</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
              powerUps.undo > 0
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {powerUps.undo}
          </span>
        </button>

        {/* 2. Swap Numbers Power-Up */}
        <button
          id="swap-powerup-button"
          onClick={() => onTogglePowerUp('swap')}
          disabled={powerUps.swap <= 0}
          title={
            powerUps.swap > 0
              ? `Swap two tiles on the board (${powerUps.swap} left)`
              : 'No swaps remaining'
          }
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl font-bold text-xs transition-all border backdrop-blur-md cursor-pointer ${
            activePowerUp === 'swap'
              ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.6)] animate-pulse'
              : powerUps.swap > 0
              ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 text-slate-200 shadow-md active:scale-95 hover:border-amber-400/50'
              : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
        >
          <ArrowLeftRight
            className={`w-4 h-4 ${
              activePowerUp === 'swap' ? 'text-slate-950' : 'text-amber-400'
            }`}
          />
          <span className="text-[11px] sm:text-xs">Swap</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
              activePowerUp === 'swap'
                ? 'bg-slate-950 text-sky-400'
                : powerUps.swap > 0
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {powerUps.swap}
          </span>
        </button>

        {/* 3. Delete Tile Power-Up */}
        <button
          id="delete-powerup-button"
          onClick={() => onTogglePowerUp('delete')}
          disabled={powerUps.delete <= 0}
          title={
            powerUps.delete > 0
              ? `Delete/destroy any tile on board (${powerUps.delete} left)`
              : 'No deletes remaining'
          }
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl font-bold text-xs transition-all border backdrop-blur-md cursor-pointer ${
            activePowerUp === 'delete'
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
              : powerUps.delete > 0
              ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 text-slate-200 shadow-md active:scale-95 hover:border-rose-500/50'
              : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-40 cursor-not-allowed'
          }`}
        >
          <Trash2
            className={`w-4 h-4 ${
              activePowerUp === 'delete' ? 'text-white' : 'text-rose-400'
            }`}
          />
          <span className="text-[11px] sm:text-xs">Delete</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
              activePowerUp === 'delete'
                ? 'bg-slate-950 text-rose-300'
                : powerUps.delete > 0
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {powerUps.delete}
          </span>
        </button>

        {/* 4. New Game Button */}
        <button
          id="new-game-button"
          onClick={handleRestartClick}
          className={`py-2.5 px-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-98 ${
            confirmRestart
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs truncate">
            {confirmRestart ? 'Reset?' : 'New'}
          </span>
        </button>
      </div>

      {/* Interactive Power-Up Mode Banner */}
      <AnimatePresence>
        {activePowerUp && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold backdrop-blur-md shadow-lg ${
              activePowerUp === 'swap'
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {activePowerUp === 'swap' ? (
                <>
                  <ArrowLeftRight className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    {selectedTileForSwap
                      ? 'Tile 1 selected! Now click the second tile to swap positions.'
                      : 'Click the first tile you want to swap on the board.'}
                  </span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Click any tile on the board to vaporize/delete it!</span>
                </>
              )}
            </div>

            <button
              id="cancel-powerup-btn"
              onClick={onCancelPowerUp}
              className="ml-2 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
