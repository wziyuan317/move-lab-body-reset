import { Armchair, ArrowRight, Clock, Sparkle, Timer } from "@phosphor-icons/react";
import { getOfficeProgram, officePrograms } from "../officeRoutine.js";
import { OfficeRoutineTimer } from "./OfficeRoutineTimer.jsx";
import { SiteHeader } from "./SiteHeader.jsx";

const cardColors = ["#ff5f69", "#3e7cff", "#27c99a"];

export function OfficeRoutinePage({ programId, onSelectProgram, onNavigate, onOpenSafety }) {
  const program = getOfficeProgram(programId);

  return (
    <div className="office-shell">
      <SiteHeader activeView="office" onNavigate={onNavigate} onOpenSafety={onOpenSafety} />
      <main className="office-main">
        {!program ? (
          <>
            <section className="office-hero">
              <div><span><Sparkle size={18} weight="fill" />OFFICE RESET QUEST</span><h1>给久坐按下暂停键</h1><p>从 5、10、15 分钟里选一条路径。动作、节奏和安全说明均来自已校验的办公室放松内容包。</p></div>
              <div className="office-hero__badge"><Armchair size={38} weight="fill" /><strong>22 个办公室动作</strong><small>覆盖 7 个身体区域</small></div>
            </section>
            <section className="office-programs" aria-label="选择办公室放松课程">
              {officePrograms.map((item, index) => (
                <button key={item.id} type="button" style={{ "--program-color": cardColors[index] }} onClick={() => onSelectProgram(item.id)}>
                  <span className="office-programs__time"><Timer size={31} weight="fill" />{item.durationMinutes}<small>分钟</small></span>
                  <span className="office-programs__copy"><small>{item.items.length} 个动作</small><strong>{item.name}</strong><p>{item.scenario}</p></span>
                  <ArrowRight size={24} weight="bold" />
                </button>
              ))}
            </section>
            <section className="office-principles">
              <Clock size={25} weight="fill" />
              <div><strong>计时会跟随真实经过时间</strong><p>切换浏览器标签后回来，课程会定位到正确动作；暂停后才会冻结时间。</p></div>
            </section>
          </>
        ) : (
          <OfficeRoutineTimer program={program} onBack={() => onSelectProgram(undefined)} />
        )}
      </main>
      <footer id="safety-note" className="home-footer office-footer">
        <p>办公室课程用于日常动作教育，不提供疾病诊断。出现锐痛、麻木、眩晕、放射性不适或症状持续加重时停止，并寻求专业评估。</p>
      </footer>
    </div>
  );
}
