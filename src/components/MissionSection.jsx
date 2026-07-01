"use client";
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const milestones = [
  "Build Deep Mathematical Intuition",
  "Promote Research-Oriented Learning",
  "Encourage Scientific Curiosity",
  "Create an Open AI Education Ecosystem",
  "Connect Students with Modern AI Research",
  "Develop Future Researchers, Not Just Software Engineers"
];

// Coordinate mapping for the nodes along the winding path
const nodeCoords = [
  { x: 150, y: 480 },
  { x: 100, y: 400 },
  { x: 220, y: 320 },
  { x: 140, y: 240 },
  { x: 240, y: 160 },
  { x: 200, y: 80 } // Summit
];

export default function MissionSection({ onNext, onPrev }) {
  const containerControls = useAnimation();
  const mountainControls = useAnimation();
  const flagGroupControls = useAnimation();
  const flagClothControls = useAnimation();
  const particleControls = useAnimation();
  const pathControls = useAnimation();
  const listPathControls = useAnimation();
  const summitGlowControls = useAnimation();
  
  const textContainerControls = useAnimation();

  // Create animation controls dynamically for each milestone
  const nodeControls = milestones.map(() => useAnimation());
  const milestoneTextControls = milestones.map(() => useAnimation());

  useEffect(() => {
    let isMounted = true;

    async function sequence() {
      // Small pause before sequence begins
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      // Scene 1 - Mountain Arrival
      textContainerControls.start({ opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } });
      await mountainControls.start({ 
        opacity: 1, 
        y: 0, 
        transition: { duration: 1.5, ease: "easeOut" } 
      });
      
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;

      // Scene 2 - The Flag Planting
      // Swoop in from top left
      flagGroupControls.set({ opacity: 1, x: -100, y: -100, rotate: -20 });
      await flagGroupControls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.6, ease: "easeIn" }
      });
      
      // Camera shake on impact (simulated by shaking the mountain container slightly)
      mountainControls.start({
        y: [0, 8, -6, 4, -2, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
      });

      // Particles burst at summit
      particleControls.start({
        scale: [0, 1.5],
        opacity: [1, 0],
        transition: { duration: 0.6, ease: "easeOut" }
      });

      // Start gentle flag waving loop
      flagClothControls.start({
        skewY: [0, -5, 0, 5, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });

      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      // Scene 3 & 4 - Ascent (Path Drawing & Milestone reveals)
      // Path takes 3.5 seconds to draw. We will trigger nodes based on timing.
      pathControls.start({
        pathLength: 1,
        transition: { duration: 4, ease: "linear" }
      });
      
      listPathControls.start({
        height: "100%",
        transition: { duration: 4, ease: "linear" }
      });

      for (let i = 0; i < milestones.length; i++) {
        // Fade in the node dot
        nodeControls[i].start({
          scale: 1, opacity: 1,
          transition: { duration: 0.4, type: "spring", bounce: 0.5 }
        });
        
        // Fade in the text milestone
        milestoneTextControls[i].start({
          opacity: 1, x: 0,
          transition: { duration: 0.4, ease: "easeOut" }
        });

        if (i < milestones.length - 1) {
          // Wait for path to reach next node
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Scene 5 - Final State
      summitGlowControls.start({
        opacity: [0, 0.6, 0.4],
        scale: [0.8, 1.5, 1.3],
        transition: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
      });

    }

    sequence();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#000000] text-white overflow-hidden relative font-sans">
      
      {/* LEFT COLUMN - Visuals (Mountain) */}
      <div className="flex-1 relative flex items-center justify-center p-8 min-h-[50vh] md:min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={mountainControls}
          className="relative w-full max-w-[500px] aspect-square flex items-end justify-center"
        >
          {/* Soft background glow for the mountain */}
          <div className="absolute bottom-0 w-3/4 h-1/2 bg-[#FF008C] opacity-10 blur-[100px] rounded-full pointer-events-none" />
          
          <svg viewBox="0 0 400 500" className="w-full h-full overflow-visible z-10 drop-shadow-2xl">
            {/* Background Peak */}
            <polygon points="200,80 40,500 360,500" fill="#FF008C" opacity="0.1" />
            
            {/* Left Sub-Peak */}
            <polygon points="120,240 0,500 240,500" fill="#FF008C" opacity="0.15" />
            
            {/* Right Sub-Peak */}
            <polygon points="280,280 160,500 400,500" fill="#FF008C" opacity="0.12" />
            
            {/* Core Mountain Fill */}
            <polygon points="200,80 140,500 260,500" fill="#FF008C" opacity="0.25" />
            
            {/* Geometric Shadow Overlay */}
            <polygon points="200,80 200,500 360,500" fill="#000000" opacity="0.4" />
            
            {/* Summit Glow */}
            <motion.circle 
              cx="200" cy="80" r="40" 
              fill="#FF008C" 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={summitGlowControls}
              style={{ filter: "blur(20px)" }}
            />

            {/* Glowing Path */}
            <motion.path 
              d={`M ${nodeCoords[0].x} ${nodeCoords[0].y} 
                  L ${nodeCoords[1].x} ${nodeCoords[1].y} 
                  L ${nodeCoords[2].x} ${nodeCoords[2].y} 
                  L ${nodeCoords[3].x} ${nodeCoords[3].y} 
                  L ${nodeCoords[4].x} ${nodeCoords[4].y} 
                  L ${nodeCoords[5].x} ${nodeCoords[5].y}`}
              fill="none" 
              stroke="#FF008C" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={pathControls}
              className="drop-shadow-[0_0_8px_rgba(255,0,140,0.8)]"
            />

            {/* Milestone Nodes */}
            {nodeCoords.map((coord, i) => (
              <motion.g 
                key={i} 
                initial={{ scale: 0, opacity: 0 }}
                animate={nodeControls[i]}
              >
                <circle cx={coord.x} cy={coord.y} r="8" fill="#000000" stroke="#FF008C" strokeWidth="2" />
                <circle cx={coord.x} cy={coord.y} r="3" fill="#FFFFFF" className="drop-shadow-[0_0_5px_rgba(255,255,255,1)]" />
              </motion.g>
            ))}

            {/* Flag Group */}
            <motion.g initial={{ opacity: 0 }} animate={flagGroupControls}>
              {/* Pole */}
              <line x1="200" y1="80" x2="200" y2="15" stroke="#FFFFFF" strokeWidth="2" />
              {/* Flag Cloth */}
              <motion.g animate={flagClothControls} style={{ transformOrigin: "200px 15px" }}>
                <path d="M 200 15 L 245 25 L 245 45 L 200 35 Z" fill="#FF008C" />
                {/* Simplified AIRIS Logo on Flag */}
                <circle cx="218" cy="30" r="4" fill="#FFFFFF" />
              </motion.g>
              
              {/* Impact Particles */}
              <motion.g initial={{ opacity: 0 }} animate={particleControls} style={{ transformOrigin: "200px 80px" }}>
                <circle cx="200" cy="80" r="20" fill="none" stroke="#FF008C" strokeWidth="1" />
                <circle cx="180" cy="70" r="2" fill="#FFFFFF" />
                <circle cx="220" cy="75" r="2" fill="#FFFFFF" />
                <circle cx="210" cy="95" r="2" fill="#FFFFFF" />
              </motion.g>
            </motion.g>

          </svg>
        </motion.div>
      </div>

      {/* RIGHT COLUMN - Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 z-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={textContainerControls}>
          <h2 className="font-mono text-sm md:text-base text-[#FF008C] tracking-[0.3em] uppercase mb-4 font-semibold drop-shadow-[0_0_10px_rgba(255,0,140,0.5)]">
            Mission
          </h2>
          
          <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed mb-16 max-w-[500px]">
            Our mission is to build researchers, innovators, and scientific thinkers by helping students climb from strong fundamentals to meaningful AI research.
          </p>

          <div className="flex flex-col gap-8 relative border-l border-white/10 pl-6 ml-2">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={milestoneTextControls[index]}
                className="relative"
              >
                {/* Connecting Dot Indicator for Text List */}
                <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#000000] border-2 border-[#FF008C] shadow-[0_0_10px_rgba(255,0,140,0.8)]" />
                
                <h3 className="font-mono text-xs text-white/50 mb-1 tracking-widest uppercase">
                  Level {index + 1}
                </h3>
                <p className="text-white text-base md:text-lg font-medium tracking-wide">
                  {milestone}
                </p>
              </motion.div>
            ))}
            
            {/* A faint gradient line overlay for the border list to show completion */}
            <motion.div 
              className="absolute left-[-1px] top-0 w-[2px] bg-gradient-to-b from-[#FF008C] to-transparent shadow-[0_0_10px_rgba(255,0,140,0.5)] origin-top"
              initial={{ height: "0%" }}
              animate={listPathControls}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Next/Prev Navigation controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="fixed bottom-8 right-8 md:right-16 flex gap-12 z-30"
      >
        <button onClick={onPrev} className="group flex flex-col items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover:text-white transition-colors rotate-180">
            <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
          </svg>
          <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase group-hover:text-white">Back</span>
        </button>
        
        <button onClick={onNext} className="group flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase group-hover:text-[#FF008C]">Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover:text-[#FF008C] transition-colors animate-bounce mt-1">
            <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
          </svg>
        </button>
      </motion.div>

    </div>
  );
}
