import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const modelPath = path.join(projectRoot, "public/assets/models/move-lab-clothed.glb");

function withoutVisualMaterials(bytes) {
  const jsonLength = bytes.readUInt32LE(12);
  const jsonStart = 20;
  const trailingChunks = bytes.subarray(jsonStart + jsonLength);
  const gltf = JSON.parse(bytes.subarray(jsonStart, jsonStart + jsonLength).toString().replace(/\0+$/, ""));

  for (const mesh of gltf.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) delete primitive.material;
  }
  delete gltf.materials;
  delete gltf.textures;
  delete gltf.images;
  delete gltf.samplers;

  const json = Buffer.from(JSON.stringify(gltf));
  const paddedLength = Math.ceil(json.length / 4) * 4;
  const output = Buffer.alloc(12 + 8 + paddedLength + trailingChunks.length, 0x20);
  bytes.copy(output, 0, 0, 8);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedLength, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  json.copy(output, 20);
  trailingChunks.copy(output, 20 + paddedLength);
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
}

function parseGlb(arrayBuffer) {
  return new Promise((resolve, reject) => new GLTFLoader().parse(arrayBuffer, "", resolve, reject));
}

export async function loadNormalizedManPlayerBounds() {
  const bytes = await readFile(modelPath);
  const gltf = await parseGlb(withoutVisualMaterials(bytes));
  const object = gltf.scene;
  object.rotation.y = Math.PI;
  const clip = gltf.animations.find(({ name }) => name === "Standing_05");
  if (!clip) throw new Error("Man Player 缺少 Standing_05");
  const mixer = new THREE.AnimationMixer(object);
  mixer.clipAction(clip).play();
  mixer.update(0);
  object.updateMatrixWorld(true);

  const sourceBox = new THREE.Box3().setFromObject(object);
  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  object.scale.setScalar(2 / sourceSize.y);
  object.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(object);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  object.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z);
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  return {
    assetSha256: createHash("sha256").update(bytes).digest("hex"),
    min: box.min.toArray(),
    max: box.max.toArray(),
  };
}
