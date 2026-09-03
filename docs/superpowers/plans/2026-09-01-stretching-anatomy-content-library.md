# 《拉伸解剖学》中文动作内容库实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户提供的 265 页《拉伸解剖学》第三版 PDF 转换为一个全中文、可追溯、带原创动作引导图和双向肌肉索引的独立内容包。

**Architecture:** 先用 Poppler 抽取逐页文本，再用小型 Node.js 模块识别页面、动作边界和来源页码；中文内容作为审阅后的规范数据写入独立内容包，索引与验证脚本只消费稳定 ID。图片生产先完成 5 个代表动作的样张检查，再按章节生成全部静态与动态帧，最终由统一验证器检查数据、图片和映射。

**Tech Stack:** Node.js ES Modules、Node.js 原生测试、Poppler (`pdfinfo`、`pdftotext`、`pdftoppm`)、JSON、Markdown、PNG、内置 ImageGen。

**Spec:** `docs/plans/2026-09-01-stretching-anatomy-content-library-design.md`

## Global Constraints

- 最终内容包根目录固定为 `content-packs/stretching-anatomy-cn/`。
- 最终内容包中的标题、说明、术语、字段和值全部使用简体中文。
- 不复制、保存或分发原书页面扫描图和原书插图；动作说明使用忠实转述。
- PDF 页码与书内页码分别保存，动作跨页时记录全部来源页面。
- 静态动作必须有起始、到位 2 张原创图片；动态动作必须有起始、过程、到位 3 张原创图片。
- 图片统一使用无脸中性人物、简洁运动服和纯净背景；红色表示目标肌肉、蓝色表示动作方向、黄色表示稳定提示。
- 原书信息、规范化补充和安全补充必须分开标记。
- 三维模型网格名未提供时保持“等待模型清单”，不得猜测绑定值。
- 本计划不修改 `src/App.jsx`、`src/movements.js`、`src/bodyMap.js` 或当前网站路由。
- 不覆盖或删除工作区中的用户文件，尤其是未跟踪的 3D 模型测试与资产。

## 文件职责

```text
scripts/content-library/
├── schema.mjs                 # 动作、页面、术语和索引的数据校验
├── pdf-pages.mjs              # PDF 文本抽取、分页和页面元数据
├── action-parser.mjs          # 动作边界、步骤、肌肉和说明的原始提取
├── normalize-cn.mjs           # 中文稳定 ID、中文空白和字段规范化
├── build-indexes.mjs          # 生成身体区域、肌肉、动作和页面双向索引
├── build-manifest.mjs         # 汇总内容包入口、数量和文件哈希
└── validate-package.mjs       # 执行最终内容包验证并输出报告

tests/
├── content-library-schema.test.mjs
├── pdf-pages.test.mjs
├── action-parser.test.mjs
├── content-pack.test.mjs
└── content-indexes.test.mjs

tests/fixtures/content-library/
├── sample-pages.txt
├── sample-action-pages.txt
└── sample-package/

content-packs/stretching-anatomy-cn/
├── 内容包清单.json
├── 导入说明.md
├── 术语表/
├── 解剖结构/
├── 动作/
├── 索引关系/
├── 来源追溯/
├── 数据规范/
└── 验证/
```

---

### Task 1: 建立内容包数据契约和最小验证器

**Files:**
- Create: `scripts/content-library/schema.mjs`
- Create: `scripts/content-library/validate-package.mjs`
- Create: `tests/content-library-schema.test.mjs`
- Create: `tests/fixtures/content-library/sample-package/动作/足与小腿/动作-足小腿-001/内容.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: 无。
- Produces: `validateActionRecord(record)`、`validatePageRecord(record)`、`validatePackageRoot(rootPath)`，后续任务统一调用。

- [ ] **Step 1: 写动作记录缺少必填字段时失败的测试**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { validateActionRecord } from "../scripts/content-library/schema.mjs";

test("动作记录必须包含稳定 ID、来源页码和规定图片帧", () => {
  const errors = validateActionRecord({
    动作ID: "动作-足小腿-001",
    中文动作名称: "初级坐姿脚趾伸肌拉伸",
    动作类型: "静态拉伸",
    来源: { PDF页码: [19], 书内页码: [12, 13], 页面ID: ["页面-PDF-019"] },
    图片: { 起始: "图片/起始.png" },
  });
  assert.deepEqual(errors, ["静态动作缺少到位图片"]);
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test tests/content-library-schema.test.mjs`

