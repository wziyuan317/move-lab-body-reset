import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
