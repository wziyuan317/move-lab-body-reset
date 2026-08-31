import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Info,
  MagnifyingGlass,
  PersonSimple,
  Sparkle,
  SquaresFour,
  Target,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { filterMovements, movements, selectMovementFrame } from "./movements.js";

const categories = ["全部", "颈部", "斜方肌", "胸椎", "胸肩", "肩胛", "腰背", "臀髋", "膝盖", "侧链"];

function MovementCard({ movement, active, onSelect }) {
  return (
    <button
      type="button"
      className={`movement-card${active ? " is-active" : ""}`}
      onClick={() => onSelect(movement.id)}
      aria-pressed={active}
    >
      <span className="movement-card__image">
        <img src={movement.image} alt="" />
      </span>
      <span className="movement-card__body">
        <span className="movement-card__category">{movement.category}</span>
        <strong>{movement.shortTitle}</strong>
        <span className="movement-card__meta">
          <Clock size={16} weight="bold" aria-hidden="true" />
          {movement.duration}
        </span>
      </span>
      <ArrowRight className="movement-card__arrow" size={20} weight="bold" aria-hidden="true" />
    </button>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="empty-state">
      <MagnifyingGlass size={34} weight="bold" aria-hidden="true" />
      <strong>没找到对应动作</strong>
      <p>试试“肩胛”、“膝盖”、“腰背”或“久坐”。</p>
      <button type="button" onClick={onReset}>清除筛选</button>
    </div>
  );
}

