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
