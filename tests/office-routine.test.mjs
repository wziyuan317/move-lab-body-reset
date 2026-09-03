import assert from "node:assert/strict";
import test from "node:test";

const routine = await import("../src/officeRoutine.js").catch(() => ({}));
const {
  advanceRoutineState = () => undefined,
  createRoutineState = () => undefined,
  getOfficeAction = () => undefined,
  getOfficeProgram = () => undefined,
  getRoutineProgress = () => undefined,
  moveRoutine = () => undefined,
  pauseRoutine = () => undefined,
  resetRoutine = () => undefined,
  resumeRoutine = () => undefined,
} = routine;

const program = {
  totalSeconds: 100,
  items: [
    { actionId: "a", seconds: 40 },
    { actionId: "b", seconds: 60 },
  ],
};

test("后台经过 45 秒后直接进入第二动作并保留 55 秒", () => {
  const initial = createRoutineState(program, 1_000);
  const next = advanceRoutineState(initial, program, 46_000);
  const progress = getRoutineProgress(next, program, 46_000);

  assert.equal(next.itemIndex, 1);
  assert.equal(progress.actionRemaining, 55);
  assert.equal(progress.totalRemaining, 55);
});

test("暂停期间时间不减少，继续后从冻结秒数计时", () => {
  const initial = createRoutineState(program, 0);
  const paused = pauseRoutine(initial, program, 10_000);

  assert.equal(getRoutineProgress(paused, program, 80_000).totalRemaining, 90);
  const resumed = resumeRoutine(paused, program, 80_000);
  assert.equal(getRoutineProgress(resumed, program, 85_000).totalRemaining, 85);
});

test("超过课程总时长后停在完成态且剩余为零", () => {
  const initial = createRoutineState(program, 0);
  const completed = advanceRoutineState(initial, program, 120_000);

  assert.equal(completed.status, "completed");
  assert.equal(completed.itemIndex, 1);
  assert.equal(getRoutineProgress(completed, program, 120_000).totalRemaining, 0);
});

test("上下动作和重置都回到精确动作边界", () => {
  const initial = advanceRoutineState(createRoutineState(program, 0), program, 45_000);
  const previous = moveRoutine(initial, program, -1, 45_000);
  const next = moveRoutine(previous, program, 1, 45_000);
  const reset = resetRoutine(program, 90_000);

  assert.equal(previous.itemIndex, 0);
  assert.equal(getRoutineProgress(previous, program, 45_000).totalRemaining, 100);
  assert.equal(next.itemIndex, 1);
  assert.equal(getRoutineProgress(next, program, 45_000).totalRemaining, 60);
  assert.equal(reset.itemIndex, 0);
  assert.equal(getRoutineProgress(reset, program, 90_000).totalRemaining, 100);
});

test("稳定 ID 可读取课程和动作，未知 ID 不回退到其他内容", () => {
  assert.equal(getOfficeProgram("program.office.micro_5")?.totalSeconds, 300);
  assert.equal(getOfficeAction("stretch.neck.neck_extensor")?.name, "坐姿颈后侧伸展");
  assert.equal(getOfficeProgram("unknown"), undefined);
  assert.equal(getOfficeAction("unknown"), undefined);
});
