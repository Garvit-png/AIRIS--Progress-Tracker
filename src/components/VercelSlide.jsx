import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function VercelLogo({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 65" fill="currentColor" className={className}>
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  )
}

function PersonFigure({ showQuestion, showHearts }) {
  return (
    <div className="relative flex flex-col items-center select-none">
      <AnimatePresence>
        {showHearts && (
          <motion.div key="hearts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute -top-14 flex gap-1 pointer-events-none">
            {[0, 1, 2, 3].map(i => (
              <motion.span key={i}
                initial={{ y: 0, opacity: 0, scale: 0 }}
                animate={{ y: -40, opacity: [0, 1, 1, 0], scale: [0.5, 1.3, 1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                className="text-xl text-red-500">❤️</motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showQuestion && !showHearts && (
          <motion.div key="q"
            initial={{ opacity: 0, y: 6, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-10 font-mono font-black text-3xl text-yellow-400"
            style={{ textShadow: '0 0 14px rgba(250,204,21,0.7)' }}>
            ?
          </motion.div>
        )}
      </AnimatePresence>
      <svg width="80" height="160" viewBox="0 0 80 160" fill="none">
        <ellipse cx="40" cy="22" rx="16" ry="18" fill="#111" stroke="#fff" strokeWidth="1" strokeOpacity="0.4"/>
        <circle cx="34" cy="20" r="2.5" fill="white" fillOpacity="0.6"/>
        <circle cx="46" cy="20" r="2.5" fill="white" fillOpacity="0.6"/>
        <path d="M33 28 Q40 33 47 28" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.5" strokeLinecap="round"/>
        <rect x="36" y="39" width="8" height="8" rx="2" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
        <path d="M18 47 C16 68,16 90,18 105 L62 105 C64 90,64 68,62 47 C54 51,46 53,40 53 C34 53,26 51,18 47Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
        <path d="M18 50 C8 64,4 80,6 96 C10 98,14 97,16 95 C14 82,16 68,22 56Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
        <path d="M62 50 C72 64,76 80,74 96 C70 98,66 97,64 95 C66 82,64 68,58 56Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
        <path d="M26 105 C24 122,22 138,22 153 C26 155,32 155,34 153 C34 138,34 122,34 105Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
        <path d="M54 105 C56 122,58 138,58 153 C54 155,48 155,46 153 C46 138,46 122,46 105Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"/>
      </svg>
    </div>
  )
}

const FILES = [
  { name: 'index.html', icon: '📄', code: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>' },
  { name: 'style.css',  icon: '🎨', code: 'body {\n  font-family: sans-serif;\n  background: #000;\n  color: #fff;\n}' },
  { name: 'script.js',  icon: '⚡', code: 'const btn = document.querySelector("button");\nbtn.addEventListener("click", () => {\n  alert("Hello!");\n});' },
]

function IDEWidget() {
  const [activeFile, setActiveFile] = useState(0)
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden" style={{ width: 320, height: 210 }}>
      <div className="flex h-full">
        <div className="w-28 border-r border-white/5 flex flex-col pt-2">
          <p className="font-mono text-[8px] text-white/20 tracking-widest uppercase px-3 mb-2">my-app</p>
          {FILES.map((f, i) => (
            <button key={f.name} onClick={() => setActiveFile(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors
                ${activeFile === i ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
              <span className="text-xs">{f.icon}</span>
              <span className="font-mono text-[9px] truncate">{f.name}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 p-3 overflow-hidden">
          <pre className="font-mono text-[9px] text-green-400/80 leading-4 whitespace-pre-wrap">{FILES[activeFile].code}</pre>
        </div>
      </div>
    </div>
  )
}

// ── hits checks if a drag point is inside a ref's bounding box ─────────────
function isOver(ref, point) {
  if (!ref.current) return false
  const r = ref.current.getBoundingClientRect()
  return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom
}

export default function VercelSlide({ onNext, onPrev }) {
  const [folded,      setFolded]      = useState(false)
  const [folderGone,  setFolderGone]  = useState(false)
  const [link,        setLink]        = useState(null)
  const [overVercel,  setOverVercel]  = useState(false)
  const [overPerson,  setOverPerson]  = useState(false)
  const [heartsShown, setHeartsShown] = useState(false)

  const constraintsRef = useRef(null)
  const vercelRef      = useRef(null)
  const personRef      = useRef(null)

  const handleReset = () => {
    setFolded(false); setFolderGone(false)
    setLink(null); setOverVercel(false)
    setOverPerson(false); setHeartsShown(false)
  }

  // folder drag end — check if over vercel zone
  const onFolderDragEnd = (e, info) => {
    setOverVercel(false)
    const point = { x: info.point.x, y: info.point.y }
    if (isOver(vercelRef, point)) {
      setFolderGone(true)
      setTimeout(() => setLink('https://my-app-xi.vercel.app'), 400)
    }
  }

  // link drag end — check if over person
  const onLinkDragEnd = (e, info) => {
    setOverPerson(false)
    const point = { x: info.point.x, y: info.point.y }
    if (isOver(personRef, point)) {
      setHeartsShown(true)
    }
  }

  // live hover during folder drag — using pointermove on constraint div
  const onPointerMove = (e) => {
    const pt = { x: e.clientX, y: e.clientY }
    if (folded && !folderGone && !link) {
      // folder being dragged — track both vercel and person
      setOverVercel(isOver(vercelRef, pt))
      setOverPerson(isOver(personRef, pt))
    } else if (link && !heartsShown) {
      // link being dragged — check over person
      setOverPerson(isOver(personRef, pt))
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      ref={constraintsRef} onPointerMove={onPointerMove}>

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

      {/* Reset */}
      <motion.button onClick={handleReset} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="fixed top-8 right-8 z-[70] font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase border border-white/10 rounded-full px-4 py-1.5 hover:border-white/30 hover:text-white/50 transition-all">
        ↺ Reset
      </motion.button>

      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-4 flex-shrink-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2">
          <VercelLogo size={26} className="text-white" />
          <h2 className="font-mono font-extrabold text-white tracking-[0.15em] uppercase"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Vercel</h2>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="font-mono text-white/40 text-sm text-center max-w-xl leading-relaxed px-6">
          A cloud platform for deploying frontend apps instantly. Push code → get a live URL. No servers, no config.
        </motion.p>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-around px-12 relative">

        {/* LEFT — IDE or draggable folder */}
        <div className="flex flex-col items-center gap-3 z-10">
          <AnimatePresence mode="wait">
            {!folded ? (
              <motion.div key="ide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <IDEWidget />
                <motion.button onClick={() => setFolded(true)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="mt-3 w-full font-mono text-[9px] tracking-[0.35em] text-white/30 uppercase border border-white/10 rounded-full px-4 py-1.5 hover:border-[#FF0D99]/40 hover:text-white/60 transition-all">
                  click to fold → 📁
                </motion.button>
              </motion.div>
            ) : folderGone ? (
              <motion.div key="gone"
                initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.35 }}
                className="w-20 h-20 flex flex-col items-center justify-center">
                <span className="text-3xl">📁</span>
              </motion.div>
            ) : (
              <motion.div key="folder"
                drag dragConstraints={constraintsRef} dragElastic={0.12}
                onDragEnd={onFolderDragEnd}
                whileDrag={{ scale: 1.12, rotate: 5, zIndex: 50 }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing select-none">
                <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-150
                  ${overVercel ? 'border-white/60 bg-white/10 scale-110' : 'border-white/10 bg-white/5'}`}>
                  <span className="text-3xl">📁</span>
                  <span className="font-mono text-[8px] text-white/30">my-app</span>
                </div>
                <p className="font-mono text-[8px] text-white/20 tracking-widest">drag me →</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTRE — Person */}
        <div ref={personRef} className="flex flex-col items-center z-10">
          <PersonFigure
            showQuestion={overPerson && !link && !heartsShown}
            showHearts={heartsShown}
          />
          {link && !heartsShown && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-2 font-mono text-[8px] text-white/20 tracking-widest text-center">
              ← drag link here
            </motion.p>
          )}
        </div>

        {/* RIGHT — Vercel drop zone + link */}
        <div className="flex flex-col items-center gap-5 z-10">
          <motion.div ref={vercelRef}
            animate={overVercel
              ? { scale: 1.1, boxShadow: '0 0 50px rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.5)' }
              : { scale: 1, boxShadow: '0 0 0px rgba(255,255,255,0)', borderColor: 'rgba(255,255,255,0.15)' }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-3 rounded-2xl border bg-white/5 px-10 py-7">
            <VercelLogo size={44} className="text-white" />
            <p className="font-mono text-white font-bold tracking-widest uppercase text-sm">Deploy</p>
            {overVercel && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-mono text-[9px] text-green-400 tracking-widest">drop to deploy!</motion.p>
            )}
          </motion.div>

          {/* Generated link */}
          <AnimatePresence>
            {link && !heartsShown && (
              <motion.div key="link"
                initial={{ opacity: 0, y: 10, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag dragConstraints={constraintsRef} dragElastic={0.12}
                onDragEnd={onLinkDragEnd}
                whileDrag={{ scale: 1.1, rotate: -4, zIndex: 50 }}
                className="cursor-grab active:cursor-grabbing rounded-xl border border-green-500/40 bg-green-500/8 px-5 py-3 flex flex-col items-center gap-1 select-none"
                style={overPerson ? { boxShadow: '0 0 24px rgba(34,197,94,0.4)' } : {}}>
                <span className="text-green-400 text-xs font-mono">✓ Deployed!</span>
                <span className="font-mono text-green-300 text-[11px] tracking-tight">{link}</span>
                <span className="font-mono text-white/20 text-[8px] tracking-widest mt-0.5">drag to share ←</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex-shrink-0 flex justify-center gap-10 pb-14 pt-1">
        {[
          { done: folded,       label: '1. Fold the IDE' },
          { done: !!link,       label: '2. Drop on Vercel' },
          { done: heartsShown,  label: '3. Share with person' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold
              ${s.done ? 'bg-green-500 border-green-500 text-black' : 'border-white/20 text-white/20'}`}>
              {s.done ? '✓' : i + 1}
            </span>
            <span className={`font-mono text-[9px] tracking-widest uppercase ${s.done ? 'text-green-400' : 'text-white/25'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Next */}
      <AnimatePresence>
        {heartsShown && (
          <motion.button key="next"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onClick={onNext}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] group">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2">
              <span className="font-mono text-[8px] tracking-[0.4em] text-white/25 uppercase group-hover:text-white/50 transition-colors">Next</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-white/25 group-hover:text-[#FF0D99] transition-colors">
                <path d="M7 10l5 5 5-5"/>
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
