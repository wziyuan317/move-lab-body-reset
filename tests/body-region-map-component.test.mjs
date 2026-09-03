import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "@babel/parser";

function visit(node, inspect) {
  if (!node || typeof node !== "object") return;
  inspect(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => visit(item, inspect));
    else if (value && typeof value === "object") visit(value, inspect);
  }
}

function readCssRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declarations = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries(declarations
    .split(";")
    .map((declaration) => declaration.split(":"))
    .filter(([property, value]) => property?.trim() && value?.trim())
    .map(([property, ...value]) => [property.trim(), value.join(":").trim()]));
}

test("BodyRegionMap 不再给人体 SVG path 传点击 handler", async () => {
  const source = await readFile(new URL("../src/components/BodyRegionMap.jsx", import.meta.url), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  const bodyElements = [];
  visit(ast, (node) => {
    if (node.type === "JSXOpeningElement" && node.name?.name === "Body") bodyElements.push(node);
  });

  assert.equal(bodyElements.length, 1, "应保留一个完整人体参照图");
  const propNames = bodyElements[0].attributes
    .filter((attribute) => attribute.type === "JSXAttribute")
    .map((attribute) => attribute.name.name);
  assert.ok(propNames.includes("data"));
  assert.ok(propNames.includes("side"));
  assert.equal(propNames.includes("onBodyPartPress"), false);
});

test("安全选项在所有断点保留 44px 点击目标", async () => {
  const source = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const baseRule = source.match(/\.safety-check label \{([^}]*)\}/)?.[1] ?? "";

  assert.match(baseRule, /min-height:\s*44px/);
  assert.match(baseRule, /align-items:\s*center/);
});

test("页脚署名链接在所有断点保留 44px 点击目标", async () => {
  const source = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const declarations = readCssRule(source, ".home-footer a");
  assert.equal(declarations.display, "inline-flex");
  assert.equal(declarations["min-width"], "44px");
  assert.equal(declarations["min-height"], "44px");
  assert.equal(declarations["align-items"], "center");
});

test("主要教程 CTA 使用黄色行动色而非危险 coral", async () => {
  const source = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const declarations = readCssRule(source, ".library-cta");
  assert.equal(declarations.background, "var(--yellow)");
  assert.equal(declarations.color, "var(--navy)");
});

