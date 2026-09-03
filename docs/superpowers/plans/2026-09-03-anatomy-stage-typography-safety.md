# 解剖舞台、字体与安全说明实施计划

> **执行要求：** 使用 `superpowers:executing-plans` 按任务顺序实施；每个功能先写失败测试，再写最小实现，并在进入下一任务前运行对应测试。

**目标：** 将 3D 人体和专业解剖改成中央舞台的同级模式，补齐男女与正/侧/背视角、缩放和完整肌肉选择入口，移除遮挡肌肉的关节编号，同时建立可读字号层级与真实安全说明。

**总体结构：** `BodyExplorer` 负责中央模式及观察偏好，现有 `ProfessionalAnatomyPanel` 从弹窗改为舞台内面板；身体区域、目标和症状继续由 `HomePage` 的既有状态统一管理。正背面复用 `react-muscle-highlighter`，侧面使用项目自有男女教育插图和透明热区；所有图形选择都由共享文字目标列表兜底。右栏只承担文字定位、感受、安全筛查和推荐，完整安全说明放在主页正文、署名单独留在页脚。

**技术栈：** React 19、Vite、Three.js、`react-muscle-highlighter`、Phosphor Icons、原生 CSS、Node `node:test`、Babel AST 测试、项目现有 `sharp` 资源检查。

**设计依据：** `docs/superpowers/specs/2026-09-03-anatomy-stage-typography-safety-design.md`

---

## Task 1：锁定解剖观察状态与缩放边界

**文件：**

- 修改：`src/professionalFocus.js`
- 修改：`tests/professional-location.test.mjs`

### Step 1：先写失败测试

在 `tests/professional-location.test.mjs` 中补充以下契约：

- 默认观察偏好为 `male / front / 1`。
- 性别只允许 `male`、`female`；视角只允许 `front`、`side`、`back`。
- 缩放从 `0.8` 到 `2`，步长 `0.2`，连续放大/缩小会被夹在边界内。
- 复位返回 `1`，且不会修改身体区域或目标选择数据。

测试调用即将新增的 `ANATOMY_DEFAULTS`、`normalizeAnatomyPreference`、`getNextAnatomyZoom`，使测试先因导出不存在而失败。

### Step 2：运行测试确认红灯

运行：

```bash
node --test tests/professional-location.test.mjs
```

预期：新增导出或断言失败，原有肌肉点击与聚焦测试仍可运行。

### Step 3：写最小纯函数实现

在 `src/professionalFocus.js` 中新增不可变默认值和纯函数：

```js
export const ANATOMY_DEFAULTS = Object.freeze({ sex: "male", view: "front", zoom: 1 });
export const ANATOMY_ZOOM_MIN = 0.8;
export const ANATOMY_ZOOM_MAX = 2;
export const ANATOMY_ZOOM_STEP = 0.2;

export function normalizeAnatomyPreference(value = {}) { /* 白名单归一化 */ }
export function getNextAnatomyZoom(current, direction) { /* 按步长变化并夹在边界内 */ }
```

浮点值在返回前保留一位小数，避免界面出现 `1.2000000002`。

### Step 4：运行测试确认绿灯

运行：

```bash
node --test tests/professional-location.test.mjs
```

预期：全部通过。

### Step 5：提交

```bash
git add src/professionalFocus.js tests/professional-location.test.mjs
git commit -m "test: 锁定解剖观察与缩放状态"
```

---

## Task 2：把专业解剖改成中央同级模式

**文件：**

- 修改：`src/components/BodyExplorer.jsx`
- 修改：`src/components/ProfessionalAnatomyPanel.jsx`
- 修改：`tests/body-region-map-component.test.mjs`

### Step 1：改写组件契约测试并确认失败

更新 `tests/body-region-map-component.test.mjs`：

- `BodyExplorer` 必须包含标注为 `3D 人体`、`专业解剖` 的 tab 按钮，且专业解剖不再依赖先选区域才可进入。
- `ProfessionalAnatomyPanel` 不得出现 `<dialog>`、`showModal`、`onClose` 或关闭按钮。
- 专业解剖正/背视角只渲染一个当前 `Body`，其 `side` 和 `gender` 由 props 传入；侧面视图在 Task 3 与资源一起加入。
- 保留 `react-muscle-highlighter`、图形点击和 `JointRegionMap`，继续禁止 legacy GLB、React Three Fiber 和 Drei。
- `Suspense` 加载态必须是中央舞台内 `role="status"`，不能是 loading dialog。

运行：

```bash
node --test tests/body-region-map-component.test.mjs
```

