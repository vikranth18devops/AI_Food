import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { User, Mail, ShieldCheck, Salad, Sparkles, Heart, Activity, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12 pt-2">
      {/* Header */}
      <div className="border-b border-slate-850 pb-6">
        <h1 className="text-3xl font-black text-white heading-font flex items-center gap-2.5">
          <User className="h-7 w-7 text-emerald-400" />
          User Account <span className="gradient-text-emerald">Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage dietary preferences and security credentials</p>
      </div>

      {/* User Info Card */}
      <div className="glass-card rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/25">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white heading-font">{user?.name || 'Demo Gourmet'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-emerald-400" /> {user?.email || 'demo@foodlens.ai'}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-bold text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Verified Member
            </span>
          </div>
        </div>
      </div>

      {/* Dietary Goals Section */}
      <div className="glass-card rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white heading-font">Active Dietary Filters</h3>
          </div>
          <span className="text-xs text-slate-400">Auto-evaluates during health analysis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Vegetarian', enabled: true },
            { label: 'High Protein', enabled: true },
            { label: 'Low Sodium', enabled: false },
            { label: 'Gluten-Free', enabled: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 border space-y-2 ${
                item.enabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-850 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{item.label}</span>
                {item.enabled && <Check className="h-4 w-4 text-emerald-400" />}
              </div>
              <p className="text-[10px] text-slate-400">{item.enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
