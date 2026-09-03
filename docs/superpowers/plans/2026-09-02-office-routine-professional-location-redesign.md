# MOVE LAB Office Routine And Professional Location Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已校验的 22 个办公室动作与 3 套计时课程接入网站，同时把身体定位改成单工作台，并让专业肌肉图可直接点击、聚焦和与膝部 8 区共同多选。

**Architecture:** 内容包通过显式 Node.js 导入脚本生成前端只读快照；计时逻辑放在纯函数状态机中，由 React 页面按时间戳驱动。身体定位继续以 `bodyMap.js` 为领域状态，新增专业点击与聚焦纯函数，UI 只消费这些契约；共享导航负责 `home / office / library` 三个真实视图。

**Tech Stack:** React 19、Vite 6、Node.js ESM、`node:test`、`react-muscle-highlighter` 1.2.0、`@phosphor-icons/react`、Three.js、Codex in-app Browser。

**Spec:** `docs/superpowers/specs/2026-09-02-office-routine-professional-location-redesign-design.md`

## Global Constraints

- 办公室放松只使用 `stretching-anatomy-cn` 的 22 个动作和 3 套课程。
- 5 分钟课程为 7 个动作、300 秒；10 分钟课程为 12 个动作、600 秒；15 分钟课程为 16 个动作、900 秒。
- 源内容包保持只读，不复制原书插图，不覆盖人工审阅文件。
- 22 个待原创图片必须显示统一的真实插画占位资产和“动作图制作中”，不得显示断图。
- 当前深蓝、多巴胺、游戏化视觉和中央着装 3D 人物继续保留。
- 专业人体图必须直接可点击，支持左右侧、多选、聚焦与查看全身。
- 膝部必须保留 8 个普通位置，并允许与专业肌群同时选择。
- 主观位置、肌群和感受不得被描述为诊断或受损组织结论。
- 红旗状态继续阻断训练 CTA。
- 桌面验收视口为 1440 × 900，移动验收视口为 390 × 844。
- 不提交 `.workflow/`，不覆盖主工作区未提交的 `stretching-anatomy-cn/`。
- 不发布；只有用户明确要求时才进入 Sites 托管流程。

## File Structure

- `scripts/import-office-content.mjs`：读取、规范化和校验内容包，写入前端快照。
- `src/data/officeContent.generated.json`：可独立构建的只读生成快照。
- `src/officeRoutine.js`：课程查找和基于时间戳的纯计时状态机。
- `src/components/SiteHeader.jsx`：身体定位、办公室放松、动作库和安全说明共享导航。
- `src/components/OfficeRoutinePage.jsx`：课程选择、播放器、动作队列和安全内容。
- `src/components/OfficeRoutineTimer.jsx`：当前动作、总剩余时间和播放控制。
- `src/components/LocationTaskPanel.jsx`：右侧唯一输入工作台。
- `src/components/AssessmentPanel.jsx`：左侧进度、摘要和安全状态。
- `src/components/ProfessionalAnatomyPanel.jsx`：可点击正背人体、聚焦、多选和膝部局部图。
- `src/components/RegionRail.jsx`：Phosphor 柔和区域图标卡。
- `src/professionalFocus.js`：专业点击解析和身体图聚焦配置。
- `src/App.jsx`、`src/HomePage.jsx`：共享路由、单工作台和页面联动。
- `src/styles.css`：导航、任务栏、专业聚焦、办公室播放器和响应式视觉。
- `public/assets/office/office-action-pending.png`：统一的原创动作图待制作插画资产。
- `tests/office-content.test.mjs`：导入快照和失败校验。
- `tests/office-routine.test.mjs`：时间戳计时状态机。
- `tests/professional-location.test.mjs`：专业点击、多候选和聚焦配置。
- `tests/home-flow.test.mjs`：单工作台的步骤与摘要纯函数。
- `tests/body-region-map-component.test.mjs`：组件接线、导航和可访问性静态检查。

---

### Task 1: 办公室内容导入与生成快照

