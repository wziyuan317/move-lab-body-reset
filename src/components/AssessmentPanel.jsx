import { Check, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { redFlags, symptoms } from "../bodyMap.js";

function toggle(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function AssessmentPanel({ region, symptomIds, redFlagIds, onChangeSymptoms, onChangeRedFlags }) {
  return (
    <aside className="assessment-panel">
      <div className="quest-label">BODY QUEST</div>
      <h2>定位身体信号</h2>
      <p>先标记位置，再描述感受。这里帮助你找教程，不判断疾病。</p>

      <ol className="quest-steps">
        <li className={region ? "is-done" : "is-current"}>
          <span>{region ? <Check size={18} weight="bold" /> : "1"}</span>
          <div><strong>选择位置</strong><small>{region ? region.label : "在人体或文字区点选"}</small></div>
        </li>
        <li className={region ? "is-current" : ""}>
          <span>2</span>
          <div><strong>描述感受</strong><small>可以同时选择多个</small></div>
        </li>
        <li className={region && symptomIds.length ? "is-current" : ""}>
          <span>3</span>
          <div><strong>获得建议</strong><small>匹配原有动作教程</small></div>
        </li>
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
