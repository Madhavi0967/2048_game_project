import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface ControlsProps {
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onMove, disabled = false }) => {
  return (
    <div className="w-full max-w-[280px] mx-auto pt-1 sm:pt-2">
      <div className="grid grid-cols-3 gap-2">
        <div />
        <button
          id="btn-move-up"
          onClick={() => onMove('UP')}
          disabled={disabled}
          aria-label="Move Up"
          className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-sky-400" />
        </button>
        <div />

        <button
          id="btn-move-left"
          onClick={() => onMove('LEFT')}
          disabled={disabled}
          aria-label="Move Left"
          className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-sky-400" />
        </button>
        <button
          id="btn-move-down"
          onClick={() => onMove('DOWN')}
          disabled={disabled}
          aria-label="Move Down"
          className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 text-sky-400" />
        </button>
        <button
          id="btn-move-right"
          onClick={() => onMove('RIGHT')}
          disabled={disabled}
          aria-label="Move Right"
          className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <ArrowRight className="w-5 h-5 text-sky-400" />
        </button>
      </div>
      <p className="text-center text-[11px] font-medium text-slate-500 mt-2">
        Use Arrow keys, WASD, or swipe anywhere on the board
      </p>
    </div>
  );
};
