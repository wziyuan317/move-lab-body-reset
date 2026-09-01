import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  PersonSimple,
  Sparkle,
} from "@phosphor-icons/react";
import {
  bodyRegions,
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

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="home-shell">
      <header className="home-nav">
        <a className="home-brand" href="#body-map" aria-label="MOVE LAB 身体定位首页">
          <span><PersonSimple size={30} weight="fill" /></span>
          <div><strong>MOVE LAB</strong><small>BODY RESET STATION</small></div>
        </a>
        <nav aria-label="主要导航">
          <a href="#body-map" className="is-active">身体定位</a>
          <button type="button" onClick={() => onOpenTutorial()}>动作教程</button>
        </nav>
        <button type="button" className="library-cta" onClick={() => onOpenTutorial()}>
          <BookOpen size={19} weight="bold" />打开 15 个教程
        </button>
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
            symptomIds={value.symptomIds}
            redFlagIds={value.redFlagIds}
            onChangeSymptoms={(symptomIds) => update({ symptomIds })}
            onChangeRedFlags={(redFlagIds) => update({ redFlagIds })}
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
            result={result}
            onOpenTutorial={onOpenTutorial}
          />
        </div>

        <section className="home-tutorial-band">
          <div><small>ALREADY KNOW WHAT YOU NEED?</small><strong>也可以直接进入完整动作库</strong><p>搜索颈部、肩胛、腰背、膝盖等部位，查看动作原理、过程图、到位标准、好处和停止条件。</p></div>
          <button type="button" onClick={() => onOpenTutorial()}><span>浏览全部教程</span><ArrowRight size={23} weight="bold" /></button>
        </section>
      </main>

      <footer className="home-footer">
        <p>本页用于日常动作教育与位置记录，不提供疾病诊断，不替代医生或物理治疗师的个体评估。</p>
        <p>3D：Quaternius CC0 · Z-Anatomy / hpfrei CC BY-SA 4.0</p>
      </footer>
    </div>
  );
}
