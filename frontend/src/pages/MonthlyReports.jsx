import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  MapPin,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Umbrella,
  Thermometer,
  Droplets,
  CloudRain,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import GlassCard from '../components/Common/GlassCard';
import LoadingSpinner, { Badge } from '../components/Common/LoadingSpinner';
import ChartTooltip from '../components/Charts/ChartTooltip';
import { weatherApi } from '../api/weatherApi';

export default function MonthlyReports({ locations = [] }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  const years = [2024, 2025, 2026];

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await weatherApi.getMonthlyReport({
        year: selectedYear,
        month: selectedMonth,
        location: selectedLocation !== 'all' ? selectedLocation : '',
      });
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth, selectedLocation]);

  const handlePrint = () => {
    window.print();
  };

  const exportCsvUrl = weatherApi.getReportExportUrl({
    year: selectedYear,
    month: selectedMonth,
    location: selectedLocation !== 'all' ? selectedLocation : '',
  });

  return (
    <div className="space-y-6">
      {/* Report Controls Ribbon */}
      <GlassCard className="p-5 print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-[#0B0E18] px-3 py-2 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Select Year"
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-obsidian-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-[#0B0E18] px-3 py-2 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                aria-label="Select Month"
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value} className="bg-obsidian-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2 bg-[#0B0E18] px-3 py-2 rounded-xl border border-white/10">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Station:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Select Location for Report"
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-obsidian-900 text-white">
                  All Weather Stations
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-obsidian-900 text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-violet-400" />
              <span>Print / PDF Dossier</span>
            </button>

            {report?.has_data && (
              <a
                href={exportCsvUrl}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-violet-400" />
                <span>Export Report CSV</span>
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Report Container */}
      {isLoading ? (
        <LoadingSpinner text="Generating validated monthly report..." />
      ) : !report?.has_data ? (
        <GlassCard className="py-16 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Observations for this Period</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {report?.message || 'No weather records exist for the selected year and month.'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6 print:space-y-4 print:text-black">
          {/* Official Dossier Header */}
          <GlassCard className="p-6 border-violet-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="text-xs uppercase font-bold text-violet-400 tracking-wider">
                  Official Meteorological Summary
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  Monthly Climate Dossier: {report.month_name}
                </h2>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Station Scope: <strong className="text-white">{report.location}</strong></span>
                </div>
              </div>

              {/* Data Completeness Meter */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">Data Completeness:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${report.completeness_percentage >= 90 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                    {report.completeness_percentage}%
                  </span>
                </div>
                <div className="w-36 h-2 bg-[#0B0E18] rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, report.completeness_percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {report.days_observed} of {report.days_in_month} calendar days recorded
                </span>
              </div>
            </div>

            {/* Incomplete Month Warning Banner */}
            {report.completeness_percentage < 85 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 min-w-4" />
                <span>
                  <strong>Partial Observation Notice:</strong> This month contains records for {report.completeness_percentage}% of calendar days. Metrics reflect available samples and must not be described as complete monthly weather conditions.
                </span>
              </div>
            )}
          </GlassCard>

          {/* Metric KPI Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Temperature Metrics */}
            <GlassCard className="p-4 border-l-4 border-l-rose-400">
              <span className="text-[11px] uppercase font-bold text-gray-400">Mean Temperature</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {report.temperature?.avg !== null ? `${report.temperature.avg}°C` : '--'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Min: {report.temperature?.min}°C • Max: {report.temperature?.max}°C
              </div>
            </GlassCard>

            {/* Humidity Metric */}
            <GlassCard className="p-4 border-l-4 border-l-emerald-400">
              <span className="text-[11px] uppercase font-bold text-gray-400">Average Humidity</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {report.humidity?.avg !== null ? `${report.humidity.avg}%` : '--'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Range: {report.humidity?.min}% - {report.humidity?.max}%
              </div>
            </GlassCard>

            {/* Total Rainfall */}
            <GlassCard className="p-4 border-l-4 border-l-violet-400">
              <span className="text-[11px] uppercase font-bold text-gray-400">Total Precipitation</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {report.rainfall?.total} <span className="text-sm font-semibold text-violet-400">mm</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Avg: {report.rainfall?.avg_per_obs} mm/obs
              </div>
            </GlassCard>

            {/* Rainiest Day */}
            <GlassCard className="p-4 border-l-4 border-l-amber-400">
              <span className="text-[11px] uppercase font-bold text-gray-400">Rainiest Day Recorded</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {report.rainfall?.rainiest_day ? `${report.rainfall.rainiest_day.rainfall} mm` : '0 mm'}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 truncate">
                {report.rainfall?.rainiest_day ? `${report.rainfall.rainiest_day.date}` : 'No rain recorded'}
              </div>
            </GlassCard>
          </div>

          {/* Daily Trend Chart within Month */}
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Daily Thermal & Rainfall Timeline ({report.month_name})
            </h4>
            <p className="text-xs text-gray-400 mb-6">Daily variations recorded throughout the monthly cycle.</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={report.daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="temp" stroke="#F43F5E" tick={{ fontSize: 11 }} unit="°" />
                  <YAxis yAxisId="rain" orientation="right" stroke="#8B5CF6" tick={{ fontSize: 11 }} unit="mm" />
                  <Tooltip
                    content={
                      <ChartTooltip
                        unitMap={{
                          'Temperature': '°C',
                          'Rainfall': 'mm',
                        }}
                      />
                    }
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar yAxisId="rain" dataKey="rainfall" name="Rainfall" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature" stroke="#F43F5E" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FFFFFF', stroke: '#F43F5E', strokeWidth: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Year Comparison Bar Chart */}
          {report.monthly_comparison?.length > 0 && (
            <GlassCard className="p-6">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Annual Precipitation Progression ({selectedYear})
              </h4>
              <p className="text-xs text-gray-400 mb-6">Comparing total precipitation across months for this annual cycle.</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.monthly_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="yearRainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} unit="mm" />
                    <Tooltip
                      content={
                        <ChartTooltip
                          unitMap={{
                            'Rainfall': 'mm',
                          }}
                        />
                      }
                    />
                    <Bar dataKey="rainfall" name="Rainfall" fill="url(#yearRainGrad)" radius={[8, 8, 2, 2]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
