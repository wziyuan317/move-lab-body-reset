import { useEffect, useMemo, useState } from "react";
import {
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
  CheckCircle,
  ClockCountdown,
  Pause,
  Play,
  ShieldWarning,
} from "@phosphor-icons/react";
import {
  advanceRoutineState,
  createRoutineState,
  getOfficeAction,
  getRoutineProgress,
  moveRoutine,
  pauseRoutine,
  resetRoutine,
  resumeRoutine,
} from "../officeRoutine.js";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function DetailList({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="office-action-detail__list">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

export function OfficeRoutineTimer({ program, onBack }) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [routineState, setRoutineState] = useState(() => createRoutineState(program, Date.now()));

  useEffect(() => {
    const now = Date.now();
    setNowMs(now);
    setRoutineState(createRoutineState(program, now));
  }, [program]);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      setNowMs(now);
      setRoutineState((state) => advanceRoutineState(state, program, now));
    };
    const interval = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [program]);

  const progress = getRoutineProgress(routineState, program, nowMs);
  const currentItem = program.items[progress.itemIndex];
  const action = getOfficeAction(currentItem.actionId);
  const enrichedItems = useMemo(() => program.items.map((item) => ({ ...item, action: getOfficeAction(item.actionId) })), [program]);
  const needsReview = action.reviewStatus?.includes("上线前需专业复核");

  const pauseOrResume = () => {
    const now = Date.now();
    setNowMs(now);
    setRoutineState((state) => state.status === "playing"
      ? pauseRoutine(state, program, now)
      : resumeRoutine(state, program, now));
  };
  const move = (direction) => {
    const now = Date.now();
    setNowMs(now);
    setRoutineState((state) => moveRoutine(state, program, direction, now));
  };
  const restart = () => {
    const now = Date.now();
    setNowMs(now);
    setRoutineState(resetRoutine(program, now));
  };

  return (
    <div className="office-player">
      <section className="office-action-detail" aria-labelledby="office-action-title">
        <div className="office-action-visual">
          <img src={`${import.meta.env.BASE_URL}assets/office/office-action-pending.png`} alt="穿运动服的办公室动作引导人物，当前动作原创示意图仍在制作中。" />
          <span>原创动作图制作中</span>
        </div>
        <div className="office-action-detail__heading">
          <div>
            <small>动作 {progress.itemIndex + 1} / {program.items.length} · {action.type}</small>
            <h2 id="office-action-title" aria-live="polite">{action.name}</h2>
            <p>{currentItem.guidance}</p>
          </div>
          {needsReview && <strong className="office-review-badge"><ShieldWarning size={18} weight="fill" />上线前待复核</strong>}
        </div>

        <section className="office-action-start">
          <h3>起始姿势</h3>
          <p>{action.startPosition}</p>
        </section>
        <section className="office-action-steps">
          <h3>跟着做</h3>
          <ol>{action.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
        </section>
        <div className="office-action-notes">
          <section><h3>呼吸与强度</h3><p>{action.breathing}</p><p>{action.intensity}</p></section>
          <section><h3>更简单的版本</h3><p>{action.simplifiedVersion}</p></section>
        </div>
        <DetailList title="常见错误" items={action.commonMistakes} />
        <DetailList title="出现这些情况请停止" items={action.stopConditions} />
        <DetailList title="不适用情况" items={action.contraindications} />
        <details className="office-source-details">
          <summary>内容来源与复核状态</summary>
          <p>{action.reviewStatus}</p>
          <p>{action.source.chapter}；PDF 页码：{action.source.pdfPages.join("、")}；书内页码：{action.source.bookPages.join("、")}。</p>
        </details>
      </section>

      <aside className="office-timer-panel" aria-label={`${program.name}课程计时器`}>
        <button className="office-back-button" type="button" onClick={onBack}><CaretLeft size={18} weight="bold" />重新选课程</button>
        <div className="office-timer-card">
          <span><ClockCountdown size={21} weight="fill" />当前动作</span>
          <strong>{formatTime(progress.actionRemaining)}</strong>
          <small>整套剩余 {formatTime(progress.totalRemaining)}</small>
          <div className="office-progress" aria-label={`课程进度 ${Math.round(progress.percent)}%`}><i style={{ width: `${progress.percent}%` }} /></div>
        </div>
        <div className="office-timer-controls">
          <button type="button" onClick={() => move(-1)} disabled={progress.itemIndex === 0} aria-label="上一个动作"><CaretLeft size={22} weight="bold" /><span>上一个</span></button>
          <button className="is-primary" type="button" onClick={routineState.status === "completed" ? restart : pauseOrResume}>
            {routineState.status === "playing" ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
            {routineState.status === "playing" ? "暂停" : routineState.status === "completed" ? "重新开始" : "继续"}
          </button>
          <button type="button" onClick={() => move(1)} disabled={progress.itemIndex === program.items.length - 1} aria-label="下一个动作"><CaretRight size={22} weight="bold" /><span>下一个</span></button>
        </div>
        <button className="office-reset-button" type="button" onClick={restart}><ArrowCounterClockwise size={19} weight="bold" />重新开始</button>

        <ol className="office-queue" aria-label="课程动作列表">
          {enrichedItems.map((item, index) => (
            <li key={item.actionId} className={`${index === progress.itemIndex ? "is-current" : ""}${index < progress.itemIndex ? " is-complete" : ""}`}>
              <span>{index < progress.itemIndex ? <CheckCircle size={19} weight="fill" /> : index + 1}</span>
              <div><strong>{item.action.name}</strong><small>{item.seconds} 秒 · {item.guidance}</small></div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
