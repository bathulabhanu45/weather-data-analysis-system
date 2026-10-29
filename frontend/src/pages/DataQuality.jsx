import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Download,
  Activity,
  Layers,
  FileCheck,
  Calendar,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import GlassCard from '../components/Common/GlassCard';
import LoadingSpinner, { Badge } from '../components/Common/LoadingSpinner';
import ChartTooltip from '../components/Charts/ChartTooltip';
import { weatherApi } from '../api/weatherApi';

export default function DataQuality() {
  const [qualityData, setQualityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await weatherApi.getQualityDashboard();
        if (res.success) {
          setQualityData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Computing Data Quality Index & audit logs..." />;
  }

  const healthScore = qualityData?.health_score ?? 100;
  const issueCounts = qualityData?.issue_counts || {};
  const missingByField = qualityData?.missing_values_by_field || {};
  const recentLogs = qualityData?.recent_logs || [];
  const importHistory = qualityData?.import_history || [];

  const missingFieldsData = [
    { field: 'Temperature', count: missingByField.temperature || 0 },
    { field: 'Humidity', count: missingByField.humidity || 0 },
    { field: 'Rainfall', count: missingByField.rainfall || 0 },
    { field: 'Station', count: missingByField.location || 0 },
    { field: 'Date', count: missingByField.observation_date || 0 },
  ];

  const downloadQualityReport = () => {
    const headers = ['log_id', 'import_id', 'row_number', 'column_name', 'issue_type', 'raw_value', 'error_message'];
    const rows = recentLogs.map((log) => [
      log.log_id,
      log.import_id,
      log.row_number,
      `"${log.column_name || ''}"`,
      log.issue_type,
      `"${(log.raw_value || '').replace(/"/g, '""')}"`,
      `"${(log.error_message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_quality_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Health Index Card & Primary Quality KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quality Health Score Meter */}
        <GlassCard className="p-6 lg:col-span-1 flex flex-col justify-between items-center text-center border-violet-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Data Health Index
          </span>

          <div className="relative my-4">
            <div className="w-28 h-28 rounded-full border-4 border-violet-500/30 flex flex-col items-center justify-center shadow-lg shadow-violet-950/50">
              <span className="text-3xl font-extrabold text-white">{healthScore}%</span>
              <span className="text-[10px] text-violet-400 font-semibold uppercase">Integrity</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${healthScore >= 95 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
            {healthScore >= 95 ? 'Pristine Scientific Standard' : 'Acceptable Quality'}
          </span>
        </GlassCard>

        {/* 3 Overview Stat Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5 border-l-4 border-l-emerald-400">
            <span className="text-[11px] uppercase font-bold text-gray-400">Total Valid Records</span>
            <div className="text-3xl font-extrabold text-emerald-300 mt-1">
              {qualityData?.valid_records?.toLocaleString() || 0}
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              Active in <code className="text-violet-300 font-mono text-[11px]">weather_records</code>
            </span>
          </GlassCard>

          <GlassCard className="p-5 border-l-4 border-l-rose-500">
            <span className="text-[11px] uppercase font-bold text-gray-400">Total Rejected / Invalid</span>
            <div className="text-3xl font-extrabold text-rose-300 mt-1">
              {qualityData?.invalid_records?.toLocaleString() || 0}
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              Fatal physical or schema errors
            </span>
          </GlassCard>

          <GlassCard className="p-5 border-l-4 border-l-amber-400">
            <span className="text-[11px] uppercase font-bold text-gray-400">Duplicate Observations</span>
            <div className="text-3xl font-extrabold text-amber-300 mt-1">
              {qualityData?.duplicate_records?.toLocaleString() || 0}
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              Protected by unique constraint
            </span>
          </GlassCard>
        </div>
      </div>

      {/* Grid: Issue Type Breakdown & Missing Values */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Type Frequency */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Issue Taxonomy Breakdown
          </h4>
          <p className="text-xs text-gray-400 mb-6">Distribution of meteorological validation warnings and errors.</p>

          <div className="space-y-3">
            {[
              { label: 'Missing Measurement (NULL)', count: issueCounts.MISSING_VALUE || 0, badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
              { label: 'Out of Terrestrial Bounds', count: issueCounts.OUT_OF_RANGE || 0, badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
              { label: 'Negative Rainfall (< 0 mm)', count: issueCounts.NEGATIVE_RAINFALL || 0, badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
              { label: 'Invalid / Unparseable Date', count: issueCounts.INVALID_DATE || 0, badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
              { label: 'Duplicate Location & Date', count: issueCounts.DUPLICATE_ENTRY || 0, badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
              { label: 'Non-Numeric String Input', count: issueCounts.NON_NUMERIC || 0, badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                <span className="text-gray-300 font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{item.count}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.badgeClass}`}>
                    {item.count > 0 ? `${item.count} flagged` : 'Zero'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Missing Values by Field */}
        <GlassCard className="p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Missing Measurements by Sensor Parameter
          </h4>
          <p className="text-xs text-gray-400 mb-6">Preserved without artificial zero-padding to protect statistics.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingFieldsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="missingAuroraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="field" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={
                    <ChartTooltip
                      unitMap={{
                        'count': 'records',
                      }}
                    />
                  }
                />
                <Bar dataKey="count" name="Missing Count" fill="url(#missingAuroraGrad)" radius={[8, 8, 2, 2]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Validation Error Logs Table */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-violet-400" />
              Audit Trail: Logged Quality Issues ({recentLogs.length})
            </h4>
            <p className="text-xs text-gray-400">Stored in <code className="text-violet-300 font-mono text-[11px]">data_quality_logs</code> for complete accountability.</p>
          </div>

          {recentLogs.length > 0 && (
            <button
              onClick={downloadQualityReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Error Report</span>
            </button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No validation errors logged yet. All records in database are clean!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 uppercase text-gray-400 font-semibold border-b border-white/5 sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">Log ID</th>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Issue Type</th>
                  <th className="p-2.5">Error Message</th>
                  <th className="p-2.5">Raw Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {recentLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-mono text-gray-500">#{log.log_id}</td>
                    <td className="p-2.5 font-mono font-bold text-white">Row {log.row_number}</td>
                    <td className="p-2.5 text-violet-300 font-semibold">{log.column_name || 'general'}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.issue_type === 'NEGATIVE_RAINFALL' || log.issue_type === 'INVALID_DATE' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                        {log.issue_type}
                      </span>
                    </td>
                    <td className="p-2.5 max-w-sm truncate text-gray-200">{log.error_message}</td>
                    <td className="p-2.5 font-mono text-gray-400">{log.raw_value || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
