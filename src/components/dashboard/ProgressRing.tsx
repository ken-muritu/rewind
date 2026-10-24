import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { playCelebrationSound } from "@/lib/celebrationSound";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  variant?: "primary" | "accent" | "gradient";
  animated?: boolean;
}

export const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label,
  sublabel,
  variant = "primary",
  animated = true,
}: ProgressRingProps) => {
  const [mounted, setMounted] = useState(false);
  const hasTriggeredConfetti = useRef(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const springProgress = useSpring(0, { stiffness: 50, damping: 20 });
  const strokeDashoffset = useTransform(
    springProgress,
    (v) => circumference - (v / 100) * circumference
  );
  
  // Animated counter
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (!animated) {
      setDisplayProgress(Math.round(progress));
      return;
    }
    
    const unsubscribe = springProgress.on("change", (v) => {
      setDisplayProgress(Math.round(v));
    });
    
    return () => unsubscribe();
  }, [springProgress, animated, progress]);

  useEffect(() => {
    setMounted(true);
    if (animated) {
      springProgress.set(progress);
    }
    
    // Trigger confetti when reaching 100%
    if (progress >= 100 && !hasTriggeredConfetti.current && animated) {
      hasTriggeredConfetti.current = true;
      
      // Delay confetti to sync with animation completion
      setTimeout(() => {
        // Fire confetti from both sides
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        
        // Play celebration sound
        playCelebrationSound();
        
        // Initial burst
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        });
        
        frame();
      }, 1200);
    }
  }, [progress, animated, springProgress]);

  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  const getStrokeColor = () => {
    if (variant === "gradient") return `url(#${gradientId})`;
    if (variant === "accent") return "hsl(var(--accent))";
    return "hsl(var(--primary))";
  };

  const getGlowColor = () => {
    if (variant === "accent") return "hsl(var(--accent) / 0.4)";
    return "hsl(var(--primary) / 0.4)";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: `drop-shadow(0 0 12px ${getGlowColor()})` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: animated ? strokeDashoffset : circumference - (progress / 100) * circumference }}
          initial={{ strokeDashoffset: circumference }}
        />
        
        {/* Animated glow dot at the end */}
        {progress > 0 && (
          <motion.circle
            cx={size / 2}
            cy={strokeWidth / 2}
            r={strokeWidth / 2 + 2}
            fill={variant === "accent" ? "hsl(var(--accent))" : "hsl(var(--primary))"}
            style={{
              transformOrigin: `${size / 2}px ${size / 2}px`,
            }}
            animate={animated ? {
              rotate: [0, (progress / 100) * 360],
              opacity: [0, 1],
            } : {
              rotate: (progress / 100) * 360,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </motion.circle>
        )}
      </svg>

      {/* Center content */}
      {showLabel && (
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span 
            className="text-2xl font-black text-foreground tabular-nums"
            key={mounted ? progress : 0}
          >
            {label || `${displayProgress}%`}
          </motion.span>
          {sublabel && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {sublabel}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Compact stats ring for dashboard cards
interface StatsRingProps {
  value: number;
  maxValue: number;
  size?: number;
  label: string;
  icon?: React.ReactNode;
}

export const StatsRing = ({ value, maxValue, size = 80, label, icon }: StatsRingProps) => {
  const progress = (value / maxValue) * 100;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const springProgress = useSpring(0, { stiffness: 40, damping: 15 });
  const strokeDashoffset = useTransform(
    springProgress,
    (v) => circumference - (v / 100) * circumference
  );

  // Animated counter for value
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  useEffect(() => {
    const unsubscribe = springProgress.on("change", (v) => {
      setDisplayValue(Math.round((v / 100) * maxValue));
    });
    return () => unsubscribe();
  }, [springProgress, maxValue]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={6}
            className="opacity-20"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            initial={{ strokeDashoffset: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon || (
            <span className="text-sm font-bold text-foreground tabular-nums">{displayValue}/{maxValue}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};
