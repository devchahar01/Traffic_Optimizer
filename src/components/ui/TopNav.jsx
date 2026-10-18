import React from 'react';
import { 
  Radio, RotateCcw, BarChart3, Network, 
  ShieldAlert, Flame, Sparkles, Navigation
} from 'lucide-react';

export default function TopNav({
  isMstMode,
  onToggleMstMode,
  onOpenComparator,
  onResetNetwork,
  onSurgeTraffic,
  blockedCount
}) {
  return (
    <header className="h-14 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-5 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Title & Tactical Status */}
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <Navigation className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-sm tracking-wider text-zinc-100 flex items-center gap-2">
              <span>NEXUS-3D</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                TRAFFIC COMMAND
              </span>
            </h1>
          </div>
          <p className="text-[10px] font-mono text-zinc-400">
            Intelligent Route Optimization & Dynamic Graph Engine
          </p>
        </div>
      </div>

      {/* Live Status Readout */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ENGINE: 60 FPS</span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>20 TACTICAL HUBS</span>
        </div>

        {blockedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{blockedCount} ROAD{blockedCount > 1 ? 'S' : ''} BLOCKED</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Kruskal MST Mode */}
        <button
          onClick={onToggleMstMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
            isMstMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-lg shadow-amber-500/10'
              : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
          title="Calculate Minimum Spanning Tree using Kruskal & DSU"
        >
          <Network className="w-3.5 h-3.5 text-amber-400" />
          <span>{isMstMode ? 'Exit MST' : 'Kruskal MST'}</span>
        </button>

        {/* Algorithm Benchmark Comparator */}
        <button
          onClick={onOpenComparator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 transition-all"
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Compare Algorithms</span>
        </button>

        {/* Surge Traffic Multiplier */}
        <button
          onClick={onSurgeTraffic}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
          title="Randomly inject heavy traffic multipliers into corridors"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Surge Traffic</span>
        </button>

        {/* Reset Network State */}
        <button
          onClick={onResetNetwork}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          title="Reset traffic multipliers and unblock all roads"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
