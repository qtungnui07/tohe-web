'use client';

import { useState, useRef, FormEvent } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

/* ── Reusable input wrapper with focus glow ── */
function FormField({
  children,
  label,
  htmlFor,
  optional,
  delay = 0,
}: {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  optional?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.18em] font-medium text-slate-400"
      >
        {label}
        {optional && (
          <span className="normal-case tracking-normal text-slate-600 text-[10px] font-normal">
            (không bắt buộc)
          </span>
        )}
      </label>
      {children}
    </motion.div>
  );
}

export default function CraftFeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus('submitting');

    const start = performance.now();
    const duration = 1600;
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

  /* shared input box classes */
  const inputBase =
    'w-full bg-slate-900/50 border border-slate-700/60 rounded-lg px-4 py-3.5 text-[15px] text-slate-100 placeholder:text-slate-600 transition-all duration-300 outline-none';
  const inputFocus =
    'focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 focus:bg-slate-900/80';

  return (
    <section className="relative z-30 w-full py-28 sm:py-36 px-4 sm:px-6 flex flex-col items-center justify-center overflow-hidden bg-[#0c0e14]">
      {/* Subtle geometric grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-sky-500/[0.03] blur-[140px]" />

      <div className="relative w-full max-w-lg mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white font-bold leading-[1.15]">
            Lời nhắn gửi nghệ nhân
          </h2>
          <p className="mt-4 text-sm sm:text-[15px] text-slate-400 max-w-[44ch] mx-auto leading-relaxed">
            Nếu bạn có một lời nhắn dành cho những nghệ nhân Tò he, hãy để lại tại đây.
          </p>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-xl border border-slate-800/70 bg-[#111318]/80 backdrop-blur-md shadow-2xl shadow-black/40"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

          <div className="p-7 sm:p-10">
            <AnimatePresence mode="wait">
              {/* ── IDLE: Form ── */}
              {status === 'idle' && (
                <motion.form
                  ref={formRef}
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name */}
                  <FormField label="Họ tên" htmlFor="fb-name" delay={0.05}>
                    <div className="relative">
                      <input
                        id="fb-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${inputFocus}`}
                        placeholder="Nguyễn Văn A"
                      />
                      {/* Focus glow */}
                      {focusedField === 'name' && (
                        <motion.div
                          layoutId="field-glow"
                          className="absolute -inset-px rounded-lg border border-sky-500/30 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                  </FormField>

                  {/* Email */}
                  <FormField label="Email" htmlFor="fb-email" optional delay={0.1}>
                    <div className="relative">
                      <input
                        id="fb-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${inputFocus}`}
                        placeholder="email@example.com"
                      />
                      {focusedField === 'email' && (
                        <motion.div
                          layoutId="field-glow"
                          className="absolute -inset-px rounded-lg border border-sky-500/30 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                  </FormField>

                  {/* Message */}
                  <FormField label="Chia sẻ cảm nghĩ" htmlFor="fb-msg" delay={0.15}>
                    <div className="relative">
                      <textarea
                        id="fb-msg"
                        required
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setFocusedField('msg')}
                        onBlur={() => setFocusedField(null)}
                        className={`${inputBase} ${inputFocus} resize-none`}
                        placeholder="Viết gì đó cho nghệ nhân..."
                      />
                      {focusedField === 'msg' && (
                        <motion.div
                          layoutId="field-glow"
                          className="absolute -inset-px rounded-lg border border-sky-500/30 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                  </FormField>

                  {/* Divider */}
                  <div className="pt-2">
                    <div className="h-px bg-slate-800/60" />
                  </div>

                  {/* Submit */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-1"
                  >
                    <button
                      type="submit"
                      className="group relative w-full py-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] overflow-hidden"
                    >
                      {/* Button shimmer on hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      <span className="relative">Gửi lời nhắn</span>
                    </button>
                  </motion.div>
                </motion.form>
              )}

              {/* ── SUBMITTING ── */}
              {status === 'submitting' && (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-24 flex flex-col items-center justify-center gap-5 text-center"
                >
                  <div className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <p className="text-slate-500 text-sm tracking-wide">
                    Đang gửi lời nhắn...
                  </p>
                </motion.div>
              )}

              {/* ── SUCCESS ── */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="py-20 px-4 flex flex-col items-center text-center gap-5"
                >
                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                    className="w-16 h-16 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center"
                  >
                    <motion.svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="#34d399"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </motion.svg>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white tracking-tight">
                      Cảm ơn bạn
                    </h3>
                    <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                      Mỗi lời chia sẻ là một cách để giữ gìn nét đẹp văn hóa Việt.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    className="mt-4 px-5 py-2 rounded-lg border border-slate-700/60 bg-slate-800/40 text-xs tracking-[0.1em] uppercase text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-300"
                  >
                    Gửi thêm nhận xét khác
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom decorative line */}
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-px bg-slate-800" />
        </div>
      </div>
    </section>
  );
}
