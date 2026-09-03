import { anatomyTargets } from "./bodyMap.js";

const targetRegionsBySlug = {
  neck: { "posterior-neck": "neck" },
  trapezius: {
    "upper-trapezius": "neck",
    "levator-scapulae": "neck",
    "middle-lower-trapezius": "shoulder",
  },
  deltoids: { deltoid: "shoulder" },
  chest: {
    "serratus-anterior": "shoulder",
    "pectoralis-major": "thorax",
    "pectoralis-minor": "thorax",
  },
  "upper-back": {
    infraspinatus: "shoulder",
    rhomboids: "shoulder",
    "thoracic-erectors": "thorax",
    "latissimus-dorsi": "thorax",
  },
  "lower-back": {
    "lumbar-erectors": "low-back",
    "quadratus-lumborum": "low-back",
    "lateral-abdominals": "low-back",
  },
  gluteal: { "gluteus-maximus": "hip", "gluteus-medius": "hip", piriformis: "hip" },
  quadriceps: {
    "hip-flexors": "hip",
    "quadriceps-area": "thigh",
    "rectus-femoris": "knee",
    "vastus-medialis": "knee",
    "vastus-lateralis": "knee",
  },
  hamstring: { "hamstring-area": "thigh", "knee-hamstrings": "knee" },
  knees: {
    "knee-front": "knee",
    "knee-medial": "knee",
    "knee-lateral": "knee",
    "knee-posterior": "knee",
    "knee-joint-unsure": "knee",
  },
  calves: { gastrocnemius: "ankle", soleus: "ankle" },
  tibialis: { "tibialis-anterior": "ankle" },
  ankles: { "ankle-joint-unsure": "ankle" },
};

const primaryTargetsBySlugRegion = {
  neck: { neck: "posterior-neck" },
  trapezius: { neck: "upper-trapezius", shoulder: "middle-lower-trapezius" },
  deltoids: { shoulder: "deltoid" },
  chest: { thorax: "pectoralis-major" },
  "upper-back": { shoulder: "rhomboids", thorax: "thoracic-erectors" },
  "lower-back": { "low-back": "lumbar-erectors" },
  gluteal: { hip: "gluteus-maximus" },
  quadriceps: { thigh: "quadriceps-area", knee: "rectus-femoris" },
  hamstring: { thigh: "hamstring-area", knee: "knee-hamstrings" },
  knees: { knee: "knee-front" },
  calves: { ankle: "gastrocnemius" },
  tibialis: { ankle: "tibialis-anterior" },
  ankles: { ankle: "ankle-joint-unsure" },
};

const bodySlugLabels = {
  neck: "颈后",
  trapezius: "斜方肌",
  deltoids: "肩部",
  chest: "胸前",
  "upper-back": "上背",
  "lower-back": "下背",
  gluteal: "臀部",
  quadriceps: "大腿前侧",
  hamstring: "大腿后侧",
  knees: "膝部",
  calves: "小腿后侧",
  tibialis: "小腿前侧",
  ankles: "踝部",
};

export const sideAnatomyHotspots = Object.freeze([
  { slug: "neck", label: "颈后", regionIds: ["neck"], x: 43, y: 9, width: 14, height: 10, hitSize: 44 },
  { slug: "trapezius", label: "斜方肌", regionIds: ["neck", "shoulder"], x: 44, y: 15, width: 18, height: 9, hitSize: 44 },
  { slug: "deltoids", label: "肩部", regionIds: ["shoulder"], x: 50, y: 18, width: 14, height: 12, hitSize: 44 },
  { slug: "chest", label: "胸前", regionIds: ["thorax"], x: 37, y: 23, width: 15, height: 17, hitSize: 44 },
  { slug: "upper-back", label: "上背", regionIds: ["shoulder", "thorax"], x: 51, y: 24, width: 12, height: 17, hitSize: 44 },
  { slug: "lower-back", label: "下背", regionIds: ["low-back"], x: 48, y: 37, width: 14, height: 13, hitSize: 44 },
  { slug: "gluteal", label: "臀部", regionIds: ["hip"], x: 50, y: 43, width: 14, height: 14, hitSize: 44 },
  { slug: "quadriceps", label: "大腿前侧", regionIds: ["hip", "thigh", "knee"], x: 38, y: 49, width: 14, height: 20, hitSize: 44 },
  { slug: "hamstring", label: "大腿后侧", regionIds: ["thigh", "knee"], x: 50, y: 52, width: 12, height: 17, hitSize: 44 },
  { slug: "knees", label: "膝部", regionIds: ["knee"], x: 42, y: 65, width: 16, height: 10, hitSize: 44 },
  { slug: "calves", label: "小腿后侧", regionIds: ["ankle"], x: 49, y: 71, width: 12, height: 18, hitSize: 44 },
  { slug: "tibialis", label: "小腿前侧", regionIds: ["ankle"], x: 42, y: 71, width: 10, height: 18, hitSize: 44 },
  { slug: "ankles", label: "踝部", regionIds: ["ankle"], x: 41, y: 87, width: 18, height: 10, hitSize: 44 },
].map((hotspot) => Object.freeze({ ...hotspot, regionIds: Object.freeze(hotspot.regionIds) })));

