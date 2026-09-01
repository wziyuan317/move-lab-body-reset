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

test("BodyExplorer 的 3D 热点只派发一次原子区域变更", async () => {
  const source = await readFile(new URL("../src/components/BodyExplorer.jsx", import.meta.url), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  let selectRegionBody;
  visit(ast, (node) => {
    if (node.type !== "VariableDeclarator" || node.id?.name !== "selectRegion") return;
    selectRegionBody = node.init?.body;
  });

  assert.ok(selectRegionBody, "应保留 BodyExplorer 的热点选择入口");
  const calls = [];
  visit(selectRegionBody, (node) => {
    if (node.type === "CallExpression" && node.callee?.type === "Identifier") calls.push(node.callee.name);
  });
  assert.equal(calls.filter((name) => name === "onSelectRegion").length, 1);
  assert.equal(calls.includes("onChangeViewSide"), false, "不得用第二次旧状态更新覆盖 regionId");
  assert.match(source, /onSelectRegion\(getModelRegionSelectionChange\(id\)\)/);
});

test("3D 热点显式支持 Enter 与 Space 且阻止原生 click 双触发", async () => {
  const source = await readFile(new URL("../src/components/BodyScene.jsx", import.meta.url), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  const hotspotButtons = [];
  visit(ast, (node) => {
    if (node.type !== "JSXOpeningElement" || node.name?.name !== "button") return;
    const className = node.attributes.find(
      (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "className",
    );
    if (className?.value?.type === "JSXExpressionContainer") hotspotButtons.push(node);
  });

  assert.equal(hotspotButtons.length, 1);
  const propNames = hotspotButtons[0].attributes
    .filter((attribute) => attribute.type === "JSXAttribute")
    .map((attribute) => attribute.name.name);
  assert.ok(propNames.includes("onClick"));
  assert.ok(propNames.includes("onKeyDown"));
  assert.match(source, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /event\.repeat/);
});

test("安全选项在所有断点保留 44px 点击目标", async () => {
  const source = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const baseRule = source.match(/\.safety-check label \{([^}]*)\}/)?.[1] ?? "";

  assert.match(baseRule, /min-height:\s*44px/);
  assert.match(baseRule, /align-items:\s*center/);
});

test("专业模式使用完整正背人体图且不再引用 legacy GLB", async () => {
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
  assert.equal(bodyElements.length, 2, "应同时保留完整的正面和背面人体参照图");

  const sides = bodyElements.map((element) => element.attributes.find(
    (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "side",
  )?.value?.value);
  assert.deepEqual(sides.sort(), ["back", "front"]);
  for (const element of bodyElements) {
    const propNames = element.attributes
      .filter((attribute) => attribute.type === "JSXAttribute")
      .map((attribute) => attribute.name.name);
    assert.equal(propNames.includes("onBodyPartPress"), false);
  }

  const dialogElements = [];
  visit(ast, (node) => {
    if (node.type === "JSXOpeningElement" && node.name?.name === "dialog") dialogElements.push(node);
  });
  assert.equal(dialogElements.length, 1);
  const dialogProps = dialogElements[0].attributes
    .filter((attribute) => attribute.type === "JSXAttribute")
    .map((attribute) => attribute.name.name);
  assert.ok(dialogProps.includes("onCancel"));
  assert.ok(dialogProps.includes("onKeyDown"), "Escape 必须有显式键盘关闭路径");
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
