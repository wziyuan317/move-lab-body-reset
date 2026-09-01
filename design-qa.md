# Design QA：身体定位改版

## 比较对象与状态

- Source visual truth：`/var/folders/y_/8sf7bv9x0mz9gcz_61361hch0000gp/T/codex-clipboard-db15606a-5ff1-4a0d-9ecc-8879dcf4fcc6.jpg`。
- Live implementation：`http://127.0.0.1:5188/`。
- Desktop：`qa/redesign-after-desktop.png`，`1440 × 900 CSS px`、DPR 1；PNG 为 `1425 × 891 px`。
- Mobile：`qa/redesign-after-mobile.png`，`390 × 844 CSS px`、DPR 1；PNG 为 `375 × 812 px`。
- Side-by-side：`qa/redesign-comparison.png`，`2705 × 900 px`。
- READY 状态：膝盖 + 膝前 + 酸紧 / 发僵 + 无红旗，URL 状态为 `?region=knee&targets=knee-front&symptoms=tightness&viewSide=front&step=3`。桌面完整展示三步、安全结论、CTA、人物和 8 个区域卡；移动端完成同一核心流程并停在 step 3 结果。

## 像素与归一化

- Source 为 `1487 × 1058 px`；实现截图来自上述 CSS viewport，截图密度均为 DPR 1。
- Source 与 desktop implementation 的原始比例不同，不把浏览器可见区裁边或比例差当作缺陷。
- Comparison 按高度归一到 `900 px`：Source 等比缩放为约 `1265 × 900 px`，desktop implementation 归一为 `1440 × 900 px`，再机械水平拼接为 `2705 × 900 px`；没有用 ImageGen 重绘或补画截图。
- 三张成品均验证 PNG signature `89 50 4e 47 0d 0a 1a 0a`，尺寸与上文一致。

## Full-view comparison：5 个 fidelity surfaces

1. **字体 / 排版**：中英文系统字体清楚稳定，任务标题、步骤号、结果标题和 CTA 层级与参考图同向；长中文无截断。参考图更具手绘展示字体感，当前实现较克制，记录为 P3。
2. **Spacing / layout rhythm**：桌面保持左任务栏、中央人物、右结果卡和底部 8 卡的主结构；人物是视觉中心，任务与结果密度均衡。移动端按人物 → 流程 → 结果组织，`scrollWidth === clientWidth`，无横向溢出、坏间距或裁切。
3. **Colors / tokens**：深海军蓝外壳、白色信息卡、高饱和黄 / 橙 / 蓝 / 绿状态色、粗描边与硬阴影延续参考图的运动游戏感；主要教程 CTA 使用参考图同向的黄色行动色 + 深蓝文字，与 coral 危险色明确分离。
4. **Image quality / assets**：主舞台使用用户提供的 Man Player `Standing_05` 真实 GLB，专业模式使用 `react-muscle-highlighter` 的 2D 完整正背人体图，动作卡使用既有真实动作图；legacy 3D muscle GLB 不加载、不发布。全页无 CSS art、手写 SVG、emoji 或 placeholder。红色运动角色是用户确认的受控差异；页脚已按 CC BY 4.0 正确署名，不因人物非写实单独降级。
5. **Copy / content**：三步定位、感受、安全复核、停止条件、依据与训练入口完整；文案明确位置记录不等于诊断。相对参考图，结果区采用更保守的行为建议而非更强的伤病判断，属于安全边界内的有意差异。

## Focused region comparison

- **Nav**：品牌、当前栏目和 active underline 的层级清楚；实现导航更精简，但没有破坏参考图的顶部节奏。
- **左任务栏**：任务 banner、三个编号步骤和完成状态与参考图的“任务驱动”结构一致；安全复核位于任务栏内，信息可读且无遮挡。
- **右结果卡**：白色卡、膝盖标题、绿色安全状态、黄色主要 CTA 与停止提示形成与参考图相同的结果层级；实现省略装饰性膝部插画和三行彩色安全条，保留行为优先的安全信息。
- **底部区域卡**：8 个高饱和区域入口全部存在，使用真实肌肉图像；选中膝盖的状态边框和标签清楚。
- 对 comparison 大图及 nav、左任务栏、右结果卡、底部区域卡四个 focused crop 实际打开检查；未见裁切、溢出、失真、坏 padding / margin、错误边框或层级性的 P0 / P1 / P2。

## 严格迭代记录

### Iteration 1 — blocked

- [P1] 3D hotspot 连续调用 `onSelectRegion` 与 `onChangeViewSide`，第二个基于旧值的更新覆盖 `regionId`，点击人物热点无结果。
- [P1] 使用包围球和横向 limiting FOV 后，移动端人物过小、热点重叠，点击“膝”可能被“腿”截获；聚焦膝盖反而继续缩小。
- Fix：将 `regionId + viewSide` 合并为一次原子状态更新；相机改用实际 AABB 横纵 half extents 适配，并为区域状态设置受控放大。
- Post-fix evidence：desktop / mobile 的 default、back、knee front / back 均保留头、脚和平台；knee 状态略放大；移动端 pointer 点击膝盖正确进入 `region=knee`，hotspot pairwise overlap 为空。

### Iteration 2 — blocked

