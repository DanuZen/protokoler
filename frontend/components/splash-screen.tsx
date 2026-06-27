'use client';
import { motion, AnimatePresence } from 'framer-motion';
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
  durationMs = 2500 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Tahan splash screen selama waktu yang ditentukan
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Beri jeda 500ms agar animasi exit framer-motion selesai sebelum trigger callback
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); 
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#6B0000] via-[#5a0000] to-[#8a0000] overflow-hidden"
        >
           {/* Decorative Blurs */}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/20 rounded-full blur-[120px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
           <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-overlay" />
           
           {/* Animated Logo */}
           <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 20 }}
              className="relative h-28 w-28 md:h-36 md:w-36 mb-6 drop-shadow-2xl"
           >
              <Image 
                src="/logo protokoler.webp" 
                alt="Logo Protokoler" 
                fill 
                className="object-contain" 
                priority 
              />
           </motion.div>
           
           {/* Animated Text */}
           <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="text-white font-display text-2xl md:text-3xl font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase drop-shadow-md text-center px-4"
           >
              {text}
           </motion.h1>

           {/* Elegant Loading Dots */}
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex gap-2.5"
           >
              <div className="w-2.5 h-2.5 rounded-full bg-[#D2AD5C] animate-bounce shadow-[0_0_10px_rgba(210,173,92,0.8)]" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D2AD5C] animate-bounce shadow-[0_0_10px_rgba(210,173,92,0.8)]" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-[#D2AD5C] animate-bounce shadow-[0_0_10px_rgba(210,173,92,0.8)]" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
