import React, { useRef, useEffect } from 'react';
import { BoardSize, Direction, ThemeConfig, Tile, PowerUpType } from '../types';
import { TileView } from './TileView';

interface GameBoardProps {
  tiles: Tile[];
  size: BoardSize;
  theme: ThemeConfig;
  onMove: (dir: Direction) => void;
  disabled?: boolean;
  interactiveMode?: PowerUpType;
  selectedTileId?: string | null;
  onTileClick?: (tile: Tile) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  size,
  theme,
  onMove,
  disabled = false,
  interactiveMode = null,
  selectedTileId = null,
  onTileClick,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || interactiveMode) return;

      let direction: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'RIGHT';
          break;
      }

      if (direction) {
        // Prevent window scrolling with arrow keys
        e.preventDefault();
        onMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, interactiveMode, onMove]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || interactiveMode || e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || interactiveMode || !touchStartRef.current || e.changedTouches.length !== 1) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartRef.current.x;
    const diffY = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 25; // pixels

    if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
      return;
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 0) {
        onMove('RIGHT');
      } else {
        onMove('LEFT');
      }
    } else {
      // Vertical swipe
      if (diffY > 0) {
        onMove('DOWN');
      } else {
        onMove('UP');
      }
    }
  };

  // Generate empty grid cells for background layer
  const emptyCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      emptyCells.push({ row: r, col: c, key: `empty-${r}-${c}` });
    }
  }

  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      <div
        id="game-board"
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full aspect-square rounded-3xl p-3 sm:p-4 shadow-2xl border backdrop-blur-sm transition-all duration-200 ${
          interactiveMode === 'swap'
            ? 'border-sky-500/80 shadow-[0_0_30px_rgba(14,165,233,0.25)]'
            : interactiveMode === 'delete'
            ? 'border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
            : 'border-slate-800/80'
        } ${theme.boardBg}`}
      >
        {/* Background Empty Cells Grid */}
        <div
          className="w-full h-full grid gap-2 sm:gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {emptyCells.map((cell) => (
            <div
              key={cell.key}
              id={cell.key}
              className={`w-full h-full rounded-xl sm:rounded-2xl transition-colors duration-150 ${theme.emptyCellBg}`}
            />
          ))}
        </div>

        {/* Foreground Animated Tiles Layer */}
        <div className={`absolute inset-3 sm:inset-4 ${interactiveMode ? '' : 'pointer-events-none'}`}>
          {tiles.map((tile) => (
            <TileView
              key={tile.id}
              tile={tile}
              size={size}
              theme={theme}
              interactiveMode={interactiveMode}
              isSelectedForSwap={selectedTileId === tile.id}
              onClick={() => onTileClick && onTileClick(tile)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
