import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  TableProperties,
  Thermometer,
  Droplets,
  CloudRain,
  Layers,
  FileText,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Leaf,
  Sprout
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'import', label: 'Import Weather Data', icon: UploadCloud, badge: 'CSV' },
  { id: 'records', label: 'Weather Records', icon: TableProperties },
  { id: 'temperature', label: 'Temperature Analytics', icon: Thermometer },
  { id: 'humidity', label: 'Humidity Analytics', icon: Droplets },
  { id: 'rainfall', label: 'Rainfall Analytics', icon: CloudRain },
  { id: 'combined', label: 'Combined Weather', icon: Layers },
  { id: 'reports', label: 'Monthly Reports', icon: FileText },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  const { theme } = useTheme();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#050D09]/95 lg:bg-[#050D09]/90 backdrop-blur-2xl border-r border-emerald-500/20 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-emerald-500/15">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <Leaf className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-200 to-lime-300 bg-clip-text text-transparent">
                  AETHERIA
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 -mt-0.5 flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-lime-400" />
                  Eco Weather Intel
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">
              Analytics Suite
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/25 via-green-600/15 to-transparent text-white border border-emerald-500/35 shadow-lg shadow-emerald-950/40'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-emerald-950/30'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-lime-400 rounded-r-full shadow-md shadow-emerald-500/50" />
                )}
                <Icon
                  className={`w-5 h-5 min-w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-emerald-300'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Theme & System Status Footnote */}
        {!isCollapsed && (
          <div className="p-4 mx-3 mb-4 rounded-2xl bg-[#091710] border border-emerald-500/20 text-xs text-gray-400">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Theme Active
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                {theme.name}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              Botanical green climate intelligence & pandas analysis engine.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
