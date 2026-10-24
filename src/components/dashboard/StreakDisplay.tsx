import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export const StreakDisplay = ({ currentStreak, longestStreak, totalActiveDays }: StreakDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 rounded-2xl"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Streak</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-2"
          >
            <Flame className="w-7 h-7 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-foreground"
          >
            {currentStreak}
          </motion.p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>

        {/* Longest Streak */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 mb-2"
          >
            <Trophy className="w-7 h-7 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold text-foreground"
          >
            {longestStreak}
          </motion.p>
          <p className="text-xs text-muted-foreground">Best</p>
        </div>

        {/* Total Days */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 mb-2"
          >
            <Calendar className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-foreground"
          >
            {totalActiveDays}
          </motion.p>
          <p className="text-xs text-muted-foreground">Total Days</p>
        </div>
      </div>

      {currentStreak > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          {currentStreak >= 7 
            ? "🔥 You're on fire! Keep it up!" 
            : currentStreak >= 3 
              ? "💪 Great momentum!" 
              : "✨ Keep going!"}
        </motion.p>
      )}
    </motion.div>
  );
};
