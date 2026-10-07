'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCardProps {
  imageSrc: string;
  label: string;
  className: string;
  floatY: number[];
  floatDuration: number;
  floatDelay?: number;
  rotateDeg?: number;
}

function FloatingCard({
  imageSrc,
  label,
  className,
  floatY,
  floatDuration,
  floatDelay = 0,
  rotateDeg = 0,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      drag
      dragSnapToOrigin={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: 'grabbing' }}
      className={`absolute ${className} z-40 touch-none cursor-grab`}
    >
      <motion.div
        animate={{ y: floatY, rotate: [rotateDeg, rotateDeg + 1.5, rotateDeg] }}
        transition={{
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.05,
          rotate: rotateDeg > 0 ? rotateDeg + 3 : rotateDeg - 3,
        }}
        className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#FDFBF7] shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-amber-100/70 w-48 sm:w-64 md:w-80 select-none"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 pointer-events-none">
          <img
            src={imageSrc}
            alt={label}
            draggable={false}
            className="h-full w-full object-cover select-none"
          />
          {/* Capsule Label Overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[88%] px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-sm border border-white/60 text-center">
            <span
              className="block text-xs sm:text-sm font-semibold tracking-wide text-stone-800 truncate"
              style={{ fontFamily: '"Shadows Into Light", cursive, sans-serif' }}
            >
              {label}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SectionFive({
  onVideoStateChange,
}: {
  onVideoStateChange?: (isPlayingVideo: boolean) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
      onVideoStateChange?.(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
      setShowControls(false);
      onVideoStateChange?.(true);
    }
  };

  return (
    <section className="relative z-30 w-full min-h-screen bg-[#F9F6F0] py-20 px-4 sm:px-8 md:px-12 overflow-hidden flex flex-col justify-center items-center">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Showcase Container (Larger Scale max-w-7xl) */}
      <div className="relative w-full max-w-7xl mx-auto px-2">
        {/* Main Centerpiece (Video Canvas) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => {
            if (isPlaying) setShowControls(false);
          }}
          onClick={togglePlay}
          className="relative w-full aspect-video rounded-2xl sm:rounded-3xl md:rounded-[36px] overflow-hidden shadow-2xl bg-stone-900 border-4 border-white/80 cursor-pointer group"
        >
          <video
            ref={videoRef}
            loop
            playsInline
            preload="metadata"
            poster="/video-poster.jpg"
            onLoadedData={() => setVideoReady(true)}
            onError={(e) => {
              const vid = e.currentTarget;
              // Fallback: if compressed version fails, try original
              if (vid.src.includes('-web.mp4')) {
                vid.src = '/to-hehehehe.mp4';
              } else {
                setVideoError(true);
              }
            }}
            className="w-full h-full object-cover"
          >
            <source src="/to-hehehehe-web.mp4" type="video/mp4" />
            <source src="/to-hehehehe.mp4" type="video/mp4" />
          </video>

          {/* Loading / Error state */}
          {!videoReady && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white/60 text-sm font-medium tracking-wide">Đang tải video…</span>
              </div>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-20">
              <span className="text-white/50 text-sm">Không thể tải video</span>
            </div>
          )}

          {/* Icon-Only Center Play / Pause Button */}
          <AnimatePresence>
            {(showControls || !isPlaying) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/40 hover:bg-white/65 backdrop-blur-md border border-white/70 shadow-2xl flex items-center justify-center text-white transition-all duration-300 transform group-hover:scale-110">
                  {isPlaying ? (
                    <svg className="w-7 h-7 sm:w-9 sm:h-9 text-stone-900 fill-current" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-stone-900 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Product Cards */}
        <FloatingCard
          imageSrc="/imgs/2aOboQo24zMJHedRa7StLO10lRdadV3gKDCgQCoa.webp"
          label="Tò He Rồng Thiêng"
          className="-left-6 sm:-left-16 md:-left-20 top-1/4 z-20"
          floatY={[0, -12, 0]}
          floatDuration={4.2}
          rotateDeg={-3}
        />

        <FloatingCard
          imageSrc="/imgs/2aOboQo25brRWyPQqVTd2dtFl2v9TS4tVyrsRnaS.webp"
          label="Nghệ Thuật Xuân La"
          className="-right-6 sm:-right-16 md:-right-20 top-6 sm:top-10 z-20"
          floatY={[0, 14, 0]}
          floatDuration={3.8}
          floatDelay={0.5}
          rotateDeg={4}
        />

        <FloatingCard
          imageSrc="/imgs/IMG_5118.webp"
          label="Tò He & Cà Phê"
          className="-right-4 sm:-right-10 md:-right-14 -bottom-6 sm:-bottom-10 z-20"
          floatY={[0, -10, 0]}
          floatDuration={4.6}
          floatDelay={1}
          rotateDeg={-2}
        />
      </div>
    </section>
  );
}
