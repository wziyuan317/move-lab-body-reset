import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { fitDistanceForSphere, getCameraPose } from "../cameraFraming.js";
import { anatomyTargets, bodyRegions, getRegionTargets } from "../bodyMap.js";

const baseUrl = import.meta.env.BASE_URL;
const clothedUrl = `${baseUrl}assets/models/move-lab-clothed.glb`;
const musclesUrl = `${baseUrl}assets/models/move-lab-muscles.glb`;

function useBodyModel(url, usesDraco = false) {
  return useLoader(GLTFLoader, url, (loader) => {
    if (!usesDraco) return;
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${baseUrl}draco/`);
    loader.setDRACOLoader(draco);
  });
}

function normalizeObject(object, height = 2, visibleOnly = false) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3();
  if (visibleOnly) {
    object.traverse((child) => {
      if (child.isMesh && child.visible) box.expandByObject(child);
    });
  } else {
    box.setFromObject(object);
  }
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = height / size.y;
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  object.updateMatrixWorld(true);
  return object;
}

function prepareClothedObject(object, height = 2) {
  object.updateMatrixWorld(true);
  const sourceBox = new THREE.Box3().setFromObject(object);
  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  object.scale.setScalar(height / sourceSize.y);
  object.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(object);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  object.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z);
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  return { object, bounds: { box, sphere } };
}

function ClothedModel({ regionId, onSelectRegion, onBounds }) {
  const gltf = useBodyModel(clothedUrl);
  const prepared = useMemo(() => {
    const next = cloneSkeleton(gltf.scene);
    next.rotation.y = Math.PI;
    next.traverse((object) => {
      if (!object.isMesh) return;
      object.material = object.material.clone();
      if (object.material.name === "LightBrown" || object.material.name === "White") {
        object.material.color.set("#f5f8ff");
      }
      if (object.material.name === "Red_Dark") object.material.color.set("#163a63");
      object.material.roughness = 0.72;
      object.material.metalness = 0;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return prepareClothedObject(next);
  }, [gltf.scene]);
  const { bounds, object: scene } = prepared;

  useLayoutEffect(() => {
    onBounds(bounds);
  }, [bounds, onBounds]);

  return (
    <group>
      <primitive object={scene} />
      {bodyRegions.map((region) => (
        <Html
          key={region.id}
          position={[
            bounds.sphere.center.x + region.hotspot.position[0],
            bounds.sphere.center.y + region.hotspot.position[1],
            bounds.sphere.center.z + region.hotspot.position[2],
          ]}
          center
          distanceFactor={3.2}
        >
          <button
            type="button"
            className={`model-hotspot${regionId === region.id ? " is-active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectRegion(region.id);
            }}
            aria-label={`定位${region.label}`}
          >
            <span>{region.shortLabel}</span>
          </button>
        </Html>
      ))}
    </group>
  );
}

function findTargetForObject(object, targets) {
  const labels = [object.name, object.userData?.name, object.userData?.nameDetail].filter(Boolean);
  return targets.find((target) => target.meshNames.some((meshName) => labels.includes(meshName)));
}

function MuscleModel({ regionId, selectedIds, hoveredId, onToggleTarget, onHoverTarget }) {
  const gltf = useBodyModel(musclesUrl, true);
  const targets = useMemo(() => getRegionTargets(regionId).filter((item) => item.kind === "muscle"), [regionId]);
  const scene = useMemo(() => {
    const next = gltf.scene.clone(true);
    next.traverse((object) => {
      if (!object.isMesh) return;
      const target = object.userData?.type === "muscle" ? findTargetForObject(object, targets) : undefined;
      object.visible = Boolean(target);
      if (!target) return;
      object.userData.moveTargetId = target.id;
      object.material = object.material.clone();
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return normalizeObject(next, 1.72, true);
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
  }, [scene, selectedIds, hoveredId]);

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
        onHoverTarget(targetId);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHoverTarget(undefined);
        document.body.style.cursor = "";
      }}
    />
  );
}

function getFocusTarget(bounds, regionId) {
  const center = bounds.sphere.center.clone();
  const region = bodyRegions.find((item) => item.id === regionId);
  if (!region) return center;
  return center.add(new THREE.Vector3(
    region.hotspot.position[0] * 0.28,
    region.hotspot.position[1] * 0.28,
    region.hotspot.position[2] * 0.28,
  ));
}

function fitCameraToTarget({ bounds, camera, controls, regionId, size, viewSide }) {
  const target = getFocusTarget(bounds, regionId);
  const targetOffset = target.distanceTo(bounds.sphere.center);
  const verticalFovRadians = THREE.MathUtils.degToRad(camera.fov);
  const aspect = Math.max(size.width, 1) / Math.max(size.height, 1);
  const horizontalFovRadians = 2 * Math.atan(Math.tan(verticalFovRadians / 2) * aspect);
  const limitingFov = THREE.MathUtils.radToDeg(Math.min(verticalFovRadians, horizontalFovRadians));
  const distance = fitDistanceForSphere(bounds.sphere.radius + targetOffset, limitingFov, 1.18);
  const pose = getCameraPose({ target: target.toArray(), distance, viewSide });

  camera.position.set(...pose.position);
  camera.near = Math.max(0.01, distance - bounds.sphere.radius * 2.5);
  camera.far = distance + bounds.sphere.radius * 3.5;
  if (controls) {
    controls.target.set(...pose.target);
    controls.minDistance = distance * 0.72;
    controls.maxDistance = distance * 1.55;
    controls.update();
  } else {
    camera.lookAt(...pose.target);
  }
  camera.updateProjectionMatrix();
}

function CameraRig({ bounds, regionId, viewSide, controlsRef }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    if (!bounds) return;
    fitCameraToTarget({ bounds, camera, controls: controlsRef.current, regionId, size, viewSide });
  }, [bounds, camera, controlsRef, regionId, size.height, size.width, viewSide]);
  return null;
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);
  return reducedMotion;
}

function SceneContent({ regionId, viewSide, onSelectRegion }) {
  const controlsRef = useRef();
  const [bounds, setBounds] = useState();
  const reducedMotion = usePrefersReducedMotion();
  const frontAzimuth = viewSide === "front";
  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 4, 5]} intensity={3.2} castShadow />
      <directionalLight position={[-3, 1, -4]} intensity={1.4} color="#6ee7d7" />
      <CameraRig bounds={bounds} regionId={regionId} viewSide={viewSide} controlsRef={controlsRef} />
      <ClothedModel regionId={regionId} onSelectRegion={onSelectRegion} onBounds={setBounds} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={8}
        minAzimuthAngle={frontAzimuth ? Math.PI * 0.58 : -Math.PI * 0.42}
        maxAzimuthAngle={frontAzimuth ? Math.PI * 1.42 : Math.PI * 0.42}
        minPolarAngle={Math.PI * 0.23}
        maxPolarAngle={Math.PI * 0.77}
      />
    </>
  );
}

function LoadingModel() {
  return (
    <Html center>
      <div className="model-loading" role="status">正在加载身体地图…</div>
    </Html>
  );
}

export function BodyScene(props) {
  return (
    <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 1, -4.6], fov: 30 }} gl={{ antialias: true }}>
      <Suspense fallback={<LoadingModel />}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
