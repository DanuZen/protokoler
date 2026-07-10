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

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.5,
      } 
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: 'spring', damping: 12, stiffness: 200 } }
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
           {/* Dynamic Animated Background */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4a0000] via-[#1a0000] to-[#0a0000] opacity-80" />
           
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
             className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
           />
           <motion.div 
             animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} 
             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} 
             className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D2AD5C]/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
           />
           
           {/* Animated Grid Overlay */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.15 }}
             transition={{ duration: 1.5 }}
             className="absolute inset-0 pointer-events-none"
             style={{ 
               backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
             }} 
           />
           
           {/* Animated Logo */}
           <div className="relative mb-8">
             <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
                className="relative h-28 w-28 md:h-36 md:w-36 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10"
             >
                <Image 
                  src="/logo-protokoler-new.webp" 
                  alt="Logo Protokoler" 
                  fill 
                  className="object-contain" 
                  priority 
                />
             </motion.div>
             {/* Logo Glow Pulse */}
             <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
               transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
               className="absolute inset-0 bg-[#D2AD5C] blur-[60px] rounded-full z-0"
             />
           </div>
           
           {/* Staggered Animated Text */}
           <motion.div 
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center z-10 px-4"
           >
              {text.split("").map((char, index) => (
                <motion.span 
                  key={index} 
                  variants={letterVariants}
                  className="text-white font-display text-2xl md:text-4xl font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
           </motion.div>

           {/* Elegant Loading Line */}
           <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12 relative w-48 h-[2px] bg-white/10 rounded-full overflow-hidden z-10"
           >
              <motion.div 
                initial={{ width: "0%", left: "0%" }} 
                animate={{ width: ["0%", "100%", "0%"], left: ["0%", "0%", "100%"] }} 
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }} 
                className="absolute top-0 h-full bg-gradient-to-r from-transparent via-[#D2AD5C] to-[#ffeeb0] shadow-[0_0_15px_rgba(210,173,92,1)]" 
              />
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
