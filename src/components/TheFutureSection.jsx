import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Generate a column of random letters with a specific target at the end.
const generateReel = (targetLetter, length = 60) => {
  const letters = [];
  for (let i = 0; i < length - 1; i++) {
    letters.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
  }
  letters.push(targetLetter);
  return letters;
};

const TARGETS = ["A", "I", "R", "I", "S"];
const ITEM_HEIGHT = 120; // Height of each letter cell in px

export default function TheFutureSection({ onNext, onPrev }) {
  const [phase, setPhase] = useState("darkness"); // darkness -> spinning -> stopped -> dissolving -> sliding -> text
  
  const containerControls = useAnimation();
  const reelControls = TARGETS.map(() => useAnimation());
  const boxControls = TARGETS.map(() => useAnimation());
  const typographyControls = useAnimation();
  const titleControls = useAnimation();
  const paragraphControls = useAnimation();

  // Reels generation
  // We use useMemo-like pattern inside state to avoid regeneration
  const [reels] = useState(() => TARGETS.map(target => generateReel(target, 70)));

  useEffect(() => {
    let isMounted = true;

    async function sequence() {
      // 1. Scene 1: Empty Space & Reel Reveal
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      
      setPhase("spinning");
      await containerControls.start({
        opacity: 1,
        transition: { duration: 1.5, ease: "easeInOut" }
      });
      
      // 2. Scene 2 & 3: Spinning and Blur
      // We animate all reels simultaneously but with slight random stagger for realism
      if (!isMounted) return;
      
      const spinPromises = reels.map((reel, index) => {
        // The destination is the final item, but because flex column flows down,
        // we move the container UP by (length - 1) * ITEM_HEIGHT
        const destY = -((reel.length - 1) * ITEM_HEIGHT);
        
        // We start the spin but don't await it to finish immediately
        return reelControls[index].start({
          y: destY,
          filter: ["blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"],
          transition: {
            y: {
              duration: 1.0 + index * 0.2, // Extremely fast spin
              ease: [0.1, 0.7, 0.1, 1] 
            },
            filter: {
              duration: 1.0 + index * 0.2,
              times: [0, 0.2, 0.8, 1], 
              ease: "linear"
            }
          }
        });
      });

      // Camera push in (tension building)
      containerControls.start({
        scale: 1.05,
        transition: { duration: 2.0, ease: "linear" } 
      });

      await Promise.all(spinPromises); // Wait for fast spinning to finish


      // Scene 4: Hold moment
      if (!isMounted) return;
      setPhase("stopped");
      await new Promise(r => setTimeout(r, 400));

      // Scene 5: Dissolve boxes, leave typography
      if (!isMounted) return;
      setPhase("dissolving");
      
      await Promise.all(TARGETS.map((_, i) => boxControls[i].start({
        borderColor: "rgba(0,0,0,0)",
        boxShadow: "none",
        backgroundColor: "transparent",
        transition: { duration: 0.5 }
      })));

      // Scene 6: Typography Slides Up
      if (!isMounted) return;
      setPhase("sliding");
      
      // Stop the zoom and reset scale slightly while sliding up
      containerControls.start({
        scale: 1,
        y: -150, // Move the word AIRIS up
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      });

      await new Promise(r => setTimeout(r, 300));

      // Reveal title "THE FUTURE"
      await titleControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      });

      await new Promise(r => setTimeout(r, 200));

      // Scene 7: Reveal final text via clip-path mask
      setPhase("text");
      await paragraphControls.start({
        clipPath: "inset(0% 0% 0% 0%)",
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      });

    }

    sequence();

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-white relative font-sans overflow-hidden items-center justify-center">
      
      {/* Subtle Ambient Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 80%)' }}></div>
      
      {/* Mechanical Reels Container */}
      <motion.div 
        className="flex gap-2 md:gap-4 z-20"
        initial={{ opacity: 0, scale: 0.95, y: 0 }}
        animate={containerControls}
      >
        {reels.map((reel, index) => (
          <motion.div 
            key={index}
            className="w-16 sm:w-20 md:w-32 h-[120px] overflow-hidden border border-white/10 rounded-sm bg-[#050505] relative flex flex-col items-center shadow-[inset_0px_0px_30px_rgba(0,0,0,0.8)]"
            animate={boxControls[index]}
            initial={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#050505" }}
          >
            {/* The gradient masks inside the box to give depth (cylinder illusion) */}
            <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black via-transparent to-black ${phase === 'dissolving' || phase === 'sliding' || phase === 'text' ? 'opacity-0 transition-opacity duration-1000' : 'opacity-100'}`} />

            <motion.div
              className="flex flex-col items-center w-full relative z-0"
              initial={{ y: 0 }}
              animate={reelControls[index]}
            >
              {reel.map((letter, i) => {
                const isTarget = i === reel.length - 1;
                return (
                  <div 
                    key={i} 
                    className="flex justify-center items-center w-full"
                    style={{ height: `${ITEM_HEIGHT}px` }}
                  >
                    <span 
                      className={`font-mono font-medium text-4xl sm:text-5xl md:text-7xl ${isTarget && (phase === 'stopped' || phase === 'dissolving' || phase === 'sliding' || phase === 'text') ? 'text-white drop-shadow-[0_0_15px_rgba(255,0,140,0.8)]' : 'text-white/80'}`}
                    >
                      {letter}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Title & Paragraph Container (Positioned absolutely below the reels center) */}
      <div className="absolute top-[50%] mt-20 flex flex-col items-center z-20 w-full px-6">
        <motion.h2 
          className="font-mono text-xl md:text-2xl font-bold tracking-[0.3em] uppercase mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={titleControls}
        >
          THE <span className="text-[#FF008C] drop-shadow-[0_0_8px_rgba(255,0,140,0.5)]">FUTURE</span>
        </motion.h2>

        <motion.div 
          className="max-w-[700px] text-center"
          initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={paragraphControls}
        >
          <p className="font-serif text-lg md:text-2xl font-light text-white/90 leading-relaxed md:leading-[1.8]">
            "Our long-term vision is not simply to teach Artificial Intelligence, but to transform how the world learns, researches, and advances it—building an education model that inspires curiosity, innovation, and scientific discovery."
          </p>
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
        
        {/* Intentionally omitting NEXT button here if this is the final slide, but we'll include it in case more slides are added */}
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
