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

export const bodySlugTargets = Object.freeze(
  Object.fromEntries(
    Object.entries(targetRegionsBySlug).map(([slug, targetRegions]) => [slug, Object.freeze(Object.keys(targetRegions))]),
  ),
);

export function getTargetForBodySlug(slug, regionId) {
  return bodySlugTargets[slug]?.find((targetId) => targetRegionsBySlug[slug][targetId] === regionId);
}
