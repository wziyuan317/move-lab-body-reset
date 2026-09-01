export function getMissionDisplayStep({ explorerStep, requestedStep }) {
  return explorerStep === 3 && requestedStep === 2 ? 2 : explorerStep;
}

export function getStepFocusSelector(step) {
  if (step === 1) return ".region-rail button";
  if (step === 2) return ".choice-grid button:not(:disabled)";
  return "#recommendation-panel";
}
