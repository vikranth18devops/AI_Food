import React from 'react';
import { AnalysisStatus } from '@foodlens/shared-types';
import { CheckCircle2, Loader2, AlertCircle, Upload, Eye, Database, HeartPulse, Youtube, Sparkles } from 'lucide-react';

interface Props {
  currentStatus: AnalysisStatus;
  errorMessage?: string | null;
}

const STAGES = [
  { key: AnalysisStatus.PENDING, label: 'Uploading Image', icon: Upload },
  { key: AnalysisStatus.FOOD_RECOGNITION, label: 'Recognizing Dish', icon: Eye },
  { key: AnalysisStatus.NUTRITION, label: 'Retrieving Nutrition Facts', icon: Database },
  { key: AnalysisStatus.HEALTH_ANALYSIS, label: 'Evaluating Health Insights', icon: HeartPulse },
  { key: AnalysisStatus.RECOMMENDATIONS, label: 'Finding Recipe Videos', icon: Youtube },
  { key: AnalysisStatus.COMPLETED, label: 'Analysis Completed', icon: Sparkles },
];

export const ProgressVisualizer: React.FC<Props> = ({ currentStatus, errorMessage }) => {
  const getStageIndex = (status: AnalysisStatus) => {
    switch (status) {
      case AnalysisStatus.PENDING:
        return 0;
      case AnalysisStatus.PROCESSING:
      case AnalysisStatus.FOOD_RECOGNITION:
        return 1;
      case AnalysisStatus.NUTRITION:
        return 2;
      case AnalysisStatus.HEALTH_ANALYSIS:
        return 3;
      case AnalysisStatus.RECOMMENDATIONS:
        return 4;
      case AnalysisStatus.COMPLETED:
        return 5;
      case AnalysisStatus.FAILED:
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStatus);
  const progressPercent = Math.min(100, Math.max(10, ((activeIndex + 1) / STAGES.length) * 100));

  if (currentStatus === AnalysisStatus.FAILED) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-300 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold heading-font">Analysis Workflow Failed</h3>
        <p className="text-sm text-rose-200/80 max-w-md mx-auto">{errorMessage || 'An error occurred during workflow processing.'}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white heading-font flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Real-Time Analysis Engine
          </h3>
          <p className="text-xs text-slate-400">Microservice Event Queue Progress</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 animate-pulse">
            {currentStatus === AnalysisStatus.COMPLETED ? '100% Ready' : `Processing Stage ${activeIndex + 1}/6`}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-700 shadow-glow"
          />
        </div>
      </div>

      {/* Stages Grid */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isDone = activeIndex > idx || currentStatus === AnalysisStatus.COMPLETED;
          const isCurrent = activeIndex === idx && currentStatus !== AnalysisStatus.COMPLETED;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 ${
                isCurrent
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-glow shadow-emerald-500/10 scale-[1.01]'
                  : isDone
                  ? 'bg-slate-900/50 border border-slate-800/80 text-slate-200'
                  : 'bg-slate-900/20 border border-slate-900/40 text-slate-600'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors ${
                isDone
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isCurrent
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                  : 'bg-slate-850 text-slate-600'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base leading-snug">{stage.label}</p>
                {isCurrent && (
                  <p className="text-xs text-emerald-400/90 mt-0.5">Active AMQP message consumer processing...</p>
                )}
              </div>

              {isDone && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  Done <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