Expected: FAIL，原因是 `scripts/content-library/schema.mjs` 尚不存在。

- [ ] **Step 3: 实现最小动作记录校验器**

```js
export function validateActionRecord(record) {
  const errors = [];
  if (!record.动作ID) errors.push("缺少动作ID");
  if (!record.中文动作名称) errors.push("缺少中文动作名称");
  if (!record.来源?.PDF页码?.length) errors.push("缺少PDF页码");
  if (!record.图片?.起始) errors.push("缺少起始图片");
  if (record.动作类型 === "静态拉伸" && !record.图片?.到位) {
    errors.push("静态动作缺少到位图片");
  }
  if (record.动作类型 === "动态拉伸" && !record.图片?.过程) {
    errors.push("动态动作缺少过程图片");
  }
  if (record.动作类型 === "动态拉伸" && !record.图片?.到位) {
    errors.push("动态动作缺少到位图片");
  }
  return errors;
}
```

- [ ] **Step 4: 增加页面记录、中文内容、数组字段和目录存在性测试**

测试必须覆盖：PDF 页码为 1–265 的整数、书内页码允许罗马数字或阿拉伯数字、动作 ID 格式、主要目标肌肉不能为空、停止条件不能为空、用户展示字段不能含连续 3 个拉丁字母、静态与动态图片帧数规则。

- [ ] **Step 5: 实现页面记录与内容包根目录校验**

`validatePackageRoot(rootPath)` 返回 `{ errors, warnings, counts }`，并只读取文件，不修改内容包。

- [ ] **Step 6: 增加测试脚本并运行 GREEN**

在 `package.json` 增加：

```json
"test:content": "node --test tests/content-library-schema.test.mjs tests/pdf-pages.test.mjs tests/action-parser.test.mjs tests/content-pack.test.mjs tests/content-indexes.test.mjs"
```

Run: `node --test tests/content-library-schema.test.mjs`

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add package.json scripts/content-library/schema.mjs scripts/content-library/validate-package.mjs tests/content-library-schema.test.mjs tests/fixtures/content-library/sample-package
git commit -m "feat: 建立动作内容包数据契约"
```

---

### Task 2: 抽取 265 个 PDF 页面并建立页面元数据

**Files:**
- Create: `scripts/content-library/pdf-pages.mjs`
- Create: `tests/pdf-pages.test.mjs`
- Create: `tests/fixtures/content-library/sample-pages.txt`
- Create: `content-packs/stretching-anatomy-cn/来源追溯/页面总索引.json`

**Interfaces:**
- Consumes: PDF 绝对路径、`validatePageRecord(record)`。
- Produces: `extractPdfPages(pdfPath)`、`splitPages(text)`、`classifyPage(pageText)`、265 条页面记录。

- [ ] **Step 1: 写分页与页码保真测试**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { splitPages } from "../scripts/content-library/pdf-pages.mjs";

test("分页保留 PDF 页码并移除页面首尾空白", () => {
  const pages = splitPages("封面\f目录  iv\f动作步骤  13\f");
  assert.deepEqual(pages, [
    { PDF页码: 1, 页面ID: "页面-PDF-001", 原始文本: "封面" },
    { PDF页码: 2, 页面ID: "页面-PDF-002", 原始文本: "目录  iv" },
    { PDF页码: 3, 页面ID: "页面-PDF-003", 原始文本: "动作步骤  13" },
  ]);
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test tests/pdf-pages.test.mjs`

Expected: FAIL，原因是 `splitPages` 尚不存在。

- [ ] **Step 3: 实现 PDF 文本抽取与分页**

`extractPdfPages(pdfPath)` 使用 `execFile("pdftotext", ["-layout", pdfPath, "-"])`，禁止通过拼接 shell 字符串执行用户路径。`splitPages` 按换页符分割并生成三位 PDF 页面 ID。

- [ ] **Step 4: 实现页面分类**

