# Design QA：3D 身体定位首页

## 比较对象

- Source visual truth：`/Users/bevol-1/.codex/generated_images/01a056d7-c4ca-72c1-91b7-e924a2a8ccfe/exec-b3d72858-25fb-4049-b9a6-909cf5e8055e.png`
- Implementation URL：`http://127.0.0.1:5173/`
- Desktop full page：`qa/body-home-desktop.png`
- Desktop viewport：`qa/body-home-desktop-viewport.png`
- Muscle multi-select：`qa/body-muscle-selected.png`
- Mobile full page：`qa/body-home-mobile.png`
- Combined comparison：`qa/body-home-comparison.png`
- State：默认身体定位首页；focused state 为“肩胛 / 肩”并多选“中下斜方肌、菱形肌”。

## 视口与归一化

- Source：`1486 × 1059 px`。
- Desktop viewport override：`1440 × 1100 CSS px`；应用内浏览器可见区截图为 `1265 × 712 px`，完整页面另存为 `1265 × 1337 px`。
- Muscle focused screenshot：`1425 × 1089 px`。
- Mobile viewport override：`390 × 844 CSS px`；完整页面截图为 `375 × 2477 px`；`scrollWidth = clientWidth = 390`，无文档级横向溢出。
- Comparison board：源图与实现首屏各自等比归一到 `900 px` 高后并排；未把不同 density 当成设计缺陷。

## Full-view comparison evidence

- 信息架构：确认稿的任务步骤、中央人体、右侧建议和底部部位入口均已实现；实现额外保留了安全分流和 15 个教程入口。
- 字体与层级：继续使用项目既有中文系统字体；超大标题、英文 kicker、任务卡、步骤编号和按钮层级与确认稿一致，长中文没有截断。
- 间距与节奏：桌面保持左 / 中 / 右三栏；人体舞台为最强视觉中心；移动端按人体、步骤、结果顺序堆叠。
- 颜色与 tokens：深海军蓝、亮黄、珊瑚红、运动蓝、薄荷绿、白色卡片与粗描边 / 硬阴影映射确认稿的多巴胺游戏感。
- 图片质量：舞台使用独立生成的无人物 / 无文字夜间运动场资产；着装模型、真实肌肉 GLB 和所有原教程动作图均为真实文件，没有 CSS / div / inline SVG 替代图。
- Copy：首页明确“位置记录，不是诊断”；红旗文案、停止条件、来源和 15 个教程内容完整保留。

## Focused region comparison evidence

- 选择“肩胛 / 肩”后自动切换肌肉地图；仅显示三角肌、冈下肌、中下斜方肌、菱形肌和前锯肌真实网格，并按可区分色标展示。
- 直接点击 Canvas 中三角肌网格后，文字列表出现“已选”，证明不是近似圆点替代肌肉点击。
- 文字列表可同时选中“中下斜方肌、菱形肌”，再次点击只取消当前项；推荐合并为“肩胛收紧、墙面推撑、站姿开胸”。
- 膝盖放大后提供股直肌远端、股内侧肌、股外侧肌、膝后肌群，以及膝前 / 内侧 / 外侧 / 后区和“无法确定”共 9 个目标。
- 红旗状态显示“先暂停自我训练”，推荐区域中训练 CTA 数量为 0。
- 从膝前区进入“坐姿主动伸膝”教程，再用浏览器返回，`region=knee`、`targets=knee-front` 和感受选择完整恢复。

## Findings

- 当前没有可执行的 P0 / P1 / P2 问题。
- [P3] 确认稿使用写实人物，实现采用 CC0 低多边形着装人体。它仍是可旋转的真实 3D 网格，性能和中性隐私表达更适合首版；后续可替换同骨骼写实模型而不改变交互数据。
- [P3] 默认结果卡比确认稿更保守，在未选位置时不预填“膝部不适”。这是医疗安全边界和真实状态要求导致的可接受差异。

## Comparison history

1. 首次对照发现 P1：实现为浅色通用仪表板，缺少确认稿的夜间运动冒险场氛围。
   - Fix：通过 ImageGen 生成无人物、无文字的夜间城市运动场资产，3D 舞台使用真实图片，页面底色改为深海军蓝。
   - Post-fix evidence：`qa/body-home-comparison.png` 中舞台、深色外壳、黄 / 红 / 蓝 / 绿节奏与确认稿同向。
2. 首次模型检查发现 P1：原 GLB 保存了步行动画姿势，人物侧身且双臂位置不符合已确认 A-pose。
   - Fix：运行时调用 skeleton bind pose，按配套 CC0 姿态脚本的世界 X 轴逻辑调整双上臂为约 30° 外展，并使用浅色全身运动服材质。
   - Post-fix evidence：`qa/body-home-desktop.png` 为正面站立、双臂自然打开，肩和腋下可点击。
3. 首次区域选择发现 P1：肩胛肌群在放大后位于画布上缘且尺寸偏小。
   - Fix：肌肉场景只用当前可见网格计算 bounding box，重新居中并按目标网格范围缩放。
   - Post-fix evidence：`qa/body-muscle-selected.png` 中肩胛肌群占据舞台主区，网格边界和色标可辨。
4. 首次桌面检查发现 P2：中等宽度过早将结果卡移到整行，产生大块无效留白。
   - Fix：`1201 px` 以上恢复三栏，只有窄桌面 / 平板才转为两栏与单栏。
   - Post-fix evidence：最终桌面图中步骤、人体、结果同屏，无水平溢出。
5. 首次 hotspot 检查发现 P2：圆点过大，遮挡人体轮廓。
   - Fix：缩小模型空间标签并降低外圈尺寸；具体肌肉定位继续使用真实网格，不使用圆点。
   - Post-fix evidence：最终默认图中 7 个大区域可读但不遮挡主要身体轮廓。

## 交互与运行验收

- 7 个大区域均有模型 hotspot 和文字入口。
- 肌肉地图真实 raycast 点击可用；文字入口提供完整键盘等价操作。
- 多肌群选择 / 取消、颜色同步和教程并集排序可用。
- 膝盖 4 个关节方向区、4 组相关肌群及不确定选项可用。
- 红旗分流抑制训练 CTA；正常状态返回 2–3 个既有教程。
- 教程进入与浏览器返回状态恢复可用；原教程搜索、侧边栏、15 个动作和双状态图片通过回归测试。
- Desktop / mobile Console：0 个 error。
- Mobile `390 px`：无横向溢出；按钮、checkbox、肌群 chips 可操作。
- `npm test`：18 / 18 通过。
- `npm run test:sites`：4 / 4 通过。
- `npm run build`、`npm run build:github`：通过。

## Implementation Checklist

- [x] 真实着装 3D 人体可旋转、缩放、切换正背面和重置。
- [x] 7 个区域可放大并自动切换肌肉地图。
- [x] 肌肉真实网格支持 hover、点击、多选、取消和稳定色标。
- [x] 膝 / 踝保留关节位置与无法确定选项。
- [x] 安全分流、依据、停止条件和非诊断边界完整。
- [x] 15 个原教程、搜索、分类、过程 / 到位图和内容无删减。
- [x] 桌面、移动、URL 状态、返回流程与 Sites 构建通过。
- [x] 字体、间距、颜色、图片质量、图标和 Copy 已完成视觉对照。

final result: passed