**Files:**
- Create: `scripts/import-office-content.mjs`
- Create: `src/data/officeContent.generated.json`
- Create: `tests/office-content.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `loadOfficeContent(sourceDir) -> Promise<OfficeContentSnapshot>`
- Produces: `validateOfficeContent(snapshot) -> OfficeContentSnapshot` or throws a precise `Error`
- Produces: `writeOfficeContent({ sourceDir, outputFile }) -> Promise<OfficeContentSnapshot>`
- Produces: `npm run import:office-content -- --source "/Users/bevol-1/Documents/能量圈公众号/06_测试素材/网页/运动姿势引导-v1/stretching-anatomy-cn"`
- Snapshot shape: `{ contentPack, regions, muscles, actions, programs, modelBindings, muscleToActions }`

- [ ] **Step 1: Write the failing import and validation tests**

Create `tests/office-content.test.mjs` with independently derived expectations:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const importer = await import("../scripts/import-office-content.mjs").catch(() => ({}));
const { validateOfficeContent = () => undefined } = importer;

test("生成快照包含 22 个动作和三个精确时长课程", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../src/data/officeContent.generated.json", import.meta.url), "utf8"));
  assert.equal(snapshot.actions.length, 22);
  assert.deepEqual(snapshot.programs.map(({ id, totalSeconds, items }) => [id, totalSeconds, items.length]), [
    ["program.office.micro_5", 300, 7],
    ["program.office.reset_10", 600, 12],
    ["program.office.deep_15", 900, 16],
  ]);
  assert.ok(snapshot.actions.every((action) => action.imageStatus === "待原创制作"));
});

test("课程引用未知动作时导入失败", () => {
  assert.throws(() => validateOfficeContent({
    actions: [{ id: "known" }],
    programs: [{ id: "program", totalSeconds: 30, items: [{ actionId: "missing", seconds: 30 }] }],
  }), /program.*missing/);
});

test("课程声明时长与动作秒数不一致时导入失败", () => {
  assert.throws(() => validateOfficeContent({
    actions: [{ id: "known" }],
    programs: [{ id: "program", totalSeconds: 60, items: [{ actionId: "known", seconds: 30 }] }],
  }), /program.*60.*30/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/office-content.test.mjs`

Expected: FAIL because the importer and generated snapshot do not exist.

- [ ] **Step 3: Implement the explicit importer**

Implement ESM helpers in `scripts/import-office-content.mjs`:

```js
export function validateOfficeContent(snapshot) {
  const actionIds = new Set(snapshot.actions.map((action) => action.id));
  for (const program of snapshot.programs) {
    const calculated = program.items.reduce((sum, item) => sum + item.seconds, 0);
    if (calculated !== program.totalSeconds) {
      throw new Error(`${program.id} 声明 ${program.totalSeconds} 秒，但动作合计 ${calculated} 秒`);
    }
    for (const item of program.items) {
      if (!actionIds.has(item.actionId)) throw new Error(`${program.id} 引用了未知动作 ${item.actionId}`);
    }
  }
  return snapshot;
}
```

`loadOfficeContent(sourceDir)` reads manifest, action index, every indexed `content.json`, three program files, `anatomy/body-regions.json`, `anatomy/muscles.json`, `anatomy/model-bindings.json`, and `mappings/muscle-to-actions.json`. Normalize Chinese source fields into stable English keys while preserving all user-facing Chinese content, source pages, review status, stop conditions and contraindications.

When invoked directly, parse `--source` and `--output`; default output is `src/data/officeContent.generated.json`. The default source candidate order is `stretching-anatomy-cn/` under the project root, then `../../stretching-anatomy-cn/` for the isolated worktree layout. Never write inside the source directory.

Add to `package.json`:

```json
"import:office-content": "node scripts/import-office-content.mjs"
```

Run the importer against the supplied absolute source path and commit the generated JSON snapshot.

- [ ] **Step 4: Run the import test and verify GREEN**

Run: `node --test tests/office-content.test.mjs`

Expected: 3 tests pass; snapshot reports 22 actions and 300/600/900 seconds.

- [ ] **Step 5: Commit the content boundary**

