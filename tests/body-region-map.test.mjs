import assert from "node:assert/strict";
import test from "node:test";
import * as bodyRegionMap from "../src/bodyRegionMap.js";
import { anatomyTargets } from "../src/bodyMap.js";

const {
  bodySlugTargets,
  getBodyPartFill = () => undefined,
  getBodyRegionVisualData = () => [],
  getJointZoneControlData = () => [],
  getTargetForBodySlug,
  jointDiagramMetadata = {},
  jointDiagramZones = {},
} = bodyRegionMap;

test("宽泛身体区域都映射到可点击人体 slug", () => {
  for (const slug of ["neck", "trapezius", "deltoids", "chest", "upper-back", "lower-back", "gluteal", "quadriceps", "hamstring", "knees", "calves", "tibialis", "ankles"]) {
    assert.ok(bodySlugTargets[slug]?.length > 0, `${slug} 缺少目标映射`);
  }
});

test("同一 slug 按当前区域返回具体目标", () => {
  assert.equal(getTargetForBodySlug("quadriceps", "thigh"), "quadriceps-area");
  assert.equal(getTargetForBodySlug("quadriceps", "knee"), "rectus-femoris");
});

test("多个候选 target 的 slug 使用显式主映射", () => {
  assert.equal(getTargetForBodySlug("upper-back", "shoulder"), "rhomboids");
  assert.equal(getTargetForBodySlug("upper-back", "thorax"), "thoracic-erectors");
  assert.equal(getTargetForBodySlug("trapezius", "shoulder"), "middle-lower-trapezius");
});

test("视觉数据保留既有字符串侧别并只高亮所选侧", () => {
  const [part] = getBodyRegionVisualData({
    regionId: "thigh",
    selectedIds: ["quadriceps-area"],
    selectedSides: { "quadriceps-area": "left" },
  }).filter((item) => item.slug === "quadriceps");

  assert.deepEqual(part, { slug: "quadriceps", selected: true, side: "left" });
});

test("视觉数据支持右侧和双侧选择，未选侧不会变为 selected", () => {
  const right = getBodyRegionVisualData({
    regionId: "thigh",
    selectedIds: ["quadriceps-area"],
    selectedSides: { "quadriceps-area": "right" },
  }).find((item) => item.slug === "quadriceps");
  const both = getBodyRegionVisualData({
    regionId: "thigh",
    selectedIds: ["quadriceps-area"],
    selectedSides: { "quadriceps-area": ["left", "right"] },
  }).find((item) => item.slug === "quadriceps");
  const unselected = getBodyRegionVisualData({
    regionId: "thigh",
    selectedIds: [],
    selectedSides: { "quadriceps-area": "left" },
  }).find((item) => item.slug === "quadriceps");

  assert.deepEqual(right, { slug: "quadriceps", selected: true, side: "right" });
  assert.deepEqual(both, { slug: "quadriceps", selected: true, side: undefined });
  assert.deepEqual(unselected, { slug: "quadriceps", selected: false, side: undefined });
});

test("视觉颜色仅在实际悬停路径上覆盖 selected 色", () => {
  assert.equal(getBodyPartFill({ selected: false, hovered: false }), "#dce5f2");
  assert.equal(getBodyPartFill({ selected: true, hovered: false }), "#ff665c");
  assert.equal(getBodyPartFill({ selected: true, hovered: true }), "#ffd43b");
});

test("复杂关节图覆盖普通用户可描述的位置", () => {
  assert.deepEqual(jointDiagramZones.knee.map((zone) => zone.id), [
    "knee-front", "knee-medial", "knee-lateral", "knee-posterior", "quadriceps-area", "hamstring-area", "upper-calf-area", "knee-joint-unsure",
  ]);
  assert.ok(jointDiagramZones.shoulder.length >= 6);
  assert.ok(jointDiagramZones.ankle.length >= 6);
});

test("关节图热点 ID 唯一并且都能进入位置与推荐数据", () => {
  const zones = Object.values(jointDiagramZones).flat();
  const ids = zones.map((zone) => zone.id);
  const targetIds = new Set(anatomyTargets.map((target) => target.id));

  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(targetIds.has(id), `${id} 没有对应 anatomyTarget`);
});

test("双视图关节图记录人工标定来源并锁定关键位置", () => {
  assert.equal(jointDiagramMetadata.shoulder.coordinateSystem, "image-percent");
  assert.equal(jointDiagramMetadata.ankle.coordinateSystem, "image-percent");
  assert.match(jointDiagramMetadata.shoulder.calibrationNote, /前侧.*背侧/);
  assert.match(jointDiagramMetadata.ankle.calibrationNote, /内侧.*外侧/);

  const shoulderFront = jointDiagramZones.shoulder.find((zone) => zone.id === "shoulder-front");
  const ankleMedial = jointDiagramZones.ankle.find((zone) => zone.id === "ankle-medial");
  const ankleLateral = jointDiagramZones.ankle.find((zone) => zone.id === "ankle-lateral");
  assert.deepEqual(
    { x: shoulderFront.x, y: shoulderFront.y, view: shoulderFront.view },
    { x: 40, y: 42, view: "front" },
  );
  assert.deepEqual(
    { x: ankleMedial.x, y: ankleMedial.y, view: ankleMedial.view },
    { x: 37, y: 70, view: "medial" },
  );
  assert.deepEqual(
    { x: ankleLateral.x, y: ankleLateral.y, view: ankleLateral.view },
    { x: 62, y: 70, view: "lateral" },
  );
});

test("热点用固定短标记显示，而完整位置名称仍可访问", () => {
  const controls = getJointZoneControlData("shoulder", ["shoulder-front"]);
  const front = controls.find((zone) => zone.id === "shoulder-front");

  assert.deepEqual(front, {
    id: "shoulder-front",
    marker: "1",
    label: "肩膀前侧",
    ariaLabel: "肩膀前侧，前侧，已选",
    selected: true,
    x: 40,
    y: 42,
  });
  assert.ok(controls.every((zone) => zone.marker.length <= 2));
  assert.ok(controls.every((zone) => zone.marker !== zone.label));
});
