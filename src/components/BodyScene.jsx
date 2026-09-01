import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { anatomyTargets, bodyRegions, getRegionTargets, regionCameraPresets } from "../bodyMap.js";

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

function ClothedModel({ regionId, onSelectRegion }) {
  const gltf = useBodyModel(clothedUrl);
  const scene = useMemo(() => {
    const next = cloneSkeleton(gltf.scene);
    next.traverse((object) => {
      if (object.isSkinnedMesh) object.skeleton.pose();
    });
    const leftArm = next.getObjectByName("LeftArm");
    const rightArm = next.getObjectByName("RightArm");
    if (leftArm) leftArm.rotateX(THREE.MathUtils.degToRad(60));
    if (rightArm) rightArm.rotateX(THREE.MathUtils.degToRad(60));
    next.traverse((object) => {
      if (!object.isMesh) return;
      object.material = object.material.clone();
      object.material.color.set("#e8f3ff");
      object.material.roughness = 0.72;
      object.material.metalness = 0;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return normalizeObject(next);
  }, [gltf.scene]);

  return (
    <group>
      <primitive object={scene} />
      {bodyRegions.map((region) => (
        <Html
          key={region.id}
          position={[region.hotspot.position[2], region.hotspot.position[1], -region.hotspot.position[0]]}
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

function CameraRig({ mode, regionId, viewSide, controlsRef }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const preset = regionId ? regionCameraPresets[regionId] : null;
    const position = preset?.position ?? [0, 0, 4.6];
    const target = mode === "muscles" && regionId ? [0, 0, 0] : (preset?.target ?? [0, 0, 0]);
    if (mode === "clothed" || !regionId) {
      camera.position.set(Math.abs(position[2]) * (viewSide === "front" ? 1 : -1), position[1], 0);
    } else {
      camera.position.set(0, 0, 3.8 * (viewSide === "front" ? -1 : 1));
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    } else {
      camera.lookAt(...target);
    }
    camera.updateProjectionMatrix();
  }, [camera, controlsRef, mode, regionId, viewSide]);
  return null;
}

function SceneContent(props) {
  const controlsRef = useRef();
  return (
    <>
      {props.mode === "muscles" && <color attach="background" args={["#eaf3ff"]} />}
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 4, 5]} intensity={3.2} castShadow />
      <directionalLight position={[-3, 1, -4]} intensity={1.4} color="#6ee7d7" />
      <CameraRig mode={props.mode} regionId={props.regionId} viewSide={props.viewSide} controlsRef={controlsRef} />
      {props.mode === "clothed" || !props.regionId ? (
        <ClothedModel regionId={props.regionId} onSelectRegion={props.onSelectRegion} />
      ) : (
        <MuscleModel {...props} />
      )}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.25}
        maxDistance={5.2}
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
    <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 0, -4.6], fov: 30 }} gl={{ antialias: true }}>
      <Suspense fallback={<LoadingModel />}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
