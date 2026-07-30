'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

/*
 * Taste-skill compliant feedback form.
 * Single accent: #f5f0e8 (warm white, matching page color token).
 * Dark theme locked to page bg #0a0a0a.
 * No AI-blue, no emerald second accent, no decorative grids/glows.
 * Label above input (4.6). Motivated motion only.
 * Shape: all-sharp (radius 0) to match the editorial craft tone.
 */

const ACCENT = '#f5f0e8';

export default function CraftFeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus('submitting');

    const start = performance.now();
    const duration = 1400;
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      progress.set(1 - Math.pow(1 - t, 3));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setStatus('success');
      }
    };
    requestAnimationFrame(tick);
  };

  const reset = () => {
    setName('');
    setEmail('');
    setMessage('');
    progress.set(0);
    setStatus('idle');
  };

  const inputClasses =
    'w-full bg-transparent border-b border-[#f5f0e8]/20 py-3 text-[15px] text-[#f5f0e8] placeholder:text-[#f5f0e8]/25 outline-none transition-colors duration-200 focus:border-[#f5f0e8]/60';

  return (
    <section className="relative z-30 w-full py-28 sm:py-36 px-4 sm:px-6 flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <h2
            className="text-3xl sm:text-4xl tracking-tight font-bold leading-[1.15]"
            style={{ color: ACCENT }}
          >
            Lời nhắn gửi nghệ nhân
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#f5f0e8]/40 max-w-[42ch]">
            Nếu bạn có một lời nhắn dành cho những nghệ nhân Tò he, hãy để lại tại đây.
          </p>
        </motion.div>

        {/* Form area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {/* IDLE */}
            {status === 'idle' && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="fb-name"
                    className="block text-[11px] uppercase tracking-[0.16em] text-[#f5f0e8]/50"
                  >
                    Họ tên
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClasses}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="fb-email"
                    className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.16em] text-[#f5f0e8]/50"
                  >
                    Email
                    <span className="normal-case tracking-normal text-[10px] text-[#f5f0e8]/25">
                      (không bắt buộc)
                    </span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="fb-msg"
                    className="block text-[11px] uppercase tracking-[0.16em] text-[#f5f0e8]/50"
                  >
                    Chia sẻ cảm nghĩ
                  </label>
                  <textarea
                    id="fb-msg"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputClasses} resize-none`}
                    placeholder="Viết gì đó cho nghệ nhân..."
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] border border-[#f5f0e8] text-[#0a0a0a] bg-[#f5f0e8] hover:bg-transparent hover:text-[#f5f0e8]"
                  >
                    Gửi lời nhắn
                  </button>
                </div>
              </motion.form>
            )}

            {/* SUBMITTING */}
            {status === 'submitting' && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="py-24 flex flex-col items-center justify-center gap-5"
              >
                <div className="w-48 h-px bg-[#f5f0e8]/10 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ width: progressWidth, backgroundColor: ACCENT }}
                  />
                </div>
                <p className="text-[13px] text-[#f5f0e8]/30 tracking-wide">
                  Đang gửi...
                </p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="py-20 flex flex-col items-center text-center gap-6"
              >
                {/* Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                  className="w-14 h-14 border border-[#f5f0e8]/30 flex items-center justify-center"
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke={ACCENT}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </motion.svg>
                </motion.div>

                <div className="space-y-2">
                  <h3
                    className="text-lg font-semibold tracking-tight"
                    style={{ color: ACCENT }}
                  >
                    Cảm ơn bạn
                  </h3>
                  <p className="text-sm text-[#f5f0e8]/35 max-w-xs leading-relaxed">
                    Mỗi lời chia sẻ là một cách để giữ gìn nét đẹp văn hóa Việt.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 px-5 py-2 text-xs tracking-[0.1em] uppercase border border-[#f5f0e8]/20 text-[#f5f0e8]/50 hover:text-[#f5f0e8] hover:border-[#f5f0e8]/50 transition-colors duration-200"
                >
                  Gửi thêm nhận xét khác
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
