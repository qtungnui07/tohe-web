'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';

// Preload in the module scope — fires as soon as Next.js imports this file.
// drei caches the result so any subsequent useGLTF('/base_basic_pbr.glb') call
// (including the one in LoadingScreen) hits the cache immediately.
useGLTF.preload('/base_basic_pbr.glb');

function ToheModel() {
  const floatGroup = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/base_basic_pbr.glb');

  // Compute a normalizing scale so the model fits in a ~2-unit box
  const normalizedScale = useMemo(() => {
    const cloned = scene.clone();
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return 1;
    return 2.0 / maxDim; // target size of 2 world units
  }, [scene]);

  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!floatGroup.current) return;
    elapsed.current += delta;
    floatGroup.current.rotation.y += 0.004;
    floatGroup.current.position.y = Math.sin(elapsed.current * 0.7) * 0.08;
  });

  return (
    // Center places the bounding-box origin at [0,0,0]
    <Center>
      <group ref={floatGroup} scale={normalizedScale}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

export default function ModelViewer() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
      }}
    >
      {/* Camera: z=4.5, fov=30 → model fills ~40% of viewport, centred */}
      <Canvas
        camera={{ position: [-0.15, -0.1, 4.5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#ffe0b2" />
        <pointLight position={[0, 3, 2]} intensity={0.7} color="#fff3e0" />

        <Suspense fallback={null}>
          <ToheModel />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.3}
            scale={8}
            blur={2.5}
            far={3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