export const bodySlugTargets = Object.freeze(
  Object.fromEntries(
    Object.entries(targetRegionsBySlug).map(([slug, targetRegions]) => [slug, Object.freeze(Object.keys(targetRegions))]),
  ),
);

const anatomyTargetById = new Map(anatomyTargets.map((target) => [target.id, target]));

export const JOINT_MARKER_SIZE = 44;
export const JOINT_MARKER_SELECTED_SCALE = 1.08;

// anchor 坐标由最终 PNG 的 0–100% 画布手动标定；marker 是独立 callout 布局。替换图片时须先目检并同步更新锁定测试。
export const jointDiagramMetadata = Object.freeze({
  knee: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "单视图膝周轮廓上的人工标定。" }),
  shoulder: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "前侧与背侧双视图上的人工标定；前侧点只落在前侧视图，肩胛点只落在背侧视图。" }),
  ankle: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "内侧与外侧双视图上的人工标定；内外踝分别落在对应视图。" }),
});

export const jointDiagramZones = Object.freeze({
  knee: Object.freeze([
    { id: "knee-front", marker: "1", label: "膝盖正前方", anchorX: 63, anchorY: 46, markerX: 72, markerY: 39, sideLabel: "前", view: "single" },
    { id: "knee-medial", marker: "2", label: "膝盖内侧", anchorX: 51, anchorY: 49, markerX: 50, markerY: 39, sideLabel: "内", view: "single" },
    { id: "knee-lateral", marker: "3", label: "膝盖外侧", anchorX: 39, anchorY: 48, markerX: 34, markerY: 61, sideLabel: "外", view: "single" },
    { id: "knee-posterior", marker: "4", label: "膝盖后方", anchorX: 43, anchorY: 44, markerX: 28, markerY: 39, sideLabel: "后", view: "single" },
    { id: "quadriceps-area", marker: "5", label: "大腿前侧", anchorX: 64, anchorY: 27, markerX: 64, markerY: 18, sideLabel: "上", view: "single" },
    { id: "hamstring-area", marker: "6", label: "大腿后侧", anchorX: 39, anchorY: 28, markerX: 38, markerY: 18, sideLabel: "上", view: "single" },
    { id: "upper-calf-area", marker: "7", label: "小腿上端", anchorX: 42, anchorY: 72, markerX: 42, markerY: 82, sideLabel: "下", view: "single" },
    { id: "knee-joint-unsure", marker: "8", label: "不确定具体位置", anchorX: 54, anchorY: 57, markerX: 60, markerY: 61, view: "single" },
  ]),
  shoulder: Object.freeze([
    { id: "shoulder-front", marker: "1", label: "肩膀前侧", anchorX: 40, anchorY: 42, markerX: 34, markerY: 35, sideLabel: "前", view: "front" },
    { id: "shoulder-lateral", marker: "2", label: "肩膀外侧", anchorX: 44, anchorY: 50, markerX: 48, markerY: 53, sideLabel: "外", view: "front" },
    { id: "shoulder-posterior", marker: "3", label: "肩膀后侧", anchorX: 87, anchorY: 42, markerX: 86, markerY: 35, sideLabel: "后", view: "back" },
    { id: "scapula-medial", marker: "4", label: "肩胛骨内侧", anchorX: 75, anchorY: 43, markerX: 72, markerY: 53, sideLabel: "内", view: "back" },
    { id: "scapula-inferior", marker: "5", label: "肩胛骨下方", anchorX: 78, anchorY: 57, markerX: 78, markerY: 71, sideLabel: "下", view: "back" },
    { id: "shoulder-joint-unsure", marker: "6", label: "不确定具体位置", anchorX: 65, anchorY: 63, markerX: 58, markerY: 71, view: "back" },
  ]),
  ankle: Object.freeze([
    { id: "ankle-front", marker: "1", label: "踝关节前方", anchorX: 29, anchorY: 73, markerX: 25, markerY: 70, sideLabel: "前", view: "medial" },
    { id: "ankle-medial", marker: "2", label: "内踝", anchorX: 37, anchorY: 70, markerX: 40, markerY: 86, sideLabel: "内", view: "medial" },
    { id: "ankle-lateral", marker: "3", label: "外踝", anchorX: 62, anchorY: 70, markerX: 65, markerY: 70, sideLabel: "外", view: "lateral" },
    { id: "achilles-area", marker: "4", label: "跟腱附近", anchorX: 59, anchorY: 63, markerX: 67, markerY: 53, sideLabel: "后", view: "lateral" },
    { id: "calf-posterior", marker: "5", label: "小腿后侧", anchorX: 60, anchorY: 45, markerX: 64, markerY: 35, sideLabel: "后", view: "lateral" },
    { id: "ankle-joint-unsure", marker: "6", label: "不确定具体位置", anchorX: 70, anchorY: 76, markerX: 82, markerY: 86, view: "lateral" },
  ]),
});

