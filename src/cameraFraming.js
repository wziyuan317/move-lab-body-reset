export function fitDistanceForSphere(radius, verticalFovDegrees, margin = 1.18) {
  const halfFov = verticalFovDegrees * Math.PI / 360;
  return radius * margin / Math.sin(halfFov);
}

export function getBoxHalfExtents({ min, max, target }) {
  return {
    halfWidth: Math.max(Math.abs(min[0] - target[0]), Math.abs(max[0] - target[0])),
    halfHeight: Math.max(Math.abs(min[1] - target[1]), Math.abs(max[1] - target[1])),
    halfDepth: Math.max(Math.abs(min[2] - target[2]), Math.abs(max[2] - target[2])),
  };
}

export function fitDistanceForBox({
  halfWidth,
  halfHeight,
  halfDepth = 0,
  verticalFovDegrees,
  aspect,
  margin = 1.12,
}) {
  const verticalHalfFov = verticalFovDegrees * Math.PI / 360;
  const verticalTangent = Math.tan(verticalHalfFov);
  const safeAspect = Math.max(aspect, Number.EPSILON);
  const horizontalTangent = verticalTangent * safeAspect;
  const planarDistance = Math.max(
    halfHeight / verticalTangent,
    halfWidth / horizontalTangent,
  );
  return planarDistance * margin + halfDepth;
}

export function getCameraPose({ target, distance, viewSide }) {
  return {
    target: [...target],
    position: [target[0], target[1], target[2] + (viewSide === "front" ? -distance : distance)],
  };
}
