import React from 'react';
import GlassCard from './GlassCard';
import { useTheme } from '../../context/ThemeContext';

export default function KpiCard({
  title,
  value,
  unit = '',
  icon: Icon,
  supportingText,
  badgeText,
  badgeColor = 'primary', // primary (leaf), secondary (emerald), accent (amber gold), cyan (teal)
  id
}) {
  const { theme } = useTheme();

  const colorStyles = {
    primary: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      iconGrad: 'from-emerald-600 to-green-600 text-white',
      glow: 'bg-emerald-500/15',
    },
    secondary: {
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      iconGrad: 'from-teal-600 to-emerald-600 text-white',
      glow: 'bg-teal-500/15',
    },
    accent: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      iconGrad: 'from-amber-500 to-orange-500 text-white',
      glow: 'bg-amber-500/15',
    },
    cyan: {
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      iconGrad: 'from-cyan-600 to-teal-600 text-white',
      glow: 'bg-cyan-500/15',
    },
    leaf: {
      badge: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
      iconGrad: 'from-lime-600 to-emerald-600 text-white',
      glow: 'bg-lime-500/15',
    }
  };

  const currentStyle = colorStyles[badgeColor] || colorStyles.primary;

  return (
    <GlassCard id={id} className="relative overflow-hidden group border-emerald-500/15">
      {/* Background ambient glow orb */}
      <div className={`absolute -top-12 -right-12 w-28 h-28 ${currentStyle.glow} rounded-full blur-2xl group-hover:scale-125 transition-all duration-500 pointer-events-none`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300/80">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentStyle.iconGrad} shadow-lg shadow-emerald-950/50`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-emerald-400/80">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-emerald-500/15">
        <span className="truncate pr-2 text-[11px] text-gray-300/90">{supportingText}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] whitespace-nowrap border ${currentStyle.badge}`}>
            {badgeText}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
