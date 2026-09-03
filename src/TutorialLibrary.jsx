import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
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
import {
  filterMovements,
  getMovementFrames,
  movements,
  selectMovementFrame,
  selectMovementThumbnail,
} from "./movements.js";
import {
  buildMovementDetailModel,
  getLibraryFilterOptions,
} from "./tutorialLibraryModel.js";
import { SiteHeader } from "./components/SiteHeader.jsx";

const MAX_IMAGE_RETRIES = 1;

function LazyMovementImage({ src, alt, className = "", compact = false }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  if (failed) {
    if (compact) {
      return <span className="movement-image-error is-compact" aria-label="图片加载失败">图片</span>;
    }
    return (
      <div className="movement-image-error" role="status">
        <span>图片暂时没有加载出来</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setAttempt(0);
            setFailed(false);
          }}
        >
          重新加载
        </button>
      </div>
    );
  }

  const retrySeparator = src.includes("?") ? "&" : "?";
  const resolvedSrc = attempt === 0 ? src : `${src}${retrySeparator}retry=${attempt}`;

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (attempt < MAX_IMAGE_RETRIES) {
          setAttempt((current) => current + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

function MovementCard({ movement, active, onSelect }) {
  const systemMovement = movement.collection === "system";
  return (
    <button
      type="button"
      className={`movement-card${active ? " is-active" : ""}`}
      onClick={() => onSelect(movement.id)}
      aria-pressed={active}
    >
      <span className="movement-card__image">
        <LazyMovementImage src={selectMovementThumbnail(movement)} alt="" compact />
      </span>
      <span className="movement-card__body">
        <span className={`movement-card__collection movement-card__collection--${movement.collection}`}>
          {movement.collectionLabel}
        </span>
        <span className="movement-card__category">{movement.category}</span>
        <strong>{movement.shortTitle}</strong>
        <span className="movement-card__meta">
          <Clock size={16} weight="bold" aria-hidden="true" />
          {systemMovement ? `${movement.actionType} · ${movement.difficulty}` : movement.duration}
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
      <p>可搜索动作名称、章节、部位或肌肉名称。</p>
      <button type="button" onClick={onReset}>清除筛选</button>
    </div>
  );
}

function ContentValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
      </ul>
    );
  }
  return <p>{value}</p>;
}

