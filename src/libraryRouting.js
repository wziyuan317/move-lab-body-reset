import { movements } from "./movements.js";

const validMovementIds = new Set(movements.map((movement) => movement.id));

function normalizedBase(baseUrl) {
  if (!baseUrl || baseUrl === "/") return "/";
  return `/${baseUrl.replace(/^\/+|\/+$/g, "")}/`;
}

export function buildLibraryPath(movementId, baseUrl = "/", routeMode = "path") {
  const base = normalizedBase(baseUrl);
  if (routeMode === "query") {
    const params = new URLSearchParams({ view: "library" });
    if (movementId && validMovementIds.has(movementId)) {
      params.set("movement", movementId);
    }
    return `${base}?${params.toString()}`;
  }
  const detailPath = `${base}动作教程`;
  return movementId && validMovementIds.has(movementId)
    ? `${detailPath}?动作=${encodeURIComponent(movementId)}`
    : detailPath;
}

export function readLibraryLocation(pathname = "/", search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const actionId = params.get("动作");
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURI(pathname);
  } catch {
    decodedPathname = pathname;
  }
  if (decodedPathname.replace(/\/+$/, "").endsWith("/动作教程")) {
    return {
      view: "library",
      ...(validMovementIds.has(actionId) ? { movementId: actionId } : {}),
    };
  }

  if (params.get("view") === "library") {
    const legacyMovementId = params.get("movement");
    return {
      view: "library",
      ...(validMovementIds.has(legacyMovementId) ? { movementId: legacyMovementId } : {}),
    };
  }

  return undefined;
}
