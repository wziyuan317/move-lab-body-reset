# MOVE LAB 3D 身体定位首页实施计划

> **Required sub-skill:** 使用 `superpowers:executing-plans` 逐项执行；所有业务逻辑遵循 `superpowers:test-driven-development` 的 RED → GREEN → REFACTOR；交付前使用 Product Design `design-qa`。

**Goal:** 在完整保留现有 15 个动作教程的前提下，增加可旋转、可放大、可按真实肌肉网格多选的 3D 身体定位首页，并将安全分流与教程推荐串成可用主流程。

**Architecture:** 顶层 `App` 只管理首页 / 教程库视图和 URL 状态；`bodyMap.js` 作为 7 个区域、肌肉结构、风险规则和推荐算法的唯一数据源；`BodyScene` 用 React Three Fiber 加载着装与肌肉 GLB，着装模型的大区域 hotspot 触发相机预设，肌肉模型通过真实 mesh raycast 触发多选；原教程 UI 原样抽成 `TutorialLibrary`。若 3D 加载失败，文字区域与肌群列表仍完成同一流程。

**Tech Stack:** React 19、Vite 6、Three.js、React Three Fiber、Drei、Phosphor Icons、Node `node:test`、Sites Worker。

**Spec:** `docs/plans/2026-09-01-body-explorer-homepage-design.md`

**Global Constraints:** 不删除或缩写既有教程内容；不把用户定位当成诊断；红旗状态不出现训练 CTA；肌肉选中必须以真实网格为准；关节附近和无法确定必须可选；不部署，先完成本地预览与 QA。

---

## Task 1：锁定 3D 资产、许可证与运行依赖

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `public/assets/models/move-lab-clothed.glb`
- Create: `public/assets/models/move-lab-muscles.glb`
- Create: `public/assets/models/README.md`
- Create: `public/draco/*`
- Test: `tests/body-assets.test.mjs`

1. 先写 `body-assets.test.mjs`：以真实 GLB header 和 JSON chunk 断言着装模型含 `LeftArm` / `RightArm` 骨骼，肌肉模型含 `extras.type = muscle`，并断言所有 `anatomyTargets.meshNames` 至少命中一个肌肉节点。此时因文件或数据层不存在而失败。
2. 运行 `node --test tests/body-assets.test.mjs`，确认失败原因是资产 / 映射缺失。
3. 安装 `three`、`@react-three/fiber`、`@react-three/drei`；复制已核验的 CC0 着装 GLB、CC-BY-SA 肌肉 GLB和 Three.js 本地 Draco decoder。
4. 写模型 README，记录 Quaternius、Z-Anatomy、hpfrei 来源和许可证，不复制不必要的长说明。
5. 重跑测试，确认模型和映射资产契约通过；提交 `feat: 接入人体与肌肉 3D 资产`。

## Task 2：建立区域、肌群、多选与安全推荐数据层

**Files:**
- Create: `src/bodyMap.js`
- Create: `tests/body-map.test.mjs`
- Modify: `package.json`

1. 在 `body-map.test.mjs` 先写失败测试，覆盖：7 个区域稳定 ID；每个区域至少 2 个教程；每个具体目标拥有唯一 ID、颜色、meshNames；同一肌群多次点击可增删且不清空其他选择；多肌群推荐优先覆盖交集；膝 / 踝存在 joint fallback；红旗输入返回 `blocked` 且推荐数组为空。
2. 运行单测，确认因 `bodyMap.js` 缺失失败。
3. 最小实现并导出：`bodyRegions`、`anatomyTargets`、`regionCameraPresets`、`toggleTargetSelection(ids, id)`、`getRegionTargets(regionId)`、`getRecommendations({ regionId, targetIds, symptomIds, redFlagIds })`、`serializeExplorerState(state)`、`parseExplorerState(search)`。
4. 数据中使用 Z-Anatomy 的真实 `extras.nameDetail` / node name 匹配具体结构；将颈、肩胛、胸背、腰、髋臀、膝、踝分别关联到现有动作 ID。
5. 重跑 `node --test tests/body-map.test.mjs tests/movements.test.mjs`；提交 `feat: 建立身体定位与安全推荐数据层`。

## Task 3：保留教程体验并增加顶层导航 / 深链状态

