import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const milestones = [
  { id: 1, text: "Open-Source Curriculum", x: "15%", y: "25%" },
  { id: 2, text: "International Collaborations", x: "50%", y: "15%" },
  { id: 3, text: "Research Publications", x: "85%", y: "25%" },
  { id: 4, text: "Faculty Partnerships", x: "15%", y: "55%" },
  { id: 5, text: "Student Research Labs", x: "50%", y: "45%" },
  { id: 6, text: "AI Conferences", x: "85%", y: "55%" },
  { id: 7, text: "Online Education Platform", x: "30%", y: "85%" },
  { id: 8, text: "Global Learning Community", x: "70%", y: "85%" },
];

// Simple pointers format doesn't need connections array

export default function LongTermVisionSection({ onNext, onPrev }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("particles"); // particles -> network
  const contentControls = useAnimation();
  const cardControls = milestones.map(() => useAnimation());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    let textTargets = [];
    let animationFrameId;
    let currentStage = 'ambient'; // ambient -> forming -> holding -> bursting -> done

    function getTextTargets() {
      const offscreen = document.createElement('canvas');
      const oCtx = offscreen.getContext('2d', { willReadFrequently: true });
      offscreen.width = width;
      offscreen.height = height;
      
      // Responsive font size
      const fontSize = Math.min(width / 12, 100);
      oCtx.fillStyle = 'white';
      oCtx.font = `bold ${fontSize}px "Inter", sans-serif`;
      oCtx.textAlign = 'center';
      oCtx.textBaseline = 'middle';
      
      // Draw text
      oCtx.fillText('LONG-TERM', width / 2, height / 2 - fontSize * 0.6);
      oCtx.fillText('VISION', width / 2, height / 2 + fontSize * 0.6);

      const imageData = oCtx.getImageData(0, 0, width, height).data;
      const targets = [];
      const step = 4; // Particle density (lower = more particles)

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = imageData[(y * width + x) * 4 + 3];
          if (alpha > 128) {
            const isPink = y > height / 2; // "VISION" is pink
            targets.push({ x, y, isPink });
          }
        }
      }
      return targets;
    }

    textTargets = getTextTargets();

    class Particle {
      constructor(target) {
        // Start randomly across the screen
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 1.2 + 0.6;
        this.target = target;
        this.isPink = target ? target.isPink : (Math.random() > 0.9);
        this.burstSpeed = 0;
      }

      update() {
        if (currentStage === 'ambient') {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;
        } 
        else if (currentStage === 'forming' || currentStage === 'holding') {
          if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.x += dx * 0.08; // Smooth lerp
            this.y += dy * 0.08;
          }
        }
        else if (currentStage === 'bursting') {
          this.burstSpeed += 1.5; 
          this.vx = this.burstSpeed + Math.random() * 5; // Streak right
          this.x += this.vx;
          this.radius = Math.min(this.burstSpeed * 1.5, 150); 
        }
      }

      draw() {
        ctx.beginPath();
        if (currentStage === 'bursting') {
          ctx.rect(this.x - this.radius, this.y - 1, this.radius, 2);
        } else {
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        }
        
        // Glow effect
        if (this.isPink && (currentStage === 'holding' || currentStage === 'forming')) {
          ctx.fillStyle = '#FF008C';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FF008C';
        } else if (this.isPink) {
          ctx.fillStyle = '#FF008C';
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#FF008C';
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Spawn exactly one particle per target for perfect text formation
    // If there are too many, we cap it for performance, but usually it's fine
    const maxParticles = 3000;
    const targetsToUse = textTargets.length > maxParticles ? 
      textTargets.filter((_, i) => i % Math.ceil(textTargets.length / maxParticles) === 0) : 
      textTargets;

    targetsToUse.forEach(target => {
      particles.push(new Particle(target));
    });

    let time = 0;
    
    function animate() {
      if (currentStage === 'done') return;
      
      // Clear with slight trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
      
      time++;

      if (time === 120) currentStage = 'forming'; // Form text at 2 seconds
      if (time === 300) currentStage = 'holding'; // Hold for 3 seconds
      if (time === 420) {
        currentStage = 'bursting'; // Burst transition
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Faster clear during burst
      }
      if (time === 480) {
        currentStage = 'done';
        setPhase("network");
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Reveal Phase (Network)
  useEffect(() => {
    if (phase !== "network") return;
    
    let isMounted = true;
    
    async function revealNetwork() {
      await contentControls.start({
        clipPath: "inset(0% 0% 0% 0%)",
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
      });
      
      if (!isMounted) return;

      // Sequentially float in the pointers
      for (let i = 0; i < milestones.length; i++) {
        cardControls[i].start({
          opacity: 1,
          x: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        });
        await new Promise(r => setTimeout(r, 100)); // Stagger
      }
    }

    revealNetwork();
    
    return () => { isMounted = false; };
  }, [phase, contentControls, cardControls]);


  return (
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-white relative font-sans overflow-hidden">
      
      {/* ---------------- CANVAS LAYER (Particles & Burst) ---------------- */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-1000 ${phase === 'network' ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* ---------------- AMBIENT BACKGROUND PARTICLES (Always running subtly) ---------------- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 60%)' }}></div>

      {/* ---------------- CONTENT REVEAL LAYER (Network) ---------------- */}
      <motion.div 
        initial={{ clipPath: "inset(0% 100% 0% 0%)" }} 
        animate={contentControls}
        className="absolute inset-0 z-20 flex flex-col pt-12 md:pt-20 px-4 md:px-16 items-center"
      >
        
        {/* Header Text */}
        <div className="max-w-4xl z-30 relative text-center">
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase mb-6 text-white drop-shadow-[0_0_15px_rgba(255,0,140,0.5)]">
            LONG-TERM <span className="text-[#FF008C]">VISION</span>
          </h2>
          <p className="font-serif text-base md:text-lg font-light text-white/80 leading-relaxed md:leading-loose">
            AIRIS aims to evolve from a university society into a globally recognized educational and research organization, building an ecosystem that advances Artificial Intelligence through education, collaboration, research, and innovation.
          </p>
        </div>

        {/* Simple Pointers Grid */}
        <div className="flex-1 w-full max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 z-20 pb-20">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={cardControls[index]}
              className="flex items-center gap-4 group cursor-default"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF008C] shadow-[0_0_8px_rgba(255,0,140,0.8)] group-hover:scale-150 transition-transform"></div>
              <span className="font-mono text-sm md:text-base tracking-widest text-white/90 group-hover:text-white transition-colors">
                {milestone.text}
              </span>
            </motion.div>
          ))}
        </div>

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
