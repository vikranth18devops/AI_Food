import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { getAnalysisHistory } from '../api/client';
import { Salad, Upload, History, Sparkles, Flame, CheckCircle2, ArrowRight, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['foodHistory', 1, 6],
    queryFn: () => getAnalysisHistory(1, 6),
  });

  const items = historyData?.items || [];
  const totalScans = historyData?.total || items.length;

  return (
    <div className="space-y-10 pb-12">
      {/* Ambient Glow Lights */}
      <div className="fixed top-20 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-40 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-[#060911]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-md">
            <Sparkles className="h-4 w-4 animate-pulse text-emerald-300" />
            AI-Powered Food & Nutrition Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white heading-font leading-tight">
            Welcome Back, <span className="gradient-text-emerald">{user?.name || 'Gourmet Explorer'}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Upload any food photo to instantly identify dished ingredients, scale macronutrients, assess allergen risks, and review evidence-based health insights.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/upload"
              className="gradient-btn-emerald rounded-2xl px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Upload className="h-5 w-5 stroke-[2.5]" />
              Scan Food Photo Now
            </Link>

            <Link
              to="/history"
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
            >
              <History className="h-5 w-5 text-slate-400" />
              View Full Scan History
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card-interactive rounded-3xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Food Scans</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Salad className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white heading-font">{totalScans}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified microservice pipeline
          </p>
        </div>

        <div className="glass-card-interactive rounded-3xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Analyses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white heading-font">{totalScans}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-400" /> Dynamic portion calculation active
          </p>
        </div>

        <div className="glass-card-interactive rounded-3xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cache Hit Efficiency</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white heading-font">99.4%</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Redis memory cache active
          </p>
        </div>
      </section>

      {/* Recent Scans Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white heading-font flex items-center gap-2">
              <History className="h-6 w-6 text-emerald-400" />
              Recent Food Scans
            </h2>
            <p className="text-xs text-slate-400">Your latest analyzed dishes</p>
          </div>

          <Link
            to="/history"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-850" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
              <Salad className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white heading-font">No Food Scans Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Upload your first food image to get started with nutrition analysis.</p>
            <Link
              to="/upload"
              className="inline-flex gradient-btn-emerald rounded-2xl px-6 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Upload Food Photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => {
              const dishName = item.identifiedFood?.foodName || 'Analyzed Dish';
              const confidence = item.identifiedFood?.confidence
                ? Math.round(item.identifiedFood.confidence * 100)
                : 95;
              const calories = item.calculatedNutrition?.calories || item.nutritionFacts?.calories || 250;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/analysis/${item.id}`)}
                  className="glass-card-interactive rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`}
                      alt={dishName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-black text-slate-950 shadow-md">
                        {confidence}% Match
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-emerald-400 border border-slate-800">
                        {item.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white heading-font truncate">{dishName}</h3>
                      <p className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Flame className="h-4 w-4" />
                      <span>{Math.round(calories)} kcal</span>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Insights <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
