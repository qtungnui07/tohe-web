'use client';

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/tohe-optimized.glb', true);

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

const SUBTITLE_WORDS = ['Move', 'your', 'cursor!'];
const TITLE_WORDS = ['What', 'have', 'we', 'accomplished?'];

const TRAIL_IMAGES = [
  '/imgs/2aOboQo24zMJHedRa7StLO10lRdadV3gKDCgQCoa.webp',
  '/imgs/2aOboQo25brRWyPQqVTd2dtFl2v9TS4tVyrsRnaS.webp',
  '/imgs/2aOboQo25i9MmQ0n85m8ANG7s1eNgLz6lVHF8vLs.webp',
  '/imgs/2aOboQo25nCwAxGRtbAsaAgOcRHXnBmksJBPzgHo.webp',
  '/imgs/2aOboQo260rFVhXL8WPUocTc3Biis0BV3cLfFUGm.webp',
  '/imgs/IMG_5118.webp',
  '/imgs/IMG_5119.webp',
];

interface DragonData {
  initialPos: [number, number, number];
  scaleMultiplier: number;
  rotationOffset: [number, number, number];
  floatSpeed: number;
  floatRange: number;
}

const FAR_DRAGONS: DragonData[] = [
  { initialPos: [-3.8, 1.8, -2.5], scaleMultiplier: 0.45, rotationOffset: [-0.1, -1.2, -0.2], floatSpeed: 1.1, floatRange: 0.15 },
  { initialPos: [3.6, -1.8, -3.0], scaleMultiplier: 0.38, rotationOffset: [0.2, 1.4, 0.1], floatSpeed: 0.9, floatRange: 0.18 },
];

const MID_DRAGONS: DragonData[] = [
  { initialPos: [3.2, 1.6, -1.0], scaleMultiplier: 0.65, rotationOffset: [-0.05, -2.1, -0.1], floatSpeed: 1.3, floatRange: 0.12 },
  { initialPos: [-3.0, -1.5, -0.8], scaleMultiplier: 0.70, rotationOffset: [0.15, 0.8, 0.2], floatSpeed: 1.0, floatRange: 0.14 },
];

const NEAR_DRAGONS: DragonData[] = [
  { initialPos: [0.3, -2.3, 0.5], scaleMultiplier: 0.88, rotationOffset: [-0.09, -1.37, -0.21], floatSpeed: 1.2, floatRange: 0.10 },
];

function FloatingDragon({ initialPos, scaleMultiplier, rotationOffset, floatSpeed, floatRange }: DragonData) {
  const { scene } = useGLTF('/tohe-optimized.glb', true);
  const model = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null!);

  const normalizedScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim === 0 ? 1 : 1.8 / maxDim;
  }, [model]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * floatSpeed;
    groupRef.current.position.y = initialPos[1] + Math.sin(t) * floatRange;
    groupRef.current.position.x = initialPos[0] + Math.cos(t * 0.7) * (floatRange * 0.4);
    groupRef.current.rotation.y = rotationOffset[1] + Math.sin(t * 0.5) * 0.12;
    groupRef.current.rotation.x = rotationOffset[0] + Math.cos(t * 0.6) * 0.06;
  });

  return (
    <group ref={groupRef} position={initialPos} rotation={rotationOffset}>
      <Center>
        <group scale={normalizedScale * scaleMultiplier}>
          <primitive object={model} />
        </group>
      </Center>
    </group>
  );
}

function DragonParallaxScene({ dragons }: { dragons: DragonData[] }) {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.6, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -0.1 + state.pointer.y * 0.4, 0.05);
    state.camera.lookAt(0, -0.1, 0);
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#ffe0b2" />

      {dragons.map((dragon, idx) => (
        <FloatingDragon key={idx} {...dragon} />
      ))}
    </>
  );
}

/* Single merged Canvas for all dragon layers — avoids 3 separate WebGL contexts */
function DragonCanvasMerged() {
  const allDragons = useMemo(() => [...FAR_DRAGONS, ...MID_DRAGONS, ...NEAR_DRAGONS], []);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, -0.1, 4.5], fov: 32 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <DragonParallaxScene dragons={allDragons} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Cursor Trail Image Item Component
───────────────────────────────────────────── */
interface PopUpImage {
  id: string;
  x: number;
  y: number;
  src: string;
  rotation: number;
}

