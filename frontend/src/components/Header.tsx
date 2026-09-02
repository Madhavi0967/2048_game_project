import React from 'react';
import { Trophy, BarChart3, HelpCircle, Volume2, VolumeX, Palette, User as UserIcon, LogOut } from 'lucide-react';
import { ThemeConfig, ThemeName, UserProfile } from '../types';
import { THEMES } from '../utils/themes';

interface HeaderProps {
  currentTheme: ThemeConfig;
  isMuted: boolean;
  score: number;
  bestScore: number;
  size: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleSound: () => void;
  onSelectTheme: (themeName: ThemeName) => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenHowToPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  isMuted,
  score,
  bestScore,
  size,
  currentUser,
  onOpenAuth,
  onLogout,
  onToggleSound,
  onSelectTheme,
  onOpenLeaderboard,
  onOpenStats,
  onOpenHowToPlay,
}) => {
  const themeKeys = Object.keys(THEMES) as ThemeName[];

  return (
    <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
      {/* Brand & Title */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 select-none">
            2048
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[11px] sm:text-xs mt-0.5">
            Slide & Merge Tiles
          </p>
        </div>

        {/* Mobile quick icons */}
        <div className="flex sm:hidden items-center gap-1.5">
          {currentUser ? (
            <button
              onClick={onLogout}
              title={`Logged in as ${currentUser.username}. Tap to log out.`}
              className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-sky-400 font-bold text-xs flex items-center gap-1"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] text-white"
                style={{ background: currentUser.avatarColor || '#38bdf8' }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </button>
          ) : (
            <button
              id="mobile-auth-btn"
              onClick={onOpenAuth}
              className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xs"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
          <button
            id="mobile-sound-toggle-btn"
            onClick={onToggleSound}
            aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
          <button
            id="mobile-leaderboard-btn"
            onClick={onOpenLeaderboard}
            aria-label="Open Leaderboard"
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-amber-400 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Score Cards & Action Bar */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Score Box */}
        <div
          id="header-score-card"
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 sm:p-3.5 min-w-[110px] sm:min-w-[130px] backdrop-blur-md shadow-xl text-center flex-1 sm:flex-none"
        >
          <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
            Score
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-sky-400 block leading-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Best Score Box */}
        <div
          id="header-best-score-card"
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 sm:p-3.5 min-w-[110px] sm:min-w-[130px] backdrop-blur-md shadow-xl text-center flex-1 sm:flex-none"
        >
          <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
            Best ({size}×{size})
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-violet-400 block leading-tight">
            {bestScore.toLocaleString()}
          </span>
        </div>

        {/* Desktop Utility Controls */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1">
          {/* User Sign In / Profile Info */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-md">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs text-white uppercase shadow-sm"
                style={{ background: currentUser.avatarColor || '#38bdf8' }}
              >
                {currentUser.username.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-200 max-w-[90px] truncate">
                {currentUser.username}
              </span>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-sky-500/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Theme Dropdown */}
          <div className="relative group">
            <button
              id="theme-toggle-btn"
              title="Change Visual Theme"
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <Palette className="w-4 h-4 text-purple-400" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-40 min-w-[150px] bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-1.5 text-xs font-semibold backdrop-blur-xl space-y-1">
              {themeKeys.map((name) => (
                <button
                  key={name}
                  id={`theme-opt-${name}`}
                  onClick={() => onSelectTheme(name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentTheme.name === name
                      ? 'bg-sky-500/20 text-sky-400 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{THEMES[name].label}</span>
                  {currentTheme.name === name && <span className="text-[10px]">●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <button
            id="open-stats-btn"
            onClick={onOpenStats}
            title="Career Statistics"
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </button>

          {/* How to Play */}
          <button
            id="open-how-to-play-btn"
            onClick={onOpenHowToPlay}
            title="How to play instructions"
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
