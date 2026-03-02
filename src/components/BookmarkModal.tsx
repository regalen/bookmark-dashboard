import React, { useEffect, useRef, useState } from 'react';
import type { Bookmark, Group } from '../types';

interface FormState {
  title: string;
  lanUrl: string;
  wanUrl: string;
  tags: string;
  description: string;
  pinned: boolean;
  groupIds: string[];
}

interface Props {
  initial?: Bookmark | null;
  existingTags: string[];
  groups: Group[];
  activeGroupId: string | 'all';
  onSave: (data: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  onCreateGroup: (name: string) => string;
}

function toForm(b: Bookmark | null | undefined, activeGroupId: string | 'all'): FormState {
  if (!b) {
    return {
      title: '', lanUrl: '', wanUrl: '', tags: '', description: '', pinned: false,
      groupIds: activeGroupId !== 'all' ? [activeGroupId] : [],
    };
  }
  return {
    title: b.title,
    lanUrl: b.lanUrl ?? '',
    wanUrl: b.wanUrl ?? '',
    tags: b.tags.join(', '),
    description: b.description ?? '',
    pinned: b.pinned,
    groupIds: b.groupIds ?? [],
  };
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function BookmarkModal({ initial, existingTags, groups, activeGroupId, onSave, onClose, onCreateGroup }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(initial, activeGroupId));
  const [errors, setErrors] = useState<Partial<Record<'title' | 'lanUrl', string>>>({});
  const [newGroup, setNewGroup] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm(toForm(initial, activeGroupId));
    setErrors({});
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const set = (field: keyof FormState, value: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleGroupId = (id: string) => {
    const next = form.groupIds.includes(id)
      ? form.groupIds.filter((g) => g !== id)
      : [...form.groupIds, id];
    set('groupIds', next);
  };

  const handleCreateGroup = () => {
    if (!newGroup.trim()) return;
    const id = onCreateGroup(newGroup.trim());
    set('groupIds', [...form.groupIds, id]);
    setNewGroup('');
  };

  const activeTags = parseTags(form.tags);

  const toggleTag = (tag: string) => {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    set('tags', next.join(', '));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.lanUrl.trim() && !form.wanUrl.trim()) {
      next.lanUrl = 'At least one URL (LAN or WAN) is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      lanUrl: form.lanUrl.trim() || undefined,
      wanUrl: form.wanUrl.trim() || undefined,
      tags: parseTags(form.tags),
      description: form.description.trim() || undefined,
      pinned: form.pinned,
      groupIds: form.groupIds,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={initial ? 'Edit bookmark' : 'Add bookmark'}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit bookmark' : 'Add bookmark'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="bm-title">Title <span className="required">*</span></label>
            <input
              id="bm-title"
              ref={titleRef}
              className={`field-input ${errors.title ? 'field-input--error' : ''}`}
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="My service"
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="bm-lan">LAN address</label>
              <div className="field-url-wrap">
                <input
                  id="bm-lan"
                  className={`field-input ${errors.lanUrl ? 'field-input--error' : ''}`}
                  type="url"
                  value={form.lanUrl}
                  onChange={(e) => set('lanUrl', e.target.value)}
                  placeholder="http://192.168.1.10:8080"
                />
                {form.lanUrl && (
                  <a href={form.lanUrl} target="_blank" rel="noopener noreferrer" className="field-url-open" title="Open in new tab">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
              {errors.lanUrl && <span className="field-error">{errors.lanUrl}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="bm-wan">WAN address</label>
              <div className="field-url-wrap">
                <input
                  id="bm-wan"
                  className="field-input"
                  type="url"
                  value={form.wanUrl}
                  onChange={(e) => set('wanUrl', e.target.value)}
                  placeholder="https://myapp.example.com"
                />
                {form.wanUrl && (
                  <a href={form.wanUrl} target="_blank" rel="noopener noreferrer" className="field-url-open" title="Open in new tab">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Groups</label>
            {groups.length > 0 && (
              <div className="tag-picker">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`tag-chip ${form.groupIds.includes(g.id) ? 'tag-chip--active' : ''}`}
                    onClick={() => toggleGroupId(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            <div className="group-create-row">
              <input
                className="field-input"
                placeholder="Create new group…"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateGroup(); } }}
              />
              <button type="button" className="btn-secondary" onClick={handleCreateGroup} disabled={!newGroup.trim()}>
                Create
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="bm-tags">Tags</label>
            <input
              id="bm-tags"
              className="field-input"
              type="text"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="media, homelab, monitoring"
            />
            <span className="field-hint">Comma-separated — or click to toggle existing tags below</span>
            {existingTags.length > 0 && (
              <div className="tag-picker">
                {existingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip ${activeTags.includes(tag) ? 'tag-chip--active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="bm-desc">Description</label>
            <textarea
              id="bm-desc"
              className="field-input field-textarea"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional notes about this bookmark…"
              rows={3}
            />
          </div>

          <div className="field field--checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => set('pinned', e.target.checked)}
              />
              <span>Pin to top</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initial ? 'Save changes' : 'Add bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
