import { useState, useEffect, useRef } from 'react';
import type { Bookmark, Group } from '../types';

interface Props {
  title: string;
  groups: Group[];
  bookmarks: Bookmark[];
  onSaveTitle: (title: string) => void;
  onAddGroup: (name: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onReorderGroups: (newOrder: Group[]) => void;
  onClose: () => void;
}

export function SettingsModal({
  title,
  groups,
  bookmarks,
  onSaveTitle,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onReorderGroups,
  onClose,
}: Props) {
  const [titleInput, setTitleInput] = useState(title);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const newGroupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) { setEditingId(null); return; }
        if (deletingId) { setDeletingId(null); return; }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editingId, deletingId, onClose]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed) onSaveTitle(trimmed);
  };

  const startEdit = (g: Group) => {
    setEditingId(g.id);
    setEditingName(g.name);
    setDeletingId(null);
  };

  const confirmEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameGroup(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  const startDelete = (id: string) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteGroup(deletingId);
      setDeletingId(null);
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName.trim());
    setNewGroupName('');
    newGroupRef.current?.focus();
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...groups];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onReorderGroups(next);
  };

  const bookmarkCount = (groupId: string) =>
    bookmarks.filter((b) => b.groupIds.includes(groupId)).length;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          {/* General section */}
          <div className="settings-section">
            <h3 className="settings-section-title">General</h3>
            <div className="field">
              <label className="field-label" htmlFor="settings-title">Application title</label>
              <div className="settings-title-row">
                <input
                  id="settings-title"
                  className="field-input"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
                  placeholder="Bookmarks"
                />
                <button
                  className="btn-primary"
                  onClick={handleSaveTitle}
                  disabled={!titleInput.trim() || titleInput.trim() === title}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Groups section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Groups</h3>

            {groups.length === 0 ? (
              <p className="manage-groups-empty">No groups yet. Create one below.</p>
            ) : (
              <ul className="manage-groups-list">
                {groups.map((g, i) => (
                  <li key={g.id} className="manage-groups-item">
                    {editingId === g.id ? (
                      <div className="manage-groups-edit-row">
                        <input
                          className="field-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button className="btn-primary" onClick={confirmEdit}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : deletingId === g.id ? (
                      <div className="manage-groups-delete-confirm">
                        <span className="manage-groups-delete-msg">
                          Delete &ldquo;{g.name}&rdquo;? This will also permanently delete {bookmarkCount(g.id)} bookmark{bookmarkCount(g.id) !== 1 ? 's' : ''}.
                        </span>
                        <div className="manage-groups-delete-actions">
                          <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                          <button className="btn-secondary" onClick={() => setDeletingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="manage-groups-row">
                        <div className="manage-groups-reorder">
                          <button
                            className="icon-btn icon-btn--sm"
                            onClick={() => move(i, -1)}
                            disabled={i === 0}
                            title="Move up"
                            aria-label="Move up"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          </button>
                          <button
                            className="icon-btn icon-btn--sm"
                            onClick={() => move(i, 1)}
                            disabled={i === groups.length - 1}
                            title="Move down"
                            aria-label="Move down"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>
                        <span className="manage-groups-name">{g.name}</span>
                        <span className="manage-groups-count" title={`${bookmarkCount(g.id)} bookmarks`}>
                          {bookmarkCount(g.id)}
                        </span>
                        <div className="manage-groups-actions">
                          <button
                            className="icon-btn icon-btn--sm"
                            onClick={() => startEdit(g)}
                            title="Rename"
                            aria-label={`Rename ${g.name}`}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="icon-btn icon-btn--sm icon-btn--danger"
                            onClick={() => startDelete(g.id)}
                            title="Delete"
                            aria-label={`Delete ${g.name}`}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="manage-groups-add">
              <input
                ref={newGroupRef}
                className="field-input"
                placeholder="New group name…"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
              />
              <button className="btn-primary" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
