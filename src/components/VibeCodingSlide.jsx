import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    id: 'what',
    label: "What is Vibe Coding?",
    icon: '✨',
    content: "Vibe Coding is a style of building software where you describe what you want in plain language and AI writes the code for you. Instead of memorizing syntax, you focus on the idea — the vibe — and let the AI handle the implementation. You're the director, AI is the developer.",
  },
  {
    id: 'benefits',
    label: 'Benefits',
    icon: '🚀',
    points: [
      'Build projects without deep coding knowledge',
      'Go from idea to working product in hours, not weeks',
      'Focus on creativity and problem solving, not syntax',
      'Instantly prototype and iterate on ideas',
      'Learn by reading AI-generated code, not writing from scratch',
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    icon: '🎯',
    points: [
      'A working deployed website or app by end of session',
      'Hands-on experience with AI-assisted development',
      'Understanding of how AI tools like Lovable & Vercel work',
      'Confidence to build your own projects independently',
    ],
  },
  {
    id: 'project',
    label: 'Project',
    icon: '🛠️',
    content: "We'll build a real working web app together — live, from scratch — using AI tools. You'll describe what you want, watch the AI code it, and by the end of this session you'll have a deployed link you can share with the world.",
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.16,1,0.3,1] } }
}

export default function VibeCodingSlide({ onNext, onPrev }) {
  const [active, setActive] = useState(null)

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-14 px-10 pb-16 overflow-y-auto">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60">Back</span>
      </motion.button>

      {/* Title */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        className="text-center mb-10 flex-shrink-0">
        <p className="font-mono text-[10px] tracking-[0.5em] text-white/25 uppercase mb-3">Today's Goal</p>
        <h1 className="font-mono font-extrabold text-white leading-tight"
          style={{ fontSize:'clamp(2rem,5vw,4rem)' }}>
          <span className="text-[#FF0D99]">Vibe</span> Coding
        </h1>
      </motion.div>

      {/* Cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 gap-5 w-full max-w-4xl">
        {SECTIONS.map(s => (
          <motion.div key={s.id} variants={item}
            onClick={() => setActive(active === s.id ? null : s.id)}
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,13,153,0.4)' }}
            className={`rounded-2xl border px-6 py-5 cursor-pointer transition-all duration-200
              ${active === s.id ? 'border-[#FF0D99]/50 bg-[#FF0D99]/5' : 'border-white/10 bg-white/[0.03]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-mono font-bold text-white text-base tracking-wide">{s.label}</p>
            </div>

            <AnimatePresence>
              {active === s.id && (
                <motion.div
                  initial={{ opacity:0, height:0 }}
                  animate={{ opacity:1, height:'auto' }}
                  exit={{ opacity:0, height:0 }}
                  transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
                  className="overflow-hidden"
                >
                  {s.content && (
                    <p className="font-mono text-white/60 text-sm leading-relaxed">{s.content}</p>
                  )}
                  {s.points && (
                    <ul className="flex flex-col gap-2">
                      {s.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#FF0D99] mt-0.5 flex-shrink-0">•</span>
                          <span className="font-mono text-white/60 text-sm leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {active !== s.id && (
              <p className="font-mono text-[9px] text-white/20 tracking-widest uppercase">click to expand</p>
            )}
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
