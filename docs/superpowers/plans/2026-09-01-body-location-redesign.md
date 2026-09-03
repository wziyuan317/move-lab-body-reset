# MOVE LAB Body Location Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将身体定位首页重构为参考图中的游戏化三栏体验，让位置、感受和建议形成真实可见的 3 步流程，同时用完整身体分区图替代默认漂浮肌肉网格。

**Architecture:** 以 `bodyMap.js` 作为领域状态和推荐契约，新增纯函数相机模块与 2D 分区数据模块；中央 3D 人物只负责游戏氛围和大区域定位，右侧 2D 身体图与关节局部图负责精确多选。Z-Anatomy 延迟加载为专业模式，原教程通过现有 URL 状态继续联通。

**Tech Stack:** React 19、Vite 6、Three.js、React Three Fiber、Drei、react-muscle-highlighter 1.2.0、Node.js `node:test`、Codex in-app Browser。

**Spec:** `docs/superpowers/specs/2026-09-01-body-location-redesign.md`

## Global Constraints

- 视觉以用户提供的 1488 × 1040 MOVE LAB 深蓝游戏化参考图为唯一目标。
- 默认流程不展示脱离人体轮廓的肌肉网格。
- 原有 15 个动作教程、搜索、动作过程图、到位图和说明不得减少。
- 主观位置和感受不得用于诊断疾病或声称确定受损组织。
- 红旗状态必须隐藏训练 CTA。
- 桌面验收视口为 1440 × 900，移动验收视口为 390 × 844。
- 修改 `package.json` 时保留现有内容生成脚本，不覆盖并行工作产生的字段。
- Git 只暂存本任务明确列出的文件，不暂存 `.workflow/`、`stretching-anatomy-cn/` 或内容生成脚本。
- 3D 资产必须保存包内许可证与下载日期；只有明确标记 CC0 的版本才可把原始 GLB 纳入公开仓库。

## File Structure

- `src/bodyMap.js`：区域、具体位置、感受策略、推荐状态、URL 序列化。
- `src/bodyRegionMap.js`：`react-muscle-highlighter` slug 映射、颜色语义、复杂关节热点数据。
- `src/cameraFraming.js`：与 Three.js 无关的相机距离、目标和正背面计算纯函数。
- `src/components/BodyRegionMap.jsx`：完整正面／背面 2D 人体多选图。
- `src/components/JointRegionMap.jsx`：膝、肩胛、踝局部位置图与热点。
- `src/components/RegionRail.jsx`：底部彩色部位入口。
- `src/components/BodyScene.jsx`：着装人物、热点、自动构图和相机过渡。
- `src/components/ProfessionalAnatomyPanel.jsx`：按需加载的 Z-Anatomy 专业模式。
- `src/components/BodyExplorer.jsx`：协调中央 3D 人物和右侧定位入口，不再自动切换肌肉模式。
- `src/components/AssessmentPanel.jsx`：3 步流程控制、感受和安全筛查。
- `src/components/RecommendationPanel.jsx`：`idle/incomplete/ready/caution/blocked` 结果状态。
- `src/HomePage.jsx`：参考图三栏首屏布局与组件联动。
- `src/styles.css`：桌面、平板和移动视觉实现。
- `public/assets/body-map/*.png`：膝、肩胛、踝的无文字局部解剖位置插图。
- `public/assets/models/move-lab-clothed.glb`：经许可核验的着装角色。
- `public/assets/models/README.md`：资产来源、许可证和下载日期。
- `tests/body-map.test.mjs`：状态机、推荐、序列化和兼容性。
- `tests/body-region-map.test.mjs`：2D 分区与关节热点完整性。
- `tests/camera-framing.test.mjs`：相机纯函数。
- `tests/body-assets.test.mjs`：模型与局部图资产验证。

---

### Task 1: 身体定位状态与推荐契约

**Files:**
- Modify: `src/bodyMap.js`
- Modify: `src/App.jsx`
- Modify: `tests/body-map.test.mjs`

