import {
  JOINT_ANCHOR_SIZE,
  getJointZoneControlData,
  getJointLeaderLineData,
} from "../bodyRegionMap.js";

const diagramAssets = {
  knee: "assets/body-map/knee-location-map.png",
  shoulder: "assets/body-map/shoulder-location-map.png",
  ankle: "assets/body-map/ankle-location-map.png",
};

export function JointRegionMap({ regionId, selectedIds = [], onToggleTarget }) {
  const zones = getJointZoneControlData(regionId, selectedIds);
  const leaderLines = getJointLeaderLineData(regionId, selectedIds);
  const assetPath = diagramAssets[regionId];

  if (!zones || !assetPath) return null;

  return (
    <section className="joint-region-map" aria-label={`${regionId === "shoulder" ? "肩胛和肩" : regionId === "ankle" ? "踝和小腿" : "膝"}局部位置图`}>
      <div className="joint-region-map__canvas" style={{ position: "relative", aspectRatio: "1" }}>
        <img
          className="joint-region-map__image"
          src={`${import.meta.env.BASE_URL}${assetPath}`}
          alt="局部肌肉位置教学图；小锚点对应图外的位置按钮。"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
        {leaderLines.map((line) => (
          <span
            key={`${line.id}-leader`}
            className={`joint-region-map__leader${line.selected ? " is-selected" : ""}`}
            aria-hidden="true"
            style={{
              left: `${line.anchorX}%`,
              top: `${line.anchorY}%`,
              width: `${line.lengthPercent}%`,
              transform: `rotate(${line.angleDeg}deg)`,
            }}
          />
        ))}
        {zones.map((zone) => (
          <span
            key={`${zone.id}-anchor`}
            className={`joint-region-map__anchor${zone.selected ? " is-selected" : ""}`}
            aria-hidden="true"
            style={{ left: `${zone.anchorX}%`, top: `${zone.anchorY}%`, "--joint-anchor-size": `${JOINT_ANCHOR_SIZE}px` }}
          />
        ))}
      </div>
      <div className="joint-region-map__callouts" role="group" aria-label="图外位置列表">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            data-hit-size="44"
            className={`joint-region-map__callout${zone.selected ? " is-selected" : ""}`}
            aria-label={zone.ariaLabel}
            aria-pressed={zone.selected}
            onClick={() => onToggleTarget(zone.id)}
          >
            <span aria-hidden="true">{zone.marker}</span>{zone.label}
          </button>
        ))}
      </div>
    </section>
  );
}