```bash
git add package.json scripts/import-office-content.mjs src/data/officeContent.generated.json tests/office-content.test.mjs
git commit -m "feat: 接入办公室放松内容快照"
```

### Task 2: 可靠课程计时状态机

**Files:**
- Create: `src/officeRoutine.js`
- Create: `tests/office-routine.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `OfficeProgram.items[{ actionId, seconds, guidance }]`
- Produces: `createRoutineState(program, nowMs) -> RoutineState`
- Produces: `advanceRoutineState(state, program, nowMs) -> RoutineState`
- Produces: `pauseRoutine(state, nowMs) -> RoutineState`
- Produces: `resumeRoutine(state, nowMs) -> RoutineState`
- Produces: `moveRoutine(state, program, direction, nowMs) -> RoutineState`
- Produces: `getRoutineProgress(state, program, nowMs) -> { actionRemaining, totalRemaining, completedSeconds, percent }`

- [ ] **Step 1: Write failing deterministic timer tests**

Create `tests/office-routine.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceRoutineState,
  createRoutineState,
  getRoutineProgress,
  pauseRoutine,
  resumeRoutine,
} from "../src/officeRoutine.js";

const program = {
  totalSeconds: 100,
  items: [
    { actionId: "a", seconds: 40 },
    { actionId: "b", seconds: 60 },
  ],
};

test("后台经过 45 秒后直接进入第二动作并保留 55 秒", () => {
  const initial = createRoutineState(program, 1_000);
  const next = advanceRoutineState(initial, program, 46_000);
  assert.equal(next.itemIndex, 1);
  assert.equal(getRoutineProgress(next, program, 46_000).actionRemaining, 55);
  assert.equal(getRoutineProgress(next, program, 46_000).totalRemaining, 55);
});

test("暂停期间时间不减少，继续后从冻结秒数计时", () => {
  const initial = createRoutineState(program, 0);
  const paused = pauseRoutine(initial, 10_000);
  assert.equal(getRoutineProgress(paused, program, 80_000).totalRemaining, 90);
  const resumed = resumeRoutine(paused, 80_000);
  assert.equal(getRoutineProgress(resumed, program, 85_000).totalRemaining, 85);
});

test("超过课程总时长后停在完成态且剩余为零", () => {
  const initial = createRoutineState(program, 0);
  const completed = advanceRoutineState(initial, program, 120_000);
  assert.equal(completed.status, "completed");
  assert.equal(getRoutineProgress(completed, program, 120_000).totalRemaining, 0);
});
```

- [ ] **Step 2: Run the timer test and verify RED**

Run: `node --test tests/office-routine.test.mjs`

Expected: FAIL because `src/officeRoutine.js` does not exist.

- [ ] **Step 3: Implement timestamp-based minimal timer**

Store `elapsedBeforePlayMs`, `startedAtMs`, `itemIndex`, and `status`. Derive total elapsed from timestamps, then walk literal program item seconds to select the active action. `advanceRoutineState` skips every expired action in one calculation, so background tabs do not replay stale actions. `pauseRoutine` freezes elapsed; `resumeRoutine` creates a new start timestamp. `moveRoutine` resets elapsed to the exact cumulative boundary of the neighboring action.

Expose `getOfficeProgram(programId)` and `getOfficeAction(actionId)` using the generated snapshot; unknown IDs return `undefined`, never silently substitute another program.

Update the `test` script to include both new test files.

- [ ] **Step 4: Verify timer and content tests GREEN**

Run: `node --test tests/office-content.test.mjs tests/office-routine.test.mjs`

Expected: 6 tests pass with zero failures.

- [ ] **Step 5: Commit the timer contract**

```bash
git add package.json src/officeRoutine.js tests/office-routine.test.mjs
git commit -m "feat: 增加办公室课程计时状态机"
```

### Task 3: 共享导航与办公室课程页面

**Files:**
- Create: `src/components/SiteHeader.jsx`
- Create: `src/components/OfficeRoutinePage.jsx`
- Create: `src/components/OfficeRoutineTimer.jsx`
- Create: `public/assets/office/office-action-pending.png`
- Modify: `src/App.jsx`
- Modify: `src/HomePage.jsx`
- Modify: `src/TutorialLibrary.jsx`
- Modify: `src/styles.css`
- Modify: `tests/body-region-map-component.test.mjs`

**Interfaces:**
- Consumes: `getOfficeProgram`, `getOfficeAction`, timer pure functions from Task 2.
- Produces: `<SiteHeader activeView onNavigate />`
- Produces: `<OfficeRoutinePage programId onSelectProgram onNavigate />`
- Produces: URL state such as `?view=office&program=program.office.micro_5`.

- [ ] **Step 1: Generate and inspect the missing-image illustration asset**

Generate one 4:3 raster illustration using the supplied MOVE LAB screenshot as art-direction reference: a clothed office worker in a neutral ready posture, friendly game-style rendering, deep navy/yellow/coral/blue palette, no text, no anatomical organs, no implied action-specific technique. Save it as `public/assets/office/office-action-pending.png` and inspect the final raster before use.

- [ ] **Step 2: Write failing navigation and office component checks**

Extend `tests/body-region-map-component.test.mjs` to parse real JSX and assert behavior-bearing wiring:

```js
test("共享导航提供四个醒目的真实入口", async () => {
  const source = await readFile(new URL("../src/components/SiteHeader.jsx", import.meta.url), "utf8");
  for (const label of ["身体定位", "办公室放松", "动作库", "安全说明"]) assert.match(source, new RegExp(label));
  assert.match(source, /onNavigate/);
});

