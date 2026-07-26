import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Products ──────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'phone',  emoji: '📱', label: 'Phone',   price: '₹12,999', rating: '4.5', brand: 'Samsung Galaxy M34', desc: '6.5" Super AMOLED, 50MP Camera, 6000mAh battery. Perfect for everyday use.' },
  { id: 'book',   emoji: '📚', label: 'Books',   price: '₹499',    rating: '4.8', brand: 'Deep Learning - Ian Goodfellow', desc: 'The bible of deep learning. Covers neural nets, CNNs, RNNs and more.' },
  { id: 'shoes',  emoji: '👟', label: 'Shoes',   price: '₹2,499',  rating: '4.3', brand: 'Nike Air Max 270', desc: 'Lightweight running shoes with Air cushioning for all-day comfort.' },
  { id: 'kurti',  emoji: '👗', label: 'Kurtis',  price: '₹799',    rating: '4.6', brand: 'Biba Cotton Kurti', desc: 'Premium cotton fabric, traditional print, available in all sizes.' },
  { id: 'juicer', emoji: '🥤', label: 'Juicer',  price: '₹1,899',  rating: '4.2', brand: 'Philips Viva HR1863', desc: '700W motor, easy clean design, wide feeding tube, 2 speed settings.' },
  { id: 'laptop', emoji: '💻', label: 'Laptop',  price: '₹54,990', rating: '4.7', brand: 'Lenovo IdeaPad Slim 3', desc: 'Intel i5, 8GB RAM, 512GB SSD, 15.6" FHD display. Best for students.' },
]

const RELATED = {
  phone:  [{ emoji:'📱', label:'iPhone 15',     price:'₹79,999' }, { emoji:'📱', label:'Poco X6 Pro',   price:'₹21,999' }, { emoji:'📱', label:'OnePlus Nord CE4', price:'₹24,999' }],
  book:   [{ emoji:'📚', label:'ISLP - Bishop',  price:'₹799'   }, { emoji:'📚', label:'AI by Russell',  price:'₹699'   }, { emoji:'📚', label:'Hands-On ML',       price:'₹999'   }],
  shoes:  [{ emoji:'👟', label:'Adidas Ultraboost',price:'₹8,999'}, { emoji:'👟', label:'Puma Softride', price:'₹3,499' }, { emoji:'👟', label:'Reebok Classic',     price:'₹2,999' }],
  kurti:  [{ emoji:'👗', label:'W Brand Kurti',  price:'₹1,199' }, { emoji:'👗', label:'Jaipur Kurti',   price:'₹649'   }, { emoji:'👗', label:'Global Desi',        price:'₹899'   }],
  juicer: [{ emoji:'🥤', label:'Philips HL1643', price:'₹2,499' }, { emoji:'🥤', label:'Bajaj Rex 500', price:'₹1,299' }, { emoji:'🥤', label:'Prestige PCJ 7.0',   price:'₹1,699' }],
  laptop: [{ emoji:'💻', label:'HP Pavilion 15', price:'₹49,990'}, { emoji:'💻', label:'Acer Aspire 5', price:'₹44,990'}, { emoji:'💻', label:'ASUS VivoBook 15',   price:'₹47,990'}],
}

const BRAIN_MSGS = {
  phone:  ["User clicked on Phone.", "Analyzing interest...", "Category: Electronics → Smartphones", "Fetching top-rated phones...", "Applying collaborative filter...", "Showing personalized results! ✓"],
  book:   ["User clicked on Books.", "Category: Education → AI/ML Books", "Checking purchase history...", "User interest: Tech & Learning", "Fetching top-rated books...", "Personalized reading list ready! ✓"],
  shoes:  ["User clicked on Shoes.", "Category: Footwear → Sports", "Analyzing size preferences...", "Cross-referencing top brands...", "Applying style filter...", "Recommendations loaded! ✓"],
  kurti:  ["User clicked on Kurtis.", "Category: Fashion → Women's Wear", "Detecting style preferences...", "Filtering by fabric & brand...", "Personalizing catalogue...", "Fashion picks ready! ✓"],
  juicer: ["User clicked on Juicer.", "Category: Kitchen Appliances", "Analyzing wattage preferences...", "Fetching top-rated juicers...", "Applying budget filter...", "Best juicers found! ✓"],
  laptop: ["User clicked on Laptop.", "Category: Electronics → Computers", "Checking RAM & storage needs...", "Filtering by performance tier...", "Applying student discount...", "Top laptops curated! ✓"],
}

