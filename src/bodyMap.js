import { movements } from "./movements.js";

const movementIds = new Set(movements.map((movement) => movement.id));

export const symptoms = [
  { id: "tightness", label: "酸紧 / 发僵" },
  { id: "limited-motion", label: "活动受限" },
  { id: "weakness", label: "感觉无力" },
  { id: "swelling", label: "肿胀" },
  { id: "tingling", label: "刺痛 / 麻木" },
];

export const redFlags = [
  { id: "major-trauma", label: "近期明显外伤，或无法正常负重 / 抬臂" },
  { id: "progressive-neuro", label: "无力或麻木正在加重" },
  { id: "deformity", label: "明显肿胀、变形或关节卡住" },
  { id: "fever-pain", label: "发热同时伴随疼痛" },
];

export const bodyRegions = [
  {
    id: "neck",
    label: "颈部",
    shortLabel: "颈",
    prompt: "后颈、颈侧或颈肩交界不舒服",
    hotspot: { position: [0, 0.72, 0.1], side: "back" },
    movementIds: ["neck-sidebend", "levator-stretch", "scapular-squeeze"],
  },
  {
    id: "shoulder",
    label: "肩胛 / 肩",
    shortLabel: "肩",
    prompt: "肩峰、肩胛骨周围或上背不舒服",
    hotspot: { position: [0.27, 0.55, 0.08], side: "back" },
    movementIds: ["scapular-squeeze", "wall-pushup", "chest-opener"],
  },
  {
    id: "thorax",
    label: "胸背",
    shortLabel: "胸背",
    prompt: "胸前紧、上背僵或胸椎转动受限",
    hotspot: { position: [-0.2, 0.32, 0.12], side: "front" },
    movementIds: ["thoracic-wave", "chair-thoracic-extension", "seated-twist"],
  },
  {
    id: "low-back",
    label: "腰部",
    shortLabel: "腰",
    prompt: "腰背、腰侧或久坐后发紧",
    hotspot: { position: [0.18, 0.06, -0.1], side: "back" },
    movementIds: ["supported-hinge", "side-bend", "seated-fold"],
  },
  {
    id: "hip",
    label: "髋臀",
    shortLabel: "髋",
    prompt: "臀部、髋外侧或髋前侧不舒服",
    hotspot: { position: [-0.19, -0.2, -0.08], side: "back" },
    movementIds: ["figure-four", "supported-half-squat", "supported-hinge"],
  },
  {
    id: "knee",
    label: "膝盖",
    shortLabel: "膝",
    prompt: "膝前、内外侧或膝后不舒服",
    hotspot: { position: [0.13, -0.56, 0.08], side: "front" },
    movementIds: ["seated-knee-extension", "supported-half-squat", "supported-calf-raise"],
  },
  {
    id: "ankle",
    label: "踝小腿",
    shortLabel: "踝",
    prompt: "小腿、跟腱或踝周围不舒服",
    hotspot: { position: [-0.12, -0.83, 0.06], side: "front" },
    movementIds: ["supported-calf-raise", "supported-hinge", "side-bend"],
  },
];

