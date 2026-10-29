import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  leaf: {
    id: 'leaf',
    name: 'Botanical Leaf',
    subtitle: 'Deep Pine • Spring Leaf • Dewdrop Emerald • Sage',
    bodyBg: '#050D09',
    panelBg: 'rgba(10, 22, 16, 0.84)',
    panelBorder: 'rgba(34, 197, 94, 0.22)',
    primary: '#22C55E', // Vibrant Leaf Green
    primaryHover: '#16A34A',
    primaryLight: '#86EFAC',
    secondary: '#10B981', // Emerald Mint
    accent: '#EAB308', // Sunlit Warmth
    amber: '#84CC16', // Fresh Lime / Sage
    cyan: '#14B8A6', // Pine Teal
    tempColor: '#EAB308', // Warm Gold
    humColor: '#22C55E', // Leaf Moisture
    rainColor: '#14B8A6', // Pine Rain Teal
    glowShadow: '0 0 25px -5px rgba(34, 197, 94, 0.4)',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    subtitle: 'Deep Forest Green • Mint Glow • Jade • Goldenrod',
    bodyBg: '#040A07',
    panelBg: 'rgba(8, 19, 13, 0.86)',
    panelBorder: 'rgba(16, 185, 129, 0.25)',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryLight: '#A7F3D0',
    secondary: '#34D399',
    accent: '#F59E0B',
    amber: '#A3E635',
    cyan: '#06B6D4',
    tempColor: '#F59E0B',
    humColor: '#10B981',
    rainColor: '#34D399',
    glowShadow: '0 0 25px -5px rgba(16, 185, 129, 0.4)',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  sage: {
    id: 'sage',
    name: 'Spring Sage',
    subtitle: 'Botanical Charcoal • Fresh Sprout • Lime • Mint',
    bodyBg: '#070C08',
    panelBg: 'rgba(14, 25, 18, 0.82)',
    panelBorder: 'rgba(132, 204, 22, 0.25)',
    primary: '#84CC16',
    primaryHover: '#65A30D',
    primaryLight: '#D9F99D',
    secondary: '#10B981',
    accent: '#F97316',
    amber: '#EAB308',
    cyan: '#14B8A6',
    tempColor: '#F97316',
    humColor: '#84CC16',
    rainColor: '#10B981',
    glowShadow: '0 0 25px -5px rgba(132, 204, 22, 0.4)',
    badgeClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Eclipse',
    subtitle: 'Obsidian • Neon Violet • Mint Teal • Rose',
    bodyBg: '#08090E',
    panelBg: 'rgba(14, 18, 28, 0.78)',
    panelBorder: 'rgba(139, 92, 246, 0.18)',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryLight: '#C4B5FD',
    secondary: '#10B981',
    accent: '#F43F5E',
    amber: '#F59E0B',
    cyan: '#06B6D4',
    tempColor: '#F43F5E',
    humColor: '#10B981',
    rainColor: '#8B5CF6',
    glowShadow: '0 0 25px -5px rgba(139, 92, 246, 0.4)',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    // Default to the new Botanical Leaf theme requested by user
    return localStorage.getItem('aetheria_theme') || 'leaf';
  });

  const theme = THEMES[currentThemeId] || THEMES.leaf;

  const setTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentThemeId(themeId);
      localStorage.setItem('aetheria_theme', themeId);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.bodyBg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, currentThemeId, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
