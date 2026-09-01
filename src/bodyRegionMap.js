const targetRegionsBySlug = {
  neck: { "posterior-neck": "neck" },
  trapezius: { "upper-trapezius": "neck", "middle-lower-trapezius": "shoulder" },
  deltoids: { deltoid: "shoulder" },
  chest: { "pectoralis-major": "thorax", "pectoralis-minor": "thorax" },
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

export const bodySlugTargets = Object.freeze(
  Object.fromEntries(
    Object.entries(targetRegionsBySlug).map(([slug, targetRegions]) => [slug, Object.freeze(Object.keys(targetRegions))]),
  ),
);

// 坐标由最终 PNG 的 0–100% 画布手动标定；替换图片时须先目检并同步更新此处和锁定测试。
export const jointDiagramMetadata = Object.freeze({
  knee: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "单视图膝周轮廓上的人工标定。" }),
  shoulder: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "前侧与背侧双视图上的人工标定；前侧点只落在前侧视图，肩胛点只落在背侧视图。" }),
  ankle: Object.freeze({ coordinateSystem: "image-percent", calibrationNote: "内侧与外侧双视图上的人工标定；内外踝分别落在对应视图。" }),
});

export const jointDiagramZones = Object.freeze({
  knee: Object.freeze([
    { id: "knee-front", marker: "1", label: "膝盖正前方", x: 63, y: 46, sideLabel: "前", view: "single" },
    { id: "knee-medial", marker: "2", label: "膝盖内侧", x: 51, y: 49, sideLabel: "内", view: "single" },
    { id: "knee-lateral", marker: "3", label: "膝盖外侧", x: 39, y: 48, sideLabel: "外", view: "single" },
    { id: "knee-posterior", marker: "4", label: "膝盖后方", x: 43, y: 44, sideLabel: "后", view: "single" },
    { id: "quadriceps-area", marker: "5", label: "大腿前侧", x: 64, y: 27, sideLabel: "上", view: "single" },
    { id: "hamstring-area", marker: "6", label: "大腿后侧", x: 39, y: 28, sideLabel: "上", view: "single" },
    { id: "upper-calf-area", marker: "7", label: "小腿上端", x: 42, y: 72, sideLabel: "下", view: "single" },
    { id: "knee-joint-unsure", marker: "8", label: "不确定具体位置", x: 54, y: 57, view: "single" },
  ]),
  shoulder: Object.freeze([
    { id: "shoulder-front", marker: "1", label: "肩膀前侧", x: 40, y: 42, sideLabel: "前", view: "front" },
    { id: "shoulder-lateral", marker: "2", label: "肩膀外侧", x: 44, y: 50, sideLabel: "外", view: "front" },
    { id: "shoulder-posterior", marker: "3", label: "肩膀后侧", x: 87, y: 42, sideLabel: "后", view: "back" },
    { id: "scapula-medial", marker: "4", label: "肩胛骨内侧", x: 75, y: 43, sideLabel: "内", view: "back" },
    { id: "scapula-inferior", marker: "5", label: "肩胛骨下方", x: 78, y: 57, sideLabel: "下", view: "back" },
    { id: "shoulder-joint-unsure", marker: "6", label: "不确定具体位置", x: 65, y: 63, view: "back" },
  ]),
  ankle: Object.freeze([
    { id: "ankle-front", marker: "1", label: "踝关节前方", x: 29, y: 73, sideLabel: "前", view: "medial" },
    { id: "ankle-medial", marker: "2", label: "内踝", x: 37, y: 70, sideLabel: "内", view: "medial" },
    { id: "ankle-lateral", marker: "3", label: "外踝", x: 62, y: 70, sideLabel: "外", view: "lateral" },
    { id: "achilles-area", marker: "4", label: "跟腱附近", x: 59, y: 63, sideLabel: "后", view: "lateral" },
    { id: "calf-posterior", marker: "5", label: "小腿后侧", x: 60, y: 45, sideLabel: "后", view: "lateral" },
    { id: "ankle-joint-unsure", marker: "6", label: "不确定具体位置", x: 70, y: 76, view: "lateral" },
  ]),
});

export function getJointZoneControlData(regionId, selectedIds = []) {
  return (jointDiagramZones[regionId] ?? []).map(({ id, marker, label, x, y, sideLabel }) => {
    const selected = selectedIds.includes(id);
    return {
      id,
      marker,
      label,
      ariaLabel: [label, sideLabel && `${sideLabel}侧`, selected ? "已选" : "未选"].filter(Boolean).join("，"),
      selected,
      x,
      y,
    };
  });
}

export function getTargetForBodySlug(slug, regionId) {
  return primaryTargetsBySlugRegion[slug]?.[regionId];
}

function normalizeSelectedSides(value) {
  const values = Array.isArray(value) ? value : [value];
  return ["left", "right"].filter((side) => values.includes(side));
}

export function getBodyRegionVisualData({ regionId, selectedIds = [], selectedSides = {} } = {}) {
  return Object.keys(bodySlugTargets).map((slug) => {
    const targetId = getTargetForBodySlug(slug, regionId);
    const selected = Boolean(targetId && selectedIds.includes(targetId));
    const sides = selected ? normalizeSelectedSides(selectedSides[targetId]) : [];
    return { slug, selected, side: sides.length === 1 ? sides[0] : undefined };
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
