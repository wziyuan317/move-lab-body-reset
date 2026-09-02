import { WarningCircle } from "@phosphor-icons/react";
import { redFlags, symptoms } from "../bodyMap.js";
import { BodyLocationSelector } from "./BodyExplorer.jsx";
import { RecommendationPanel } from "./RecommendationPanel.jsx";

function toggle(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function LocationTaskPanel({
  region,
  value,
  explorerStep,
  locationExpanded,
  result,
  onUpdate,
  onToggleTarget,
  onOpenTutorial,
  onEditLocation,
}) {
  return (
    <div className="location-task-panel">
      <BodyLocationSelector
        regionId={value.regionId}
        selectedIds={value.targetIds}
        selectedSides={value.targetSides}
        viewSide={value.viewSide}
        step={explorerStep === 3 && !locationExpanded ? 3 : 2}
        onToggleTarget={onToggleTarget}
        onChangeViewSide={(viewSide) => onUpdate({ viewSide })}
        onEditLocation={onEditLocation}
      />

      {region && (
        <section className="location-task-panel__section" aria-labelledby="location-feeling-title">
          <div className="assessment-group__title">
            <strong id="location-feeling-title">现在是什么感觉？</strong><small>可多选</small>
          </div>
          <div className="choice-grid">
            {symptoms.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                className={value.symptomIds.includes(symptom.id) ? "is-active" : ""}
                aria-pressed={value.symptomIds.includes(symptom.id)}
                onClick={() => onUpdate({ symptomIds: toggle(value.symptomIds, symptom.id) })}
              >
                {symptom.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {region && (
        <fieldset className="safety-check location-task-panel__safety">
          <legend><WarningCircle size={20} weight="fill" />先确认这些情况</legend>
          {redFlags.map((flag) => (
            <label key={flag.id}>
              <input
                type="checkbox"
                checked={value.redFlagIds.includes(flag.id)}
                onChange={() => onUpdate({ redFlagIds: toggle(value.redFlagIds, flag.id) })}
              />
              <span>{flag.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      <RecommendationPanel
        region={region}
        selectedIds={value.targetIds}
        symptomIds={value.symptomIds}
        result={result}
        onOpenTutorial={onOpenTutorial}
      />
    </div>
  );
}
