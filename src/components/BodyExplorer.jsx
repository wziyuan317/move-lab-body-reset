import { lazy, Suspense, useState } from "react";
import {
  ArrowsClockwise,
  Eye,
  EyeClosed,
  PersonSimpleRun,
  WarningCircle,
} from "@phosphor-icons/react";
import { bodyRegions, getRegionTargets } from "../bodyMap.js";
import { BodyRegionMap } from "./BodyRegionMap.jsx";
import { BodyScene } from "./BodyScene.jsx";
import { JointRegionMap } from "./JointRegionMap.jsx";
import { ModelErrorBoundary } from "./ModelErrorBoundary.jsx";

const ProfessionalAnatomyPanel = lazy(() => import("./ProfessionalAnatomyPanel.jsx"));
const jointMapRegions = new Set(["knee", "shoulder", "ankle"]);

function ExplorerFallback({ regionId, onSelectRegion }) {
  return (
    <div className="model-fallback">
      <WarningCircle size={30} weight="fill" aria-hidden="true" />
      <strong>3D 模型暂时没有加载成功</strong>
      <p>仍可用下方区域卡和右侧位置图完成定位。</p>
      <div className="fallback-regions">
        {bodyRegions.map((region) => (
          <button key={region.id} type="button" className={regionId === region.id ? "is-active" : ""} onClick={() => onSelectRegion(region.id)}>
            {region.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BodyExplorer({ regionId, selectedIds, viewSide, onSelectRegion, onToggleTarget, onChangeViewSide }) {
  const [professionalOpen, setProfessionalOpen] = useState(false);

  const selectRegion = (id) => {
    onSelectRegion(id);
    const region = bodyRegions.find((item) => item.id === id);
    if (region) onChangeViewSide(region.hotspot.side);
  };

  return (
    <section className="body-explorer" aria-label="3D 身体定位">
      <div className="body-explorer__toolbar">
        <button className="professional-mode-button" type="button" onClick={() => setProfessionalOpen(true)} disabled={!regionId}>
          <PersonSimpleRun size={19} weight="bold" />专业解剖模式
        </button>
        <div className="model-view-controls">
          <button type="button" onClick={() => onChangeViewSide(viewSide === "front" ? "back" : "front")}>
            {viewSide === "front" ? <Eye size={19} weight="bold" /> : <EyeClosed size={19} weight="bold" />}
            {viewSide === "front" ? "看背面" : "看正面"}
          </button>
          <button type="button" onClick={() => { onSelectRegion(undefined); onChangeViewSide("front"); }}>
            <ArrowsClockwise size={19} weight="bold" />重置
          </button>
        </div>
      </div>

      <div
        className="body-canvas-wrap"
        style={{ "--arena-image": `url("${import.meta.env.BASE_URL}assets/models/body-adventure-arena.png")` }}
      >
        <div className="body-canvas-badge">点击身体热点选择区域 · 可拖动旋转</div>
        <ModelErrorBoundary fallback={<ExplorerFallback regionId={regionId} onSelectRegion={selectRegion} />}>
          <BodyScene regionId={regionId} viewSide={viewSide} onSelectRegion={selectRegion} />
        </ModelErrorBoundary>
      </div>

      {professionalOpen && (
        <Suspense fallback={<div className="professional-anatomy professional-anatomy--loading" role="status">正在进入专业解剖模式…</div>}>
          <ProfessionalAnatomyPanel
            regionId={regionId}
            selectedIds={selectedIds}
            onToggleTarget={onToggleTarget}
            onClose={() => setProfessionalOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
}

export function BodyLocationSelector({ regionId, selectedIds, selectedSides, viewSide, onToggleTarget, onChangeViewSide }) {
  const region = bodyRegions.find((item) => item.id === regionId);
  if (!region) {
    return (
      <section className="location-selector location-selector--empty">
        <span>当前选择</span>
        <h2>先选择不适区域</h2>
        <p>点击中央人物热点，或使用底部区域卡开始定位。</p>
      </section>
    );
  }

  const targets = getRegionTargets(regionId);
  return (
    <section className="location-selector" aria-label={`${region.label}具体位置选择`}>
      <header>
        <div><span>当前选择</span><h2>{region.label}不适</h2></div>
        <small>可多选</small>
      </header>
      <p>{region.prompt}。在完整身体图或位置列表中继续标记。</p>

      <BodyRegionMap
        regionId={regionId}
        selectedIds={selectedIds}
        selectedSides={selectedSides}
        viewSide={viewSide}
        onToggleTarget={onToggleTarget}
        onChangeViewSide={onChangeViewSide}
      />

      {jointMapRegions.has(regionId) && (
        <JointRegionMap regionId={regionId} selectedIds={selectedIds} onToggleTarget={onToggleTarget} />
      )}

      {!jointMapRegions.has(regionId) && (
        <div className="location-selector__list" role="group" aria-label="具体位置名称列表">
          {targets.map((target) => {
            const selected = selectedIds.includes(target.id);
            return (
              <button
                key={target.id}
                type="button"
                className={selected ? "is-active" : ""}
                aria-pressed={selected}
                onClick={() => onToggleTarget(target.id)}
              >
                <i style={{ "--target-color": target.color }} />{target.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