function CursorTrailImageItem({ item, onRemove }: { item: PopUpImage; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait 3000ms, then trigger pop-out animation
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.img
      src={item.src}
      alt="To He artwork pop-up"
      initial={{ scale: 0, opacity: 0, rotate: item.rotation }}
      animate={
        isExiting
          ? { scale: 0, opacity: 0, rotate: item.rotation }
          : { scale: 1, opacity: 1, rotate: item.rotation }
      }
      transition={
        isExiting
          ? { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
          : { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }
      }
      onAnimationComplete={() => {
        if (isExiting) {
          onRemove(item.id);
        }
      }}
      style={{
        position: 'fixed',
        left: item.x,
        top: item.y,
        transform: 'translate(-50%, -50%)',
        width: 'min(170px, 22vw)',
        height: 'auto',
        maxHeight: '200px',
        objectFit: 'cover',
        borderRadius: 12,
        boxShadow: '0 14px 35px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.1)',
        border: '4px solid #ffffff',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 15,
        willChange: 'transform, opacity',
      }}
    />
  );
}

export default function SectionFour() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reveal, setReveal] = useState(0);
  const [exit, setExit] = useState(0);
  const [trailImages, setTrailImages] = useState<PopUpImage[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleRemoveImage = useCallback((id: string) => {
    setTrailImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    const update = (time: number) => {
      if (time - lastTime < 33) { frame = requestAnimationFrame(update); return; }
      lastTime = time;
      const section = sectionRef.current;
      if (section) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const vh = window.innerHeight;

        // Enter reveal: 0 -> 1 as user scrolls into section
        const revealVal = clamp((scrollTop - (section.offsetTop - vh)) / vh);
        setReveal(revealVal);

        // Exit transition: starts immediately as user scrolls past section.offsetTop
        const exitVal = clamp((scrollTop - section.offsetTop) / (vh * 1.1));
        setExit(exitVal);
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (reveal < 0.6) return;

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (lastPosRef.current) {
        const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
        // Minimum movement threshold: 140px for nice spacing between images
        if (dist < 140) return;
      }

      lastPosRef.current = { x, y };

      const randomSrc = TRAIL_IMAGES[Math.floor(Math.random() * TRAIL_IMAGES.length)];
      const randomRotation = Math.random() * 30 - 15; // -15deg to +15deg

      const newImage: PopUpImage = {
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        src: randomSrc,
        rotation: randomRotation,
      };

      setTrailImages((prev) => [...prev.slice(-7), newImage]); // keep max 8 active in state
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reveal]);

  const isVisible = reveal >= 0.85 && exit < 0.5;

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '160dvh', background: '#f4eee5' }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          background: '#f4eee5',
          transform: `translate3d(0, ${(1 - reveal - exit) * 100}%, 0)`,
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          pointerEvents: 'none',
        }}
      >
        {/* Single merged 3D Canvas for all floating dragons */}
        <DragonCanvasMerged />

        {/* Subtitle: "Move your cursor!" */}
        <h3
          style={{
            position: 'relative',
            zIndex: 10,
            margin: '0 0 14px',
            fontFamily: '"Shadows Into Light", cursive',
            fontSize: 'clamp(26px, 2.6vw, 44px)',
            color: '#3d312b',
            display: 'flex',
            gap: '0.35em',
            justifyContent: 'center',
            alignItems: 'center',
            lineHeight: 1.2,
            fontWeight: 400,
          }}
        >
          {SUBTITLE_WORDS.map((word, i) => (
            <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
              <motion.span
                initial={{ y: '100%', opacity: 0 }}
                animate={isVisible ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h3>

        {/* Main Title: "What have we accomplished?" */}
        <h2
          style={{
            position: 'relative',
            zIndex: 10,
            margin: 0,
            fontFamily: '"Covered By Your Grace", cursive',
            fontSize: 'clamp(52px, 6.5vw, 110px)',
            color: '#211815',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.32em',
            justifyContent: 'center',
            alignItems: 'center',
            lineHeight: 1.1,
            textAlign: 'center',
            fontWeight: 400,
          }}
        >
          {TITLE_WORDS.map((word, i) => (
            <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
              <motion.span
                initial={{ y: '110%', opacity: 0, rotate: 2 }}
                animate={isVisible ? { y: '0%', opacity: 1, rotate: 0 } : { y: '110%', opacity: 0, rotate: 2 }}
                transition={{
                  duration: 0.65,
                  delay: 0.22 + i * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* Interactive Cursor Pop-up Trail Images */}
        {trailImages.map((img) => (
          <CursorTrailImageItem key={img.id} item={img} onRemove={handleRemoveImage} />
        ))}
      </div>
    </section>
  );
}
