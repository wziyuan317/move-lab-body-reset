import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowsClockwise,
  Eye,
  EyeClosed,
  WarningCircle,
} from "@phosphor-icons/react";
import { bodyRegions, getExplorerResetChange, getModelRegionSelectionChange, getRegionTargets } from "../bodyMap.js";
import { ANATOMY_DEFAULTS } from "../professionalFocus.js";
import { BodyRegionMap } from "./BodyRegionMap.jsx";
import { BodyScene } from "./BodyScene.jsx";
import { JointRegionMap } from "./JointRegionMap.jsx";
import { ModelErrorBoundary } from "./ModelErrorBoundary.jsx";

const ProfessionalAnatomyPanel = lazy(() => import("./ProfessionalAnatomyPanel.jsx"));
const jointMapRegions = new Set(["knee", "shoulder", "ankle"]);

function ProfessionalLoadingStage() {
  return <div className="professional-anatomy-loading" role="status">正在加载专业解剖图…</div>;
}

function ExplorerFallback({ regionId, onSelectRegion }) {
  return (
    <div className="model-fallback">
      <WarningCircle size={30} weight="fill" aria-hidden="true" />
      <strong>3D 模型暂时没有加载成功</strong>
      <p>仍可用下方区域卡和右侧文字选项完成定位。</p>
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

export function BodyExplorer({ regionId, selectedIds, selectedSides, viewSide, onSelectRegion, onToggleTarget, onChangeViewSide }) {
  const [explorerMode, setExplorerMode] = useState("3d");
  const [anatomyPreference, setAnatomyPreference] = useState(ANATOMY_DEFAULTS);

  useEffect(() => {
    setAnatomyPreference((current) => ({ ...current, zoom: ANATOMY_DEFAULTS.zoom }));
  }, [regionId]);

  const selectRegion = (id) => {
    onSelectRegion(getModelRegionSelectionChange(id));
  };

  return (
    <section className="body-explorer" aria-label="身体定位主舞台">
      <div className="body-explorer__mode-tabs" role="tablist" aria-label="身体定位显示模式">
        <button
          type="button"
          role="tab"
          aria-selected={explorerMode === "3d"}
          aria-controls="body-explorer-3d"
          className={explorerMode === "3d" ? "is-active" : ""}
          onClick={() => setExplorerMode("3d")}
        >3D 人体</button>
        <button
          type="button"
          role="tab"
          aria-selected={explorerMode === "anatomy"}
          aria-controls="body-explorer-anatomy"
          className={explorerMode === "anatomy" ? "is-active" : ""}
          onClick={() => setExplorerMode("anatomy")}
        >专业解剖</button>
      </div>

      {explorerMode === "3d" ? (
        <div id="body-explorer-3d" className="body-explorer__mode-panel" role="tabpanel">
          <div className="body-explorer__toolbar">
            <div className="model-view-controls">
              <button type="button" onClick={() => onChangeViewSide(viewSide === "front" ? "back" : "front")}>
                {viewSide === "front" ? <Eye size={19} weight="bold" /> : <EyeClosed size={19} weight="bold" />}
                {viewSide === "front" ? "看背面" : "看正面"}
              </button>
              <button type="button" onClick={() => onSelectRegion(getExplorerResetChange())}>
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
        </div>
      ) : (
        <div id="body-explorer-anatomy" className="body-explorer__mode-panel" role="tabpanel">
          <Suspense fallback={<ProfessionalLoadingStage />}>
            <ProfessionalAnatomyPanel
              regionId={regionId}
              selectedIds={selectedIds}
              selectedSides={selectedSides}
              sex={anatomyPreference.sex}
              view={anatomyPreference.view}
              zoom={anatomyPreference.zoom}
              onChangeSex={(sex) => setAnatomyPreference((current) => ({ ...current, sex }))}
              onChangeView={(view) => setAnatomyPreference((current) => ({ ...current, view }))}
              onChangeZoom={(zoom) => setAnatomyPreference((current) => ({ ...current, zoom }))}
              onToggleTarget={onToggleTarget}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
}

export function BodyLocationSelector({ regionId, selectedIds, selectedSides, viewSide, step, onToggleTarget, onChangeViewSide, onEditLocation }) {
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
  const locationMap = jointMapRegions.has(regionId) ? (
    <JointRegionMap regionId={regionId} selectedIds={selectedIds} onToggleTarget={onToggleTarget} />
  ) : (
    <BodyRegionMap
      regionId={regionId}
      selectedIds={selectedIds}
      selectedSides={selectedSides}
      viewSide={viewSide}
      onToggleTarget={onToggleTarget}
      onChangeViewSide={onChangeViewSide}
    />
  );
  if (step === 3) {
    const selectedTargets = targets.filter((target) => selectedIds.includes(target.id));
    return (
      <section className="location-selector location-selector--summary" aria-label={`${region.label}已选位置摘要`}>
        <header>
          <div><span>已完成定位</span><h2>{region.label}不适</h2></div>
          <small>{selectedTargets.length ? `${selectedTargets.length} 个具体位置` : "大区域"}</small>
        </header>
        <div className="location-selector__summary-tags">
          {(selectedTargets.length ? selectedTargets : [{ id: region.id, label: region.label }]).map((target) => (
            <span key={target.id}>{target.label}</span>
          ))}
        </div>
        <button type="button" className="location-selector__edit" onClick={onEditLocation}>修改具体位置</button>
        <div className="location-selector__mobile-details">
          <p>{region.prompt}。可在位置图中继续增删标记。</p>
          {locationMap}
        </div>
      </section>
    );
  }

  return (
    <section className="location-selector" aria-label={`${region.label}具体位置选择`}>
      <header>
        <div><span>当前选择</span><h2>{region.label}不适</h2></div>
        <small>可多选</small>
      </header>
      <p>{region.prompt}。在位置图或名称列表中继续标记。</p>

      {locationMap}
    </section>
  );
}
