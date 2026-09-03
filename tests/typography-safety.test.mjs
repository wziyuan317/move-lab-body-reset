import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function readCssRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declarations = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries(declarations
    .split(";")
    .map((declaration) => declaration.split(":"))
    .filter(([property, value]) => property?.trim() && value?.trim())
    .map(([property, ...value]) => [property.trim(), value.join(":").trim()]));
}

test("主页安全说明提供开始停止和专业评估三层边界", async () => {
  const source = await readFile(new URL("../src/components/SafetyGuidance.jsx", import.meta.url), "utf8");

  for (const heading of ["可以开始", "立即停止", "先接受专业评估"]) {
    assert.match(source, new RegExp(heading));
  }
  for (const boundary of [
    "轻柔、可控制",
    "疼痛不是",
    "锐痛",
    "麻木",
    "电击样感觉",
    "明显头晕",
    "胸部不适",
    "近期有明显外伤",
    "肿胀",
    "变形",
    "无力或麻木进行性加重",
  ]) assert.match(source, new RegExp(boundary), `安全说明缺少：${boundary}`);

  assert.match(source, /不提供诊断/);
  assert.match(source, /不能替代医生或物理治疗师/);
  assert.match(source, /《拉伸解剖学》整理内容/);
  assert.match(source, /网站补充的通用风险边界/);
});

test("安全导航定位正文说明而页脚只保留署名", async () => {
  const safetySource = await readFile(new URL("../src/components/SafetyGuidance.jsx", import.meta.url), "utf8");
  const homeSource = await readFile(new URL("../src/HomePage.jsx", import.meta.url), "utf8");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const footerSource = homeSource.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";

  assert.match(safetySource, /id="safety-note"/);
  assert.match(homeSource, /import \{ SafetyGuidance \}/);
  assert.match(homeSource, /<SafetyGuidance/);
  assert.doesNotMatch(footerSource, /id="safety-note"/);
  assert.match(appSource, /querySelector\("#safety-note"\)/);
});

test("全站使用可读 rem 字号层级且不再保留 7 到 11px 小字", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  for (const token of [
    "--font-caption: .75rem",
    "--font-secondary: .875rem",
    "--font-body: 1rem",
    "--font-card-title: 1.125rem",
    "--font-section-title: 1.5rem",
    "--font-display:",
  ]) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  assert.doesNotMatch(css, /font-size:\s*(?:7|8|9|10|11)px/);
  assert.equal(readCssRule(css, ".body-explorer__mode-tabs button")["font-size"], "var(--font-body)");
  assert.equal(readCssRule(css, ".target-selection-list button")["font-size"], "var(--font-secondary)");
  assert.equal(readCssRule(css, ".choice-grid button")["font-size"], "var(--font-secondary)");
  assert.equal(readCssRule(css, ".search-box input")["font-size"], "var(--font-body)");
  assert.equal(readCssRule(css, ".office-timer-controls button")["font-size"], "var(--font-secondary)");
});

test("身体定位布局随内容增高并把解剖缩放限制在自身画布", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const workspace = readCssRule(css, ".location-workspace");
  const controls = readCssRule(css, ".professional-anatomy-stage__controls");
  const viewport = readCssRule(css, ".professional-anatomy__viewport");

  assert.equal(workspace.height, undefined);
  assert.ok(workspace["min-height"]);
  assert.doesNotMatch(css, /height:\s*595px/);
  assert.equal(controls["flex-wrap"], "wrap");
  assert.match(viewport.overflow, /auto/);
  assert.equal(readCssRule(css, ".home-shell")["overflow-x"], "clip");
});