预期：测试因当前仍是弹窗、双人体和缺少一级 tab 而失败。

### Step 2：让 `BodyExplorer` 拥有观察偏好

在 `BodyExplorer` 内新增：

- `explorerMode`：默认 `3d`。
- `anatomySex`、`anatomyView`、`anatomyZoom`：用 Task 1 的纯函数初始化和更新。
- 区域变化时只复位解剖缩放与局部聚焦，不清空 `selectedIds`、`selectedSides`。

舞台顶部新增同级 tablist。3D 模式显示原 `BodyScene` 及 3D 控件；专业解剖模式显示 lazy-loaded 内联面板。删除 `professionalOpen`、触发按钮、焦点返回和 `ProfessionalLoadingDialog`。

### Step 3：把专业面板从 dialog 改为 inline section

在 `ProfessionalAnatomyPanel.jsx`：

- 根节点改为 `<section className="professional-anatomy-stage">`。
- 通过 props 接收 `sex`、`view`、`zoom` 及其更新回调。
- 标题下方先增加男生/女生、正面/背面、缩小/比例/放大/复位三组控件；Task 3 再把侧面加入同一视角组。
- 正面或背面只渲染一个 `Body`；当前 `sex` 直接传给 `gender`。
- 保留当前目标、共用热区候选项、完整肌肉按钮和关节细分图。
- 画布缩放只作用于人体 viewport，工具与文字选项不随之缩放。

### Step 4：运行测试并检查旧逻辑残留

运行：

```bash
node --test tests/body-region-map-component.test.mjs tests/professional-location.test.mjs
rg -n "showModal|<dialog|professionalOpen|move-lab-muscles\.glb" src/components/BodyExplorer.jsx src/components/ProfessionalAnatomyPanel.jsx
```

预期：测试通过；搜索无弹窗状态、`showModal` 和旧 GLB 命中。

### Step 5：提交

```bash
git add src/components/BodyExplorer.jsx src/components/ProfessionalAnatomyPanel.jsx tests/body-region-map-component.test.mjs
git commit -m "feat: 将专业解剖并入中央舞台"
```

---

## Task 3：补齐男女侧面解剖图和可点击热区

**执行前技能：** 读取并使用 `imagegen`；明确生成的是无文字、无编号、非诊断用途的原创教育插图。生成后必须目检，不合格时重新生成，不能把错误肢体或明显错误的肌肉走向带入页面。

**文件：**

- 新增：`public/assets/body-map/anatomy-side-male.png`
- 新增：`public/assets/body-map/anatomy-side-female.png`
- 新增：`src/components/SideAnatomyFigure.jsx`
- 修改：`src/bodyRegionMap.js`
- 修改：`src/components/ProfessionalAnatomyPanel.jsx`
- 修改：`tests/body-region-map.test.mjs`
- 修改：`tests/body-assets.test.mjs`
- 修改：`tests/body-region-map-component.test.mjs`

### Step 1：先锁定资源与数据契约

新增失败测试：

- 两张侧面图都存在、可解码、尺寸一致，长边足以支持中央画布，且不是空白或极小占位图。
- `sideAnatomyHotspots` 的每项包含 `slug`、`label`、百分比矩形和至少 44 px 的交互下限。
- 热区覆盖颈、肩、胸背、腰、髋、大腿、膝、小腿和踝的侧面入口。
- 所有热区 slug 都能通过现有 `getTargetIdsForBodySlug` 找到至少一个已配置目标。
- `SideAnatomyFigure` 根据 `sex` 切换资源，并将点击交给现有 `resolveProfessionalPress` 路径，而不是维护第二套选择逻辑。

运行：

```bash
node --test tests/body-region-map.test.mjs tests/body-assets.test.mjs tests/body-region-map-component.test.mjs
```

预期：因资源、热区和组件不存在而失败。

### Step 2：生成并检查两张项目自有侧面图

分别生成男性和女性左侧站立全身肌肉教育插图，统一画幅、姿势、色彩、光照和留白；不含文字、编号、器官、裸体细节或诊断标注。保存到上述固定路径。

目检要求：

- 头、躯干、双臂、双腿数量正确，无多余肢体和断裂轮廓。
- 人物完整处在画布中，关键肌肉纹理没有被裁切。
- 男女两图构图一致，切换时不产生明显跳位。
- 背景干净，叠加透明热区后仍清晰。

### Step 3：实现热区与侧面组件

在 `bodyRegionMap.js` 定义并冻结百分比热区数据。`SideAnatomyFigure` 渲染：

