import { getTargetIdsForBodySlug } from "./bodyRegionMap.js";

const sidedRegions = new Set(["shoulder", "hip", "thigh", "knee", "ankle"]);
const fullBodyFocus = Object.freeze({ scale: 1, originX: 50, originY: 50 });

export const professionalFocusMap = Object.freeze({
  neck: Object.freeze({ scale: 1.65, originX: 50, originY: 18 }),
  shoulder: Object.freeze({ scale: 1.55, originX: 50, originY: 29 }),
  "shoulder-left": Object.freeze({ scale: 1.55, originX: 42, originY: 29 }),
  "shoulder-right": Object.freeze({ scale: 1.55, originX: 58, originY: 29 }),
  thorax: Object.freeze({ scale: 1.4, originX: 50, originY: 38 }),
  "low-back": Object.freeze({ scale: 1.45, originX: 50, originY: 55 }),
  hip: Object.freeze({ scale: 1.5, originX: 50, originY: 65 }),
  "hip-left": Object.freeze({ scale: 1.5, originX: 43, originY: 65 }),
  "hip-right": Object.freeze({ scale: 1.5, originX: 57, originY: 65 }),
  thigh: Object.freeze({ scale: 1.55, originX: 50, originY: 72 }),
  "thigh-left": Object.freeze({ scale: 1.55, originX: 43, originY: 72 }),
  "thigh-right": Object.freeze({ scale: 1.55, originX: 57, originY: 72 }),
  knee: Object.freeze({ scale: 1.8, originX: 50, originY: 81 }),
  "knee-left": Object.freeze({ scale: 1.8, originX: 43, originY: 81 }),
  "knee-right": Object.freeze({ scale: 1.8, originX: 57, originY: 81 }),
  ankle: Object.freeze({ scale: 1.75, originX: 50, originY: 90 }),
  "ankle-left": Object.freeze({ scale: 1.75, originX: 43, originY: 90 }),
  "ankle-right": Object.freeze({ scale: 1.75, originX: 57, originY: 90 }),
});

function focusKeyFor(regionId, side) {
  return sidedRegions.has(regionId) && (side === "left" || side === "right")
    ? `${regionId}-${side}`
    : regionId;
}

export function resolveProfessionalPress({ slug, regionId, side }) {
  const targetIds = getTargetIdsForBodySlug(slug, regionId);
  const focusKey = focusKeyFor(regionId, side);
  if (targetIds.length === 0) return { type: "ignore", targetIds, side, focusKey };
  if (targetIds.length === 1) {
    return { type: "toggle", targetId: targetIds[0], targetIds, side, focusKey };
  }
  return { type: "choose", targetIds, side, focusKey };
}

export function getProfessionalFocus(focusKey) {
  return professionalFocusMap[focusKey] ?? fullBodyFocus;
}
