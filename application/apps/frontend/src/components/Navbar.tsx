import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Salad, LayoutDashboard, Upload, History, User, LogOut, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 pb-1 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-2.5 backdrop-blur-xl shadow-glass">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-slate-950 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
            <Salad className="h-6 w-6 stroke-[2.5]" />
            <div className="absolute inset-0 rounded-xl bg-emerald-400 opacity-0 blur group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white heading-font leading-none flex items-center gap-1">
              FoodLens <span className="gradient-text-emerald">AI</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-jura">
              Nutrition Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        {isAuthenticated ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              to="/upload"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isActive('/upload')
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Scan Food</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isActive('/history')
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Link>

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            <Link
              to="/profile"
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                isActive('/profile')
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-xs text-slate-950">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="ml-1 flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="gradient-btn-emerald rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
