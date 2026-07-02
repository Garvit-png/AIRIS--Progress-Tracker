import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatMakesAirisDifferentSection({ onNext, onPrev }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Fast Animation Timeline
    const t1 = setTimeout(() => setStage(1), 300);    // Lots of pillars drop
    const t2 = setTimeout(() => setStage(2), 2200);   // Big AIRIS pillar drops
    const t3 = setTimeout(() => setStage(3), 3200);   // AIRIS moves up to become heading, pillars vanish
    const t4 = setTimeout(() => setStage(4), 3800);   // Text reveals

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, []);

  const features = [
    { title: 'Research Paper Driven', text: 'Study landmark papers, not just textbooks.' },
    { title: 'Mathematics First', text: 'Understand mathematical intuition before implementation.' },
    { title: 'Historical Context', text: 'Learn algorithms via the problems that led to them.' },
    { title: 'Bridge Chapters', text: 'Dedicated chapters for mathematical foundations.' },
    { title: 'Ideas Before Tools', text: 'Concepts > Algorithms > Frameworks.' },
    { title: 'Research Discussions', text: 'Conclude topics with paper-based discussions.' }
  ];

  // Generate random background pillars
  const bgPillars = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 1200, // Spread across screen
      w: 20 + Math.random() * 40,
      h: 80 + Math.random() * 200,
      rot: (Math.random() - 0.5) * 30, // Tedhe medhe (tilted)
      delay: Math.random() * 1.5, // Staggered over 1.5s
      zIndex: Math.random() > 0.5 ? 10 : 5 // Some in front, some in back
    }));
  }, []);

  // Heavy Smoke Component
  const SmokeEffect = ({ delay, scale = 1, isMassive = false }) => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center items-end pointer-events-none z-40">
      {[...Array(isMassive ? 15 : 5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            width: 20 * scale, 
            height: 20 * scale,
            background: 'radial-gradient(circle, rgba(150,150,150,0.8) 0%, rgba(30,30,30,0) 70%)',
            filter: 'blur(4px)'
          }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 3, 5],
            x: (Math.random() - 0.5) * (isMassive ? 300 : 100) * scale,
            y: -(Math.random() * (isMassive ? 100 : 40) * scale)
          }}
          transition={{ duration: isMassive ? 1.2 : 0.6, delay: delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );

  return (
    <motion.div 
      className="w-full h-screen bg-[#000000] flex flex-col items-center relative overflow-hidden text-white font-sans perspective-[1000px]"
      animate={
        stage === 1 ? { y: [0, 2, -2, 1, -1, 0] } : 
        stage === 2 ? { y: [0, 15, -15, 10, -10, 5, -5, 0] } : { y: 0 }
      } 
      transition={{ duration: stage === 2 ? 0.5 : 2, ease: "easeInOut" }}
    >
      
      {/* HORIZON LINE (Middle of screen) */}
      <div className="absolute top-[55vh] left-0 right-0 h-0 flex justify-center items-end">
        
        {/* RANDOM BG PILLARS */}
        <AnimatePresence>
          {stage >= 1 && stage < 3 && bgPillars.map((pillar) => (
            <motion.div
              key={pillar.id}
              className="absolute bottom-0 origin-bottom flex justify-center"
              style={{ left: `calc(50% + ${pillar.x}px)`, zIndex: pillar.zIndex }}
              initial={{ y: '-100vh', opacity: 1, rotateZ: pillar.rot }}
              animate={{ y: 0 }}
              exit={{ y: '50vh', opacity: 0, transition: { duration: 0.5 } }}
              transition={{ y: { duration: 0.3, delay: pillar.delay, ease: 'easeIn' } }}
            >
              {/* 3D Box look */}
              <div 
                className="bg-gradient-to-br from-[#333] via-[#111] to-[#000] border-l-2 border-t-2 border-[#555] shadow-[10px_0_20px_rgba(0,0,0,0.8)]"
                style={{ width: `${pillar.w}px`, height: `${pillar.h}px` }}
              />
              <SmokeEffect delay={pillar.delay + 0.3} scale={0.5} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* BIG CENTRAL AIRIS PILLAR */}
        <AnimatePresence>
          {stage >= 2 && stage < 3 && (
            <motion.div
              className="absolute bottom-0 flex flex-col items-center z-30 origin-bottom"
              initial={{ y: '-150vh' }}
              animate={{ y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 100 }}
              transition={{ y: { duration: 0.3, ease: 'easeIn' }, exit: { duration: 0.4 } }}
            >
              {/* Big 3D Pillar Body */}
              <div className="w-32 h-[300px] bg-gradient-to-br from-[#2a2a2a] via-[#111] to-[#050505] border-l-[3px] border-t-[3px] border-[#666] shadow-[20px_0_30px_rgba(0,0,0,0.9)]" />

              <SmokeEffect delay={0.3} scale={2} isMassive={true} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* AIRIS TEXT LOGO */}
      {/* Starts on the pillar, then shoots up to become the heading */}
      <motion.div
        className="absolute z-50 flex flex-col items-center justify-center whitespace-nowrap"
        initial={{ top: 'calc(55vh - 380px)', scale: 2, opacity: 0 }} // Resting on big pillar
        animate={
          stage === 2 ? { opacity: 1, top: 'calc(55vh - 380px)', scale: 2 } : // Visible on pillar
          stage >= 3 ? { opacity: 1, top: '10vh', scale: 1 } : // Shoots up
          { opacity: 0 }
        }
        transition={
          stage >= 3 ? { duration: 0.6, type: 'spring', bounce: 0.3 } : 
          { duration: 0.1, delay: 0.2 } // Delay slightly so it appears right when pillar hits
        }
      >
        <div className="relative flex items-center justify-center">
          {/* Prefix Text (Fades in when it becomes a heading) */}
          <motion.span 
            className="text-white text-3xl md:text-5xl font-light tracking-wide mr-4"
            initial={{ opacity: 0, x: -20 }}
            animate={stage >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            WHAT MAKES
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-[#FF008C]" style={{ textShadow: '0 0 30px rgba(255,0,140,0.5)' }}>
            AIRIS
          </h1>

          {/* Suffix Text (Fades in when it becomes a heading) */}
          <motion.span 
            className="text-white text-3xl md:text-5xl font-light tracking-wide ml-4"
            initial={{ opacity: 0, x: 20 }}
            animate={stage >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
             DIFFERENT
          </motion.span>
        </div>
      </motion.div>

      {/* TEXT GRID AT BOTTOM */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div 
            className="absolute top-[35vh] left-0 right-0 z-40 flex justify-center px-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {features.map((feature, i) => (
                <motion.div 
                  key={i} 
                  className="flex flex-col items-center text-center bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl shadow-lg hover:border-[#FF008C]/30 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <h3 className="text-[#FF008C] text-lg md:text-xl font-bold mb-3 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base font-light">
                    {feature.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}
