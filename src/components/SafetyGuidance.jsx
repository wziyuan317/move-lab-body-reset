import { CheckCircle, FirstAid, HandPalm } from "@phosphor-icons/react";

export function SafetyGuidance() {
  return (
    <section id="safety-note" className="safety-guidance" aria-labelledby="safety-guidance-title">
      <header>
        <div>
          <small>SAFE MOVEMENT</small>
          <h2 id="safety-guidance-title">开始前，先看清身体给出的信号</h2>
        </div>
        <p>拉伸应该是可控制的牵拉，不需要忍痛完成。</p>
      </header>

      <div className="safety-guidance__grid">
        <article className="is-ready">
          <CheckCircle size={28} weight="fill" aria-hidden="true" />
          <div>
            <h3>可以开始</h3>
            <ul>
              <li>以轻柔、可控制的幅度进入动作。</li>
              <li>目标是轻到中等、稳定的牵拉感；疼痛不是动作有效的证明。</li>
              <li>按当下活动能力调整幅度和时长，不与示范者比较。</li>
            </ul>
          </div>
        </article>

        <article className="is-stop">
          <HandPalm size={28} weight="fill" aria-hidden="true" />
          <div>
            <h3>立即停止</h3>
            <ul>
              <li>出现锐痛、麻木、电击样感觉、明显头晕或不稳定。</li>
              <li>出现胸部不适、呼吸异常，或症状向远端扩散。</li>
              <li>症状在动作中持续加重，停止后仍不缓解。</li>
            </ul>
          </div>
        </article>

        <article className="is-assess">
          <FirstAid size={28} weight="fill" aria-hidden="true" />
          <div>
            <h3>先接受专业评估</h3>
            <ul>
              <li>近期有明显外伤、肿胀、变形，或无法正常承重或使用该部位。</li>
              <li>无力或麻木进行性加重，或出现其他令人担心的神经症状。</li>
              <li>不确定动作是否适合已有疾病、术后状态或当前伤情。</li>
            </ul>
          </div>
        </article>
      </div>

      <div className="safety-guidance__boundary">
        <strong>内容与边界</strong>
        <p>轻柔牵拉、疼痛不是验证标准及异常感觉应停止等原则，参考项目内《拉伸解剖学》整理内容；红旗与转诊提示是网站补充的通用风险边界，不是书中逐字内容。</p>
        <p>本区用于运动教育与风险提示，不提供诊断，也不能替代医生或物理治疗师的个体评估。</p>
        <div>
          <a href="https://orthoinfo.aaos.org/globalassets/pdfs/spine-conditioning-program_3-20-25.pdf" target="_blank" rel="noreferrer">AAOS《Spine Conditioning Program》（2025-03-20）</a>
          <a href="https://www.nice.org.uk/guidance/NG59/chapter/recommendations" target="_blank" rel="noreferrer">NICE NG59 Recommendations（更新于 2020-12-11）</a>
        </div>
      </div>
    </section>
  );
}
