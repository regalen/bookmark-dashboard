import { useState, useEffect, useRef } from 'react';

const LS_KEY = 'bm-theme';

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
  const [pref, setPref] = useState<ThemePref>('system');
  const loaded = useRef(false);

  // Load theme from API on mount; fall back to localStorage in local dev
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        loaded.current = true;
        if (data.theme) setPref(data.theme as ThemePref);
      })
      .catch(() => {
        loaded.current = true;
        const stored = localStorage.getItem(LS_KEY) as ThemePref | null;
        if (stored) setPref(stored);
      });
  }, []);

  // Apply and save whenever pref changes (skip save until initial load is done)
  useEffect(() => {
    applyTheme(pref);
    if (!loaded.current) return;
    fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: pref }),
    }).catch(() => localStorage.setItem(LS_KEY, pref));
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
