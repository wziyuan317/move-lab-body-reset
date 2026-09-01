import Body from "react-muscle-highlighter";
import { getBodyPartFill, getBodyRegionVisualData, getTargetForBodySlug } from "../bodyRegionMap.js";

export function BodyRegionMap({ regionId, selectedIds = [], selectedSides = {}, viewSide, onToggleTarget, onChangeViewSide }) {
  const bodyData = getBodyRegionVisualData({ regionId, selectedIds, selectedSides }).map(({ slug, selected, side }) => ({
    slug,
    ...(selected ? { color: getBodyPartFill({ selected }), side } : {}),
  }));

  return (
    <section className="body-region-map" aria-label="2D 身体分区定位">
      <div className="body-region-map__tabs" role="tablist" aria-label="身体视图">
        <button
          type="button"
          role="tab"
          aria-selected={viewSide === "front"}
          aria-controls="body-region-map-body"
          className={viewSide === "front" ? "is-active" : ""}
          onClick={() => onChangeViewSide("front")}
        >
          正面
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewSide === "back"}
          aria-controls="body-region-map-body"
          className={viewSide === "back" ? "is-active" : ""}
          onClick={() => onChangeViewSide("back")}
        >
          背面
        </button>
      </div>
      <div id="body-region-map-body" className="body-region-map__body" role="tabpanel" aria-label={`${viewSide === "front" ? "正面" : "背面"}身体图`}>
        <style>{`
          .body-region-map__body path:hover { fill: ${getBodyPartFill({ hovered: true })} !important; }
        `}</style>
        <Body
          data={bodyData}
          side={viewSide}
          gender="male"
          defaultFill={getBodyPartFill()}
          defaultStroke="#9aacbf"
          defaultStrokeWidth={1}
          onBodyPartPress={(part, side) => {
            const targetId = getTargetForBodySlug(part.slug, regionId);
            if (targetId) onToggleTarget(targetId, side);
          }}
        />
      </div>
    </section>
  );
}
