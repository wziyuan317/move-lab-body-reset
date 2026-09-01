import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { fitDistanceForBox, getBoxHalfExtents, getCameraPose } from "../cameraFraming.js";
import { bodyRegions } from "../bodyMap.js";

const baseUrl = import.meta.env.BASE_URL;
const clothedUrl = `${baseUrl}assets/models/move-lab-clothed.glb`;
const defaultPoseName = "Standing_05";

function useBodyModel(url) {
  return useLoader(GLTFLoader, url);
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

function applyStaticPose(object, animations, poseName) {
  const clip = animations.find(({ name }) => name === poseName);
  if (!clip) throw new Error(`角色模型缺少静态姿态：${poseName}`);
  const mixer = new THREE.AnimationMixer(object);
  mixer.clipAction(clip).play();
  mixer.update(0);
  object.updateMatrixWorld(true);
  return mixer;
}

function ClothedModel({ regionId, onSelectRegion, onBounds }) {
  const gltf = useBodyModel(clothedUrl);
  const prepared = useMemo(() => {
    const next = cloneSkeleton(gltf.scene);
    next.rotation.y = Math.PI;
    next.traverse((object) => {
      if (!object.isMesh) return;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
      object.castShadow = true;
      object.receiveShadow = true;
    });
    const poseMixer = applyStaticPose(next, gltf.animations, defaultPoseName);
    return { ...prepareClothedObject(next), poseMixer };
  }, [gltf.animations, gltf.scene]);
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
        >
          <button
            type="button"
            className={`model-hotspot${regionId === region.id ? " is-active" : ""}`}
            data-region-id={region.id}
            style={{
              "--hotspot-x": `${region.hotspot.screenOffset?.[0] ?? 0}px`,
              "--hotspot-y": `${region.hotspot.screenOffset?.[1] ?? 0}px`,
              "--hotspot-mobile-x": `${region.hotspot.mobileOffset?.[0] ?? 0}px`,
              "--hotspot-mobile-y": `${region.hotspot.mobileOffset?.[1] ?? 0}px`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectRegion(region.id);
            }}
            onKeyDown={(event) => {
              if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
              event.preventDefault();
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

function getFocusTarget(bounds, regionId) {
  const center = bounds.sphere.center.clone();
  const region = bodyRegions.find((item) => item.id === regionId);
  if (!region) return center;
  return center.add(new THREE.Vector3(
    region.hotspot.position[0] * 0.06,
    region.hotspot.position[1] * 0.06,
    region.hotspot.position[2] * 0.06,
  ));
}

function fitCameraToTarget({ bounds, camera, controls, regionId, size, viewSide }) {
  const target = getFocusTarget(bounds, regionId);
  const aspect = Math.max(size.width, 1) / Math.max(size.height, 1);
  const extents = getBoxHalfExtents({
    min: bounds.box.min.toArray(),
    max: bounds.box.max.toArray(),
    target: target.toArray(),
  });
  const distance = fitDistanceForBox({
    ...extents,
    verticalFovDegrees: camera.fov,
    aspect,
    margin: regionId ? 1.03 : 1.14,
  });
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
