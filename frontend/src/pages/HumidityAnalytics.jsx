import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  MapPin
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

export default function HumidityAnalytics({ location, startDate, endDate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await weatherApi.getHumidityAnalytics({
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
    return <LoadingSpinner text="Analyzing atmospheric moisture..." />;
  }

  const stats = data?.stats || {};
  const dailyTrend = data?.daily_trend || [];
  const monthlyAvg = data?.monthly_avg || [];
  const locComparison = data?.location_comparison || [];

  return (
    <div className="space-y-6">
      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Average Humidity</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.mean !== undefined ? `${stats.mean}%` : '--'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Mean Relative Humidity (RH)
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between text-xs text-teal-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Peak Saturation</span>
            <ArrowUpRight className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.max !== undefined ? `${stats.max}%` : '--'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Maximum recorded humidity
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span className="uppercase font-semibold tracking-wider">Lowest Recorded</span>
            <ArrowDownRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.min !== undefined ? `${stats.min}%` : '--'}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Lowest moisture point
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase font-semibold tracking-wider">Valid Records</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {stats.count?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Sensor readings evaluated
          </div>
        </GlassCard>
      </div>

      {/* Daily Humidity Trend Line Chart (Clean, clear, standard lines) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Daily Relative Humidity Trend (%)
            </h3>
            <p className="text-xs text-gray-400">
              Daily variations in relative humidity across the observation timeline.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">Scale: 0 - 100% RH</span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10 }}
                formatter={(val, name) => [`${val}%`, name]}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="max_humidity" name="Daily Max" stroke="#34D399" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
              <Line type="monotone" dataKey="avg_humidity" name="Average Humidity" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="min_humidity" name="Daily Min" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Grid: Monthly Average & Location Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Average Humidity Bar Chart */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Monthly Average Humidity (%)
          </h4>
          <p className="text-xs text-gray-400 mb-6">Seasonal humidity profiles aggregated by month.</p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                  formatter={(val) => [`${val}%`, 'Avg Humidity']}
                />
                <Bar dataKey="avg_humidity" name="Avg Humidity" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Location Comparison */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-400" />
            Station Moisture Comparison (%)
          </h4>
          <p className="text-xs text-gray-400 mb-6">Comparing moisture levels across geographical stations.</p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locComparison} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="location" stroke="#64748B" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10 }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="avg_humidity" name="Mean Humidity" fill="#10B981" radius={[0, 4, 4, 0]} maxBarSize={14} />
                <Bar dataKey="max_humidity" name="Peak Humidity" fill="#06B6D4" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