**Files:**
- Create: `src/TutorialLibrary.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `tests/body-map.test.mjs`

1. 先增加 URL 状态往返测试：`view=library&movement=scapular-squeeze` 与首页 `region/targets/symptoms` 可序列化、解析并忽略未知 ID；确认新测试失败。
2. 将现有 `MovementCard`、`MovementDetail`、搜索、分类、动作帧切换和来源页脚原样移动到 `TutorialLibrary.jsx`，对外接收 `initialMovementId` 和 `onNavigateHome`。
3. 重写 `App.jsx` 为轻量视图控制器：默认首页，导航到教程时写 URL；浏览器 `popstate` 恢复视图和定位状态。
4. 运行既有动作测试与新 URL 测试，确保 15 个教程、搜索 / 分类、双帧逻辑未回归；提交 `refactor: 为身体定位首页拆分教程视图`。

## Task 4：实现 3D 人体、区域聚焦和真实肌肉多选

**Files:**
- Create: `src/components/BodyExplorer.jsx`
- Create: `src/components/BodyScene.jsx`
- Create: `src/components/ModelErrorBoundary.jsx`
- Modify: `src/styles.css`
- Test: `tests/body-map.test.mjs`

1. 先补数据契约失败测试：每个 camera preset 有 `position/target/zoom`，每个区域 hotspot 有模型空间坐标，目标颜色互异且区域 target 能被 mesh 元数据命中。
2. `BodyScene` 用 `Canvas`、`GLTFLoader`、本地 `DRACOLoader` 和 `OrbitControls` 加载模型。着装模型隐藏动画并把左右上臂骨骼调整为约 25–30° A-pose；区域 hotspot 采用模型空间位置。
3. 选择区域后使用 camera preset 平滑聚焦并切换到肌肉模型，只显示本区域目标肌肉；点击具体 mesh 将其稳定 target ID 回传。不同目标使用固定色标，已选提高亮度 / emissive，hover 与文字列表同步。
4. `BodyExplorer` 提供运动服 / 肌肉地图切换、正面 / 背面、重置、区域文字按钮和完全等价的肌群文字多选；WebGL / GLB 错误时显示静态降级卡和所有文字操作。
5. 运行数据测试和生产构建；本地浏览器验证 7 个区域、镜头聚焦、至少肩胛 / 膝 / 腰 3 组真实网格点击及多选取消；提交 `feat: 实现 3D 区域聚焦与肌肉多选`。

## Task 5：实现两步安全分流、结果解释与教程接入

**Files:**
- Create: `src/HomePage.jsx`
- Create: `src/components/AssessmentPanel.jsx`
- Create: `src/components/RecommendationPanel.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Test: `tests/body-map.test.mjs`

1. 先写失败测试：普通输入返回 2–3 个已存在教程 ID；多肌群并集去重；红旗状态无教程；空目标仍可用区域推荐；膝 / 踝 joint fallback 不声称具体受损肌肉。
2. `AssessmentPanel` 提供酸紧、活动受限、无力、肿胀、刺痛 / 麻木多选及外伤、进行性无力 / 麻木、明显肿胀 / 变形、发热伴疼痛红旗选择。
3. `RecommendationPanel` 显示“用户报告位置”“可能相关肌群”“为什么可能有关”“可以尝试”“停止条件”“资料来源”；blocked 状态只显示停止自练与专业评估，不渲染教程 CTA。
4. `HomePage` 组合左步骤、中央 3D、右结果、下方推荐；点击推荐调用顶层导航并打开指定既有教程；返回后恢复选择。
5. 运行全部逻辑测试；提交 `feat: 接入安全分流与教程推荐`。

## Task 6：按确认稿完成多巴胺运动视觉与响应式

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`
- Create: `public/assets/models/clothed-poster.png`

1. 以确认稿 `exec-b3d72858-25fb-4049-b9a6-909cf5e8055e.png` 为视觉真值，落实深蓝背景 / 框架、亮黄任务块、珊瑚红 CTA、蓝绿状态色、粗描边、硬阴影、游戏 HUD 式状态条和清晰层级。
2. 桌面采用左步骤 / 中央人体 / 右结果，移动端人体置顶、步骤与结果顺序堆叠；保证 320 px 无横向溢出、按钮至少 44 px、键盘 focus 清晰。
3. 用真实着装模型的浏览器渲染生成 poster，不使用手绘占位；加入 reduced-motion 与低性能降级。
4. 运行 `npm test`、`npm run test:sites`、`npm run build`；提交 `style: 完成身体冒险地图响应式视觉`。

## Task 7：真实浏览器验收与视觉对照 QA

**Files:**
- Modify: `design-qa.md`
- Create: `qa/body-home-desktop.png`
- Create: `qa/body-home-mobile.png`
- Create: `qa/body-muscle-selected.png`
- Create: `qa/body-home-comparison.png`

1. 启动 `npm run dev -- --host 0.0.0.0` 并保持运行；使用当前可用浏览器打开本地页。
2. 验证：首页默认、区域 hotspot 与文字入口、放大后肌肉显示、肌肉多选 / 取消、joint fallback、感觉与红旗、blocked 无 CTA、推荐进入教程、浏览器返回恢复、运动服切换、模型失败降级。
3. 检查 console 无错误；验证桌面 1440 × 1100、移动 390 × 844，无横向溢出且键盘可达。
4. 将确认稿与同尺寸实现截图放进同一比较图，按 `design-qa` 五个必查面完成迭代；发现 P0 / P1 / P2 即修复并重新截图对比。
5. 把最终报告写入 `design-qa.md`，`final result` 必须为 `passed`；重跑所有测试、Sites 测试与生产构建；提交 `test: 完成 3D 身体定位首页验收`。

