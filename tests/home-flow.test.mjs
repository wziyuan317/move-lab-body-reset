import assert from "node:assert/strict";
import test from "node:test";

const moduleUnderTest = await import("../src/homeFlow.js").catch(() => ({}));
const {
  getMissionDisplayStep = () => undefined,
  getStepFocusSelector = () => undefined,
} = moduleUnderTest;

test("完成建议后返回描述感受会显示编辑区并聚焦第一个可用选项", () => {
  assert.equal(getMissionDisplayStep({ explorerStep: 3, requestedStep: 2 }), 2);
  assert.equal(getStepFocusSelector(2), ".choice-grid button:not(:disabled)");
});

test("未进入编辑时任务栏继续显示真实流程步骤", () => {
  assert.equal(getMissionDisplayStep({ explorerStep: 3, requestedStep: 3 }), 3);
  assert.equal(getMissionDisplayStep({ explorerStep: 2, requestedStep: 1 }), 2);
});
