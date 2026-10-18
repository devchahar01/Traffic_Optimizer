import React from 'react';
import { 
  Clock, Zap, Activity, Compass, 
  Milestone, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function MetricsBar({
  result,
  totalNodesCount,
  algorithmName,
  sourceId,
  destinationId
}) {
  if (!result) return null;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto select-none">
      <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
              Telemetry Telemetrics
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {algorithmName}
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Execution Time */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block mb-0.5">Execution</span>
            <span className="font-mono text-xs font-bold text-cyan-400 flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              {result.executionTimeMs} ms
            </span>
          </div>

          {/* Nodes Explored */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block mb-0.5">Explored</span>
            <span className="font-mono text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
              <Activity className="w-3 h-3 text-amber-400" />
              {result.nodesExplored} / {totalNodesCount}
            </span>
          </div>

          {/* Path Travel Cost */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block mb-0.5">Travel Cost</span>
            <span className={`font-mono text-xs font-bold flex items-center justify-center gap-0.5 ${
              result.cost === Infinity ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              <Clock className="w-3 h-3" />
              {result.cost === Infinity ? 'BLOCKED' : `${result.cost}m`}
            </span>
          </div>
        </div>

        {/* Secondary Details */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
          <span>Physical Distance: <strong className="text-zinc-200">{result.pathDistance || 0} km</strong></span>
          <span>Hops: <strong className="text-zinc-200">{result.currentPath?.length > 1 ? result.currentPath.length - 1 : 0}</strong></span>
        </div>

        {/* Turn-by-Turn Waypoints */}
        {result.currentPath && result.currentPath.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-zinc-300 pb-1">
              {result.currentPath.map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    idx === result.currentPath.length - 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                    'bg-zinc-900 text-zinc-300'
                  }`}>
                    {nodeId}
                  </span>
                  {idx < result.currentPath.length - 1 && (
                    <span className="text-zinc-600">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
