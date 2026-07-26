import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Car options ── */
const CARS = [
  { id: 'ubergo',    label: 'UberGo',     driver: 'Ravi Kumar',    car: 'Maruti Swift',  rating: '4.8', eta: '3 min',  price: '₹120' },
  { id: 'premium',   label: 'Uber Premier', driver: 'Suresh Nair',  car: 'Honda City',    rating: '4.9', eta: '5 min',  price: '₹220' },
  { id: 'auto',      label: 'Uber Auto',  driver: 'Deepak Singh',   car: 'Bajaj Auto',    rating: '4.7', eta: '2 min',  price: '₹80'  },
]

/* ── CLI lines ── */
const SEARCH_LINES = [
  '$ uber --search-drivers --location="Sector 62, Noida"',
  '> GPS lock acquired ✓',
  '> Scanning nearby drivers...',
  '> Found 14 drivers in 2km radius',
  '> Filtering by availability...',
  '> Matching ride type...',
  '> 3 rides available near you.',
  '> Select a ride to continue.',
]

const BOOKING_LINES = (car) => [
  `$ uber --book --driver="${car.driver}" --car="${car.label}"`,
  `> Contacting driver: ${car.driver}...`,
  '> Driver accepted ✓',
  `> Vehicle: ${car.car}`,
  `> ETA: ${car.eta}`,
  '> Generating OTP...',
  '> OTP: 4821',
  '> Payment method: UPI ✓',
  `> Fare estimate: ${car.price}`,
  '> Tracking URL: uber.com/track/xK92m',
  '> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '> RIDE BOOKED SUCCESSFULLY ✓',
]

/* ── Hyper-fast typewriter ── */
function useTypewriter(lines, active) {
  const [displayed, setDisplayed] = useState([])
  const [done, setDone] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!active) { return }
    setDisplayed([])
    setDone(false)
    let lineIdx = 0
    let charIdx = 0

    const tick = () => {
      if (lineIdx >= lines.length) { setDone(true); return }
      const line = lines[lineIdx]
      charIdx = Math.min(charIdx + 5, line.length)
      setDisplayed(prev => {
        const next = [...prev]
        next[lineIdx] = line.slice(0, charIdx)
        return next
      })
      if (charIdx >= line.length) {
        lineIdx++; charIdx = 0
        ref.current = setTimeout(tick, 55)
      } else {
        ref.current = setTimeout(tick, 6)
      }
    }
    ref.current = setTimeout(tick, 80)
    return () => clearTimeout(ref.current)
  }, [active, lines.join(',')])

  return { displayed, done }
}

/* ── Coding figure ── */
function CodingFigure({ typing }) {
  const spd = 0.1
  return (
    <svg width="150" height="230" viewBox="0 0 130 230" fill="none">
      <ellipse cx="65" cy="28" rx="18" ry="20" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.35" />
      <ellipse cx="65" cy="24" rx="10" ry="9" fill="#FF0D99" fillOpacity="0.15" stroke="#FF0D99" strokeWidth="0.7" strokeOpacity="0.6" />
      <path d="M59 22 C61 19,63 20,65 22 C67 20,69 19,71 22" stroke="#FF0D99" strokeWidth="0.7" fill="none" strokeOpacity="0.8"/>
      <path d="M57 26 C60 23,64 24,67 26" stroke="#FF0D99" strokeWidth="0.7" fill="none" strokeOpacity="0.8"/>
      <rect x="61" y="47" width="8" height="9" rx="2" fill="#111" stroke="#fff" strokeWidth="0.7" strokeOpacity="0.3" />
      <path d="M42 56 C40 76,40 100,42 114 L88 114 C90 100,90 76,88 56 C80 60,72 62,65 62 C58 62,50 60,42 56Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3" />
      <motion.path d="M42 60 C30 72,22 88,20 104 C24 106,28 105,30 103 C32 90,38 76,46 66Z"
        fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"
        animate={typing ? { rotate: [-7, 7, -7] } : { rotate: 0 }}
        transition={{ duration: spd, repeat: typing ? Infinity : 0, ease: 'easeInOut' }}
        style={{ transformOrigin: '42px 60px' }} />
      <motion.path d="M88 60 C100 72,108 88,110 104 C106 106,102 105,100 103 C98 90,92 76,84 66Z"
        fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3"
        animate={typing ? { rotate: [7, -7, 7] } : { rotate: 0 }}
        transition={{ duration: spd, repeat: typing ? Infinity : 0, ease: 'easeInOut', delay: spd / 2 }}
        style={{ transformOrigin: '88px 60px' }} />
      <path d="M50 114 C48 140,46 164,46 184 C50 186,56 186,58 184 C58 164,58 140,58 114Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M80 114 C82 140,84 164,84 184 C80 186,74 186,72 184 C72 164,72 140,72 114Z" fill="#111" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.3" />
      <motion.circle cx="65" cy="84" r="2" fill="#FF0D99"
        animate={typing ? { opacity: [1, 0.1, 1], scale: [1, 1.8, 1] } : { opacity: 0.7 }}
        transition={{ duration: 0.2, repeat: Infinity }} />
      <rect x="8" y="200" width="114" height="18" rx="2.5" fill="#0d0d0d" stroke="#FF0D99" strokeWidth="0.7" strokeOpacity="0.5" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <motion.rect key={i} x={12 + i * 10} y={203} width="8" height="11" rx="1.5" fill="#1a1a1a"
          animate={typing ? { y: [203, 205, 203], fill: ['#1a1a1a', i % 2 === 0 ? '#FF0D99' : '#444', '#1a1a1a'] } : {}}
          transition={{ duration: spd, repeat: Infinity, delay: i * 0.03 }} />
      ))}
    </svg>
  )
}

