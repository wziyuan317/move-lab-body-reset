import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { anatomyTargets = [] } = await import("../src/bodyMap.js").catch(() => ({}));
const jointMapAssets = [
  "public/assets/body-map/knee-location-map.png",
  "public/assets/body-map/shoulder-location-map.png",
  "public/assets/body-map/ankle-location-map.png",
];

async function readGlbJson(relativePath) {
  const bytes = await readFile(path.join(projectRoot, relativePath));
  assert.equal(bytes.toString("ascii", 0, 4), "glTF");
  const jsonLength = bytes.readUInt32LE(12);
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString().replace(/\0+$/, ""));
}

test("着装模型含可调整 A 字站姿的左右上臂骨骼", async () => {
  const gltf = await readGlbJson("public/assets/models/move-lab-clothed.glb");
  const names = new Set(gltf.nodes.map((node) => node.name));
  assert.ok(names.has("LeftArm"));
  assert.ok(names.has("RightArm"));
});

test("所有肌肉目标都命中 Z-Anatomy 的真实 muscle 节点", async () => {
  const gltf = await readGlbJson("public/assets/models/move-lab-muscles.glb");
  const muscleNames = gltf.nodes
    .filter((node) => node.extras?.type === "muscle")
    .flatMap((node) => [node.name, node.extras?.name, node.extras?.nameDetail])
    .filter(Boolean);

  assert.ok(muscleNames.length >= 400);
  for (const target of anatomyTargets.filter((item) => item.kind === "muscle")) {
    assert.ok(
      target.meshNames.some((candidate) => muscleNames.includes(candidate)),
      `${target.id} 没有命中真实 muscle 节点`,
    );
  }
});

test("关节局部图都是至少 900 × 900 的有效 PNG", async () => {
  for (const relativePath of jointMapAssets) {
    const bytes = await readFile(path.join(projectRoot, relativePath));
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      `${relativePath} 不是 PNG`,
    );
    assert.ok(bytes.readUInt32BE(16) >= 900, `${relativePath} 宽度不足 900`);
    assert.ok(bytes.readUInt32BE(20) >= 900, `${relativePath} 高度不足 900`);
  }
});
