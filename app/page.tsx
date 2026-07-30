'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const HeroScene    = dynamic(() => import('@/app/components/HeroScene'),    { ssr: false });
const LoadingScreen = dynamic(() => import('@/app/components/LoadingScreen'), { ssr: false });
const SectionThree  = dynamic(() => import('@/app/components/SectionThree'), { ssr: false });
const SectionFour   = dynamic(() => import('@/app/components/SectionFour'), { ssr: false });
const SectionFive   = dynamic(() => import('@/app/components/SectionFive'), { ssr: false });
const CraftFeedbackForm = dynamic(() => import('@/app/components/CraftFeedbackForm'), { ssr: false });

export default function Home() {
  const [phase,      setPhase]      = useState<'enter' | 'loading' | 'fading' | 'done'>('enter');
  const [modelReady, setModelReady] = useState(false);
  const [assetProgress, setAssetProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [enterHov,   setEnterHov]   = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startExperience = useCallback(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error('Audio playback failed:', err);
      });
    }
    setPhase('loading');
  }, []);

  const handleVideoStateChange = useCallback((isPlayingVideo: boolean) => {
    if (audioRef.current) {
      if (isPlayingVideo) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    let cancelled = false;
    const report = (complete: number, total: number) => {
      if (!cancelled) setAssetProgress(Math.round((complete / total) * 75));
    };
    const loadImage = (src: string) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
    });
    const waitForAudio = (audio: HTMLAudioElement | null) => new Promise<void>((resolve) => {
      if (!audio || audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve();
        return;
      }
      const finish = () => {
        audio.removeEventListener('loadeddata', finish);
        audio.removeEventListener('error', finish);
        resolve();
      };
      audio.addEventListener('loadeddata', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
    });

    const tasks = [
      loadImage('/4.webp'),
      loadImage('/Logo-Dai-hoc-CMC-V.webp'),
      waitForAudio(audioRef.current),
    ];
    report(0, tasks.length);
    let complete = 0;
    tasks.forEach((task) => {
      void task.then(() => {
        complete += 1;
        report(complete, tasks.length);
        if (complete === tasks.length && !cancelled) setAssetsReady(true);
      });
    });

    return () => { cancelled = true; };
  }, [phase]);

  const handleReady = useCallback(() => {
    setPhase('fading');
    setTimeout(() => setPhase('done'), 950);
  }, []);

  return (
    <main
      style={{
        width     : '100vw',
        minHeight : '100dvh',
        position  : 'relative',
        background: '#0a0a0a',
      }}
    >
      {phase !== 'enter' && (
        <HeroScene
          introStarted={phase === 'done'}
          onModelReady={() => setModelReady(true)}
        />
      )}

      {phase !== 'enter' && <img
        src="/Logo-Dai-hoc-CMC-V.webp"
        alt="Đại học CMC"
        style={{
          position: 'fixed',
          top: 'clamp(10px, 4vw, 20px)',
          right: 'clamp(10px, 4vw, 30px)',
          scale: 'clamp(0.5, 1vw, 0.2)',
          zIndex: 20,
          width: 'clamp(48px, 4.5vw, 76px)',
          height: 'auto',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />}

      {phase === 'enter' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'grid',
            placeItems: 'center',
            background: '#050505',
          }}
        >
          <button
            type="button"
            onClick={startExperience}
            onMouseEnter={() => setEnterHov(true)}
            onMouseLeave={() => setEnterHov(false)}
            aria-label="Enter experience and play music"
            style={{
              borderWidth  : '1px',
              borderStyle  : 'solid',
              borderRadius : 999,
              background   : 'transparent',
              color        : '#fff',
              padding      : '0.6em 1.8em',
              fontFamily   : '"BTDanta", sans-serif',
              fontWeight   : 800,
              fontSize     : 'clamp(12px, 0.85vw, 18px)',
              letterSpacing: '0.23em',
              lineHeight   : 1,
              cursor       : 'pointer',
              textShadow   : '0 0 12px rgba(255,255,255,.9), 0 0 32px rgba(255,255,255,.55)',
              transform    : enterHov ? 'scale(1.07)' : 'scale(1)',
              transition   : 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation    : 'argbBorder 5s linear infinite',
            }}
          >
            ENTER
          </button>
          <style>{`
            @keyframes argbBorder {
              0%   { border-color: rgba(255, 80,  80,  0.7); box-shadow: 0 0 30px rgba(255, 80,  80,  0.16), inset 0 0 22px rgba(255, 80,  80,  0.06); }
              25%  { border-color: rgba(80,  220, 120, 0.7); box-shadow: 0 0 30px rgba(80,  220, 120, 0.16), inset 0 0 22px rgba(80,  220, 120, 0.06); }
              50%  { border-color: rgba(80,  140, 255, 0.7); box-shadow: 0 0 30px rgba(80,  140, 255, 0.16), inset 0 0 22px rgba(80,  140, 255, 0.06); }
              75%  { border-color: rgba(210, 80,  255, 0.7); box-shadow: 0 0 30px rgba(210, 80,  255, 0.16), inset 0 0 22px rgba(210, 80,  255, 0.06); }
              100% { border-color: rgba(255, 80,  80,  0.7); box-shadow: 0 0 30px rgba(255, 80,  80,  0.16), inset 0 0 22px rgba(255, 80,  80,  0.06); }
            }
          `}</style>
        </div>
      )}

      {/* Loading overlay */}
      {phase !== 'enter' && phase !== 'done' && (
        <LoadingScreen
          visible={phase === 'loading'}
          modelReady={modelReady}
          assetsReady={assetsReady}
          assetProgress={assetProgress}
          onReady={handleReady}
        />
      )}

      {phase !== 'enter' && <SectionThree />}
      {phase !== 'enter' && <SectionFour />}
      {phase !== 'enter' && <SectionFive onVideoStateChange={handleVideoStateChange} />}
      {phase !== 'enter' && <CraftFeedbackForm />}

    </main>
  );
}
