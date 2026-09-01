import assert from "node:assert/strict";
import test from "node:test";
import * as bodyRegionMap from "../src/bodyRegionMap.js";
import { anatomyTargets } from "../src/bodyMap.js";

const {
  bodySlugTargets,
  getBodyPartFill = () => undefined,
  getBodySideControlData = () => [],
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

test("普通身体图为当前区域提供左右两侧的键盘等价控件", () => {
  const controls = getBodySideControlData({
    regionId: "thigh",
    selectedIds: ["quadriceps-area"],
    selectedSides: { "quadriceps-area": ["left", "right"] },
  });

  assert.deepEqual(controls, [
    {
      id: "quadriceps-area:left",
      targetId: "quadriceps-area",
      slug: "quadriceps",
      label: "大腿前侧",
      side: "left",
      sideLabel: "左侧",
      ariaLabel: "大腿前侧，左侧，已选",
      selected: true,
    },
    {
      id: "quadriceps-area:right",
      targetId: "quadriceps-area",
      slug: "quadriceps",
      label: "大腿前侧",
      side: "right",
      sideLabel: "右侧",
      ariaLabel: "大腿前侧，右侧，已选",
      selected: true,
    },
    {
      id: "hamstring-area:left",
      targetId: "hamstring-area",
      slug: "hamstring",
      label: "大腿后侧",
      side: "left",
      sideLabel: "左侧",
      ariaLabel: "大腿后侧，左侧，未选",
      selected: false,
    },
    {
      id: "hamstring-area:right",
      targetId: "hamstring-area",
      slug: "hamstring",
      label: "大腿后侧",
      side: "right",
      sideLabel: "右侧",
      ariaLabel: "大腿后侧，右侧，未选",
      selected: false,
    },
  ]);
});

test("身体图等价控件不为空且每个目标始终成对提供左右按钮", () => {
  for (const regionId of ["neck", "thorax", "low-back", "hip", "thigh"]) {
    const controls = getBodySideControlData({ regionId });
    assert.ok(controls.length >= 2, `${regionId} 缺少等价控件`);
    const sidesByTarget = Object.groupBy(controls, (control) => control.targetId);
    for (const targetControls of Object.values(sidesByTarget)) {
      assert.deepEqual(targetControls.map((control) => control.side), ["left", "right"]);
    }
  }
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
