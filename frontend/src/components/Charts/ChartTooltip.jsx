import React from 'react';

export default function ChartTooltip({ active, payload, label, unitMap = {} }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#0B0E17]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl text-xs min-w-[200px]">
      <div className="font-bold text-white mb-2.5 pb-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-gray-300 font-mono text-[11px]">{label}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-medium">
          Observation
        </span>
      </div>

      <div className="space-y-2">
        {payload.map((entry, index) => {
          const unit = unitMap[entry.name] || unitMap[entry.dataKey] || '';
          return (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                />
                <span className="text-gray-300 font-medium text-[11px]">
                  {entry.name || entry.dataKey}
                </span>
              </div>
              <span className="font-mono font-bold text-white text-xs">
                {entry.value !== null && entry.value !== undefined ? `${entry.value} ${unit}` : '--'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
