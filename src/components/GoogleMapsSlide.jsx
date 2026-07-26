import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────
// Real-ish Delhi / NCR road network mapped onto 600×460 canvas
// Roughly: West ← → East,  North ↑ ↓ South
// ─────────────────────────────────────────────────────────────────
const NODES = {
  // North belt
  rohini:       { x: 60,  y: 55,  label: 'Rohini' },
  pitampura:    { x: 155, y: 45,  label: 'Pitampura' },
  azadpur:      { x: 240, y: 65,  label: 'Azadpur' },
  model_town:   { x: 310, y: 50,  label: 'Model Town' },
  welcome:      { x: 410, y: 60,  label: 'Welcome' },
  anand_vihar:  { x: 510, y: 55,  label: 'Anand Vihar' },
  // Mid-north
  janakpuri:    { x: 55,  y: 155, label: 'Janakpuri' },
  rajouri:      { x: 148, y: 145, label: 'Rajouri Gdn' },
  karol_bagh:   { x: 240, y: 140, label: 'Karol Bagh' },
  cp:           { x: 320, y: 140, label: 'Connaught Pl' },
  laxmi_nagar:  { x: 420, y: 145, label: 'Laxmi Nagar' },
  shahdara:     { x: 510, y: 150, label: 'Shahdara' },
  // Centre
  dilli_haat:   { x: 100, y: 240, label: 'Dilli Haat' },
  ina:          { x: 195, y: 235, label: 'INA' },
  india_gate:   { x: 310, y: 235, label: 'India Gate' },
  pragati:      { x: 415, y: 240, label: 'Pragati Mdn' },
  yamuna:       { x: 510, y: 240, label: 'Yamuna Ghat' },
  // Mid-south
  vasant_kunj:  { x: 70,  y: 330, label: 'Vasant Kunj' },
  hauz_khas:    { x: 170, y: 320, label: 'Hauz Khas' },
  saket:        { x: 265, y: 330, label: 'Saket' },
  nehru_place:  { x: 360, y: 325, label: 'Nehru Place' },
  noida_15:     { x: 460, y: 330, label: 'Noida Sec 15' },
  // South belt
  dwarka:       { x: 60,  y: 420, label: 'Dwarka' },
  airport:      { x: 155, y: 415, label: 'IGI Airport' },
  mehrauli:     { x: 250, y: 420, label: 'Mehrauli' },
  badarpur:     { x: 355, y: 420, label: 'Badarpur' },
  noida_62:     { x: 470, y: 415, label: 'Noida Sec 62' },
  faridabad:    { x: 560, y: 420, label: 'Faridabad' },
}

// Adjacency — real road connections
const EDGES_DEF = [
  // North belt horizontal
  ['rohini','pitampura'],['pitampura','azadpur'],['azadpur','model_town'],
  ['model_town','welcome'],['welcome','anand_vihar'],
  // Mid-north horizontal
  ['janakpuri','rajouri'],['rajouri','karol_bagh'],['karol_bagh','cp'],
  ['cp','laxmi_nagar'],['laxmi_nagar','shahdara'],
  // Centre horizontal
  ['dilli_haat','ina'],['ina','india_gate'],['india_gate','pragati'],
  ['pragati','yamuna'],
  // Mid-south horizontal
  ['vasant_kunj','hauz_khas'],['hauz_khas','saket'],['saket','nehru_place'],
  ['nehru_place','noida_15'],
  // South horizontal
  ['dwarka','airport'],['airport','mehrauli'],['mehrauli','badarpur'],
  ['badarpur','noida_62'],['noida_62','faridabad'],
  // Verticals (North↔Mid-north)
  ['rohini','janakpuri'],['pitampura','rajouri'],['azadpur','karol_bagh'],
  ['model_town','cp'],['welcome','laxmi_nagar'],['anand_vihar','shahdara'],
  // Verticals (Mid-north↔Centre)
  ['janakpuri','dilli_haat'],['rajouri','ina'],['karol_bagh','india_gate'],
  ['cp','india_gate'],['laxmi_nagar','pragati'],['shahdara','yamuna'],
  // Verticals (Centre↔Mid-south)
  ['dilli_haat','vasant_kunj'],['ina','hauz_khas'],['india_gate','saket'],
  ['pragati','nehru_place'],['yamuna','noida_15'],
  // Verticals (Mid-south↔South)
  ['vasant_kunj','dwarka'],['hauz_khas','airport'],['saket','mehrauli'],
  ['nehru_place','badarpur'],['noida_15','noida_62'],['noida_15','faridabad'],
  // Diagonals / ring roads
  ['pitampura','karol_bagh'],['azadpur','cp'],['model_town','laxmi_nagar'],
  ['rajouri','india_gate'],['ina','saket'],['india_gate','nehru_place'],
  ['pragati','noida_62'],['hauz_khas','mehrauli'],['saket','badarpur'],
]

