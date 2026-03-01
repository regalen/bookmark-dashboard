import { useState, useCallback, useEffect } from 'react';
import type { Bookmark, Group } from '../types';

const LS_KEY = 'bm-dashboard-v1';
const LS_GROUPS_KEY = 'bm-groups-v1';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface Settings {
  bookmarks: Bookmark[];
  groups: Group[];
}

async function loadFromApi(): Promise<Settings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error();
  const data = await res.json();
  return {
    bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
    groups: Array.isArray(data.groups) ? data.groups : [],
  };
}

function loadFromLocalStorage(): Settings {
  try {
    const rawBm = localStorage.getItem(LS_KEY);
    const rawGr = localStorage.getItem(LS_GROUPS_KEY);
    return {
      bookmarks: rawBm ? (JSON.parse(rawBm) as Bookmark[]) : [],
      groups: rawGr ? (JSON.parse(rawGr) as Group[]) : [],
    };
  } catch {
    return { bookmarks: [], groups: [] };
  }
}

async function patchApi(patch: Partial<Settings>): Promise<void> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error();
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadFromApi()
      .then(({ bookmarks: bm, groups: gr }) => {
        setBookmarks(bm);
        setGroups(gr);
      })
      .catch(() => {
        const { bookmarks: bm, groups: gr } = loadFromLocalStorage();
        setBookmarks(bm);
        setGroups(gr);
      });
  }, []);

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    if (patch.bookmarks !== undefined) setBookmarks(patch.bookmarks);
    if (patch.groups !== undefined) setGroups(patch.groups);
    patchApi(patch).catch(() => {
      if (patch.bookmarks !== undefined) localStorage.setItem(LS_KEY, JSON.stringify(patch.bookmarks));
      if (patch.groups !== undefined) localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(patch.groups));
    });
  }, []);

  // ── Bookmark operations ────────────────────────────────────────

  const add = useCallback(
    (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const next: Bookmark = { ...data, id: generateId(), createdAt: Date.now() };
      patchSettings({ bookmarks: [...bookmarks, next] });
    },
    [bookmarks, patchSettings]
  );

  const update = useCallback(
    (id: string, data: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) => {
      patchSettings({ bookmarks: bookmarks.map((b) => (b.id === id ? { ...b, ...data } : b)) });
    },
    [bookmarks, patchSettings]
  );

  const remove = useCallback(
    (id: string) => {
      patchSettings({ bookmarks: bookmarks.filter((b) => b.id !== id) });
    },
    [bookmarks, patchSettings]
  );

  const togglePin = useCallback(
    (id: string) => {
      patchSettings({ bookmarks: bookmarks.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b)) });
    },
    [bookmarks, patchSettings]
  );

  // ── Group operations ───────────────────────────────────────────

  const addGroup = useCallback(
    (name: string): string => {
      const id = generateId();
      patchSettings({ groups: [...groups, { id, name: name.trim(), createdAt: Date.now() }] });
      return id;
    },
    [groups, patchSettings]
  );

  const updateGroup = useCallback(
    (id: string, name: string) => {
      patchSettings({ groups: groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)) });
    },
    [groups, patchSettings]
  );

  const deleteGroup = useCallback(
    (id: string) => {
      patchSettings({
        groups: groups.filter((g) => g.id !== id),
        bookmarks: bookmarks.filter((b) => !b.groupIds.includes(id)),
      });
    },
    [bookmarks, groups, patchSettings]
  );

  const reorderGroups = useCallback(
    (newOrder: Group[]) => {
      patchSettings({ groups: newOrder });
    },
    [patchSettings]
  );

  return { bookmarks, groups, add, update, remove, togglePin, addGroup, updateGroup, deleteGroup, reorderGroups };
}
