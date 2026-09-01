import Body from "react-muscle-highlighter";
import { Check } from "@phosphor-icons/react";
import { bodyRegions, getRegionTargets } from "../bodyMap.js";
import { getBodyRegionVisualData } from "../bodyRegionMap.js";

const regionCardColors = [
  "#ff5f69",
  "#ffc43d",
  "#3e7cff",
  "#2dcc78",
  "#8457dc",
  "#ff8a32",
  "#ff5964",
  "#23b8c7",
];

function RegionPreview({ region }) {
  const selectedIds = getRegionTargets(region.id).map((target) => target.id);
  const data = getBodyRegionVisualData({ regionId: region.id, selectedIds })
    .filter((part) => part.selected)
    .map(({ slug }) => ({ slug, color: "#fff4d6" }));

  return (
    <span className="region-rail__preview" aria-hidden="true">
      <Body
        data={data}
        side={region.hotspot.side}
        gender="male"
        defaultFill="rgba(255,255,255,.28)"
        defaultStroke="rgba(255,255,255,.86)"
        defaultStrokeWidth={1.4}
      />
    </span>
  );
}

export function RegionRail({ regionId, onSelectRegion }) {
  return (
    <section className="region-rail" aria-label="选择身体区域">
      {bodyRegions.map((region, index) => (
        <button
          key={region.id}
          type="button"
          className={regionId === region.id ? "is-active" : ""}
          aria-pressed={regionId === region.id}
          onClick={() => onSelectRegion(region.id)}
          style={{ "--region-card-color": regionCardColors[index] }}
        >
          <RegionPreview region={region} />
          <span className="region-rail__copy">
            <strong>{region.label}</strong>
            <small>{region.prompt.replace("不舒服", "")}</small>
          </span>
          {regionId === region.id && <span className="region-rail__check" aria-hidden="true"><Check size={15} weight="bold" /></span>}
        </button>
      ))}
    </section>
  );
}