**Interfaces:**
- Produces: `getExplorerStep(state) -> 1 | 2 | 3`
- Produces: `selectRegionState(state, regionId) -> ExplorerState`
- Produces: `getRecommendations(state) -> { status, movementIds, guidanceKey }`
- Produces: `ExplorerState.targetSides: Record<string, "left" | "right">`
- Produces: `ExplorerState.viewSide: "front" | "back"` and `ExplorerState.step: 1 | 2 | 3`

- [ ] **Step 1: Write failing state-machine tests**

Add these cases to `tests/body-map.test.mjs`:

```js
test("选择区域后进入感受步骤并清除其他区域的具体位置", () => {
  const next = selectRegionState({
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    targetSides: { rhomboids: "left" },
    symptomIds: [],
    redFlagIds: [],
  }, "knee");
  assert.equal(next.regionId, "knee");
  assert.deepEqual(next.targetIds, []);
  assert.deepEqual(next.targetSides, {});
  assert.equal(getExplorerStep(next), 2);
});

test("没有感受时不提前推荐教程", () => {
  const result = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-front"],
    symptomIds: [],
    redFlagIds: [],
  });
  assert.equal(result.status, "incomplete");
  assert.deepEqual(result.movementIds, []);
});

test("肿胀或麻木进入谨慎状态但红旗才阻断教程", () => {
  assert.equal(getRecommendations({
    regionId: "knee", targetIds: ["knee-front"], symptomIds: ["swelling"], redFlagIds: [],
  }).status, "caution");
  assert.equal(getRecommendations({
    regionId: "knee", targetIds: ["knee-front"], symptomIds: ["swelling"], redFlagIds: ["deformity"],
  }).status, "blocked");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/body-map.test.mjs`

Expected: FAIL because `selectRegionState` and `getExplorerStep` are missing and the current recommendation returns `ready` without symptoms.

- [ ] **Step 3: Implement the minimal state contract**

In `src/bodyMap.js`:

```js
const cautionSymptomIds = new Set(["weakness", "swelling", "tingling"]);

export function getExplorerStep({ regionId, symptomIds = [] }) {
  if (!regionId) return 1;
  if (!symptomIds.length) return 2;
  return 3;
}

export function selectRegionState(state, regionId) {
  if (state.regionId === regionId) return state;
  return { ...state, regionId, targetIds: [], targetSides: {} };
}
```

Update `getRecommendations` so the order is `blocked -> idle -> incomplete -> caution/ready`, and add `guidanceKey` without diagnosing a condition. Extend URL serialization with `side=<targetId>:<left|right>` pairs, `viewSide=front|back` and `step=1|2|3` while still accepting old URLs without these fields. Add `targetSides: {}`, `viewSide: "front"` and `step: 1` to `defaultExplorerState` in `src/App.jsx`; state transitions keep `step` synchronized with `getExplorerStep`.

- [ ] **Step 4: Run all data tests and verify GREEN**

Run: `npm test`

Expected: all existing movement, body-map and asset tests pass; the previous “多肌群推荐” test now supplies `symptomIds: ["tightness"]` and remains `ready`.

- [ ] **Step 5: Commit the state contract**

```bash
git add src/bodyMap.js src/App.jsx tests/body-map.test.mjs
git commit -m "feat: 完善身体定位三步状态契约"
```

### Task 2: 完整身体分区数据与 2D 交互图

**Files:**
- Create: `src/bodyRegionMap.js`
- Create: `src/components/BodyRegionMap.jsx`
- Create: `tests/body-region-map.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/bodyMap.js`
- Modify: `tests/body-map.test.mjs`

**Interfaces:**
- Produces: `bodySlugTargets: Record<BodySlug, string[]>`
- Produces: `getTargetForBodySlug(slug, regionId) -> string | undefined`
- Produces: `<BodyRegionMap regionId selectedIds selectedSides viewSide onToggleTarget onChangeViewSide />`

- [ ] **Step 1: Write failing visual-map data tests**

