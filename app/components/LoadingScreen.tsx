'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useProgress, Center } from '@react-three/drei';
import * as THREE from 'three';

// Start GLB fetch the moment this module is imported
useGLTF.preload('/tohe-optimized.glb', true);

/* ─────────────────────────────────────────────
   Mini spinning model — runs at 30 fps to stay
   light while the GLB is still downloading
───────────────────────────────────────────── */
function MiniTohe() {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/tohe-optimized.glb', true);
  const model = useMemo(() => scene.clone(true), [scene]);

  const scale = (() => {
    const box = new THREE.Box3().setFromObject(model);
    const s = box.getSize(new THREE.Vector3());
    const m = Math.max(s.x, s.y, s.z);
    return m === 0 ? 1 : 1.6 / m;
  })();

  const clock = useRef(0);
  useFrame((state, delta) => {
    clock.current += delta;
    if (!group.current) return;
    group.current.rotation.y += 0.012;
    group.current.position.y = Math.sin(clock.current * 1.1) * 0.06;
  });

  return (
    <Center>
      <group ref={group} scale={scale}>
        <primitive object={model} />
      </group>
    </Center>
  );
}

/* ── animated dots ── */
function Dots() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % 4), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <span aria-hidden>
      {'.'.repeat(count)}
      <span style={{ opacity: 0 }}>{'.'.repeat(3 - count)}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
interface LoadingScreenProps {
  visible  : boolean;
  modelReady: boolean;
  assetsReady: boolean;
  assetProgress: number;
  onReady  : () => void;
}

export default function LoadingScreen({ visible, modelReady, assetsReady, assetProgress, onReady }: LoadingScreenProps) {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(false);
  const stableOnReady = useCallback(onReady, []); // eslint-disable-line
  // The first GLB frame plus all visible media must be ready before we leave.
  const loadingComplete = modelReady && assetsReady;

  useEffect(() => {
    if (!loadingComplete) return;
    // Let the user actually see the completed bar before the hero takes over.
    const id = setTimeout(stableOnReady, 620);
    return () => clearTimeout(id);
  }, [loadingComplete, stableOnReady]);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  const displayProgress = loadingComplete
    ? 100
    : Math.min(99, Math.max(Math.round(progress * 0.25), assetProgress));

  return (
    <>
    <div
      aria-label="Loading"
      style={{
        position       : 'fixed',
        inset          : 0,
        zIndex         : 9999,
        background     : '#0a0a0a',
        display        : 'flex',
        flexDirection  : 'column',
        alignItems     : 'center',
        justifyContent : 'center',
        fontFamily     : '"BTDanta", serif',
        opacity        : visible ? 1 : 0,
        pointerEvents  : visible ? 'all' : 'none',
        transition     : 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange     : 'opacity',
      }}
    >
      {/* ── mini 3D model canvas ── */}
      <div
        style={{
          width        : 160,
          height       : 160,
          flexShrink   : 0,
          marginBottom : 8,
          opacity      : mounted ? 1 : 0,
          transition   : 'opacity 0.5s ease',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 28 }}
          gl={{
            antialias       : false,   // off → much lighter on integrated GPUs
            alpha           : true,
            powerPreference : 'low-power',
          }}
          frameloop="always"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[3, 5, 4]} intensity={2.0} />

          <Suspense fallback={null}>
            <MiniTohe />
          </Suspense>
        </Canvas>
      </div>

      {/* ── "Loading…" label ── */}
      <p
        style={{
          fontSize      : 'clamp(13px, 1.9vw, 20px)',
          letterSpacing : '0.32em',
          paddingLeft   : '0.32em',
          textTransform : 'uppercase',
          color         : '#f5f0e8',
          margin        : '0 0 26px',
          opacity       : mounted ? 0.8 : 0,
          transition    : 'opacity 0.7s ease 0.1s',
          userSelect    : 'none',
          whiteSpace    : 'nowrap',
        }}
      >
        Loading<Dots />
      </p>

      {/* ── progress bar + counter ── */}
      <div
        style={{
          display       : 'flex',
          flexDirection : 'column',
          alignItems    : 'center',
          width         : 'clamp(140px, 24vw, 300px)',
          opacity       : mounted ? 1 : 0,
          transition    : 'opacity 0.7s ease 0.15s',
        }}
      >
        {/* track */}
        <div
          style={{
            width        : '100%',
            height       : 2,
            background   : 'rgba(245,240,232,0.1)',
            borderRadius : 999,
            overflow     : 'hidden',
          }}
        >
          <div
            style={{
              height       : '100%',
              width        : `${displayProgress}%`,
              background   : 'linear-gradient(90deg, #f5a623 0%, #f5f0e8 100%)',
              borderRadius : 999,
              transition   : 'width 0.25s ease-out',
              willChange   : 'width',
            }}
          />
        </div>

        {/* % counter */}
        <p
          style={{
            marginTop          : 10,
            width              : '100%',
            textAlign          : 'center',
            fontSize           : 'clamp(9px, 0.9vw, 12px)',
            letterSpacing      : '0.18em',
            paddingLeft        : '0.18em',
            color              : 'rgba(245,240,232,0.38)',
            userSelect         : 'none',
            fontVariantNumeric : 'tabular-nums',
          }}
        >
          {displayProgress.toString().padStart(3, '0')} %
        </p>
      </div>
    </div>
    </>
  );
}
