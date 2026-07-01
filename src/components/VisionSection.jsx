"use client";
import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

export default function VisionSection({ onNext, onPrev }) {
  const eyeContainerControls = useAnimation();
  const eyeShapeControls = useAnimation();
  const irisControls = useAnimation();
  const zoomIrisControls = useAnimation();
  const bgControls = useAnimation();
  
  // New Controls for Text Phase
  const titleEyeContainerControls = useAnimation();
  const titleEyeShapeControls = useAnimation();
  const titleControls = useAnimation();
  const underlineControls = useAnimation();
  const paragraphControls = useAnimation();
  
  const [phase, setPhase] = useState("darkness"); // darkness -> eye -> text

  useEffect(() => {
    let isMounted = true;

    async function sequence() {
      // Small pause in complete darkness
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;
      setPhase("eye");

      // Wait for React to mount the eye component to the DOM
      await new Promise(r => setTimeout(r, 50));
      if (!isMounted) return;

      // Scene 1 - Darkness to Fade In
      await eyeContainerControls.start({ 
        opacity: 1, 
        transition: { duration: 0.7, ease: "easeInOut" } 
      });
      
      // Pause
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;
      
      // Scene 2 - Blink (Natural and Smooth)
      await eyeShapeControls.start({ 
        scaleY: 0.05, 
        transition: { duration: 0.1, ease: "easeIn" } 
      });
      await eyeShapeControls.start({ 
        scaleY: 1, 
        transition: { duration: 0.15, ease: "easeOut" } 
      });

      // Pause before looking up
      await new Promise(r => setTimeout(r, 200));
      if (!isMounted) return;

      // Scene 3 - Look Up
      await irisControls.start({ 
        y: -18, 
        transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } 
      });
      
      // Pause
      await new Promise(r => setTimeout(r, 200));
      if (!isMounted) return;

      // Scene 4 - Iris Zoom
      zoomIrisControls.set({ opacity: 1, y: -18 });
      irisControls.set({ opacity: 0 });
      
      bgControls.start({ 
        backgroundColor: "#FF008C", 
        transition: { duration: 0.3, delay: 0.4 } 
      });
      
      eyeShapeControls.start({
        opacity: 0,
        transition: { duration: 0.3, delay: 0.1 }
      });

      await zoomIrisControls.start({ 
        scale: 150, 
        transformOrigin: "100px 42px",
        transition: { duration: 0.75, ease: [0.65, 0, 0.35, 1] } 
      });

      if (!isMounted) return;

      // Scene 5 - The Text Phase Transformation
      setPhase("text");
      
      // Wait for text components to mount
      await new Promise(r => setTimeout(r, 50));
      if (!isMounted) return;
      
      // Background returns to black
      bgControls.start({ 
        backgroundColor: "#000000", 
        transition: { duration: 0.6, ease: "easeInOut" } 
      });
      
      // 1. Show the mini eye where the title will be
      await titleEyeContainerControls.start({
        opacity: 1, scale: 1, filter: "blur(0px)",
        transition: { duration: 0.5, ease: "easeOut" }
      });

      await new Promise(r => setTimeout(r, 200));

      // 2. Mini eye blinks
      await titleEyeShapeControls.start({ scaleY: 0.05, transition: { duration: 0.1, ease: "easeIn" } });
      await titleEyeShapeControls.start({ scaleY: 1, transition: { duration: 0.15, ease: "easeOut" } });

      await new Promise(r => setTimeout(r, 100));

      // 3. Mini eye transforms into "VISION"
      titleEyeContainerControls.start({
        opacity: 0, scale: 1.5, filter: "blur(12px)",
        transition: { duration: 0.5, ease: "easeInOut" }
      });

      // 4. Reveal "VISION" title, underline, and paragraph
      titleControls.start({
        opacity: 1, scale: 1, filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut", delay: 0.1 }
      });
      
      underlineControls.start({
        opacity: 1, scaleX: 1,
        transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
      });

      await paragraphControls.start({
        opacity: 1, y: 0,
        transition: { duration: 0.7, ease: "easeOut", delay: 0.3 }
      });
    }
    
    sequence();

    return () => {
      isMounted = false;
    };
  }, [eyeContainerControls, eyeShapeControls, irisControls, zoomIrisControls, bgControls, titleEyeContainerControls, titleEyeShapeControls, titleControls, underlineControls, paragraphControls]);

  return (
    <motion.div 
      initial={{ backgroundColor: "#000000" }}
      animate={bgControls}
      className="flex min-h-screen w-full flex-col items-center justify-center relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {phase === "eye" && (
          <motion.div 
            key="eye"
            initial={{ opacity: 0 }}
            animate={eyeContainerControls}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Minimalist Vector Eye */}
            <svg 
              width="300" height="180" viewBox="0 0 200 120" 
              fill="none" xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <defs>
                <clipPath id="visionEyeClip">
                  <path d="M10 60 C50 10, 150 10, 190 60 C150 110, 50 110, 10 60 Z" />
                </clipPath>
                
                {/* Soft gradient for sclera to give realistic rounded volume */}
                <radialGradient id="visionScleraGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E5E5E5" />
                </radialGradient>
              </defs>

              <motion.g animate={eyeShapeControls} className="origin-center" style={{ transformOrigin: "100px 60px" }}>
                {/* Sclera (White Part) */}
                <path 
                  d="M10 60 C50 10, 150 10, 190 60 C150 110, 50 110, 10 60 Z" 
                  fill="url(#visionScleraGrad)" 
                />

                {/* Masked Iris & Pupil Group */}
                <g clipPath="url(#visionEyeClip)">
                  <motion.g initial={{ y: 0 }} animate={irisControls}>
                    {/* Glowing Iris Base */}
                    <circle cx="100" cy="60" r="28" fill="#FF008C" />
                    {/* Inner texture/glow */}
                    <circle cx="100" cy="60" r="28" fill="#FF4DAB" opacity="0.4" />
                    {/* Pupil */}
                    <circle cx="100" cy="60" r="11" fill="#000000" />
                    {/* Light Reflection (Catchlight) */}
                    <circle cx="108" cy="52" r="4" fill="#FFFFFF" opacity="0.8" />
                  </motion.g>
                </g>
              </motion.g>

              {/* Unclipped Iris Overlay for Zoom Sequence */}
              <motion.g 
                initial={{ opacity: 0 }} 
                animate={zoomIrisControls}
              >
                <circle cx="100" cy="60" r="28" fill="#FF008C" />
                {/* Scale up exactly the same base visual to transition smoothly */}
                <circle cx="100" cy="60" r="28" fill="#FF4DAB" opacity="0.4" />
                <circle cx="100" cy="60" r="11" fill="#000000" />
                <circle cx="108" cy="52" r="4" fill="#FFFFFF" opacity="0.8" />
              </motion.g>

            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "text" && (
          <motion.div 
            key="text"
            className="flex flex-col items-center justify-center max-w-[800px] w-full px-8 z-20 text-center"
          >
            <div className="relative mb-12 flex items-center justify-center min-h-[100px]">
              
              {/* The Small Title Eye */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                animate={titleEyeContainerControls}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <svg 
                  width="120" height="72" viewBox="0 0 200 120" 
                  fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                >
                  <defs>
                    <clipPath id="titleEyeClip">
                      <path d="M10 60 C50 10, 150 10, 190 60 C150 110, 50 110, 10 60 Z" />
                    </clipPath>
                    <radialGradient id="titleScleraGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="70%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#E5E5E5" />
                    </radialGradient>
                  </defs>

                  <motion.g animate={titleEyeShapeControls} className="origin-center" style={{ transformOrigin: "100px 60px" }}>
                    <path 
                      d="M10 60 C50 10, 150 10, 190 60 C150 110, 50 110, 10 60 Z" 
                      fill="url(#titleScleraGrad)" 
                    />
                    <g clipPath="url(#titleEyeClip)">
                      <circle cx="100" cy="60" r="28" fill="#FF008C" />
                      <circle cx="100" cy="60" r="11" fill="#000000" />
                      <circle cx="108" cy="52" r="4" fill="#FFFFFF" opacity="0.8" />
                    </g>
                  </motion.g>
                </svg>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={titleControls}
                className="font-mono text-5xl md:text-7xl font-bold tracking-[0.25em] text-white uppercase relative z-10"
              >
                Vision
                {/* Subtle electric pink underline */}
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={underlineControls}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#FF008C] shadow-[0_0_15px_rgba(255,0,140,0.9)] rounded-full origin-center" 
                />
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={paragraphControls}
              className="text-white/85 text-xl md:text-3xl font-light leading-relaxed tracking-wide"
            >
              We believe in observing the unseen, challenging the established, and pushing the boundaries of artificial intelligence through rigorous scientific inquiry.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Next/Prev Navigation controls if needed, but since it's a cinematic section, we might just leave the standard nav logic */}
      {phase === "text" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="fixed bottom-8 flex gap-12 z-20 pointer-events-auto"
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
      )}
    </motion.div>
  );
}