`classifyPage(pageText)` 返回以下中文枚举之一：`封面`、`版权`、`目录`、`理论`、`动作图`、`动作步骤`、`训练计划`、`索引`、`其他`。分类优先级为动作步骤、动作图、训练计划、目录、索引、理论、其他。

- [ ] **Step 5: 运行真实 PDF 抽取**

Run:

```bash
node scripts/content-library/pdf-pages.mjs "/Users/bevol-1/Downloads/Stretching Anatomy (Arnold G. Nelson, Jouko Kokkonen) (z-library.sk, 1lib.sk, z-lib.sk).pdf" "content-packs/stretching-anatomy-cn/来源追溯/页面总索引.json"
```

Expected: 写入 265 条页面记录；第一条 PDF 页码为 1，最后一条为 265。

- [ ] **Step 6: 对低置信度页面做视觉核验**

对无法识别书内页码、章节或页面类型的页面运行：

```bash
pdftoppm -f 19 -l 19 -r 140 -png "/Users/bevol-1/Downloads/Stretching Anatomy (Arnold G. Nelson, Jouko Kokkonen) (z-library.sk, 1lib.sk, z-lib.sk).pdf" "/tmp/stretching-page-019"
```

逐页替换 `19`，只把 PNG 放在 `/tmp`，核验后不复制进内容包。

- [ ] **Step 7: 运行 GREEN 并提交**

Run: `node --test tests/pdf-pages.test.mjs`

Expected: PASS。

```bash
git add scripts/content-library/pdf-pages.mjs tests/pdf-pages.test.mjs tests/fixtures/content-library/sample-pages.txt content-packs/stretching-anatomy-cn/来源追溯/页面总索引.json
git commit -m "feat: 建立 PDF 页面来源索引"
```

---

### Task 3: 识别动作边界并生成原始动作清单

**Files:**
- Create: `scripts/content-library/action-parser.mjs`
- Create: `tests/action-parser.test.mjs`
- Create: `tests/fixtures/content-library/sample-action-pages.txt`

**Interfaces:**
- Consumes: `extractPdfPages(pdfPath)` 的页面记录。
- Produces: `parseActions(pages)` 和临时文件 `/tmp/stretching-anatomy-work/动作原始清单.json`；每条原始动作包含标题、动作类型、原始步骤、主要肌肉、次要肌肉、说明和来源页面。临时文件含英文来源文本，不进入最终内容包或 Git 提交。

- [ ] **Step 1: 写跨页动作识别测试**

```js
test("动作标题页和步骤页会合并为同一动作", () => {
  const actions = parseActions(samplePages);
  assert.equal(actions.length, 1);
  assert.deepEqual(actions[0].来源.PDF页码, [19, 20]);
  assert.equal(actions[0].原始标题, "BEGINNER SEATED TOE EXTENSOR STRETCH");
  assert.equal(actions[0].原始步骤.length, 4);
  assert.ok(actions[0].主要目标肌肉.includes("Tibialis anterior"));
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test tests/action-parser.test.mjs`

Expected: FAIL，原因是 `parseActions` 尚不存在。

- [ ] **Step 3: 实现动作边界解析**

解析规则：

1. `Execution` 标记步骤段开始。
2. `Muscles Stretched` 标记肌肉段开始。
3. `Stretch Notes` 标记说明段开始。
4. 标题优先取步骤页前一个动作图页中的大写标题；同页存在标题时取同页标题。
5. 动作结束于下一个动作标题页、章节标题页或 PDF 结束。
6. 标题图页、步骤页和说明页全部写入来源页码。

- [ ] **Step 4: 解析静态和动态章节差异**

第 9 章动作统一标记为 `动态拉伸`；第 2–8 章统一标记为 `静态拉伸`。第 10–11 章的计划表只引用既有动作，不创建重复动作。

- [ ] **Step 5: 运行真实动作解析并人工核对数量**

Run:

```bash
node scripts/content-library/action-parser.mjs "/Users/bevol-1/Downloads/Stretching Anatomy (Arnold G. Nelson, Jouko Kokkonen) (z-library.sk, 1lib.sk, z-lib.sk).pdf" "/tmp/stretching-anatomy-work/动作原始清单.json"
```