test("专业解剖与 3D 人体是中央舞台同级模式", async () => {
  const explorerSource = await readFile(new URL("../src/components/BodyExplorer.jsx", import.meta.url), "utf8");
  const source = await readFile(new URL("../src/components/ProfessionalAnatomyPanel.jsx", import.meta.url), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  const imports = [];
  const bodyElements = [];
  visit(ast, (node) => {
    if (node.type === "ImportDeclaration") imports.push(node.source.value);
    if (node.type === "JSXOpeningElement" && node.name?.name === "Body") bodyElements.push(node);
  });

  assert.ok(imports.includes("react-muscle-highlighter"));
  assert.equal(imports.includes("@react-three/fiber"), false);
  assert.equal(imports.includes("@react-three/drei"), false);
  assert.equal(source.includes("move-lab-muscles.glb"), false);
  assert.equal(bodyElements.length, 1, "当前观察方向只渲染一个完整人体");

  for (const element of bodyElements) {
    const propNames = element.attributes
      .filter((attribute) => attribute.type === "JSXAttribute")
      .map((attribute) => attribute.name.name);
    assert.equal(propNames.includes("onBodyPartPress"), true, "专业人体图必须能直接点击肌肉区域");
    assert.equal(propNames.includes("gender"), true, "专业人体图必须响应男生/女生选择");
    assert.equal(propNames.includes("side"), true, "专业人体图必须响应当前观察方向");
  }
  assert.match(source, /gender=\{sex\}/);
  assert.match(source, /side=\{view\}/);
  assert.match(source, /JointRegionMap/);
  assert.match(source, /男生/);
  assert.match(source, /女生/);
  assert.match(source, /缩小/);
  assert.match(source, /放大/);
  assert.match(source, /复位/);

  const dialogElements = [];
  visit(ast, (node) => {
    if (node.type === "JSXOpeningElement" && node.name?.name === "dialog") dialogElements.push(node);
  });
  assert.equal(dialogElements.length, 0, "专业解剖不能继续作为弹窗");
  assert.doesNotMatch(source, /showModal|onClose|关闭专业解剖/);

  assert.match(explorerSource, /role="tablist"/);
  assert.match(explorerSource, />3D 人体</);
  assert.match(explorerSource, />专业解剖</);
  assert.doesNotMatch(explorerSource, /professionalOpen|ProfessionalLoadingDialog/);
  assert.match(explorerSource, /role="status"/);
  assert.doesNotMatch(explorerSource, /disabled=\{!regionId\}/);
});

test("专业人体图开放点击而普通人体图保持键盘等价控件", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const professionalRule = readCssRule(css, ".professional-anatomy__body-grid");
  assert.notEqual(professionalRule["pointer-events"], "none");

  const ordinarySource = await readFile(new URL("../src/components/BodyRegionMap.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(ordinarySource, /onBodyPartPress/);
  assert.match(ordinarySource, /body-region-map__side-controls/);
});

test("HomePage 页脚展示当前角色的完整署名与可点击许可", async () => {
  const source = await readFile(new URL("../src/HomePage.jsx", import.meta.url), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  let footer;
  visit(ast, (node) => {
    if (node.type !== "JSXElement" || node.openingElement.name?.name !== "footer") return;
    const id = node.openingElement.attributes.find(
      (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "id",
    )?.value?.value;
    if (id === "safety-note") footer = node;
  });

  assert.ok(footer, "应保留公开安全说明页脚");
  const textNodes = [];
  const links = [];
  visit(footer, (node) => {
    if (node.type === "JSXText") textNodes.push(node.value);
    if (node.type !== "JSXElement" || node.openingElement.name?.name !== "a") return;
    const href = node.openingElement.attributes.find(
      (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "href",
    )?.value?.value;
    const label = node.children
      .filter((child) => child.type === "JSXText")
      .map((child) => child.value)
      .join("")
      .trim();
    links.push({ href, label });
  });
  const visibleText = textNodes.join(" ").replace(/\s+/g, " ").trim();

  assert.doesNotMatch(visibleText, /Quaternius|CC0/);
  assert.match(visibleText, /当前 3D 角色：Man Player/);
  assert.match(visibleText, /作者 RiverofCreative/);
  assert.match(visibleText, /模型字节未修改，仅变更文件名/);
  assert.deepEqual(links, [
    {
      href: "https://sketchfab.com/3d-models/man-player-4c7133dbb06e4136891d59231372d818",
      label: "原作品",
    },
    {
      href: "https://creativecommons.org/licenses/by/4.0/",
      label: "CC BY 4.0",
    },
  ]);
});

test("共享导航提供四个醒目的真实入口", async () => {
  const source = await readFile(new URL("../src/components/SiteHeader.jsx", import.meta.url), "utf8");

  for (const label of ["身体定位", "办公室放松", "动作库", "安全说明"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /onNavigate/);
});

test("办公室播放器使用真实课程动作和完整控制", async () => {
  const source = await readFile(new URL("../src/components/OfficeRoutineTimer.jsx", import.meta.url), "utf8");

  for (const label of ["暂停", "继续", "上一个", "下一个", "重新开始"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /getRoutineProgress/);
  assert.match(source, /officeActionVisuals/);
  assert.match(source, /visual\.src/);
  assert.match(source, /查看大图/);
  assert.match(source, /role="dialog"/);
  assert.doesNotMatch(source, /office-action-pending/);
});

test("手机端动作大图提供可横向查看的放大画布", async () => {
  const source = await readFile(new URL("../src/components/OfficeRoutineTimer.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(source, /可左右滑动查看动作细节/);
  assert.match(css, /\.office-visual-modal__content img \{[^}]*min-width:\s*720px/);
  assert.match(css, /\.office-visual-modal__content \.office-action-states \{[^}]*min-width:\s*720px/);
});

test("左侧任务栏不再复制感受与安全输入", async () => {
  const source = await readFile(new URL("../src/components/AssessmentPanel.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /choice-grid/);
  assert.doesNotMatch(source, /onChangeSymptoms/);
  assert.doesNotMatch(source, /onChangeRedFlags/);
  assert.match(source, /任务摘要/);
});

test("右侧单工作台集中位置感受安全与建议", async () => {
  const source = await readFile(new URL("../src/components/LocationTaskPanel.jsx", import.meta.url), "utf8");
  const homeSource = await readFile(new URL("../src/HomePage.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  for (const contract of ["symptoms", "redFlags", "BodyLocationSelector", "RecommendationPanel"]) {
    assert.match(source, new RegExp(contract));
  }
  assert.match(source, /choice-grid/);
  assert.match(source, /safety-check/);
  assert.match(homeSource, /region \? "" : " is-empty"/);
  assert.match(css, /\.result-column \.recommendation-panel \{[^}]*grid-row:\s*auto/);
  assert.match(css, /\.result-column\.is-empty \{ display:\s*none; \}/);
});

test("底部区域卡只使用图标库，不再渲染微型肌肉图", async () => {
  const source = await readFile(new URL("../src/components/RegionRail.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /react-muscle-highlighter/);
  assert.match(source, /@phosphor-icons\/react/);
  assert.match(source, /region-rail__icon/);
});
