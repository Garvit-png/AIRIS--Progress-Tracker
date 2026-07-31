import React from 'react'
import { motion } from 'framer-motion'

export default function LandingPage({ onNext }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-20 pb-24">

      {/* Top Left Logo */}
      <div className="fixed top-8 left-8 z-[70]">
        <motion.img
          src="/logo.png"
          alt="AIRIS Logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-16 w-auto object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Center Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center justify-between flex-1 gap-0 px-6 text-center w-full"
      >
        {/* Outer Glow Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[#FF0D99]/10 blur-3xl rounded-full pointer-events-none"
        />

        {/* SEMESTER 0 */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-mono font-extrabold uppercase tracking-[0.25em] text-white"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 1.05 }}
        >
          SEMESTER 0
        </motion.h1>

        {/* Title Image */}
        <motion.img
          src="/title.png"
          alt="AIRIS Title"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="h-20 w-auto object-contain"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Know the Club heading */}
        <motion.h2
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="font-mono text-2xl md:text-3xl font-bold tracking-widest text-white uppercase"
        >
          Vibe Coding
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="font-mono text-sm md:text-base text-white/60 italic tracking-wide"
        >
          Forget the code, Cherish the creativity.
        </motion.p>

        {/* Batch of 2030 pill */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="border border-[#FF0D99]/60 rounded-2xl px-8 py-3 font-mono text-sm md:text-base tracking-[0.3em] text-[#FF0D99] uppercase"
          style={{ boxShadow: '0 0 18px rgba(255,13,153,0.2)' }}
        >
          Batch of 2030
        </motion.div>
      </motion.div>

      {/* Bottom Arrow — PPT style next slide */}
      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] group"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[8px] tracking-[0.4em] text-white/30 uppercase group-hover:text-white/60 transition-colors duration-300">
            Enter
          </span>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300"
          >
            <path d="M7 10l5 5 5-5" />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
