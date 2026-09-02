/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardHistoryItem,
  BoardSize,
  Direction,
  GameStats,
  LeaderboardEntry,
  PowerUpsState,
  PowerUpType,
  ThemeName,
  Tile,
  UserProfile,
} from './types';
import { THEMES } from './utils/themes';
import { sound } from './utils/sound';
import { getStoredUser, logoutUser } from './utils/auth';
import {
  initializeBoard,
  moveBoard,
  spawnRandomTile,
  checkGameOver,
} from './utils/gameLogic';
import {
  getLeaderboard,
  saveLeaderboardEntry,
  fetchRemoteLeaderboard,
  saveRemoteLeaderboardEntry,
  clearLeaderboard,
  getBestScores,
  updateBestScore,
  getLastPlayerName,
  getStats,
  recordGameStats,
} from './utils/storage';

import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { GameBoard } from './components/GameBoard';
import { Controls } from './components/Controls';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { StatsModal } from './components/StatsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';

const SAVED_THEME_KEY = '2048_active_theme_v1';

export default function App() {
  // Theme state - default to 'immersive'
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(SAVED_THEME_KEY);
      if (saved && saved in THEMES) return saved as ThemeName;
    } catch {
      // Ignore
    }
    return 'immersive';
  });

  const [isMuted, setIsMuted] = useState(() => sound.getIsMuted());

  // Game Engine State
  const [size, setSize] = useState<BoardSize>(4);
  const [tiles, setTiles] = useState<Tile[]>(() => initializeBoard(4));
  const [score, setScore] = useState<number>(0);
  const [bestScores, setBestScores] = useState<Record<BoardSize, number>>(() => getBestScores());
  const [moveCount, setMoveCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [history, setHistory] = useState<BoardHistoryItem[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'over'>('playing');
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hasContinuedAfterWin, setHasContinuedAfterWin] = useState<boolean>(false);

  // Power-Ups System (Undo: 3 uses default + Emergency undos on game over, Swap: 2 uses, Delete: 2 uses)
  const [powerUps, setPowerUps] = useState<PowerUpsState>({
    undo: 3,
    swap: 2,
    delete: 2,
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [selectedTileForSwap, setSelectedTileForSwap] = useState<string | null>(null);

  // Floating score popups
  const [pointsAdded, setPointsAdded] = useState<{ id: string; amount: number }[]>([]);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [hasEnteredGame, setHasEnteredGame] = useState<boolean>(() => {
    // If already logged in, enter game directly; otherwise show login/signup screen first
    return Boolean(getStoredUser());
  });

  // Stored Records
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [stats, setStats] = useState<GameStats>(() => getStats());
  const [initialPlayerName, setInitialPlayerName] = useState(() => getLastPlayerName() || 'Player 1');

  const currentTheme = THEMES[themeName] || THEMES.immersive;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Best score for current active board size
  const bestScore = bestScores[size] || 0;

  // Highest tile on current board
  const highestTile = tiles.reduce((max, t) => Math.max(max, t.value), 0);

  // Timer loop
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Initial remote database sync
  useEffect(() => {
    fetchRemoteLeaderboard().then((res) => {
      if (res && res.entries && res.entries.length > 0) {
        setLeaderboard(res.entries);
      }
    });
  }, []);

  // Handle Escape key to cancel powerup mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePowerUp) {
        setActivePowerUp(null);
        setSelectedTileForSwap(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePowerUp]);

  // Handle Theme Change
  const handleSelectTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
    try {
      localStorage.setItem(SAVED_THEME_KEY, newTheme);
    } catch {
      // Ignore
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Restart / New Game (resets power-up counts)
  const startNewGame = useCallback((boardSize: BoardSize = size) => {
    const newTiles = initializeBoard(boardSize);
    setTiles(newTiles);
    setScore(0);
    setMoveCount(0);
    setElapsedSeconds(0);
    setHistory([]);
    setStatus('playing');
    setHasWon(false);
    setHasContinuedAfterWin(false);
    setIsGameOverModalOpen(false);
    setPointsAdded([]);
    // Reset power-ups (3 Undos default, 2 Swaps, 2 Deletes)
    setPowerUps({
      undo: 3,
      swap: 2,
      delete: 2,
    });
    setActivePowerUp(null);
    setSelectedTileForSwap(null);
  }, [size]);

  // Change Board Size
  const handleSizeChange = (newSize: BoardSize) => {
    if (newSize === size) return;
    setSize(newSize);
    startNewGame(newSize);
  };

  // Move Board Logic
  const handleMove = useCallback((direction: Direction) => {
    if (
      status === 'over' ||
      (status === 'won' && !hasContinuedAfterWin && isGameOverModalOpen) ||
      activePowerUp !== null
    ) {
      return;
    }

    const moveResult = moveBoard(tiles, size, direction);

    if (!moveResult.hasMoved) {
      return; // No movement occurred
    }

    // Save previous state to history stack for Undo (store up to 30 moves)
    setHistory((prev) => [
      {
        tiles: tiles.map((t) => ({ ...t })),
        score,
        moveCount,
      },
      ...prev.slice(0, 29),
    ]);

    // Audio feedback
    if (moveResult.scoreGained > 0) {
      sound.playMerge(moveResult.highestTile);
    } else {
      sound.playMove();
    }

    // Spawn a new tile after slide
    const { tile: spawnedTile, updatedTiles } = spawnRandomTile(moveResult.tiles, size);
    const finalTiles = spawnedTile ? updatedTiles : moveResult.tiles;

    // Update Score
    const newScore = score + moveResult.scoreGained;
    setScore(newScore);
    setMoveCount((prev) => prev + 1);
    setTiles(finalTiles);

    // Floating Points Popup
    if (moveResult.scoreGained > 0) {
      const popId = 'pop_' + Date.now() + '_' + Math.random();
      setPointsAdded((prev) => [...prev, { id: popId, amount: moveResult.scoreGained }]);
      setTimeout(() => {
        setPointsAdded((prev) => prev.filter((p) => p.id !== popId));
      }, 900);
    }

    // Update Best Score
    if (newScore > (bestScores[size] || 0)) {
      const updated = updateBestScore(size, newScore);
      setBestScores((prev) => ({ ...prev, [size]: updated }));
    }

    // Check 2048 Win condition
    if (!hasWon && moveResult.highestTile >= 2048 && !hasContinuedAfterWin) {
      setHasWon(true);
      setStatus('won');
      sound.playWin();
      setIsGameOverModalOpen(true);

      const updatedStats = recordGameStats({
        won: true,
        score: newScore,
        highestTile: moveResult.highestTile,
        merges: moveResult.mergesCount,
        durationSeconds: elapsedSeconds,
      });
      setStats(updatedStats);
      return;
    }

    // Check Game Over condition
    if (checkGameOver(finalTiles, size)) {
      setStatus('over');
      sound.playGameOver();
      setIsGameOverModalOpen(true);

      const updatedStats = recordGameStats({
        won: false,
        score: newScore,
        highestTile: Math.max(moveResult.highestTile, highestTile),
        merges: moveResult.mergesCount,
        durationSeconds: elapsedSeconds,
      });
      setStats(updatedStats);
    }
  }, [status, hasContinuedAfterWin, isGameOverModalOpen, activePowerUp, tiles, size, score, moveCount, bestScores, hasWon, highestTile, elapsedSeconds]);

  // Undo Move (Restores previous board state & resumes play)
  const handleUndo = () => {
    if (history.length === 0) return;
    if (powerUps.undo <= 0) {
      handleReviveWithUndos();
      return;
    }
    const [previousState, ...remainingHistory] = history;
    setTiles(previousState.tiles);
    setScore(previousState.score);
    setMoveCount(previousState.moveCount);
    setHistory(remainingHistory);
    setPowerUps((prev) => ({ ...prev, undo: Math.max(0, prev.undo - 1) }));
    setStatus('playing');
    setIsGameOverModalOpen(false);
    setActivePowerUp(null);
    setSelectedTileForSwap(null);
    sound.playUndo();
  };

  // Revive with Emergency Undos when Game Over occurs
  const handleReviveWithUndos = () => {
    if (history.length === 0) return;
    const [previousState, ...remainingHistory] = history;
    setTiles(previousState.tiles);
    setScore(previousState.score);
    setMoveCount(previousState.moveCount);
    setHistory(remainingHistory);
    // Give +2 undos, use 1 immediately for the rewind
    setPowerUps((prev) => ({ ...prev, undo: prev.undo + 1 }));
    setStatus('playing');
    setIsGameOverModalOpen(false);
    setActivePowerUp(null);
    setSelectedTileForSwap(null);
    sound.playUndo();
  };

  // Toggle Power-Up Modes (Swap / Delete)
  const handleTogglePowerUp = (type: 'swap' | 'delete') => {
    if (powerUps[type] <= 0) return;

    if (activePowerUp === type) {
      // Deactivate
      setActivePowerUp(null);
      setSelectedTileForSwap(null);
    } else {
      // Activate
      setActivePowerUp(type);
      setSelectedTileForSwap(null);
      sound.playPowerUpSelect();
    }
  };

  const handleCancelPowerUp = () => {
    setActivePowerUp(null);
    setSelectedTileForSwap(null);
  };

  // Handle Tile Click in Interactive Modes (Swap / Delete)
  const handleTileClick = (clickedTile: Tile) => {
    if (activePowerUp === 'delete') {
      if (powerUps.delete <= 0) return;

      // Save to history before deleting
      setHistory((prev) => [
        {
          tiles: tiles.map((t) => ({ ...t })),
          score,
          moveCount,
        },
        ...prev.slice(0, 14),
      ]);

      const updatedTiles = tiles.filter((t) => t.id !== clickedTile.id);
      setTiles(updatedTiles);
      setPowerUps((prev) => ({ ...prev, delete: Math.max(0, prev.delete - 1) }));
      setActivePowerUp(null);
      sound.playDelete();

      // If game was in over state, restore to playing
      if (status === 'over') {
        setStatus('playing');
        setIsGameOverModalOpen(false);
      }
    } else if (activePowerUp === 'swap') {
      if (powerUps.swap <= 0) return;

      if (!selectedTileForSwap) {
        // First tile selected
        setSelectedTileForSwap(clickedTile.id);
        sound.playPowerUpSelect();
      } else {
        if (selectedTileForSwap === clickedTile.id) {
          // Deselect if clicked the same tile
          setSelectedTileForSwap(null);
          return;
        }

        const tile1 = tiles.find((t) => t.id === selectedTileForSwap);
        const tile2 = clickedTile;

        if (tile1 && tile2) {
          // Save to history before swapping
          setHistory((prev) => [
            {
              tiles: tiles.map((t) => ({ ...t })),
              score,
              moveCount,
            },
            ...prev.slice(0, 14),
          ]);

          // Swap rows & cols
          const newTiles = tiles.map((t) => {
            if (t.id === tile1.id) {
              return { ...t, row: tile2.row, col: tile2.col };
            }
            if (t.id === tile2.id) {
              return { ...t, row: tile1.row, col: tile1.col };
            }
            return t;
          });

          setTiles(newTiles);
          setPowerUps((prev) => ({ ...prev, swap: Math.max(0, prev.swap - 1) }));
          setActivePowerUp(null);
          setSelectedTileForSwap(null);
          sound.playSwap();

          // Check if newly swapped board allows more moves
          if (status === 'over' && !checkGameOver(newTiles, size)) {
            setStatus('playing');
            setIsGameOverModalOpen(false);
          }
        }
      }
    }
  };

  // Continue Game past 2048
  const handleContinuePlaying = () => {
    setHasContinuedAfterWin(true);
    setStatus('playing');
    setIsGameOverModalOpen(false);
  };

  // Save Score to Leaderboard (MongoDB / Local)
  const handleSaveScore = async (name: string) => {
    const saved = await saveRemoteLeaderboardEntry({
      playerName: name,
      score,
      highestTile,
      boardSize: size,
      moves: moveCount,
      durationSeconds: elapsedSeconds,
      theme: themeName,
    });
    setLeaderboard((prev) => {
      const exists = prev.some((e) => e.id === saved.id);
      const list = exists ? prev : [saved, ...prev];
      return list.sort((a, b) => b.score - a.score).slice(0, 100);
    });
    setInitialPlayerName(name);
  };

  // Clear Leaderboard
  const handleClearLeaderboard = () => {
    clearLeaderboard();
    setLeaderboard([]);
  };

  // Show Login / Sign-up Screen FIRST if user is not logged in yet
  if (!hasEnteredGame && !currentUser) {
    return (
      <AuthScreen
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setInitialPlayerName(user.username);
          setHasEnteredGame(true);
        }}
        onPlayAsGuest={() => {
          setHasEnteredGame(true);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-300 flex flex-col items-center justify-between ${currentTheme.bg} ${currentTheme.textColor} px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden`}
    >
      {/* Immersive Atmospheric Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col flex-1 gap-4 sm:gap-6">
        {/* Top Header & Score HUD */}
        <Header
          currentTheme={currentTheme}
          isMuted={isMuted}
          score={score}
          bestScore={bestScore}
          size={size}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            logoutUser();
            setCurrentUser(null);
            setHasEnteredGame(false);
            sound.playUndo();
          }}
          onToggleSound={handleToggleSound}
          onSelectTheme={handleSelectTheme}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        />

        {/* Dual-Column Interactive Workspace */}
        <main className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 xl:gap-10 w-full flex-1">
          {/* Left Column: Board & Primary Controls */}
          <div className="w-full max-w-[480px] flex flex-col items-center gap-4">
            {/* Dynamic Score & Power-Ups Deck */}
            <ScoreBoard
              score={score}
              bestScore={bestScore}
              size={size}
              moveCount={moveCount}
              elapsedSeconds={elapsedSeconds}
              canUndo={history.length > 0 && powerUps.undo > 0}
              powerUps={powerUps}
              activePowerUp={activePowerUp}
              selectedTileForSwap={selectedTileForSwap}
              theme={currentTheme}
              pointsAdded={pointsAdded}
              onUndo={handleUndo}
              onTogglePowerUp={handleTogglePowerUp}
              onCancelPowerUp={handleCancelPowerUp}
              onRestart={() => startNewGame(size)}
              onSizeChange={handleSizeChange}
            />

            {/* Interactive 2048 Game Board */}
            <GameBoard
              tiles={tiles}
              size={size}
              theme={currentTheme}
              onMove={handleMove}
              interactiveMode={activePowerUp}
              selectedTileId={selectedTileForSwap}
              onTileClick={handleTileClick}
              disabled={isGameOverModalOpen || isLeaderboardOpen || isStatsOpen || isHowToPlayOpen}
            />

            {/* Touch / D-Pad Directional Controls */}
            <Controls
              onMove={handleMove}
              disabled={isGameOverModalOpen || isLeaderboardOpen || isStatsOpen || isHowToPlayOpen || activePowerUp !== null}
            />
          </div>

          {/* Right Column: Live Leaderboard HUD Panel (Desktop) */}
          <div className="hidden lg:flex flex-1 w-full max-w-[500px]">
            <LeaderboardPanel
              entries={leaderboard}
              currentSize={size}
              stats={stats}
              onClearLeaderboard={handleClearLeaderboard}
              onOpenFullLeaderboard={() => setIsLeaderboardOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-6xl text-center pt-4 pb-1 text-[11px] font-medium text-slate-500 flex flex-wrap items-center justify-center gap-4">
        <span>Use Arrow Keys or Swipe to merge numbers and build <strong>2048</strong>!</span>
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="lg:hidden text-sky-400 font-bold hover:underline cursor-pointer"
        >
          View Full Leaderboard →
        </button>
      </footer>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        onClear={handleClearLeaderboard}
        currentSize={size}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        isWin={status === 'won'}
        score={score}
        highestTile={highestTile}
        boardSize={size}
        moves={moveCount}
        elapsedSeconds={elapsedSeconds}
        initialPlayerName={currentUser?.username || initialPlayerName}
        undoCount={powerUps.undo}
        canUndo={history.length > 0}
        onUndo={handleUndo}
        onReviveWithUndos={handleReviveWithUndos}
        onSaveScore={handleSaveScore}
        onRestart={() => startNewGame(size)}
        onContinue={handleContinuePlaying}
        onOpenLeaderboard={() => {
          setIsGameOverModalOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Login & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setInitialPlayerName(user.username);
        }}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
