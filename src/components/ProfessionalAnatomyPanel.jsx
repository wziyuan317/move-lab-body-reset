import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, Minus, Plus } from "@phosphor-icons/react";
import Body from "react-muscle-highlighter";
import { getRegionTargets } from "../bodyMap.js";
import {
  getBodyPartFill,
  getBodyRegionVisualData,
} from "../bodyRegionMap.js";
import { getNextAnatomyZoom, getProfessionalFocus, resolveProfessionalPress } from "../professionalFocus.js";
import { JointRegionMap } from "./JointRegionMap.jsx";
import { SideAnatomyFigure } from "./SideAnatomyFigure.jsx";
import { TargetSelectionList } from "./TargetSelectionList.jsx";

const viewLabels = { front: "正面", side: "侧面", back: "背面" };
const jointRegionLabels = { knee: "膝部", shoulder: "肩部", ankle: "踝部" };

export default function ProfessionalAnatomyPanel({
  regionId,
  selectedIds = [],
  selectedSides = {},
  sex,
  view,
  zoom,
  onChangeSex,
  onChangeView,
  onChangeZoom,
  onToggleTarget,
}) {
  const [focusKey, setFocusKey] = useState();
  const [candidateSelection, setCandidateSelection] = useState();
  const targets = useMemo(() => getRegionTargets(regionId), [regionId]);
  const muscleTargets = useMemo(() => targets.filter((target) => target.kind === "muscle"), [targets]);
  const selectedTargets = targets.filter((target) => selectedIds.includes(target.id));
  const bodyData = getBodyRegionVisualData({ regionId, selectedIds, selectedSides }).map(({ slug, targetIds, selected, color, side }) => ({
    slug,
    ...(targetIds.length > 0 ? { color: selected ? color : "#79a8ed", side } : {}),
  }));
  const focus = getProfessionalFocus(focusKey);
  const bodyScale = Math.round(focus.scale * zoom * 100) / 100;

  useEffect(() => {
    setFocusKey(undefined);
    setCandidateSelection(undefined);
  }, [regionId]);

  const resetView = () => {
    setFocusKey(undefined);
    setCandidateSelection(undefined);
    onChangeZoom(getNextAnatomyZoom(zoom, "reset"));
  };
  const handlePress = (slug, side) => {
    const resolution = resolveProfessionalPress({ slug, regionId, side });
    if (resolution.type === "ignore") return;
    setFocusKey(resolution.focusKey);
    if (resolution.type === "toggle") {
      setCandidateSelection(undefined);
      onToggleTarget(resolution.targetId, resolution.side);
      return;
    }
    setCandidateSelection(resolution);
  };

  return (
    <section className="professional-anatomy-stage" aria-labelledby="professional-anatomy-title" aria-describedby="professional-anatomy-note">
      <header className="professional-anatomy-stage__header">
        <div>
          <small>PROFESSIONAL VIEW</small>
          <h2 id="professional-anatomy-title">专业解剖</h2>
        </div>
        <p>切换人体和观察方向，点击图形或下方名称定位。</p>
      </header>

      <div className="professional-anatomy-stage__controls">
        <div className="anatomy-control-group" role="group" aria-label="人体类别">
          <span>人体</span>
          <button type="button" aria-pressed={sex === "male"} className={sex === "male" ? "is-active" : ""} onClick={() => onChangeSex("male")}>男生</button>
          <button type="button" aria-pressed={sex === "female"} className={sex === "female" ? "is-active" : ""} onClick={() => onChangeSex("female")}>女生</button>
        </div>
        <div className="anatomy-control-group" role="group" aria-label="观察方向">
          <span>方向</span>
          <button type="button" aria-pressed={view === "front"} className={view === "front" ? "is-active" : ""} onClick={() => onChangeView("front")}>正面</button>
          <button type="button" aria-pressed={view === "side"} className={view === "side" ? "is-active" : ""} onClick={() => onChangeView("side")}>侧面</button>
          <button type="button" aria-pressed={view === "back"} className={view === "back" ? "is-active" : ""} onClick={() => onChangeView("back")}>背面</button>
        </div>
        <div className="anatomy-control-group anatomy-control-group--zoom" role="group" aria-label="人体缩放">
          <span>缩放</span>
          <button type="button" aria-label="缩小解剖人体" onClick={() => onChangeZoom(getNextAnatomyZoom(zoom, "out"))}><Minus size={18} weight="bold" />缩小</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" aria-label="放大解剖人体" onClick={() => onChangeZoom(getNextAnatomyZoom(zoom, "in"))}><Plus size={18} weight="bold" />放大</button>
          <button type="button" onClick={resetView}><ArrowsClockwise size={18} weight="bold" />复位</button>
        </div>
      </div>

      <div className="professional-anatomy__legend" aria-label="解剖图例">
        <span><i className="is-region" />当前区域</span>
        <span><i className="is-selected" />已选目标</span>
        <span><i className="is-reference" />其余身体参照</span>
      </div>

      <div className="professional-anatomy__body-grid" aria-label={`${viewLabels[view]}完整人体参照`}>
        <figure className={focusKey ? "is-focused" : ""}>
          <figcaption>{sex === "male" ? "男生" : "女生"} · {viewLabels[view]}</figcaption>
          <div
            className="professional-anatomy__viewport"
            style={{ "--focus-scale": bodyScale, "--focus-x": `${focus.originX}%`, "--focus-y": `${focus.originY}%` }}
          >
            {view === "side" ? (
              <SideAnatomyFigure
                sex={sex}
                regionId={regionId}
                data={bodyData}
                onBodyPartPress={(slug) => handlePress(slug)}
              />
            ) : (
              <Body
                data={bodyData}
                side={view}
                gender={sex}
                defaultFill={getBodyPartFill()}
                defaultStroke="#9aacbf"
                defaultStrokeWidth={1}
                onBodyPartPress={(part, pressedSide) => handlePress(part.slug, pressedSide)}
              />
            )}
          </div>
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
          <p className="professional-anatomy__granularity-note">图形分区可能合并多块肌肉；下方名称列表保留完整选择。</p>
        </div>
        {candidateSelection && (
          <div className="professional-anatomy__candidate-controls" role="group" aria-label="选择精确肌肉">
            <strong>这个区域包含多块肌肉，请选择具体位置</strong>
            <div>
              {candidateSelection.targetIds.map((targetId) => {
                const target = muscleTargets.find((item) => item.id === targetId);
                if (!target) return null;
                return (
                  <button
                    key={target.id}
                    type="button"
                    aria-pressed={selectedIds.includes(target.id)}
                    className={selectedIds.includes(target.id) ? "is-active" : ""}
                    style={{ "--target-color": target.color }}
                    onClick={() => onToggleTarget(target.id, candidateSelection.side)}
                  >
                    <i />{target.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <TargetSelectionList
          targets={targets}
          selectedIds={selectedIds}
          onToggleTarget={onToggleTarget}
          title="本区域全部位置"
        />
        {jointRegionLabels[regionId] && (
          <div className="professional-anatomy__joint-map">
            <h3>{jointRegionLabels[regionId]}具体不适位置</h3>
            <p>先按你实际感受到的位置选择，可与上方肌群同时多选。</p>
            <JointRegionMap regionId={regionId} selectedIds={selectedIds} onToggleTarget={onToggleTarget} />
          </div>
        )}
      </section>

      <p id="professional-anatomy-note">仅用于解剖教育与位置沟通，不提供诊断，也不能替代医生或物理治疗师的个体评估。</p>
    </section>
  );
}
