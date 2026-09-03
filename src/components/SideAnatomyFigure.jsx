import { sideAnatomyHotspots } from "../bodyRegionMap.js";

const sideAssets = {
  male: "assets/body-map/anatomy-side-male.png",
  female: "assets/body-map/anatomy-side-female.png",
};

export function SideAnatomyFigure({ sex, regionId, data = [], onBodyPartPress }) {
  const selectedSlugs = new Set(data.filter((part) => part.selected).map((part) => part.slug));
  const hotspots = sideAnatomyHotspots.filter((hotspot) => hotspot.regionIds.includes(regionId));

  return (
    <div className="side-anatomy-figure">
      <img
        src={`${import.meta.env.BASE_URL}${sideAssets[sex] ?? sideAssets.male}`}
        alt={`${sex === "female" ? "女生" : "男生"}侧面肌肉位置教学图`}
      />
      {hotspots.map((hotspot) => {
        const selected = selectedSlugs.has(hotspot.slug);
        return (
          <button
            key={`${hotspot.slug}-${hotspot.regionIds.join("-")}`}
            type="button"
            className={selected ? "is-selected" : ""}
            data-hit-size={hotspot.hitSize}
            aria-label={`侧面${hotspot.label}，${selected ? "已选" : "未选"}`}
            aria-pressed={selected}
            onClick={() => onBodyPartPress(hotspot.slug)}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.width}%`,
              height: `${hotspot.height}%`,
            }}
          >
            <span>{hotspot.label}</span>
          </button>
        );
      })}
    </div>
  );
}
