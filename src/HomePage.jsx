import { useMemo } from "react";
import {
  PersonSimple,
  Sparkle,
} from "@phosphor-icons/react";
import {
  bodyRegions,
  getExplorerStep,
  getRecommendations,
  toggleTargetSelection,
} from "./bodyMap.js";
import { AssessmentPanel } from "./components/AssessmentPanel.jsx";
import { BodyExplorer } from "./components/BodyExplorer.jsx";
import { RecommendationPanel } from "./components/RecommendationPanel.jsx";

export function HomePage({ value, onChange, onOpenTutorial }) {
  const region = bodyRegions.find((item) => item.id === value.regionId);
  const result = useMemo(
    () => getRecommendations(value),
    [value],
  );
  const explorerStep = getExplorerStep(value);

  const update = (patch) => onChange({ ...value, ...patch });
  const requestStep = (requestedStep) => {
    if (requestedStep === 3 && explorerStep !== 3) return;
    const selector = requestedStep === 1
      ? ".region-button-grid button"
      : requestedStep === 2
        ? ".choice-grid button:not(:disabled)"
        : "#recommendation-panel";
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus();
  };

  return (
    <div className="home-shell">
      <header className="home-nav">
        <a className="home-brand" href="#body-map" aria-label="MOVE LAB 身体定位首页">
          <span><PersonSimple size={30} weight="fill" /></span>
          <div><strong>MOVE LAB</strong><small>BODY RESET STATION</small></div>
        </a>
        <nav aria-label="主要导航">
          <a href="#body-map" className="is-active">身体定位</a>
        </nav>
      </header>

      <main id="body-map" className="home-main">
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkle size={17} weight="fill" />YOUR BODY ADVENTURE MAP</span>
            <h1>哪里不舒服？<br /><em>在身体上找到它</em></h1>
            <p>选择区域后，人体会放大并显示真实肌肉网格。你可以同时标记多块肌肉，再进入对应的办公室放松与训练教程。</p>
          </div>
          <div className="hero-mission">
            <span>今日任务</span>
            <strong>给身体 3 分钟换挡</strong>
            <small>位置 → 感受 → 建议</small>
          </div>
        </section>

        <div className="explorer-layout">
          <AssessmentPanel
            region={region}
            step={explorerStep}
            symptomIds={value.symptomIds}
            redFlagIds={value.redFlagIds}
            onChangeSymptoms={(symptomIds) => update({ symptomIds })}
            onChangeRedFlags={(redFlagIds) => update({ redFlagIds })}
            onRequestStep={requestStep}
          />

          <BodyExplorer
            regionId={value.regionId}
            selectedIds={value.targetIds}
            onSelectRegion={(regionId) => update({ regionId })}
            onToggleTarget={(targetId) => update({ targetIds: toggleTargetSelection(value.targetIds, targetId) })}
          />

          <RecommendationPanel
            region={region}
            selectedIds={value.targetIds}
            symptomIds={value.symptomIds}
            result={result}
            onOpenTutorial={onOpenTutorial}
          />
        </div>
      </main>

      <footer className="home-footer">
        <p>本页用于日常动作教育与位置记录，不提供疾病诊断，不替代医生或物理治疗师的个体评估。</p>
        <p>3D：Quaternius CC0 · Z-Anatomy / hpfrei CC BY-SA 4.0</p>
      </footer>
    </div>
  );
}