function MovementDetail({ movement, phase, onPhaseChange }) {
  const frame = selectMovementFrame(movement, phase);
  const hasFrames = Boolean(movement.frames);

  return (
    <article className="detail" aria-live="polite">
      <header className="detail__header">
        <div>
          <span className="eyebrow">
            <Target size={18} weight="fill" aria-hidden="true" />
            {movement.category} · 动作指引
          </span>
          <h2>{movement.title}</h2>
          <div className="muscle-tags" aria-label="目标肌群">
            {movement.muscles.map((muscle) => (
              <span key={muscle}>{muscle}</span>
            ))}
          </div>
        </div>
        <div className="dose-badge">
          <Clock size={22} weight="fill" aria-hidden="true" />
          <span>
            <small>建议节奏</small>
            <strong>{movement.duration}</strong>
          </span>
        </div>
      </header>

      <div className="detail__grid">
        <section className="visual-panel" aria-label="动作示意">
          <div className="visual-panel__topline">
            <span>
              <Sparkle size={19} weight="fill" aria-hidden="true" />
              看清动作标准
            </span>
            <span className="intensity-pill">{movement.intensity}</span>
          </div>

          {hasFrames && (
            <div className="frame-switch" role="group" aria-label="动作状态">
              <button
                type="button"
                className={phase === "start" ? "is-active" : ""}
                onClick={() => onPhaseChange("start")}
                aria-pressed={phase === "start"}
              >
                <span>1</span>起始状态
              </button>
              <button
                type="button"
                className={phase === "end" ? "is-active" : ""}
                onClick={() => onPhaseChange("end")}
                aria-pressed={phase === "end"}
              >
                <span>2</span>到位状态
              </button>
            </div>
          )}

          <div className="movement-stage">
            <img
              src={frame}
              alt={`${movement.title}${hasFrames ? (phase === "start" ? "起始状态" : "到位状态") : "动作示意"}`}
            />
          </div>
          <p className="visual-legend">
            <span className="legend-dot legend-dot--red" />红色：主要伸展区域
            <span className="legend-dot legend-dot--blue" />蓝色：动作方向
            <span className="legend-dot legend-dot--yellow" />黄色：稳定 / 放松提示
          </p>
        </section>

        <div className="instruction-column">
          <section className="info-block info-block--principle">
            <h3>
              <Info size={22} weight="fill" aria-hidden="true" />
              为什么这样做
            </h3>
            <p>{movement.principle}</p>
          </section>

          <section className="steps-block">
            <div className="section-heading">
              <span>怎么放松</span>
              <small>稳定 → 移动 → 呼吸</small>
            </div>
            <ol>
              {movement.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="benefits-block">
            <h3>这样做的好处</h3>
            <ul>
              {movement.benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckCircle size={20} weight="fill" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <div className="cue-strip">
            <Sparkle size={22} weight="fill" aria-hidden="true" />
            <p>
              <strong>动作要点</strong>
              {movement.cue}
            </p>
          </div>

          <div className="warning-strip">
            <WarningCircle size={24} weight="fill" aria-hidden="true" />
            <p>
              <strong>什么时候要停</strong>
              {movement.stop}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selectedId, setSelectedId] = useState(movements[0].id);
  const [phase, setPhase] = useState("start");

  const filtered = useMemo(
    () => filterMovements(movements, { query, category }),
    [query, category],
  );
  const activeMovement = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  const selectMovement = (id) => {
    setSelectedId(id);
    setPhase("start");
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("全部");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="MOVE LAB 首页">
          <span className="brand__mark">
            <PersonSimple size={30} weight="fill" aria-hidden="true" />
          </span>
          <span>
            <strong>MOVE LAB</strong>
            <small>身体放松图鉴</small>
          </span>
        </a>

        <div className="sidebar__label">按部位找动作</div>
        <nav className="category-nav" aria-label="身体部位">
          {categories.map((item, index) => (
            <button
              key={item}
              type="button"
              className={category === item ? "is-active" : ""}
              onClick={() => {
                setCategory(item);
                setPhase("start");
              }}
              aria-pressed={category === item}
            >
              {index === 0 ? (
                <SquaresFour size={21} weight="fill" aria-hidden="true" />
              ) : (
                <Target size={21} weight="bold" aria-hidden="true" />
              )}
              {item === "全部" ? "全部动作" : item}
            </button>
          ))}
        </nav>

        <div className="sidebar__note">
          <WarningCircle size={23} weight="fill" aria-hidden="true" />
          <p>
            <strong>以舒适为边界</strong>
            拉伸感可以，锐痛、麻木、头晕不可以。
          </p>
        </div>
      </aside>

      <main className="main" id="top">
        <header className="topbar">
          <div>
            <span className="topbar__kicker">DAILY MOVE RESET</span>
            <h1>今天想松哪里？</h1>
            <p className="topbar__lead">每坐 30 分钟，给身体 1 分钟换挡。</p>
          </div>
          <label className="search-box">
            <MagnifyingGlass size={22} weight="bold" aria-hidden="true" />
            <span className="sr-only">搜索动作或身体部位</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索动作、肌肉或久坐问题"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            )}
          </label>
        </header>

        <div className="mobile-categories" aria-label="移动端部位筛选">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "is-active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="workspace" aria-label="动作库与详情">
          <aside className="movement-list">
            <div className="movement-list__heading">
              <div>
                <small>{category === "全部" ? "动作库" : category}</small>
                <strong>{filtered.length} 个动作</strong>
              </div>
              <span>{query ? `搜索：${query}` : "点击查看指引"}</span>
            </div>
            <div className="movement-list__items">
              {filtered.map((movement) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  active={activeMovement?.id === movement.id}
                  onSelect={selectMovement}
                />
              ))}
              {filtered.length === 0 && <EmptyState onReset={resetFilters} />}
            </div>
          </aside>

          {activeMovement && (
            <MovementDetail movement={activeMovement} phase={phase} onPhaseChange={setPhase} />
          )}
        </section>

        <footer className="footer-note">
          <Info size={22} weight="fill" aria-hidden="true" />
          <p>
            本页用于日常动作教育，不代替诊断或个体化康复。有明确损伤、手术史、持续加重的疼痛或神经症状时，请先请医生或物理治疗师评估。
          </p>
          <div className="source-links">
            <a href="https://orthoinfo.aaos.org/globalassets/pdfs/spine-conditioning-program.pdf" target="_blank" rel="noreferrer">
              AAOS 脊柱训练资料
            </a>
            <a href="https://www.orthopt.org/content/s/neck-pain-2017" target="_blank" rel="noreferrer">
              APTA 颈痛指南
            </a>
            <a href="https://www.nice.org.uk/guidance/ng59/chapter/Recommendations" target="_blank" rel="noreferrer">
              NICE 腰痛与坐骨神经痛指南
            </a>
            <a href="https://orthoinfo.aaos.org/globalassets/pdfs/2022-rotator-cuff-and-shoulder-conditioning-program.pdf" target="_blank" rel="noreferrer">
              AAOS 肩袖与肩胛训练
            </a>
            <a href="https://orthoinfo.aaos.org/globalassets/pdfs/2017-rehab_knee.pdf" target="_blank" rel="noreferrer">
              AAOS 膝关节训练
            </a>
            <a href="https://www.newcastle-hospitals.nhs.uk/services/newcastle-occupational-health-service/information-for-staff/physiotherapy/self-help-leaflets/1-minute-body-check/" target="_blank" rel="noreferrer">
              NHS 办公室 1 分钟活动
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
