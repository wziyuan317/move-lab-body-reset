import assert from "node:assert/strict";
import test from "node:test";

const professional = await import("../src/professionalFocus.js").catch(() => ({}));
const {
  ANATOMY_DEFAULTS,
  ANATOMY_ZOOM_MAX,
  ANATOMY_ZOOM_MIN,
  getProfessionalFocus = () => undefined,
  getNextAnatomyZoom = () => undefined,
  normalizeAnatomyPreference = () => undefined,
  resolveProfessionalPress = () => undefined,
} = professional;

test("专业解剖观察偏好使用稳定默认值并拒绝未知选项", () => {
  assert.deepEqual(ANATOMY_DEFAULTS, { sex: "male", view: "front", zoom: 1 });
  assert.deepEqual(normalizeAnatomyPreference(), ANATOMY_DEFAULTS);
  assert.deepEqual(
    normalizeAnatomyPreference({ sex: "female", view: "side", zoom: 1.4 }),
    { sex: "female", view: "side", zoom: 1.4 },
  );
  assert.deepEqual(
    normalizeAnatomyPreference({ sex: "unknown", view: "inside", zoom: 9 }),
    { sex: "male", view: "front", zoom: ANATOMY_ZOOM_MAX },
  );
});

test("专业解剖缩放按固定步长变化并夹在安全边界内", () => {
  assert.equal(ANATOMY_ZOOM_MIN, 0.8);
  assert.equal(ANATOMY_ZOOM_MAX, 2);
  assert.equal(getNextAnatomyZoom(1, "in"), 1.2);
  assert.equal(getNextAnatomyZoom(1.2, "out"), 1);
  assert.equal(getNextAnatomyZoom(ANATOMY_ZOOM_MAX, "in"), ANATOMY_ZOOM_MAX);
  assert.equal(getNextAnatomyZoom(ANATOMY_ZOOM_MIN, "out"), ANATOMY_ZOOM_MIN);
  assert.equal(getNextAnatomyZoom(1.4, "reset"), 1);
});

test("归一化观察偏好不会修改身体定位状态", () => {
  const value = Object.freeze({
    sex: "female",
    view: "back",
    zoom: 1.6,
    regionId: "shoulder",
    targetIds: Object.freeze(["deltoid"]),
  });

  assert.deepEqual(normalizeAnatomyPreference(value), { sex: "female", view: "back", zoom: 1.6 });
  assert.deepEqual(value.targetIds, ["deltoid"]);
  assert.equal(value.regionId, "shoulder");
});

test("唯一映射的肌肉图点击可直接选择并保留侧别", () => {
  assert.deepEqual(resolveProfessionalPress({ slug: "deltoids", regionId: "shoulder", side: "left" }), {
    type: "toggle",
    targetId: "deltoid",
    targetIds: ["deltoid"],
    side: "left",
    focusKey: "shoulder-left",
  });
});

test("多肌肉映射先聚焦再让用户精确选择", () => {
  const result = resolveProfessionalPress({ slug: "upper-back", regionId: "shoulder", side: "right" });

  assert.equal(result.type, "choose");
  assert.deepEqual(result.targetIds, ["infraspinatus", "rhomboids"]);
  assert.equal(result.side, "right");
  assert.equal(result.focusKey, "shoulder-right");
});

test("不属于当前区域的身体图点击不会产生误选", () => {
  assert.deepEqual(resolveProfessionalPress({ slug: "calves", regionId: "neck", side: "left" }), {
    type: "ignore",
    targetIds: [],
    side: "left",
    focusKey: "neck",
  });
});

test("膝部聚焦比躯干更近且锚点保持在画布内", () => {
  const knee = getProfessionalFocus("knee-left");
  const thorax = getProfessionalFocus("thorax");

  assert.ok(knee.scale > thorax.scale);
  assert.ok([knee.originX, knee.originY].every((value) => value >= 0 && value <= 100));
  assert.deepEqual(getProfessionalFocus("unknown"), { scale: 1, originX: 50, originY: 50 });
});
