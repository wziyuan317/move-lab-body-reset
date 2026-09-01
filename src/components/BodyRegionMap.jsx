import Body from "react-muscle-highlighter";
import { bodySlugTargets, getTargetForBodySlug } from "../bodyRegionMap.js";

const DEFAULT_FILL = "#dce5f2";
const HOVER_FILL = "#ffd43b";
const SELECTED_FILL = "#ff665c";

function getSlugSelection(slug, regionId, selectedIds, selectedSides) {
  const selectedTargetIds = bodySlugTargets[slug]
    .filter((targetId) => getTargetForBodySlug(slug, regionId) === targetId)
    .filter((targetId) => selectedIds.includes(targetId));
  if (!selectedTargetIds.length) return undefined;

  const sides = new Set(selectedTargetIds.map((targetId) => selectedSides[targetId]).filter(Boolean));
  return {
    color: SELECTED_FILL,
    side: sides.size === 1 ? [...sides][0] : undefined,
  };
}

function createBodyData(regionId, selectedIds, selectedSides) {
  return Object.keys(bodySlugTargets).map((slug) => ({
    slug,
    ...getSlugSelection(slug, regionId, selectedIds, selectedSides),
  }));
}

export function BodyRegionMap({ regionId, selectedIds, selectedSides, viewSide, onToggleTarget, onChangeViewSide }) {
  const bodyData = createBodyData(regionId, selectedIds, selectedSides);
  const selectedSlugs = bodyData.filter((part) => part.color === SELECTED_FILL).map((part) => part.slug);
  const selectedHoverRules = selectedSlugs.map((slug) => `.body-region-map__body #${slug}:hover { fill: ${SELECTED_FILL} !important; }`).join("\n");

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
          .body-region-map__body path:hover { fill: ${HOVER_FILL} !important; }
          ${selectedHoverRules}
        `}</style>
        <Body
          data={bodyData}
          side={viewSide}
          gender="male"
          defaultFill={DEFAULT_FILL}
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
