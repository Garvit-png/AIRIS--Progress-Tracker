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

const JOURNEY = [
  {
    title: "INTRODUCTION, Catching up.",
    desc: "Revisiting the last session and introductions for today."
  },
  {
    title: "What's the need of dev in AI?",
    desc: "Understanding the relation between dev and AI."
  },
  {
    title: "Understanding AI Applications",
    desc: "AI Models, Frontend, Backend, APIs, Deployment."
  },
  {
    title: "Activity",
    desc: "Having fun with an AI based competitive game."
  }
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
              <TextFlippingBoard text={"TODAY'S\nJOURNEY"} className="dark" />
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
                className="font-mono text-6xl md:text-[5rem] lg:text-[7rem] leading-none font-bold tracking-tighter text-white mb-10"
              >
                Today's <span className="text-[#FF008C]">Journey</span>
              </motion.h1>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } }
                }}
                className="w-full max-w-3xl space-y-7"
              >
                {JOURNEY.map((item, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -24, filter: "blur(8px)" },
                      show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                    className="flex items-start gap-4"
                  >
                    <span className="font-mono text-[#FF008C] text-lg mt-0.5 select-none">0{i + 1}</span>
                    <div>
                      <p className="font-mono font-bold text-white text-lg md:text-xl tracking-wide">
                        {item.title}
                      </p>
                      <p className="text-white/50 text-sm md:text-base font-light mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
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
