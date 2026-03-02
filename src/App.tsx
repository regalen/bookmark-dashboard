import { useMemo, useState } from 'react';
import type { Bookmark, ViewMode } from './types';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { GroupTabs } from './components/GroupTabs';
import { TagFilter } from './components/TagFilter';
import { BookmarkCard } from './components/BookmarkCard';
import { BookmarkRow } from './components/BookmarkRow';
import { BookmarkModal } from './components/BookmarkModal';
import { SettingsModal } from './components/SettingsModal';
import './styles/index.css';

export default function App() {
  const { bookmarks, groups, title, setTitle, add, update, remove, togglePin, addGroup, updateGroup, deleteGroup, reorderGroups } = useBookmarks();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bookmark | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    const source =
      activeGroupId === 'all'
        ? bookmarks
        : bookmarks.filter((b) => b.groupIds.includes(activeGroupId));
    source.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [bookmarks, activeGroupId]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookmarks
      .filter((b) => {
        if (activeGroupId !== 'all' && !b.groupIds.includes(activeGroupId)) return false;
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
  }, [bookmarks, searchQuery, activeTags, activeGroupId]);

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

  const handleDeleteGroup = (id: string) => {
    deleteGroup(id);
    if (activeGroupId === id) setActiveGroupId('all');
  };

  return (
    <>
      <Header
        title={title}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        viewMode={viewMode}
        onViewToggle={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
        onAddClick={openAdd}
        onSettingsClick={() => setSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <GroupTabs
        groups={groups}
        activeGroupId={activeGroupId}
        onSelect={setActiveGroupId}
      />

      <main className="main">
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
          groups={groups}
          activeGroupId={activeGroupId}
          onSave={handleSave}
          onClose={closeModal}
          onCreateGroup={addGroup}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          title={title}
          groups={groups}
          bookmarks={bookmarks}
          onSaveTitle={setTitle}
          onAddGroup={addGroup}
          onRenameGroup={updateGroup}
          onDeleteGroup={handleDeleteGroup}
          onReorderGroups={reorderGroups}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
