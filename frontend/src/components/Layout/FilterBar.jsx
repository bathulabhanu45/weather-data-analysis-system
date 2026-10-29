import React from 'react';
import { MapPin, Calendar, Filter, RotateCcw, Leaf } from 'lucide-react';

export default function FilterBar({
  locations = [],
  selectedLocation,
  onLocationChange,
  startDate,
  endDate,
  onDateChange,
  onResetFilters,
  totalRecords = 0
}) {
  const handlePreset = (days) => {
    if (!days) {
      onResetFilters();
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const hasActiveFilters = (selectedLocation && selectedLocation !== 'all') || startDate || endDate;

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border border-emerald-500/20">
      {/* Left Filters Group */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location Dropdown */}
        <div className="flex items-center gap-2 bg-[#081810] px-3 py-2 rounded-xl border border-emerald-500/25 flex-1 sm:flex-none min-w-[210px]">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <select
            id="filter-location-select"
            value={selectedLocation || 'all'}
            onChange={(e) => onLocationChange(e.target.value)}
            aria-label="Filter by Location"
            className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-[#081810] text-white">
              All Weather Stations {locations.length ? `(${locations.length})` : ''}
            </option>
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-[#081810] text-white">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div className="flex items-center gap-2 bg-[#081810] px-3 py-2 rounded-xl border border-emerald-500/25">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400">From:</span>
          <input
            id="filter-start-date"
            type="date"
            value={startDate || ''}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            aria-label="Start Date"
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
          />
        </div>

        {/* Date Range End */}
        <div className="flex items-center gap-2 bg-[#081810] px-3 py-2 rounded-xl border border-emerald-500/25">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400">To:</span>
          <input
            id="filter-end-date"
            type="date"
            value={endDate || ''}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            aria-label="End Date"
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
          />
        </div>

        {/* Quick Presets */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1">
          <button
            onClick={() => handlePreset(30)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20 transition-all"
          >
            30D
          </button>
          <button
            onClick={() => handlePreset(90)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20 transition-all"
          >
            90D
          </button>
          <button
            onClick={() => handlePreset(null)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20 transition-all"
          >
            All
          </button>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            id="filter-reset-btn"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right Stats Summary */}
      <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-gray-400 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
        <div className="flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Scope:</span>
          <span className="font-semibold text-white">
            {selectedLocation && selectedLocation !== 'all' ? selectedLocation : 'All Stations'}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
          {totalRecords.toLocaleString()} Observations
        </span>
      </div>
    </div>
  );
}
