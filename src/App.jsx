import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import WhatIsAiris from './components/WhatIsAiris'
import TextFlippingBoardDemo from './components/TextFlippingBoardDemo'
import VisionSection from './components/VisionSection'
import MissionSection from './components/MissionSection'
import LearningPhilosophySection from './components/LearningPhilosophySection'
import CurriculumSection from './components/CurriculumSection'

const slides = [LandingPage, WhatIsAiris, TextFlippingBoardDemo, VisionSection, MissionSection, LearningPhilosophySection, CurriculumSection]

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }

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
