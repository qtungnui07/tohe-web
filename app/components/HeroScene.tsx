'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const HERO_CROSSES = [
  ['7%', '13%', 8, 0.12], ['17%', '25%', 11, 0.42], ['29%', '12%', 9, 0.81],
  ['43%', '21%', 8, 0.27], ['58%', '11%', 12, 0.62], ['74%', '18%', 8, 0.98],
  ['88%', '11%', 10, 0.54], ['10%', '46%', 10, 0.76], ['22%', '58%', 8, 0.33],
  ['33%', '72%', 11, 0.72], ['45%', '87%', 8, 0.19], ['57%', '78%', 10, 0.96],
  ['68%', '62%', 9, 0.48], ['80%', '72%', 12, 0.84], ['91%', '48%', 8, 0.24],
  ['14%', '84%', 9, 0.65], ['92%', '86%', 10, 0.39], ['5%', '75%', 8, 1.05],
] as const;

/* ── decorative "+" cross ── */
function Cross({
  x, y, size = 13, delay = 0, show,
}: {
  x: string; y: string; size?: number; delay?: number; show: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={show
        ? { opacity: [0.18, 0.92, 0.3, 0.82, 0.22], scale: [0.72, 1.06, 0.86, 1, 0.8] }
        : { opacity: 0, scale: 0 }}
      transition={{
        duration: 2.6 + delay,
        delay,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0.35 + delay * 0.45,
      }}
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, pointerEvents: 'none' }}
    >
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5,
                    background: 'rgba(255,255,255,0.45)', transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5,
                    background: 'rgba(255,255,255,0.45)', transform: 'translateX(-50%)' }} />
    </motion.div>
  );
}

/* ── shared text style ── */
const TITLE_BASE: React.CSSProperties = {
  position     : 'absolute',
  left         : '48.1%',
  top          : '40.9%',
  transform    : 'translate(-50%, -50%)',
  width        : 'max-content',
  whiteSpace   : 'nowrap',
  fontFamily   : '"BTDanta", sans-serif',
  fontSize     : 'clamp(88px, 22vw, 370px)',
  fontWeight   : 900,
  lineHeight   : 0.8,
  letterSpacing: '-0.07em',
  pointerEvents: 'none',
  userSelect   : 'none',
};

const titleLetters = ['T', 'Ò', ' ', 'H', 'E'];

function NoiseWord({ word, progress, start }: { word: string; progress: number; start: number }) {
  const reveal = Math.min(1, Math.max(0, (progress - start) / 0.09));
  const unsettled = 1 - reveal;

  return (
    <span
      style={{
        display: 'block',
        opacity: reveal,
        transform: `translate3d(${unsettled * -10}px, ${unsettled * 22}px, 0)`,
        filter: `blur(${unsettled * 7}px) contrast(${1 + unsettled * 0.75})`,
        textShadow: unsettled > 0.02
          ? `${unsettled * 4}px 0 rgba(255, 79, 79, ${unsettled * 0.45}), ${unsettled * -3}px 0 rgba(114, 206, 255, ${unsettled * 0.3})`
          : 'none',
        willChange: 'transform, opacity, filter',
      }}
    >
      {word}
    </span>
  );
}

function NoiseHeadline({ words, progress, start }: { words: string[]; progress: number; start: number }) {
  return (
    <h2 style={{ fontSize: 'clamp(28px, 3.3vw, 62px)', lineHeight: 0.93, letterSpacing: '-0.045em' }}>
      {words.map((word, index) => (
        <NoiseWord key={word} word={word} progress={progress} start={start + index * 0.055} />
      ))}
    </h2>
  );
}