- 与性别对应的图片和明确的替代文本。
- 只显示当前区域相关的透明按钮；按钮有 `aria-label`、可见 focus ring 和至少 44 px 点击尺寸。
- 选中/聚焦时只用轮廓与轻透明色，不用大号圆标遮挡肌肉。
- 点击回传 slug，继续走专业面板已有的唯一命中/候选命中逻辑。

### Step 4：运行测试

```bash
node --test tests/body-region-map.test.mjs tests/body-assets.test.mjs tests/body-region-map-component.test.mjs tests/professional-location.test.mjs
```

预期：全部通过。

### Step 5：提交

```bash
git add public/assets/body-map/anatomy-side-male.png public/assets/body-map/anatomy-side-female.png src/components/SideAnatomyFigure.jsx src/bodyRegionMap.js src/components/ProfessionalAnatomyPanel.jsx tests/body-region-map.test.mjs tests/body-assets.test.mjs tests/body-region-map-component.test.mjs
git commit -m "feat: 增加男女侧面解剖视图"
```

---

## Task 4：确保所有肌肉都有文字选择入口，并清理右栏重复人体

**文件：**

- 新增：`src/components/TargetSelectionList.jsx`
- 修改：`src/components/BodyExplorer.jsx`
- 修改：`src/components/ProfessionalAnatomyPanel.jsx`
- 修改：`src/components/LocationTaskPanel.jsx`
- 修改：`src/HomePage.jsx`
- 修改：`tests/body-region-map-component.test.mjs`
- 修改：`tests/home-flow.test.mjs`

### Step 1：先写失败测试

增加以下契约：

- `TargetSelectionList` 对 `getRegionTargets(regionId)` 返回的每个目标都生成一个真实按钮，而不只列 `kind === "muscle"` 的浅层目标。
- 每个按钮有 `aria-pressed`、44 px 点击目标标记和目标名称。
- `ProfessionalAnatomyPanel` 与右栏 `BodyLocationSelector` 都复用该列表。
- 右栏不再导入或渲染 `BodyRegionMap`；`HomePage` 不再把 `viewSide` 控制传给右栏。
- 未选区域时仍显示清楚的起步提示；选区后可只用文字完成定位。

运行：

```bash
node --test tests/body-region-map-component.test.mjs tests/home-flow.test.mjs
```

预期：因共享组件不存在且右栏仍含人体图而失败。

### Step 2：实现共享完整目标列表

`TargetSelectionList` 接收 `targets`、`selectedIds`、`onToggleTarget` 和可选标题。组件负责：

- 完整渲染当前区域目标，按现有数据顺序，不新增推测性肌肉。
- 使用目标颜色、名称和选中态，但不把颜色作为唯一状态。
- 允许同一目标再次点击取消。
- 没有目标时返回清晰的“大区域已选择”说明。

专业解剖的候选项仍保留，因为它表达“同一个图形热区包含多块肌肉”；候选项之后继续展示完整列表。

### Step 3：把右栏改成文字定位工作台

在 `BodyLocationSelector` 删除 `BodyRegionMap` 和 `JointRegionMap` 分支，改为目标摘要加 `TargetSelectionList`。关节插图只出现在中央专业解剖；用户停留在 3D 模式时仍可用右栏完整文字按钮选中关节或肌肉目标。

同步删除 `LocationTaskPanel`、`HomePage` 已无用途的 `viewSide` 与 `onChangeViewSide` 传参，但保留 3D 舞台自己的 `value.viewSide`。

### Step 4：运行测试

```bash
node --test tests/body-region-map-component.test.mjs tests/home-flow.test.mjs tests/body-map.test.mjs
```

预期：全部通过，且推荐逻辑测试未发生变化。

### Step 5：提交

```bash
git add src/components/TargetSelectionList.jsx src/components/BodyExplorer.jsx src/components/ProfessionalAnatomyPanel.jsx src/components/LocationTaskPanel.jsx src/HomePage.jsx tests/body-region-map-component.test.mjs tests/home-flow.test.mjs
git commit -m "fix: 补全肌肉文字定位入口"
```

---

## Task 5：把关节大号编号移出肌肉画面

**文件：**

- 修改：`src/components/JointRegionMap.jsx`
- 修改：`src/bodyRegionMap.js`
- 修改：`src/styles.css`
- 修改：`tests/body-region-map.test.mjs`
- 修改：`tests/body-region-map-component.test.mjs`

### Step 1：先将旧标注契约改成失败测试

删除对 44 px 图内 marker 矩形的旧期望，新增：

