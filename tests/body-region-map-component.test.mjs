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
