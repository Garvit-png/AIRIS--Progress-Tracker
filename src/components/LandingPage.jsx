import React from 'react'
import { motion } from 'framer-motion'
import ShaderBackground from './ShaderBackground'

export default function LandingPage({ onNext }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <ShaderBackground />

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
        className="relative z-10 flex flex-col items-center translate-y-12"
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
          className="absolute inset-0 bg-[#FF0D99]/10 blur-3xl rounded-full"
        />

        <motion.h1
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-1 font-mono text-4xl tracking-[1.5em] text-white uppercase pl-[1.5em]"
        >
          A I R I S
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 font-mono text-xs font-bold tracking-[1.2em] text-white uppercase pl-[1.2em]"
        >
          AI Research &amp; Innovation Society
        </motion.p>
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
