import assert from "node:assert/strict";
import test from "node:test";

const moduleUnderTest = await import("../src/bodyMap.js").catch(() => ({}));
const {
  anatomyTargets = [],
  bodyRegions = [],
  canOpenTutorials = () => true,
  applyExplorerStateChange = (_currentState, nextState) => nextState,
  getExplorerStep = () => undefined,
  getExplorerResetChange = () => ({}),
  getModelRegionSelectionChange = () => ({}),
  getRecommendationNavigationIds = () => [],
  getRecommendations = () => ({ status: "missing", movementIds: [] }),
  getRegionTargets = () => [],
  parseExplorerState = () => ({}),
  regionCameraPresets = {},
  selectRegionState = (state) => state,
  serializeExplorerState = () => "",
  toggleTargetSelection = () => [],
} = moduleUnderTest;

test("身体地图提供 8 个稳定区域且每区至少关联 2 个教程", () => {
  assert.deepEqual(
    bodyRegions.map((region) => region.id),
    ["neck", "shoulder", "thorax", "low-back", "hip", "thigh", "knee", "ankle"],
  );
  for (const region of bodyRegions) {
    assert.ok(region.movementIds.length >= 2, `${region.id} 缺少教程映射`);
    assert.equal(region.hotspot.position.length, 3, `${region.id} 缺少模型空间坐标`);
  }
});

test("移动端相邻大腿与膝盖热点具有足够的横向错位", () => {
  const thigh = bodyRegions.find((region) => region.id === "thigh");
  const knee = bodyRegions.find((region) => region.id === "knee");
  const desktopSeparation = Math.abs(thigh.hotspot.screenOffset[0] - knee.hotspot.screenOffset[0]);
  const horizontalSeparation = Math.abs(thigh.hotspot.mobileOffset[0] - knee.hotspot.mobileOffset[0]);

  assert.ok(desktopSeparation >= 36, "桌面 44px 热点需结合模型坐标消除交叠");
  assert.ok(horizontalSeparation >= 44, "44px 热点不得在移动端互相覆盖");
});

test("大腿区域提供前后侧的可推荐定位目标", () => {
  assert.deepEqual(
    getRegionTargets("thigh").map((target) => target.id),
    ["quadriceps-area", "hamstring-area"],
  );
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

test("选择区域后进入感受步骤并清除其他区域的具体位置", () => {
  const next = selectRegionState({
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    targetSides: { rhomboids: "left" },
    symptomIds: [],
    redFlagIds: [],
  }, "knee");

  assert.equal(next.regionId, "knee");
  assert.deepEqual(next.targetIds, []);
  assert.deepEqual(next.targetSides, {});
  assert.equal(getExplorerStep(next), 2);
});

test("首页区域切换通过状态归并清空旧具体定位", () => {
  const currentState = {
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    targetSides: { rhomboids: "left" },
    symptomIds: [],
    redFlagIds: [],
    viewSide: "back",
    step: 2,
  };
  const nextFromHomePage = { ...currentState, regionId: "knee" };
  const next = applyExplorerStateChange(currentState, nextFromHomePage);

  assert.equal(next.regionId, "knee");
  assert.deepEqual(next.targetIds, []);
  assert.deepEqual(next.targetSides, {});
  assert.equal(next.viewSide, "back");
  assert.equal(next.step, 2);
});

test("3D 热点一次状态变更同时保留区域与所需正背面", () => {
  const currentState = {
    regionId: "knee",
    targetIds: ["knee-front"],
    targetSides: {},
    symptomIds: [],
    redFlagIds: [],
    viewSide: "front",
    step: 2,
  };
  const change = getModelRegionSelectionChange("shoulder");
  const next = applyExplorerStateChange(currentState, { ...currentState, ...change });

  assert.deepEqual(change, { regionId: "shoulder", viewSide: "back" });
  assert.equal(next.regionId, "shoulder");
  assert.equal(next.viewSide, "back");
  assert.deepEqual(next.targetIds, []);
  assert.deepEqual(next.targetSides, {});
});

test("重置会清空完整定位与安全状态并回到正面第一步", () => {
  const currentState = {
    regionId: "knee",
    targetIds: ["knee-front"],
    targetSides: { "knee-front": "left" },
    symptomIds: ["tightness"],
    redFlagIds: ["major-trauma"],
    viewSide: "back",
    step: 3,
  };
  const next = applyExplorerStateChange(currentState, { ...currentState, ...getExplorerResetChange() });

  assert.deepEqual(next, {
    regionId: undefined,
    targetIds: [],
    targetSides: {},
    symptomIds: [],
    redFlagIds: [],
    viewSide: "front",
    step: 1,
  });
});

test("从阻断状态选择新区域不会继承感受或红旗", () => {
  const currentState = {
    regionId: "knee",
    targetIds: ["knee-front"],
    targetSides: {},
    symptomIds: ["tightness"],
    redFlagIds: ["major-trauma"],
    viewSide: "front",
    step: 3,
  };
  const change = getModelRegionSelectionChange("shoulder");
  const next = applyExplorerStateChange(currentState, { ...currentState, ...change });

  assert.equal(next.regionId, "shoulder");
  assert.deepEqual(next.targetIds, []);
  assert.deepEqual(next.targetSides, {});
  assert.deepEqual(next.symptomIds, []);
  assert.deepEqual(next.redFlagIds, []);
  assert.equal(next.step, 2);
});

test("没有感受时不提前推荐教程", () => {
  const result = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-front"],
    symptomIds: [],
    redFlagIds: [],
  });

  assert.equal(result.status, "incomplete");
  assert.deepEqual(result.movementIds, []);
});

