'use client';

import { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useProgress, Center } from '@react-three/drei';
import * as THREE from 'three';

// Start GLB fetch the moment this module is imported
useGLTF.preload('/base_basic_pbr.glb');

/* ─────────────────────────────────────────────
   Reads real load progress from Three's manager.
   Lives OUTSIDE the Canvas — useProgress() is a
   Zustand store, not a Canvas context hook.
───────────────────────────────────────────── */
function ProgressWatcher({ onReady }: { onReady: () => void }) {
  const { progress, active } = useProgress();
  const fired = useRef(false);

  useEffect(() => {
    if (!active && progress >= 100 && !fired.current) {
      fired.current = true;
      setTimeout(onReady, 400);
    }
  }, [active, progress, onReady]);

  return null;
}

/* ─────────────────────────────────────────────
   Mini spinning model — runs at 30 fps to stay
   light while the GLB is still downloading
───────────────────────────────────────────── */
function MiniTohe() {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/base_basic_pbr.glb');

  const scale = (() => {
    const box = new THREE.Box3().setFromObject(scene.clone());
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
        <primitive object={scene} />
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
  onReady  : () => void;
}

export default function LoadingScreen({ visible, onReady }: LoadingScreenProps) {
  // useProgress must be called inside a component that renders inside <Canvas>
  // We read it here via the ProgressWatcher child trick
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(false);
  const stableOnReady = useCallback(onReady, []); // eslint-disable-line

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  const displayProgress = Math.min(100, Math.round(progress));

  return (
    <>
      {/* Watches Three.js loader events — no canvas needed */}
      <ProgressWatcher onReady={stableOnReady} />

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
