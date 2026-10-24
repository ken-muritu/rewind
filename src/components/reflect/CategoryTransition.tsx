import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface CategoryTransitionProps {
  categoryName: string;
  categoryDescription: string;
  categoryNumber: number;
  totalCategories: number;
  onContinue: () => void;
}

export const CategoryTransition = ({
  categoryName,
  categoryDescription,
  categoryNumber,
  totalCategories,
  onContinue,
}: CategoryTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center py-12 space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
      >
        <Sparkles className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Part {categoryNumber} of {totalCategories}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black">{categoryName}</h2>
        <p className="text-muted-foreground max-w-md">{categoryDescription}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={onContinue}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          Let's go
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