test("办公室播放器使用真实课程动作和完整控制", async () => {
  const source = await readFile(new URL("../src/components/OfficeRoutineTimer.jsx", import.meta.url), "utf8");
  for (const label of ["暂停", "继续", "上一个", "下一个", "重新开始"]) assert.match(source, new RegExp(label));
  assert.match(source, /aria-live="polite"/);
});
```

- [ ] **Step 3: Run the component test and verify RED**

Run: `node --test tests/body-region-map-component.test.mjs`

Expected: FAIL because `SiteHeader` and office components do not exist.

- [ ] **Step 4: Implement the shared view routing**

In `App.jsx`, add view transitions without changing the existing explorer state contract:

```js
const navigate = (view, extra = {}) => writeUrl({ ...explorerState, view, ...extra });
```

`readUrlState` accepts `view=office` and only accepts the three known program IDs. Unknown programs open the course chooser. `SiteHeader` receives the active view and uses buttons for page views plus an anchor for `#safety-note` when already on the home page.

Move the existing brand and nav markup from `HomePage` into `SiteHeader`; render it from Home, Office and Library so tab placement never jumps.

- [ ] **Step 5: Implement course chooser and player**

`OfficeRoutinePage` renders 5/10/15-minute cards from generated data. When a program is selected, create local timer state and render:

- current action title and action count;
- action countdown and total remaining;
- guide emphasis, start pose, steps, breathing, intensity, common mistakes, stop conditions and contraindications;
- pause/resume, previous, next and reset controls;
- queued actions with current/completed states;
- review badge when `reviewStatus` contains `上线前需专业复核`;
- the generated pending illustration and “动作图制作中” for `imageStatus === "待原创制作"`.

Use a 250 ms interval only to update a `nowMs` render value; all countdown values come from Task 2 pure functions. When the document becomes visible again, immediately call `advanceRoutineState` with the current timestamp so elapsed background time advances to the correct action instead of replaying stale seconds.

- [ ] **Step 6: Style desktop and mobile office flows**

Desktop: course cards in a bright three-column row; player content left and timer/queue right. Mobile: horizontally scrollable main tabs, timer controls remain visible, content scrolls vertically. Use real Phosphor icons for all controls; no text glyphs or CSS drawings.

- [ ] **Step 7: Verify the office page GREEN**

Run: `node --test tests/office-content.test.mjs tests/office-routine.test.mjs tests/body-region-map-component.test.mjs`

Expected: all focused tests pass.

- [ ] **Step 8: Commit the office experience**

