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

test("生成快照保留安全、来源和肌肉映射信息", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../src/data/officeContent.generated.json", import.meta.url), "utf8"));
  const neck = snapshot.actions.find((action) => action.id === "stretch.neck.neck_extensor");

  assert.equal(neck.startPosition, "坐在稳定椅子上，脊柱自然延展，双肩放松下沉。");
  assert.ok(neck.stopConditions.length >= 3);
  assert.ok(neck.contraindications.length >= 4);
  assert.deepEqual(neck.source.pdfPages, [187, 188]);
  assert.deepEqual(neck.muscleIds, [
    "muscle.upper_trapezius",
    "muscle.posterior_neck_group",
    "muscle.scalenes",
  ]);
});
