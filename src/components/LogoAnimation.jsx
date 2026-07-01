import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import CracksEffect from './CracksEffect'

gsap.registerPlugin(useGSAP)

export default function LogoAnimation({ onNext, onPrev }) {
  const containerRef = useRef(null)
  const sceneGroupRef = useRef(null)
  const logoRef = useRef(null)
  const cracksRef = useRef(null)
  const flashRef = useRef(null)
  const titleRef = useRef(null)
  const pointsRef = useRef(null)
  const particlesRef = useRef([])

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.5 })

    // Setup initial states
    gsap.set(logoRef.current, { y: -window.innerHeight, scale: 1, filter: 'blur(10px)' })
    gsap.set(cracksRef.current, { opacity: 0 })
    gsap.set('.cracks-paths', { strokeDashoffset: (i, target) => target.getAttribute('strokeDasharray') })
    gsap.set(flashRef.current, { opacity: 0 })
    gsap.set(particlesRef.current, { opacity: 0, scale: 0, x: 0, y: 0 })
    gsap.set(sceneGroupRef.current, { x: 0, y: 0 }) 
    gsap.set(titleRef.current, { opacity: 0, y: -30 })
    gsap.set(pointsRef.current, { opacity: 0, x: 50 })

    // Phase 1: Drop (Faster)
    tl.to(logoRef.current, {
      y: 0,
      filter: 'blur(0px)',
      duration: 0.25,
      ease: 'power4.in'
    })

    // Phase 2: Impact (Shake, Flash, Compress)
    tl.to(logoRef.current, {
      scaleY: 0.7,
      scaleX: 1.15,
      duration: 0.05,
      ease: 'power1.out'
    })
    
    // Screen shake
    tl.to(containerRef.current, {
      y: 10,
      yoyo: true,
      repeat: 3,
      duration: 0.04,
      ease: 'none'
    }, '<')

    // White Flash
    tl.to(flashRef.current, {
      opacity: 1,
      duration: 0.05,
      yoyo: true,
      repeat: 1
    }, '<')

    // Particles explosion
    particlesRef.current.forEach((particle, i) => {
      const angle = (i / particlesRef.current.length) * Math.PI * 2
      const radius = 120 + Math.random() * 150
      tl.to(particle, {
        opacity: 1,
        scale: Math.random() * 0.5 + 0.5,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        duration: 0.4 + Math.random() * 0.2,
        ease: 'power3.out'
      }, '<')
    })

    // Phase 3: Ground Cracks (Starts instantly on impact)
    tl.to(cracksRef.current, { opacity: 1, duration: 0.05 }, '<')
    tl.to('.cracks-paths', {
      strokeDashoffset: 0,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.02
    }, '<')

    // Phase 4: Settle (Bounce back, fade dust, soften cracks)
    tl.to(logoRef.current, {
      scaleY: 1,
      scaleX: 1,
      y: -30,
      duration: 0.2,
      ease: 'power2.out'
    })
    tl.to(logoRef.current, {
      y: 0,
      duration: 0.3,
      ease: 'bounce.out'
    })

    // Fade out particles
    tl.to(particlesRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    }, '-=0.3')

    // Soften cracks glow slightly
    tl.to(cracksRef.current, {
      opacity: 0.5,
      duration: 1,
      ease: 'power2.out'
    }, '-=0.2')

    // Phase 5: Camera Pan & Website Reveal
    // Pan the logo and cracks to the left to make room for text on the right
    tl.to(sceneGroupRef.current, {
      x: -300,
      y: 40, 
      duration: 0.8,
      ease: 'power3.inOut'
    }, '-=0.3') // start panning earlier

    // Reveal Title above
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6')

    // Reveal Points on the right
    tl.to(pointsRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '<')

  }, { scope: containerRef })

  // Generate some particle divs
  const particles = Array.from({ length: 15 }).map((_, i) => (
    <div 
      key={i}
      ref={el => particlesRef.current[i] = el}
      className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full pointer-events-none"
      style={{ transform: 'translate(-50%, -50%)', filter: 'blur(1px)' }}
    />
  ))

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background White Flash for Impact */}
      <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none z-0" />

      {/* Main Animation Scene (Logo + Cracks) - Grouped so we can pan them left together */}
      <div ref={sceneGroupRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        
        {/* Ground Cracks SVG - 3D Perspective to lay flat on the floor */}
        <div 
          className="absolute inset-0 m-auto pointer-events-none flex items-center justify-center"
          style={{ transform: 'perspective(800px) rotateX(65deg) scale(2.5)', top: '100px' }}
        >
          <CracksEffect ref={cracksRef} />
        </div>

        {/* Impact Dust Particles */}
        <div className="absolute inset-0 m-auto translate-y-14 md:translate-y-20">
          {particles}
        </div>

        {/* Center Logo */}
        <div className="relative flex flex-col items-center">
          {/* Glow behind the logo */}
          <div className="absolute inset-0 bg-[#FF008C]/15 blur-[40px] rounded-full" />
          
          <img
            ref={logoRef}
            src="/logo.png"
            alt="Company Logo"
            className="h-28 md:h-44 w-auto object-contain origin-bottom relative z-30"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>
      </div>

      {/* Revealed Elements (Navigation, Text) */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        
        {/* Title above everything */}
        <div ref={titleRef} className="absolute top-16 left-0 right-0 text-center pointer-events-auto">
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight text-white">
            Why <span className="text-[#FF008C]">AIRIS</span> Exists
          </h1>
        </div>

        {/* Points on the Right Side */}
        <div ref={pointsRef} className="absolute top-1/2 right-12 md:right-32 -translate-y-1/2 w-[45%] pointer-events-auto mt-8">
          <p className="text-white/60 mb-6 text-lg font-light">
            Modern AI education has several fundamental problems. Students often:
          </p>

          <ul className="text-white/80 space-y-4 text-left font-light md:text-lg mb-8 list-disc list-inside">
            <li>memorize algorithms without understanding them</li>
            <li>learn frameworks before mathematics</li>
            <li>follow tutorials instead of asking questions</li>
            <li>implement models without reading research papers</li>
            <li>prepare for interviews rather than scientific discovery</li>
          </ul>

          <p className="text-[#FF008C] text-xl font-medium leading-relaxed">
            AIRIS was created to address these problems through a <br className="hidden md:block"/>
            <span className="text-white font-bold">research-first educational model</span>.
          </p>
        </div>

        {/* Back Arrow — Top Left */}
        <button
          onClick={onPrev}
          className="fixed top-8 left-8 group pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-white/30 group-hover:text-[#FF008C] transition-colors duration-300"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="font-mono text-[8px] tracking-[0.3em] text-white/30 uppercase group-hover:text-white/60 transition-colors duration-300">
              Back
            </span>
          </div>
        </button>

      </div>

    </div>
  )
}
