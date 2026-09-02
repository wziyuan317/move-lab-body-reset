import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  anatomyTargets,
  bodyRegions,
  getExplorerStep,
  getRecommendations,
  symptoms,
  toggleTargetSelection,
} from "./bodyMap.js";
import { AssessmentPanel } from "./components/AssessmentPanel.jsx";
import { BodyExplorer } from "./components/BodyExplorer.jsx";
import { LocationTaskPanel } from "./components/LocationTaskPanel.jsx";
import { RegionRail } from "./components/RegionRail.jsx";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { getMissionDisplayStep, getStepFocusSelector } from "./homeFlow.js";

function normalizeSides(value) {
  return (Array.isArray(value) ? value : [value]).filter((side) => side === "left" || side === "right");
}

export function HomePage({ value, onChange, onOpenTutorial, onOpenLibrary, onNavigate, onOpenSafety }) {
  const region = bodyRegions.find((item) => item.id === value.regionId);
  const result = useMemo(() => getRecommendations(value), [value]);
  const selectedTargets = anatomyTargets.filter((target) => value.targetIds.includes(target.id));
  const selectedSymptoms = symptoms.filter((symptom) => value.symptomIds.includes(symptom.id));
  const explorerStep = getExplorerStep(value);
  const [mobileStep, setMobileStep] = useState(explorerStep);
  const [locationExpanded, setLocationExpanded] = useState(false);
  const pendingFocusSelector = useRef();
  const missionDisplayStep = getMissionDisplayStep({ explorerStep, requestedStep: mobileStep });

  useEffect(() => {
    const selector = pendingFocusSelector.current;
    if (!selector) return undefined;
    pendingFocusSelector.current = undefined;
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(selector);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [mobileStep]);

  const update = (patch) => onChange({ ...value, ...patch });
  const selectRegion = (change) => {
    setLocationExpanded(false);
    if (!change.regionId) setMobileStep(1);
    update(change);
  };
  const requestStep = (requestedStep) => {
    if (requestedStep === 2 && !region) return;
    if (requestedStep === 3 && explorerStep !== 3) return;
    if (requestedStep === 3) setLocationExpanded(false);
    pendingFocusSelector.current = getStepFocusSelector(requestedStep);
    setMobileStep(requestedStep);
  };

  const toggleTarget = (targetId, side) => {
    const targetIds = value.targetIds ?? [];
    const targetSides = { ...(value.targetSides ?? {}) };
    const selected = targetIds.includes(targetId);

    if (!side) {
      const nextIds = toggleTargetSelection(targetIds, targetId);
      if (!nextIds.includes(targetId)) delete targetSides[targetId];
      update({ targetIds: nextIds, targetSides });
      return;
    }

    const sides = normalizeSides(targetSides[targetId]);
    const nextSides = sides.includes(side) ? sides.filter((item) => item !== side) : [...sides, side];
    if (selected && sides.includes(side) && nextSides.length === 0) {
      delete targetSides[targetId];
      update({ targetIds: targetIds.filter((id) => id !== targetId), targetSides });
      return;
    }
    targetSides[targetId] = nextSides.length === 1 ? nextSides[0] : nextSides;
    update({ targetIds: selected ? targetIds : [...targetIds, targetId], targetSides });
  };

  const canAdvance = mobileStep === 1 ? Boolean(region) : mobileStep === 2 ? explorerStep === 3 : false;

  return (
    <div className="home-shell">
      <SiteHeader activeView="home" onNavigate={onNavigate} onOpenSafety={onOpenSafety} />

      <main id="body-map" className="home-main">
        <div className="location-workspace" data-mobile-step={mobileStep}>
          <aside className={`mission-column mission-column--step-${missionDisplayStep}`}>
            <div className="mission-banner">
              <small>今日任务</small>
              <strong>定位不适</strong>
              <span>找到问题，才能更好改善</span>
            </div>
            <AssessmentPanel
              region={region}
              step={explorerStep}
              activeStep={missionDisplayStep}
              selectedTargets={selectedTargets}
              selectedSymptoms={selectedSymptoms}
              result={result}
              onRequestStep={requestStep}
            />
          </aside>

          <div className="character-stage">
            <BodyExplorer
              regionId={value.regionId}
              selectedIds={value.targetIds}
              selectedSides={value.targetSides}
              viewSide={value.viewSide}
              onSelectRegion={selectRegion}
              onToggleTarget={toggleTarget}
              onChangeViewSide={(viewSide) => update({ viewSide })}
            />
          </div>

          <aside className={`result-column result-column--step-${explorerStep}${region ? "" : " is-empty"}`}>
            <LocationTaskPanel
              region={region}
              value={value}
              explorerStep={explorerStep}
              locationExpanded={locationExpanded}
              result={result}
              onUpdate={update}
              onToggleTarget={toggleTarget}
              onOpenTutorial={onOpenTutorial}
              onEditLocation={() => setLocationExpanded(true)}
            />
          </aside>
        </div>

        <div id="region-rail">
          <RegionRail regionId={value.regionId} onSelectRegion={(regionId) => selectRegion({ regionId })} />
        </div>
      </main>

      <div className="mobile-step-control" aria-label="移动端步骤控制">
        <button type="button" className="mobile-step-control__back" disabled={mobileStep === 1} onClick={() => requestStep(mobileStep - 1)} aria-label="上一步">
          <ArrowLeft size={21} weight="bold" />
        </button>
        <span><small>第 {mobileStep} / 3 步</small><strong>{mobileStep === 1 ? "选择位置" : mobileStep === 2 ? "描述感受" : "查看建议"}</strong></span>
        {mobileStep < 3 ? (
          <button type="button" className="mobile-step-control__next" disabled={!canAdvance} onClick={() => requestStep(mobileStep + 1)}>
            下一步<ArrowRight size={20} weight="bold" />
          </button>
        ) : (
          <button type="button" className="mobile-step-control__next" onClick={() => requestStep(2)}>调整感受</button>
        )}
      </div>

      <footer id="safety-note" className="home-footer">
        <p>本页用于日常动作教育与位置记录，不提供疾病诊断，不替代医生或物理治疗师的个体评估。</p>
        <p>
          当前 3D 角色：Man Player，作者 RiverofCreative（
          <a href="https://sketchfab.com/3d-models/man-player-4c7133dbb06e4136891d59231372d818" target="_blank" rel="noreferrer">原作品</a>
          {" · "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
          ）；模型字节未修改，仅变更文件名。专业参考图：react-muscle-highlighter；Legacy Z-Anatomy 仅本地审计。
        </p>
      </footer>
    </div>
  );
}
