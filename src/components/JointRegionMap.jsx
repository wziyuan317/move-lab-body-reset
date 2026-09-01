import { jointDiagramZones } from "../bodyRegionMap.js";

const diagramAssets = {
  knee: "assets/body-map/knee-location-map.png",
  shoulder: "assets/body-map/shoulder-location-map.png",
  ankle: "assets/body-map/ankle-location-map.png",
};

export function JointRegionMap({ regionId, selectedIds = [], onToggleTarget }) {
  const zones = jointDiagramZones[regionId];
  const assetPath = diagramAssets[regionId];

  if (!zones || !assetPath) return null;

  return (
    <section className="joint-region-map" aria-label={`${regionId === "shoulder" ? "肩胛和肩" : regionId === "ankle" ? "踝和小腿" : "膝"}局部位置图`}>
      <div className="joint-region-map__canvas" style={{ position: "relative", aspectRatio: "1" }}>
        <img
          className="joint-region-map__image"
          src={`${import.meta.env.BASE_URL}${assetPath}`}
          alt="局部身体轮廓图；可使用图上的位置按钮标记不适处。"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
        {zones.map((zone) => {
          const selected = selectedIds.includes(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              className={`joint-region-map__zone${selected ? " is-selected" : ""}`}
              aria-label={`${zone.label}${zone.sideLabel ? `，${zone.sideLabel}侧` : ""}${selected ? "，已选" : "，未选"}`}
              aria-pressed={selected}
              onClick={() => onToggleTarget(zone.id)}
              style={{
                position: "absolute",
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                transform: "translate(-50%, -50%)",
                minWidth: "44px",
                minHeight: "44px",
              }}
            >
              <span>{zone.label}</span>
              {zone.sideLabel && <small>{zone.sideLabel}</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