function TitleLayer({ outline, show, reduce, opacity }: {
  outline?: boolean; show: boolean; reduce: boolean | null; opacity: number;
}) {
  return (
    <motion.div
      aria-label="Tò he"
      style={{
        ...TITLE_BASE,
        zIndex             : outline ? 3 : 1,
        color              : outline ? 'transparent' : '#ffffff',
        WebkitTextFillColor: outline ? 'transparent' : undefined,
        WebkitTextStroke   : outline ? '1.5px rgba(255,255,255,0.9)' : undefined,
        textShadow         : outline ? 'none' : [
          '0 0 13px rgba(255,255,255,0.75)',
          '0 0 30px rgba(255,255,255,0.45)',
          '0 0 60px rgba(255,255,255,0.20)',
        ].join(', '),
        opacity,
      }}
    >
      {titleLetters.map((letter, index) => (
        <motion.span
          key={`${outline ? 'outline' : 'fill'}-${index}`}
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, y: 44, scale: 0.72 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 44, scale: show ? 1 : 0.72 }}
          transition={{ duration: 0.58, delay: 0.4 + index * 0.09, ease: EASE }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

function useDragonParallax(target: RefObject<HTMLElement | null>) {
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const section = target.current;
      if (section) {
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        scrollYProgress.set(Math.min(1, Math.max(0, (scrollTop - section.offsetTop) / travel)));
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [scrollYProgress, target]);

  // Section two re-centres the model without changing its scale or orientation.
  const y = useTransform(scrollYProgress, [0, 0.22, 0.7, 1], [0, 0, -110, -110]);

  return { y };
}

export default function HeroScene({
  introStarted,
  onModelReady,
}: {
  introStarted: boolean;
  onModelReady: () => void;
}) {
  const reduce   = useReducedMotion();
  const show = introStarted;
  const sectionRef = useRef<HTMLElement>(null);
  const dragonParallax = useDragonParallax(sectionRef);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const section = sectionRef.current;
      if (section) {
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        setProgress(Math.min(1, Math.max(0, (scrollTop - section.offsetTop) / travel)));
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);
  const blend = Math.min(1, progress / 0.34);
  const backgroundColor = `rgb(${Math.round(8 + 101 * blend)}, ${Math.round(8 + 33 * blend)}, ${Math.round(8 + 42 * blend)})`;
  const introOpacity = progress < 0.22 ? 1 : Math.max(0, 1 - (progress - 0.22) / 0.12);
  const sectionOpacity = progress < 0.34 ? 0 : Math.min(1, (progress - 0.34) / 0.16);
  const chapterExit = progress < 0.85 ? 0 : Math.min(1, (progress - 0.85) / 0.12);
  const chapterOpacity = 1 - chapterExit;

  return (
    <section
      ref={sectionRef}
      style={{
        position  : 'relative',
        width     : '100%',
        height    : '280dvh',
        background: '#6d2932',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: backgroundColor }} />
      <div style={{ position: 'sticky', top: 0, height: '100dvh', overflow: 'hidden' }}>

      {/* ─────────────────────────────────────────────
          LAYER 1 (z=1)  ←  chữ TRẮNG GLOW, phía SAU model
      ───────────────────────────────────────────── */}
      <TitleLayer show={show} reduce={reduce} opacity={introOpacity} />

      {/* ─────────────────────────────────────────────
          LAYER 2 (z=2)  ←  model 3D — giữ nguyên hoàn toàn
      ───────────────────────────────────────────── */}
      <motion.div
        style={{
          position     : 'absolute',
          inset        : 0,
          zIndex       : 2,
          pointerEvents: 'none',
          y            : dragonParallax.y,
          transformOrigin: 'center 58%',
          opacity      : chapterOpacity,
          filter       : `blur(${chapterExit * 10}px)`,
        }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: '38vh', scale: 0.96 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : '38vh', scale: show ? 1 : 0.96 }}
          transition={{ duration: 1.15, delay: 0.04, ease: EASE }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <ModelViewer
            onReady={onModelReady}
            interactive={progress < 0.24}
            sectionTwo={progress >= 0.24}
          />
        </motion.div>
      </motion.div>

      {/* ─────────────────────────────────────────────
          LAYER 3 (z=3)  ←  chữ OUTLINE, phía TRƯỚC model
          color: transparent, chỉ stroke, không fill
      ───────────────────────────────────────────── */}
      <TitleLayer outline show={show} reduce={reduce} opacity={introOpacity} />

      {/* ─────────────────────────────────────────────
          LAYER 4 (z=4)  ←  tagline + decoration
      ───────────────────────────────────────────── */}

      {/* Tagline — phía trên bên phải */}
      <motion.div style={{ position: 'absolute', inset: 0, zIndex: 4, opacity: introOpacity, pointerEvents: 'none' }}>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.92 } as const}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20, scale: show ? 1 : 0.92 }}
        transition={{ duration: 0.72, delay: 0.9, ease: EASE }}
        style={{
          position     : 'absolute',
          zIndex       : 4,
          top          : '16.5%',
          right        : '19.8%',
          margin       : 0,
          fontFamily   : '"BTDanta", sans-serif',
          fontSize     : 'clamp(14px, 1.8vw, 28px)',
          fontWeight   : 800,
          letterSpacing: '0.16em',
          paddingLeft  : '0.16em',
          textTransform: 'uppercase',
          color        : 'rgba(255,255,255,0.85)',
          whiteSpace   : 'nowrap',
          pointerEvents: 'none',
          userSelect   : 'none',
        }}
      >
        Đôi tay nặn hồn Việt
      </motion.p>
      </motion.div>

      <div style={{ position: 'absolute', zIndex: 4, left: 'clamp(22px, 8vw, 160px)', top: '47%', width: 'min(21vw, 270px)', opacity: chapterOpacity, filter: `blur(${chapterExit * 9}px)`, transform: `translateY(${18 - progress * 36}px)`, pointerEvents: 'none' }}>
        <p style={{ fontSize: 'clamp(12px, 1vw, 15px)', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: sectionOpacity * 0.7, marginBottom: 16 }}>Sắc màu dân gian</p>
        <NoiseHeadline words={['Nặn', 'từng', 'nét', 'sống.']} progress={progress} start={0.36} />
      </div>
      <div style={{ position: 'absolute', zIndex: 4, right: 'clamp(22px, 8vw, 160px)', top: '29%', width: 'min(21vw, 270px)', textAlign: 'right', opacity: chapterOpacity, filter: `blur(${chapterExit * 9}px)`, transform: `translateY(${-18 + progress * 36}px)`, pointerEvents: 'none' }}>
        <p style={{ fontSize: 'clamp(12px, 1vw, 15px)', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: sectionOpacity * 0.7, marginBottom: 16 }}>Một hồn Việt</p>
        <NoiseHeadline words={['Giữ', 'trong', 'đầu', 'ngón', 'tay.']} progress={progress} start={0.48} />
      </div>

      {/* Decorative crosses */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', opacity: introOpacity }}>
        {HERO_CROSSES.map(([x, y, size, delay], index) => (
          <Cross key={index} x={x} y={y} size={size} delay={delay} show={show} />
        ))}
      </div>

      </div>

    </section>
  );
}
