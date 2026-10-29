import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  Trash2,
  Sparkles,
  Server,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Cpu,
  Palette,
  Check
} from 'lucide-react';
import GlassCard from '../components/Common/GlassCard';
import { Badge } from '../components/Common/LoadingSpinner';
import { weatherApi } from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';

export default function Settings({ dbStatus, onLoadSample, isSeeding, onDataReset }) {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { theme, currentThemeId, setTheme, THEMES } = useTheme();

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete all weather records, import logs, and data quality logs? This action is irreversible.')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);
    setErrorMsg(null);

    try {
      const res = await weatherApi.clearAllData();
      if (res.success) {
        setMessage(res.message);
        if (onDataReset) onDataReset();
      } else {
        setErrorMsg(res.error || 'Failed to clear data.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.');
    } finally {
      setIsClearing(false);
    }
  };

  const isMysql = dbStatus?.engine === 'mysql';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Alert Messages */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Visual Theme & Color Palette Selection Card */}
      <GlassCard className="p-6 border-emerald-500/25">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interface Color Themes</h3>
              <p className="text-xs text-gray-400">Curated high-contrast color palettes for graphs and analytics cards.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {theme.name} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(THEMES).map((t) => {
            const isSelected = t.id === currentThemeId;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-600/15 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                    : 'border-white/10 bg-[#081810] hover:border-emerald-500/30 hover:bg-[#0E2419]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.secondary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.accent }} />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                </div>

                <div className="font-bold text-white text-xs mb-1">{t.name}</div>
                <div className="text-[10px] text-gray-400 leading-tight">{t.subtitle}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Database Connection Card */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isMysql ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Database Engine & Connection</h3>
              <p className="text-xs text-gray-400">Database configuration and live storage runtime.</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isMysql ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'}`}>
            {isMysql ? 'Production MySQL' : 'Embedded SQLite Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
          <div className="p-3.5 rounded-xl bg-[#090C16] border border-white/5">
            <span className="text-gray-400 block mb-1">Active Engine:</span>
            <span className="font-bold text-white uppercase text-sm">{dbStatus?.engine || 'Detecting'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090C16] border border-white/5">
            <span className="text-gray-400 block mb-1">Database Target:</span>
            <span className="font-bold text-violet-300 text-sm">{dbStatus?.database_name || 'weather_analysis'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090C16] border border-white/5">
            <span className="text-gray-400 block mb-1">Host / Path:</span>
            <span className="font-bold text-gray-200 text-sm truncate block">{dbStatus?.host || 'localhost:3306'}</span>
          </div>
        </div>

        {/* Database setup explanation */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-2">
          <div className="font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" />
            MySQL Configuration Instructions
          </div>
          <p className="leading-relaxed text-gray-400">
            The system automatically initializes tables in MySQL named <code className="text-violet-300 font-mono">weather_analysis</code>.
            To connect to a live MySQL instance, specify your credentials in your <code className="text-violet-300 font-mono">.env</code> file:
          </p>
          <pre className="p-3 rounded-lg bg-obsidian-950 font-mono text-[11px] text-violet-300 overflow-x-auto border border-white/5">
{`DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=weather_analysis`}
          </pre>
          <p className="text-[11px] text-gray-400">
            {dbStatus?.info_note}
          </p>
        </div>
      </GlassCard>

      {/* Dataset Management Card */}
      <GlassCard className="p-6">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          Dataset Seeding & Maintenance
        </h3>
        <p className="text-xs text-gray-400 mb-5">
          Populate realistic multi-location datasets or reset records for testing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Seed Sample Data */}
          <div className="p-4 rounded-xl bg-[#090C16] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Seed Historical Dataset
              </div>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Inserts 1,200+ realistic observations across Seattle, Miami, Denver, Phoenix, London, and Tokyo over 7 months.
              </p>
            </div>
            <button
              onClick={onLoadSample}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
            >
              {isSeeding ? (
                <div className="w-3.5 h-3.5 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isSeeding ? 'Seeding Dataset...' : 'Load Sample Weather Data'}</span>
            </button>
          </div>

          {/* Wipe All Data */}
          <div className="p-4 rounded-xl bg-[#090C16] border border-rose-500/20 flex flex-col justify-between">
            <div>
              <div className="font-bold text-rose-300 text-xs mb-1 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Clear All Database Records
              </div>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Clears all weather observations, dataset imports, and audit logs to reset back to an empty state.
              </p>
            </div>
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {isClearing ? (
                <div className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>{isClearing ? 'Clearing Records...' : 'Clear All Records'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Meteorological Standards */}
      <GlassCard className="p-6">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-violet-400" />
          Meteorological Units & Measurement Standards
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Strict international meteorological measurement compliance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-400 block">Temperature:</span>
            <span className="font-bold text-white">Celsius (°C)</span>
            <span className="text-[10px] text-gray-400 block mt-1">Limits: -90°C to 65°C</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-400 block">Relative Humidity:</span>
            <span className="font-bold text-white">Percentage (%)</span>
            <span className="text-[10px] text-gray-400 block mt-1">Range: 0% to 100% RH</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-400 block">Precipitation:</span>
            <span className="font-bold text-white">Millimeters (mm)</span>
            <span className="text-[10px] text-gray-400 block mt-1">0.0 mm = explicit dry day</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
