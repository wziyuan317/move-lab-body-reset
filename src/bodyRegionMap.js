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
