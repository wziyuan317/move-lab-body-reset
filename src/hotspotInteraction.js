export function createHotspotHandlers(onSelectRegion, regionId) {
  return {
    onClick(event) {
      event.stopPropagation();
      onSelectRegion(regionId);
    },
    onKeyDown(event) {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      event.stopPropagation();
      onSelectRegion(regionId);
    },
  };
}
