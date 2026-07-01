import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ecosystemItems = [
  "Master Curriculum",
  "Instructor Guides",
  "Research Reading Program",
  "AI Labs",
  "Workshops",
  "Projects",
  "Website",
  "Documentation",
  "Research Groups",
  "Annual Symposium",
  "Community Events"
];

export default function EcosystemSection({ onNext, onPrev }) {
  const [phase, setPhase] = useState("hidden");
  const textControls = useAnimation();
  const listControls = ecosystemItems.map(() => useAnimation());
  const landscapeControls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    async function runSequence() {
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // 1. Main Text fades in
      await textControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1.0, ease: "easeOut" }
      });

      // 2. List items pop in sequentially
      for (let i = 0; i < ecosystemItems.length; i++) {
        listControls[i].start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" }
        });
        await new Promise(r => setTimeout(r, 100)); // Stagger
      }

      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      // 3. Landscape (Clouds and Grass) pops in
      await landscapeControls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
      });
    }

    runSequence();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-white relative font-sans overflow-hidden items-center justify-center">
      
      {/* ---------------- CONTENT LAYER (Z-20) ---------------- */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl px-4 md:px-8 pb-32">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={textControls}
          className="text-3xl md:text-5xl font-mono font-bold tracking-widest uppercase mb-12 text-center text-[#FF008C] drop-shadow-[0_0_15px_rgba(255,0,140,0.6)]"
        >
          AIRIS is more than a curriculum.
          <br/>
          <span className="text-xl md:text-2xl text-white mt-4 block font-light tracking-widest drop-shadow-none">It consists of:</span>
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl">
          {ecosystemItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={listControls[index]}
              className="px-4 py-2 border border-[#FF008C]/30 bg-black/50 backdrop-blur-sm rounded-full text-sm md:text-base tracking-widest text-white shadow-[0_0_15px_rgba(255,0,140,0.2)] hover:border-[#FF008C] hover:shadow-[0_0_20px_rgba(255,0,140,0.5)] transition-all cursor-default"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ---------------- LANDSCAPE LAYER (Z-10) ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: "20vh", scale: 1.1 }}
        animate={landscapeControls}
        className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between"
      >
        <div 
          className="absolute inset-0 bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: "url('/landscape.png')" }} 
        />
      </motion.div>

      {/* Navigation */}
      <div className="fixed bottom-6 right-8 md:right-16 flex gap-8 md:gap-12 z-50 pointer-events-auto">
        <button onClick={onPrev} className="group flex flex-col items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover:text-white transition-colors rotate-180">
            <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
          </svg>
          <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase group-hover:text-white">Back</span>
        </button>
        
        <button onClick={onNext} className="group flex flex-col items-center gap-1.5">
          <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase group-hover:text-[#FF008C]">Next</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover:text-[#FF008C] transition-colors animate-bounce mt-0.5">
            <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
          </svg>
        </button>
      </div>

    </div>
  );
}
