import { getTargetIdsForBodySlug } from "./bodyRegionMap.js";

const sidedRegions = new Set(["shoulder", "hip", "thigh", "knee", "ankle"]);
const fullBodyFocus = Object.freeze({ scale: 1, originX: 50, originY: 50 });
const anatomySexes = new Set(["male", "female"]);
const anatomyViews = new Set(["front", "side", "back"]);

export const ANATOMY_DEFAULTS = Object.freeze({ sex: "male", view: "front", zoom: 1 });
export const ANATOMY_ZOOM_MIN = 0.8;
export const ANATOMY_ZOOM_MAX = 2;
export const ANATOMY_ZOOM_STEP = 0.2;

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

function clampZoom(value) {
  const numericValue = Number.isFinite(value) ? value : ANATOMY_DEFAULTS.zoom;
  return Math.min(ANATOMY_ZOOM_MAX, Math.max(ANATOMY_ZOOM_MIN, numericValue));
}

export function normalizeAnatomyPreference(value = {}) {
  return {
    sex: anatomySexes.has(value.sex) ? value.sex : ANATOMY_DEFAULTS.sex,
    view: anatomyViews.has(value.view) ? value.view : ANATOMY_DEFAULTS.view,
    zoom: Math.round(clampZoom(value.zoom) * 10) / 10,
  };
}

export function getNextAnatomyZoom(current, direction) {
  if (direction === "reset") return ANATOMY_DEFAULTS.zoom;
  const offset = direction === "in" ? ANATOMY_ZOOM_STEP : direction === "out" ? -ANATOMY_ZOOM_STEP : 0;
  return Math.round(clampZoom(current + offset) * 10) / 10;
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
