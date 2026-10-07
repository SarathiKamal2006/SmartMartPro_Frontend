import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartmart_theme') || 'light';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('smartmart_accent_color') || 'emerald';
  });

  const [compactMode, setCompactModeState] = useState(() => {
    return localStorage.getItem('smartmart_compact_mode') === 'true';
  });

  const [soundEnabled, setSoundEnabledState] = useState(() => {
    return localStorage.getItem('smartmart_sound_enabled') !== 'false';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('smartmart_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);
    localStorage.setItem('smartmart_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-compact', String(compactMode));
    localStorage.setItem('smartmart_compact_mode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('smartmart_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setAccentColor = useCallback((color) => {
    setAccentColorState(color);
    document.documentElement.setAttribute('data-accent', color);
    localStorage.setItem('smartmart_accent_color', color);
  }, []);

  const setCompactMode = useCallback((val) => {
    setCompactModeState(val);
    document.documentElement.setAttribute('data-compact', String(val));
    localStorage.setItem('smartmart_compact_mode', String(val));
  }, []);

  const setSoundEnabled = useCallback((val) => {
    setSoundEnabledState(val);
    localStorage.setItem('smartmart_sound_enabled', String(val));
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
      accentColor,
      setAccentColor,
      compactMode,
      setCompactMode,
      soundEnabled,
      setSoundEnabled
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

