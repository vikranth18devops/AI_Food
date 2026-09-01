import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFoodImage } from '../api/client';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, Loader2, Salad, CheckCircle2, FileUp } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setError('Please upload a valid image file (JPEG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds the 10MB limit.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setError(null);
      const res = await uploadFoodImage(selectedFile);
      if (res?.data?.analysisId) {
        navigate(`/analysis/${res.data.analysisId}`);
      } else {
        throw new Error('Analysis request failed to return an analysis ID.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process food image upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12 pt-4">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
          <Salad className="h-4 w-4" /> AI Vision Processing Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white heading-font">
          Analyze Food <span className="gradient-text-emerald">Photo</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Upload any culinary photo to trigger instant food recognition, nutrition scaling, health insights, and recipe recommendations.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-3 backdrop-blur-xl">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden p-6 text-center ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-500/40 bg-slate-900/60'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/40'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
          />

          {previewUrl ? (
            <div className="space-y-4 z-10 w-full flex flex-col items-center">
              <div className="relative h-56 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center p-3">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Ready to analyze ({selectedFile?.name})
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">Click or drag a new image to replace</p>
            </div>
          ) : (
            <div className="space-y-4 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-glow">
                <FileUp className="h-8 w-8 stroke-[2]" />
              </div>
              <div>
                <p className="text-base font-bold text-white heading-font">
                  Drag and drop your food photo here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports <span className="text-slate-300 font-semibold">JPEG, PNG, WEBP</span> up to 10MB
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-700 bg-slate-850 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        {selectedFile && (
          <button
            onClick={handleUploadSubmit}
            disabled={isUploading}
            className="w-full gradient-btn-emerald rounded-2xl py-4 text-base font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Initiating Microservice Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Start Intelligent Food Analysis</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
