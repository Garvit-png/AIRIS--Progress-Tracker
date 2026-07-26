import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VIDEO_FILE = '/git-github-explainer.mp4'

export default function GitHubSlide({ onNext, onPrev }) {
  const [step, setStep] = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)
  const videoRef = useRef(null)

  const handleTitleClick = () => {
    if (step === 0) setStep(1)
    else if (step === 1) setStep(2)
  }

  const openVideo = () => {
    setVideoOpen(true)
    setTimeout(() => videoRef.current?.play(), 100)
  }

  const closeVideo = () => {
    videoRef.current?.pause()
    setVideoOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors">Back</span>
      </motion.button>

      <div className="flex flex-col items-center w-full h-full pt-14 px-10 pb-16 overflow-y-auto">

        {/* ── TOP SECTION: logos + title ── */}
        <motion.p
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[10px] tracking-[0.5em] text-white/30 uppercase mb-5"
        >
          Collaboration Platform
        </motion.p>

        {/* Logos row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-8 mb-4"
        >
          {/* Git logo */}
          <motion.img
            src="/git.png" alt="Git"
            className="h-16 w-auto object-contain"
            whileHover={step === 0 ? { scale: 1.1 } : {}}
          />
          {/* GitHub logo */}
          <motion.img
            src="/github.png" alt="GitHub"
            className="h-16 w-auto object-contain"
            whileHover={step === 0 ? { scale: 1.1 } : {}}
          />
        </motion.div>

        {/* GIT & GITHUB title */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onClick={handleTitleClick}
          className="flex items-center gap-3 mb-2 cursor-pointer select-none"
        >
          <span className="font-mono font-extrabold tracking-[0.15em] text-[#F05032] uppercase"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>GIT</span>
          <span className="font-mono font-extrabold text-white/25"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>&</span>
          <span className="font-mono font-extrabold tracking-[0.15em] text-white uppercase"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>GITHUB</span>
        </motion.div>

        {step === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase mb-6">
            click to explore
          </motion.p>
        )}

        {/* ── STEP 1+: Two info cards side by side ── */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-5 w-full max-w-4xl mt-4 mb-5"
            >
              {/* GIT card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F05032]/10 border border-[#F05032]/20 flex items-center justify-center flex-shrink-0 p-2">
                    <img src="/git.png" alt="Git" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-mono font-extrabold text-[#F05032] text-xl tracking-tight">Git</p>
                    <p className="font-mono text-white/30 text-[10px] tracking-widest uppercase">Version Control System</p>
                  </div>
                </div>
                <p className="font-mono text-white/55 text-sm leading-relaxed">
                  A distributed version control system that tracks changes in your code locally. Create branches, commit changes, and merge — all on your own machine, no internet needed.
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {['Local', 'Branches', 'Commits', 'Merge', 'Offline'].map(tag => (
                    <span key={tag} className="font-mono text-[9px] tracking-widest text-[#F05032] border border-[#F05032]/30 rounded-full px-3 py-1 uppercase">{tag}</span>
                  ))}
                </div>
              </motion.div>

              {/* GITHUB card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 p-2">
                  <img src="/github.png" alt="GitHub" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-mono font-extrabold text-white text-xl tracking-tight">GitHub</p>
                    <p className="font-mono text-white/30 text-[10px] tracking-widest uppercase">Cloud Collaboration</p>
                  </div>
                </div>
                <p className="font-mono text-white/55 text-sm leading-relaxed">
                  A cloud platform that hosts Git repositories online. Adds pull requests, code review, issue tracking, Actions (CI/CD), and a social layer for developers worldwide.
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {['Cloud', 'PRs', 'Issues', 'CI/CD', 'Teams'].map(tag => (
                    <span key={tag} className="font-mono text-[9px] tracking-widest text-white/40 border border-white/15 rounded-full px-3 py-1 uppercase">{tag}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 2+: Video section ── */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              key="video-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl"
            >
              {/* Video click-to-play card */}
              <motion.div
                onClick={openVideo}
                whileHover={{ scale: 1.01, borderColor: 'rgba(255,13,153,0.4)' }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden cursor-pointer relative group flex items-center justify-center"
                style={{ height: '160px' }}
              >
                {/* Dark bg with play button */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="flex flex-col items-center justify-center gap-3 z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-[#FF0D99] flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(255,13,153,0.5)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </motion.div>
                  <p className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">Click to watch — Git vs GitHub Explained</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center px-6"
            onClick={closeVideo}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <video
                ref={videoRef}
                src={VIDEO_FILE}
                controls
                className="w-full"
                style={{ maxHeight: '80vh' }}
              />
            </motion.div>
            {/* Close hint */}
            <button onClick={closeVideo}
              className="absolute top-6 right-8 font-mono text-white/30 hover:text-white text-sm tracking-widest uppercase transition-colors">
              ✕ close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.button
            key="next"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={onNext}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] group"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2">
              <span className="font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase group-hover:text-white/50 transition-colors">Next</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-white/25 group-hover:text-[#FF0D99] transition-colors">
                <path d="M7 10l5 5 5-5" />
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
