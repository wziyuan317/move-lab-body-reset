import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { bodyRegions } from "../src/bodyMap.js";
import { loadNormalizedManPlayerBounds } from "./helpers/man-player-bounds.mjs";

const cameraModule = await import("../src/cameraFraming.js");
const {
  fitDistanceForBox,
  fitDistanceForSphere,
  getCameraFrame = () => undefined,
  getBoxHalfExtents,
  getCameraPose,
} = cameraModule;

const manPlayerBounds = await loadNormalizedManPlayerBounds();
const viewports = {
  desktop: { width: 711, height: 640 },
  mobile: { width: 355, height: 595 },
};

function projectPoint(point, frame, viewport) {
  const camera = new THREE.PerspectiveCamera(30, viewport.width / viewport.height, 0.01, 20);
  camera.position.set(...frame.position);
  camera.lookAt(...frame.target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  const projected = new THREE.Vector3(...point).project(camera);
  return {
    x: (projected.x + 1) * viewport.width / 2,
    y: (1 - projected.y) * viewport.height / 2,
  };
}

function projectedHotspotRect(region, frame, viewport, mobile, activeRegionId) {
  const center = manPlayerBounds.min.map((value, index) => (value + manPlayerBounds.max[index]) / 2);
  const point = center.map((value, index) => value + region.hotspot.position[index]);
  const projected = projectPoint(point, frame, viewport);
  const offset = mobile ? region.hotspot.mobileOffset : region.hotspot.screenOffset;
  const size = region.id === activeRegionId ? 44 * 1.14 : 44;
  const x = projected.x + (offset?.[0] ?? 0);
  const y = projected.y + (offset?.[1] ?? 0);
  return { left: x - size / 2, right: x + size / 2, top: y - size / 2, bottom: y + size / 2 };
}

function overlaps(first, second) {
  return first.left < second.right && first.right > second.left
    && first.top < second.bottom && first.bottom > second.top;
}

test("包围球距离随半径增加且保留安全边距", () => {
  const small = fitDistanceForSphere(1, 30, 1.18);
  const large = fitDistanceForSphere(2, 30, 1.18);
  assert.ok(small > 1);
  assert.equal(large, small * 2);
});

test("正背面共用目标并只反转观察方向", () => {
  const front = getCameraPose({ target: [0.1, -0.5, 0], distance: 3, viewSide: "front" });
  const back = getCameraPose({ target: [0.1, -0.5, 0], distance: 3, viewSide: "back" });
  assert.deepEqual(front.target, back.target);
  assert.equal(front.position[2], -back.position[2]);
  assert.equal(front.position[0], back.position[0]);
});

test("窄屏按包围盒真实横纵半尺寸适配，不把人物高度误作横向半径", () => {
  const desktop = fitDistanceForBox({
    halfWidth: 0.72,
    halfHeight: 1,
    halfDepth: 0.18,
    verticalFovDegrees: 30,
    aspect: 711 / 640,
    margin: 1.14,
  });
  const mobile = fitDistanceForBox({
    halfWidth: 0.72,
    halfHeight: 1,
    halfDepth: 0.18,
    verticalFovDegrees: 30,
    aspect: 355 / 595,
    margin: 1.14,
  });

  assert.ok(mobile > desktop, "窄屏应由真实人物宽度限制距离");
  assert.ok(mobile < 6, "窄屏距离不应被整个人体包围球放大到人物过小");
});

test("膝盖聚焦略微放大且仍把完整头脚包围盒纳入画面", () => {
  const bounds = { min: [-0.72, 0, -0.18], max: [0.72, 2, 0.18] };
  const center = [0, 1, 0];
  const kneeTarget = [0.13 * 0.06, 1 + -0.56 * 0.06, 0.08 * 0.06];
  const defaultExtents = getBoxHalfExtents({ ...bounds, target: center });
  const kneeExtents = getBoxHalfExtents({ ...bounds, target: kneeTarget });
  const common = { verticalFovDegrees: 30, aspect: 355 / 595 };
  const defaultDistance = fitDistanceForBox({ ...defaultExtents, ...common, margin: 1.14 });
  const kneeDistance = fitDistanceForBox({ ...kneeExtents, ...common, margin: 1.03 });

  assert.ok(kneeExtents.halfHeight > 1, "偏移目标后仍需保留较远端头脚上下文");
  assert.ok(kneeDistance < defaultDistance, "选中膝盖后应可控放大而不是缩小人物");
});

test("相机使用 Man Player Standing_05 真实边界保留 desktop/mobile 正背面头脚留白", () => {
  assert.equal(manPlayerBounds.assetSha256, "bb0e9f1ed0147b988d93b7dc6564b480efb05085c3bb78d2d74e7b01cff0d78b");
  assert.ok(Math.abs(manPlayerBounds.max[1] - manPlayerBounds.min[1] - 2) < 1e-6);

  for (const viewport of Object.values(viewports)) {
    for (const viewSide of ["front", "back"]) {
      for (const regionId of [undefined, "knee"]) {
        const region = bodyRegions.find((item) => item.id === regionId);
        const frame = getCameraFrame({
          bounds: manPlayerBounds,
          focusPosition: region?.hotspot.position,
          viewport,
          viewSide,
        });
        assert.ok(frame, "应返回可投影的相机 frame");
        const corners = [];
        for (const x of [manPlayerBounds.min[0], manPlayerBounds.max[0]]) {
          for (const y of [manPlayerBounds.min[1], manPlayerBounds.max[1]]) {
            for (const z of [manPlayerBounds.min[2], manPlayerBounds.max[2]]) {
              corners.push(projectPoint([x, y, z], frame, viewport));
            }
          }
        }
        for (const point of corners) {
          assert.ok(point.x >= 5 && point.x <= viewport.width - 5, `${viewSide}/${regionId ?? "default"} 横向无留白`);
          assert.ok(point.y >= 5 && point.y <= viewport.height - 5, `${viewSide}/${regionId ?? "default"} 头脚无留白`);
        }
      }
    }
  }
});

test("Man Player 真实边界与 hotspot offset 在 desktop/mobile 正背面无投影重叠", () => {
  for (const [name, viewport] of Object.entries(viewports)) {
    for (const viewSide of ["front", "back"]) {
      for (const activeRegionId of [undefined, "knee"]) {
        const region = bodyRegions.find((item) => item.id === activeRegionId);
        const frame = getCameraFrame({
          bounds: manPlayerBounds,
          focusPosition: region?.hotspot.position,
          viewport,
          viewSide,
        });
        assert.ok(frame, "应返回可投影的相机 frame");
        const rects = bodyRegions.map((item) => ({
          id: item.id,
          rect: projectedHotspotRect(item, frame, viewport, name === "mobile", activeRegionId),
        }));
        for (const { id, rect } of rects) {
          assert.ok(rect.left >= 0 && rect.right <= viewport.width, `${name}/${viewSide}/${activeRegionId ?? "default"}: ${id} 横向越界`);
          assert.ok(rect.top >= 0 && rect.bottom <= viewport.height, `${name}/${viewSide}/${activeRegionId ?? "default"}: ${id} 纵向越界`);
        }
        for (let first = 0; first < rects.length; first += 1) {
          for (let second = first + 1; second < rects.length; second += 1) {
            assert.equal(
              overlaps(rects[first].rect, rects[second].rect),
              false,
              `${name}/${viewSide}/${activeRegionId ?? "default"}: ${rects[first].id} 与 ${rects[second].id} 重叠`,
            );
          }
        }
      }
    }
  }
});
