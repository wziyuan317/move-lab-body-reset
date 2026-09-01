export function fitDistanceForSphere(radius, verticalFovDegrees, margin = 1.18) {
  const halfFov = verticalFovDegrees * Math.PI / 360;
  return radius * margin / Math.sin(halfFov);
}

export function getCameraPose({ target, distance, viewSide }) {
  return {
    target: [...target],
    position: [target[0], target[1], target[2] + (viewSide === "front" ? -distance : distance)],
  };
}