Expected: 动作数量与逐页 `Muscles Stretched` 区块核对一致；初步基线约为 83 个，不把第 10–11 章的重复计划引用计为新动作。

- [ ] **Step 6: 对每个章节首尾动作做页面视觉核验**

使用 `pdftoppm` 渲染章节首尾动作的标题页和步骤页，确认标题、跨页范围和肌肉列表没有串到相邻动作。

- [ ] **Step 7: 运行 GREEN 并提交**

Run: `node --test tests/action-parser.test.mjs`

Expected: PASS。

```bash
git add scripts/content-library/action-parser.mjs tests/action-parser.test.mjs tests/fixtures/content-library/sample-action-pages.txt
git commit -m "feat: 提取全书动作边界和来源页码"
```

---

### Task 4: 建立中文术语、身体区域和肌肉结构表

**Files:**
- Create: `scripts/content-library/normalize-cn.mjs`
- Create: `content-packs/stretching-anatomy-cn/术语表/标准术语.json`
- Create: `content-packs/stretching-anatomy-cn/术语表/标准术语.md`
- Create: `content-packs/stretching-anatomy-cn/解剖结构/身体区域.json`
- Create: `content-packs/stretching-anatomy-cn/解剖结构/肌肉结构.json`
- Create: `content-packs/stretching-anatomy-cn/解剖结构/三维模型绑定.json`
- Create: `content-packs/stretching-anatomy-cn/来源追溯/安全补充来源.json`
- Create: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: 原始动作清单中的原始肌肉名和动作方向。
- Produces: `createStableId(type, chineseName)`、中文标准术语记录、肌肉记录和等待绑定记录。

- [ ] **Step 1: 写中文稳定 ID 和术语去重测试**

```js
test("中文别名归并到同一稳定肌肉 ID", () => {
  assert.equal(createStableId("肌肉", "臀大肌"), "肌肉-臀大肌");
  assert.equal(normalizeTerm("腿后侧肌群"), "肌肉-腘绳肌群");
  assert.equal(normalizeTerm("腘绳肌"), "肌肉-腘绳肌群");
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="中文别名"`

Expected: FAIL，原因是规范化函数尚不存在。

- [ ] **Step 3: 生成中文标准术语表**

按肌肉、动作方向、解剖方位、关节、身体区域和训练概念六类整理。最终 JSON 不保留英文原词；中文别名只用于搜索和归并，不生成新的稳定 ID。

- [ ] **Step 4: 建立身体区域和肌肉结构**

身体区域至少覆盖：足、踝小腿、膝大腿、髋臀、下躯干、手臂手部、肩背胸、颈部。每条肌肉记录包含稳定 ID、规范中文名、所属区域、前后内外侧、左右侧规则和动作引用。

- [ ] **Step 5: 建立等待模型清单的绑定记录**

每个肌肉记录都生成：

```json
{
  "肌肉ID": "肌肉-臀大肌",
  "模型网格名称": [],
  "模型节点名称": [],
  "材质名称": [],
  "左右侧": "分别绑定",
  "绑定状态": "等待模型清单",
  "关联动作ID": []
}
```

- [ ] **Step 6: 核验安全补充所用的权威资料**

通过联网读取并核验 AAOS 脊柱、肩部与膝部训练资料，Academy of Orthopaedic Physical Therapy 临床指南入口，NICE 腰痛指南和 NHS 办公室活动资料。`安全补充来源.json` 使用中文译名记录来源、官方 URL、访问日期、适用身体区域和用于支持的安全字段；不得把资料内容写成疾病诊断或个体化处方。

