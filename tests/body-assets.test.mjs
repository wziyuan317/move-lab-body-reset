import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { anatomyTargets = [] } = await import("../src/bodyMap.js").catch(() => ({}));
const clothedModelPath = "public/assets/models/move-lab-clothed.glb";
const clothedModelSha256 = "bb0e9f1ed0147b988d93b7dc6564b480efb05085c3bb78d2d74e7b01cff0d78b";
const manPlayerEvidencePath = "public/assets/models/MAN-PLAYER-ATTRIBUTION.txt";
const manPlayerEvidenceSha256 = "b6380dc11dda740c96e5ab639a36be9ce5b9f572970cb5426c967df58cf789e4";
const muscleModelPath = "public/assets/models/move-lab-muscles.glb";
const muscleModelSha256 = "0886b6a068e655b284903664e2178d7964f80b1c0ce798461909ac806bcef2e3";
const hpfreiLicensePath = "public/assets/models/HPFREI-BODY-ANATOMY-3D-VIEWER-LICENSE.txt";
const hpfreiLicenseSha256 = "8dddf9ce9d2004fd6bb13f1f5f0985f673d46bbb49fed4b83092bbd402a837bf";
const zAnatomyLicensePath = "public/assets/models/Z-ANATOMY-LICENSE.txt";
const zAnatomyLicenseSha256 = "9d84c0eeff7a1a22027a3f2edd24b02a4cab76bf6b5038f29cfc35eff49a0209";
const jointMapAssets = [
  "public/assets/body-map/knee-location-map.png",
  "public/assets/body-map/shoulder-location-map.png",
  "public/assets/body-map/ankle-location-map.png",
];
const sideAnatomyAssets = [
  "public/assets/body-map/anatomy-side-male.png",
  "public/assets/body-map/anatomy-side-female.png",
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

test("用户提供的着装模型保留可审计来源、真实骨架与完整渲染结构", async () => {
  const { bytes, json: gltf } = await readGlb(clothedModelPath);
  const names = new Set(gltf.nodes.map((node) => node.name));
  const primitiveCount = gltf.meshes.reduce((count, mesh) => count + mesh.primitives.length, 0);

  assert.equal(sha256(bytes), clothedModelSha256);
  assert.deepEqual(gltf.asset.extras, {
    author: "RiverofCreative (https://sketchfab.com/RiverofCreative)",
    license: "CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)",
    source: "https://sketchfab.com/3d-models/man-player-4c7133dbb06e4136891d59231372d818",
    title: "Man Player",
  });
  assert.ok(names.has("CC_Base_BoneRoot_01"));
  assert.ok(names.has("CC_Base_L_Upperarm_050"));
  assert.ok(names.has("CC_Base_R_Upperarm_074"));
  assert.equal(gltf.skins.length, 1);
  assert.equal(gltf.meshes.length, 17);
  assert.equal(primitiveCount, 17);
  assert.equal(gltf.animations.length, 20);
  assert.equal(gltf.materials.length, 17);
  assert.equal(gltf.textures.length, 47);
  assert.equal(gltf.images.length, 47);
  for (let index = 1; index <= 9; index += 1) {
    assert.ok(gltf.animations.some(({ name }) => name === `Standing_0${index}`));
  }
});

test("当前着装模型的署名、许可与接收记录可独立审计", async () => {
  const [{ bytes: clothedModel }, evidence, readme] = await Promise.all([
    readGlb(clothedModelPath),
    readFile(path.join(projectRoot, manPlayerEvidencePath), "utf8"),
    readFile(path.join(projectRoot, "public/assets/models/README.md"), "utf8"),
  ]);

  assert.equal(sha256(clothedModel), clothedModelSha256);
  assert.equal(sha256(evidence), manPlayerEvidenceSha256);
  for (const value of [
    "Man Player",
    "RiverofCreative",
    "CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)",
    "https://sketchfab.com/3d-models/man-player-4c7133dbb06e4136891d59231372d818",
    "2026-09-01",
    "man_player.glb",
    "12123012",
    clothedModelSha256,
  ]) assert.ok(evidence.includes(value), `署名证据缺少 ${value}`);
  for (const value of [
    "Man Player",
    "RiverofCreative",
    "CC BY 4.0",
    "2026-09-01",
    manPlayerEvidencePath.split("/").at(-1),
    manPlayerEvidenceSha256,
    clothedModelSha256,
  ]) assert.ok(readme.includes(value), `README 缺少 ${value}`);
});

test("所有肌肉目标都命中 Z-Anatomy 的真实 muscle 节点", async () => {
  const { json: gltf } = await readGlb(muscleModelPath);
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

test("专业解剖模型保留可审计的上游字节与两层许可证据", async () => {
  const [{ bytes: model }, hpfreiLicense, zAnatomyLicense, readme] = await Promise.all([
    readGlb(muscleModelPath),
    readFile(path.join(projectRoot, hpfreiLicensePath)),
    readFile(path.join(projectRoot, zAnatomyLicensePath)),
    readFile(path.join(projectRoot, "public/assets/models/README.md"), "utf8"),
  ]);

  assert.equal(sha256(model), muscleModelSha256);
  assert.equal(sha256(hpfreiLicense), hpfreiLicenseSha256);
  assert.equal(sha256(zAnatomyLicense), zAnatomyLicenseSha256);
  assert.match(hpfreiLicense.toString(), /Creative Commons Attribution-ShareAlike 4\.0/);
  assert.match(zAnatomyLicense.toString(), /Creative Commons Attribution-ShareAlike 4\.0/);
  for (const evidence of [
    muscleModelSha256,
    hpfreiLicensePath.split("/").at(-1),
    hpfreiLicenseSha256,
    zAnatomyLicensePath.split("/").at(-1),
    zAnatomyLicenseSha256,
    "2026-09-01",
  ]) assert.ok(readme.includes(evidence), `README 缺少 ${evidence}`);
  assert.match(readme, /CC BY-SA 4\.0/);
  assert.doesNotMatch(readme.match(/### Professional anatomy[\s\S]*?(?=\n###|$)/)?.[0] ?? "", /CC0/);
});

test("legacy 专业 GLB 只保留为本地审计素材，发布目录不得包含", async () => {
  await access(path.join(projectRoot, muscleModelPath));
  for (const outputPath of [
    "dist/client/assets/models/move-lab-muscles.glb",
    "dist/github/assets/models/move-lab-muscles.glb",
  ]) {
    await assert.rejects(access(path.join(projectRoot, outputPath)), { code: "ENOENT" });
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

test("男女侧面解剖图使用一致的大尺寸 PNG 画布", async () => {
  const sizes = [];
  for (const relativePath of sideAnatomyAssets) {
    const bytes = await readFile(path.join(projectRoot, relativePath));
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      `${relativePath} 不是 PNG`,
    );
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    assert.ok(Math.max(width, height) >= 1024, `${relativePath} 长边不足 1024`);
    assert.ok(height >= width, `${relativePath} 应使用适合全身人物的竖向画布`);
    assert.ok(bytes.length >= 100_000, `${relativePath} 疑似空白或极小占位图`);
    sizes.push([width, height]);
  }
  assert.deepEqual(sizes[0], sizes[1], "男女侧面解剖图画布尺寸必须一致");
});
