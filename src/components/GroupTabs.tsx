import type { Group } from '../types';

interface Props {
  groups: Group[];
  activeGroupId: string | 'all';
  onSelect: (id: string | 'all') => void;
}

export function GroupTabs({ groups, activeGroupId, onSelect }: Props) {
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
    </div>
  );
}
