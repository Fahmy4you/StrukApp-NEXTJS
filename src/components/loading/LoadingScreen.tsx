import React from 'react';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export default function LoadingScreenSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-48 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="hidden md:block">
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      </div>

      {/* Welcome Message Skeleton */}
      <div className="mb-10">
        <Skeleton className="w-3/4 md:w-1/3 h-10 mb-3" />
        <Skeleton className="w-1/2 md:w-1/4 h-5" />
      </div>

      {/* Stats Grid Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex justify-between items-start"
          >
            <div>
              <Skeleton className="w-20 h-4 mb-4" />
              <Skeleton className="w-16 h-8" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Action Cards Skeleton (2 Large Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="relative overflow-hidden p-8 h-48 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl flex items-center gap-6"
          >
            {/* Glassmorphism accent */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
            
            <Skeleton className="shrink-0 w-16 h-16 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="w-40 h-6 mb-3" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-2/3 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay (Optional subtle text) */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Menyiapkan Dashboard...</span>
      </div>
    </div>
  );
}