"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useTime, useTransform, useMotionTemplate } from "framer-motion";
import { TextFlippingBoard } from "./ui/text-flipping-board";

function StarThread({ star, idx }) {
  const time = useTime();
  const height = star.height;
  const phase = star.delay * 10;
  
  const swingAmp = 10;
  const bendAmp = 15;
  const swingSpeed = 2000;
  const bendSpeed = 1500;

  const endX = useTransform(time, (t) => 50 + Math.sin(t / swingSpeed + phase) * swingAmp);
  const ctrlX = useTransform(time, (t) => 50 + Math.sin(t / bendSpeed + phase * 1.5) * bendAmp);
  
  const path = useMotionTemplate`M 50 0 Q ${ctrlX} ${height * 0.5} ${endX} ${height}`;

  return (
    <div 
      className="absolute top-0 pointer-events-none z-0 opacity-40" 
      style={{ left: star.left, width: 100, transform: 'translateX(-50%)', height }}
    >
      <svg width="100" height={height + 50} className="overflow-visible absolute top-0 left-0">
        <defs>
          <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>
        <motion.path 
          d={path} 
          stroke={`url(#grad-${idx})`} 
          strokeWidth="1" 
          fill="transparent" 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: star.delay, duration: 2, ease: "easeOut" }}
        />
      </svg>

      <motion.img 
        src="/star.png" 
        alt="star"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: star.delay + 1, duration: 1.5 }}
        className={`${star.size} absolute object-contain origin-center`} 
        style={{ 
          left: endX,
          top: height,
          x: "-50%",
          y: "-30%",
          filter: "brightness(0) invert(1) opacity(0.8)"
        }}
      />
    </div>
  );
}

function HangingStars() {
  const stars = [
    { left: "8%", height: 180, size: "w-8 h-8", delay: 0 },
    { left: "92%", height: 320, size: "w-12 h-12", delay: 0.3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star, idx) => (
        <StarThread key={idx} star={star} idx={idx} />
      ))}
    </div>
  );
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const PROBLEMS = [
  "Memorize algorithms without understanding them",
  "Learn frameworks before mathematics and theory",
  "Follow tutorials instead of asking questions",
  "Implement models without reading research papers",
  "Prepare for interviews rather than scientific discovery"
];

export default function TextFlippingBoardDemo({ onNext }) {
  const [phase, setPhase] = useState("board"); // "board", "points"

  useEffect(() => {
    // Show the flipping board for 2.5 seconds, then switch to points immediately
    const timer = setTimeout(() => {
      setPhase("points");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black py-20 relative px-6 overflow-hidden">
      <HangingStars />
      
      <div className="flex flex-col items-start justify-start pt-12 md:pt-16 w-full px-6 md:px-12 flex-1 z-10 relative">
        <AnimatePresence mode="wait">
          {phase === "board" ? (
            <motion.div
              key="board"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full flex justify-center mt-20"
            >
              <TextFlippingBoard text={"WHY AIRIS\nEXIST"} className="dark" />
            </motion.div>
          ) : (
            <motion.div
              key="points"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full flex flex-col items-start text-left mt-4"
            >
              <motion.h1 
                initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="font-mono text-6xl md:text-[5rem] lg:text-[7rem] leading-none font-bold tracking-tighter text-white mb-6 md:mb-10"
              >
                Why <span className="text-[#FF008C]">AIRIS</span> Exists
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, filter: "blur(5px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-white/70 mb-8 max-w-2xl text-lg md:text-xl lg:text-2xl font-light"
              >
                Modern AI education has several fundamental problems. Students often:
              </motion.p>

              <div className="w-full max-w-3xl mb-12">
                <motion.ul 
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } }
                  }}
                  className="space-y-5 text-left font-light md:text-lg"
                >
                  {PROBLEMS.map((text, i) => (
                    <motion.li 
                      key={i}
                      variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.04 } }
                      }}
                      className="flex items-start text-white/80"
                    >
                      <span className="mr-4 text-[#FF008C] mt-1">•</span>
                      <div>
                        {text.split(" ").map((word, wIdx) => (
                          <motion.span
                            key={wIdx}
                            variants={{
                              hidden: { opacity: 0, filter: "blur(12px)", scale: 1.3, y: 10 },
                              show: { opacity: 1, filter: "blur(0px)", scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                            }}
                            className="inline-block mr-1.5"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-white/80 max-w-4xl text-xl md:text-2xl font-medium leading-relaxed mt-4"
              >
                AIRIS was created to address these problems through a{" "}
                <span className="bg-[#FF008C] text-white px-3 py-1 inline-block rounded font-bold tracking-wide shadow-[0_0_15px_rgba(255,0,140,0.5)] align-baseline">
                  research-first educational model
                </span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Button */}
      {phase === "points" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={onNext}
          className="fixed bottom-8 group pointer-events-auto z-20"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase group-hover:text-white/80 transition-colors duration-300">
              Continue
            </span>
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-white/40 group-hover:text-[#FF008C] transition-colors duration-300 animate-bounce mt-1"
            >
              <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
            </svg>
          </div>
        </motion.button>
      )}
    </div>
  );
}
