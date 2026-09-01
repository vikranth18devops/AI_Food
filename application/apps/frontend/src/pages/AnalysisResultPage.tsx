import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisResult, getAnalysisStatus } from '../api/client';
import { AnalysisStatus } from '@foodlens/shared-types';
import { ProgressVisualizer } from '../components/ProgressVisualizer';
import { ServingSizeCalculator } from '../components/ServingSizeCalculator';
import { NutritionChart } from '../components/NutritionChart';
import { Salad, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Youtube, Sparkles, HeartPulse, ThumbsUp, ThumbsDown, BookOpen, AlertCircle } from 'lucide-react';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [servingGrams, setServingGrams] = useState<number>(100);
  const [liveStatus, setLiveStatus] = useState<AnalysisStatus>(AnalysisStatus.PENDING);

  // Fast polling status while processing (400ms interval)
  const { data: statusData } = useQuery({
    queryKey: ['analysisStatus', id],
    queryFn: () => getAnalysisStatus(id!),
    enabled: !!id && liveStatus !== AnalysisStatus.COMPLETED && liveStatus !== AnalysisStatus.FAILED,
    refetchInterval: 400,
  });

  useEffect(() => {
    if (statusData?.status) {
      setLiveStatus(statusData.status);
    }
  }, [statusData]);

  // SSE Stream listener for real-time status pushing
  useEffect(() => {
    if (!id || liveStatus === AnalysisStatus.COMPLETED || liveStatus === AnalysisStatus.FAILED) return;

    const eventSource = new EventSource(`/api/v1/food/analysis/${id}/status?sse=true`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.status) {
          setLiveStatus(payload.status);
          if (payload.status === AnalysisStatus.COMPLETED || payload.status === AnalysisStatus.FAILED) {
            eventSource.close();
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event', err);
      }
    };

    return () => eventSource.close();
  }, [id, liveStatus]);

  // Fetch full analysis result once completed or ready
  const { data: resultData, isLoading, refetch } = useQuery({
    queryKey: ['analysisResult', id, servingGrams],
    queryFn: () => getAnalysisResult(id!, servingGrams),
    enabled: !!id,
  });

  useEffect(() => {
    if (liveStatus === AnalysisStatus.COMPLETED) {
      refetch();
    }
  }, [liveStatus, refetch]);

  const analysis = resultData?.data;

  if (isLoading && !analysis) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <ProgressVisualizer currentStatus={liveStatus} errorMessage={statusData?.errorMessage} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl pt-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white heading-font">Analysis Record Not Found</h2>
        <p className="text-sm text-slate-400">The requested food analysis record could not be loaded.</p>
        <Link to="/upload" className="inline-flex gradient-btn-emerald rounded-2xl px-6 py-3 text-xs font-bold text-slate-950">
          Upload New Image
        </Link>
      </div>
    );
  }

  const isCompleted = analysis.status === AnalysisStatus.COMPLETED;
  const dishName = analysis.identifiedFood?.foodName || 'Identified Food Item';
  const confidencePct = Math.round((analysis.identifiedFood?.confidence || 0.95) * 100);
  const nutrition = analysis.calculatedNutrition || analysis.nutritionFacts;
  const health = analysis.healthAnalysis;

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16 pt-2">
      {/* Real-time Status Visualizer if still processing */}
      {!isCompleted && (
        <ProgressVisualizer currentStatus={liveStatus} errorMessage={analysis.errorMessage} />
      )}

      {/* Dish Header Hero Card */}
      <section className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Image Column */}
          <div className="md:col-span-5 relative h-64 md:h-auto min-h-[260px] bg-slate-950 overflow-hidden">
            <img
              src={analysis.imageUrl.startsWith('/') ? analysis.imageUrl : `/${analysis.imageUrl}`}
              alt={dishName}
              className="h-full w-full object-cover"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <span className="absolute top-4 left-4 rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-black text-slate-950 shadow-lg font-jura tracking-wider">
              {confidencePct}% AI Confidence
            </span>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  {analysis.status}
                </span>
                <span className="text-xs text-slate-400">
                  Scanned on {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white heading-font">{dishName}</h1>

              {/* Ingredients Pills */}
              {analysis.identifiedFood?.ingredients && analysis.identifiedFood.ingredients.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Detected Ingredients
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.identifiedFood.ingredients.map((ing: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Multi-service Verified
              </span>
              <Link to="/upload" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
                Scan Another Dish →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Serving Size Calculator & Nutrition Breakdown */}
      {nutrition && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <ServingSizeCalculator
              currentGrams={servingGrams}
              onServingSizeChange={grams => setServingGrams(grams)}
            />
          </div>
          <div className="md:col-span-7">
            <NutritionChart nutrition={nutrition} servingSizeGrams={servingGrams} />
          </div>
        </section>
      )}

      {/* Health Insights & Allergen Analysis */}
      {health && (
        <section className="space-y-8">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-2xl font-black text-white heading-font flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-emerald-400" />
              Health Insights & Dietary Analysis
            </h2>
            <p className="text-xs text-slate-400">Educational evaluation derived from ingredient composition</p>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-emerald-500/20 bg-emerald-950/10">
              <h3 className="text-base font-bold text-emerald-400 heading-font flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" /> Nutritional Pros
              </h3>
              <ul className="space-y-2.5">
                {(health.pros || health.benefits || []).map((pro: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-rose-500/20 bg-rose-950/10">
              <h3 className="text-base font-bold text-rose-400 heading-font flex items-center gap-2">
                <ThumbsDown className="h-5 w-5" /> Potential Concerns
              </h3>
              <ul className="space-y-2.5">
                {(health.cons || health.concerns || []).map((con: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Allergens & Dietary Compatibility Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Allergens Alert Card */}
            <div className="glass-card rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Possible Allergen Warnings
              </h3>
              {health.allergens && health.allergens.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {health.allergens.map((all: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-rose-500/15 border border-rose-500/30 px-3.5 py-1.5 text-xs font-bold text-rose-300 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> {all}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No major common allergens flagged.</p>
              )}
            </div>

            {/* Dietary Compatibility Badges */}
            <div className="glass-card rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Dietary Compatibility
              </h3>
              <div className="flex flex-wrap gap-2">
                {(health.dietaryCompatibility || []).map((item: any, i: number) => (
                  <span
                    key={i}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold border flex items-center gap-1.5 ${
                      item.isCompatible
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {item.isCompatible ? '✓' : '✕'} {item.diet}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Claims & Source Citation Links */}
          {health.claims && health.claims.length > 0 && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white heading-font flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-400" /> Evidence-Based Scientific References
              </h3>
              <div className="space-y-4">
                {health.claims.map((claim: any) => (
                  <div key={claim.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">"{claim.claim}"</p>
                    {claim.sources && claim.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {claim.sources.map((src: any) => (
                          <a
                            key={src.id}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-sky-500/10 border border-sky-500/30 px-3 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20 hover:text-white transition-colors"
                          >
                            <span>{src.name}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Disclaimer */}
          <p className="text-[11px] text-slate-500 italic text-center max-w-2xl mx-auto">
            {health.disclaimer}
          </p>
        </section>
      )}

      {/* YouTube Recommended Videos Grid */}
      {analysis.youtubeVideos && analysis.youtubeVideos.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-2xl font-black text-white heading-font flex items-center gap-2">
              <Youtube className="h-6 w-6 text-rose-500" />
              Recipe & Nutritional YouTube Videos
            </h2>
            <p className="text-xs text-slate-400">Curated cooking techniques and macro breakdowns</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {analysis.youtubeVideos.map((video: any) => (
              <a
                key={video.videoId}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-interactive rounded-3xl overflow-hidden group block"
              >
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/40 group-hover:scale-110 transition-transform">
                      <Youtube className="h-6 w-6 fill-current" />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white heading-font line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">{video.channelTitle}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
