export function TargetSelectionList({ targets, selectedIds = [], onToggleTarget, title = "具体位置" }) {
  if (targets.length === 0) {
    return <p className="target-selection-list__empty">当前大区域已选择，可继续描述身体感觉。</p>;
  }

  return (
    <div className="target-selection-list" aria-label={`${title}选择`}>
      <strong>{title}</strong>
      <div>
        {targets.map((target) => {
          const selected = selectedIds.includes(target.id);
          return (
            <button
              key={target.id}
              type="button"
              data-hit-size="44"
              aria-pressed={selected}
              className={selected ? "is-active" : ""}
              style={{ "--target-color": target.color }}
              onClick={() => onToggleTarget(target.id)}
            >
              <i aria-hidden="true" />
              <span>{target.label}</span>
              <small>{selected ? "已选择" : "选择"}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
