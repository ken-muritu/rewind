import { motion } from "framer-motion";
import { categories } from "@/data/questions";
import { Zap } from "lucide-react";

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
}

const encouragingMessages = [
  "Let's go! 🚀",
  "You're doing great! ✨",
  "Keep it up! 💪",
  "Flying through! ⚡",
  "Almost there! 🔥",
];

export const ProgressBar = ({ currentIndex, totalQuestions }: ProgressBarProps) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const currentCategoryIndex = Math.floor(currentIndex / 5);
  
  // Get encouraging message based on progress
  const messageIndex = Math.floor((currentIndex / totalQuestions) * encouragingMessages.length);
  const message = encouragingMessages[Math.min(messageIndex, encouragingMessages.length - 1)];

  return (
    <div className="space-y-3">
      {/* Main progress bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Category markers */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          {categories.map((_, index) => {
            if (index === 0) return null;
            const position = (index / categories.length) * 100;
            return (
              <div
                key={index}
                className="absolute w-0.5 h-full bg-background/50"
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {currentIndex + 1}/{totalQuestions}
          </span>
          <motion.span 
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground hidden sm:block"
          >
            {message}
          </motion.span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Zap className="w-4 h-4 text-accent" />
          </motion.div>
          <span className="text-sm font-mono font-bold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Category pills - mobile friendly */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((category, index) => {
          const isComplete = currentCategoryIndex > index;
          const isCurrent = currentCategoryIndex === index;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-300
                ${isCurrent 
                  ? "bg-primary text-primary-foreground" 
                  : isComplete 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {isComplete && "✓ "}
              {category.name.replace("The ", "")}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