export const anatomyTargets = [
  { id: "upper-trapezius", regionId: "neck", label: "上斜方肌", kind: "muscle", color: "#ff5c4d", meshNames: ["Descending Part Of Trapezius Muscle"], movementIds: ["neck-sidebend", "scapular-squeeze"] },
  { id: "levator-scapulae", regionId: "neck", label: "肩胛提肌", kind: "muscle", color: "#ff9f1c", meshNames: ["Levator Scapulae"], movementIds: ["levator-stretch", "scapular-squeeze"] },
  { id: "posterior-neck", regionId: "neck", label: "颈后肌群", kind: "muscle", color: "#ffd43b", meshNames: ["Splenius Capitis Muscle", "Splenius Colli Muscle"], movementIds: ["neck-sidebend", "levator-stretch"] },

  { id: "deltoid", regionId: "shoulder", label: "三角肌", kind: "muscle", color: "#f72585", meshNames: ["Acromial Part Of Deltoid Muscle", "Clavicular Part Of Deltoid Muscle", "Scapular Spinal Part Of Deltoid Muscle"], movementIds: ["wall-pushup", "chest-opener"] },
  { id: "infraspinatus", regionId: "shoulder", label: "冈下肌", kind: "muscle", color: "#b5179e", meshNames: ["Infraspinatus Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "middle-lower-trapezius", regionId: "shoulder", label: "中下斜方肌", kind: "muscle", color: "#7209b7", meshNames: ["Transverse Part Of Trapezius Muscle", "Ascending Part Of Trapezius Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "rhomboids", regionId: "shoulder", label: "菱形肌", kind: "muscle", color: "#4361ee", meshNames: ["Rhomboid Major Muscle", "Rhomboid Minor Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "serratus-anterior", regionId: "shoulder", label: "前锯肌", kind: "muscle", color: "#4cc9f0", meshNames: ["Serratus Anterior Muscle"], movementIds: ["wall-pushup", "scapular-squeeze"] },

  { id: "pectoralis-major", regionId: "thorax", label: "胸大肌", kind: "muscle", color: "#ef476f", meshNames: ["Clavicular Head Of Pectoralis Major Muscle", "Sternocostal Head Of Pectoralis Major Muscle"], movementIds: ["chest-opener", "chair-thoracic-extension"] },
  { id: "pectoralis-minor", regionId: "thorax", label: "胸小肌", kind: "muscle", color: "#f78c6b", meshNames: ["Pectoralis Minor Muscle"], movementIds: ["chest-opener", "scapular-squeeze"] },
  { id: "thoracic-erectors", regionId: "thorax", label: "胸椎旁肌群", kind: "muscle", color: "#06d6a0", meshNames: ["Iliocostalis Thoracis Muscle", "Longissimus Thoracis Muscle"], movementIds: ["thoracic-wave", "chair-thoracic-extension"] },
  { id: "latissimus-dorsi", regionId: "thorax", label: "背阔肌", kind: "muscle", color: "#118ab2", meshNames: ["Latissimus Dorsi Muscle"], movementIds: ["chair-thoracic-extension", "side-bend"] },

  { id: "lumbar-erectors", regionId: "low-back", label: "腰段竖脊肌", kind: "muscle", color: "#00b4d8", meshNames: ["Iliocostalis Lumborum Muscle", "Longissimus Thoracis Muscle"], movementIds: ["supported-hinge", "seated-fold"] },
  { id: "quadratus-lumborum", regionId: "low-back", label: "腰方肌", kind: "muscle", color: "#2a9d8f", meshNames: ["Quadratus Lumborum Muscle"], movementIds: ["side-bend", "supported-hinge"] },
  { id: "lateral-abdominals", regionId: "low-back", label: "侧腹肌群", kind: "muscle", color: "#80b918", meshNames: ["External Abdominal Oblique Muscle", "Internal Abdominal Oblique Muscle"], movementIds: ["side-bend", "seated-twist"] },

  { id: "gluteus-maximus", regionId: "hip", label: "臀大肌", kind: "muscle", color: "#ff6b6b", meshNames: ["Gluteus Maximus Muscle"], movementIds: ["figure-four", "supported-half-squat"] },
  { id: "gluteus-medius", regionId: "hip", label: "臀中肌", kind: "muscle", color: "#ff922b", meshNames: ["Gluteus Medius Muscle"], movementIds: ["figure-four", "supported-half-squat"] },
  { id: "piriformis", regionId: "hip", label: "梨状肌", kind: "muscle", color: "#fcc419", meshNames: ["Piriformis Muscle"], movementIds: ["figure-four", "supported-hinge"] },
  { id: "hip-flexors", regionId: "hip", label: "髋前侧屈肌群", kind: "muscle", color: "#94d82d", meshNames: ["Iliacus Muscle", "Psoas Major"], movementIds: ["supported-hinge", "supported-half-squat"] },

  { id: "rectus-femoris", regionId: "knee", label: "股直肌远端", kind: "muscle", color: "#51cf66", meshNames: ["Rectus Femoris Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "vastus-medialis", regionId: "knee", label: "股内侧肌", kind: "muscle", color: "#20c997", meshNames: ["Vastus Medialis Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "vastus-lateralis", regionId: "knee", label: "股外侧肌", kind: "muscle", color: "#15aabf", meshNames: ["Vastus Lateralis Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-hamstrings", regionId: "knee", label: "膝后肌群", kind: "muscle", color: "#228be6", meshNames: ["Semitendinosus Muscle", "Semimembranosus Muscle", "Long Head Of Biceps Femoris"], movementIds: ["supported-hinge", "supported-half-squat"] },
  { id: "knee-front", regionId: "knee", label: "膝前区 / 髌骨周围", kind: "joint", color: "#74c0fc", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-medial", regionId: "knee", label: "膝内侧区", kind: "joint", color: "#63e6be", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-lateral", regionId: "knee", label: "膝外侧区", kind: "joint", color: "#a9e34b", meshNames: [], movementIds: ["supported-half-squat", "supported-calf-raise"] },
  { id: "knee-posterior", regionId: "knee", label: "膝后区", kind: "joint", color: "#ffe066", meshNames: [], movementIds: ["supported-hinge", "supported-half-squat"] },
  { id: "knee-joint-unsure", regionId: "knee", label: "关节附近 / 无法确定具体肌肉", kind: "joint", color: "#adb5bd", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat", "supported-calf-raise"] },

  { id: "gastrocnemius", regionId: "ankle", label: "腓肠肌", kind: "muscle", color: "#3b5bdb", meshNames: ["Lateral Head Of Gastrocnemius", "Medial Head Of Gastrocnemius"], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "soleus", regionId: "ankle", label: "比目鱼肌", kind: "muscle", color: "#7048e8", meshNames: ["Soleus Muscle"], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "tibialis-anterior", regionId: "ankle", label: "胫骨前肌", kind: "muscle", color: "#ae3ec9", meshNames: ["Tibialis Anterior Muscle"], movementIds: ["supported-calf-raise", "side-bend"] },
  { id: "ankle-joint-unsure", regionId: "ankle", label: "踝关节 / 跟腱附近，无法确定具体肌肉", kind: "joint", color: "#868e96", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
];

export const regionCameraPresets = Object.fromEntries(
  bodyRegions.map((region) => [
    region.id,
    {
      position: [region.hotspot.position[0] * 0.6 + 0.15, region.hotspot.position[1], 2.2],
      target: region.hotspot.position,
      zoom: region.id === "thorax" || region.id === "low-back" ? 1.55 : 1.85,
    },
  ]),
);

export function getRegionTargets(regionId) {
  return anatomyTargets.filter((target) => target.regionId === regionId);
}

export function toggleTargetSelection(selectedIds, targetId) {
  return selectedIds.includes(targetId)
    ? selectedIds.filter((id) => id !== targetId)
    : [...selectedIds, targetId];
}

export function getRecommendations({ regionId, targetIds = [], redFlagIds = [] }) {
  if (redFlagIds.length > 0) {
    return { status: "blocked", movementIds: [] };
  }

  const region = bodyRegions.find((item) => item.id === regionId);
  if (!region) return { status: "idle", movementIds: [] };

  const scores = new Map(region.movementIds.map((id, index) => [id, 100 - index]));
  for (const targetId of targetIds) {
    const target = anatomyTargets.find((item) => item.id === targetId);
    for (const id of target?.movementIds ?? []) {
      scores.set(id, (scores.get(id) ?? 0) + 1000);
    }
  }

  const ranked = [...scores]
    .filter(([id]) => movementIds.has(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 3);

  return { status: "ready", movementIds: ranked };
}

const validRegionIds = new Set(bodyRegions.map((region) => region.id));
const validTargetIds = new Set(anatomyTargets.map((target) => target.id));
const validSymptomIds = new Set(symptoms.map((symptom) => symptom.id));
const validRedFlagIds = new Set(redFlags.map((flag) => flag.id));

export function serializeExplorerState(state) {
  const params = new URLSearchParams();
  if (state.view === "library") params.set("view", "library");
  if (state.movementId && movementIds.has(state.movementId)) params.set("movement", state.movementId);
  if (validRegionIds.has(state.regionId)) params.set("region", state.regionId);
  const targets = (state.targetIds ?? []).filter((id) => validTargetIds.has(id));
  if (targets.length) params.set("targets", targets.join(","));
  const symptomIds = (state.symptomIds ?? []).filter((id) => validSymptomIds.has(id));
  if (symptomIds.length) params.set("symptoms", symptomIds.join(","));
  const redFlagIds = (state.redFlagIds ?? []).filter((id) => validRedFlagIds.has(id));
  if (redFlagIds.length) params.set("risks", redFlagIds.join(","));
  return `?${params.toString()}`;
}

export function parseExplorerState(search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const regionId = validRegionIds.has(params.get("region")) ? params.get("region") : undefined;
  const result = {
    view: params.get("view") === "library" ? "library" : "home",
  };
  const movementId = params.get("movement");
  if (movementIds.has(movementId)) result.movementId = movementId;
  if (regionId) result.regionId = regionId;
  const targetIds = (params.get("targets") ?? "").split(",").filter((id) => validTargetIds.has(id));
  if (targetIds.length) result.targetIds = targetIds;
  const symptomIds = (params.get("symptoms") ?? "").split(",").filter((id) => validSymptomIds.has(id));
  if (symptomIds.length) result.symptomIds = symptomIds;
  const redFlagIds = (params.get("risks") ?? "").split(",").filter((id) => validRedFlagIds.has(id));
  if (redFlagIds.length) result.redFlagIds = redFlagIds;
  return result;
}