Create `tests/body-region-map.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { bodySlugTargets, getTargetForBodySlug } from "../src/bodyRegionMap.js";

test("宽泛身体区域都映射到可点击人体 slug", () => {
  for (const slug of ["neck", "trapezius", "deltoids", "chest", "upper-back", "lower-back", "gluteal", "quadriceps", "hamstring", "knees", "calves", "tibialis", "ankles"]) {
    assert.ok(bodySlugTargets[slug]?.length > 0, `${slug} 缺少目标映射`);
  }
});

test("同一 slug 按当前区域返回具体目标", () => {
  assert.equal(getTargetForBodySlug("quadriceps", "thigh"), "quadriceps-area");
  assert.equal(getTargetForBodySlug("quadriceps", "knee"), "rectus-femoris");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/body-region-map.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/bodyRegionMap.js`.

- [ ] **Step 3: Install and implement the complete body map**

Run: `npm install react-muscle-highlighter@1.2.0`

Create the mapping module with explicit slug arrays and add the `thigh` region plus `quadriceps-area` and `hamstring-area` targets in `bodyMap.js`. Implement `BodyRegionMap.jsx` with both front and back tabs. Unselected anatomy uses `#dce5f2`, hover uses `#ffd43b`, selected areas use `#ff665c`, and side-specific selection is passed through `onBodyPartPress(part, side)`.

Use the library component directly:

```jsx
<Body
  data={bodyData}
  side={viewSide}
  gender="male"
  defaultFill="#dce5f2"
  defaultStroke="#9aacbf"
  defaultStrokeWidth={1}
  onBodyPartPress={(part, side) => {
    const targetId = getTargetForBodySlug(part.slug, regionId);
    if (targetId) onToggleTarget(targetId, side);
  }}
/>
```

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/body-region-map.test.mjs tests/body-map.test.mjs && npm test`

Expected: all tests pass and the stable region list is now `neck, shoulder, thorax, low-back, hip, thigh, knee, ankle`.

- [ ] **Step 5: Commit the 2D body map**

```bash
git add package.json package-lock.json src/bodyMap.js src/bodyRegionMap.js src/components/BodyRegionMap.jsx tests/body-map.test.mjs tests/body-region-map.test.mjs
git commit -m "feat: 增加完整身体分区多选图"
```

### Task 3: 膝、肩胛和踝的局部位置图

**Files:**
- Create: `public/assets/body-map/knee-location-map.png`
- Create: `public/assets/body-map/shoulder-location-map.png`
- Create: `public/assets/body-map/ankle-location-map.png`
- Create: `src/components/JointRegionMap.jsx`
- Modify: `src/bodyMap.js`
- Modify: `src/bodyRegionMap.js`
- Modify: `tests/body-map.test.mjs`
- Modify: `tests/body-region-map.test.mjs`
- Modify: `tests/body-assets.test.mjs`

**Interfaces:**
- Produces: `jointDiagramZones: Record<"knee" | "shoulder" | "ankle", JointZone[]>`
- Produces: `<JointRegionMap regionId selectedIds onToggleTarget />`

- [ ] **Step 1: Write failing joint-zone and PNG tests**

Add to `tests/body-region-map.test.mjs`:

```js
test("复杂关节图覆盖普通用户可描述的位置", () => {
  assert.deepEqual(jointDiagramZones.knee.map((zone) => zone.id), [
    "knee-front", "knee-medial", "knee-lateral", "knee-posterior", "quadriceps-area", "hamstring-area", "upper-calf-area", "knee-joint-unsure",
  ]);
  assert.ok(jointDiagramZones.shoulder.length >= 6);
  assert.ok(jointDiagramZones.ankle.length >= 6);
});
```

Extend `tests/body-assets.test.mjs` with PNG signature and minimum dimension checks for the three exact files. Read width and height from PNG bytes 16–23 and require at least 900 × 900.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/body-region-map.test.mjs tests/body-assets.test.mjs`

Expected: FAIL because `jointDiagramZones` and the three PNG assets do not exist.

- [ ] **Step 3: Generate and inspect the three diagram assets**

