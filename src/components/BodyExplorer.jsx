import { useState } from "react";
import {
  ArrowsClockwise,
  Eye,
  EyeClosed,
  WarningCircle,
} from "@phosphor-icons/react";
import { bodyRegions, getRegionTargets } from "../bodyMap.js";
import { BodyScene } from "./BodyScene.jsx";
import { ModelErrorBoundary } from "./ModelErrorBoundary.jsx";

function ExplorerFallback({ regionId, onSelectRegion }) {
  return (
    <div className="model-fallback">
      <WarningCircle size={30} weight="fill" aria-hidden="true" />
      <strong>3D 模型暂时没有加载成功</strong>
      <p>仍可用下面的文字部位完成定位和教程推荐。</p>
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

export function BodyExplorer({ regionId, selectedIds, onSelectRegion, onToggleTarget }) {
  const [viewSide, setViewSide] = useState("front");
  const targets = getRegionTargets(regionId);

  const selectRegion = (id) => {
    onSelectRegion(id);
    const region = bodyRegions.find((item) => item.id === id);
    if (region) setViewSide(region.hotspot.side);
  };

  return (
    <section className="body-explorer" aria-label="3D 身体定位">
      <div className="body-explorer__toolbar">
        <div className="model-view-controls">
          <button type="button" onClick={() => setViewSide((side) => side === "front" ? "back" : "front")}>
            {viewSide === "front" ? <Eye size={19} weight="bold" /> : <EyeClosed size={19} weight="bold" />}
            {viewSide === "front" ? "看背面" : "看正面"}
          </button>
          <button type="button" onClick={() => { onSelectRegion(undefined); setViewSide("front"); }}>
            <ArrowsClockwise size={19} weight="bold" />重置
          </button>
        </div>
      </div>

      <div
        className="body-canvas-wrap"
        style={{ "--arena-image": `url("${import.meta.env.BASE_URL}assets/models/body-adventure-arena.png")` }}
      >
        <div className="body-canvas-badge">可拖动旋转 · 滚轮缩放</div>
        <ModelErrorBoundary fallback={<ExplorerFallback regionId={regionId} onSelectRegion={selectRegion} />}>
          <BodyScene
            regionId={regionId}
            viewSide={viewSide}
            onSelectRegion={selectRegion}
          />
        </ModelErrorBoundary>
      </div>

      <div className="region-button-grid" aria-label="选择身体大区域">
        {bodyRegions.map((region, index) => (
          <button key={region.id} type="button" className={regionId === region.id ? "is-active" : ""} onClick={() => selectRegion(region.id)}>
            <span>{index + 1}</span>{region.label}
          </button>
        ))}
      </div>

      {regionId && (
        <div className="muscle-selector" aria-label="选择具体不适肌群">
          <div className="muscle-selector__heading">
            <strong>点选具体位置</strong>
            <small>可多选，再点一次取消</small>
          </div>
          <div className="muscle-selector__grid">
            {targets.map((target) => {
              const selected = selectedIds.includes(target.id);
              return (
                <button
                  key={target.id}
                  type="button"
                  className={`${selected ? "is-active" : ""}${target.kind === "joint" ? " is-joint" : ""}`}
                  aria-pressed={selected}
                  onClick={() => onToggleTarget(target.id)}
                >
                  <span className="muscle-swatch" style={{ "--target-color": target.color }} />
                  {target.label}
                  {selected && <b>已选</b>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
