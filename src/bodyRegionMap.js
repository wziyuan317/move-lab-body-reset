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

export const bodySlugTargets = Object.freeze(
  Object.fromEntries(
    Object.entries(targetRegionsBySlug).map(([slug, targetRegions]) => [slug, Object.freeze(Object.keys(targetRegions))]),
  ),
);

export const jointDiagramZones = Object.freeze({
  knee: Object.freeze([
    { id: "knee-front", label: "膝盖正前方", x: 63, y: 46, sideLabel: "前" },
    { id: "knee-medial", label: "膝盖内侧", x: 51, y: 49, sideLabel: "内" },
    { id: "knee-lateral", label: "膝盖外侧", x: 39, y: 48, sideLabel: "外" },
    { id: "knee-posterior", label: "膝盖后方", x: 43, y: 44, sideLabel: "后" },
    { id: "quadriceps-area", label: "大腿前侧", x: 64, y: 27, sideLabel: "上" },
    { id: "hamstring-area", label: "大腿后侧", x: 39, y: 28, sideLabel: "上" },
    { id: "upper-calf-area", label: "小腿上端", x: 42, y: 72, sideLabel: "下" },
    { id: "knee-joint-unsure", label: "不确定具体位置", x: 54, y: 57 },
  ]),
  shoulder: Object.freeze([
    { id: "shoulder-front", label: "肩膀前侧", x: 43, y: 47, sideLabel: "前" },
    { id: "shoulder-lateral", label: "肩膀外侧", x: 29, y: 52, sideLabel: "外" },
    { id: "shoulder-posterior", label: "肩膀后侧", x: 29, y: 38, sideLabel: "后" },
    { id: "scapula-medial", label: "肩胛骨内侧", x: 48, y: 46, sideLabel: "内" },
    { id: "scapula-inferior", label: "肩胛骨下方", x: 53, y: 61, sideLabel: "下" },
    { id: "shoulder-joint-unsure", label: "不确定具体位置", x: 58, y: 30 },
  ]),
  ankle: Object.freeze([
    { id: "ankle-front", label: "踝关节前方", x: 53, y: 67, sideLabel: "前" },
    { id: "ankle-medial", label: "内踝", x: 39, y: 68, sideLabel: "内" },
    { id: "ankle-lateral", label: "外踝", x: 49, y: 69, sideLabel: "外" },
    { id: "achilles-area", label: "跟腱附近", x: 41, y: 51, sideLabel: "后" },
    { id: "calf-posterior", label: "小腿后侧", x: 49, y: 25, sideLabel: "后" },
    { id: "ankle-joint-unsure", label: "不确定具体位置", x: 59, y: 81 },
  ]),
});

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

export function getBodyPartFill({ selected = false, hovered = false } = {}) {
  if (hovered) return "#ffd43b";
  return selected ? "#ff665c" : "#dce5f2";
}
