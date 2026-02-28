import type { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function BookmarkRow({ bookmark, onEdit, onDelete, onTogglePin, onTagClick }: Props) {
  const showBoth = Boolean(bookmark.lanUrl && bookmark.wanUrl);

  const handleDelete = () => {
    if (window.confirm(`Delete "${bookmark.title}"?`)) {
      onDelete(bookmark.id);
    }
  };

  return (
    <article className="row">
      <div className="row-main">
        <span className="row-title">{bookmark.title}</span>
        {bookmark.description && (
          <span className="row-description">{bookmark.description}</span>
        )}
      </div>

      {bookmark.tags.length > 0 && (
        <div className="row-tags">
          {bookmark.tags.map((tag) => (
            <button key={tag} className="tag-badge" onClick={() => onTagClick(tag)} title={`Filter by "${tag}"`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="row-urls">
        {showBoth ? (
          <>
            <a href={bookmark.lanUrl} target="_blank" rel="noopener noreferrer" className="url-btn url-btn--lan" title={bookmark.lanUrl}>LAN</a>
            <a href={bookmark.wanUrl} target="_blank" rel="noopener noreferrer" className="url-btn url-btn--wan" title={bookmark.wanUrl}>WAN</a>
          </>
        ) : bookmark.lanUrl ? (
          <a href={bookmark.lanUrl} target="_blank" rel="noopener noreferrer" className="url-btn url-btn--lan" title={bookmark.lanUrl}>LAN</a>
        ) : (
          <a href={bookmark.wanUrl} target="_blank" rel="noopener noreferrer" className="url-btn url-btn--wan" title={bookmark.wanUrl}>WAN</a>
        )}
      </div>

      <div className="row-actions">
        <button
          className={`icon-btn icon-btn--sm ${bookmark.pinned ? 'icon-btn--pinned' : ''}`}
          onClick={() => onTogglePin(bookmark.id)}
          title={bookmark.pinned ? 'Unpin' : 'Pin to top'}
          aria-label={bookmark.pinned ? 'Unpin' : 'Pin to top'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmark.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
        <button className="icon-btn icon-btn--sm" onClick={() => onEdit(bookmark)} title="Edit" aria-label="Edit bookmark">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={handleDelete} title="Delete" aria-label="Delete bookmark">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}
