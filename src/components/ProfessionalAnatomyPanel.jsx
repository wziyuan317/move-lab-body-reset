import { useEffect, useMemo, useRef } from "react";
import { X } from "@phosphor-icons/react";
import Body from "react-muscle-highlighter";
import { getRegionTargets } from "../bodyMap.js";
import {
  getBodyPartFill,
  getBodyRegionVisualData,
} from "../bodyRegionMap.js";

export default function ProfessionalAnatomyPanel({ regionId, selectedIds, selectedSides = {}, onToggleTarget, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const targets = useMemo(() => getRegionTargets(regionId), [regionId]);
  const muscleTargets = useMemo(() => targets.filter((target) => target.kind === "muscle"), [targets]);
  const selectedTargets = targets.filter((target) => selectedIds.includes(target.id));
  const bodyData = getBodyRegionVisualData({ regionId, selectedIds, selectedSides }).map(({ slug, targetIds, selected, color, side }) => ({
    slug,
    ...(targetIds.length > 0 ? { color: selected ? color : "#79a8ed", side } : {}),
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
  }, []);

  const closeDialog = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="professional-anatomy"
      aria-labelledby="professional-anatomy-title"
      aria-describedby="professional-anatomy-note"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        closeDialog();
      }}
      onClose={onClose}
    >
      <header>
        <div>
          <small>PROFESSIONAL VIEW</small>
          <h2 id="professional-anatomy-title">专业解剖模式</h2>
        </div>
        <button ref={closeButtonRef} type="button" onClick={closeDialog} aria-label="关闭专业解剖模式">
          <X size={23} weight="bold" />关闭
        </button>
      </header>

      <div className="professional-anatomy__legend" aria-label="解剖图例">
        <span><i className="is-region" />当前区域</span>
        <span><i className="is-selected" />已选目标</span>
        <span><i className="is-reference" />其余身体参照</span>
      </div>

      <div className="professional-anatomy__body-grid" aria-label="完整正背人体背景参照">
        <figure>
          <figcaption>正面</figcaption>
          <Body data={bodyData} side="front" gender="male" defaultFill={getBodyPartFill()} defaultStroke="#9aacbf" defaultStrokeWidth={1} />
        </figure>
        <figure>
          <figcaption>背面</figcaption>
          <Body data={bodyData} side="back" gender="male" defaultFill={getBodyPartFill()} defaultStroke="#9aacbf" defaultStrokeWidth={1} />
        </figure>
      </div>

      <section className="professional-anatomy__selection" aria-labelledby="professional-anatomy-selection-title">
        <div>
          <h3 id="professional-anatomy-selection-title">当前选中目标</h3>
          <div className="professional-anatomy__selected-tags" aria-live="polite">
            {selectedTargets.length > 0
              ? selectedTargets.map((target) => <span key={target.id} style={{ "--target-color": target.color }}>{target.label}</span>)
              : <span className="is-empty">尚未选择具体位置</span>}
          </div>
          <p className="professional-anatomy__granularity-note">2D 分区会合并落在同一轮廓区域的肌肉；彩色标签保留多选详情。</p>
        </div>
        {muscleTargets.length > 0 && (
          <div className="professional-anatomy__target-controls" aria-label="当前区域肌群选择">
            {muscleTargets.map((target) => {
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
                  <i />{target.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <p id="professional-anatomy-note">仅用于解剖教育与位置沟通，不提供诊断，也不能替代医生或物理治疗师的个体评估。</p>
    </dialog>
  );
}
