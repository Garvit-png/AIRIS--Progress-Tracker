import React from 'react'
import { motion } from 'framer-motion'

const LINKS = [
  { label: 'My Portfolio',          url: 'https://my-new-portfolio-7wfk.vercel.app/' },
  { label: 'Weaver',                url: 'https://weaver-lilac.vercel.app/' },
  { label: 'AIRIS Progress Tracker',url: 'https://airis-progress-tracker.vercel.app/' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } }
}

const item = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16,1,0.3,1] } }
}

export default function AIInActionSlide({ onNext, onPrev }) {
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

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
        className="text-center mb-16"
      >
        <h1 className="font-mono font-extrabold text-white leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
          Enough talking,
        </h1>
        <h1 className="font-mono font-extrabold leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
          <span className="text-[#FF0D99]">Let's see AI</span>
          <span className="text-white"> in action.</span>
        </h1>
      </motion.div>

      {/* Links */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-4 w-full max-w-lg"
      >
        {LINKS.map((link, i) => (
          <motion.a
            key={i}
            variants={item}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, borderColor: 'rgba(255,13,153,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] group transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[#FF0D99] text-sm font-bold">0{i + 1}</span>
              <span className="font-mono text-white text-base font-medium group-hover:text-[#FF0D99] transition-colors duration-200">
                {link.label}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-white/20 group-hover:text-[#FF0D99] transition-colors duration-200">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </motion.a>
        ))}
      </motion.div>

      {/* Next */}
      <motion.button onClick={onNext}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] group">
        <motion.div animate={{ y: [0,8,0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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
