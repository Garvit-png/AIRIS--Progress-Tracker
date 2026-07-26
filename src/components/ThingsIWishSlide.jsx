import React from 'react'
import { motion } from 'framer-motion'

const TAGS = ['Honest advice', 'Lessons learned', 'Common mistakes', 'Practical tips']

export default function ThingsIWishSlide({ onNext, onPrev }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-10 overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors">Back</span>
      </motion.button>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF0D99]/5 blur-[120px] rounded-full" />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 relative z-10"
      >
        <h1
          className="font-mono font-extrabold text-white leading-[1.1] mb-1"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)' }}
        >
          Things I Wish
        </h1>
        <h1
          className="font-mono font-extrabold leading-[1.1]"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)' }}
        >
          <span className="text-[#FF0D99]">I Knew </span>
          <span className="text-white">Earlier</span>
        </h1>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-20 h-[2px] bg-[#FF0D99] rounded-full mb-10 origin-center relative z-10"
        style={{ boxShadow: '0 0 12px rgba(255,13,153,0.5)' }}
      />

      {/* Subtitle tags */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3 relative z-10"
      >
        {TAGS.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            className="font-mono text-xs italic text-white/40 tracking-wide px-4 py-1.5 rounded-full border border-white/8 bg-white/[0.03]"
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* Next */}
      <motion.button onClick={onNext}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] group">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase group-hover:text-white/50 transition-colors">Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-white/25 group-hover:text-[#FF0D99] transition-colors">
            <path d="M7 10l5 5 5-5"/>
          </svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