test("肿胀或麻木进入谨慎状态但红旗才阻断教程", () => {
  assert.equal(getRecommendations({
    regionId: "knee", targetIds: ["knee-front"], symptomIds: ["swelling"], redFlagIds: [],
  }).status, "caution");
  assert.equal(getRecommendations({
    regionId: "knee", targetIds: ["knee-front"], symptomIds: ["swelling"], redFlagIds: ["deformity"],
  }).status, "blocked");
});

test("感受会改变教育提示而不会声明诊断", () => {
  const tight = getRecommendations({ regionId: "neck", targetIds: [], symptomIds: ["tightness"], redFlagIds: [] });
  const neuro = getRecommendations({ regionId: "neck", targetIds: [], symptomIds: ["tingling"], redFlagIds: [] });

  assert.equal(tight.guidanceKey, "gentle-mobility");
  assert.equal(neuro.guidanceKey, "caution-neuro");
  assert.equal(neuro.status, "caution");
});

test("膝和踝均提供关节附近或无法确定的安全选项", () => {
  assert.deepEqual(
    getRegionTargets("knee").filter((target) => target.kind === "joint").map((target) => target.id),
    ["knee-front", "knee-medial", "knee-lateral", "knee-posterior", "upper-calf-area", "knee-joint-unsure"],
  );
  assert.ok(getRegionTargets("ankle").some((target) => target.kind === "joint"));
});

test("肩胛和踝局部图使用普通位置名称并只关联已有教程", () => {
  const shoulderLabels = getRegionTargets("shoulder")
    .filter((target) => target.kind === "joint")
    .map((target) => target.label);
  const ankleLabels = getRegionTargets("ankle")
    .filter((target) => target.kind === "joint")
    .map((target) => target.label);

  assert.ok(shoulderLabels.includes("肩胛骨内侧"));
  assert.ok(ankleLabels.includes("跟腱附近"));
  for (const target of anatomyTargets.filter((item) => item.kind === "joint")) {
    assert.ok(target.movementIds.length > 0, `${target.id} 缺少教程映射`);
    assert.ok(target.movementIds.every((id) => bodyRegions.some((region) => region.movementIds.includes(id))), `${target.id} 关联了未知教程`);
  }
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

test("红旗状态禁用教程入口", () => {
  const blocked = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-joint-unsure"],
    symptomIds: ["swelling"],
    redFlagIds: ["major-trauma"],
  });

  assert.equal(canOpenTutorials(blocked), false);
  assert.equal(canOpenTutorials({ status: "ready" }), true);
});