- [ ] **Step 7: 运行 GREEN 并提交**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="中文别名|术语|肌肉"`

Expected: PASS。

```bash
git add scripts/content-library/normalize-cn.mjs tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/术语表 content-packs/stretching-anatomy-cn/解剖结构 content-packs/stretching-anatomy-cn/来源追溯/安全补充来源.json
git commit -m "feat: 建立全中文解剖术语体系"
```

---

### Task 5: 整理第 2–5 章动作内容

**Files:**
- Create: `content-packs/stretching-anatomy-cn/动作/足与小腿/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/足与小腿/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/膝与大腿/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/膝与大腿/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/髋部/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/髋部/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/下躯干/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/下躯干/**/内容.md`
- Modify: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: `/tmp/stretching-anatomy-work/动作原始清单.json`、标准术语和动作数据模式。
- Produces: 第 2–5 章全部中文动作记录和人工审阅页。

- [ ] **Step 1: 写章节内容完整性测试并确认 RED**

测试读取动作总索引中第 2–5 章的全部动作 ID，并断言每个动作都有 `内容.json`、`内容.md`、至少 1 个主要目标肌肉、起始姿势、步骤、停止条件、来源页码和字段依据分类。

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="第 2–5 章"`

Expected: FAIL，列出首个缺失动作文件夹。

- [ ] **Step 2: 按来源页码逐动作整理原书字段**

对每个动作填写中文动作名称、适用部位、主要和次要目标肌肉、起始姿势、动作步骤、动作要点、左右侧规则、器材和来源。动作步骤保持原书次序，但使用中文忠实转述。

- [ ] **Step 3: 补充网站统一字段并标记依据**

补充呼吸引导、拉伸强度、持续时间与次数、常见错误、简化版本、停止条件和不适用人群。每个补充字段分别进入 `规范化补充字段` 或 `安全补充字段`。

- [ ] **Step 4: 生成对应 Markdown 审阅页**

Markdown 固定顺序：动作名称、来源、适用部位、目标肌肉、起始姿势、步骤、呼吸、强度、剂量、常见错误、简化版本、停止条件、不适用人群、字段依据。

- [ ] **Step 5: 运行 GREEN 并提交**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="第 2–5 章"`

Expected: PASS。

```bash
git add tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/动作/足与小腿 content-packs/stretching-anatomy-cn/动作/膝与大腿 content-packs/stretching-anatomy-cn/动作/髋部 content-packs/stretching-anatomy-cn/动作/下躯干
git commit -m "feat: 整理下肢与躯干拉伸动作"
```

---

### Task 6: 整理第 6–9 章动作内容

**Files:**
- Create: `content-packs/stretching-anatomy-cn/动作/手臂与手部/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/手臂与手部/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/肩背与胸部/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/肩背与胸部/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/颈部/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/颈部/**/内容.md`
- Create: `content-packs/stretching-anatomy-cn/动作/动态拉伸/**/内容.json`
- Create: `content-packs/stretching-anatomy-cn/动作/动态拉伸/**/内容.md`
- Modify: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: `/tmp/stretching-anatomy-work/动作原始清单.json`、标准术语和动作数据模式。
- Produces: 第 6–9 章全部中文动作记录和人工审阅页。

- [ ] **Step 1: 写第 6–9 章内容完整性测试并确认 RED**

动态动作额外断言动作类型为 `动态拉伸`，图片字段同时声明起始、过程、到位三个路径。

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="第 6–9 章"`

Expected: FAIL，列出首个缺失动作文件夹。

- [ ] **Step 2: 按来源页码逐动作整理原书字段**

使用与 Task 5 完全相同的字段契约。颈部伸展避免将极限角度写成完成标准；动态动作明确运动路径、返回路径和控制速度。

- [ ] **Step 3: 补充统一字段并标记依据**

肩、颈和脊柱相关动作的停止条件必须覆盖锐痛、眩晕、麻木、放射痛、明显无力或症状加重。内容只作为教育性安全提示，不写诊断。

- [ ] **Step 4: 生成 Markdown 审阅页并运行 GREEN**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="第 6–9 章"`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/动作/手臂与手部 content-packs/stretching-anatomy-cn/动作/肩背与胸部 content-packs/stretching-anatomy-cn/动作/颈部 content-packs/stretching-anatomy-cn/动作/动态拉伸
git commit -m "feat: 整理上肢颈肩与动态拉伸动作"
```

---

### Task 7: 完成 265 页中文摘要和训练计划引用

**Files:**
- Create: `content-packs/stretching-anatomy-cn/来源追溯/页面摘要/页面-PDF-001.md` 至 `页面-PDF-265.md`
- Modify: `content-packs/stretching-anatomy-cn/来源追溯/页面总索引.json`
- Modify: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: 页面总索引、动作总索引和全部动作内容。
- Produces: 每页中文摘要、页面到动作引用和第 10–11 章计划到既有动作 ID 的引用。