Use the built-in image generation tool three times with the same art direction: clean sports-rehabilitation illustration, fully clothed or isolated joint crop, warm off-white background, navy contour, pale blue neutral tissue, coral highlight guides, no text, no arrows, no medical gore. Generate one square image each for knee, shoulder/scapula and ankle/calf. Inspect every result before copying it into `public/assets/body-map/`.

Define each hotspot as percentages relative to its image:

```js
{ id: "knee-front", label: "膝盖正前方", x: 50, y: 48, sideLabel: "前" }
```

Add the shoulder and ankle plain-language zone targets to `anatomyTargets`, with tutorial mappings limited to existing movements. Implement `JointRegionMap` as an image plus semantic 44 px buttons positioned from these percentages. Each button carries the location name and selected state; the image itself remains free of embedded text.

- [ ] **Step 4: Run asset and data tests**

Run: `node --test tests/body-region-map.test.mjs tests/body-assets.test.mjs`

Expected: all joint-zone IDs are unique, all target IDs exist in `anatomyTargets`, and all three inspected PNGs pass signature and dimension checks.

- [ ] **Step 5: Commit joint maps**

```bash
git add public/assets/body-map src/bodyMap.js src/bodyRegionMap.js src/components/JointRegionMap.jsx tests/body-map.test.mjs tests/body-region-map.test.mjs tests/body-assets.test.mjs
git commit -m "feat: 增加膝肩踝局部位置图"
```

### Task 4: 着装游戏角色与稳定相机

**Files:**
- Create: `src/cameraFraming.js`
- Modify: `src/components/BodyScene.jsx`
- Modify: `src/components/BodyExplorer.jsx`
- Modify: `public/assets/models/move-lab-clothed.glb`
- Modify: `public/assets/models/README.md`
- Create: `tests/camera-framing.test.mjs`
- Modify: `tests/body-assets.test.mjs`

**Interfaces:**
- Produces: `fitDistanceForSphere(radius, verticalFovDegrees, margin) -> number`
- Produces: `getCameraPose({ target, distance, viewSide }) -> { position, target }`
- Produces: `<BodyScene regionId viewSide onSelectRegion />`

- [ ] **Step 1: Write failing camera tests**

Create `tests/camera-framing.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { fitDistanceForSphere, getCameraPose } from "../src/cameraFraming.js";

test("包围球距离随半径增加且保留安全边距", () => {
  const small = fitDistanceForSphere(1, 30, 1.18);
  const large = fitDistanceForSphere(2, 30, 1.18);
  assert.ok(small > 1);
  assert.equal(large, small * 2);
});

test("正背面共用目标并只反转观察方向", () => {
  const front = getCameraPose({ target: [0.1, -0.5, 0], distance: 3, viewSide: "front" });
  const back = getCameraPose({ target: [0.1, -0.5, 0], distance: 3, viewSide: "back" });
  assert.deepEqual(front.target, back.target);
  assert.equal(front.position[2], -back.position[2]);
  assert.equal(front.position[0], back.position[0]);
});
```

- [ ] **Step 2: Run camera tests and verify RED**

Run: `node --test tests/camera-framing.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/cameraFraming.js`.

- [ ] **Step 3: Acquire the licensed character and implement camera fitting**

Download Ultimate Modular Men Pack from `https://quaternius.com/packs/ultimatemodularcharacters.html`. Before replacing the model, inspect the archive license and record its exact filename, CC0 status and download date in `public/assets/models/README.md`. Select a glTF character with a white athletic top, navy shorts or separately tintable clothing, preserve the Humanoid armature, convert it to a single `move-lab-clothed.glb`, and verify `LeftArm`/`RightArm` or their recorded replacement bone names in `tests/body-assets.test.mjs`.

Implement:

```js
export function fitDistanceForSphere(radius, verticalFovDegrees, margin = 1.18) {
  const halfFov = verticalFovDegrees * Math.PI / 360;
  return radius * margin / Math.sin(halfFov);
}

export function getCameraPose({ target, distance, viewSide }) {
  return {
    target: [...target],
    position: [target[0], target[1], target[2] + (viewSide === "front" ? -distance : distance)],
  };
}
```

