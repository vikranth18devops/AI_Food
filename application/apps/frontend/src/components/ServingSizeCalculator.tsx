import React, { useState } from 'react';
import { Scale, Sparkles, SlidersHorizontal } from 'lucide-react';

interface Props {
  currentGrams: number;
  onServingSizeChange: (grams: number) => void;
}

const PRESETS = [100, 200, 250, 350, 500];

export const ServingSizeCalculator: React.FC<Props> = ({ currentGrams, onServingSizeChange }) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(!PRESETS.includes(currentGrams));

  const handlePresetSelect = (grams: number) => {
    setIsCustom(false);
    onServingSizeChange(grams);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0 && val <= 2000) {
      onServingSizeChange(val);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5 relative overflow-hidden">
      {/* Background Accent Ambient Light */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base heading-font">Portion Size Recalculator</h3>
            <p className="text-[11px] text-slate-400">Dynamic linear macro scaling</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 font-jura tracking-wider">
          {currentGrams} grams
        </span>
      </div>

      {/* Preset Pills */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 font-jura">
          Quick Preset Portion (Grams)
        </label>
        <div className="grid grid-cols-5 gap-2 font-jura">
          {PRESETS.map(grams => {
            const isSelected = !isCustom && currentGrams === grams;
            return (
              <button
                key={grams}
                type="button"
                onClick={() => handlePresetSelect(grams)}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'gradient-btn-emerald text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.03]'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {grams}g
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Serving Size Input Form */}
      <form onSubmit={handleCustomSubmit} className="space-y-2 pt-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Custom Gram Quantity
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="number"
              placeholder="e.g. 300"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              min="1"
              max="2000"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};
