import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, ArrowRight, Lightbulb, Compass, Award, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-800 p-6 overflow-hidden max-h-[90vh] flex flex-col text-slate-100 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                How to Play 2048
              </h2>
            </div>
            <button
              id="close-how-to-play-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rules and Guide Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs sm:text-sm text-slate-300">
            {/* Rule 1: Sliding & Merging */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Controls & Mechanics</span>
              </div>
              <p className="text-xs text-slate-300">
                Swipe or use your <strong>Arrow keys / WASD</strong> to shift all tiles across the grid.
              </p>
              <div className="flex items-center justify-center gap-2 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 border border-slate-600 font-bold flex items-center justify-center text-xs shadow-xs">2</span>
                <span className="text-slate-500">+</span>
                <span className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 border border-slate-600 font-bold flex items-center justify-center text-xs shadow-xs">2</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="w-8 h-8 rounded-lg bg-slate-600 text-slate-100 border border-slate-500 font-bold flex items-center justify-center text-xs shadow-xs">4</span>
              </div>
              <p className="text-[11px] text-slate-400">
                When two identical numbers touch during a slide, they <strong>merge into one</strong> doubling their value!
              </p>
            </div>

            {/* Rule 2: Goal */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Award className="w-4 h-4 text-amber-400" />
                <span>The 2048 Milestone</span>
              </div>
              <p className="text-xs text-slate-300">
                Keep merging tiles to reach the legendary <strong className="text-amber-400">2048 tile</strong>! Once achieved, you can choose to continue playing for even higher scores (4096, 8192+).
              </p>
            </div>

            {/* Rule 3: Power-Ups (2 Uses Each) */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Special Power-Ups (2 Uses Each)</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-sky-400 shrink-0">↩ Undo (2x):</span>
                  <span>Made a bad slide? Roll back the board to your previous turn.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-amber-400 shrink-0">⇄ Swap (2x):</span>
                  <span>Click any two tiles to switch their board coordinates and create powerful alignment combos.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-rose-400 shrink-0">🗑 Delete (2x):</span>
                  <span>Click any blocking low-value tile to instantly vaporize it and unlock blocked paths!</span>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <Lightbulb className="w-4 h-4" />
                <span>Master Strategy Tip</span>
              </div>
              <p className="text-xs text-slate-300">
                Pick a <strong>corner</strong> (e.g. bottom-right) and build your largest tile there. Avoid sliding away from that corner to maintain your grid in monotonic order!
              </p>
            </div>
          </div>

          <button
            id="close-how-to-play-btn-bottom"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            Got It, Let's Play!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
