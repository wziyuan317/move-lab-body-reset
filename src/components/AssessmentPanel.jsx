import { Check, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { getTaskSummary } from "../homeFlow.js";

export function AssessmentPanel({ region, step, activeStep = step, selectedTargets = [], selectedSymptoms = [], result, onRequestStep }) {
  const summary = getTaskSummary({
    regionLabel: region?.label,
    targetLabels: selectedTargets.map((target) => target.label),
    symptomLabels: selectedSymptoms.map((symptom) => symptom.label),
    resultStatus: result.status,
  });
  const locationLockedCopy = "先完成上一步，选择位置后解锁";
  const steps = [
    { id: 1, done: Boolean(region), current: activeStep === 1, label: "选择位置", detail: summary.location, disabled: false },
    { id: 2, done: selectedSymptoms.length > 0, current: activeStep === 2, label: "描述感受", detail: region ? summary.feeling : locationLockedCopy, disabled: !region },
    { id: 3, done: step === 3, current: activeStep === 3, label: "获得建议", detail: region ? summary.recommendation : locationLockedCopy, disabled: step !== 3 },
  ];
  const safetyLabel = result.status === "blocked"
    ? "已触发暂停训练提示"
    : result.status === "caution"
      ? "建议采用更低强度"
      : "当前未发现已勾选红旗";

  return (
    <aside className="assessment-panel" data-step={step}>
      <div className="quest-label">BODY QUEST</div>
      <h2>定位身体信号</h2>
      <p>右侧会按顺序完成位置、感受和建议；这里保留任务进度与任务摘要。</p>

      <ol className="quest-steps">
        {steps.map((item) => (
          <li
            key={item.id}
            className={`${item.done && item.id !== 3 ? "is-done" : ""}${item.current ? " is-current" : ""}${item.disabled ? " is-disabled" : ""}`}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              aria-label={`${item.label}：${item.detail}`}
              disabled={item.disabled}
              onClick={() => onRequestStep(item.id)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, background: "transparent", border: 0, cursor: item.disabled ? "not-allowed" : "pointer", zIndex: 1 }}
            />
            <span>{item.done && item.id !== 3 ? <Check size={18} weight="bold" /> : item.id}</span>
            <div><strong>{item.label}</strong><small>{item.detail}</small></div>
          </li>
        ))}
      </ol>

      <section className="task-summary" aria-label="任务摘要">
        <h3>任务摘要</h3>
        <dl>
          <div><dt>位置</dt><dd>{summary.location}</dd></div>
          <div><dt>感受</dt><dd>{summary.feeling}</dd></div>
          <div><dt>建议</dt><dd>{summary.recommendation}</dd></div>
        </dl>
      </section>

      <div className={`assessment-safety${result.status === "blocked" ? " is-blocked" : ""}`}>
        <WarningCircle size={20} weight="fill" />{safetyLabel}
      </div>
      <div className="education-note">
        <ShieldCheck size={21} weight="fill" aria-hidden="true" />
        <span>定位代表你报告的不适位置，不等于疼痛来源或受损组织。</span>
      </div>
    </aside>
  );
}
