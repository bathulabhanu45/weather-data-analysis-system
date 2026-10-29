import React, { useState } from 'react';
import {
  Database,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  CloudRain,
  Calendar,
  Sparkles,
  TrendingUp,
  BarChart2,
  LayoutGrid,
  Leaf
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import KpiCard from '../components/Common/KpiCard';
import GlassCard from '../components/Common/GlassCard';
import EmptyState from '../components/Common/EmptyState';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Overview({
  overviewData,
  isLoading,
  onNavigateTab,
  onLoadSample,
  isSeeding
}) {
  const [activeView, setActiveView] = useState('grid'); // 'grid' (all 3 separate), 'temp', 'hum', 'rain'

  if (isLoading) {
    return <LoadingSpinner text="Computing botanical climate metrics..." size="lg" />;
  }

  const kpis = overviewData?.kpis || {};
  const hasData = kpis.total_observations > 0;

  if (!hasData) {
    return (
      <EmptyState
        onUploadClick={() => onNavigateTab('import')}
        onLoadSample={onLoadSample}
        isLoadingSample={isSeeding}
      />
    );
  }

  const dailyTrends = overviewData?.daily_trends || [];
  const recentRecords = overviewData?.recent_records || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          id="kpi-total-obs"
          title="Observations"
          value={kpis.total_observations?.toLocaleString()}
          unit="records"
          icon={Database}
          supportingText={`${kpis.locations_count || 1} Stations Active`}
          badgeText="Verified"
          badgeColor="primary"
        />

        <KpiCard
          id="kpi-avg-temp"
          title="Avg Temperature"
          value={kpis.avg_temperature}
          unit="°C"
          icon={Thermometer}
          supportingText="Mean ambient temp"
          badgeText="Normal"
          badgeColor="accent"
        />

        <KpiCard
          id="kpi-max-temp"
          title="Max Temperature"
          value={kpis.max_temperature}
          unit="°C"
          icon={ArrowUpRight}
          supportingText="Peak recorded heat"
          badgeText="High"
          badgeColor="accent"
        />

        <KpiCard
          id="kpi-min-temp"
          title="Min Temperature"
          value={kpis.min_temperature}
          unit="°C"
          icon={ArrowDownRight}
          supportingText="Lowest thermal point"
          badgeText="Low"
          badgeColor="primary"
        />

        <KpiCard
          id="kpi-avg-humidity"
          title="Avg Humidity"
          value={kpis.avg_humidity}
          unit="%"
          icon={Droplets}
          supportingText="Relative moisture"
          badgeText="RH"
          badgeColor="leaf"
        />

        <KpiCard
          id="kpi-total-rainfall"
          title="Total Rainfall"
          value={kpis.total_rainfall}
          unit="mm"
          icon={CloudRain}
          supportingText={`Avg: ${kpis.avg_rainfall || 0} mm/obs`}
          badgeText="Precipitation"
          badgeColor="cyan"
        />
      </div>

      {/* Chart View Switcher Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            Botanical Weather Analytics
          </h2>
          <p className="text-xs text-emerald-300/70">
            Dedicated individual charts for temperature, moisture, and rainfall in a clean, legible green theme.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
          <button
            onClick={() => setActiveView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'grid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Separate</span>
          </button>
          <button
            onClick={() => setActiveView('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'temp'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>
          <button
            onClick={() => setActiveView('hum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'hum'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </button>
          <button
            onClick={() => setActiveView('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'rain'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainfall</span>
          </button>
        </div>
      </div>

      {/* SEPARATE INDIVIDUAL CHARTS */}

      {/* 1. TEMPERATURE CHART (Sunlit Amber Gold Leaf) */}
      {(activeView === 'grid' || activeView === 'temp') && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Temperature Trend (°C)</h3>
                <p className="text-[11px] text-gray-400">Daily ambient thermal variation</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Avg: {kpis.avg_temperature}°C
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leafTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EAB308" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#EAB308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.08)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="°C" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(9, 21, 15, 0.96)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 10 }}
                  formatter={(val) => [`${val} °C`, 'Temperature']}
                />
                <Area
                  type="monotone"
                  dataKey="avg_temp"
                  name="Temperature"
                  stroke="#EAB308"
                  strokeWidth={2.5}
                  fill="url(#leafTempGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#EAB308', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* 2. HUMIDITY CHART (Fresh Dewdrop Leaf Green) */}
      {(activeView === 'grid' || activeView === 'hum') && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Relative Humidity Trend (%)</h3>
                <p className="text-[11px] text-gray-400">Atmospheric moisture and canopy saturation</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Avg: {kpis.avg_humidity}%
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leafHumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.08)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(9, 21, 15, 0.96)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10 }}
                  formatter={(val) => [`${val}%`, 'Humidity']}
                />
                <Area
                  type="monotone"
                  dataKey="avg_humidity"
                  name="Humidity"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#leafHumGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22C55E', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* 3. RAINFALL CHART (Pine Teal Bars) */}
      {(activeView === 'grid' || activeView === 'rain') && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Precipitation (mm)</h3>
                <p className="text-[11px] text-gray-400">Daily rainfall amounts with clear 0.0 mm dry day indicators</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
              Total: {kpis.total_rainfall} mm
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leafRainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.08)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(9, 21, 15, 0.96)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: 10 }}
                  formatter={(val) => [`${val} mm`, 'Rainfall']}
                />
                <Bar
                  dataKey="total_rainfall"
                  name="Rainfall"
                  fill="url(#leafRainGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Bottom Section: Recent Observations & Analytics Jump Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Observations Table Preview */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Latest Station Observations
            </h4>
            <button
              onClick={() => onNavigateTab('records')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Full Archive →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#081810] uppercase text-emerald-300/80 font-semibold border-b border-emerald-500/15">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Station</th>
                  <th className="p-3">Temp (°C)</th>
                  <th className="p-3">Humidity (%)</th>
                  <th className="p-3">Rainfall (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 text-gray-300">
                {recentRecords.map((r) => (
                  <tr key={r.record_id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3 font-mono text-gray-500">#{r.record_id}</td>
                    <td className="p-3 font-medium text-white">{r.date}</td>
                    <td className="p-3 text-emerald-300 font-semibold">{r.location}</td>
                    <td className="p-3 font-bold text-amber-400">
                      {r.temperature !== null ? `${r.temperature}°C` : <span className="text-gray-500">--</span>}
                    </td>
                    <td className="p-3 text-emerald-400 font-medium">
                      {r.humidity !== null ? `${r.humidity}%` : <span className="text-gray-500">--</span>}
                    </td>
                    <td className="p-3 text-teal-300 font-mono">
                      {r.rainfall !== null ? `${r.rainfall} mm` : <span className="text-gray-500">--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Analytics Shortcuts & Quick Tools */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Botanical Modules
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Explore specialized individual views for in-depth climate analysis.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('temperature')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/15 transition-all text-xs text-left text-gray-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-white">Temperature Analytics</div>
                    <div className="text-[11px] text-gray-400">Sunlit Warmth & Histograms</div>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-emerald-300">→</span>
              </button>

              <button
                onClick={() => onNavigateTab('humidity')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/15 transition-all text-xs text-left text-gray-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-white">Humidity Analytics</div>
                    <div className="text-[11px] text-gray-400">Moisture & Saturation Levels</div>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-emerald-300">→</span>
              </button>

              <button
                onClick={() => onNavigateTab('rainfall')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/15 transition-all text-xs text-left text-gray-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <CloudRain className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-white">Rainfall Analytics</div>
                    <div className="text-[11px] text-gray-400">Precipitation Accumulation</div>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-emerald-300">→</span>
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-500/15">
            <div className="text-[11px] text-gray-400 leading-tight">
              Timeline: <span className="font-semibold text-emerald-300">{kpis.date_range?.start || 'N/A'}</span> to <span className="font-semibold text-emerald-300">{kpis.date_range?.end || 'N/A'}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
