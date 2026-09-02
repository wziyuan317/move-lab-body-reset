import {
  Check,
  PersonArmsSpread,
  PersonSimple,
  PersonSimpleRun,
  PersonSimpleTaiChi,
  PersonSimpleThrow,
  PersonSimpleWalk,
  SneakerMove,
} from "@phosphor-icons/react";
import { bodyRegions } from "../bodyMap.js";

const regionCardColors = {
  neck: "#ff5f69",
  shoulder: "#ffc43d",
  thorax: "#3e7cff",
  "low-back": "#2dcc78",
  hip: "#8457dc",
  thigh: "#ff8a32",
  knee: "#ff5964",
  ankle: "#23b8c7",
};

const regionIcons = {
  neck: PersonSimple,
  shoulder: PersonSimpleThrow,
  thorax: PersonArmsSpread,
  "low-back": PersonSimpleTaiChi,
  hip: PersonSimpleRun,
  thigh: PersonSimpleWalk,
  knee: PersonSimpleRun,
  ankle: SneakerMove,
};

export function RegionRail({ regionId, onSelectRegion }) {
  return (
    <section className="region-rail" aria-label="选择身体区域">
      {bodyRegions.map((region) => {
        const Icon = regionIcons[region.id];
        return (
          <button
            key={region.id}
            type="button"
            className={regionId === region.id ? "is-active" : ""}
            aria-pressed={regionId === region.id}
            onClick={() => onSelectRegion(region.id)}
            style={{ "--region-card-color": regionCardColors[region.id] }}
          >
            <span className="region-rail__icon" aria-hidden="true"><Icon size={42} weight="duotone" /></span>
            <span className="region-rail__copy">
              <strong>{region.label}</strong>
              <small>{region.prompt.replace("不舒服", "")}</small>
            </span>
            {regionId === region.id && <span className="region-rail__check" aria-hidden="true"><Check size={15} weight="bold" /></span>}
          </button>
        );
      })}
    </section>
  );
}
