"use client";
import React from "react";
import { motion } from "framer-motion";

const collab = [
  { name: "GitHub",       img: "/github.png"      },
  { name: "Bitbucket",    img: "/bitbucket.jpeg"  },
  { name: "Azure DevOps", img: "/azuredevops.png" },
  { name: "GitLab",       img: "/gitlab.png"      },
]

const aiagent = [
  { name: "Antigravity", img: "/antigravity.jpeg" },
  { name: "Genspark",    img: "/genspark.png"     },
  { name: "Lovable",     img: "/loveable.jpeg"    },
  { name: "Perplexity",  img: "/perplexity.png"   },
  { name: "Claude",      img: "/claude.png"       },
  { name: "ChatGPT",     img: "/chatgpt.png"      },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
}

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: [0.16,1,0.3,1] } }
}

export default function MissionSection({ onNext, onPrev }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-start overflow-hidden px-8 pt-14 pb-10">

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
      <motion.h1
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
        className="font-mono font-extrabold text-white text-center mb-10 leading-tight"
        style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)' }}
      >
        Understanding{' '}
        <span className="text-[#FF0D99]">Applications</span>
        {' '}We Need
      </motion.h1>

      {/* Two columns */}
      <div className="flex w-full max-w-5xl gap-8 flex-1 overflow-hidden">

        {/* LEFT — Developer collaboration platform */}
        <motion.div
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16,1,0.3,1] }}
          className="flex-1 flex flex-col"
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/35 uppercase mb-4 text-center">
            Developer Collaboration Platform
          </p>
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 gap-3 flex-1">
            {collab.map(p => (
              <motion.div key={p.name} variants={item}
                className="rounded-2xl flex items-center justify-center p-4 bg-white/5 border border-white/10 select-none"
              >
                <img src={p.img} alt={p.name} className="max-h-16 max-w-full object-contain" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="w-px bg-white/10 self-stretch mx-2" />

        {/* RIGHT — AI agent platform */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="flex-1 flex flex-col"
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-white/35 uppercase mb-4 text-center">
            AI Agent Platform
          </p>
          <motion.div variants={container} initial="hidden" animate="show"
            className="grid grid-cols-2 gap-3 flex-1">
            {aiagent.map(p => (
              <motion.div key={p.name} variants={item}
                className="rounded-2xl flex items-center justify-center p-4 bg-white/5 border border-white/10 select-none"
              >
                <img src={p.img} alt={p.name} className="max-h-16 max-w-full object-contain" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Next */}
      <motion.button onClick={onNext} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