- [ ] **Step 1: 写 265 页覆盖测试并确认 RED**

```js
test("全部 PDF 页面都有中文摘要和页面索引", async () => {
  assert.equal(pageIndex.length, 265);
  for (const page of pageIndex) {
    assert.ok(page.中文页面摘要.length >= 10, `${page.页面ID} 摘要过短`);
    await access(path.join(packageRoot, "来源追溯", "页面摘要", `${page.页面ID}.md`));
  }
});
```

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="全部 PDF 页面"`

Expected: FAIL，列出首个缺失摘要页面。

- [ ] **Step 2: 逐页生成中文摘要**

动作页面摘要包含动作 ID、该页承担的角色和主要内容；理论页面总结核心概念；目录和索引页面说明其导航作用；版权页只记录出版与使用边界，不复制版权长文。

- [ ] **Step 3: 解析第 10–11 章训练计划**

计划中的动作名称映射到第 2–9 章已有动作 ID，不创建重复动作。无法唯一匹配的计划项进入 `验证/待人工复核.json`。

- [ ] **Step 4: 运行 GREEN 并提交**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="全部 PDF 页面|训练计划"`

Expected: PASS。

```bash
git add tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/来源追溯
git commit -m "feat: 完成全书页面摘要和计划引用"
```

---

### Task 8: 生成双向索引、网站路径和内容包入口

**Files:**
- Create: `scripts/content-library/build-indexes.mjs`
- Create: `scripts/content-library/build-manifest.mjs`
- Create: `tests/content-indexes.test.mjs`
- Create: `content-packs/stretching-anatomy-cn/索引关系/身体区域到动作.json`
- Create: `content-packs/stretching-anatomy-cn/索引关系/肌肉到动作.json`
- Create: `content-packs/stretching-anatomy-cn/索引关系/动作到肌肉.json`
- Create: `content-packs/stretching-anatomy-cn/索引关系/动作相关推荐.json`
- Create: `content-packs/stretching-anatomy-cn/索引关系/网站路径.json`
- Create: `content-packs/stretching-anatomy-cn/动作/动作总索引.json`
- Create: `content-packs/stretching-anatomy-cn/内容包清单.json`
- Create: `content-packs/stretching-anatomy-cn/导入说明.md`

**Interfaces:**
- Consumes: 全部动作、身体区域、肌肉结构、页面索引和图片路径。
- Produces: `buildIndexes(actions, muscles, regions)`、`buildManifest(packageRoot)` 和另一位 AI 的唯一入口文件。

- [ ] **Step 1: 写双向索引对称测试并确认 RED**

```js
test("肌肉到动作与动作到肌肉完全对称", () => {
  for (const [muscleId, actionIds] of Object.entries(muscleToActions)) {
    for (const actionId of actionIds) {
      assert.ok(actionToMuscles[actionId].includes(muscleId), `${muscleId} 与 ${actionId} 不对称`);
    }
  }
});
```

Run: `node --test tests/content-indexes.test.mjs`

Expected: FAIL，原因是索引尚未生成。

- [ ] **Step 2: 实现索引生成器**

`buildIndexes` 去重并按来源 PDF 页码排序。相关推荐按共同主要肌肉数、共同次要肌肉数、同区域和相邻难度依次排序，过滤自身和不存在的动作 ID。

- [ ] **Step 3: 生成网站路径**

每条记录包含动作 ID、`/动作教程?动作=<动作ID>`、身体区域筛选参数、肌肉筛选参数、默认帧和返回身体定位页时要恢复的选择状态。

- [ ] **Step 4: 生成内容包清单和导入说明**

清单记录版本、生成日期、页面数、动作数、静态动作数、动态动作数、肌肉数、图片数、入口文件和各文件 SHA-256。导入说明用中文描述读取顺序与映射链路。

- [ ] **Step 5: 运行 GREEN 并提交**

Run: `node --test tests/content-indexes.test.mjs`

Expected: PASS。