// ── Brain cartoon SVG ─────────────────────────────────────────────────────
function BrainCartoon({ thinking, msg }) {
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {msg && (
          <motion.div key={msg}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[200px] shadow-lg"
          >
            <p className="font-mono text-black text-[10px] leading-4">{msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brain SVG */}
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        {/* Left hemisphere */}
        <motion.path d="M50 18 C30 16, 12 26, 12 44 C12 54, 16 62, 24 67 C22 72, 24 80, 32 82 C34 88, 40 91, 47 89 L47 18Z"
          fill="#FF0D99" fillOpacity="0.2" stroke="#FF0D99" strokeWidth="1.5"
          animate={thinking ? { fillOpacity: [0.2, 0.4, 0.2] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }} />
        {/* Right hemisphere */}
        <motion.path d="M50 18 C70 16, 88 26, 88 44 C88 54, 84 62, 76 67 C78 72, 76 80, 68 82 C66 88, 60 91, 53 89 L53 18Z"
          fill="#FF0D99" fillOpacity="0.2" stroke="#FF0D99" strokeWidth="1.5"
          animate={thinking ? { fillOpacity: [0.4, 0.2, 0.4] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }} />
        {/* Centre */}
        <line x1="50" y1="18" x2="50" y2="89" stroke="#FF0D99" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.5"/>
        {/* Gyri */}
        <path d="M24 38 C30 34,38 36,44 40" stroke="#FF0D99" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
        <path d="M18 52 C26 48,36 50,44 55" stroke="#FF0D99" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
        <path d="M76 38 C70 34,62 36,56 40" stroke="#FF0D99" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
        <path d="M82 52 C74 48,64 50,56 55" stroke="#FF0D99" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
        {/* Eyes */}
        <circle cx="38" cy="72" r="4" fill="white" stroke="#FF0D99" strokeWidth="1"/>
        <circle cx="62" cy="72" r="4" fill="white" stroke="#FF0D99" strokeWidth="1"/>
        <motion.circle cx="38" cy="72" r="2" fill="#FF0D99"
          animate={thinking ? { cx: [38, 39, 38, 37, 38] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }} />
        <motion.circle cx="62" cy="72" r="2" fill="#FF0D99"
          animate={thinking ? { cx: [62, 63, 62, 61, 62] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }} />
        {/* Smile */}
        <motion.path d="M40 83 Q50 90 60 83" stroke="#FF0D99" strokeWidth="1.5" fill="none" strokeLinecap="round"
          animate={thinking ? { d: ["M40 83 Q50 90 60 83", "M40 80 Q50 87 60 80", "M40 83 Q50 90 60 83"] } : {}}
          transition={{ duration: 1, repeat: Infinity }} />
        {/* Pulse glow */}
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#FF0D99" strokeWidth="0.5"
          animate={thinking ? { r: [40, 45, 40], opacity: [0.3, 0, 0.3] } : { opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }} />
      </svg>
      <p className="font-mono text-[9px] text-[#FF0D99]/60 tracking-widest uppercase">AI Engine</p>
    </div>
  )
}

// ── Typewriter for terminal ────────────────────────────────────────────────
function useTypewriter(lines, active) {
  const [out, setOut] = useState([])
  const ref = useRef(null)
  useEffect(() => {
    if (!active || !lines.length) return
    setOut([])
    let li = 0, ci = 0
    const tick = () => {
      if (li >= lines.length) return
      const line = lines[li]
      ci = Math.min(ci + 3, line.length)
      setOut(prev => { const n=[...prev]; n[li]=line.slice(0,ci); return n })
      if (ci >= line.length) { li++; ci=0; ref.current=setTimeout(tick, 120) }
      else { ref.current=setTimeout(tick, 12) }
    }
    ref.current = setTimeout(tick, 100)
    return () => clearTimeout(ref.current)
  }, [active, lines.join(',')])
  return out
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AmazonAISlide({ onNext, onPrev }) {
  const [selected, setSelected] = useState(null)   // product id
  const [brainMsgIdx, setBrainMsgIdx] = useState(-1)
  const [showDetail, setShowDetail] = useState(false)
  const terminalRef = useRef(null)

  const msgs = selected ? BRAIN_MSGS[selected] : []
  const termLines = useTypewriter(
    selected ? [
      `$ ai-engine --analyze --user="guest"`,
      `> Event: click → product_id="${selected}"`,
      `> Loading recommendation model...`,
      `> Model: CollaborativeFilter v2.1`,
      `> Fetching item embeddings...`,
      `> Computing similarity scores...`,
      `> Ranked top-3 results`,
      `> Injecting personalization layer...`,
      `> Response ready ✓`,
    ] : [],
    !!selected
  )

  // Brain message cycling
  useEffect(() => {
    if (!selected) { setBrainMsgIdx(-1); setShowDetail(false); return }
    setBrainMsgIdx(0)
    setShowDetail(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < msgs.length) { setBrainMsgIdx(i) }
      else { clearInterval(interval); setShowDetail(true) }
    }, 700)
    return () => clearInterval(interval)
  }, [selected])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [termLines.length])

  const prod = PRODUCTS.find(p => p.id === selected)
  const related = selected ? RELATED[selected] : []

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="fixed top-4 left-6 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 group-hover:text-[#FF0D99] transition-colors"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60">Back</span>
      </motion.button>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-extrabold font-mono text-xl tracking-tight">amazon</span>
          <span className="text-white/20 font-mono text-xs">.in</span>
        </div>
        <div className="flex-1 mx-6 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="font-mono text-white/25 text-xs">Search for products, brands and more</span>
        </div>
        <span className="font-mono text-[9px] text-white/20 tracking-widest uppercase">AI-Powered Recommendations</span>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Product grid OR detail ── */}
        <div className="w-[45%] border-r border-white/5 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!showDetail ? (
              /* Product Grid */
              <motion.div key="grid" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, x:-20 }}
                className="flex-1 overflow-y-auto p-4">
                <p className="font-mono text-[9px] tracking-[0.4em] text-white/25 uppercase mb-3">
                  {selected ? `Showing results for "${prod?.label}"` : 'Browse categories'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {PRODUCTS.map(p => (
                    <motion.button key={p.id} onClick={() => setSelected(p.id)}
                      whileHover={{ scale: 1.04, borderColor: 'rgba(255,13,153,0.5)' }}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-xl border p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer
                        ${selected === p.id
                          ? 'border-[#FF0D99]/60 bg-[#FF0D99]/5'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/5'}`}>
                      <span className="text-3xl">{p.emoji}</span>
                      <span className="font-mono text-white text-[10px] font-semibold">{p.label}</span>
                      <span className="font-mono text-orange-400 text-[9px]">{p.price}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Product Detail */
              <motion.div key="detail" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
                className="flex-1 overflow-y-auto p-5">
                <button onClick={() => { setSelected(null); setShowDetail(false) }}
                  className="font-mono text-[9px] text-white/30 tracking-widest uppercase mb-4 hover:text-[#FF0D99] transition-colors">
                  ← Back to browse
                </button>
                {/* Main product */}
                <div className="flex gap-4 mb-5 p-4 rounded-2xl border border-[#FF0D99]/20 bg-[#FF0D99]/5">
                  <span className="text-5xl">{prod?.emoji}</span>
                  <div className="flex flex-col gap-1">
                    <p className="font-mono font-bold text-white text-sm">{prod?.brand}</p>
                    <p className="font-mono text-white/50 text-xs leading-relaxed">{prod?.desc}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-orange-400 font-bold text-base">{prod?.price}</span>
                      <span className="font-mono text-yellow-400 text-xs">★ {prod?.rating}</span>
                      <span className="font-mono text-green-400 text-[9px]">In Stock</span>
                    </div>
                  </div>
                </div>
                {/* Related */}
                <p className="font-mono text-[9px] tracking-[0.4em] text-[#FF0D99]/60 uppercase mb-3">
                  Recommended for you
                </p>
                <div className="flex flex-col gap-2">
                  {related.map((r, i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i*0.1, duration:0.4 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/[0.02]">
                      <span className="text-2xl">{r.emoji}</span>
                      <div className="flex-1">
                        <p className="font-mono text-white text-xs font-medium">{r.label}</p>
                      </div>
                      <span className="font-mono text-orange-400 text-xs">{r.price}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CENTRE: Brain ── */}
        <div className="w-[20%] flex flex-col items-center justify-center border-r border-white/5 px-3 gap-4">
          <BrainCartoon
            thinking={!!selected && !showDetail}
            msg={selected && brainMsgIdx >= 0 ? msgs[brainMsgIdx] : null}
          />
          {!selected && (
            <p className="font-mono text-[9px] text-white/20 tracking-widest text-center uppercase">
              click a product
            </p>
          )}
        </div>

        {/* ── RIGHT: Terminal ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500/60"/>
            <span className="w-3 h-3 rounded-full bg-yellow-500/60"/>
            <span className="w-3 h-3 rounded-full bg-green-500/60"/>
            <span className="font-mono text-[9px] text-white/20 tracking-widest ml-2 uppercase">AI Recommendation Engine</span>
          </div>
          <div ref={terminalRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-5">
            {!selected && <p className="text-white/20">Waiting for user interaction<span className="animate-pulse">_</span></p>}
            {termLines.map((line, i) => (
              <div key={i} className={
                line.startsWith('$') ? 'text-[#FF0D99]' :
                line.includes('✓')  ? 'text-green-400'  :
                line.startsWith('>') ? 'text-white/50'   : 'text-cyan-300/80'
              }>
                {line}
                {i === termLines.length-1 && selected && !showDetail && (
                  <span className="animate-pulse text-white/30">▌</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next */}
      <motion.button onClick={onNext} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] group">
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5, repeat:Infinity, ease:'easeInOut' }}
          className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] tracking-[0.4em] text-white/20 uppercase group-hover:text-white/50 transition-colors">Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-[#FF0D99] transition-colors"><path d="M7 10l5 5 5-5"/></svg>
        </motion.div>
      </motion.button>
    </div>
  )
}
