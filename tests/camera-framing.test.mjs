import assert from "node:assert/strict";
import test from "node:test";
import {
  fitDistanceForBox,
  fitDistanceForSphere,
  getBoxHalfExtents,
  getCameraPose,
} from "../src/cameraFraming.js";

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