- `JOINT_ANCHOR_SIZE` 在 10–14 px 范围内。
- 图中 canvas 只包含图片、小锚点和到画布边缘的引导线，不包含 `.joint-region-map__marker` 按钮。
- 编号按钮只存在于 canvas 外的 `.joint-region-map__callouts`，仍为至少 44 px 点击目标。
- 每个 zone 的图中锚点和外部按钮共享编号，选中态同步。
- 移动端 callout 可重排为单列/双列，不依赖绝对定位和交叉线理解关系。

运行：

```bash
node --test tests/body-region-map.test.mjs tests/body-region-map-component.test.mjs
```

预期：因现有大号 marker 仍覆盖图片而失败。

### Step 2：调整数据与组件结构

保留现有人工校准的 `anchorX`、`anchorY`，移除只为图内大圆按钮服务的 marker 尺寸计算。引导线由锚点延伸到对应画布边缘；编号和名称在图片外的 callout grid 中渲染。

`JointRegionMap` 的按钮只能在外部列表出现一次，避免同一位置产生两个重复的键盘焦点。图片中的小锚点设为 `aria-hidden`，外部按钮提供完整 `aria-label`。

### Step 3：调整样式并验证不遮挡

- 小锚点尺寸限制在 10–14 px。
- 外部按钮正文不低于 14 px，点击高度至少 44 px。
- 桌面使用紧邻图片的双列 callout；移动端按编号顺序自然流式排列。
- 删除 `.joint-region-map__marker` 的旧大圆样式。

### Step 4：运行测试

```bash
node --test tests/body-region-map.test.mjs tests/body-region-map-component.test.mjs
```

预期：全部通过。

### Step 5：提交

```bash
git add src/components/JointRegionMap.jsx src/bodyRegionMap.js src/styles.css tests/body-region-map.test.mjs tests/body-region-map-component.test.mjs
git commit -m "fix: 将关节编号移出肌肉插图"
```

---

## Task 6：增加可执行的安全说明正文

**文件：**

- 新增：`src/components/SafetyGuidance.jsx`
- 修改：`src/HomePage.jsx`
- 修改：`src/App.jsx`
- 修改：`src/styles.css`
- 新增：`tests/typography-safety.test.mjs`
- 修改：`tests/body-region-map-component.test.mjs`
- 修改：`package.json`

### Step 1：先写安全内容与导航失败测试

新增 `tests/typography-safety.test.mjs`，断言：

- 页面存在 `SafetyGuidance`，并包含“可以开始”“立即停止”“先接受专业评估”三个标题。
- 正文包含轻柔可控制、疼痛不是有效证明、锐痛、麻木、电击样感觉、明显头晕、胸部不适、近期外伤、肿胀/变形、进行性无力或麻木等边界。
- 包含“不提供诊断”和“不能替代医生或物理治疗师”的声明。
- 来源说明明确区分《拉伸解剖学》整理原则与网站补充风险边界。
- `id="safety-note"` 位于正文安全区，而不是署名 footer；导航的 `onOpenSafety` 仍能滚动到该 ID。

把新测试文件加入 `package.json` 的 `test` 脚本。

运行：

```bash
node --test tests/typography-safety.test.mjs tests/body-region-map-component.test.mjs
```

预期：因组件和正文不存在而失败。

### Step 2：实现安全说明

新增 `SafetyGuidance.jsx`，用三个短卡片呈现已批准设计稿中的安全内容，并在末尾加来源边界与非诊断说明。`HomePage` 把它放在身体定位工作台与页脚署名之间；页脚只保留模型与组件署名。

`App.jsx` 的 `onOpenSafety` 保持滚动逻辑，目标改为正文安全区后无需另建路由。若当前不在主页，继续沿用现有导航回主页再定位的行为，不引入新页面。

### Step 3：运行测试

```bash
node --test tests/typography-safety.test.mjs tests/body-region-map-component.test.mjs tests/home-flow.test.mjs
```

预期：全部通过。

### Step 4：提交

```bash
git add src/components/SafetyGuidance.jsx src/HomePage.jsx src/App.jsx src/styles.css tests/typography-safety.test.mjs tests/body-region-map-component.test.mjs package.json
git commit -m "feat: 补充页面安全说明"
```

---

## Task 7：建立全站可读字号并让布局随内容重排

**文件：**

- 修改：`src/styles.css`
- 修改：`tests/typography-safety.test.mjs`

### Step 1：先写字号和重排失败测试

在 `tests/typography-safety.test.mjs` 增加 CSS 契约：

