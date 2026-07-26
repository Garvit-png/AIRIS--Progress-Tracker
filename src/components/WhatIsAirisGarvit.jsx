import React from 'react'
import { motion } from 'framer-motion'
import { GLSLHills } from '@/components/ui/glsl-hills'

export default function WhatIsAirisGarvit({ onNext, onPrev }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black">
      <GLSLHills />

      {/* Content */}
      <div className="pointer-events-none z-10 absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 text-center">
        {/* Know Your Speaker */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="font-mono font-extrabold uppercase tracking-[0.2em] text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          Know Your Speaker
        </motion.h1>

        {/* Photo + Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex flex-col items-center gap-5 pointer-events-auto"
        >
          <img
            src="/garvit.png"
            alt="Garvit"
            className="w-64 h-80 object-cover rounded-2xl border-2 border-[#FF0D99]/50"
            style={{ boxShadow: '0 0 40px rgba(255,13,153,0.3)' }}
          />
          <span className="font-mono font-bold tracking-[0.4em] text-white uppercase text-xl">
            GARVIT
          </span>
        </motion.div>
      </div>

      {/* Back Arrow */}
      <motion.button
        onClick={onPrev}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="fixed top-8 left-8 z-[70] group pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors duration-300">
            Back
          </span>
        </div>
      </motion.button>

      {/* Next Arrow */}
      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] group pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
