'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ModelViewer from './ModelViewer';

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const modelScale = useTransform(scrollYProgress, [0, 1], [1.04, 0.62]);
  const modelY = useTransform(scrollYProgress, [0, 1], ['3vh', '-3vh']);
  const leftTextY = useTransform(scrollYProgress, [0, 1], ['14px', '-18px']);
  const rightTextY = useTransform(scrollYProgress, [0, 1], ['-14px', '18px']);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '190dvh',
        background: '#6d2932',
        color: '#fff7ed',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            scale: modelScale,
            y: modelY,
            transformOrigin: 'center 58%',
            pointerEvents: 'none',
          }}
        >
          <ModelViewer />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            zIndex: 2,
            left: 'clamp(22px, 8vw, 160px)',
            top: '47%',
            width: 'min(21vw, 270px)',
            y: leftTextY,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: 'clamp(12px, 1vw, 15px)', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 16 }}>
            Sắc màu dân gian
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.3vw, 62px)', lineHeight: 0.93, letterSpacing: '-0.045em' }}>
            Nặn từng<br />nét sống.
          </h2>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            zIndex: 2,
            right: 'clamp(22px, 8vw, 160px)',
            top: '29%',
            width: 'min(21vw, 270px)',
            textAlign: 'right',
            y: rightTextY,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: 'clamp(12px, 1vw, 15px)', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 16 }}>
            Một hồn Việt
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.3vw, 62px)', lineHeight: 0.93, letterSpacing: '-0.045em' }}>
            Giữ trong<br />đầu ngón tay.
          </h2>
        </motion.div>

        <p style={{ position: 'absolute', zIndex: 2, bottom: '5%', left: '50%', transform: 'translateX(-50%)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.62, whiteSpace: 'nowrap' }}>
          Cuộn để thu nhỏ
        </p>
      </div>
    </section>
  );
}