```bash
git add src/App.jsx src/HomePage.jsx src/TutorialLibrary.jsx src/components/SiteHeader.jsx src/components/OfficeRoutinePage.jsx src/components/OfficeRoutineTimer.jsx src/styles.css public/assets/office/office-action-pending.png tests/body-region-map-component.test.mjs
git commit -m "feat: 增加办公室放松课程页面"
```

### Task 4: 专业肌肉点击、聚焦与膝部并列选择

**Files:**
- Create: `src/professionalFocus.js`
- Create: `tests/professional-location.test.mjs`
- Modify: `src/bodyRegionMap.js`
- Modify: `src/components/ProfessionalAnatomyPanel.jsx`
- Modify: `src/components/BodyExplorer.jsx`
- Modify: `src/styles.css`
- Modify: `tests/body-region-map-component.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `resolveProfessionalPress({ slug, regionId, side }) -> { type, targetId?, targetIds, side, focusKey }`
- Produces: `getProfessionalFocus(focusKey) -> { scale, originX, originY }`
- Professional panel consumes existing `onToggleTarget(targetId, side)`.

- [ ] **Step 1: Write failing click resolution and focus tests**

Create `tests/professional-location.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { getProfessionalFocus, resolveProfessionalPress } from "../src/professionalFocus.js";

test("唯一映射的肌肉图点击可直接选择并保留侧别", () => {
  assert.deepEqual(resolveProfessionalPress({ slug: "deltoids", regionId: "shoulder", side: "left" }), {
    type: "toggle",
    targetId: "deltoid",
    targetIds: ["deltoid"],
    side: "left",
    focusKey: "shoulder-left",
  });
});

test("多肌肉映射先聚焦再让用户精确选择", () => {
  const result = resolveProfessionalPress({ slug: "upper-back", regionId: "shoulder", side: "right" });
  assert.equal(result.type, "choose");
  assert.deepEqual(result.targetIds, ["infraspinatus", "rhomboids"]);
  assert.equal(result.focusKey, "shoulder-right");
});

test("膝部聚焦比躯干更近且锚点保持在画布内", () => {
  const knee = getProfessionalFocus("knee-left");
  const thorax = getProfessionalFocus("thorax");
  assert.ok(knee.scale > thorax.scale);
  assert.ok([knee.originX, knee.originY].every((value) => value >= 0 && value <= 100));
});
```

- [ ] **Step 2: Run the professional test and verify RED**

Run: `node --test tests/professional-location.test.mjs`

Expected: FAIL because `professionalFocus.js` does not exist.

- [ ] **Step 3: Implement press resolution and focus presets**

Use `getTargetIdsForBodySlug(slug, regionId)` from `bodyRegionMap.js`. A single candidate returns `toggle`; multiple candidates return `choose`. Map all eight region IDs and left/right variants to literal focus presets; full-body fallback is `{ scale: 1, originX: 50, originY: 50 }`.

For current examples, ensure `upper-back/shoulder` maps both `infraspinatus` and `rhomboids` by correcting `targetRegionsBySlug`, while `middle-lower-trapezius` remains on `trapezius/shoulder`.

- [ ] **Step 4: Wire direct body clicks and ambiguous choices**

Add `onBodyPartPress={(part, side) => handlePress(part.slug, side)}` to both `<Body>` instances. Remove the CSS rule that disables pointer events. On `toggle`, call `onToggleTarget(targetId, side)`. On `choose`, store the candidate IDs and render a focused choice tray; buttons call `onToggleTarget(candidateId, side)`.

Apply focus styles to the clicked figure:

```jsx
<div className="professional-anatomy__viewport" style={{ "--focus-scale": focus.scale, "--focus-x": `${focus.originX}%`, "--focus-y": `${focus.originY}%` }}>
  <Body
    data={bodyData}
    side="front"
    gender="male"
    defaultFill={getBodyPartFill()}
    defaultStroke="#9aacbf"
    defaultStrokeWidth={1}
    onBodyPartPress={(part, side) => handlePress(part.slug, side)}
  />
