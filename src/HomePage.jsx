import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  PersonSimple,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  bodyRegions,
  getExplorerStep,
  getRecommendations,
  toggleTargetSelection,
} from "./bodyMap.js";
import { AssessmentPanel } from "./components/AssessmentPanel.jsx";
import { BodyExplorer, BodyLocationSelector } from "./components/BodyExplorer.jsx";
import { RecommendationPanel } from "./components/RecommendationPanel.jsx";
import { RegionRail } from "./components/RegionRail.jsx";

function normalizeSides(value) {
  return (Array.isArray(value) ? value : [value]).filter((side) => side === "left" || side === "right");
}

export function HomePage({ value, onChange, onOpenTutorial, onOpenLibrary }) {
  const region = bodyRegions.find((item) => item.id === value.regionId);
  const result = useMemo(() => getRecommendations(value), [value]);
  const explorerStep = getExplorerStep(value);
  const [mobileStep, setMobileStep] = useState(explorerStep);
  const [locationExpanded, setLocationExpanded] = useState(false);

  const update = (patch) => onChange({ ...value, ...patch });
  const selectRegion = (regionId) => {
    setLocationExpanded(false);
    update({ regionId });
  };
  const requestStep = (requestedStep) => {
    if (requestedStep === 2 && !region) return;
    if (requestedStep === 3 && explorerStep !== 3) return;
    if (requestedStep === 3) setLocationExpanded(false);
    setMobileStep(requestedStep);
    const selector = requestedStep === 1
      ? ".region-rail button"
      : requestedStep === 2
        ? ".choice-grid button:not(:disabled)"
        : "#recommendation-panel";
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus();
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
      <header className="home-nav">
        <a className="home-brand" href="#body-map" aria-label="MOVE LAB 身体定位首页">
          <span><PersonSimple size={30} weight="fill" /></span>
          <div><strong>MOVE LAB</strong><small>身体放松图鉴</small></div>
        </a>
        <nav aria-label="主要导航">
          <a href="#body-map" className="is-active">身体定位</a>
          <button type="button" onClick={onOpenLibrary} disabled={result.status === "blocked"}>动作库</button>
          <a href="#safety-note">安全说明</a>
        </nav>
        <div className="home-nav__status"><ShieldCheck size={19} weight="fill" />日常动作教育</div>
      </header>

      <main id="body-map" className="home-main">
        <div className="location-workspace" data-mobile-step={mobileStep}>
          <aside className={`mission-column mission-column--step-${explorerStep}`}>
            <div className="mission-banner">
              <small>今日任务</small>
              <strong>定位不适</strong>
              <span>找到问题，才能更好改善</span>
            </div>
            <AssessmentPanel
              region={region}
              step={explorerStep}
              symptomIds={value.symptomIds}
              redFlagIds={value.redFlagIds}
              onChangeSymptoms={(symptomIds) => update({ symptomIds })}
              onChangeRedFlags={(redFlagIds) => update({ redFlagIds })}
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

          <aside className={`result-column result-column--step-${explorerStep}`}>
            <BodyLocationSelector
              regionId={value.regionId}
              selectedIds={value.targetIds}
              selectedSides={value.targetSides}
              viewSide={value.viewSide}
              step={explorerStep === 3 && !locationExpanded ? 3 : 2}
              onToggleTarget={toggleTarget}
              onChangeViewSide={(viewSide) => update({ viewSide })}
              onEditLocation={() => setLocationExpanded(true)}
            />
            <RecommendationPanel
              region={region}
              selectedIds={value.targetIds}
              symptomIds={value.symptomIds}
              result={result}
              onOpenTutorial={onOpenTutorial}
            />
          </aside>
        </div>

        <div id="region-rail">
          <RegionRail regionId={value.regionId} onSelectRegion={selectRegion} />
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
