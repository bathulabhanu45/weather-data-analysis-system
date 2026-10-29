import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Flame,
  Snowflake,
  TrendingUp,
  BarChart3,
  MapPin,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function TemperatureAnalytics({ location, startDate, endDate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await weatherApi.getTemperatureAnalytics({
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
    return <LoadingSpinner text="Computing temperature trends..." />;
  }

  const stats = data?.stats || {};
  const extremes = data?.extremes || {};
  const dailyTrend = data?.daily_trend || [];
  const monthlyAvg = data?.monthly_avg || [];
  const locComparison = data?.location_comparison || [];
  const histogram = data?.histogram || [];

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Average Temperature</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.mean !== undefined ? `${stats.mean}°C` : '--'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Median: {stats.median}°C • Std Dev: ±{stats.std}°C
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Hottest Recorded</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {extremes.hottest?.temperature !== undefined ? `${extremes.hottest.temperature}°C` : '--'}
          </div>
          <div className="text-[11px] text-gray-300 mt-2 truncate">
            {extremes.hottest?.location} ({extremes.hottest?.date})
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-sky-400">
          <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Coldest Recorded</span>
            <Snowflake className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {extremes.coldest?.temperature !== undefined ? `${extremes.coldest.temperature}°C` : '--'}
          </div>
          <div className="text-[11px] text-gray-300 mt-2 truncate">
            {extremes.coldest?.location} ({extremes.coldest?.date})
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Valid Observations</span>
            <Thermometer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.count?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Calibrated temperature samples
          </div>
        </GlassCard>
      </div>

      {/* 1. Daily Temperature Trend Line Chart (Clean, clear, standard lines) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Daily Temperature Trend (°C)
            </h3>
            <p className="text-xs text-gray-400">
              Clear daily trajectory comparing daily average, maximum heat, and night minimum.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">Scale: Celsius</span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="°" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 10 }}
                formatter={(val, name) => [`${val} °C`, name]}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="max_temp" name="Daily Max" stroke="#F43F5E" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="avg_temp" name="Average Temp" stroke="#38BDF8" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="min_temp" name="Daily Min" stroke="#818CF8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Grid: Monthly Average & Location Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Average Temperature Bar Chart */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Monthly Average Temperature (°C)
          </h4>
          <p className="text-xs text-gray-400 mb-6">Thermal progression aggregated across calendar months.</p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="°" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                  formatter={(val) => [`${val} °C`, 'Avg Temp']}
                />
                <Bar dataKey="avg_temp" name="Avg Temperature" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Location Comparison */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Location Temperature Comparison (°C)
          </h4>
          <p className="text-xs text-gray-400 mb-6">Comparing stations by mean and peak recorded temperatures.</p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locComparison} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} unit="°" />
                <YAxis type="category" dataKey="location" stroke="#64748B" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                  formatter={(val, name) => [`${val} °C`, name]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="avg_temp" name="Mean Temp" fill="#38BDF8" radius={[0, 4, 4, 0]} maxBarSize={14} />
                <Bar dataKey="max_temp" name="Peak Temp" fill="#F43F5E" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Temperature Distribution Histogram */}
      <GlassCard className="p-6">
        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          Temperature Distribution Histogram
        </h4>
        <p className="text-xs text-gray-400 mb-6">Frequency distribution across temperature intervals.</p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="range" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                formatter={(val) => [`${val} observations`, 'Count']}
              />
              <Bar dataKey="count" name="Observations" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
