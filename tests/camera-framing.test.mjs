import assert from "node:assert/strict";
import test from "node:test";
import { fitDistanceForSphere, getCameraPose } from "../src/cameraFraming.js";

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
