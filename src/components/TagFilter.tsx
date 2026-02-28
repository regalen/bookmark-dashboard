
interface Props {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export function TagFilter({ allTags, activeTags, onToggle, onClear }: Props) {
  if (allTags.length === 0) return null;

  return (
    <div className="tag-filter" role="group" aria-label="Filter by tag">
      <button
        className={`tag-chip ${activeTags.length === 0 ? 'tag-chip--active' : ''}`}
        onClick={onClear}
      >
        All
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          className={`tag-chip ${activeTags.includes(tag) ? 'tag-chip--active' : ''}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
