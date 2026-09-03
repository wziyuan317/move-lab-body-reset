import assert from "node:assert/strict";
import test from "node:test";

import { anatomyTargets, bodyRegions, getRecommendations } from "../src/bodyMap.js";
import {
  buildLibraryPath,
  readLibraryLocation,
} from "../src/libraryRouting.js";
import { stretchingMovements } from "../src/movements.js";
import {
  contentMuscleIdsByTargetId,
  contentRegionIdsByBodyRegionId,
  getStretchingIdsForRegion,
  getStretchingIdsForTarget,
} from "../src/stretchingAdapters.js";

const movementIds = new Set(stretchingMovements.map((item) => item.id));
const regionIds = new Set(stretchingMovements.flatMap((item) => item.regionIds));
const muscleIds = new Set(stretchingMovements.flatMap((item) => item.muscleIds));

test("8 个网页身体区域只映射内容包中的稳定区域 ID", () => {
  assert.deepEqual(Object.keys(contentRegionIdsByBodyRegionId), bodyRegions.map((item) => item.id));
  for (const [bodyRegionId, mappedIds] of Object.entries(contentRegionIdsByBodyRegionId)) {
    assert.ok(mappedIds.length > 0, `${bodyRegionId} 缺少内容区域映射`);
    assert.ok(mappedIds.every((id) => regionIds.has(id)), `${bodyRegionId} 映射了未知内容区域`);
    assert.ok(getStretchingIdsForRegion(bodyRegionId).every((id) => movementIds.has(id)));
  }
});

test("具体肌肉目标使用显式稳定肌肉 ID，关节位置不猜测肌肉", () => {
  for (const target of anatomyTargets) {
    const mappedIds = contentMuscleIdsByTargetId[target.id] ?? [];
    assert.ok(mappedIds.every((id) => muscleIds.has(id)), `${target.id} 映射了未知肌肉`);
    if (target.kind === "joint") {
      assert.deepEqual(mappedIds, [], `${target.id} 是位置标签，不应猜肌肉`);
    } else {
      assert.ok(mappedIds.length > 0, `${target.id} 缺少显式肌肉映射`);
      assert.ok(getStretchingIdsForTarget(target.id).every((id) => movementIds.has(id)));
    }
  }
  assert.equal("meshNames" in contentMuscleIdsByTargetId, false);
});

test("身体定位保留办公室建议并能推荐系统拉伸动作", () => {
  for (const region of bodyRegions) {
    assert.ok(region.movementIds.some((id) => !movementIds.has(id)), `${region.id} 未保留办公室动作`);
    assert.ok(region.movementIds.some((id) => movementIds.has(id)), `${region.id} 未接入系统动作`);
  }

  const result = getRecommendations({
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    symptomIds: ["tightness"],
    redFlagIds: [],
  });
  assert.ok(result.movementIds.some((id) => movementIds.has(id)));
});

test("动作教程中文深链兼容站点根路径和 GitHub Pages base", () => {
  assert.deepEqual(
    readLibraryLocation(
      "/move-lab-body-reset/%E5%8A%A8%E4%BD%9C%E6%95%99%E7%A8%8B",
      "?动作=%E5%8A%A8%E4%BD%9C-%E8%B6%B3%E5%B0%8F%E8%85%BF-001",
    ),
    { view: "library", movementId: "动作-足小腿-001" },
  );
  assert.deepEqual(
    readLibraryLocation("/", "?view=library&movement=scapular-squeeze"),
    { view: "library", movementId: "scapular-squeeze" },
  );
  assert.equal(
    buildLibraryPath("动作-足小腿-001", "/move-lab-body-reset/"),
    "/move-lab-body-reset/动作教程?动作=%E5%8A%A8%E4%BD%9C-%E8%B6%B3%E5%B0%8F%E8%85%BF-001",
  );
});

test("Sites 发布模式把动作链接保留在根路径查询参数中", () => {
  assert.equal(
    buildLibraryPath("动作-足小腿-001", "/", "query"),
    "/?view=library&movement=%E5%8A%A8%E4%BD%9C-%E8%B6%B3%E5%B0%8F%E8%85%BF-001",
  );
});
