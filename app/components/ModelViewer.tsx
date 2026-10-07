'use client';

import { useMemo, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// Preload in the module scope — fires as soon as Next.js imports this file.
// drei caches the result so any subsequent useGLTF call hits the cache immediately.
useGLTF.preload('/tohe-optimized.glb', true);

function ToheModel({ onReady, sectionTwo }: { onReady: () => void; sectionTwo: boolean }) {
  const { scene } = useGLTF('/tohe-optimized.glb', true);
  const hasReportedReady = useRef(false);
  // A Three object can only belong to one canvas parent. Each hero/section needs its own clone.
  const model = useMemo(() => scene.clone(true), [scene]);
  const poseGroup = useRef<THREE.Group>(null!);
  const scaleGroup = useRef<THREE.Group>(null!);

  // This runs only after the GLB has resolved and has painted inside the hero canvas.
  useFrame(() => {
    if (!hasReportedReady.current) {
      hasReportedReady.current = true;
      onReady();
    }
  });

  // Normalise scale so the model fits in a ~2-unit box
  const normalizedScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return 1;
    return 2.0 / maxDim;
  }, [model]);

  const targetPose = useMemo(() => sectionTwo
    ? {
        position: new THREE.Vector3(0.060, -0.560, 0),
        rotation: new THREE.Euler(-0.092, -1.372, -0.212),
        scale: normalizedScale * 1.45,
      }
    : {
        position: new THREE.Vector3(0, -0.36, 0),
        rotation: new THREE.Euler(0.1984, -0.9816, -0.2120),
        scale: normalizedScale,
      },
  [normalizedScale, sectionTwo]);

  const targetQuaternion = useMemo(() => new THREE.Quaternion().setFromEuler(targetPose.rotation), [targetPose]);
  const targetScale = useMemo(() => new THREE.Vector3(targetPose.scale, targetPose.scale, targetPose.scale), [targetPose]);

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-delta * 4.5);
    poseGroup.current.position.lerp(targetPose.position, blend);
    poseGroup.current.quaternion.slerp(targetQuaternion, blend);
    scaleGroup.current.scale.lerp(targetScale, blend);
  });

  return (
    <group ref={poseGroup} position={[0, -0.36, 0]} rotation={[0.1984, -0.9816, -0.2120]}>
      <Center>
        <group ref={scaleGroup} scale={normalizedScale}>
          <primitive object={model} />
        </group>
      </Center>
    </group>
  );
}

function ModelControls({ interactive, sectionTwo }: { interactive: boolean; sectionTwo: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const hasSavedOpeningView = useRef(false);
  const openingPosition = useRef(new THREE.Vector3());
  const openingTarget = useRef(new THREE.Vector3());
  const { camera } = useThree();

  useEffect(() => {
    if (!hasSavedOpeningView.current && controls.current) {
      controls.current.saveState();
      openingPosition.current.copy(camera.position);
      openingTarget.current.copy(controls.current.target);
      hasSavedOpeningView.current = true;
    }
  }, [camera]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!sectionTwo || !orbit || !hasSavedOpeningView.current) return;

    // Smoothly return from the visitor's orbit to the opening composition.
    const blend = 1 - Math.exp(-delta * 5.5);
    camera.position.lerp(new THREE.Vector3(0, -0.1, 5.7), blend);
    orbit.target.lerp(openingTarget.current, blend);
    orbit.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={interactive}
      enablePan={false}
      enableZoom={false}
      enableRotate={interactive}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI * 0.34}
      maxPolarAngle={Math.PI * 0.66}
      minAzimuthAngle={-Math.PI * 0.23}
      maxAzimuthAngle={Math.PI * 0.23}
      target={[0, -0.1, 0]}
    />
  );
}

export default function ModelViewer({
  onReady = () => {},
  interactive = false,
  sectionTwo = false,
}: {
  onReady?: () => void;
  interactive?: boolean;
  sectionTwo?: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        touchAction: 'pan-y',
      }}
    >
      {/* Camera: z=4.5, fov=30 → model fills ~40% of viewport, centred */}
      <Canvas
        // A wider camera safety margin prevents crop on refresh and shorter viewports.
        camera={{ position: [0, -0.1, 4.10], fov: 30 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: 'transparent', width: '100%', height: '100%', position: 'absolute', inset: 0, touchAction: 'pan-y' }}
        onWheel={undefined}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#ffe0b2" />

        <Suspense fallback={null}>
          <ToheModel onReady={onReady} sectionTwo={sectionTwo} />
          <ModelControls interactive={interactive} sectionTwo={sectionTwo} />
        </Suspense>
      </Canvas>
    </div>
  );
}
