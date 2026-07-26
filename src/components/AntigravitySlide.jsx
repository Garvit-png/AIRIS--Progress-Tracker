import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AntigravitySlide({ onNext, onPrev }) {
  const [step, setStep] = useState(0)
  const [imgOpen, setImgOpen] = useState(false)

  const handleTitleClick = () => {
    if (step === 0) setStep(1)
    else if (step === 1) setImgOpen(true)
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors">Back</span>
      </motion.button>

      <div className="flex flex-col items-center w-full h-full pt-14 px-10 pb-16 overflow-y-auto">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[10px] tracking-[0.5em] text-white/30 uppercase mb-5"
        >
          AI Agent Platform
        </motion.p>

        {/* Logo — antigravity.jpeg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center mb-4"
        >
          <motion.img
            src="/antigravity.jpeg"
            alt="Antigravity"
            className="h-20 w-auto object-contain rounded-xl"
            whileHover={{ scale: 1.06 }}
          />
        </motion.div>

        {/* Title — clickable */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onClick={handleTitleClick}
          className="flex items-center gap-3 mb-2 cursor-pointer select-none"
        >
          <span
            className="font-mono font-extrabold tracking-[0.15em] text-white uppercase hover:text-[#FF0D99] transition-colors duration-200"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            ANTIGRAVITY
          </span>
        </motion.div>

        {step === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-6">
            click to explore
          </motion.p>
        )}

        {/* Step 1 — definition only */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              key="def"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-6 flex flex-col gap-3"
            >
              <p className="font-mono font-bold text-white text-xl tracking-wide">Antigravity</p>
              <p className="font-mono text-white/60 text-base leading-relaxed">
                An AI agent platform that helps developers and teams build, deploy, and manage autonomous AI agents. It provides infrastructure to run agents that can reason, plan, and execute tasks end-to-end without constant human input.
              </p>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="font-mono text-[9px] tracking-[0.4em] text-[#FF0D99]/40 uppercase mt-1">
                click "ANTIGRAVITY" again to see more ↑
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full image modal */}
      <AnimatePresence>
        {imgOpen && (
          <motion.div
            key="img-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setImgOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setImgOpen(false)}
                className="absolute -top-5 -right-5 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#FF0D99] transition-all duration-200 text-lg"
              >
                ✕
              </button>
              <img
                src="/antigravity.png"
                alt="Antigravity"
                className="w-full h-auto object-contain rounded-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next — after step 1 */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.button
            key="next"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={onNext}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] group"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2">
              <span className="font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase group-hover:text-white/50 transition-colors">Next</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-white/25 group-hover:text-[#FF0D99] transition-colors">
                <path d="M7 10l5 5 5-5" />
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