In `BodyScene`, compute the normalized character box once, derive its sphere and foot alignment, and call one `fitCameraToTarget` path for initial load, region changes, front/back changes and canvas resize. Remove the default muscle replacement path and keep `OrbitControls` centered on the same target with `enablePan={false}` and bounded distance/azimuth.

- [ ] **Step 4: Verify tests and production build**

Run: `node --test tests/camera-framing.test.mjs tests/body-assets.test.mjs && npm run build`

Expected: camera and asset tests pass; Vite production build succeeds; the new model path is included.

- [ ] **Step 5: Commit model and camera**

```bash
git add src/cameraFraming.js src/components/BodyScene.jsx src/components/BodyExplorer.jsx public/assets/models/move-lab-clothed.glb public/assets/models/README.md tests/camera-framing.test.mjs tests/body-assets.test.mjs
git commit -m "fix: 稳定身体定位人物相机构图"
```

### Task 5: 真实三步任务栏与结果状态

**Files:**
- Modify: `src/components/AssessmentPanel.jsx`
- Modify: `src/components/RecommendationPanel.jsx`
- Modify: `src/HomePage.jsx`
- Modify: `src/bodyMap.js`
- Modify: `tests/body-map.test.mjs`

**Interfaces:**
- Consumes: `getExplorerStep`, `getRecommendations`, `selectRegionState`
- Produces: `AssessmentPanel.onRequestStep(step)`
- Produces: recommendation states with a single matching CTA only for `ready/caution`

- [ ] **Step 1: Add failing recommendation-copy tests**

Add to `tests/body-map.test.mjs`:

```js
test("感受会改变教育提示而不会声明诊断", () => {
  const tight = getRecommendations({ regionId: "neck", targetIds: [], symptomIds: ["tightness"], redFlagIds: [] });
  const neuro = getRecommendations({ regionId: "neck", targetIds: [], symptomIds: ["tingling"], redFlagIds: [] });
  assert.equal(tight.guidanceKey, "gentle-mobility");
  assert.equal(neuro.guidanceKey, "caution-neuro");
  assert.equal(neuro.status, "caution");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `node --test tests/body-map.test.mjs`

Expected: FAIL because current results do not expose the two exact `guidanceKey` values.

- [ ] **Step 3: Implement the visible three-step flow**

Make the three step cards buttons. Step 1 focuses the central region selector; step 2 focuses the feeling choices; step 3 focuses the result panel only when `getExplorerStep(state) === 3`. Show selected region and selected feelings inside completed steps.

Recommendation behavior:

```text
idle       -> 选择身体位置，不显示教程
incomplete -> 提示选择感受，不显示教程
ready      -> 显示匹配依据、1–3 个教程和 CTA
caution    -> 先显示谨慎提示，再显示低强度教程和 CTA
blocked    -> 显示专业评估建议，隐藏全部训练 CTA
```

Pass `symptomIds` and `onRequestStep` through `HomePage`. Preserve the existing tutorial navigation and URL state.

- [ ] **Step 4: Run all data tests**

Run: `npm test`

Expected: all tests pass; no recommendation test receives `ready` before a feeling is present.

- [ ] **Step 5: Commit the working flow**

```bash
git add src/bodyMap.js src/components/AssessmentPanel.jsx src/components/RecommendationPanel.jsx src/HomePage.jsx tests/body-map.test.mjs
git commit -m "feat: 让身体定位三步流程产生真实结果"
```

### Task 6: 参考图布局、底部区域卡与专业模式

**Files:**
- Create: `src/components/RegionRail.jsx`
- Create: `src/components/ProfessionalAnatomyPanel.jsx`
- Modify: `src/components/BodyExplorer.jsx`
- Modify: `src/HomePage.jsx`
- Modify: `src/styles.css`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: eight `bodyRegions`, `BodyRegionMap`, `JointRegionMap`, existing Z-Anatomy URL
- Produces: one-screen desktop layout and mobile step flow

- [ ] **Step 1: Capture the current 1440 × 900 baseline**

Open `http://127.0.0.1:5173/?region=knee` in the Codex in-app Browser at 1440 × 900. Save the accepted baseline screenshot to `qa/redesign-before-desktop.png` and inspect it. This is the failing visual state: floating muscle meshes, large top Hero and cropped central character must be visible.

