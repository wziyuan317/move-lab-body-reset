import assert from "node:assert/strict";
import test from "node:test";

const professional = await import("../src/professionalFocus.js").catch(() => ({}));
const {
  getProfessionalFocus = () => undefined,
  resolveProfessionalPress = () => undefined,
} = professional;

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
