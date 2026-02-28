import { useState, useCallback, useEffect } from 'react';
import type { Bookmark } from '../types';

const LS_KEY = 'bm-dashboard-v1';

async function loadFromApi(): Promise<Bookmark[]> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error();
  const data = await res.json();
  return Array.isArray(data.bookmarks) ? data.bookmarks : [];
}

function loadFromLocalStorage(): Bookmark[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

async function saveToApi(bookmarks: Bookmark[]): Promise<void> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookmarks }),
  });
  if (!res.ok) throw new Error();
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    loadFromApi()
      .then(bm => setBookmarks(bm))
      .catch(() => setBookmarks(loadFromLocalStorage()));
  }, []);

  const commit = useCallback((next: Bookmark[]) => {
    setBookmarks(next);
    saveToApi(next).catch(() => localStorage.setItem(LS_KEY, JSON.stringify(next)));
  }, []);

  const add = useCallback(
    (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const next: Bookmark = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      commit([...bookmarks, next]);
    },
    [bookmarks, commit]
  );

  const update = useCallback(
    (id: string, data: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) => {
      commit(bookmarks.map((b) => (b.id === id ? { ...b, ...data } : b)));
    },
    [bookmarks, commit]
  );

  const remove = useCallback(
    (id: string) => {
      commit(bookmarks.filter((b) => b.id !== id));
    },
    [bookmarks, commit]
  );

  const togglePin = useCallback(
    (id: string) => {
      commit(
        bookmarks.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b))
      );
    },
    [bookmarks, commit]
  );

  return { bookmarks, add, update, remove, togglePin };
}
