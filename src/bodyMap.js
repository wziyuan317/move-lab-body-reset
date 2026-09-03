import { movements } from "./movements.js";
import { getStretchingIdsForRegion, getStretchingIdsForTarget } from "./stretchingAdapters.js";

const movementIds = new Set(movements.map((movement) => movement.id));
const cautionSymptomIds = new Set(["weakness", "swelling", "tingling"]);

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

const baseBodyRegions = [
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
    id: "thigh",
    label: "大腿",
    shortLabel: "腿",
    prompt: "大腿前侧、后侧或发力时不舒服",
    hotspot: { position: [0.18, -0.41, 0.08], side: "front", screenOffset: [-18, -3], mobileOffset: [-30, -8] },
    movementIds: ["seated-knee-extension", "supported-half-squat", "supported-hinge"],
  },
  {
    id: "knee",
    label: "膝盖",
    shortLabel: "膝",
    prompt: "膝前、内外侧或膝后不舒服",
    hotspot: { position: [0.13, -0.56, 0.08], side: "front", screenOffset: [18, 3], mobileOffset: [30, 8] },
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

const baseAnatomyTargets = [
  { id: "upper-trapezius", regionId: "neck", label: "上斜方肌", kind: "muscle", color: "#ff5c4d", meshNames: ["Descending Part Of Trapezius Muscle"], movementIds: ["neck-sidebend", "scapular-squeeze"] },
  { id: "levator-scapulae", regionId: "neck", label: "肩胛提肌", kind: "muscle", color: "#ff9f1c", meshNames: ["Levator Scapulae"], movementIds: ["levator-stretch", "scapular-squeeze"] },
  { id: "posterior-neck", regionId: "neck", label: "颈后肌群", kind: "muscle", color: "#ffd43b", meshNames: ["Splenius Capitis Muscle", "Splenius Colli Muscle"], movementIds: ["neck-sidebend", "levator-stretch"] },

  { id: "deltoid", regionId: "shoulder", label: "三角肌", kind: "muscle", color: "#f72585", meshNames: ["Acromial Part Of Deltoid Muscle", "Clavicular Part Of Deltoid Muscle", "Scapular Spinal Part Of Deltoid Muscle"], movementIds: ["wall-pushup", "chest-opener"] },
  { id: "infraspinatus", regionId: "shoulder", label: "冈下肌", kind: "muscle", color: "#b5179e", meshNames: ["Infraspinatus Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "middle-lower-trapezius", regionId: "shoulder", label: "中下斜方肌", kind: "muscle", color: "#7209b7", meshNames: ["Transverse Part Of Trapezius Muscle", "Ascending Part Of Trapezius Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "rhomboids", regionId: "shoulder", label: "菱形肌", kind: "muscle", color: "#4361ee", meshNames: ["Rhomboid Major Muscle", "Rhomboid Minor Muscle"], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "serratus-anterior", regionId: "shoulder", label: "前锯肌", kind: "muscle", color: "#4cc9f0", meshNames: ["Serratus Anterior Muscle"], movementIds: ["wall-pushup", "scapular-squeeze"] },
  { id: "shoulder-front", regionId: "shoulder", label: "肩膀前侧", kind: "joint", color: "#ffb4a2", meshNames: [], movementIds: ["chest-opener", "wall-pushup"] },
  { id: "shoulder-lateral", regionId: "shoulder", label: "肩膀外侧", kind: "joint", color: "#ffadad", meshNames: [], movementIds: ["wall-pushup", "scapular-squeeze"] },
  { id: "shoulder-posterior", regionId: "shoulder", label: "肩膀后侧", kind: "joint", color: "#ffc6a5", meshNames: [], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "scapula-medial", regionId: "shoulder", label: "肩胛骨内侧", kind: "joint", color: "#ffd6a5", meshNames: [], movementIds: ["scapular-squeeze", "chest-opener"] },
  { id: "scapula-inferior", regionId: "shoulder", label: "肩胛骨下方", kind: "joint", color: "#fdffb6", meshNames: [], movementIds: ["scapular-squeeze", "wall-pushup"] },
  { id: "shoulder-joint-unsure", regionId: "shoulder", label: "不确定具体位置", kind: "joint", color: "#d0d7de", meshNames: [], movementIds: ["scapular-squeeze", "wall-pushup", "chest-opener"] },

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

  { id: "quadriceps-area", regionId: "thigh", label: "大腿前侧 / 股四头肌", kind: "muscle", color: "#74c69d", meshNames: ["Rectus Femoris Muscle", "Vastus Lateralis Muscle", "Vastus Medialis Muscle", "Vastus Intermedius Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "hamstring-area", regionId: "thigh", label: "大腿后侧 / 腘绳肌", kind: "muscle", color: "#9c6644", meshNames: ["Semitendinosus Muscle", "Semimembranosus Muscle", "Long Head Of Biceps Femoris"], movementIds: ["supported-hinge", "supported-half-squat"] },

  { id: "rectus-femoris", regionId: "knee", label: "股直肌远端", kind: "muscle", color: "#51cf66", meshNames: ["Rectus Femoris Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "vastus-medialis", regionId: "knee", label: "股内侧肌", kind: "muscle", color: "#20c997", meshNames: ["Vastus Medialis Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "vastus-lateralis", regionId: "knee", label: "股外侧肌", kind: "muscle", color: "#15aabf", meshNames: ["Vastus Lateralis Muscle"], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-hamstrings", regionId: "knee", label: "膝后肌群", kind: "muscle", color: "#228be6", meshNames: ["Semitendinosus Muscle", "Semimembranosus Muscle", "Long Head Of Biceps Femoris"], movementIds: ["supported-hinge", "supported-half-squat"] },
  { id: "knee-front", regionId: "knee", label: "膝前区 / 髌骨周围", kind: "joint", color: "#74c0fc", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-medial", regionId: "knee", label: "膝内侧区", kind: "joint", color: "#63e6be", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat"] },
  { id: "knee-lateral", regionId: "knee", label: "膝外侧区", kind: "joint", color: "#a9e34b", meshNames: [], movementIds: ["supported-half-squat", "supported-calf-raise"] },
  { id: "knee-posterior", regionId: "knee", label: "膝后区", kind: "joint", color: "#ffe066", meshNames: [], movementIds: ["supported-hinge", "supported-half-squat"] },
  { id: "upper-calf-area", regionId: "knee", label: "小腿上端", kind: "joint", color: "#bde0fe", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "knee-joint-unsure", regionId: "knee", label: "关节附近 / 无法确定具体肌肉", kind: "joint", color: "#adb5bd", meshNames: [], movementIds: ["seated-knee-extension", "supported-half-squat", "supported-calf-raise"] },

  { id: "gastrocnemius", regionId: "ankle", label: "腓肠肌", kind: "muscle", color: "#3b5bdb", meshNames: ["Lateral Head Of Gastrocnemius", "Medial Head Of Gastrocnemius"], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "soleus", regionId: "ankle", label: "比目鱼肌", kind: "muscle", color: "#7048e8", meshNames: ["Soleus Muscle"], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "tibialis-anterior", regionId: "ankle", label: "胫骨前肌", kind: "muscle", color: "#ae3ec9", meshNames: ["Tibialis Anterior Muscle"], movementIds: ["supported-calf-raise", "side-bend"] },
  { id: "ankle-front", regionId: "ankle", label: "踝关节前方", kind: "joint", color: "#caf0f8", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "ankle-medial", regionId: "ankle", label: "内踝", kind: "joint", color: "#ade8f4", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "ankle-lateral", regionId: "ankle", label: "外踝", kind: "joint", color: "#90e0ef", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "achilles-area", regionId: "ankle", label: "跟腱附近", kind: "joint", color: "#a8dadc", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "calf-posterior", regionId: "ankle", label: "小腿后侧", kind: "joint", color: "#b7e4c7", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
  { id: "ankle-joint-unsure", regionId: "ankle", label: "不确定具体位置", kind: "joint", color: "#868e96", meshNames: [], movementIds: ["supported-calf-raise", "supported-hinge"] },
];

export const bodyRegions = baseBodyRegions.map((region) => ({
  ...region,
  movementIds: [...new Set([...region.movementIds, ...getStretchingIdsForRegion(region.id)])],
}));

export const anatomyTargets = baseAnatomyTargets.map((target) => ({
  ...target,
  movementIds: [...new Set([...target.movementIds, ...getStretchingIdsForTarget(target.id)])],
}));

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

export function getExplorerStep({ regionId, symptomIds = [] }) {
  if (!regionId) return 1;
  if (!symptomIds.length) return 2;
  return 3;
}

export function selectRegionState(state, regionId) {
  if (state.regionId === regionId) return state;
  return {
    ...state,
    regionId,
    targetIds: [],
    targetSides: {},
    symptomIds: [],
    redFlagIds: [],
  };
}

export function getModelRegionSelectionChange(regionId) {
  const region = bodyRegions.find((item) => item.id === regionId);
  return {
    regionId,
    viewSide: region?.hotspot.side ?? "front",
  };
}

export function getExplorerResetChange() {
  return {
    regionId: undefined,
    targetIds: [],
    targetSides: {},
    symptomIds: [],
    redFlagIds: [],
    viewSide: "front",
  };
}

export function applyExplorerStateChange(currentState, nextState) {
  const regionState = selectRegionState(currentState, nextState.regionId);
  const next = currentState.regionId === nextState.regionId
    ? nextState
    : {
        ...nextState,
        targetIds: regionState.targetIds,
        targetSides: regionState.targetSides,
        symptomIds: regionState.symptomIds,
        redFlagIds: regionState.redFlagIds,
      };
  return { ...next, step: getExplorerStep(next) };
}

export function getRecommendations({ regionId, targetIds = [], symptomIds = [], redFlagIds = [] }) {
  if (redFlagIds.length > 0) {
    return { status: "blocked", movementIds: [], guidanceKey: "blocked" };
  }

  const region = bodyRegions.find((item) => item.id === regionId);
  if (!region) return { status: "idle", movementIds: [], guidanceKey: "idle" };
  if (!symptomIds.length) return { status: "incomplete", movementIds: [], guidanceKey: "incomplete" };

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

  const status = symptomIds.some((id) => cautionSymptomIds.has(id)) ? "caution" : "ready";
  const guidanceKey = status === "ready"
    ? "gentle-mobility"
    : symptomIds.some((id) => id === "weakness" || id === "tingling")
      ? "caution-neuro"
      : "caution-swelling";
  return { status, movementIds: ranked, guidanceKey };
}

export function canOpenTutorials({ status }) {
  return status === "ready" || status === "caution";
}

export function getRecommendationNavigationIds({ status, movementIds = [] }) {
  return canOpenTutorials({ status }) ? movementIds : [];
}

const validRegionIds = new Set(bodyRegions.map((region) => region.id));
const validTargetIds = new Set(anatomyTargets.map((target) => target.id));
const validSymptomIds = new Set(symptoms.map((symptom) => symptom.id));
const validRedFlagIds = new Set(redFlags.map((flag) => flag.id));
const validTargetSides = new Set(["left", "right"]);
const validExplorerSteps = new Set([1, 2, 3]);
const validOfficeProgramIds = new Set([
  "program.office.micro_5",
  "program.office.reset_10",
  "program.office.deep_15",
]);

export function serializeExplorerState(state) {
  const params = new URLSearchParams();
  if (state.view === "library") params.set("view", "library");
  if (state.view === "office") params.set("view", "office");
  if (state.view === "office" && validOfficeProgramIds.has(state.programId)) params.set("program", state.programId);
  if (state.movementId && movementIds.has(state.movementId)) params.set("movement", state.movementId);
  if (validRegionIds.has(state.regionId)) params.set("region", state.regionId);
  const targets = (state.targetIds ?? []).filter((id) => validTargetIds.has(id));
  if (targets.length) params.set("targets", targets.join(","));
  for (const targetId of targets) {
    const sideValue = state.targetSides?.[targetId];
    const sides = Array.isArray(sideValue) ? sideValue : [sideValue];
    for (const side of sides) {
      if (validTargetSides.has(side)) params.append("side", `${targetId}:${side}`);
    }
  }
  const symptomIds = (state.symptomIds ?? []).filter((id) => validSymptomIds.has(id));
  if (symptomIds.length) params.set("symptoms", symptomIds.join(","));
  const redFlagIds = (state.redFlagIds ?? []).filter((id) => validRedFlagIds.has(id));
  if (redFlagIds.length) params.set("risks", redFlagIds.join(","));
  if (state.viewSide === "front" || state.viewSide === "back") params.set("viewSide", state.viewSide);
  if (validExplorerSteps.has(state.step)) params.set("step", state.step);
  return `?${params.toString()}`;
}

export function parseExplorerState(search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const regionId = validRegionIds.has(params.get("region")) ? params.get("region") : undefined;
  const requestedView = params.get("view");
  const result = {
    view: requestedView === "library" || requestedView === "office" ? requestedView : "home",
  };
  const programId = params.get("program");
  if (result.view === "office" && validOfficeProgramIds.has(programId)) result.programId = programId;
  const movementId = params.get("movement");
  if (movementIds.has(movementId)) result.movementId = movementId;
  if (regionId) result.regionId = regionId;
  const targetIds = (params.get("targets") ?? "").split(",").filter((id) => validTargetIds.has(id));
  if (targetIds.length) result.targetIds = targetIds;
  const targetSides = {};
  for (const pair of params.getAll("side")) {
    const [targetId, side] = pair.split(":");
    if (!targetIds.includes(targetId) || !validTargetSides.has(side)) continue;
    const previous = targetSides[targetId];
    if (!previous) {
      targetSides[targetId] = side;
    } else if (previous !== side) {
      targetSides[targetId] = Array.isArray(previous)
        ? [...new Set([...previous, side])]
        : [previous, side];
    }
  }
  if (Object.keys(targetSides).length) result.targetSides = targetSides;
  const symptomIds = (params.get("symptoms") ?? "").split(",").filter((id) => validSymptomIds.has(id));
  if (symptomIds.length) result.symptomIds = symptomIds;
  const redFlagIds = (params.get("risks") ?? "").split(",").filter((id) => validRedFlagIds.has(id));
  if (redFlagIds.length) result.redFlagIds = redFlagIds;
  const viewSide = params.get("viewSide");
  if (viewSide === "front" || viewSide === "back") result.viewSide = viewSide;
  const step = Number(params.get("step"));
  if (validExplorerSteps.has(step)) result.step = step;
  return result;
}
