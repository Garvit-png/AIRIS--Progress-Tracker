import React, { forwardRef } from 'react'

const CracksEffect = forwardRef(({ className }, ref) => {
  return (
    <div ref={ref} className={`absolute pointer-events-none ${className}`} style={{ width: '400px', height: '400px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pink-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* The cracks will be drawn by animating stroke-dashoffset */}
        <g stroke="#FF008C" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#pink-glow)" className="cracks-paths">
          {/* Top Left */}
          <path d="M 200 200 L 170 160 L 160 110 L 110 90 L 70 50" strokeDasharray="300" strokeDashoffset="300" />
          <path d="M 170 160 L 120 150 L 90 120" strokeDasharray="150" strokeDashoffset="150" />
          
          {/* Top Right */}
          <path d="M 200 200 L 240 170 L 270 120 L 320 90 L 340 40" strokeDasharray="300" strokeDashoffset="300" />
          <path d="M 240 170 L 280 160 L 310 180" strokeDasharray="150" strokeDashoffset="150" />

          {/* Bottom Left */}
          <path d="M 200 200 L 160 230 L 130 280 L 80 300 L 50 350" strokeDasharray="300" strokeDashoffset="300" />
          <path d="M 160 230 L 110 240 L 90 270" strokeDasharray="150" strokeDashoffset="150" />
          <path d="M 130 280 L 110 320" strokeDasharray="100" strokeDashoffset="100" />

          {/* Bottom Right */}
          <path d="M 200 200 L 230 240 L 280 270 L 310 320 L 350 360" strokeDasharray="300" strokeDashoffset="300" />
          <path d="M 230 240 L 260 220 L 320 230" strokeDasharray="150" strokeDashoffset="150" />
          <path d="M 280 270 L 320 290" strokeDasharray="100" strokeDashoffset="100" />

          {/* Straight Left & Right */}
          <path d="M 200 200 L 140 190 L 80 200 L 30 180" strokeDasharray="250" strokeDashoffset="250" />
          <path d="M 200 200 L 260 210 L 330 190 L 370 200" strokeDasharray="250" strokeDashoffset="250" />
        </g>
      </svg>
    </div>
  )
})

CracksEffect.displayName = 'CracksEffect'
export default CracksEffect
