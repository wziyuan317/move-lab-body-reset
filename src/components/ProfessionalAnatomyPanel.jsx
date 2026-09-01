import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { X } from "@phosphor-icons/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { anatomyTargets, getRegionTargets } from "../bodyMap.js";

const baseUrl = import.meta.env.BASE_URL;
const musclesUrl = `${baseUrl}assets/models/move-lab-muscles.glb`;

function useMuscleModel() {
  return useLoader(GLTFLoader, musclesUrl, (loader) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${baseUrl}draco/`);
    loader.setDRACOLoader(draco);
  });
}

function normalizeVisibleObject(object, height = 2) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3();
  object.traverse((child) => {
    if (child.isMesh && child.visible) box.expandByObject(child);
  });
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = height / Math.max(size.y, 0.001);
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  object.updateMatrixWorld(true);
  return object;
}

function findTargetForObject(object, targets) {
  const labels = [object.name, object.userData?.name, object.userData?.nameDetail].filter(Boolean);
  return targets.find((target) => target.meshNames.some((meshName) => labels.includes(meshName)));
}

function MuscleModel({ regionId, selectedIds, onToggleTarget }) {
  const gltf = useMuscleModel();
  const [hoveredId, setHoveredId] = useState();
  const targets = useMemo(
    () => getRegionTargets(regionId).filter((target) => target.kind === "muscle"),
    [regionId],
  );
  const scene = useMemo(() => {
    const next = gltf.scene.clone(true);
    next.traverse((object) => {
      if (!object.isMesh) return;
      const target = object.userData?.type === "muscle" ? findTargetForObject(object, targets) : undefined;
      object.visible = Boolean(target);
      if (!target) return;
      object.userData.moveTargetId = target.id;
      object.material = object.material.clone();
    });
    return normalizeVisibleObject(next, 1.75);
  }, [gltf.scene, targets]);

  useEffect(() => {
    scene.traverse((object) => {
      const targetId = object.userData?.moveTargetId;
      if (!object.isMesh || !targetId) return;
      const target = anatomyTargets.find((item) => item.id === targetId);
      const active = selectedIds.includes(targetId);
      const hovered = hoveredId === targetId;
      object.material.color.set(target.color).multiplyScalar(active || hovered ? 1 : 0.48);
      if (object.material.emissive) {
        object.material.emissive.set(target.color);
        object.material.emissiveIntensity = active ? 0.42 : hovered ? 0.24 : 0.03;
      }
      object.material.roughness = active || hovered ? 0.36 : 0.7;
      object.material.needsUpdate = true;
    });
  }, [hoveredId, scene, selectedIds]);

  return (
    <primitive
      object={scene}
      onClick={(event) => {
        const targetId = event.object.userData?.moveTargetId;
        if (!targetId) return;
        event.stopPropagation();
        onToggleTarget(targetId);
      }}
      onPointerMove={(event) => {
        const targetId = event.object.userData?.moveTargetId;
        if (!targetId) return;
        event.stopPropagation();
        setHoveredId(targetId);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHoveredId(undefined);
        document.body.style.cursor = "";
      }}
    />
  );
}

function LoadingModel() {
  return <Html center><div className="model-loading" role="status">正在加载专业解剖模型…</div></Html>;
}

export default function ProfessionalAnatomyPanel({ regionId, selectedIds, onToggleTarget, onClose }) {
  return (
    <section className="professional-anatomy" role="dialog" aria-modal="true" aria-labelledby="professional-anatomy-title">
      <header>
        <div>
          <small>PROFESSIONAL VIEW</small>
          <h2 id="professional-anatomy-title">专业解剖模式</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭专业解剖模式"><X size={23} weight="bold" />关闭</button>
      </header>
      <div className="professional-anatomy__canvas">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3.8], fov: 34 }}>
          <ambientLight intensity={2.1} />
          <directionalLight position={[3, 4, 5]} intensity={3} />
          <Suspense fallback={<LoadingModel />}>
            <MuscleModel regionId={regionId} selectedIds={selectedIds} onToggleTarget={onToggleTarget} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2.3} maxDistance={6} />
        </Canvas>
      </div>
      <p>仅用于解剖教育与位置沟通，不提供诊断，也不能替代医生或物理治疗师的个体评估。</p>
    </section>
  );
}
