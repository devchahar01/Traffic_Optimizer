import React from 'react';
import { Clock, Zap, Activity, Milestone, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MetricsPanel({
  result,
  totalNodesCount,
  algorithmName,
  sourceId,
  destinationId
}) {
  if (!result) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] w-88 max-w-[90vw] bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl p-4 select-none backdrop-blur-sm text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div>
          <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-wider">
            Empirical Telemetry
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {algorithmName}
          </span>
        </div>
        {result.success ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Optimal
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            <AlertTriangle className="w-3 h-3" />
            No Path
          </span>
        )}
      </div>

      {/* Metrics Table */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Execution Time</span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            {result.executionTimeMs} ms
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Nodes Explored</span>
          <span className="font-mono text-sm font-bold text-amber-400">
            {result.nodesExplored} / {totalNodesCount} ({Math.round((result.nodesExplored / totalNodesCount) * 100)}%)
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Travel Time (Cost)</span>
          <span className="font-mono text-sm font-bold text-slate-100">
            {result.travelTimeMinutes === Infinity ? '∞' : `${result.travelTimeMinutes} min`}
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Physical Distance</span>
          <span className="font-mono text-sm font-bold text-slate-100">
            {result.distanceKm || 0} km ({result.hops || 0} hops)
          </span>
        </div>
      </div>

      {/* Turn-by-Turn Waypoints */}
      {result.path && result.path.length > 0 && (
        <div className="border-t border-slate-800 pt-2.5">
          <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
            Turn-by-Turn Route ({result.path.length} Waypoints)
          </span>
          <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-slate-300 pb-1">
            {result.path.map((nodeId, idx) => (
              <React.Fragment key={nodeId}>
                <span className={`px-1.5 py-0.5 rounded font-semibold ${
                  idx === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  idx === result.path.length - 1 ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {nodeId}
                </span>
                {idx < result.path.length - 1 && (
                  <span className="text-slate-600">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
