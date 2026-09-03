# Task 7 实现报告：视觉 QA、响应式验收与最终构建

## 结果

身体定位改版已通过 desktop `1440 × 900` 与 mobile `390 × 844` 的最终视觉、交互、可访问性和构建门禁。真实 side-by-side comparison、desktop 结果态和 mobile 结果态已保存到 brief 指定路径；最终没有 actionable P0 / P1 / P2。

## 实施内容

- 修复 `BodyExplorer` 的旧状态覆盖：模型 hotspot 现在把 `regionId` 与 `viewSide` 作为一次原子更新提交，并添加真实回归测试。
- 相机 framing 从包围球改为实际 AABB half extents；窄屏按横纵可用视场适配，区域定位提供轻度受控放大，同时保留头、脚、平台和全身上下文。
- 为人物 hotspot 增加 Enter / Space 键盘等价操作和 repeat 保护，微调大腿 / 膝盖的 desktop / mobile offset，消除点击目标重叠。
- 保留 READY 后移动端的感受区，修复 CTA 排版，并把 safety label、evidence summary / links 等目标统一到至少 `44 px`。
- 修复 desktop READY 的编辑路径：点击已完成“描述感受”后展示可编辑感受区，保留数据并在渲染后把焦点移到可见按钮。
- 完整重置现在清空 region / targets / symptoms / red flags，回到 front / step 1；切换新区也不会继承旧感受或 blocked 状态。
- 页脚两个署名链接在 desktop / mobile 均达到 `44 × 44 px`；主要教程 CTA 改为 yellow + navy，与 coral 危险色分离。
- 热点 pointer / Enter / Space 改用可执行 handler unit test；相机与热点投影测试直接载入当前 Man Player GLB、应用 `Standing_05`，从真实 bounds 验证 desktop / mobile、front / back、default / knee 的留白与 overlap。
- 专业模式的真实实现是 `react-muscle-highlighter` 2D 完整正背人体；legacy 3D muscle GLB 不加载、不发布。
- 专业模式为每个 `slug + region` 保留全部 target IDs，2D body data 使用实际选中肌肉的 color / side；同 slug 多选按稳定映射顺序显示，并诚实说明有限 2D 轮廓会合并肌肉、彩色标签保留详情。
- 膝 / 肩 / 踝局部图画布扩展到约 `320 px`，按真实解剖参考重排全部 `44 × 44 px` marker；生产常量与像素回归共同覆盖 selected scale、矩形 overlap 和中心命中。
- 复审后进一步把人工标定解剖 anchor 与非重叠 marker 拆分，以不拦截指针的 leader line 连接；marker 可读可点，anchor 仍精确落在真实图像位置。
- 最终 `npm test` 共 73 个测试。

## QA 迭代

1. Iteration 1：发现热点状态被覆盖、移动人物过小与热点重叠；完成原子更新和 AABB framing 后重测。
2. Iteration 2：发现 Enter / Space 不触发、桌面大腿 / 膝盖重叠；完成键盘处理和 offset 调整后重测。
3. Iteration 3：发现移动 READY 感受区 / CTA 问题及多个小于 `44 px` 的目标；完成响应式和触控尺寸修复后重测。
4. Iteration 4：按相同状态重截、重建 comparison，并对 nav、左任务栏、右结果卡和底部区域卡逐区检查；无 actionable P0 / P1 / P2，`final result: passed`。
5. Iteration 5：独立复审发现 desktop 编辑感受、完整重置、页脚 44×44 和 CTA 语义色问题；完成 TDD 修复、同 viewport live 复测与重截后通过，无 actionable P0 / P1 / P2。
6. Iteration 6：最终整分支复审发现非 primary 肌肉无法改变 2D body visual、三张局部图 marker 严重重叠；完成全量映射、确定性实际色、约 320px 画布和像素 overlap / center-hit 回归后，desktop / mobile live 逐项复测与重截通过。
7. Iteration 7：final reviewer 指出 Iteration 6 的 marker 虽不重叠却偏离解剖位置；恢复全部原始人工标定 anchor，以独立 marker + leader line 保持精确空间语义和 44px 点击目标，desktop / mobile 逐图复测后通过。

