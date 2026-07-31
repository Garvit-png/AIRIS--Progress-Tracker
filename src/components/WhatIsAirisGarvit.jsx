import React from 'react'
import { motion } from 'framer-motion'
import { GLSLHills } from '@/components/ui/glsl-hills'

const ACHIEVEMENTS = [
  { icon: '💼', text: 'Tech Lead Intern at SELLIXA' },
  { icon: '💻', text: 'Past Full Stack Developer Intern at SvaNiti' },
  { icon: '🛠️', text: 'Multiple Project Handler at SvaBharat and IDUME' },
  { icon: '🏆', text: 'Won MumbaiHacks 2025 among 1000+ teams' },
  { icon: '🤖', text: 'Tech Member at AIRIS' },
  { icon: '👑', text: 'Project Admin at Elite Coders Summer of Code (ECSOC)' },
]

export default function WhatIsAirisGarvit({ onNext, onPrev }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black">
      <GLSLHills />

      {/* Content */}
      <div className="pointer-events-none z-10 absolute inset-0 flex flex-col items-center justify-center px-10 gap-6">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="font-mono font-extrabold uppercase tracking-[0.2em] text-white text-center"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          Know Your Speaker
        </motion.h1>

        {/* Two column — photo + achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex items-center gap-12 pointer-events-auto w-full max-w-4xl"
        >
          {/* Photo + Name */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <img
              src="/garvit.png"
              alt="Garvit"
              className="w-52 h-64 object-cover rounded-2xl border-2 border-[#FF0D99]/50"
              style={{ boxShadow: '0 0 40px rgba(255,13,153,0.3)' }}
            />
            <span className="font-mono font-bold tracking-[0.4em] text-white uppercase text-lg">
              GARVIT
            </span>
          </div>

          {/* Achievements */}
          <div className="flex flex-col gap-3 flex-1">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <p className="font-mono text-white/80 text-sm leading-relaxed">{a.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed top-8 left-8 z-[70] group pointer-events-auto">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300"><path d="M15 18l-6-6 6-6" /></svg>
          <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors duration-300">Back</span>
        </div>
      </motion.button>

      {/* Next */}
      <motion.button onClick={onNext} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] group pointer-events-auto">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300"><path d="M7 10l5 5 5-5" /></svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
