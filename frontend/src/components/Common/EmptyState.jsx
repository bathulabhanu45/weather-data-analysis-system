import React from 'react';
import { CloudRain, UploadCloud, Database, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

export default function EmptyState({ onUploadClick, onLoadSample, isLoadingSample }) {
  return (
    <GlassCard className="py-16 px-6 text-center max-w-2xl mx-auto my-8 border-dashed border-cyan-500/30">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-glow-cyan">
          <CloudRain className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-midnight-950 font-bold text-xs shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">
        No Weather Data Available
      </h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Your weather database is currently empty. Get started immediately by loading our comprehensive multi-location historical dataset, or upload your own CSV records.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          id="btn-load-sample"
          onClick={onLoadSample}
          disabled={isLoadingSample}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-midnight-950 font-semibold shadow-glow-cyan transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isLoadingSample ? (
            <div className="w-5 h-5 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Database className="w-4 h-4 text-midnight-950" />
          )}
          <span>{isLoadingSample ? 'Loading Dataset...' : 'Load Sample Weather Data'}</span>
        </button>

        <button
          id="btn-goto-upload"
          onClick={onUploadClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all transform hover:-translate-y-0.5"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload CSV File</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Supports columns: <code className="text-cyan-300 font-mono">observation_date, location, temperature, humidity, rainfall</code>
      </p>
    </GlassCard>
  );
}
