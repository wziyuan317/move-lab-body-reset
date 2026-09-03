import { getMovementFrames } from "./movements.js";

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function section(id, label, value, tone = "default") {
  return { id, label, value, tone };
}

export function buildMovementDetailModel(movement, allMovements) {
  const movementById = new Map(allMovements.map((item) => [item.id, item]));
  const relatedMovements = (movement.recommendations ?? [])
    .map((recommendation) => ({
      movement: movementById.get(recommendation.动作ID),
      reason: recommendation.推荐依据,
    }))
    .filter((item) => item.movement);

  const sections = movement.collection === "system"
    ? [
        section("start-position", "起始姿势", movement.startPosition),
        section("steps", "动作步骤", movement.steps),
        section("breathing", "呼吸", movement.breathing),
        section("intensity", "强度", movement.intensity),
        section("duration", "时长与次数", movement.duration),
        section("key-points", "动作要点", movement.keyPoints),
        section("common-mistakes", "常见错误", movement.commonMistakes, "caution"),
        section("simplified-version", "简化版本", movement.simplifiedVersion),
        section("stop-conditions", "停止条件", movement.stopConditions, "danger"),
        section("contraindications", "不适用人群", movement.contraindications, "danger"),
        section("risk-warnings", "风险提示", movement.riskWarnings, "caution"),
      ]
    : [];

  return {
    id: movement.id,
    collection: movement.collection,
    collectionLabel: movement.collectionLabel,
    title: movement.title,
    frames: getMovementFrames(movement),
    bodyAreas: movement.bodyAreas ?? [movement.category].filter(Boolean),
    primaryMuscles: movement.primaryMuscles ?? movement.muscles ?? [],
    secondaryMuscles: movement.secondaryMuscles ?? [],
    sections,
    sources: movement.sources ?? {
      pdfPages: [],
      bookPages: [],
      pageIds: [],
      pageReferences: [],
    },
    relatedMovements,
    reviewStatus: movement.reviewStatus ?? [],
    informationBasis: movement.informationBasis,
    office: movement.collection === "office"
      ? {
          principle: movement.principle,
          benefits: movement.benefits,
          cue: movement.cue,
          stop: movement.stop,
        }
      : undefined,
  };
}

export function getLibraryFilterOptions(items) {
  return {
    collections: [
      { id: "all", label: "全部动作", count: items.length },
      {
        id: "office",
        label: "办公室改善",
        count: items.filter((item) => item.collection === "office").length,
      },
      {
        id: "system",
        label: "系统拉伸库",
        count: items.filter((item) => item.collection === "system").length,
      },
    ],
    categories: uniqueSorted(items.map((item) => item.category)),
    difficulties: uniqueSorted(items.map((item) => item.difficulty)),
    movementTypes: uniqueSorted(items.map((item) => item.actionType)),
  };
}

