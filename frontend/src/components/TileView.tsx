import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { Tile, ThemeConfig, BoardSize, PowerUpType } from '../types';

interface TileViewProps {
  tile: Tile;
  size: BoardSize;
  theme: ThemeConfig;
  interactiveMode?: PowerUpType;
  isSelectedForSwap?: boolean;
  onClick?: () => void;
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  size,
  theme,
  interactiveMode,
  isSelectedForSwap = false,
  onClick,
}) => {
  const tileTheme = theme.tileColors[tile.value] || {
    bg: 'bg-zinc-900 border border-amber-400',
    text: 'text-amber-300 font-black',
    glow: 'shadow-[0_0_35px_rgba(251,191,36,0.8)]',
  };

  // Dynamically scale font size based on tile value length and board size
  const valLength = tile.value.toString().length;
  let fontSize = 'text-3xl font-bold';

  if (size === 3) {
    if (valLength >= 4) fontSize = 'text-3xl font-extrabold';
    else if (valLength === 3) fontSize = 'text-4xl font-extrabold';
    else fontSize = 'text-5xl font-black';
  } else if (size === 4) {
    if (valLength >= 5) fontSize = 'text-xl sm:text-2xl font-bold';
    else if (valLength === 4) fontSize = 'text-2xl sm:text-3xl font-extrabold';
    else if (valLength === 3) fontSize = 'text-3xl sm:text-4xl font-extrabold';
    else fontSize = 'text-3xl sm:text-4xl font-black';
  } else if (size === 5) {
    if (valLength >= 4) fontSize = 'text-base sm:text-lg font-bold';
    else if (valLength === 3) fontSize = 'text-lg sm:text-xl font-bold';
    else fontSize = 'text-2xl sm:text-3xl font-extrabold';
  } else {
    // size 6
    if (valLength >= 4) fontSize = 'text-xs sm:text-sm font-bold';
    else if (valLength === 3) fontSize = 'text-sm sm:text-base font-bold';
    else fontSize = 'text-lg sm:text-xl font-extrabold';
  }

  // Calculate percentage coordinates
  const cellSizePercent = 100 / size;
  const leftPercent = tile.col * cellSizePercent;
  const topPercent = tile.row * cellSizePercent;

  const isInteractive = Boolean(interactiveMode);

  return (
    <motion.div
      id={`tile-${tile.id}`}
      initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
      animate={{
        scale: tile.isMerged ? [1, 1.18, 1] : isSelectedForSwap ? 1.06 : 1,
        opacity: 1,
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
      }}
      transition={{
        left: { type: 'spring', stiffness: 450, damping: 35 },
        top: { type: 'spring', stiffness: 450, damping: 35 },
        scale: { duration: tile.isMerged ? 0.22 : 0.15 },
      }}
      style={{
        width: `${cellSizePercent}%`,
        height: `${cellSizePercent}%`,
        position: 'absolute',
      }}
      className={`p-1.5 sm:p-2 select-none ${
        isInteractive ? 'pointer-events-auto cursor-pointer z-20' : 'pointer-events-none'
      }`}
      onClick={isInteractive ? onClick : undefined}
    >
      <div
        className={`relative w-full h-full rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-150 group ${
          tileTheme.bg
        } ${tileTheme.text} ${tileTheme.glow || 'shadow-sm'} ${
          isSelectedForSwap
            ? 'ring-4 ring-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.9)] animate-pulse'
            : interactiveMode === 'swap'
            ? 'hover:ring-3 hover:ring-sky-400 hover:scale-105'
            : interactiveMode === 'delete'
            ? 'hover:ring-3 hover:ring-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.8)] hover:scale-105'
            : ''
        }`}
      >
        <span className={`${fontSize} tracking-tight leading-none`}>
          {tile.value}
        </span>

        {/* Selected for Swap Badge */}
        {isSelectedForSwap && (
          <div className="absolute -top-2 -right-2 bg-sky-500 text-slate-950 p-1 rounded-full shadow-lg flex items-center justify-center">
            <ArrowLeftRight className="w-3 h-3 stroke-[3]" />
          </div>
        )}

        {/* Delete Mode Hover Target Cue */}
        {interactiveMode === 'delete' && (
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-rose-500/0 group-hover:bg-rose-500/25 border-2 border-transparent group-hover:border-rose-500 flex items-center justify-center transition-all">
            <Trash2 className="w-5 h-5 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
          </div>
        )}

        {/* Swap Mode Hover Cue */}
        {interactiveMode === 'swap' && !isSelectedForSwap && (
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-sky-500/0 group-hover:bg-sky-500/20 border border-transparent group-hover:border-sky-400 flex items-center justify-center transition-all">
            <ArrowLeftRight className="w-4 h-4 text-sky-200 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