</div>
```

Add a “查看全身” button that clears focus and the ambiguous tray but does not clear selected targets.

- [ ] **Step 5: Add knee local zones beside muscle selection**

When `regionId === "knee"`, render `JointRegionMap` below the focused body using the same `selectedIds` and `onToggleTarget`. Keep muscle controls visible in a separate group named “可能相关肌群”; do not merge subjective zones with professional names.

- [ ] **Step 6: Update component assertions and verify GREEN**

Change the existing test that asserts `onBodyPartPress` is absent. It must now assert both professional `<Body>` elements include `onBodyPartPress`, the ordinary `BodyRegionMap` remains keyboard-equivalent only, and the professional body grid no longer has `pointer-events: none`.

Run: `node --test tests/body-region-map.test.mjs tests/professional-location.test.mjs tests/body-region-map-component.test.mjs`

Expected: all focused tests pass.

- [ ] **Step 7: Commit the professional interaction**

```bash
git add package.json src/professionalFocus.js src/bodyRegionMap.js src/components/ProfessionalAnatomyPanel.jsx src/components/BodyExplorer.jsx src/styles.css tests/professional-location.test.mjs tests/body-region-map-component.test.mjs
git commit -m "feat: 支持专业肌肉点击与膝部精细定位"
```

### Task 5: 单工作台、任务摘要与区域卡视觉

**Files:**
- Create: `src/components/LocationTaskPanel.jsx`
- Modify: `src/components/AssessmentPanel.jsx`
- Modify: `src/components/RegionRail.jsx`
- Modify: `src/HomePage.jsx`
- Modify: `src/homeFlow.js`
- Modify: `src/styles.css`
- Modify: `tests/home-flow.test.mjs`
- Modify: `tests/body-region-map-component.test.mjs`

**Interfaces:**
- Produces: `getTaskSummary({ region, selectedTargets, selectedSymptoms, result })`
- Produces: `<LocationTaskPanel ... />` as the only symptom and safety input surface.
- Assessment panel consumes summary only; it does not receive symptom change callbacks.

- [ ] **Step 1: Write failing single-workspace summary tests**

Extend `tests/home-flow.test.mjs`:

```js
test("左侧任务摘要只显示已选状态，不复制输入控件", () => {
  assert.deepEqual(getTaskSummary({
    regionLabel: "膝盖",
    targetLabels: ["膝盖内侧", "股内侧肌"],
    symptomLabels: ["酸紧 / 发僵"],
    resultStatus: "ready",
  }), {
    location: "膝盖 · 2 个具体位置",
    feeling: "酸紧 / 发僵",
    recommendation: "建议已生成",
  });
});
```

Extend the JSX AST test so `AssessmentPanel.jsx` contains no `choice-grid`, no `onChangeSymptoms`, and no `onChangeRedFlags`; `LocationTaskPanel.jsx` must import `symptoms`, `redFlags`, `BodyLocationSelector`, and `RecommendationPanel`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/home-flow.test.mjs tests/body-region-map-component.test.mjs`

Expected: FAIL because the summary helper and `LocationTaskPanel` do not exist and Assessment still owns inputs.

- [ ] **Step 3: Move all active inputs into the right task panel**

Create `LocationTaskPanel` that renders, in order:

1. `BodyLocationSelector` for precise location;
2. symptoms multi-select;
3. red-flag safety check;
4. `RecommendationPanel`.

Keep existing toggle semantics and 44 px targets. The panel derives its visible phase from `getExplorerStep(value)` and keeps finished sections as compact editable summaries.

Refactor `AssessmentPanel` to display only the three task cards, selected labels, safety status and education note. It receives `region`, `selectedTargets`, `selectedSymptoms`, `result`, and `onRequestStep`.

- [ ] **Step 4: Replace bottom anatomy thumbnails with Phosphor icons**

Remove `react-muscle-highlighter` from `RegionRail`. Use a literal icon map built from `PersonSimple`, `PersonArmsSpread`, `PersonSimpleThrow`, `PersonSimpleTaiChi`, `PersonSimpleRun`, `PersonSimpleWalk`, and `SneakerMove`. Where two regions share an icon, differentiate with card color and label; do not create handcrafted SVG or CSS anatomy art.

