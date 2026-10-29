import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  SunMedium,
  Umbrella,
  TrendingUp,
  BarChart3,
  MapPin,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import GlassCard from '../components/Common/GlassCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { weatherApi } from '../api/weatherApi';

export default function RainfallAnalytics({ location, startDate, endDate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await weatherApi.getRainfallAnalytics({
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
    return <LoadingSpinner text="Analyzing precipitation totals..." />;
  }

  const stats = data?.stats || {};
  const extremes = data?.extremes || {};
  const dailyTrend = data?.daily_trend || [];
  const monthlyTotals = data?.monthly_totals || [];
  const locComparison = data?.location_comparison || [];

  return (
    <div className="space-y-6">
      {/* Rainfall Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Total Rainfall</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.total_rainfall !== undefined ? `${stats.total_rainfall}` : '--'}
            <span className="text-sm font-semibold text-sky-400 ml-1">mm</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Cumulative precipitation volume
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-indigo-400">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Average Rate</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.avg_rainfall !== undefined ? `${stats.avg_rainfall}` : '--'}
            <span className="text-sm font-semibold text-indigo-400 ml-1">mm</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Per observation average
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Single-Day High</span>
            <Umbrella className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {extremes.highest?.rainfall !== undefined ? `${extremes.highest.rainfall}` : '--'}
            <span className="text-sm font-semibold text-rose-400 ml-1">mm</span>
          </div>
          <div className="text-[11px] text-gray-300 mt-2 truncate font-medium">
            {extremes.highest?.location} ({extremes.highest?.date})
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Dry Days (0.0mm)</span>
            <SunMedium className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.zero_rainfall_count?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Verified dry observations
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Precipitation Ratio</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.rainy_day_percentage !== undefined ? `${stats.rainy_day_percentage}%` : '--'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            {stats.rainy_days_count} rainy observation days
          </div>
        </GlassCard>
      </div>

      {/* Monthly Rainfall Totals Bar Chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Monthly Precipitation Volumes (mm)
            </h3>
            <p className="text-xs text-gray-400">
              Total monthly rainfall accumulation with peak daily rain markers.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">Scale: mm</span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTotals} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="mm" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 10 }}
                formatter={(val, name) => [`${val} mm`, name]}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="total_rainfall" name="Total Rainfall (mm)" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="max_rainfall" name="Peak Single Day (mm)" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Daily Rainfall Timeline Bar Chart (Clean individual bars) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Daily Precipitation Events (mm)
            </h4>
            <p className="text-xs text-gray-400">
              Daily rainfall amounts recorded across the timeline.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">Scale: Millimeters</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="mm" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 10 }}
                formatter={(val) => [`${val} mm`, 'Rainfall']}
              />
              <Bar dataKey="rainfall" name="Rainfall" fill="#38BDF8" radius={[3, 3, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Location-wise Comparison */}
      <GlassCard className="p-6">
        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Location Precipitation Comparison (mm)
        </h4>
        <p className="text-xs text-gray-400 mb-6">Comparing total rainfall and wet day occurrences across stations.</p>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locComparison} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} unit="mm" />
              <YAxis type="category" dataKey="location" stroke="#64748B" tick={{ fontSize: 11 }} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                formatter={(val, name) => [name.includes('Days') ? `${val} days` : `${val} mm`, name]}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="total_rainfall" name="Total Rainfall (mm)" fill="#0284C7" radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="rainy_days" name="Rainy Days Count" fill="#10B981" radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