- [ ] **Step 2: Implement the reference composition**

Rebuild `HomePage` into:

```text
home-nav
location-workspace
  mission-column
  character-stage
  result-column
region-rail
```

Remove the standalone Hero from the first viewport. Use the existing nighttime arena asset behind the character, a navy page background, white result card, coral current-location state and yellow primary CTA. `RegionRail` renders eight colored cards from `bodyRegions`; each uses a small `react-muscle-highlighter` body preview rather than CSS-drawn anatomy.

Implement responsive behavior at 1200 px, 960 px and 700 px. At 390 × 844, show one active step at a time and a fixed next-step control; keep every target at least 44 × 44 px.

- [ ] **Step 3: Move Z-Anatomy behind an explicit professional mode**

Extract the existing muscle scene into `ProfessionalAnatomyPanel.jsx` and load it with `React.lazy` only after the user opens “专业解剖模式”. The default stage never mounts `move-lab-muscles.glb`. Show a clear close button and the non-diagnostic education note.

- [ ] **Step 4: Run app and interaction smoke check**

Run: `npm test && npm run build && npm run test:sites`

Then verify in the in-app Browser:

1. default page shows the complete clothed character;
2. clicking knee keeps the character and opens the knee location map;
3. selecting two knee zones shows both selections;
4. selecting “酸紧／发僵” unlocks the recommendation CTA;
5. selecting a red flag removes the CTA;
6. professional mode opens and closes without changing selections;
7. tutorial navigation and browser Back restore state.

- [ ] **Step 5: Commit layout and professional mode**

```bash
git add src/components/RegionRail.jsx src/components/ProfessionalAnatomyPanel.jsx src/components/BodyExplorer.jsx src/HomePage.jsx src/styles.css src/main.jsx
git commit -m "feat: 还原游戏化身体定位首屏"
```

### Task 7: 视觉 QA、响应式验收与最终构建

**Files:**
- Modify: `design-qa.md`
- Create: `qa/redesign-after-desktop.png`
- Create: `qa/redesign-after-mobile.png`
- Create: `qa/redesign-comparison.png`
- Modify: source files only when fixing P0/P1/P2 findings

**Interfaces:**
- Consumes: user reference image and completed local page
- Produces: `design-qa.md` with `final result: passed`

- [ ] **Step 1: Read the Product Design QA instructions and capture matching states**

Read the complete Product Design `design-qa` skill. Capture the knee-selected state at 1440 × 900 and the same core flow at 390 × 844. Save and inspect both screenshots.

- [ ] **Step 2: Create a same-state visual comparison**

Place the user reference and `qa/redesign-after-desktop.png` side by side in `qa/redesign-comparison.png`. Compare layout proportions, character centering, content hierarchy, colors, spacing, borders, typography and the visibility of the 3-step flow.

- [ ] **Step 3: Fix all P0/P1/P2 findings**

Update `design-qa.md` with evidence tied to the comparison. Fix every P0/P1/P2, recapture the same states, and repeat until the report ends with:

```text
final result: passed
```

- [ ] **Step 4: Run final verification**

Run:

```bash
npm test
npm run test:sites
npm run build
npm run build:github
```

Expected: all Node tests pass; Sites and GitHub Pages builds finish successfully. In fresh desktop and mobile tabs, console error count is zero and `scrollWidth === clientWidth` on mobile.

- [ ] **Step 5: Commit verified output**

```bash
git add design-qa.md qa src public/assets/body-map public/assets/models package.json package-lock.json tests
git commit -m "test: 完成身体定位改版视觉验收"
```

Before committing, inspect `git status --short` and unstage any unrelated content-generation or `.workflow/` files.