/* ── Star rating ── */
function Stars({ rating }) {
  return (
    <span className="text-yellow-400 text-xs tracking-tight">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="text-white/40 ml-1">{rating}</span>
    </span>
  )
}

/* ── CLI output ── */
function CLIOutput({ lines, typing, phase, onCarClick }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines.length])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-[1.6] scrollbar-none">
      {phase === 'idle' && <p className="text-white/20">Waiting for input<span className="animate-pulse">_</span></p>}

      {lines.map((line, i) => (
        <div key={i} className={
          line.startsWith('$') ? 'text-[#FF0D99]' :
          line.includes('✓') || line.includes('BOOKED') ? 'text-green-400' :
          line.startsWith('>') ? 'text-white/55' :
          'text-cyan-300/80'
        }>
          {line}
          {i === lines.length - 1 && typing && <span className="animate-pulse text-white/40">▌</span>}
        </div>
      ))}

      {phase === 'choose' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2">
          <p className="text-white/30 mb-1">$ select --ride</p>
          {CARS.map((c, i) => (
            <p key={c.id} onClick={() => onCarClick(c.id)}
              className="text-white/50 cursor-pointer hover:text-[#FF0D99] transition-colors duration-100">
              [{i + 1}] {c.label} — {c.driver} • {c.car} • ⭐{c.rating} • {c.eta} • {c.price}
            </p>
          ))}
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

/* ── Main ── */
export default function UberSlide({ onNext, onPrev }) {
  // phases: idle → searching → choose → booking → booked
  const [phase, setPhase] = useState('idle')
  const [selected, setSelected] = useState(null)

  const search  = useTypewriter(SEARCH_LINES, phase === 'searching')
  const booking = useTypewriter(selected ? BOOKING_LINES(selected) : [], phase === 'booking')

  useEffect(() => { if (search.done  && phase === 'searching') setPhase('choose')  }, [search.done])
  useEffect(() => { if (booking.done && phase === 'booking')   setPhase('booked')  }, [booking.done])

  const handleChooseCar = (id) => {
    setSelected(CARS.find(c => c.id === id))
    setPhase('booking')
  }

  const cliLines =
    phase === 'idle'                       ? [] :
    phase === 'searching' || phase === 'choose' ? search.displayed :
    [...SEARCH_LINES, ...booking.displayed]

  const typing = phase === 'searching' || phase === 'booking'

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">

      {/* Back */}
      <motion.button onClick={onPrev} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-8 left-8 z-[70] group flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-white/30 group-hover:text-[#FF0D99] transition-colors">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors">Back</span>
      </motion.button>

      {/* ═══ LEFT HALF ═══ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-1/2 flex flex-col border-r border-white/10 px-12 py-10 pt-20 overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <p className="font-mono text-[10px] tracking-[0.5em] text-white/25 uppercase mb-1">App</p>
          <h2 className="font-mono font-extrabold text-white tracking-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Uber
          </h2>
        </div>

        {/* From / To */}
        <div className="flex flex-col gap-2 mb-6 flex-shrink-0">
          <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
            <div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Pickup</p>
              <p className="font-mono text-white text-sm">Sector 62, Noida</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0D99] flex-shrink-0" />
            <div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Drop</p>
              <p className="font-mono text-white text-sm">AI Lab, IIT Delhi</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-4">

          {/* IDLE — Book a Ride */}
          {phase === 'idle' && (
            <motion.button onClick={() => setPhase('searching')}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-[#FF0D99] font-mono font-bold text-white text-sm tracking-[0.3em] uppercase"
              style={{ boxShadow: '0 0 30px rgba(255,13,153,0.4)' }}>
              Book a Ride
            </motion.button>
          )}

          {/* SEARCHING — spinner */}
          {phase === 'searching' && (
            <div className="flex items-center gap-3 py-2">
              <motion.span className="w-2.5 h-2.5 rounded-full bg-[#FF0D99] flex-shrink-0"
                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
              <p className="font-mono text-white/40 text-sm tracking-widest">Searching nearby drivers...</p>
            </div>
          )}

          {/* CHOOSE — car cards */}
          {phase === 'choose' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <p className="font-mono text-[9px] tracking-[0.4em] text-white/30 uppercase mb-1">Choose a Ride</p>
              {CARS.map(car => (
                <motion.button key={car.id} onClick={() => handleChooseCar(car.id)}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,13,153,0.6)' }} whileTap={{ scale: 0.97 }}
                  className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-left transition-all duration-150">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-white text-sm">{car.label}</span>
                    <span className="font-mono text-[#FF0D99] font-bold text-sm">{car.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white/40 text-xs">{car.car}</span>
                    <Stars rating={car.rating} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-white/35 text-xs">👤 {car.driver}</span>
                    <span className="font-mono text-green-400 text-xs">🕐 {car.eta}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* BOOKING — status */}
          {phase === 'booking' && (
            <div className="flex items-center gap-3 py-2">
              <motion.span className="w-2.5 h-2.5 rounded-full bg-[#FF0D99] flex-shrink-0"
                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.25, repeat: Infinity }} />
              <p className="font-mono text-white/40 text-sm">Booking {selected?.label}...</p>
            </div>
          )}

          {/* BOOKED — confirmation card */}
          {phase === 'booked' && selected && (
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-green-500/40 bg-green-500/5 px-5 py-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <p className="font-mono font-bold text-green-400 text-base tracking-wide">Ride Booked!</p>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Driver</p>
                  <p className="font-mono text-white text-sm font-medium">{selected.driver}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Vehicle</p>
                  <p className="font-mono text-white text-sm font-medium">{selected.car}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">ETA</p>
                  <p className="font-mono text-green-400 text-sm font-medium">{selected.eta}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Fare</p>
                  <p className="font-mono text-[#FF0D99] text-sm font-bold">{selected.price}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">OTP</p>
                  <p className="font-mono text-white text-sm font-bold tracking-[0.3em]">4821</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">Rating</p>
                  <Stars rating={selected.rating} />
                </div>
              </div>
              <motion.button onClick={onNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3 mt-1 rounded-xl bg-[#FF0D99] font-mono font-bold text-white text-sm tracking-widest uppercase"
                style={{ boxShadow: '0 0 20px rgba(255,13,153,0.3)' }}>
                Continue →
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══ RIGHT HALF — Figure + CLI ═══ */}
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-1/2 flex flex-col overflow-hidden"
      >
        {/* Figure */}
        <div className="flex-1 flex items-end justify-center pb-4 pt-16">
          <CodingFigure typing={typing} />
        </div>

        {/* CLI */}
        <div className="h-1/2 mx-5 mb-5 rounded-2xl bg-[#080808] border border-white/10 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="font-mono text-[9px] text-white/20 tracking-widest ml-3 uppercase">terminal — bash</span>
          </div>
          <CLIOutput lines={cliLines} typing={typing} phase={phase} onCarClick={handleChooseCar} />
        </div>
      </motion.div>
    </div>
  )
}
