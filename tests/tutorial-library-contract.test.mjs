import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { movements, officeMovements, stretchingMovements } from "../src/movements.js";
import {
  buildMovementDetailModel,
  getLibraryFilterOptions,
} from "../src/tutorialLibraryModel.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("系统动作详情暴露全部运动、安全、追溯和相关推荐字段", () => {
  const movement = stretchingMovements[0];
  const model = buildMovementDetailModel(movement, movements);

  assert.deepEqual(model.frames.map((frame) => frame.label), ["起始", "到位"]);
  assert.deepEqual(model.sections.map((section) => section.id), [
    "start-position",
    "steps",
    "breathing",
    "intensity",
    "duration",
    "key-points",
    "common-mistakes",
    "simplified-version",
    "stop-conditions",
    "contraindications",
    "risk-warnings",
  ]);
  assert.equal(model.primaryMuscles.length > 0, true);
  assert.equal(model.bodyAreas.length > 0, true);
  assert.equal(model.sources.pdfPages.length > 0, true);
  assert.equal(model.sources.bookPages.length > 0, true);
  assert.equal(model.sources.pageReferences.length > 0, true);
  assert.equal(model.relatedMovements.length > 0, true);
  assert.equal(model.reviewStatus[0].状态, "待人工复核");
});

test("动态动作完整显示起始、过程、到位三个真实状态", () => {
  const movement = stretchingMovements.find((item) => item.actionType === "动态拉伸");
  const model = buildMovementDetailModel(movement, movements);

  assert.deepEqual(model.frames.map((frame) => frame.label), ["起始", "过程", "到位"]);
  assert.equal(new Set(model.frames.map((frame) => frame.src)).size, 3);
});

test("办公室详情继续使用原有原理、好处、口令和停止条件", () => {
  const movement = officeMovements[0];
  const model = buildMovementDetailModel(movement, movements);

  assert.equal(model.office.principle, movement.principle);
  assert.deepEqual(model.office.benefits, movement.benefits);
  assert.equal(model.office.cue, movement.cue);
  assert.equal(model.office.stop, movement.stop);
});

test("筛选项来自真实 98 个动作并区分两类内容", () => {
  const filters = getLibraryFilterOptions(movements);

  assert.deepEqual(filters.collections, [
    { id: "all", label: "全部动作", count: 98 },
    { id: "office", label: "办公室改善", count: 15 },
    { id: "system", label: "系统拉伸库", count: 83 },
  ]);
  assert.ok(filters.categories.includes("足与小腿"));
  assert.ok(filters.difficulties.includes("初级"));
  assert.ok(filters.movementTypes.includes("动态拉伸"));
});

test("动作列表和详情图片均启用懒加载并提供有限重试入口", async () => {
  const source = await readFile(path.join(projectRoot, "src/TutorialLibrary.jsx"), "utf8");

  assert.match(source, /loading="lazy"/);
  assert.match(source, /decoding="async"/);
  assert.match(source, /重新加载/);
  assert.match(source, /MAX_IMAGE_RETRIES\s*=\s*1/);
});

