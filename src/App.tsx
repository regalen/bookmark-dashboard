import { useMemo, useState } from 'react';
import type { Bookmark, ViewMode } from './types';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TagFilter } from './components/TagFilter';
import { BookmarkCard } from './components/BookmarkCard';
import { BookmarkRow } from './components/BookmarkRow';
import { BookmarkModal } from './components/BookmarkModal';
import './styles/index.css';

export default function App() {
  const { bookmarks, add, update, remove, togglePin } = useBookmarks();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bookmark | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [bookmarks]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookmarks
      .filter((b) => {
        if (activeTags.length > 0) {
          if (!activeTags.every((t) => b.tags.includes(t))) return false;
        }
        if (q) {
          const haystack = [
            b.title,
            b.description ?? '',
            b.lanUrl ?? '',
            b.wanUrl ?? '',
            b.tags.join(' '),
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
  }, [bookmarks, searchQuery, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? [] : [tag]));
  };

  const handleTagClick = (tag: string) => {
    setActiveTags([tag]);
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (b: Bookmark) => {
    setEditTarget(b);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (editTarget) {
      update(editTarget.id, data);
    } else {
      add(data);
    }
    closeModal();
  };

  return (
    <>
      <Header
        isDark={isDark}
        onThemeToggle={toggleTheme}
        viewMode={viewMode}
        onViewToggle={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
        onAddClick={openAdd}
      />

      <main className="main">
        <div className="toolbar">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <TagFilter
          allTags={allTags}
          activeTags={activeTags}
          onToggle={toggleTag}
          onClear={() => setActiveTags([])}
        />

        {filtered.length === 0 ? (
          <div className="empty-state">
            {bookmarks.length === 0 ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                  <path d="M5 3h14a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z" />
                </svg>
                <p>No bookmarks yet.</p>
                <button className="btn-primary" onClick={openAdd}>Add your first bookmark</button>
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No bookmarks match your search.</p>
                <button className="btn-secondary" onClick={() => { setSearchQuery(''); setActiveTags([]); }}>Clear filters</button>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                onEdit={openEdit}
                onDelete={remove}
                onTogglePin={togglePin}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        ) : (
          <div className="list">
            {filtered.map((b) => (
              <BookmarkRow
                key={b.id}
                bookmark={b}
                onEdit={openEdit}
                onDelete={remove}
                onTogglePin={togglePin}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <BookmarkModal
          initial={editTarget}
          existingTags={allTags}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </>
  );
}
