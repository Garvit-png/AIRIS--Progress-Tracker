import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import WhatIsAiris from './components/WhatIsAiris'
import TextFlippingBoardDemo from './components/TextFlippingBoardDemo'
import VisionSection from './components/VisionSection'
import MissionSection from './components/MissionSection'
import LearningPhilosophySection from './components/LearningPhilosophySection'
import CurriculumSection from './components/CurriculumSection'
import WhatMakesAirisDifferentSection from './components/WhatMakesAirisDifferentSection'
import EcosystemSection from './components/EcosystemSection'
import LongTermVisionSection from './components/LongTermVisionSection'
import TheFutureSection from './components/TheFutureSection'

const slides = [LandingPage, WhatIsAiris, TextFlippingBoardDemo, VisionSection, MissionSection, LearningPhilosophySection, CurriculumSection, WhatMakesAirisDifferentSection, EcosystemSection, LongTermVisionSection, TheFutureSection]

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const handleNext = () => {
    setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev))
  }

  const handlePrev = () => {
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev))
  }

  const lastScrollTime = React.useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
    };

    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return; // 1 second throttle to prevent double jumps
      
      if (e.deltaY > 50) {
        setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev));
        lastScrollTime.current = now;
      } else if (e.deltaY < -50) {
        setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
        lastScrollTime.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const CurrentSlide = slides[currentSlideIndex]

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full absolute inset-0"
        >
          <CurrentSlide onNext={handleNext} onPrev={handlePrev} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