```bash
git add scripts/content-library/build-indexes.mjs scripts/content-library/build-manifest.mjs tests/content-indexes.test.mjs content-packs/stretching-anatomy-cn/索引关系 content-packs/stretching-anatomy-cn/动作/动作总索引.json content-packs/stretching-anatomy-cn/内容包清单.json content-packs/stretching-anatomy-cn/导入说明.md
git commit -m "feat: 生成动作内容包双向索引"
```

---

### Task 9: 建立图片语义记录并生成 5 个代表动作样张

**Files:**
- Create: `content-packs/stretching-anatomy-cn/动作/**/图像语义.json`
- Create: 5 个代表动作文件夹下的 `图片/*.png`
- Modify: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: 动作内容、目标肌肉 ID、动作类型和图片帧路径。
- Produces: 每帧的图像语义记录和 5 个代表动作的原创图片。

- [ ] **Step 1: 写图像语义与文件存在性测试并确认 RED**

测试从来源页码排序后的动作中确定 5 个样张：第一个坐姿下肢动作、第一个站姿下肢动作、第一个使用椅子的膝大腿动作、第一个肩背胸动作、第一个动态动作。每个动作必须满足规定帧数、PNG 可解码、宽高一致和每帧语义完整。

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="代表动作样张"`

Expected: FAIL，列出第一个缺图动作。

- [ ] **Step 2: 为每个样张生成中文提示词**

每帧使用以下固定模板，并替换为动作内容中的真实值；最终使用的完整中文提示词同时保存到该动作的 `图像语义.json`，确保另一位 AI 可以复现资产语义：

```text
用途：科学教育动作引导图，用于 MOVE LAB 网站。
主要要求：绘制“<中文动作名称>”的“<起始/过程/到位>”状态。
人物：同一位无脸中性成人，固定身体比例，白色上衣和深蓝运动裤，简洁运动鞋。
姿势：严格依据该动作的起始姿势、动作步骤和安全终点；关节方向自然，不追求极限幅度。
目标肌肉：仅在<目标肌肉中文名>的准确解剖位置覆盖半透明红色。
方向：使用蓝色箭头表示<动作方向>。
稳定提示：使用黄色小箭头或稳定点标记<稳定部位>。
画面：正方形、纯白背景、人物完整、器材结构和方向正确。
禁止：任何文字、数字、徽标、水印、额外人物、错误肢体、书页版式、原书插图风格复制。
```

- [ ] **Step 3: 使用内置 ImageGen 逐帧生成图片**

每个不同帧单独调用一次内置 ImageGen。生成后把选定图片复制到该动作的 `图片/` 文件夹，不把项目引用图片留在默认生成目录。

- [ ] **Step 4: 逐张视觉检查**

检查人物一致性、椅子或墙面方向、左右侧、手脚数量、关节角度、目标肌肉位置、箭头方向和黄色稳定点。任一条件失败，只针对一个明确问题重新生成该帧。

- [ ] **Step 5: 用户样张检查点**

把 5 个动作的全部样张展示给用户。用户确认人物、配色、肌肉位置和箭头标准后，才能开始 Task 10。

- [ ] **Step 6: 运行 GREEN 并提交**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="代表动作样张"`

Expected: PASS。

```bash
git add tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/动作
git commit -m "feat: 完成动作引导图样张"
```

---

### Task 10: 按章节生成全部动作图片

**Files:**
- Create: `content-packs/stretching-anatomy-cn/动作/**/图片/*.png`
- Modify: `content-packs/stretching-anatomy-cn/动作/**/图像语义.json`
- Modify: `content-packs/stretching-anatomy-cn/内容包清单.json`
- Modify: `tests/content-pack.test.mjs`

**Interfaces:**
- Consumes: 用户已确认的样张标准、全部动作内容和图像语义。
- Produces: 全部静态动作 2 帧、全部动态动作 3 帧及完整图片统计。

- [ ] **Step 1: 写全量帧数测试并确认 RED**

