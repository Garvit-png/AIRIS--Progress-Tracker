import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Higher stiffness and lower mass for faster response with less lag
    const springConfig = { damping: 30, stiffness: 800, mass: 0.35 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseOver = (e) => {
            const target = e.target;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'SELECT' ||
                target.tagName === 'TEXTAREA' ||
                target.getAttribute('role') === 'button' ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('.interactive');

            setIsHovering(!!isInteractive);
        };

        const handleMouseLeaveWindow = () => setIsVisible(false);
        const handleMouseEnterWindow = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseleave', handleMouseLeaveWindow);
        document.addEventListener('mouseenter', handleMouseEnterWindow);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseleave', handleMouseLeaveWindow);
            document.removeEventListener('mouseenter', handleMouseEnterWindow);
        };
    }, [isVisible, mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999]">
            <motion.div
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    left: -12,
                    top: -12,
                }}
                className="relative flex items-center justify-center w-6 h-6"
            >
                {/* The Star (Gemini Style) */}
                <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{
                        scale: isClicked ? 0.8 : isHovering ? 1.5 : 1,
                        rotate: isHovering ? 90 : 0,
                        filter: isHovering ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    {/* Four-pointed star path */}
                    <path
                        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                        fill="white"
                        fillOpacity={isHovering ? 1 : 0.9}
                    />
                </motion.svg>

                {/* Ambient Outer Glow */}
                <motion.div
                    animate={{
                        scale: isHovering ? 2 : 1.2,
                        opacity: isHovering ? 0.4 : 0.15,
                    }}
                    className="absolute inset-0 bg-white blur-xl rounded-full"
                />
            </motion.div>
        </div>
    );
}
