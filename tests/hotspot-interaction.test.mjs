import assert from "node:assert/strict";
import test from "node:test";

const moduleUnderTest = await import("../src/hotspotInteraction.js").catch(() => ({}));
const { createHotspotHandlers = () => ({}) } = moduleUnderTest;

function eventFor(key, overrides = {}) {
  const calls = { preventDefault: 0, stopPropagation: 0 };
  return {
    event: {
      key,
      repeat: false,
      preventDefault: () => { calls.preventDefault += 1; },
      stopPropagation: () => { calls.stopPropagation += 1; },
      ...overrides,
    },
    calls,
  };
}

for (const activation of ["pointer", "Enter", "Space"]) {
  test(`热点 ${activation} 激活只派发一次区域选择`, () => {
    const selections = [];
    const handlers = createHotspotHandlers((regionId) => selections.push(regionId), "knee");
    const { event, calls } = eventFor(activation === "Space" ? " " : activation);

    if (activation === "pointer") handlers.onClick?.(event);
    else handlers.onKeyDown?.(event);

    assert.deepEqual(selections, ["knee"]);
    assert.equal(calls.stopPropagation, 1);
    assert.equal(calls.preventDefault, activation === "pointer" ? 0 : 1);
  });
}

test("热点忽略键盘 repeat 与无关按键", () => {
  const selections = [];
  const handlers = createHotspotHandlers((regionId) => selections.push(regionId), "knee");
  handlers.onKeyDown?.(eventFor("Enter", { repeat: true }).event);
  handlers.onKeyDown?.(eventFor("ArrowDown").event);
  assert.deepEqual(selections, []);
});
