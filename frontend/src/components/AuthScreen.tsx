import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, User, LogIn, UserPlus, Play, Trophy, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { loginUserApi, signupUserApi } from '../utils/auth';
import { sound } from '../utils/sound';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
  onPlayAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  onPlayAsGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Please choose a player name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (!email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUserApi(email, password);
        if (res.success && res.user) {
          sound.playWin();
          onAuthenticated(res.user);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } else {
        const res = await signupUserApi(username, email, password);
        if (res.success && res.user) {
          sound.playWin();
          onAuthenticated(res.user);
        } else {
          setError(res.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {/* Immersive background glow circles */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-sky-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl"
      >
        {/* Top Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-violet-600 shadow-lg shadow-sky-500/30 text-white font-black text-2xl tracking-tighter mb-3">
            2048
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back!' : 'Join the Arena'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'login'
              ? 'Log in to save high scores & compete on the global leaderboard'
              : 'Create an account to track stats, earn ranks & sync scores'}
          </p>
        </div>

        {/* Login / Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-slate-950/80 border border-slate-800/90">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Player Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. MasterGamer2048"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In to Play</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Play</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or continue without account</span>
          </div>
        </div>

        {/* Play as Guest Button */}
        <button
          type="button"
          onClick={onPlayAsGuest}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Play className="w-3.5 h-3.5 text-sky-400" />
          <span>Play as Guest</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* Badges / Highlights */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>MongoDB Cloud Ranks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Protected Scores</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
