import assert from "node:assert/strict";
import test from "node:test";
import { bodySlugTargets, getTargetForBodySlug } from "../src/bodyRegionMap.js";

test("宽泛身体区域都映射到可点击人体 slug", () => {
  for (const slug of ["neck", "trapezius", "deltoids", "chest", "upper-back", "lower-back", "gluteal", "quadriceps", "hamstring", "knees", "calves", "tibialis", "ankles"]) {
    assert.ok(bodySlugTargets[slug]?.length > 0, `${slug} 缺少目标映射`);
  }
});

test("同一 slug 按当前区域返回具体目标", () => {
  assert.equal(getTargetForBodySlug("quadriceps", "thigh"), "quadriceps-area");
  assert.equal(getTargetForBodySlug("quadriceps", "knee"), "rectus-femoris");
});
