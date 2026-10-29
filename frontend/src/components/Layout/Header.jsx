import React, { useState } from 'react';
import { Menu, Database, Sparkles, RefreshCw, Palette, ChevronDown, Check, Leaf } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header({
  pageTitle,
  pageSubtitle,
  dbStatus,
  onOpenMobile,
  onLoadSample,
  isSeeding,
  onRefresh
}) {
  const { theme, currentThemeId, setTheme, THEMES } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const isMysql = dbStatus?.engine === 'mysql';

  return (
    <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 bg-[#050D09]/85 backdrop-blur-2xl border-b border-emerald-500/15 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-950/40 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs text-gray-400 font-medium hidden sm:block">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Interactive Theme Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/40 text-xs font-semibold text-emerald-200 border border-emerald-500/25 transition-all shadow-sm"
            title="Switch Dashboard Color Theme"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{theme.name}</span>
            <ChevronDown className="w-3 h-3 text-emerald-400/80" />
          </button>

          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowThemeMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#091710] border border-emerald-500/30 p-2 shadow-2xl z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 border-b border-white/5 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Color Palettes
                </div>
                {Object.values(THEMES).map((t) => {
                  const isSelected = t.id === currentThemeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-600/25 text-white font-semibold border border-emerald-500/40 shadow-sm'
                          : 'text-gray-300 hover:bg-emerald-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.primary }}
                        />
                        <div>
                          <div>{t.name}</div>
                          <div className="text-[10px] text-gray-400">{t.subtitle}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Database Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
          <Database className={`w-3.5 h-3.5 ${isMysql ? 'text-emerald-400' : 'text-lime-400'}`} />
          <span className="text-gray-400">DB:</span>
          <span className="font-semibold text-gray-200 uppercase">
            {dbStatus?.engine || 'Detecting...'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isMysql ? 'bg-emerald-400 shadow-sm shadow-emerald-500' : 'bg-lime-400 shadow-sm shadow-lime-500'}`} />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Quick Sample Seeder Button */}
        <button
          id="header-load-sample-btn"
          onClick={onLoadSample}
          disabled={isSeeding}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
        >
          {isSeeding ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-lime-200" />
          )}
          <span>{isSeeding ? 'Seeding...' : 'Load Sample Data'}</span>
        </button>

        {/* Analyst Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-emerald-500/20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-600 to-lime-500 flex items-center justify-center font-bold text-white text-xs shadow-md border border-white/20">
            WA
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white">Weather Analyst</div>
            <div className="text-[10px] text-emerald-400/80">Eco Meteorology Lab</div>
          </div>
        </div>
      </div>
    </header>
  );
}