完整的像素、差异分级和每轮 post-fix evidence 见 `design-qa.md`。

## 最终 Browser 证据

- Source：`1487 × 1058 px`；desktop CSS viewport `1440 × 900`、DPR 1，PNG `1425 × 891`；mobile CSS viewport `390 × 844`、DPR 1，PNG `375 × 812`；三栏 comparison `3120 × 900`。
- desktop / mobile 的 default、front、back、knee front / back 均显示完整头、脚和平台；knee 状态略放大；所有 hotspot pairwise overlap 为 `[]`。
- pointer、Enter、Space 都准确选择膝盖；mobile 无横向溢出；desktop / mobile fresh Console error 为 `0`。
- 专业模式 Escape / 关闭按钮均可关闭并恢复触发按钮焦点；focus-visible 为 `4px solid rgb(255, 159, 28)`。
- 红旗抑制 CTA，解除红旗恢复 CTA；进入坐姿主动伸膝后 Browser Back 精确恢复 knee-front + tightness READY 状态。
- desktop safety label 为 `214 × 44 px`；mobile 各步骤、choice、safety、CTA、证据链接和 footer 控件均达到 `44 px`。
- desktop READY 点击“描述感受”后编辑区可见、焦点可见且原 symptom 保留；完整重置后 URL 为 front / step 1 且所有旧定位、安全状态清空，再选新区不会 blocked。
- desktop / mobile 的 `原作品` / `CC BY 4.0` 均至少 `44 × 44 px`；主要 CTA 为 `rgb(255, 212, 59)` + `rgb(16, 38, 83)`。
- 专业模式中肩部冈下肌 / 前锯肌、颈部肩胛提肌、膝部股内侧肌、踝部比目鱼肌单选后，按钮状态、URL target 与 2D SVG 实际 target 色同步；合并 granularity 说明可见。
- desktop `318 × 318 px`、mobile `319 × 319 px` 的 knee / shoulder / ankle 局部图，default 与全部 selected marker 的 overlap / center miss 均为空；逐个点击成功，文字列表完整且无裁切。
- 20 个解剖 anchor 全部恢复人工标定位置，leader 数与 marker 数一致且 `pointer-events: none`；两端 `anchorInBounds=true`，实际截图中锚点、连线和编号 callout 均清楚、没有落到错误身体区域。

## 视觉结论

- 深海军蓝、高饱和状态色、三栏任务结构、中央人物、右结果卡与底部 8 卡的层级和节奏与参考图一致。
- 用户提供的 Man Player `Standing_05` 红色运动角色是受控差异，使用真实资产并按 CC BY 4.0 正确署名。
- P3 follow-up：系统字体可继续品牌化；任务 banner 可补更丰富插画；结果卡可在不越过医疗安全边界的前提下增加装饰层。

## 最终命令

- `npm test`：73 / 73 通过。
- `npm run test:sites`：4 / 4 通过。
- `npm run build`：通过；Sites build 已生成，`dist/client` release asset check passed。
- `npm run build:github`：通过；`dist/github` release asset check passed。
- release gate：`dist/client`、`dist/github` 均不含 `move-lab-muscles.glb`。

## Concerns

- Three.js 输出 deprecation warning，但 fresh Console 没有 error。
- Vite 可能继续报告大于 `500 kB` 的 chunk warning；这是既有打包优化项，不影响本次门禁。
- 本 worker 的 in-app Browser 连接中途不可用；最终所有浏览器证据由主线程在同一 worktree、同一 live server 上使用 Codex in-app Browser 重测并保存，未使用 Chrome 或 standalone Playwright。