- `:root` 定义 `--font-caption: .75rem`、`--font-secondary: .875rem`、`--font-body: 1rem`、`--font-card-title: 1.125rem`、`--font-section-title: 1.5rem`、`--font-display`。
- 样式表中不再出现 7–11 px 的 `font-size`。
- 导航、模式切换、位置按钮、感受按钮、安全输入、推荐卡、教程卡和动作库搜索等主要交互不低于 `--font-secondary`，正文以 `--font-body` 为主。
- `.location-workspace` 不再使用 `height: 640px`；手机 `.character-stage` 不再使用 `height: 595px`。
- 专业解剖工具栏允许换行，人体 viewport 自己控制 overflow；页面根节点不因画布产生横向滚动。

运行：

```bash
node --test tests/typography-safety.test.mjs
```

预期：当前大量 7–11 px 字号和固定高度导致失败。

### Step 2：先建立字体 token，再替换关键层级

在 `:root` 增加离散 `rem` token。按页面顺序调整：

1. 公共导航、页脚、错误与状态提示。
2. 身体定位左/中/右三栏、中央模式工具、目标与安全控件。
3. 动作库标题、搜索框、筛选器、动作卡和详情正文。
4. 办公室放松计时器、队列与动作说明。

所有 7–11 px 字号提升到 12 px 的非关键图注或 14–16 px 的正文/操作层级；不能通过缩小字体维持单行，必要时让控件换行或卡片增高。

### Step 3：取消阻碍 200% 放大的固定定位

- `.location-workspace` 改为内容驱动的 `min-height`，三栏允许自身内容自然增高。
- `.character-stage`、专业解剖 stage 与选择区使用 `min-height`、`minmax()` 和可换行 grid。
- 在现有断点下让三栏转为分步单列；删除手机端固定 595 px 高度。
- 模式、性别、视角和缩放工具栏使用 `flex-wrap: wrap`。
- 放大的人体只在 viewport 内滚动/平移，外层保持 `overflow-x: clip`。

### Step 4：运行契约与全量单元测试

```bash
node --test tests/typography-safety.test.mjs
npm test
```

预期：全部通过。

### Step 5：提交

```bash
git add src/styles.css tests/typography-safety.test.mjs
git commit -m "style: 提升全站字体可读性与重排能力"
```

---

## Task 8：真实页面验收与完整交付检查

**文件：**

- 仅在发现问题时修改对应源文件和测试；不创建额外报告文件。

### Step 1：运行完整自动化检查

依次运行：

```bash
npm test
npm run test:content
npm run build
npm run test:sites
```

预期：全部退出码为 0；构建后仍存在：

- `dist/client/index.html`
- `dist/server/index.js`
- `dist/.openai/hosting.json`

若任一检查失败，先定位根因、补失败测试并修复，不通过跳过、放宽断言或 suppress 隐藏问题。

### Step 2：启动真实页面并检查桌面端

启动项目开发服务器，在应用内浏览器打开主页。桌面宽度检查：

- 中央同级模式入口醒目，右栏无重复小人体。
- 3D 旋转、正背面、复位仍可用。
- 专业解剖男女、正侧背共 6 种组合都能显示。
- 缩小、放大、复位在边界内工作，工具栏不会跟随人体缩放。
- 点击一个唯一热区和一个共用热区，确认都能准确选中目标。
- 每个当前区域目标都可从文字列表选择。
- 膝、肩、踝图只有小锚点，肌肉纹理未被大号编号遮住。
- 安全说明三层内容和来源边界完整可见，导航“安全说明”能准确定位。

### Step 3：检查手机端和 200% 放大

在手机宽度与浏览器 200% 放大下分别检查：

- 内容顺序为任务摘要、中央舞台、文字定位与安全、推荐动作。
- 文字不被截断，主要操作保持至少 44 px 点击高度。
- 页面没有整体横向滚动；仅放大的人体 viewport 可局部平移。
- 模式、性别、视角、缩放按钮能够自然换行。
- 关节外部编号列表按顺序重排，没有交叉线遮挡文字。

保存桌面、手机和 200% 放大截图作为当前任务的可视验收证据；截图只用于验收，不写入生产内容目录。

### Step 4：最终差异与污染检查

```bash
git diff --check
git status --short
```

确认只包含本计划涉及的源文件、测试和两张侧面资源；保留并不提交用户原有的 `.maestroignore`、`.workflow/` 和无关计划文件。

### Step 5：提交验收中产生的必要修复

仅当真实页面检查产生修复时，逐一列出并暂存本轮实际修改的明确文件，禁止使用 `git add .`，然后提交：

```bash
git commit -m "fix: 修正解剖舞台响应式验收问题"
```

最后再次运行受影响测试以及 `npm run build`、`npm run test:sites`，再报告完成。