Increase region title to 15–16 px and supporting copy to 11–12 px. Add a restrained navy text shadow or semi-transparent navy label backing. Keep the white double-outline and check for the selected card.

- [ ] **Step 5: Correct header and mission alignment**

Set shared navigation label size to 17–18 px and a minimum 44 px hit height. Replace mission banner positional offsets with grid rows and consistent `padding-inline`; align its left edge with the task cards. Preserve the established navy/yellow/coral/blue palette and current arena background.

- [ ] **Step 6: Verify single-workspace tests GREEN**

Run: `node --test tests/home-flow.test.mjs tests/body-region-map-component.test.mjs`

Expected: all focused tests pass.

- [ ] **Step 7: Commit the unified workspace**

```bash
git add src/HomePage.jsx src/homeFlow.js src/components/AssessmentPanel.jsx src/components/LocationTaskPanel.jsx src/components/RegionRail.jsx src/styles.css tests/home-flow.test.mjs tests/body-region-map-component.test.mjs
git commit -m "feat: 重构身体定位单工作台"
```

### Task 6: 全量回归、真实浏览器验收与设计 QA

**Files:**
- Modify: `design-qa.md`
- Modify only if verification finds a scoped defect: files from Tasks 1–5 and their tests.

**Interfaces:**
- Consumes: all previous task deliverables.
- Produces: fresh passing test/build evidence and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all existing and new tests pass with zero failures.

- [ ] **Step 2: Run both production builds**

Run: `npm run build`

Expected: Vite, Sites preparation and release-asset verification exit 0.

Run: `npm run build:github`

Expected: GitHub Pages build and release-asset verification exit 0.

Run: `npm run test:sites`

Expected: 4 Sites worker tests pass.

- [ ] **Step 3: Start or reuse the in-app Browser preview**

Run the existing Vite server on port 5188 and verify its PID/cwd before use. Open the in-app Browser at the local preview; do not use Chrome unless the user requests it.

- [ ] **Step 4: Verify the desktop core flow at 1440 × 900**

Exercise and capture:

1. default body-location screen;
2. knee selection and all 8 local zones;
3. professional mode direct muscle click, ambiguous choice, multi-select and “查看全身”;
4. symptom and safety selection in the right panel;
5. ready and blocked recommendation states;
6. office 5-minute course, pause/resume/previous/next/reset;
7. navigation among body location, office, library and safety.

Check console errors after the flow.

- [ ] **Step 5: Verify the mobile core flow at 390 × 844**

Repeat body-location, professional selection and office timer flows. Confirm no horizontal overflow, tabs remain reachable, 3D person stays centered and timer controls remain visible.

- [ ] **Step 6: Run blocking visual comparison**

Read the `product-design:design-qa` skill. Open the user reference image and the latest 1440 × 900 implementation screenshot together, record findings in `design-qa.md`, fix all P0/P1/P2 findings, recapture and repeat until the file ends with:

```text
final result: passed
```

Remaining P3 polish may be listed as follow-up notes only.

- [ ] **Step 7: Run fresh final verification after the last visual fix**

Run: `npm test && npm run build && npm run build:github && npm run test:sites`

Expected: every command exits 0 after the final code change.

- [ ] **Step 8: Commit verification artifacts**

```bash
git add design-qa.md src/App.jsx src/HomePage.jsx src/TutorialLibrary.jsx src/bodyRegionMap.js src/homeFlow.js src/officeRoutine.js src/professionalFocus.js src/styles.css src/components/AssessmentPanel.jsx src/components/BodyExplorer.jsx src/components/LocationTaskPanel.jsx src/components/OfficeRoutinePage.jsx src/components/OfficeRoutineTimer.jsx src/components/ProfessionalAnatomyPanel.jsx src/components/RegionRail.jsx tests/body-region-map-component.test.mjs tests/body-region-map.test.mjs tests/home-flow.test.mjs tests/office-content.test.mjs tests/office-routine.test.mjs tests/professional-location.test.mjs
git commit -m "test: 完成办公室放松与定位改版验收"
```