function SystemMovementDetails({ model, onSelectMovement }) {
  const sectionById = Object.fromEntries(model.sections.map((item) => [item.id, item]));
  const steps = sectionById.steps;
  const standardSections = model.sections.filter((item) => ![
    "steps",
    "stop-conditions",
    "contraindications",
    "risk-warnings",
  ].includes(item.id));
  const safetySections = model.sections.filter((item) => [
    "stop-conditions",
    "contraindications",
    "risk-warnings",
  ].includes(item.id));

  return (
    <div className="instruction-column instruction-column--system">
      <section className="system-overview" aria-label="动作定位">
        <div>
          <small>适用部位</small>
          <div className="detail-tags">
            {model.bodyAreas.map((area) => <span key={area}>{area}</span>)}
          </div>
        </div>
        <div>
          <small>主要目标肌肉</small>
          <div className="detail-tags detail-tags--muscle">
            {model.primaryMuscles.map((muscle) => <span key={muscle}>{muscle}</span>)}
          </div>
        </div>
        {model.secondaryMuscles.length > 0 && (
          <div>
            <small>次要目标肌肉</small>
            <div className="detail-tags detail-tags--secondary">
              {model.secondaryMuscles.map((muscle) => <span key={muscle}>{muscle}</span>)}
            </div>
          </div>
        )}
      </section>

      <section className="steps-block steps-block--system">
        <div className="section-heading">
          <span>{steps.label}</span>
          <small>按真实顺序完成</small>
        </div>
        <ol>
          {steps.value.map((step, index) => (
            <li key={`${index}-${step}`}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="system-detail-grid">
        {standardSections.map((section) => (
          <section key={section.id} className={`detail-field detail-field--${section.tone}`}>
            <h3>{section.label}</h3>
            <ContentValue value={section.value} />
          </section>
        ))}
      </div>

      <section className="safety-stack" aria-label="安全边界">
        <div className="section-heading">
          <span>安全边界</span>
          <small>出现下列情况不要继续</small>
        </div>
        {safetySections.map((section) => (
          <div key={section.id} className={`safety-field safety-field--${section.tone}`}>
            <WarningCircle size={22} weight="fill" aria-hidden="true" />
            <div>
              <h3>{section.label}</h3>
              <ContentValue value={section.value} />
            </div>
          </div>
        ))}
      </section>

      <details className="source-trace" open>
        <summary>来源追溯与内容边界</summary>
        <div className="source-trace__grid">
          <p><strong>PDF 页码</strong>{model.sources.pdfPages.join("、")}</p>
          <p><strong>书内页码</strong>{model.sources.bookPages.join("、")}</p>
          <p><strong>页面 ID</strong>{model.sources.pageIds.join("、")}</p>
        </div>
        <ul>
          {model.sources.pageReferences.map((reference) => (
            <li key={reference.页面ID}>
              {reference.页面ID} · PDF 第 {reference.PDF页码} 页 · {reference.摘要文件}
            </li>
          ))}
        </ul>
        {model.informationBasis && (
          <div className="content-basis">
            <p><strong>原书提取字段</strong>{model.informationBasis.原书提取字段.join("、")}</p>
            <p><strong>规范化补充字段</strong>{model.informationBasis.规范化补充字段.join("、")}</p>
            <p><strong>安全补充字段</strong>{model.informationBasis.安全补充字段.join("、")}</p>
          </div>
        )}
        {model.reviewStatus.map((item) => (
          <div className="review-boundary" key={`${item.复核类型}-${item.对象ID}`}>
            <WarningCircle size={20} weight="fill" aria-hidden="true" />
            <p><strong>{item.状态} · {item.复核类型}</strong>{item.原因}</p>
          </div>
        ))}
      </details>

      {model.relatedMovements.length > 0 && (
        <section className="related-movements">
          <div className="section-heading">
            <span>相关推荐</span>
            <small>由内容包关联索引提供</small>
          </div>
          <div className="related-movements__grid">
            {model.relatedMovements.map(({ movement, reason }) => (
              <button key={movement.id} type="button" onClick={() => onSelectMovement(movement.id)}>
                <span>{movement.chapter ?? movement.category}</span>
                <strong>{movement.title}</strong>
                <small>{reason}</small>
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OfficeMovementDetails({ movement }) {
  return (
    <div className="instruction-column">
      <section className="info-block info-block--principle">
        <h3><Info size={22} weight="fill" aria-hidden="true" />为什么这样做</h3>
        <p>{movement.principle}</p>
      </section>

      <section className="steps-block">
        <div className="section-heading"><span>怎么放松</span><small>稳定 → 移动 → 呼吸</small></div>
        <ol>
          {movement.steps.map((step, index) => (
            <li key={`${index}-${step}`}><span>{index + 1}</span><p>{step}</p></li>
          ))}
        </ol>
      </section>

      <section className="benefits-block">
        <h3>这样做的好处</h3>
        <ul>
          {movement.benefits.map((benefit) => (
            <li key={benefit}><CheckCircle size={20} weight="fill" aria-hidden="true" />{benefit}</li>
          ))}
        </ul>
      </section>

      <div className="cue-strip">
        <Sparkle size={22} weight="fill" aria-hidden="true" />
        <p><strong>动作要点</strong>{movement.cue}</p>
      </div>

      <div className="warning-strip">
        <WarningCircle size={24} weight="fill" aria-hidden="true" />
        <p><strong>什么时候要停</strong>{movement.stop}</p>
      </div>
    </div>
  );
}

function MovementDetail({ movement, phase, onPhaseChange, onSelectMovement }) {
  const model = buildMovementDetailModel(movement, movements);
  const activePhase = model.frames.some((frame) => frame.id === phase)
    ? phase
    : model.frames[0]?.id;
  const frame = selectMovementFrame(movement, activePhase);
  const activeFrame = model.frames.find((item) => item.id === activePhase);

  return (
    <article className="detail" aria-live="polite">
      <header className="detail__header">
        <div>
          <span className={`collection-label collection-label--${movement.collection}`}>{movement.collectionLabel}</span>
          <span className="eyebrow"><Target size={18} weight="fill" aria-hidden="true" />{movement.category} · {movement.actionType}</span>
          <h2>{movement.title}</h2>
          <div className="muscle-tags" aria-label="目标肌群">
            {movement.muscles.map((muscle) => <span key={muscle}>{muscle}</span>)}
          </div>
        </div>
        <div className="dose-badge">
          <Clock size={22} weight="fill" aria-hidden="true" />
          <span><small>建议节奏</small><strong>{movement.duration}</strong></span>
        </div>
      </header>

      <div className="detail__grid">
        <section className="visual-panel" aria-label="动作示意">
          <div className="visual-panel__topline">
            <span><Sparkle size={19} weight="fill" aria-hidden="true" />看清动作标准</span>
            <span className="intensity-pill">{movement.intensity}</span>
          </div>

          {model.frames.length > 1 && (
            <div className={`frame-switch frame-switch--${model.frames.length}`} role="group" aria-label="动作状态">
              {model.frames.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={activePhase === item.id ? "is-active" : ""}
                  onClick={() => onPhaseChange(item.id)}
                  aria-pressed={activePhase === item.id}
                >
                  <span>{index + 1}</span>{item.label}
                </button>
              ))}
            </div>
          )}

          <div className="movement-stage">
            <LazyMovementImage
              key={`${movement.id}-${activePhase}`}
              src={frame}
              alt={`${movement.title} · ${activeFrame?.label ?? "动作示意"}`}
            />
          </div>
          <p className="visual-legend">
            <span className="legend-dot legend-dot--red" />红色：目标肌肉
            <span className="legend-dot legend-dot--blue" />蓝色：动作方向
            <span className="legend-dot legend-dot--yellow" />黄色：稳定提示
          </p>
        </section>

        {movement.collection === "system" ? (
          <SystemMovementDetails model={model} onSelectMovement={onSelectMovement} />
        ) : (
          <OfficeMovementDetails movement={movement} />
        )}
      </div>
    </article>
  );
}

export function TutorialLibrary({ initialMovementId, onNavigateHome, onNavigate, onOpenSafety, onSelectMovement }) {
  const filterOptions = useMemo(() => getLibraryFilterOptions(movements), []);
  const movementListRef = useRef(null);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("全部");
  const [difficulty, setDifficulty] = useState("all");
  const [movementType, setMovementType] = useState("all");
  const [selectedId, setSelectedId] = useState(initialMovementId ?? movements[0].id);
  const [phase, setPhase] = useState("start");

  useEffect(() => {
    if (!initialMovementId || !movements.some((item) => item.id === initialMovementId)) return;
    const movement = movements.find((item) => item.id === initialMovementId);
    setSelectedId(initialMovementId);
    setCollection(movement.collection);
    setCategory("全部");
    setPhase(getMovementFrames(movement)[0]?.id ?? "start");
  }, [initialMovementId]);

  useEffect(() => {
    const list = movementListRef.current;
    const activeCard = list?.querySelector('.movement-card[aria-pressed="true"]');
    if (!list || !activeCard) return;
    const cardTop = activeCard.offsetTop;
    const cardBottom = cardTop + activeCard.offsetHeight;
    const cardLeft = activeCard.offsetLeft;
    const cardRight = cardLeft + activeCard.offsetWidth;
    if (cardTop < list.scrollTop) list.scrollTop = cardTop;
    else if (cardBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = cardBottom - list.clientHeight;
    }
    if (cardLeft < list.scrollLeft) list.scrollLeft = cardLeft;
    else if (cardRight > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = cardRight - list.clientWidth;
    }
  }, [selectedId, collection]);

  const categoryOptions = useMemo(() => {
    const scoped = collection === "all" ? movements : movements.filter((item) => item.collection === collection);
    return [...new Set(scoped.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  }, [collection]);

  const filtered = useMemo(
    () => filterMovements(movements, { query, category, collection, difficulty, movementType }),
    [query, category, collection, difficulty, movementType],
  );
  const activeMovement = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  const selectMovement = (id) => {
    const movement = movements.find((item) => item.id === id);
    setSelectedId(id);
    setPhase(getMovementFrames(movement)[0]?.id ?? "start");
    onSelectMovement?.(id);
    document.querySelector("#top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCollection = (id) => {
    setCollection(id);
    setCategory("全部");
    setDifficulty("all");
    setMovementType("all");
    setPhase("start");
  };

  const resetFilters = () => {
    setQuery("");
    setCollection("all");
    setCategory("全部");
    setDifficulty("all");
    setMovementType("all");
  };

  return (
    <div className="library-page">
      <SiteHeader activeView="library" onNavigate={onNavigate} onOpenSafety={onOpenSafety} />
      <div className="app-shell">
        <aside className="sidebar">
          <button className="brand brand--button" type="button" onClick={onNavigateHome} aria-label="返回身体定位首页">
            <span className="brand__mark"><PersonSimple size={30} weight="fill" aria-hidden="true" /></span>
            <span><strong>MOVE LAB</strong><small>身体放松图鉴</small></span>
          </button>

          <div className="sidebar__label">按章节 / 部位筛选</div>
          <nav className="category-nav" aria-label="动作章节与身体部位">
            {["全部", ...categoryOptions].map((item, index) => (
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
                {index === 0 ? <SquaresFour size={21} weight="fill" aria-hidden="true" /> : <Target size={21} weight="bold" aria-hidden="true" />}
                {item === "全部" ? "全部章节" : item}
              </button>
            ))}
          </nav>

          <div className="sidebar__note">
            <WarningCircle size={23} weight="fill" aria-hidden="true" />
            <p><strong>以舒适为边界</strong>拉伸感可以，锐痛、麻木、头晕不可以。</p>
          </div>
        </aside>

        <main className="main" id="top">
          <header className="topbar">
            <div>
              <button type="button" className="back-home-button" onClick={onNavigateHome}>
                <ArrowLeft size={18} weight="bold" aria-hidden="true" />返回身体定位
              </button>
              <span className="topbar__kicker">MOVE LAB ACTION ATLAS</span>
              <h1>98 个动作，一处查清</h1>
              <p className="topbar__lead">办公室改善保留原有 15 个动作，系统拉伸库新增 83 个书籍动作。</p>
            </div>
            <label className="search-box">
              <MagnifyingGlass size={22} weight="bold" aria-hidden="true" />
              <span className="sr-only">搜索动作、章节、部位或肌肉</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索动作、章节、部位或肌肉"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
                  <X size={18} weight="bold" aria-hidden="true" />
                </button>
              )}
            </label>
          </header>

          <section className="collection-switch" aria-label="内容类型">
            {filterOptions.collections.map((item) => (
              <button
                key={item.id}
                type="button"
                className={collection === item.id ? "is-active" : ""}
                onClick={() => selectCollection(item.id)}
                aria-pressed={collection === item.id}
              >
                <span>{item.label}</span><strong>{item.count}</strong>
              </button>
            ))}
            <div className="library-selects">
              <label>
                <span>难度</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                  <option value="all">全部难度</option>
                  {filterOptions.difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>形式</span>
                <select value={movementType} onChange={(event) => setMovementType(event.target.value)}>
                  <option value="all">全部形式</option>
                  {filterOptions.movementTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </section>

          <div className="mobile-categories" aria-label="移动端章节筛选">
            {["全部", ...categoryOptions].map((item) => (
              <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>

          <section className="workspace" aria-label="动作库与详情">
            <aside className="movement-list">
              <div className="movement-list__heading">
                <div><small>{category === "全部" ? "动作库" : category}</small><strong>{filtered.length} 个动作</strong></div>
                <span>{query ? `搜索：${query}` : "点击查看完整指引"}</span>
              </div>
              <div className="movement-list__items" ref={movementListRef}>
                {filtered.map((movement) => (
                  <MovementCard key={movement.id} movement={movement} active={activeMovement?.id === movement.id} onSelect={selectMovement} />
                ))}
                {filtered.length === 0 && <EmptyState onReset={resetFilters} />}
              </div>
            </aside>

            {activeMovement && (
              <MovementDetail movement={activeMovement} phase={phase} onPhaseChange={setPhase} onSelectMovement={selectMovement} />
            )}
          </section>

          <footer className="footer-note">
            <Info size={22} weight="fill" aria-hidden="true" />
            <p>本页用于日常动作教育，不代替诊断或个体化康复。系统拉伸库中的 83 个动作上线前仍需运动康复或医疗专业人员复核；有明确损伤、手术史、持续加重疼痛或神经症状时，请先接受专业评估。</p>
            <div className="source-links">
              <a href="https://orthoinfo.aaos.org/globalassets/pdfs/spine-conditioning-program.pdf" target="_blank" rel="noreferrer">AAOS 脊柱训练资料</a>
              <a href="https://www.orthopt.org/content/s/neck-pain-2017" target="_blank" rel="noreferrer">APTA 颈痛指南</a>
              <a href="https://www.nice.org.uk/guidance/ng59/chapter/Recommendations" target="_blank" rel="noreferrer">NICE 腰痛指南</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
