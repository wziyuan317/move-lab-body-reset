import { Check, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { redFlags, symptoms } from "../bodyMap.js";

function toggle(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function AssessmentPanel({ region, step, symptomIds, redFlagIds, onChangeSymptoms, onChangeRedFlags, onRequestStep }) {
  const selectedSymptoms = symptoms
    .filter((symptom) => symptomIds.includes(symptom.id))
    .map((symptom) => symptom.label)
    .join("、");
  const steps = [
    { id: 1, done: Boolean(region), current: step === 1, label: "选择位置", detail: region ? region.label : "在人体或文字区点选", disabled: false },
    { id: 2, done: symptomIds.length > 0, current: step === 2, label: "描述感受", detail: selectedSymptoms || "可以同时选择多个", disabled: !region },
    { id: 3, done: step === 3, current: step === 3, label: "获得建议", detail: step === 3 ? "查看匹配依据与动作" : "完成感受后可查看", disabled: step !== 3 },
  ];

  return (
    <aside className="assessment-panel">
      <div className="quest-label">BODY QUEST</div>
      <h2>定位身体信号</h2>
      <p>先标记位置，再描述感受。这里帮助你找教程，不判断疾病。</p>

      <ol className="quest-steps">
        {steps.map((item) => (
          <li
            key={item.id}
            className={`${item.done && item.id !== 3 ? "is-done" : ""}${item.current ? " is-current" : ""}`}
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

      <div className="assessment-group">
        <div className="assessment-group__title">
          <strong>现在是什么感觉？</strong><small>可多选</small>
        </div>
        <div className="choice-grid">
          {symptoms.map((symptom) => (
            <button
              key={symptom.id}
              type="button"
              disabled={!region}
              className={symptomIds.includes(symptom.id) ? "is-active" : ""}
              aria-pressed={symptomIds.includes(symptom.id)}
              onClick={() => onChangeSymptoms(toggle(symptomIds, symptom.id))}
            >
              {symptom.label}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="safety-check">
        <legend><WarningCircle size={20} weight="fill" />先确认这些情况</legend>
        {redFlags.map((flag) => (
          <label key={flag.id}>
            <input
              type="checkbox"
              checked={redFlagIds.includes(flag.id)}
              onChange={() => onChangeRedFlags(toggle(redFlagIds, flag.id))}
            />
            <span>{flag.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="education-note">
        <ShieldCheck size={21} weight="fill" aria-hidden="true" />
        <span>定位代表你报告的不适位置，不等于疼痛来源或受损组织。</span>
      </div>
    </aside>
  );
}
