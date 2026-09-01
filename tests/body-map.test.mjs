import assert from "node:assert/strict";
import test from "node:test";

const moduleUnderTest = await import("../src/bodyMap.js").catch(() => ({}));
const {
  anatomyTargets = [],
  bodyRegions = [],
  getRecommendations = () => ({ status: "missing", movementIds: [] }),
  getRegionTargets = () => [],
  parseExplorerState = () => ({}),
  regionCameraPresets = {},
  serializeExplorerState = () => "",
  toggleTargetSelection = () => [],
} = moduleUnderTest;

test("身体地图提供 7 个稳定区域且每区至少关联 2 个教程", () => {
  assert.deepEqual(
    bodyRegions.map((region) => region.id),
    ["neck", "shoulder", "thorax", "low-back", "hip", "knee", "ankle"],
  );
  for (const region of bodyRegions) {
    assert.ok(region.movementIds.length >= 2, `${region.id} 缺少教程映射`);
    assert.equal(region.hotspot.position.length, 3, `${region.id} 缺少模型空间坐标`);
  }
});

test("具体定位目标拥有唯一 ID、固定颜色和真实肌肉网格名", () => {
  const ids = anatomyTargets.map((target) => target.id);
  const colors = anatomyTargets.filter((target) => target.kind === "muscle").map((target) => target.color);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(colors).size, colors.length);
  for (const target of anatomyTargets.filter((item) => item.kind === "muscle")) {
    assert.ok(target.meshNames.length > 0, `${target.id} 缺少 meshNames`);
  }
});

test("肌群多选再次点击只取消当前项", () => {
  const selected = toggleTargetSelection(["upper-trapezius", "levator-scapulae"], "upper-trapezius");
  assert.deepEqual(selected, ["levator-scapulae"]);
  assert.deepEqual(toggleTargetSelection(selected, "rhomboids"), ["levator-scapulae", "rhomboids"]);
});

test("膝和踝均提供关节附近或无法确定的安全选项", () => {
  assert.ok(getRegionTargets("knee").some((target) => target.kind === "joint"));
  assert.ok(getRegionTargets("ankle").some((target) => target.kind === "joint"));
});

test("红旗状态阻断训练推荐", () => {
  const result = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-joint-unsure"],
    symptomIds: ["swelling"],
    redFlagIds: ["major-trauma"],
  });

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.movementIds, []);
});

test("多肌群推荐优先返回同时覆盖更多目标的既有教程", () => {
  const result = getRecommendations({
    regionId: "shoulder",
    targetIds: ["middle-lower-trapezius", "rhomboids"],
    symptomIds: ["tightness"],
    redFlagIds: [],
  });

  assert.equal(result.status, "ready");
  assert.deepEqual(result.movementIds.slice(0, 2), ["scapular-squeeze", "wall-pushup"]);
});

test("每个区域相机预设包含位置、目标和缩放", () => {
  for (const region of bodyRegions) {
    const preset = regionCameraPresets[region.id];
    assert.equal(preset.position.length, 3, `${region.id} 缺少 camera position`);
    assert.equal(preset.target.length, 3, `${region.id} 缺少 camera target`);
    assert.ok(preset.zoom > 0, `${region.id} 缺少 camera zoom`);
  }
});

test("首页与教程深链状态可以往返并忽略未知值", () => {
  const search = serializeExplorerState({
    view: "library",
    movementId: "scapular-squeeze",
    regionId: "shoulder",
    targetIds: ["rhomboids", "unknown"],
    symptomIds: ["tightness"],
  });
  const restored = parseExplorerState(search);

  assert.deepEqual(restored, {
    view: "library",
    movementId: "scapular-squeeze",
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    symptomIds: ["tightness"],
  });
});