test("只有完成感受后的建议状态才能打开教程", () => {
  assert.equal(canOpenTutorials({ status: "idle" }), false);
  assert.equal(canOpenTutorials({ status: "incomplete" }), false);
  assert.equal(canOpenTutorials({ status: "caution" }), true);
});

test("完成感受后保留每个匹配教程的导航入口", () => {
  const ready = getRecommendations({
    regionId: "shoulder",
    targetIds: ["middle-lower-trapezius", "rhomboids"],
    symptomIds: ["tightness"],
    redFlagIds: [],
  });
  const caution = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-front"],
    symptomIds: ["swelling"],
    redFlagIds: [],
  });
  const blocked = getRecommendations({
    regionId: "knee",
    targetIds: ["knee-front"],
    symptomIds: ["swelling"],
    redFlagIds: ["major-trauma"],
  });

  assert.deepEqual(getRecommendationNavigationIds(ready), ready.movementIds);
  assert.deepEqual(getRecommendationNavigationIds(caution), caution.movementIds);
  assert.deepEqual(getRecommendationNavigationIds(blocked), []);
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
    targetSides: { rhomboids: "left", unknown: "right" },
    symptomIds: ["tightness"],
    redFlagIds: ["major-trauma"],
    viewSide: "back",
    step: 3,
  });
  const restored = parseExplorerState(search);

  assert.deepEqual(restored, {
    view: "library",
    movementId: "scapular-squeeze",
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    targetSides: { rhomboids: "left" },
    symptomIds: ["tightness"],
    redFlagIds: ["major-trauma"],
    viewSide: "back",
    step: 3,
  });
});

test("双侧定位在首页与教程 URL 往返后保持双侧数组", () => {
  const search = serializeExplorerState({
    view: "library",
    movementId: "supported-half-squat",
    regionId: "thigh",
    targetIds: ["quadriceps-area"],
    targetSides: { "quadriceps-area": ["left", "right", "unknown"] },
    symptomIds: ["tightness"],
    step: 3,
  });

  assert.deepEqual(new URLSearchParams(search).getAll("side"), [
    "quadriceps-area:left",
    "quadriceps-area:right",
  ]);
  assert.deepEqual(parseExplorerState(search), {
    view: "library",
    movementId: "supported-half-squat",
    regionId: "thigh",
    targetIds: ["quadriceps-area"],
    targetSides: { "quadriceps-area": ["left", "right"] },
    symptomIds: ["tightness"],
    step: 3,
  });
});

test("旧单侧 URL 继续恢复为字符串，重复 side 才累积为数组", () => {
  assert.deepEqual(
    parseExplorerState("?region=thigh&targets=quadriceps-area&side=quadriceps-area%3Aleft"),
    {
      view: "home",
      regionId: "thigh",
      targetIds: ["quadriceps-area"],
      targetSides: { "quadriceps-area": "left" },
    },
  );
  assert.deepEqual(
    parseExplorerState("?region=thigh&targets=quadriceps-area&side=quadriceps-area%3Aleft&side=quadriceps-area%3Aright"),
    {
      view: "home",
      regionId: "thigh",
      targetIds: ["quadriceps-area"],
      targetSides: { "quadriceps-area": ["left", "right"] },
    },
  );
});

test("旧 URL 没有新状态字段时仍可恢复已有定位", () => {
  assert.deepEqual(parseExplorerState("?region=shoulder&targets=rhomboids&symptoms=tightness"), {
    view: "home",
    regionId: "shoulder",
    targetIds: ["rhomboids"],
    symptomIds: ["tightness"],
  });
});
