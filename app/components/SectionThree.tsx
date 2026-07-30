'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const NIGHT_CROSSES = [
  ['7%', '12%', 8, 0.1], ['25%', '9%', 8, 0.76],
  ['49%', '8%', 8, 0.92], ['77%', '10%', 9, 0.34],
  ['19%', '70%', 11, 0.18], ['43%', '72%', 10, 0.41],
  ['70%', '65%', 12, 0.29], ['93%', '52%', 10, 0.53],
  ['5%', '88%', 8, 0.87], ['88%', '91%', 11, 0.38],
] as const;

const TOPICS = [
  {
    title: 'Giới thiệu ngắn',
    text: 'Ở Xuân La, tò he là những hình nặn nhỏ từ bột gạo, được nhuộm màu và tạo tác ngay trước mắt người xem. Con giống, hoa lá hay nhân vật cổ tích đều trở thành một món đồ chơi dân gian giàu tưởng tượng.',
  },
  {
    title: 'Nguồn gốc',
    text: 'Theo ký ức của các bậc cao niên, nghề nặn ở Xuân La đã tồn tại khoảng 300–400 năm. Từ những con giống bột gắn với nghi lễ, người thợ đã phát triển chúng thành tò he rực rỡ, gắn trên một que tre nhỏ.',
  },
  {
    title: 'Giá trị văn hóa',
    text: 'Tò he lưu giữ kỹ năng tạo hình thủ công, màu sắc dân gian và ký ức tuổi thơ Việt. Nghệ nhân Xuân La vẫn truyền nghề, đồng thời đưa tò he vào trải nghiệm học đường, lễ hội và du lịch văn hóa.',
  },
] as const;

const CURVE_WORDS = [
  { word: 'TÒ', offset: '28%' },
  { word: 'HE', offset: '42%' },
  { word: 'LÀ', offset: '56%' },
  { word: 'GÌ?', offset: '72%' },
] as const;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function NightCross({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.12, 0.62, 0.2, 0.52, 0.12], scale: [0.75, 1, 0.86, 1.05, 0.75] }}
      transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, display: 'block' }}
    >
      <i style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'rgba(255,255,255,0.7)' }} />
      <i style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.7)' }} />
    </motion.span>
  );
}

function TopicSlide({ topic, index, progress, chapterExit }: { topic: (typeof TOPICS)[number]; index: number; progress: number; chapterExit: number }) {
  const start = 0.16 + index * 0.27;
  const enter = clamp((progress - start) / 0.1);
  const exit = index === TOPICS.length - 1 ? 0 : clamp((progress - (start + 0.2)) / 0.1);
  const direction = index % 2 === 0 ? 1 : -1;
  const opacity = enter * (1 - exit) * (1 - chapterExit);
  const x = direction * ((1 - enter) * 72 + exit * -72 + chapterExit * 80);

  return (
    <article
      style={{
        position: 'fixed',
        zIndex: 8,
        top: '50%',
        [direction === 1 ? 'right' : 'left']: 'clamp(24px, 8vw, 154px)',
        width: 'min(25vw, 360px)',
        color: '#f7f0e5',
        opacity,
        transform: `translate3d(${x}px, -50%, 0)`,
        filter: `blur(${(1 - opacity) * 7}px)`,
        pointerEvents: 'none',
        willChange: 'transform, opacity, filter',
      }}
    >
      <p style={{ margin: '0 0 12px', fontFamily: '"BTDanta", sans-serif', fontSize: 'clamp(22px, 2.35vw, 40px)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 800 }}>
        {topic.title}
      </p>
      <p style={{ margin: 0, maxWidth: '34ch', fontSize: 'clamp(13px, 1.05vw, 17px)', lineHeight: 1.55, color: 'rgba(247,240,229,0.72)' }}>
        {topic.text}
      </p>
      <div style={{ width: '100%', height: 1, marginTop: 18, background: 'rgba(247,240,229,0.35)', transformOrigin: direction === 1 ? 'right' : 'left', transform: `scaleX(${enter * (1 - exit)})` }} />
    </article>
  );
}

export default function SectionThree() {
  const sectionRef = useRef<HTMLElement>(null);
  const [enter, setEnter] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    const update = (time: number) => {
      if (time - lastTime < 33) { frame = requestAnimationFrame(update); return; }
      lastTime = time;
      const section = sectionRef.current;
      if (section) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const distance = window.innerHeight * 1.1;
        const start = section.offsetTop - distance;
        setEnter(clamp((scrollTop - start) / distance));

        const scrollableHeight = Math.max(1, section.offsetHeight - window.innerHeight);
        setSectionProgress(clamp((scrollTop - section.offsetTop) / scrollableHeight));
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  const y = (1 - enter) * 82;
  const rotation = (1 - enter) * -38 + sectionProgress * 150;
  const circleOpacity = clamp((sectionProgress - 0.035) / 0.1);
  const chapterExit = clamp((sectionProgress - 0.80) / 0.20);

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '420dvh', background: '#080808' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none', opacity: sectionProgress > 0 ? 1 : 0 }}>
        {NIGHT_CROSSES.map(([x, yPos, size, delay], index) => (
          <NightCross key={index} x={x} y={yPos} size={size} delay={delay} />
        ))}
      </div>

      <div style={{ position: 'fixed', inset: 0, zIndex: 6, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <img
          src="/4.webp"
          alt="Những con tò he trong giỏ tre"
          style={{
            width: 'min(86vw, 1120px)',
            height: 'auto',
            opacity: enter * (1 - chapterExit),
            transform: `translate3d(0, ${y + chapterExit * 35}vh, 0) rotate(${rotation}deg)`,
            willChange: 'transform, opacity',
            filter: `drop-shadow(0 28px 55px rgba(0,0,0,${0.25 + enter * 0.33}))`,
          }}
        />
      </div>

      <svg
        aria-label="Tò he là gì?"
        viewBox="0 0 600 600"
        style={{ position: 'fixed', zIndex: 7, left: '50%', top: '50%', width: 'min(72vw, 1280px)', transform: `translate(-50%, ${-50 + chapterExit * 35}%)`, overflow: 'visible', opacity: circleOpacity * (1 - chapterExit), pointerEvents: 'none' }}
      >
        <path id="tohe-question-arc" d="M 72 310 A 238 238 0 0 1 528 310" fill="none" />
        {CURVE_WORDS.map(({ word, offset }, index) => {
          const reveal = clamp((sectionProgress - 0.045 - index * 0.038) / 0.085);
          return (
            <text
              key={word}
              fill="#f7f0e5"
              style={{
                fontFamily: '"BTDanta", sans-serif',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '0.1em',
                opacity: reveal,
                transform: `translateY(${(1 - reveal) * 18}px) scale(${0.72 + reveal * 0.28})`,
                transformBox: 'fill-box',
                transformOrigin: 'center',
                filter: `blur(${(1 - reveal) * 4}px)`,
                willChange: 'transform, opacity, filter',
              }}
            >
              <textPath href="#tohe-question-arc" startOffset={offset} textAnchor="middle">{word}</textPath>
            </text>
          );
        })}
      </svg>

      {TOPICS.map((topic, index) => <TopicSlide key={topic.title} topic={topic} index={index} progress={sectionProgress} chapterExit={chapterExit} />)}
    </section>
  );
}
