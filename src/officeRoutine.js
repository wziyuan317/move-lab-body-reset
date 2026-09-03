import officeContent from "./data/officeContent.generated.json" with { type: "json" };

const programsById = new Map(officeContent.programs.map((program) => [program.id, program]));
const actionsById = new Map(officeContent.actions.map((action) => [action.id, action]));

export const officePrograms = officeContent.programs;

export function getOfficeProgram(programId) {
  return programsById.get(programId);
}

export function getOfficeAction(actionId) {
  return actionsById.get(actionId);
}

function totalDurationMs(program) {
  return program.totalSeconds * 1_000;
}

function elapsedAt(state, program, nowMs) {
  const runningMs = state.status === "playing" ? Math.max(0, nowMs - state.startedAtMs) : 0;
  return Math.min(totalDurationMs(program), state.elapsedBeforePlayMs + runningMs);
}

function itemIndexAt(program, elapsedMs) {
  let boundaryMs = 0;
  for (let index = 0; index < program.items.length; index += 1) {
    boundaryMs += program.items[index].seconds * 1_000;
    if (elapsedMs < boundaryMs) return index;
  }
  return Math.max(0, program.items.length - 1);
}

function itemStartMs(program, itemIndex) {
  return program.items.slice(0, itemIndex).reduce((sum, item) => sum + item.seconds * 1_000, 0);
}

export function createRoutineState(program, nowMs = Date.now()) {
  if (!program?.items?.length) throw new Error("课程必须至少包含一个动作");
  return {
    status: "playing",
    itemIndex: 0,
    elapsedBeforePlayMs: 0,
    startedAtMs: nowMs,
  };
}

export function advanceRoutineState(state, program, nowMs = Date.now()) {
  if (state.status === "completed") return state;
  const elapsedMs = elapsedAt(state, program, nowMs);
  if (elapsedMs >= totalDurationMs(program)) {
    return {
      status: "completed",
      itemIndex: Math.max(0, program.items.length - 1),
      elapsedBeforePlayMs: totalDurationMs(program),
      startedAtMs: null,
    };
  }
  return { ...state, itemIndex: itemIndexAt(program, elapsedMs) };
}

export function pauseRoutine(state, program, nowMs = Date.now()) {
  if (state.status !== "playing") return state;
  const advanced = advanceRoutineState(state, program, nowMs);
  if (advanced.status === "completed") return advanced;
  const elapsedBeforePlayMs = elapsedAt(advanced, program, nowMs);
  return {
    ...advanced,
    status: "paused",
    elapsedBeforePlayMs,
    startedAtMs: null,
  };
}

export function resumeRoutine(state, program, nowMs = Date.now()) {
  if (state.status !== "paused") return state;
  if (state.elapsedBeforePlayMs >= totalDurationMs(program)) return { ...state, status: "completed" };
  return { ...state, status: "playing", startedAtMs: nowMs };
}

export function moveRoutine(state, program, direction, nowMs = Date.now()) {
  const current = advanceRoutineState(state, program, nowMs);
  const targetIndex = Math.min(program.items.length - 1, Math.max(0, current.itemIndex + Math.sign(direction)));
  const elapsedBeforePlayMs = itemStartMs(program, targetIndex);
  const status = state.status === "paused" ? "paused" : "playing";
  return {
    status,
    itemIndex: targetIndex,
    elapsedBeforePlayMs,
    startedAtMs: status === "playing" ? nowMs : null,
  };
}

export function resetRoutine(program, nowMs = Date.now()) {
  return createRoutineState(program, nowMs);
}

export function getRoutineProgress(state, program, nowMs = Date.now()) {
  const elapsedMs = elapsedAt(state, program, nowMs);
  const itemIndex = itemIndexAt(program, elapsedMs);
  const actionEndMs = itemStartMs(program, itemIndex) + program.items[itemIndex].seconds * 1_000;
  const totalMs = totalDurationMs(program);
  const completedMs = Math.min(totalMs, elapsedMs);
  return {
    itemIndex,
    actionRemaining: Math.max(0, Math.ceil((actionEndMs - completedMs) / 1_000)),
    totalRemaining: Math.max(0, Math.ceil((totalMs - completedMs) / 1_000)),
    completedSeconds: Math.floor(completedMs / 1_000),
    percent: totalMs === 0 ? 100 : Math.min(100, completedMs / totalMs * 100),
  };
}
