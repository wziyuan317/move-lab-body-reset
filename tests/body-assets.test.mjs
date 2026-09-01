import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { anatomyTargets = [] } = await import("../src/bodyMap.js").catch(() => ({}));
const clothedModelPath = "public/assets/models/move-lab-clothed.glb";
const clothedModelSha256 = "42f8fb8c20ccddc63a1ce42976f8ec484e8eedcc8ac7cf93fa57776a8c153f69";
const quaterniusLicensePath = "public/assets/models/QUATERNIUS-ULTIMATE-MODULAR-MEN-LICENSE.txt";
const quaterniusLicenseSha256 = "e8dbf915a2b82229913e301a0787696611241bdefec4832bc084f54161db1efe";
const jointMapAssets = [
  "public/assets/body-map/knee-location-map.png",
  "public/assets/body-map/shoulder-location-map.png",
  "public/assets/body-map/ankle-location-map.png",
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readGlb(relativePath) {
  const bytes = await readFile(path.join(projectRoot, relativePath));
  assert.equal(bytes.toString("ascii", 0, 4), "glTF");
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString().replace(/\0+$/, ""));
  return { bytes, json };
}

test("着装模型保留真实 Humanoid 骨架与可渲染内容", async () => {
  const { json: gltf } = await readGlb(clothedModelPath);
  const names = new Set(gltf.nodes.map((node) => node.name));
  assert.ok(names.has("CharacterArmature"));
  assert.ok(names.has("UpperArm.L"));
  assert.ok(names.has("UpperArm.R"));
  assert.ok(gltf.skins.length > 0);
  assert.ok(gltf.meshes.length > 0);
  assert.ok(gltf.meshes.some((mesh) => mesh.primitives.length > 0));
  assert.ok(gltf.animations.length > 0);
});

test("着装模型与包内许可证据的字节哈希和 README 记录一致", async () => {
  const [{ bytes: clothedModel }, license, readme] = await Promise.all([
    readGlb(clothedModelPath),
    readFile(path.join(projectRoot, quaterniusLicensePath)),
    readFile(path.join(projectRoot, "public/assets/models/README.md"), "utf8"),
  ]);

  assert.equal(sha256(clothedModel), clothedModelSha256);
  assert.equal(sha256(license), quaterniusLicenseSha256);
  assert.ok(readme.includes(clothedModelSha256));
  assert.ok(readme.includes(quaterniusLicensePath.split("/").at(-1)));
  assert.ok(readme.includes(quaterniusLicenseSha256));
});

test("所有肌肉目标都命中 Z-Anatomy 的真实 muscle 节点", async () => {
  const { json: gltf } = await readGlb("public/assets/models/move-lab-muscles.glb");
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
