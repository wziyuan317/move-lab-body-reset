import {
  ArrowRight,
  CheckCircle,
  Info,
  ShieldWarning,
  Sparkle,
  Target,
} from "@phosphor-icons/react";
import { anatomyTargets } from "../bodyMap.js";
import { movements, selectMovementThumbnail } from "../movements.js";

const sourceLinks = [
  { label: "AAOS 肩袖与肩胛训练", href: "https://orthoinfo.aaos.org/globalassets/pdfs/2024-rotator-cuff-and-shoulder-conditioning-program.pdf" },
  { label: "AAOS 脊柱训练资料", href: "https://orthoinfo.aaos.org/globalassets/pdfs/spine-conditioning-program.pdf" },
  { label: "APTA 临床实践指南", href: "https://www.orthopt.org/content/practice/clinical-practice-guidelines/cpgs" },
  { label: "NICE 腰痛指南", href: "https://www.nice.org.uk/guidance/ng59" },
];

function SuggestedMovement({ movement, onOpen }) {
  return (
    <button type="button" className="suggested-movement" onClick={() => onOpen(movement.id)}>
      <img src={selectMovementThumbnail(movement)} alt="" />
      <span><small>{movement.category} · {movement.duration}</small><strong>{movement.shortTitle}</strong></span>
      <ArrowRight size={20} weight="bold" aria-hidden="true" />
    </button>
  );
}

export function RecommendationPanel({ region, selectedIds, result, onOpenTutorial }) {
  const selectedTargets = anatomyTargets.filter((target) => selectedIds.includes(target.id));
  const recommendations = result.movementIds
    .map((id) => movements.find((movement) => movement.id === id))
    .filter(Boolean);

  if (result.status === "blocked") {
    return (
      <aside className="recommendation-panel recommendation-panel--blocked" aria-live="polite">
        <div className="result-status result-status--danger"><ShieldWarning size={23} weight="fill" />先暂停自我训练</div>
        <h2>这次更适合先做专业评估</h2>
        <p>你勾选的表现需要排除不适合自行练习的情况。先停止会加重症状的动作，并联系医生或物理治疗师；若症状突然严重，请及时就医。</p>
        <div className="blocked-rule"><strong>现在不要硬拉、硬扛或反复测试疼痛。</strong><span>页面不会在此状态下推荐训练动作。</span></div>
      </aside>
    );
  }

  return (
    <aside className="recommendation-panel" aria-live="polite">
      <div className="result-status"><CheckCircle size={22} weight="fill" />教育性运动建议</div>
      <h2>{region ? `${region.label}可以从这里开始` : "先在人体上选择位置"}</h2>
      <p className="result-lead">
        {region
          ? "以下内容根据你标记的位置匹配，适合一般的日常活动与放松参考。"
          : "选择大区域后，模型会放大并显示可点击的真实肌肉网格。"}
      </p>

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

      {region && (
        <section className="why-card">
          <h3><Info size={20} weight="fill" />为什么从这些动作开始</h3>
          <p>办公室久坐常让局部保持同一负荷，同时减少相邻关节和肌群的活动。温和活动、渐进负荷与舒适范围内的练习，可以帮助恢复活动选择并提高耐受。</p>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="recommendation-list">
          <div className="recommendation-list__heading"><strong>匹配的教程</strong><small>先选 1 个，舒适完成</small></div>
          {recommendations.map((movement) => (
            <SuggestedMovement key={movement.id} movement={movement} onOpen={onOpenTutorial} />
          ))}
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
