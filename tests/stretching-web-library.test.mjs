import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildStretchingWebLibrary } from "../scripts/content-library/build-web-library.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, "content-packs/stretching-anatomy-cn");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

test("内容包保留 83 个动作、176 张原始 PNG 和完整复核边界", async () => {
  const actionIndex = await readJson(path.join(packageRoot, "动作/动作总索引.json"));
  const review = await readJson(path.join(packageRoot, "验证/待人工复核.json"));

  assert.equal(actionIndex.length, 83);
  assert.equal(actionIndex.filter((item) => item.动作类型 === "静态拉伸").length, 73);
  assert.equal(actionIndex.filter((item) => item.动作类型 === "动态拉伸").length, 10);
  assert.equal(
    actionIndex.reduce((sum, item) => sum + item.图片帧声明.预期帧数, 0),
    176,
  );
  assert.deepEqual(review.数量, {
    三维模型绑定: 118,
    医学专业复核: 83,
    合计: 201,
  });
  assert.equal(review.条目.length, 201);

  for (const item of actionIndex) {
    const contentPath = path.join(packageRoot, item.内容文件.结构化内容);
    assert.equal(existsSync(contentPath), true, `${item.动作ID} 缺少内容文件`);

    const actionDir = path.dirname(contentPath);
    for (const frame of item.图片帧声明.帧) {
      const imagePath = path.join(actionDir, frame.相对路径);
      assert.equal(existsSync(imagePath), true, `${item.动作ID} 缺少 ${frame.帧名} PNG`);
    }
  }
});

test("构建器只按总索引生成稳定的 83 条网页记录", async () => {
  const firstOutput = await mkdtemp(path.join(tmpdir(), "move-lab-stretching-a-"));
  const secondOutput = await mkdtemp(path.join(tmpdir(), "move-lab-stretching-b-"));

  try {
    const first = await buildStretchingWebLibrary({
      packageRoot,
      dataOutput: path.join(firstOutput, "stretchingMovements.json"),
      assetOutput: path.join(firstOutput, "assets"),
      writeImages: false,
    });
    const second = await buildStretchingWebLibrary({
      packageRoot,
      dataOutput: path.join(secondOutput, "stretchingMovements.json"),
      assetOutput: path.join(secondOutput, "assets"),
      writeImages: false,
    });

    assert.deepEqual(first.summary, {
      actions: 83,
      staticActions: 73,
      dynamicActions: 10,
      sourceImages: 176,
      generatedDetailImages: 0,
      generatedThumbnails: 0,
      failed: 0,
      skipped: 352,
      pendingThreeBindings: 118,
      pendingMedicalReviews: 83,
    });
    assert.deepEqual(first.movements, second.movements);

    const firstBytes = await readFile(path.join(firstOutput, "stretchingMovements.json"));
    const secondBytes = await readFile(path.join(secondOutput, "stretchingMovements.json"));
    assert.deepEqual(firstBytes, secondBytes);
    assert.equal(first.movements[0].id, "动作-足小腿-001");
    assert.equal(first.movements.at(-1).id, "动作-动态-010");

    const staticMovement = first.movements.find((item) => item.actionType === "静态拉伸");
    const dynamicMovement = first.movements.find((item) => item.actionType === "动态拉伸");
    assert.deepEqual(staticMovement.frames.map((frame) => frame.label), ["起始", "到位"]);
    assert.deepEqual(dynamicMovement.frames.map((frame) => frame.label), ["起始", "过程", "到位"]);

    for (const field of [
      "steps",
      "primaryMuscles",
      "bodyAreas",
      "breathing",
      "intensity",
      "duration",
      "commonMistakes",
      "simplifiedVersion",
      "stopConditions",
      "contraindications",
      "sources",
      "recommendations",
    ]) {
      assert.ok(field in first.movements[0], `缺少网页字段 ${field}`);
    }
  } finally {
    await rm(firstOutput, { recursive: true, force: true });
    await rm(secondOutput, { recursive: true, force: true });
  }
});

test("默认构建产物包含每一帧的详情图和缩略图", async () => {
  const generatedDataPath = path.join(projectRoot, "src/generated/stretchingMovements.json");
  const generatedMovements = await readJson(generatedDataPath);

  assert.equal(generatedMovements.length, 83);
  assert.equal(generatedMovements.flatMap((item) => item.frames).length, 176);
  for (const movement of generatedMovements) {
    for (const frame of movement.frames) {
      const detailPath = path.join(projectRoot, "public", frame.src);
      const thumbnailPath = path.join(projectRoot, "public", frame.thumbnail);
      assert.equal(existsSync(detailPath), true, `${movement.id} 缺少 ${frame.label} 详情图`);
      assert.equal(existsSync(thumbnailPath), true, `${movement.id} 缺少 ${frame.label} 缩略图`);
    }
  }
});
