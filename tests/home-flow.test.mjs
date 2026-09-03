import assert from "node:assert/strict";
import test from "node:test";

const moduleUnderTest = await import("../src/homeFlow.js").catch(() => ({}));
const {
  getMissionDisplayStep = () => undefined,
  getStepFocusSelector = () => undefined,
  getTaskSummary = () => undefined,
} = moduleUnderTest;

test("完成建议后返回描述感受会显示编辑区并聚焦第一个可用选项", () => {
  assert.equal(getMissionDisplayStep({ explorerStep: 3, requestedStep: 2 }), 2);
  assert.equal(getStepFocusSelector(2), ".choice-grid button:not(:disabled)");
});

test("未进入编辑时任务栏继续显示真实流程步骤", () => {
  assert.equal(getMissionDisplayStep({ explorerStep: 3, requestedStep: 3 }), 3);
  assert.equal(getMissionDisplayStep({ explorerStep: 2, requestedStep: 1 }), 2);
});

test("左侧任务摘要只显示已选状态，不复制输入控件", () => {
  assert.deepEqual(getTaskSummary({
    regionLabel: "膝盖",
    targetLabels: ["膝盖内侧", "股内侧肌"],
    symptomLabels: ["酸紧 / 发僵"],
    resultStatus: "ready",
  }), {
    location: "膝盖 · 2 个具体位置",
    feeling: "酸紧 / 发僵",
    recommendation: "建议已生成",
  });
});

test("未完成感受时任务摘要给出真实下一步", () => {
  assert.deepEqual(getTaskSummary({
    regionLabel: "颈部",
    targetLabels: [],
    symptomLabels: [],
    resultStatus: "incomplete",
  }), {
    location: "颈部 · 大区域",
    feeling: "等待描述感受",
    recommendation: "选择感受后解锁",
  });
});
