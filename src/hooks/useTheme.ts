import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bm-theme';

type ThemePref = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(pref: ThemePref) {
  const resolved = pref === 'system' ? getSystemTheme() : pref;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    return stored ?? 'system';
  });

  useEffect(() => {
    applyTheme(pref);
    localStorage.setItem(STORAGE_KEY, pref);
  }, [pref]);

  // Keep in sync when OS theme changes (only matters when pref === 'system')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (pref === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [pref]);

  const toggle = () => {
    setPref((p) => {
      const current = p === 'system' ? getSystemTheme() : p;
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const isDark =
    pref === 'dark' || (pref === 'system' && getSystemTheme() === 'dark');

  return { pref, isDark, toggle };
}
