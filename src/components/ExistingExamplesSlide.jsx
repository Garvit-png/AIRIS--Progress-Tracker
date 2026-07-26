import React from 'react'
import { motion } from 'framer-motion'

const PHOTOS = [
  { src: '/example_existing1.png', alt: 'Example 1' },
  { src: '/example_existing2.png', alt: 'Example 2' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
}
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } }
}

export default function ExistingExamplesSlide({ onNext, onPrev }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-10 overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60">Back</span>
      </motion.button>

      {/* Title */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        className="text-center mb-10">
        <h1 className="font-mono font-extrabold text-white leading-tight"
          style={{ fontSize:'clamp(2rem,5vw,4rem)' }}>
          Existing <span className="text-[#FF0D99]">Examples</span>
        </h1>
      </motion.div>

      {/* Photos */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
        {PHOTOS.map((p, i) => (
          <motion.div key={i} variants={item}
            className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
            whileHover={{ scale:1.02, borderColor:'rgba(255,13,153,0.4)' }}
          >
            <img src={p.src} alt={p.alt} className="max-h-72 w-auto object-contain" />
          </motion.div>
        ))}
      </motion.div>

      {/* Next */}
      <motion.button onClick={onNext} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] group">
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity, ease:'easeInOut' }}
          className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase group-hover:text-white/50 transition-colors">Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 group-hover:text-[#FF0D99] transition-colors"><path d="M7 10l5 5 5-5"/></svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
