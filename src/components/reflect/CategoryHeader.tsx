import { motion } from "framer-motion";
import { Trophy, Heart, Users, Brain, Rocket } from "lucide-react";
import type { Category } from "@/data/questions";

const iconMap = {
  Trophy,
  Heart,
  Users,
  Brain,
  Rocket,
};

interface CategoryHeaderProps {
  category: Category;
  questionNumber: number;
}

export const CategoryHeader = ({ category, questionNumber }: CategoryHeaderProps) => {
  const Icon = iconMap[category.icon as keyof typeof iconMap];
  const categoryQuestionNumber = ((questionNumber - 1) % 5) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-8"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${category.color}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          {category.name} • {categoryQuestionNumber}/5
        </p>
        <p className="text-xs text-muted-foreground/70">{category.description}</p>
      </div>
    </motion.div>
  );
};
