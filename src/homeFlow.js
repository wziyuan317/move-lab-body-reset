export function getMissionDisplayStep({ explorerStep, requestedStep }) {
  return explorerStep === 3 && requestedStep === 2 ? 2 : explorerStep;
}

export function getStepFocusSelector(step) {
  if (step === 1) return ".region-rail button";
  if (step === 2) return ".choice-grid button:not(:disabled)";
  return "#recommendation-panel";
}

export function getTaskSummary({ regionLabel, targetLabels = [], symptomLabels = [], resultStatus }) {
  const location = regionLabel
    ? `${regionLabel} · ${targetLabels.length > 0 ? `${targetLabels.length} 个具体位置` : "大区域"}`
    : "等待选择位置";
  const feeling = symptomLabels.length > 0 ? symptomLabels.join("、") : "等待描述感受";
  const recommendation = resultStatus === "blocked"
    ? "建议先做专业评估"
    : resultStatus === "ready" || resultStatus === "caution"
      ? "建议已生成"
      : "选择感受后解锁";
  return { location, feeling, recommendation };
}