export function getJointZoneControlData(regionId, selectedIds = []) {
  return (jointDiagramZones[regionId] ?? []).map(({ id, marker, label, anchorX, anchorY, markerX, markerY, sideLabel }) => {
    const selected = selectedIds.includes(id);
    return {
      id,
      marker,
      label,
      ariaLabel: [label, sideLabel && `${sideLabel}侧`, selected ? "已选" : "未选"].filter(Boolean).join("，"),
      selected,
      anchorX,
      anchorY,
      markerX,
      markerY,
    };
  });
}

export function getJointLeaderLineData(regionId, selectedIds = []) {
  return getJointZoneControlData(regionId, selectedIds).map((zone) => {
    const deltaX = zone.markerX - zone.anchorX;
    const deltaY = zone.markerY - zone.anchorY;
    return {
      id: zone.id,
      selected: zone.selected,
      anchorX: zone.anchorX,
      anchorY: zone.anchorY,
      markerX: zone.markerX,
      markerY: zone.markerY,
      lengthPercent: Math.hypot(deltaX, deltaY),
      angleDeg: Math.atan2(deltaY, deltaX) * 180 / Math.PI,
    };
  });
}

export function getTargetForBodySlug(slug, regionId) {
  return primaryTargetsBySlugRegion[slug]?.[regionId];
}

export function getTargetIdsForBodySlug(slug, regionId) {
  return Object.entries(targetRegionsBySlug[slug] ?? {})
    .filter(([, targetRegionId]) => targetRegionId === regionId)
    .map(([targetId]) => targetId);
}

function normalizeSelectedSides(value) {
  const values = Array.isArray(value) ? value : [value];
  return ["left", "right"].filter((side) => values.includes(side));
}

export function getBodyRegionVisualData({ regionId, selectedIds = [], selectedSides = {} } = {}) {
  return Object.keys(bodySlugTargets).map((slug) => {
    const targetIds = getTargetIdsForBodySlug(slug, regionId);
    const targetId = targetIds.find((candidateId) => selectedIds.includes(candidateId));
    const selected = Boolean(targetId);
    const sides = selected ? normalizeSelectedSides(selectedSides[targetId]) : [];
    return {
      slug,
      targetIds,
      targetId,
      selected,
      color: targetId ? anatomyTargetById.get(targetId)?.color : undefined,
      side: sides.length === 1 ? sides[0] : undefined,
    };
  });
}

export function getJointMarkerRects(regionId, { canvasSize = 320, selectedIds = [] } = {}) {
  return getJointZoneControlData(regionId, selectedIds).map((zone) => {
    const scale = zone.selected ? JOINT_MARKER_SELECTED_SCALE : 1;
    const size = JOINT_MARKER_SIZE * scale;
    const centerX = canvasSize * zone.markerX / 100;
    const centerY = canvasSize * zone.markerY / 100;
    return {
      id: zone.id,
      left: centerX - size / 2,
      right: centerX + size / 2,
      top: centerY - size / 2,
      bottom: centerY + size / 2,
    };
  });
}

export function getBodySideControlData({ regionId, selectedIds = [], selectedSides = {} } = {}) {
  return Object.keys(bodySlugTargets).flatMap((slug) => {
    const targetId = getTargetForBodySlug(slug, regionId);
    if (!targetId) return [];
    const selectedForTarget = selectedIds.includes(targetId)
      ? normalizeSelectedSides(selectedSides[targetId])
      : [];
    return [
      { side: "left", sideLabel: "左侧" },
      { side: "right", sideLabel: "右侧" },
    ].map(({ side, sideLabel }) => {
      const selected = selectedForTarget.includes(side);
      const label = bodySlugLabels[slug];
      return {
        id: `${targetId}:${side}`,
        targetId,
        slug,
        label,
        side,
        sideLabel,
        hitSize: 44,
        ariaLabel: `${label}，${sideLabel}，${selected ? "已选" : "未选"}`,
        selected,
      };
    });
  });
}

export function getBodyPartFill({ selected = false, hovered = false } = {}) {
  if (hovered) return "#ffd43b";
  return selected ? "#ff665c" : "#dce5f2";
}
