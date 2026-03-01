import type { Group } from '../types';

interface Props {
  groups: Group[];
  activeGroupId: string | 'all';
  onSelect: (id: string | 'all') => void;
  onManageClick: () => void;
}

export function GroupTabs({ groups, activeGroupId, onSelect, onManageClick }: Props) {
  return (
    <div className="group-tabs">
      <div className="group-tabs-list">
        <button
          className={`group-tab ${activeGroupId === 'all' ? 'group-tab--active' : ''}`}
          onClick={() => onSelect('all')}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            className={`group-tab ${activeGroupId === g.id ? 'group-tab--active' : ''}`}
            onClick={() => onSelect(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>
      <button
        className="icon-btn icon-btn--sm"
        onClick={onManageClick}
        title="Manage groups"
        aria-label="Manage groups"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
}
