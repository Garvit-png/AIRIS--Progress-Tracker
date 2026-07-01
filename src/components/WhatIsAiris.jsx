import React from 'react'
import { motion } from 'framer-motion'
import { GLSLHills } from '@/components/ui/glsl-hills'

const HoverText = ({ text }) => {
  return text.split(' ').map((word, i, arr) => (
    <React.Fragment key={i}>
      <span className="inline-block hover:text-[#FF0D99] hover:scale-110 transition-all duration-200 cursor-default origin-center">
        {word}
      </span>
      {i !== arr.length - 1 && ' '}
    </React.Fragment>
  ))
}

export default function WhatIsAiris({ onNext, onPrev }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black">
      <GLSLHills />

      {/* Content Overlay */}
      <div className="pointer-events-none z-10 absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl text-center space-y-8 pointer-events-auto"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-mono text-5xl md:text-6xl font-bold tracking-tight text-white"
          >
            What is{' '}
            <span className="text-[#FF0D99]">AIRIS</span>
            <span className="text-white/60">?</span>
          </motion.h1>

          {/* Main Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-xl md:text-2xl leading-relaxed text-white/80 font-light"
          >
            <HoverText text="Artificial Intelligence Research & Innovation Society (AIRIS) is an educational and research organization with a long-term vision of transforming how Artificial Intelligence is learned, taught, researched, and shared." />
          </motion.p>

          {/* Secondary */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg md:text-xl text-white/50 font-light"
          >
            <HoverText text="AIRIS is not designed to be another coding club or placement-focused community." />
          </motion.p>

          {/* Mission */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="text-lg md:text-xl text-white/60 italic"
          >
            <HoverText text="Its mission is to cultivate curiosity, mathematical thinking, scientific reasoning, and research culture among students." />
          </motion.p>
        </motion.div>
      </div>

      {/* Back Arrow — Top Left */}
      <motion.button
        onClick={onPrev}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed top-8 left-8 z-[70] group pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-white/30 group-hover:text-[#FF0D99] transition-colors duration-300"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors duration-300">
            Back
          </span>
        </div>
      </motion.button>

      {/* Next Arrow — Bottom Center */}
      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] group pointer-events-auto"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
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
