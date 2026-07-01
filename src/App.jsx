import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import WhatIsAiris from './components/WhatIsAiris'
import TextFlippingBoardDemo from './components/TextFlippingBoardDemo'
import VisionSection from './components/VisionSection'
import MissionSection from './components/MissionSection'
import LearningPhilosophySection from './components/LearningPhilosophySection'
import CurriculumSection from './components/CurriculumSection'
import EcosystemSection from './components/EcosystemSection'
import LongTermVisionSection from './components/LongTermVisionSection'
import TheFutureSection from './components/TheFutureSection'

const slides = [LandingPage, WhatIsAiris, TextFlippingBoardDemo, VisionSection, MissionSection, LearningPhilosophySection, CurriculumSection, EcosystemSection, LongTermVisionSection, TheFutureSection]

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const handleNext = () => {
    setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev))
  }

  const handlePrev = () => {
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev))
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
