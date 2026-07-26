import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIBrainSlide({ onNext, onPrev }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">

      {/* Back / Next nav */}
      <motion.button
        onClick={onPrev}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors">Back</span>
      </motion.button>

      {/* ── PHASE 1: brain only ── */}
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="brain-only"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 cursor-pointer select-none"
            onClick={() => setExpanded(true)}
          >
            {/* Brain SVG */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,13,153,0.5))' }}
            >
              <BrainSVG size={220} />
            </motion.div>

            {/* AI label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-mono font-extrabold tracking-[0.6em] text-white uppercase pl-[0.6em]"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
            >
              AI
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="font-mono text-[10px] tracking-[0.4em] text-white/25 uppercase"
            >
              click the brain
            </motion.p>
          </motion.div>

        ) : (

          /* ── PHASE 2: human form + side panel ── */
          <motion.div
            key="human-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-16 w-full h-full px-12"
          >
            {/* Human figure with brain visible */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: 'drop-shadow(0 0 40px rgba(255,13,153,0.35))' }}
            >
              <HumanWithBrainSVG />
            </motion.div>

            {/* Side panel */}
            <motion.div
              initial={{ opacity: 0, x: 60, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-sm flex flex-col gap-5"
            >
              <div className="w-8 h-[2px] bg-[#FF0D99] rounded-full" />
              <p className="font-mono text-white/90 text-lg md:text-xl font-light leading-relaxed">
                <span className="text-white font-semibold">AI alone is just a brain.</span>
              </p>
              <p className="font-mono text-white/60 text-base md:text-lg font-light leading-relaxed">
                To use it, we need an interface, a body or something the user will actually interact with.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next arrow — appears after expansion */}
      <AnimatePresence>
        {expanded && (
          <motion.button
            key="next-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            onClick={onNext}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] group"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[8px] tracking-[0.4em] text-white/30 uppercase group-hover:text-white/60 transition-colors">
                Continue
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
                <path d="M7 10l5 5 5-5" />
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Brain SVG ── */
function BrainSVG({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left hemisphere */}
      <path d="M50 20 C30 18, 14 28, 14 45 C14 55, 18 62, 26 67 C24 72, 26 80, 34 82 C36 88, 42 90, 48 88 L48 20 Z"
        fill="#FF0D99" fillOpacity="0.15" stroke="#FF0D99" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Right hemisphere */}
      <path d="M50 20 C70 18, 86 28, 86 45 C86 55, 82 62, 74 67 C76 72, 74 80, 66 82 C64 88, 58 90, 52 88 L52 20 Z"
        fill="#FF0D99" fillOpacity="0.15" stroke="#FF0D99" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Centre line */}
      <line x1="50" y1="20" x2="50" y2="88" stroke="#FF0D99" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.5" />
      {/* Gyri lines left */}
      <path d="M26 40 C32 36, 38 38, 42 42" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      <path d="M20 52 C28 48, 36 50, 42 56" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      <path d="M26 64 C32 60, 40 62, 44 66" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      {/* Gyri lines right */}
      <path d="M74 40 C68 36, 62 38, 58 42" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      <path d="M80 52 C72 48, 64 50, 58 56" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      <path d="M74 64 C68 60, 60 62, 56 66" stroke="#FF0D99" strokeWidth="0.9" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      {/* Glow dot centre */}
      <circle cx="50" cy="54" r="3.5" fill="#FF0D99" fillOpacity="0.9" />
      <circle cx="50" cy="54" r="6" fill="#FF0D99" fillOpacity="0.2" />
    </svg>
  )
}

/* ── Human body with visible brain SVG ── */
function HumanWithBrainSVG() {
  return (
    <svg width="220" height="480" viewBox="0 0 110 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head outline */}
      <ellipse cx="55" cy="32" rx="22" ry="26" fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Brain inside head */}
      <g transform="translate(43, 14) scale(0.24)">
        <path d="M50 20 C30 18, 14 28, 14 45 C14 55, 18 62, 26 67 C24 72, 26 80, 34 82 C36 88, 42 90, 48 88 L48 20 Z"
          fill="#FF0D99" fillOpacity="0.25" stroke="#FF0D99" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M50 20 C70 18, 86 28, 86 45 C86 55, 82 62, 74 67 C76 72, 74 80, 66 82 C64 88, 58 90, 52 88 L52 20 Z"
          fill="#FF0D99" fillOpacity="0.25" stroke="#FF0D99" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="50" y1="20" x2="50" y2="88" stroke="#FF0D99" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
        <path d="M26 40 C32 36, 38 38, 42 42" stroke="#FF0D99" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.8"/>
        <path d="M20 52 C28 48, 36 50, 42 56" stroke="#FF0D99" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.8"/>
        <path d="M74 40 C68 36, 62 38, 58 42" stroke="#FF0D99" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.8"/>
        <path d="M80 52 C72 48, 64 50, 58 56" stroke="#FF0D99" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.8"/>
        <circle cx="50" cy="54" r="4" fill="#FF0D99" fillOpacity="0.9" />
      </g>

      {/* Neck */}
      <rect x="50" y="56" width="10" height="12" rx="3" fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Torso */}
      <path d="M30 68 C28 90, 26 120, 28 140 L82 140 C84 120, 82 90, 80 68 C72 72, 62 74, 55 74 C48 74, 38 72, 30 68 Z"
        fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Shoulders/Collar */}
      <path d="M30 68 C38 72, 48 74, 55 74 C62 74, 72 72, 80 68"
        stroke="#FF0D99" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />

      {/* Left arm */}
      <path d="M30 72 C20 88, 16 110, 18 130 C22 132, 26 130, 28 128 C26 112, 28 94, 34 80 Z"
        fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Right arm */}
      <path d="M80 72 C90 88, 94 110, 92 130 C88 132, 84 130, 82 128 C84 112, 82 94, 76 80 Z"
        fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Left leg */}
      <path d="M38 140 C36 168, 34 196, 34 220 C38 222, 44 222, 46 220 C46 196, 46 168, 46 140 Z"
        fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Right leg */}
      <path d="M72 140 C74 168, 76 196, 76 220 C72 222, 66 222, 64 220 C64 196, 64 168, 64 140 Z"
        fill="#0a0a0a" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

      {/* Neural glow at heart / chest */}
      <circle cx="55" cy="100" r="5" fill="#FF0D99" fillOpacity="0.15" />
      <circle cx="55" cy="100" r="2" fill="#FF0D99" fillOpacity="0.7" />

      {/* Connection from brain to chest */}
      <line x1="55" y1="56" x2="55" y2="95" stroke="#FF0D99" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.4" />
    </svg>
  )
}
