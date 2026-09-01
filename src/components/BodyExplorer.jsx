import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowsClockwise,
  Eye,
  EyeClosed,
  PersonSimpleRun,
  WarningCircle,
} from "@phosphor-icons/react";
import { bodyRegions, getExplorerResetChange, getModelRegionSelectionChange, getRegionTargets } from "../bodyMap.js";
import { BodyRegionMap } from "./BodyRegionMap.jsx";
import { BodyScene } from "./BodyScene.jsx";
import { JointRegionMap } from "./JointRegionMap.jsx";
import { ModelErrorBoundary } from "./ModelErrorBoundary.jsx";

const ProfessionalAnatomyPanel = lazy(() => import("./ProfessionalAnatomyPanel.jsx"));
const jointMapRegions = new Set(["knee", "shoulder", "ankle"]);

function ProfessionalLoadingDialog({ onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    closeButtonRef.current?.focus();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="professional-anatomy professional-anatomy--loading"
      aria-label="正在进入专业解剖模式"
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
        onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={() => {
          dialogRef.current?.close();
          onClose();
        }}
        aria-label="关闭专业解剖模式"
      >
        关闭
      </button>
      <div role="status">正在进入专业解剖模式…</div>
    </dialog>
  );
}

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

export function BodyExplorer({ regionId, selectedIds, selectedSides, viewSide, onSelectRegion, onToggleTarget, onChangeViewSide }) {
  const [professionalOpen, setProfessionalOpen] = useState(false);
  const professionalTriggerRef = useRef(null);

  const selectRegion = (id) => {
    onSelectRegion(getModelRegionSelectionChange(id));
  };
  const closeProfessional = () => {
    setProfessionalOpen(false);
    requestAnimationFrame(() => professionalTriggerRef.current?.focus());
  };

  return (
    <section className="body-explorer" aria-label="3D 身体定位">
      <div className="body-explorer__toolbar">
        <button ref={professionalTriggerRef} className="professional-mode-button" type="button" onClick={() => setProfessionalOpen(true)} disabled={!regionId}>
          <PersonSimpleRun size={19} weight="bold" />专业解剖模式
        </button>
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

      {professionalOpen && (
        <Suspense fallback={<ProfessionalLoadingDialog onClose={closeProfessional} />}>
          <ProfessionalAnatomyPanel
            regionId={regionId}
            selectedIds={selectedIds}
            selectedSides={selectedSides}
            onToggleTarget={onToggleTarget}
            onClose={closeProfessional}
          />
        </Suspense>
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
