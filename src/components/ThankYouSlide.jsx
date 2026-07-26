import React from 'react'
import { motion } from 'framer-motion'

export default function ThankYouSlide({ onPrev }) {
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

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FF0D99]/6 blur-[130px] rounded-full" />
      </div>

      {/* Thank You title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-mono font-extrabold text-white text-center mb-12 relative z-10"
        style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
      >
        Thank <span className="text-[#FF0D99]">You!</span>
      </motion.h1>

      {/* Two QR cards */}
      <div className="flex items-start justify-center gap-14 relative z-10">

        {/* Left — AIRIS QR */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            style={{ boxShadow: '0 0 30px rgba(255,13,153,0.1)' }}>
            <img src="/qr.png" alt="AIRIS QR"
              className="w-52 h-52 object-contain rounded-xl" />
          </div>
          <p className="font-mono text-white/55 text-sm text-center leading-relaxed max-w-[220px]">
            Scan the QR code to stay connected and updated with <span className="text-[#FF0D99] font-semibold">AIRIS.</span>
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-px bg-white/10 self-stretch origin-center"
        />

        {/* Right — Instagram QR */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            style={{ boxShadow: '0 0 30px rgba(255,13,153,0.1)' }}>
            <img src="/instaQR.png" alt="Instagram QR"
              className="w-52 h-52 object-contain rounded-xl" />
          </div>
          <p className="font-mono text-white/55 text-sm text-center leading-relaxed max-w-[220px]">
            Follow us on <span className="text-[#FF0D99] font-semibold">Instagram</span> for updates and announcements.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
