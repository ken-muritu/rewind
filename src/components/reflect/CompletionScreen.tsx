import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompletionScreenProps {
  answeredCount: number;
  totalQuestions: number;
  onGenerateWrapped: () => void;
}

export const CompletionScreen = ({
  answeredCount,
  totalQuestions,
  onGenerateWrapped,
}: CompletionScreenProps) => {
  const navigate = useNavigate();
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center py-12 space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
          <PartyPopper className="w-12 h-12 text-accent-foreground" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-black"
        >
          You did it!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-muted-foreground"
        >
          Your 2025 reflection is complete.
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-8 py-6"
      >
        <div className="text-center">
          <p className="text-4xl font-mono font-bold text-primary">{answeredCount}</p>
          <p className="text-sm text-muted-foreground">Questions Answered</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-mono font-bold text-accent">{completionPercentage}%</p>
          <p className="text-sm text-muted-foreground">Completion</p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <Button
          size="lg"
          onClick={onGenerateWrapped}
          className="h-14 px-8 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 group"
        >
          Generate My Wrapped
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Your answers will be transformed into shareable story cards
        </p>
      </motion.div>

      {/* Secondary action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground"
        >
          Return to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
};
