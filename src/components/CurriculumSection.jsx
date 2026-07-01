import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const worlds = [
  { id: "I", title: "Understanding Intelligence" },
  { id: "II", title: "Language of Intelligence (Math)" },
  { id: "III", title: "Learning Theory" },
  { id: "IV", title: "Classical Machine Learning" },
  { id: "V", title: "Neural Networks & Representation" },
  { id: "VI", title: "Deep Learning" },
  { id: "VII", title: "Computer Vision" },
  { id: "VIII", title: "Natural Language Processing" },
  { id: "IX", title: "Generative AI" },
  { id: "X", title: "Reinforcement Learning" },
  { id: "XI", title: "Multi-Agent Systems" },
  { id: "XII", title: "AI Systems Engineering" },
  { id: "XIII", title: "Frontiers of AI Research" },
  { id: "XIV", title: "AI for Science & Society" },
  { id: "XV", title: "Research Thesis" },
];

export default function CurriculumSection({ onNext, onPrev }) {
  const paperControls = useAnimation();
  const foldControls = useAnimation();
  const windControls = useAnimation();
  const cardControls = worlds.map(() => useAnimation());
  const headerControls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    async function runSequence() {
      await new Promise(r => setTimeout(r, 600));
      if (!isMounted) return;

      // 1. Paper slides up smoothly
      await paperControls.start({
        y: 0,
        opacity: 1,
        rotateZ: 0,
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
      });

      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;

      // 2. Wind begins to blow extremely fast and fold flutters heavily
      windControls.start({
        x: ["-100vw", "100vw"],
        opacity: [0, 1, 1, 0], // Flash of wind
        transition: { duration: 0.5, ease: "linear", repeat: 2 } // Extremely fast wind repeats
      });

      // Vigorously wave the fold
      await foldControls.start({
        scaleY: [1, 1.8, 0.5, 2.5, 0.4, 3.5], // Extreme flutter
        rotate: [0, -15, 10, -30, 20, -45], // Wild waving
        transition: { duration: 0.9, ease: "easeInOut" }
      });

      if (!isMounted) return;

      // 3. The Big Gust: Paper rips off and gets blown away violently
      paperControls.start({
        x: "150vw",
        y: "-30vh", 
        rotateZ: 45, // Tumbles away
        rotateY: 65, // Simulates heavy lifting/curling off
        scale: 0.8,
        opacity: [1, 1, 0], 
        transition: { duration: 0.7, ease: "easeIn" } // Very fast rip
      });

      // Extra wind burst to sell the effect
      windControls.start({
        x: ["-100vw", "150vw"],
        opacity: [0, 1, 0],
        transition: { duration: 0.5, ease: "linear" }
      });

      await new Promise(r => setTimeout(r, 400)); 
      if (!isMounted) return;
      
      // 4. Show Curriculum beautifully
      await headerControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      });

      // Show cards sequentially rapidly
      for (let i = 0; i < worlds.length; i++) {
        cardControls[i].start({
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" }
        });
        await new Promise(r => setTimeout(r, 60)); // Extremely rapid elegant cascade
      }
    }

    runSequence();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-white relative font-sans overflow-hidden items-center justify-center p-4 md:p-8" style={{ perspective: '1200px' }}>
      
      {/* ---------------- BACKGROUND / ROADMAP LAYER (Z-10) ---------------- */}
      <div className="absolute inset-0 z-10 flex flex-col items-center pt-8 md:pt-12 px-4 md:px-12 w-full max-w-7xl mx-auto h-full overflow-hidden">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={headerControls} className="text-center mb-10 shrink-0 mt-8">
          <h1 className="font-mono text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,0,140,0.8)] text-[#FF008C]">
            AIRIS CURRICULUM
          </h1>
          <p className="font-serif text-sm md:text-base font-light text-white/80 max-w-3xl mx-auto italic leading-relaxed">
            "The curriculum is designed as one continuous journey where every world builds naturally upon the previous one, guiding students from first principles to original research."
          </p>
        </motion.div>

        {/* Beautiful Manageable Grid for Worlds */}
        <div className="w-full flex-1 overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full px-2 md:px-8">
            {worlds.map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={cardControls[index]}
                className="group flex items-center bg-[#000000] border border-white/10 rounded-xl p-4 md:p-6 transition-all hover:bg-[#FF008C]/5 hover:border-[#FF008C]/50 hover:shadow-[0_0_30px_rgba(255,0,140,0.2)] relative"
              >
                {/* World Number Badge */}
                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#FF008C] bg-[#FF008C]/10 flex items-center justify-center mr-4 group-hover:bg-[#FF008C] transition-colors">
                  <span className="font-mono text-[#FF008C] text-sm md:text-base font-bold group-hover:text-black">
                    {world.id}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm md:text-base tracking-wide leading-tight group-hover:text-[#FF008C] transition-colors">
                    {world.title}
                  </h3>
                </div>

                <div className="absolute -right-3 md:-right-4 top-1/2 w-1.5 h-1.5 rounded-full bg-white/20 hidden lg:block group-hover:bg-[#FF008C] group-hover:shadow-[0_0_10px_#FF008C]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- FOREGROUND / BLUEPRINT LAYER (Z-20) ---------------- */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ y: "100vh", opacity: 0, rotateZ: 0, rotateY: 0, x: 0 }}
          animate={paperControls}
          style={{ transformOrigin: "bottom left" }} // Essential for peeling illusion
          className="relative w-[90%] md:w-[85%] h-[85vh] bg-[#F5F5F5] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/40 overflow-hidden flex items-start justify-center pt-8"
        >
          {/* Subtle Grid Lines on Blueprint */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />

          {/* CONFIDENTIAL STAMP */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
            <div className="border-[6px] border-[#FF008C] text-[#FF008C] font-mono text-5xl md:text-7xl font-bold px-10 py-3 uppercase tracking-[0.3em] rotate-[-25deg] drop-shadow-[0_0_20px_rgba(255,0,140,0.6)]">
              CONFIDENTIAL
            </div>
          </div>

          {/* Bottom Left Fold Illusion */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#000000] via-transparent to-transparent pointer-events-none z-10" />
          
          {/* Animated Waving Fold */}
          <motion.div 
            animate={foldControls}
            style={{ transformOrigin: "bottom left", clipPath: "polygon(0 100%, 100% 100%, 0 0)" }}
            className="absolute bottom-0 left-0 w-24 h-24 bg-[#E0E0E0] shadow-[10px_-10px_20px_rgba(0,0,0,0.3)] z-10" 
          />

        </motion.div>
      </div>

      {/* ---------------- WIND ANIMATION LAYER (Z-30) ---------------- */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: "-100vw", opacity: 0 }}
          animate={windControls}
          className="w-[150vw] h-full flex flex-col justify-center gap-12 mix-blend-screen"
        >
          {/* Several swooping wind lines (thicker and highly visible) */}
          <svg width="100%" height="100%" viewBox="0 0 1000 800" fill="none" preserveAspectRatio="none">
            <path d="M0 200 Q 300 220 500 180 T 1000 200" stroke="url(#windGradient)" strokeWidth="8" strokeLinecap="round" opacity="1" />
            <path d="M-100 400 Q 200 450 600 380 T 1200 400" stroke="url(#windGradient)" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
            <path d="M-50 600 Q 400 580 800 620 T 1500 600" stroke="url(#windGradient)" strokeWidth="6" strokeLinecap="round" opacity="1" />
            <path d="M100 100 Q 500 50 800 120 T 1300 80" stroke="url(#windGradient)" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
            
            <defs>
              <linearGradient id="windGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

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