测试遍历全部动作：静态动作必须存在 `起始.png`、`到位.png`；动态动作必须存在 `起始.png`、`过程.png`、`到位.png`。各帧文件哈希不得相同。

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="全部动作图片"`

Expected: FAIL，列出第一个尚未生成完整帧的动作。

- [ ] **Step 2: 按章节逐帧生成**

生成顺序固定为：足与小腿、膝与大腿、髋部、下躯干、手臂与手部、肩背与胸部、颈部、动态拉伸。每个章节完成后立即运行该章节图片测试，避免把错误风格扩散到后续章节。

- [ ] **Step 3: 每章完成后生成视觉检查清单**

检查清单逐动作记录：帧数、人物一致、器材正确、目标肌肉正确、方向正确、稳定点正确、无文字水印、通过或重做原因。

- [ ] **Step 4: 完成全量图片后运行 GREEN**

Run: `node --test tests/content-pack.test.mjs --test-name-pattern="全部动作图片"`

Expected: PASS；图片总数等于 `静态动作数 × 2 + 动态动作数 × 3`。

- [ ] **Step 5: 更新清单并提交**

```bash
git add tests/content-pack.test.mjs content-packs/stretching-anatomy-cn/动作 content-packs/stretching-anatomy-cn/内容包清单.json
git commit -m "feat: 生成全书动作引导图片"
```

---

### Task 11: 完成最终验证、复核清单和 AI 导入包

**Files:**
- Modify: `scripts/content-library/validate-package.mjs`
- Create: `content-packs/stretching-anatomy-cn/验证/验证报告.json`
- Create: `content-packs/stretching-anatomy-cn/验证/待人工复核.json`
- Create: `content-packs/stretching-anatomy-cn/数据规范/动作数据模式.json`
- Create: `content-packs/stretching-anatomy-cn/数据规范/肌肉数据模式.json`
- Create: `content-packs/stretching-anatomy-cn/数据规范/索引数据模式.json`
- Modify: `content-packs/stretching-anatomy-cn/内容包清单.json`

**Interfaces:**
- Consumes: 完整内容包。
- Produces: 机器可读验证报告、人工复核清单和最终入口清单。

- [ ] **Step 1: 写最终包验证测试并确认 RED**

最终测试覆盖：265 页面、动作总数一致、ID 唯一、中文展示内容、目标肌肉、停止条件、来源页码、双向索引对称、网站路径可解析、图片帧数、图片可解码、图片哈希不同、清单文件哈希与实际文件一致。

Run: `npm run test:content`

Expected: FAIL，列出尚未生成的验证报告和数据模式文件。

- [ ] **Step 2: 实现最终验证输出**

`validate-package.mjs` 退出码规则：无错误时为 0；存在错误时为 1；只有等待模型清单或专业复核项时仍为 0，但记录在 warnings 和待人工复核文件中。

- [ ] **Step 3: 生成三份数据模式文件**

数据模式使用中文字段名，明确必填字段、类型、枚举、ID 格式和数组去重规则；另一位 AI 导入前先读取数据模式。

- [ ] **Step 4: 运行完整验证**

Run:

```bash
npm run test:content
node scripts/content-library/validate-package.mjs content-packs/stretching-anatomy-cn
npm test
npm run test:sites
npm run build
npm run build:github
```

Expected: 所有命令退出码为 0；验证报告 `错误数` 为 0；等待模型绑定和医学人工复核项只出现在警告与待人工复核清单。

- [ ] **Step 5: 人工抽检**

从 8 个动作章节各抽取首个、中间和最后一个动作，共 24 个动作，检查 JSON、Markdown、来源页面和图片语义一致；另抽检第 10–11 章每个训练计划的首个动作引用。

- [ ] **Step 6: 更新内容包清单与导入说明**

清单写入最终数量和 SHA-256；导入说明明确 `内容包清单.json → 数据规范 → 解剖结构 → 动作总索引 → 索引关系 → 动作内容和图片` 的读取顺序。

- [ ] **Step 7: 提交**

```bash
git add scripts/content-library/validate-package.mjs content-packs/stretching-anatomy-cn
git commit -m "feat: 完成拉伸动作中文内容包"
```

- [ ] **Step 8: 最终交付检查**

Run: `git status --short --branch`

Expected: 只保留任务开始前已存在的用户未跟踪文件；本计划生成的内容全部已提交，未覆盖用户的 3D 测试或资产。
