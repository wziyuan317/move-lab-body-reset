import {
  getJointZoneControlData,
  getJointLeaderLineData,
  JOINT_MARKER_SELECTED_SCALE,
  JOINT_MARKER_SIZE,
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
          alt="局部身体轮廓图；可使用图上的位置按钮标记不适处。"
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
            style={{ left: `${zone.anchorX}%`, top: `${zone.anchorY}%` }}
          />
        ))}
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`joint-region-map__marker${zone.selected ? " is-selected" : ""}`}
            aria-label={zone.ariaLabel}
            aria-pressed={zone.selected}
            onClick={() => onToggleTarget(zone.id)}
            style={{
              position: "absolute",
              left: `${zone.markerX}%`,
              top: `${zone.markerY}%`,
              transform: `translate(-50%, -50%) scale(${zone.selected ? JOINT_MARKER_SELECTED_SCALE : 1})`,
              width: `${JOINT_MARKER_SIZE}px`,
              height: `${JOINT_MARKER_SIZE}px`,
              borderRadius: "50%",
              padding: 0,
            }}
          >
            <span aria-hidden="true">{zone.marker}</span>
          </button>
        ))}
      </div>
      <div className="joint-region-map__list" role="group" aria-label="位置列表">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`joint-region-map__list-item${zone.selected ? " is-selected" : ""}`}
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
