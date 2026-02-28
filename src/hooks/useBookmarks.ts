import { useState, useCallback } from 'react';
import type { Bookmark } from '../types';

const STORAGE_KEY = 'bm-dashboard-v1';

function load(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

function save(bookmarks: Bookmark[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const commit = useCallback((next: Bookmark[]) => {
    save(next);
    setBookmarks(next);
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
