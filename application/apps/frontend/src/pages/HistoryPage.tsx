import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { getAnalysisHistory } from '../api/client';
import { History, Search, Flame, ArrowRight, Salad, ChevronLeft, ChevronRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const limit = 9;
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['foodHistory', page, limit],
    queryFn: () => getAnalysisHistory(page, limit),
  });

  const items = data?.items || [];
  const total = data?.total || items.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const filteredItems = items.filter((item: any) => {
    const dish = item.identifiedFood?.foodName || 'Dish';
    return dish.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white heading-font flex items-center gap-2.5">
            <History className="h-7 w-7 text-emerald-400" />
            Food Scan <span className="gradient-text-emerald">History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review and manage your past food image analyses</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by dish name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-850" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
            <Salad className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white heading-font">No Food Scans Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">No analysis records match your search criteria.</p>
          <Link to="/upload" className="inline-flex gradient-btn-emerald rounded-2xl px-6 py-3 text-xs font-bold text-slate-950">
            Scan New Food Photo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => {
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
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-850 pt-6">
          <p className="text-xs text-slate-400">
            Page <span className="font-bold text-white">{page}</span> of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
