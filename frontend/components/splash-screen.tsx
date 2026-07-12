'use client';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  text?: string;
  durationMs?: number;
}

export function SplashScreen({ 
  onComplete, 
  text = "PROTOKOLER UNP",
  durationMs = 2800 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Tahan splash screen selama waktu yang ditentukan
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Beri jeda 800ms agar animasi exit framer-motion selesai dengan mulus
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 800); 
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  const textVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.5,
      } 
    }
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0000] overflow-hidden"
        >
           {/* Dynamic Animated Background - Optimized (Removed heavy blurs and mix-blends) */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] via-[#0a0000] to-[#2a0000] opacity-90" />
           
           {/* Subtle static glowing accents instead of heavy animating blurs */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D2AD5C]/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />
           
           {/* Elegant minimal grid (No heavy mask) */}
           <div 
             className="absolute inset-0 pointer-events-none opacity-5"
             style={{ 
               backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} 
           />
           
           {/* Animated Logo */}
           <div className="relative mb-6 md:mb-8">
             <motion.div
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative h-40 w-40 md:h-56 md:w-56 z-10 flex items-center justify-center"
             >
                <img 
                  src="/logo-protokoler-new.webp" 
                  alt="Logo Protokoler"
                  className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                />
             </motion.div>
             {/* Logo Glow Pulse */}
             <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
               className="absolute inset-0 bg-[#D2AD5C] blur-[50px] md:blur-[60px] rounded-full z-0 pointer-events-none"
             />
           </div>
           
           {/* Animated Text */}
           <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="flex justify-center z-10 px-4 mt-2"
           >
              <h1 className="text-white font-display text-2xl md:text-4xl font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-center">
                {text}
              </h1>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