- [P1] hotspot 获得键盘焦点后，Enter / Space 不触发选择。
- [P2] desktop knee active scale 下“大腿”与“膝盖”约纵向重叠 `5 px`。
- Fix：为 hotspot 增加显式 Enter / Space `onKeyDown`，拦截 repeat 并阻止默认滚动；同时微调桌面 / 移动热点 offset。
- Post-fix evidence：Enter 与 Space 均把 URL 更新到 `region=knee`，焦点保持 `定位膝盖`；desktop / mobile hotspot pairwise overlap 均为空，pointer 与键盘选择一致。

### Iteration 3 — blocked

- [P2] READY 后移动 step 2 的感受区被隐藏；移动 CTA 排版退化；证据 summary / links、desktop safety checkbox label 未达到 `44 px` 触控高度。
- Fix：READY 后保留 step 2 assessment；恢复移动 CTA 排版；summary、source link 和所有断点的 safety label 统一 `min-height: 44px` 并垂直居中。
- Post-fix evidence：desktop safety label 全部为 `214 × 44 px`；mobile step 2 流程项 `323 × 48 px`、choice `159 × 44 px`、safety `301 × 44 px`、footer controls `48 / 106 × 44 px`；mobile step 1 与 step 3 的 hotspot、区域卡、toolbar、CTA、summary、source links 和 footer 均无小于 44 px 的目标。

### Iteration 4 — passed

- 重截 desktop / mobile，并重建真实 side-by-side comparison；再次执行 full-view 与四个 focused-region comparison。
- 最终没有 actionable P0 / P1 / P2；仅保留下述 P3 follow-up。

### Iteration 5 — passed

- [P1] desktop READY 点击已完成“描述感受”只改变移动步数，CSS 仍隐藏可编辑感受区。
- [P1] 重置仅清理区域与朝向，遗留感受 / 红旗；继续选新区可能直接继承 blocked 状态。
- [P2] 页脚署名链接在 desktop / mobile 小于 `44 px`，主要教程 CTA 使用危险 coral 而不是规格黄色行动色。
- Fix：完成态用独立 presentation step 展示 step 2，渲染后聚焦第一个可见感受按钮；区域变更与重置清空 targets / symptoms / red flags；页脚链接统一 44px；CTA 改为 yellow + navy。热点事件改成可执行纯函数测试，相机与热点投影测试由当前 Man Player `Standing_05` GLB 派生真实 bounds。
- Post-fix evidence：desktop READY 点击“描述感受”后 class 切换为 `mission-column--step-2`，感受区可见，原“酸紧 / 发僵”仍选中且焦点落在可见按钮；点击“获得建议”返回 step 3。旧 knee + tightness + deformity 重置后 URL 为 `?viewSide=front&step=1` 且定位 / 感受 / 红旗全空；再选 shoulder 为 step 2、未 blocked。desktop / mobile 页脚链接分别为 `44 × 44`、`54 × 44 px`，CTA 为 `rgb(255, 212, 59)` + `rgb(16, 38, 83)`、高 `44 px`。
- Post-fix comparison：按相同 READY 状态重截 desktop / mobile、机械重建 `2705 × 900` side-by-side，并实际打开 full view 及 nav / 左任务栏 / 右结果卡 / 底部区域卡四个 focused crop；黄色 CTA 与参考一致，未见新的裁切、溢出或 P0 / P1 / P2。

## Browser interaction / accessibility evidence

- 仅使用 Codex in-app Browser 验证；fresh desktop / mobile tab 的 Console error 均为 `0`，仅有 Three.js deprecation warning。
- desktop / mobile 的人物 default、front、back、knee front、knee back 均完整显示头、脚和平台；knee 选择后人物略放大但保留全身上下文。
- pointer、Enter、Space 均能选择膝盖；desktop / mobile hotspot overlap 均为 `[]`。
- focus-visible 为 `4px solid rgb(255, 159, 28)`；关键操作、checkbox、链接和 footer 控件均达到 `44 × 44 px`。
- desktop READY 可进入可编辑感受区并把焦点移到可见按钮，既有选择不丢；完整重置与再选新区不会继承旧感受 / 红旗。
- 主要教程 CTA 在 desktop / mobile 均为 yellow + navy、高 `44 px`；`原作品` / `CC BY 4.0` 链接两端均达到最小 `44 × 44 px`。
- 专业模式可打开；Escape 与关闭按钮都关闭 dialog，焦点返回 `.professional-mode-button`。
- 红旗状态为 `blockedCount=1`、CTA `0`；解除红旗后为 `blockedCount=0`、CTA `1`。
- CTA 进入 `movement=seated-knee-extension`；Browser Back 精确恢复 knee-front + tightness READY URL。
- mobile `scrollWidth - clientWidth = 0`；desktop / mobile 均无页面横向溢出。

## Findings / follow-up

- 当前没有 actionable P0 / P1 / P2。
- [P3] 当前系统字体比参考图的手绘展示字更克制，可在不牺牲中文可读性的前提下继续探索品牌字体。
- [P3] 任务 banner 省略参考图的山体插画，步骤卡更紧凑；当前信息密度更适合可操作流程。
- [P3] 结果卡省略参考图的膝部装饰插画与三条彩色安全行，保留更保守的行为建议和停止条件。

## Final verification

- `npm test`：69 / 69 通过。
- `npm run test:sites`：4 / 4 通过。
- `npm run build`：通过；Sites build 已生成，release asset check passed。
- `npm run build:github`：通过；GitHub Pages base 与 release asset check passed。
- release outputs：`dist/client`、`dist/github` 均不含 `move-lab-muscles.glb`。

final result: passed