// Build adjacency list
const ADJ = {}
Object.keys(NODES).forEach(id => { ADJ[id] = [] })
EDGES_DEF.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a) })

const edgeKey = (a, b) => [a, b].sort().join('~')

// BFS returning visited order
function bfsOrder(start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []
  while (queue.length) {
    const n = queue.shift()
    order.push(n)
    for (const nb of ADJ[n]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
    }
  }
  return order
}

// BFS shortest path
function bfsPath(src, dst) {
  const visited = new Set([src])
  const queue = [[src]]
  while (queue.length) {
    const path = queue.shift()
    const node = path[path.length - 1]
    if (node === dst) return path
    for (const nb of ADJ[node]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]) }
    }
  }
  return []
}

// ── Map SVG component ──────────────────────────────────────────────────────
function MapGraph({ srcId, dstId, phase }) {
  // phase: 'idle' | 'flood' | 'done'
  const [litSrc, setLitSrc]   = useState(new Set()) // blue flood from src
  const [litDst, setLitDst]   = useState(new Set()) // orange flood from dst
  const [pathSet, setPathSet] = useState({ nodes: new Set(), edges: new Set() })
  const timers = useRef([])

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  useEffect(() => {
    clearAll()
    setLitSrc(new Set()); setLitDst(new Set())
    setPathSet({ nodes: new Set(), edges: new Set() })
    if (phase !== 'flood' || !srcId || !dstId || srcId === dstId) return

    const srcOrder = bfsOrder(srcId)   // left→right wave
    const dstOrder = bfsOrder(dstId)   // right→left wave
    const shortPath = bfsPath(srcId, dstId)

    const STEP = 55 // ms per node reveal

    // Flood src (blue)
    srcOrder.forEach((id, i) => {
      timers.current.push(setTimeout(() => {
        setLitSrc(prev => new Set([...prev, id]))
      }, i * STEP))
    })

    // Flood dst (orange), interleaved
    dstOrder.forEach((id, i) => {
      timers.current.push(setTimeout(() => {
        setLitDst(prev => new Set([...prev, id]))
      }, i * STEP + 20)) // 20ms offset so they interleave
    })

    // After both floods done, draw shortest path
    const floodDone = Math.max(srcOrder.length, dstOrder.length) * STEP + 300
    shortPath.forEach((id, i) => {
      timers.current.push(setTimeout(() => {
        setPathSet(prev => ({
          nodes: new Set([...prev.nodes, id]),
          edges: i > 0
            ? new Set([...prev.edges, edgeKey(shortPath[i-1], id)])
            : prev.edges
        }))
      }, floodDone + i * 70))
    })

    return clearAll
  }, [phase, srcId, dstId])

  const nodeIds = Object.keys(NODES)

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 460" className="w-full h-full">
      <defs>
        {/* Map-like background pattern */}
        <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        </pattern>
        <filter id="softglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="600" height="460" fill="#0d1117"/>
      <rect width="600" height="460" fill="url(#mapgrid)"/>

      {/* Zone shading — mimics map regions */}
      <rect x="0"   y="0"   width="200" height="460" fill="rgba(34,197,94,0.015)" rx="0"/>
      <rect x="200" y="0"   width="200" height="460" fill="rgba(99,179,237,0.015)" rx="0"/>
      <rect x="400" y="0"   width="200" height="460" fill="rgba(251,191,36,0.012)" rx="0"/>

      {/* Yamuna river — decorative */}
      <path d="M 480 0 C 490 80, 495 160, 490 240 C 485 320, 488 380, 490 460"
        fill="none" stroke="rgba(99,179,237,0.18)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M 480 0 C 490 80, 495 160, 490 240 C 485 320, 488 380, 490 460"
        fill="none" stroke="rgba(99,179,237,0.06)" strokeWidth="14"/>

      {/* Ring road suggestion */}
      <ellipse cx="300" cy="230" rx="200" ry="160"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" strokeDasharray="6 4"/>

      {/* ── Edges ── */}
      {EDGES_DEF.map(([a, b]) => {
        const key = edgeKey(a, b)
        const na = NODES[a], nb = NODES[b]
        const isPath = pathSet.edges.has(key)
        const srcLit = litSrc.has(a) && litSrc.has(b)
        const dstLit = litDst.has(a) && litDst.has(b)
        const color = isPath ? '#FF0D99'
          : srcLit && dstLit ? '#a78bfa'  // overlap = purple
          : srcLit ? '#63b3ed'
          : dstLit ? '#f6ad55'
          : 'rgba(255,255,255,0.07)'
        const width = isPath ? 3.5 : (srcLit || dstLit) ? 2 : 1.2
        return (
          <line key={key} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={color} strokeWidth={width} strokeLinecap="round"
            style={{ transition: 'stroke 0.2s, stroke-width 0.15s',
                     filter: isPath ? 'drop-shadow(0 0 5px #FF0D99)' : 'none' }}
          />
        )
      })}

      {/* ── Nodes ── */}
      {nodeIds.map(id => {
        const n = NODES[id]
        const isSrc   = id === srcId
        const isDst   = id === dstId
        const inPath  = pathSet.nodes.has(id)
        const inSrc   = litSrc.has(id)
        const inDst   = litDst.has(id)
        const r = isSrc || isDst ? 9 : inPath ? 7 : (inSrc || inDst) ? 5 : 3.5
        const fill = isSrc ? '#22c55e' : isDst ? '#FF0D99'
          : inPath ? '#FF0D99'
          : inSrc && inDst ? '#a78bfa'
          : inSrc ? '#63b3ed' : inDst ? '#f6ad55'
          : '#1e2433'
        const stroke = isSrc ? '#86efac' : isDst ? '#f9a8d4'
          : inPath ? '#fda4af'
          : (inSrc || inDst) ? fill : 'rgba(255,255,255,0.12)'

        return (
          <g key={id}>
            {/* Pulse ring for src/dst */}
            {(isSrc || isDst) && (
              <circle cx={n.x} cy={n.y} r={r + 6} fill="none"
                stroke={isSrc ? '#22c55e' : '#FF0D99'} strokeWidth="1"
                strokeOpacity="0.4" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}/>
            )}
            <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={stroke} strokeWidth="1.5"
              style={{ transition: 'all 0.15s', filter: (isSrc||isDst||inPath) ? `drop-shadow(0 0 6px ${fill})` : 'none' }}/>
          </g>
        )
      })}

      {/* ── Labels for major nodes ── */}
      {nodeIds.map(id => {
        const n = NODES[id]
        const isSrc  = id === srcId
        const isDst  = id === dstId
        const inPath = pathSet.nodes.has(id)
        if (!isSrc && !isDst && !inPath) return null
        return (
          <text key={`lbl-${id}`} x={n.x} y={n.y - 13} textAnchor="middle"
            fontSize="8.5" fontFamily="monospace" fontWeight="bold"
            fill={isSrc ? '#86efac' : isDst ? '#f9a8d4' : '#fda4af'}>
            {n.label}
          </text>
        )
      })}

      {/* Ping keyframes via style tag */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.5 }
          100% { transform: scale(2.2); opacity: 0 }
        }
      `}</style>
    </svg>
  )
}

// ── Location list (same as NODES keys but user-friendly) ──────────────────
const LOCATIONS = Object.entries(NODES).map(([id, n]) => ({ id, label: n.label }))

// ── Main slide ────────────────────────────────────────────────────────────
export default function GoogleMapsSlide({ onNext, onPrev }) {
  const [srcId,     setSrcId]     = useState('')
  const [dstId,     setDstId]     = useState('')
  const [phase,     setPhase]     = useState('idle')
  const [pathFound, setPathFound] = useState(false)
  const timerRef = useRef(null)

  const srcNode = NODES[srcId]
  const dstNode = NODES[dstId]

  const pathLen = srcId && dstId ? bfsPath(srcId, dstId).length : 0
  const srcOrder = srcId ? bfsOrder(srcId) : []
  const dstOrder = dstId ? bfsOrder(dstId) : []
  const floodMs = Math.max(srcOrder.length, dstOrder.length) * 55 + 300 + pathLen * 70 + 400

  const handleFindRoute = () => {
    if (!srcId || !dstId || srcId === dstId) return
    setPhase('flood')
    setPathFound(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPathFound(true), floodMs)
  }

  const handleReset = () => {
    clearTimeout(timerRef.current)
    setPhase('idle'); setPathFound(false); setSrcId(''); setDstId('')
  }

  const canSearch = srcId && dstId && srcId !== dstId && phase === 'idle'

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex overflow-hidden">
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

      {/* ══ LEFT — panel ══ */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        className="w-1/2 flex flex-col border-r border-white/10 px-12 py-10 pt-20">

        {/* Title */}
        <div className="mb-8 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🗺️</span>
            <p className="font-mono text-[10px] tracking-[0.5em] text-white/25 uppercase">App</p>
          </div>
          <h2 className="font-mono font-extrabold text-white tracking-tight"
            style={{ fontSize: 'clamp(2.2rem,4.5vw,3.5rem)' }}>Google Maps</h2>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
          {/* Where you are */}
          <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
            <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase mb-2">📍 Where you are</p>
            <select value={srcId}
              onChange={e => { setSrcId(e.target.value); setPhase('idle'); setPathFound(false) }}
              className="w-full bg-transparent font-mono text-white text-sm focus:outline-none cursor-pointer">
              <option value="" disabled className="bg-[#111]">Select your location…</option>
              {LOCATIONS.map(l => (
                <option key={l.id} value={l.id} className="bg-[#111]">{l.label}</option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-1">
            <div className="w-[1px] h-6 bg-white/10 relative flex justify-center">
              <span className="absolute bottom-0 text-white/20 text-base leading-none">↓</span>
            </div>
          </div>

          {/* Where you want to go */}
          <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
            <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase mb-2">🏁 Where you want to go</p>
            <select value={dstId}
              onChange={e => { setDstId(e.target.value); setPhase('idle'); setPathFound(false) }}
              className="w-full bg-transparent font-mono text-white text-sm focus:outline-none cursor-pointer">
              <option value="" disabled className="bg-[#111]">Select destination…</option>
              {LOCATIONS.filter(l => l.id !== srcId).map(l => (
                <option key={l.id} value={l.id} className="bg-[#111]">{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-3">
          {/* Find Route */}
          {phase === 'idle' && (
            <motion.button onClick={handleFindRoute} disabled={!canSearch}
              whileHover={canSearch ? { scale: 1.03 } : {}} whileTap={canSearch ? { scale: 0.97 } : {}}
              className={`w-full py-4 rounded-2xl font-mono font-bold text-sm tracking-[0.3em] uppercase transition-all duration-300
                ${canSearch ? 'bg-[#FF0D99] text-white cursor-pointer' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'}`}
              style={canSearch ? { boxShadow: '0 0 30px rgba(255,13,153,0.4)' } : {}}>
              Find Route
            </motion.button>
          )}

          {/* Exploring status */}
          {phase === 'flood' && !pathFound && (
            <div className="flex flex-col gap-2 py-1">
              <div className="flex items-center gap-3">
                <motion.span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0"
                  animate={{ opacity: [1,0.2,1] }} transition={{ duration: 0.4, repeat: Infinity }}/>
                <p className="font-mono text-blue-400/70 text-sm">Flooding from your location…</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0"
                  animate={{ opacity: [1,0.2,1] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}/>
                <p className="font-mono text-orange-400/70 text-sm">Flooding from destination…</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.span className="w-2.5 h-2.5 rounded-full bg-[#FF0D99] flex-shrink-0"
                  animate={{ opacity: [1,0.2,1] }} transition={{ duration: 0.3, repeat: Infinity, delay: 0.4 }}/>
                <p className="font-mono text-white/30 text-sm">Calculating shortest path…</p>
              </div>
            </div>
          )}

          {/* Path found */}
          <AnimatePresence>
            {pathFound && (
              <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
                className="rounded-2xl border border-[#FF0D99]/40 bg-[#FF0D99]/5 px-5 py-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF0D99] text-xl">✓</span>
                  <p className="font-mono font-bold text-[#FF0D99] text-base tracking-wide">Path Found!</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">From</p>
                    <p className="font-mono text-white text-sm font-medium">{srcNode?.label}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">To</p>
                    <p className="font-mono text-white text-sm font-medium">{dstNode?.label}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Algorithm</p>
                    <p className="font-mono text-cyan-400 text-sm">BFS / Dijkstra</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Stops</p>
                    <p className="font-mono text-[#FF0D99] text-sm font-bold">{pathLen - 1} edges</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <motion.button onClick={handleReset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 font-mono text-white/50 text-sm">
                    Reset
                  </motion.button>
                  <motion.button onClick={onNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF0D99] font-mono font-bold text-white text-sm tracking-widest uppercase"
                    style={{ boxShadow: '0 0 20px rgba(255,13,153,0.3)' }}>
                    Continue →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ══ RIGHT — map ══ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-1/2 relative overflow-hidden">

        {/* Map legend */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400"/><span className="font-mono text-[9px] text-white/40">You</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0D99]"/><span className="font-mono text-[9px] text-white/40">Dest</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"/><span className="font-mono text-[9px] text-white/40">From you</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400"/><span className="font-mono text-[9px] text-white/40">From dest</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-[2px] bg-[#FF0D99] rounded"/><span className="font-mono text-[9px] text-white/40">Shortest</span></div>
        </div>

        {/* City label */}
        <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
          <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase">Delhi NCR Road Network</p>
        </div>

        <MapGraph srcId={srcId || null} dstId={dstId || null} phase={phase} />
      </motion.div>
    </div>
  )
}
