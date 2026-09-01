import React from 'react';
import { NutritionFactsDto } from '@foodlens/shared-types';
import { Flame, Dumbbell, Wheat, Droplet, Cookie, Activity, PieChart } from 'lucide-react';

interface Props {
  nutrition: NutritionFactsDto;
  servingSizeGrams: number;
}

export const NutritionChart: React.FC<Props> = ({ nutrition, servingSizeGrams }) => {
  const calories = nutrition.calories ?? 0;
  const protein = nutrition.protein ?? 0;
  const carbs = nutrition.carbohydrates ?? 0;
  const fat = nutrition.fat ?? 0;

  const totalMacroGrams = (protein + carbs + fat) || 1;
  const proteinPct = Math.round((protein / totalMacroGrams) * 100);
  const carbsPct = Math.round((carbs / totalMacroGrams) * 100);
  const fatPct = Math.round((fat / totalMacroGrams) * 100);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xl font-extrabold text-white heading-font">Nutrient Breakdown</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Recalculated for <span className="font-bold text-emerald-400">{servingSizeGrams}g</span> portion size • <span className="italic">{nutrition.source}</span>
          </p>
        </div>

        {/* Calories Badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 px-4 py-2.5 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 shrink-0 font-jura">
          <Flame className="h-7 w-7 stroke-[2.5] text-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-2xl font-black heading-font leading-none text-white font-jura">
              {nutrition.calories !== null ? Math.round(nutrition.calories) : 'N/A'}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-jura">Total Calories (kcal)</span>
          </div>
        </div>
      </div>

      {/* Visual Macro Percentage Ratio Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Protein ({proteinPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Carbs ({carbsPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Fat ({fatPct}%)
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-900 flex p-0.5 border border-slate-800">
          <div style={{ width: `${proteinPct}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500" title={`Protein ${proteinPct}%`} />
          <div style={{ width: `${carbsPct}%` }} className="bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-500" title={`Carbs ${carbsPct}%`} />
          <div style={{ width: `${fatPct}%` }} className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-r-full transition-all duration-500" title={`Fat ${fatPct}%`} />
        </div>
      </div>

      {/* Nutrient Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-jura">
        {/* Protein */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-1 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Dumbbell className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Protein</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.protein !== null ? `${nutrition.protein}g` : 'N/A'}
          </p>
        </div>

        {/* Carbs */}
        <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-1 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-sky-400">
            <Wheat className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Carbs</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.carbohydrates !== null ? `${nutrition.carbohydrates}g` : 'N/A'}
          </p>
        </div>

        {/* Fat */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-1 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Droplet className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Fat</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.fat !== null ? `${nutrition.fat}g` : 'N/A'}
          </p>
        </div>

        {/* Fiber */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 space-y-1 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-purple-400">
            <Cookie className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Fiber</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.fiber !== null ? `${nutrition.fiber}g` : 'N/A'}
          </p>
        </div>

        {/* Sugar */}
        <div className="rounded-2xl border border-pink-500/20 bg-pink-950/20 p-4 space-y-1 hover:border-pink-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-pink-400">
            <Cookie className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Sugar</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.sugar !== null ? `${nutrition.sugar}g` : 'N/A'}
          </p>
        </div>

        {/* Sodium */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-4 space-y-1 hover:border-rose-500/40 transition-colors">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Activity className="h-4 w-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Sodium</span>
          </div>
          <p className="text-xl font-black text-white heading-font">
            {nutrition.sodium !== null ? `${nutrition.sodium}mg` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
