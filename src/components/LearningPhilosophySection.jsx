import { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const tradSteps = ["Learn Algorithm", "Solve Assignment", "Give Exam", "Forget"];
const airisSteps = ["Question", "History", "Mathematics", "Research Paper", "Algorithm", "Projects", "Innovation"];

const doodlePaths = [
  "M45 10 C20 10, 20 50, 45 50 C70 50, 70 90, 45 90", // Integral
  "M70 20 L30 20 L50 50 L30 80 L70 80", // Sigma
  "M20 20 L80 20 M35 20 C35 70, 20 80, 20 80 M65 20 C65 70, 80 80, 80 80", // Pi
  "M10 50 L30 50 L40 90 L60 20 L90 20", // Root x
  "M30 30 L70 50 M30 70 L70 50 M70 50 A 10 10 0 1 1 70.01 50", // Neural Net
  "M10 80 L90 80 M20 80 C 40 20, 60 20, 80 80", // Bell curve
  "M30 20 L20 20 L20 80 L30 80 M70 20 L80 20 L80 80 L70 80", // Matrix brackets
  "M30 50 C10 30, 10 70, 30 50 C50 30, 70 30, 70 50 C90 70, 90 30, 70 50 C50 70, 30 70, 30 50" // Infinity
];

export default function LearningPhilosophySection({ onNext, onPrev }) {
  const doodleGroupControls = useAnimation();
  const titleControls = useAnimation();
  const mainLayoutControls = useAnimation();
  
  const tradControls = tradSteps.map(() => useAnimation());
  const airisNodeControls = airisSteps.map(() => useAnimation());
  const timelinePathControls = useAnimation();
  const energyDividerControls = useAnimation();
  const finalStatementControls = useAnimation();

  const [phase, setPhase] = useState("sketch");

  // Generate random doodles for the intro
  const doodles = useMemo(() => {
    const generated = [];
    for (let i = 0; i < 80; i++) {
      generated.push({
        id: i,
        path: doodlePaths[Math.floor(Math.random() * doodlePaths.length)],
        x: (Math.random() - 0.5) * 1600, 
        y: (Math.random() - 0.5) * 1000,
        scale: 0.3 + Math.random() * 0.8,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.5, // Faster draw
        duration: 0.5 + Math.random() * 0.5
      });
    }
    return generated;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function runSequence() {
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      // 1. Sketching phase
      await new Promise(r => setTimeout(r, 1200)); // Shorter wait
      if (!isMounted) return;

      setPhase("title");
      
      // Smooth, gentle pull to the top center without extreme spinning
      doodleGroupControls.start({
        scale: 0,
        opacity: 0,
        rotate: 45, // Very gentle rotation
        filter: "blur(4px)",
        transition: { duration: 0.8, ease: "anticipate" }
      });
      
      // Title solidifies
      await titleControls.start({
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
      });

      await new Promise(r => setTimeout(r, 200));
      if (!isMounted) return;

      // 2. Show Layout Framework
      setPhase("layout");
      await mainLayoutControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      });

      // Show divider
      energyDividerControls.start({ opacity: 1, scaleY: 1, transition: { duration: 0.6, ease: "easeInOut" } });

      // 3. Show Both Sides Quickly
      // We animate them in parallel for a faster reveal, or very quick stagger
      const animatePromises = [];
      
      // Left Column (Traditional) - Keeps visible
      tradSteps.forEach((step, i) => {
        animatePromises.push(
          tradControls[i].start({ 
            opacity: 1, y: 0, 
            transition: { duration: 0.3, delay: i * 0.1, ease: "easeOut" } 
          })
        );
      });

      // Right Column (AIRIS) timeline path draws fast
      timelinePathControls.start({
        pathLength: 1,
        transition: { duration: airisSteps.length * 0.15, ease: "linear" }
      });

      // Right Column Nodes
      airisSteps.forEach((step, i) => {
        animatePromises.push(
          airisNodeControls[i].start({ 
            opacity: 1, scale: 1,
            filter: "drop-shadow(0px 0px 8px rgba(255,0,140,0.6))",
            transition: { duration: 0.3, delay: i * 0.15, ease: "easeOut" } 
          })
        );
      });

      await Promise.all(animatePromises);
      if (!isMounted) return;

      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      // 4. Final Statement
      await finalStatementControls.start({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: "easeOut" }
      });
    }

    runSequence();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#000000] text-white overflow-hidden relative font-sans items-center pt-8 md:pt-12 pb-16">
      
      {/* Intro Doodles */}
      <AnimatePresence>
        {phase === "sketch" || phase === "title" ? (
          <motion.div 
            key="doodle-group"
            animate={doodleGroupControls}
            style={{ transformOrigin: "50% 10%" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            {doodles.map(d => (
              <svg 
                key={d.id} 
                style={{ position: 'absolute', transform: `translate(${d.x}px, ${d.y}px) scale(${d.scale}) rotate(${d.rotate}deg)` }} 
                width="100" height="100" viewBox="0 0 100 100" fill="none"
              >
                <motion.path 
                  d={d.path} 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5" 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: d.duration, delay: d.delay, ease: "easeInOut" }}
                />
              </svg>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
        animate={titleControls}
        className="font-mono text-xl md:text-3xl lg:text-4xl font-bold tracking-[0.2em] uppercase text-center z-20 relative mb-12 flex flex-col items-center justify-center gap-2 md:gap-4 w-full"
      >
        <span className="text-[#FF008C] drop-shadow-[0_0_15px_rgba(255,0,140,0.8)]">AIRIS</span>
        <span>LEARNING PHILOSOPHY</span>
      </motion.h1>

      {/* Storytelling Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={mainLayoutControls}
        className="flex w-full max-w-5xl z-20 relative flex-1 px-4 md:px-12"
      >
        {/* Left Side: Traditional Learning */}
        <div className="flex-1 flex flex-col items-center relative pr-4">
          <h2 className="text-white font-mono text-[10px] md:text-xs tracking-widest uppercase mb-10 text-center">Traditional Learning</h2>
          <div className="flex flex-col items-center w-full gap-16">
            {tradSteps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: -10 }} 
                animate={tradControls[i]}
                className="flex flex-col items-center w-full"
              >
                <span className="text-sm md:text-base font-medium text-white tracking-wide text-center">{step}</span>
                
                {i < tradSteps.length - 1 && (
                  <div className="mt-8 mb-[-20px] text-white/50 flex flex-col items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center: Simple Glowing Pink Barrier */}
        <div className="w-[40px] md:w-[80px] flex justify-center shrink-0 relative">
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={energyDividerControls}
            style={{ transformOrigin: "top" }}
            className="absolute top-0 bottom-0 w-[2px] bg-[#FF008C] shadow-[0_0_15px_#FF008C]"
          />
        </div>

        {/* Right Side: AIRIS Learning */}
        <div className="flex-1 flex flex-col items-center relative pl-4">
          <h2 className="text-[#FF008C] font-mono text-[10px] md:text-xs tracking-widest uppercase mb-10 text-center drop-shadow-[0_0_8px_rgba(255,0,140,0.5)]">AIRIS Learning</h2>
          
          <div className="flex flex-col items-center w-full gap-10">
            {airisSteps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: -10 }} 
                animate={airisNodeControls[i]}
                className="flex flex-col items-center w-full"
              >
                <span className="text-sm md:text-base font-medium text-white tracking-wide text-center">
                  {step}
                </span>

                {i < airisSteps.length - 1 && (
                  <div className="mt-5 mb-[-20px] text-[#FF008C]/70 flex flex-col items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Final Typography Fade-In */}
      <motion.div 
        initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
        animate={finalStatementControls}
        className="w-full max-w-4xl px-6 mt-8 relative z-30"
      >
        <div className="text-center">
          <p className="font-serif text-xl md:text-3xl font-light text-white leading-tight">
            "We don't teach students what to think.<br/>
            We teach them <span className="text-[#FF008C] font-medium drop-shadow-[0_0_15px_rgba(255,0,140,0.8)]">how to think</span>."
          </p>
        </div>
      </motion.div>

      {/* Navigation controls */}
      <div className="fixed bottom-6 right-8 md:right-16 flex gap-8 md:gap-12 z-40 pointer-events-auto">
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
