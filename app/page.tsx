'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ModelViewer   = dynamic(() => import('@/app/components/ModelViewer'),   { ssr: false });
const LoadingScreen = dynamic(() => import('@/app/components/LoadingScreen'), { ssr: false });

export default function Home() {
  const [phase,       setPhase]       = useState<'loading' | 'fading' | 'done'>('loading');
  const [heroVisible, setHeroVisible] = useState(false);

  const handleReady = useCallback(() => {
    setPhase('fading');
    setTimeout(() => setPhase('done'), 950);
  }, []);

  // Once ModelViewer mounts (phase === 'done'), trigger fade-in next frame
  useEffect(() => {
    if (phase === 'done') {
      requestAnimationFrame(() => setHeroVisible(true));
    }
  }, [phase]);

  return (
    <main
      style={{
        width    : '100vw',
        height   : '100vh',
        position : 'relative',
        overflow : 'hidden',
        background: '#0a0a0a',
      }}
    >
      {/* Hero model — fades in after loading screen is gone */}
      {phase === 'done' && (
        <div
          style={{
            position   : 'absolute',
            inset      : 0,
            opacity    : heroVisible ? 1 : 0,
            transition : 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange : 'opacity',
          }}
        >
          <ModelViewer />
        </div>
      )}

      {/* Loading overlay */}
      {phase !== 'done' && (
        <LoadingScreen
          visible={phase === 'loading'}
          onReady={handleReady}
        />
      )}
    </main>
  );
}

