import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface CelebrationOverlayProps {
  message: string;
  subtext: string;
  onComplete: () => void;
}

export const CelebrationOverlay = ({ message, subtext, onComplete }: CelebrationOverlayProps) => {
  useEffect(() => {
    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#6366F1", "#C4FF61", "#818CF8", "#A5F3FC"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Auto-dismiss after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-6xl sm:text-8xl"
        >
          {message.includes("🔥") ? "🔥" : 
           message.includes("🚀") ? "🚀" : 
           message.includes("⚡") ? "⚡" : 
           message.includes("🏁") ? "🏁" : "🎉"}
        </motion.div>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black"
        >
          {message.replace(/[🔥🚀⚡🏁🎉]/g, "").trim()}
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground"
        >
          {subtext}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-muted-foreground/50"
        >
          Tap to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
