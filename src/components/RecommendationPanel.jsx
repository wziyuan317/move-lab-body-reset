import {
  ArrowRight,
  CheckCircle,
  Info,
  ShieldWarning,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import { anatomyTargets, symptoms } from "../bodyMap.js";
import { movements, selectMovementThumbnail } from "../movements.js";

const sourceLinks = [
  { label: "AAOS 肩袖与肩胛训练", href: "https://orthoinfo.aaos.org/globalassets/pdfs/2024-rotator-cuff-and-shoulder-conditioning-program.pdf" },
  { label: "AAOS 脊柱训练资料", href: "https://orthoinfo.aaos.org/globalassets/pdfs/spine-conditioning-program.pdf" },
  { label: "APTA 临床实践指南", href: "https://www.orthopt.org/content/practice/clinical-practice-guidelines/cpgs" },
  { label: "NICE 腰痛指南", href: "https://www.nice.org.uk/guidance/ng59" },
];

function SuggestedMovement({ movement }) {
  return (
    <article className="suggested-movement">
      <img src={selectMovementThumbnail(movement)} alt="" />
      <span><small>{movement.category} · {movement.duration}</small><strong>{movement.shortTitle}</strong></span>
      <ArrowRight size={20} weight="bold" aria-hidden="true" />
    </article>
  );
}

const guidance = {
  "gentle-mobility": {
    status: "适合从温和活动开始",
    title: "先从舒适范围内的活动开始",
    copy: "这些动作根据你报告的位置和感受匹配，用于日常活动与放松参考，不用于判断疾病或受损组织。",
  },
  "caution-neuro": {
    status: "先谨慎观察变化",
    title: "先用低强度动作，并留意麻木或无力的变化",
    copy: "你报告了麻木或无力。只在舒适范围内做低强度活动；若症状加重、范围扩大或影响日常活动，请停止并寻求专业评估。",
  },
  "caution-swelling": {
    status: "先谨慎观察反应",
    title: "先用低强度动作，并留意肿胀变化",
    copy: "你报告了肿胀。只在舒适范围内做低强度活动；若肿胀或疼痛加重，请停止并寻求专业评估。",
  },
};

export function RecommendationPanel({ region, selectedIds, symptomIds, result, onOpenTutorial }) {
  const selectedTargets = anatomyTargets.filter((target) => selectedIds.includes(target.id));
  const selectedSymptoms = symptoms
    .filter((symptom) => symptomIds.includes(symptom.id))
    .map((symptom) => symptom.label);
  const recommendations = result.movementIds
    .map((id) => movements.find((movement) => movement.id === id))
    .filter(Boolean);

  if (result.status === "blocked") {
    return (
      <aside id="recommendation-panel" className="recommendation-panel recommendation-panel--blocked" aria-live="polite" tabIndex="-1">
        <div className="result-status result-status--danger"><ShieldWarning size={23} weight="fill" />先暂停自我训练</div>
        <h2>这次更适合先做专业评估</h2>
        <p>你勾选的表现需要排除不适合自行练习的情况。先停止会加重症状的动作，并联系医生或物理治疗师；若症状突然严重，请及时就医。</p>
        <div className="blocked-rule"><strong>现在不要硬拉、硬扛或反复测试疼痛。</strong><span>页面不会在此状态下推荐训练动作。</span></div>
      </aside>
    );
  }

  if (result.status === "idle" || result.status === "incomplete") {
    const incomplete = result.status === "incomplete";
    return (
      <aside id="recommendation-panel" className="recommendation-panel" aria-live="polite" tabIndex="-1">
        <div className="result-status"><Info size={22} weight="fill" />{incomplete ? "还差一步" : "从位置开始"}</div>
        <h2>{incomplete ? "接着描述现在的感受" : "先在身体上选择位置"}</h2>
        <p className="result-lead">
          {incomplete
            ? `${region.label}已记录。选择至少一种感受后，才会显示教育性动作建议。`
            : "选择大区域后，再描述感受；完成两步后才会显示匹配的动作教程。"}
        </p>
      </aside>
    );
  }

  const currentGuidance = guidance[result.guidanceKey];

  return (
    <aside id="recommendation-panel" className="recommendation-panel" aria-live="polite" tabIndex="-1">
      <div className="result-status"><CheckCircle size={22} weight="fill" />{currentGuidance.status}</div>
      <h2>{currentGuidance.title}</h2>
      <p className="result-lead">{currentGuidance.copy}</p>

      {selectedTargets.length > 0 && (
        <section className="selected-anatomy">
          <h3><Target size={20} weight="fill" />你标记的位置</h3>
          <div>
            {selectedTargets.map((target) => (
              <span key={target.id}><i style={{ "--target-color": target.color }} />{target.label}</span>
            ))}
          </div>
          <p>这些是位置标签，不代表已经确定疼痛来源。</p>
        </section>
      )}

      <section className="why-card">
        <h3><Info size={20} weight="fill" />匹配依据</h3>
        <p>你选择了 {region.label}{selectedSymptoms.length ? `，并描述为${selectedSymptoms.join("、")}` : ""}。建议按舒适范围、由少到多尝试，不把位置标签当作诊断结论。</p>
      </section>

      {recommendations.length > 0 && (
        <section className="recommendation-list">
          <div className="recommendation-list__heading"><strong>匹配的教程</strong><small>先选 1 个，舒适完成</small></div>
          {recommendations.map((movement) => (
            <SuggestedMovement key={movement.id} movement={movement} />
          ))}
          <button type="button" className="library-cta" onClick={() => onOpenTutorial(recommendations[0].id)}>
            从第一个匹配动作开始
          </button>
        </section>
      )}

      <div className="stop-note"><Sparkle size={20} weight="fill" /><span><strong>以舒适为边界</strong>出现锐痛、麻木、头晕、明显不稳或症状持续加重时停止。</span></div>

      <details className="evidence-details">
        <summary>查看依据与边界</summary>
        <p>内容参考权威运动骨科与物理治疗指南，但没有替代面对面的病史、体格检查和个体诊疗。</p>
        <div>{sourceLinks.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}</a>)}</div>
      </details>
    </aside>
  );
}
