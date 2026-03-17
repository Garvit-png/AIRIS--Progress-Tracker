import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = '', size = 'md', showSubtitle = true }) => {
    const sizes = {
        sm: { main: 'text-2xl', sub: 'text-[6px]', sparkle: 'w-3 h-3', spacing: 'gap-1' },
        md: { main: 'text-5xl', sub: 'text-[9px]', sparkle: 'w-6 h-6', spacing: 'gap-2' },
        lg: { main: 'text-7xl', sub: 'text-[12px]', sparkle: 'w-8 h-8', spacing: 'gap-3' },
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <div className={`flex flex-col items-center select-none ${className}`}>
            <div className="relative">
                {/* Sparkle Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0.4, 1, 0.4], 
                        scale: [0.8, 1.1, 0.8],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                    }}
                    className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 ${currentSize.sparkle} text-[#A855F7]`}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                    </svg>
                </motion.div>

                {/* Text Logo */}
                <h1 className={`${currentSize.main} font-bold tracking-tighter flex items-baseline leading-none`}>
                    <span className="text-[#A855F7]">ai</span>
                    <span className="text-white">ris</span>
                </h1>
            </div>

            {/* Subtitle */}
            {showSubtitle && (
                <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`${currentSize.sub} font-medium tracking-[0.4em] text-white/60 uppercase mt-2 text-center`}
                >
                    AI Research & Innovation Society
                </motion.p>
            )}
        </div>
    );
};

export default Logo;
