import React, { useState, useEffect } from 'react';
import {
  Layers,
  Thermometer,
  Droplets,
  CloudRain,
  TrendingUp,
  Activity,
  GitCompare,
  LayoutList,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import GlassCard from '../components/Common/GlassCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { weatherApi } from '../api/weatherApi';

export default function CombinedAnalytics({ location, startDate, endDate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('stacked'); // 'stacked' (clean separate panels) or 'overlay'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await weatherApi.getCombinedAnalytics({
          location: location !== 'all' ? location : '',
          start_date: startDate,
          end_date: endDate,
        });
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location, startDate, endDate]);

  if (isLoading) {
    return <LoadingSpinner text="Synchronizing timeline analytics..." />;
  }

  const timeline = data?.timeline || [];
  const correlation = data?.correlation || {};

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switcher */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Multi-Variable Meteorological Analysis
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Compare Temperature, Humidity, and Rainfall over the same timeline without messy clumping or overlapping scales.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'stacked'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stacked Panels (Clear & Un-merged)
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'overlay'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Combined Overlay
            </button>
          </div>
        </div>
      </GlassCard>

      {/* VIEW MODE 1: CLEAN STACKED PANELS (NOT MERGED) */}
      {viewMode === 'stacked' ? (
        <div className="space-y-4">
          {/* Panel 1: Temperature */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Temperature Timeline (°C)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-rose-300 font-semibold">Scale: Celsius</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pTempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} unit="°" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 10 }}
                    formatter={(val) => [`${val} °C`, 'Temperature']}
                  />
                  <Area type="monotone" dataKey="temperature" name="Temperature" stroke="#F43F5E" strokeWidth={2} fill="url(#pTempGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Panel 2: Humidity */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Relative Humidity Timeline (%)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-semibold">Scale: 0 - 100% RH</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pHumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10 }}
                    formatter={(val) => [`${val}%`, 'Humidity']}
                  />
                  <Area type="monotone" dataKey="humidity" name="Humidity" stroke="#10B981" strokeWidth={2} fill="url(#pHumGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Panel 3: Rainfall */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  3. Precipitation Volume Timeline (mm)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-sky-300 font-semibold">Scale: Millimeters (mm)</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pRainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} unit="mm" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 10 }}
                    formatter={(val) => [`${val} mm`, 'Rainfall']}
                  />
                  <Bar dataKey="rainfall" name="Rainfall" fill="url(#pRainGrad)" radius={[3, 3, 0, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* VIEW MODE 2: OVERLAY */
        <GlassCard className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                
                <YAxis yAxisId="tempAxis" stroke="#F43F5E" tick={{ fontSize: 11 }} unit="°" domain={['auto', 'auto']} />
                <YAxis yAxisId="humAxis" orientation="right" stroke="#10B981" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />

                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                />
                <Legend verticalAlign="top" height={36} />

                <Bar yAxisId="humAxis" dataKey="rainfall" name="Rainfall (mm)" fill="#38BDF8" maxBarSize={12} opacity={0.7} />
                <Line yAxisId="tempAxis" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#F43F5E" strokeWidth={2.5} dot={false} />
                <Line yAxisId="humAxis" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10B981" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Pearson Correlation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Temp vs Humidity</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {correlation.temp_humidity !== undefined ? correlation.temp_humidity : '--'}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${Math.min(100, Math.abs((correlation.temp_humidity || 0) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Inverse correlation: daytime warming lowers relative moisture capacity.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Humidity vs Rainfall</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {correlation.humidity_rainfall !== undefined ? correlation.humidity_rainfall : '--'}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, Math.abs((correlation.humidity_rainfall || 0) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Positive correlation: precipitation events bring elevated humidity levels.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Temp vs Rainfall</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {correlation.temp_rainfall !== undefined ? correlation.temp_rainfall : '--'}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(100, Math.abs((correlation.temp_rainfall || 0) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Cooling feedback: sustained rainfall dampens surface temperatures.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
