import { motion } from "framer-motion";
import { Check, Square, CheckSquare } from "lucide-react";

interface OptionCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  disabled?: boolean;
  isMultiSelect?: boolean;
}

export const OptionCard = ({
  label,
  isSelected,
  onClick,
  index,
  disabled = false,
  isMultiSelect = false,
}: OptionCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
        flex items-center gap-4 group
        ${isSelected 
          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Selection indicator */}
      <div 
        className={`
          w-6 h-6 flex-shrink-0 flex items-center justify-center
          transition-all duration-200
          ${isMultiSelect ? "" : "rounded-full border-2"}
          ${isSelected 
            ? isMultiSelect 
              ? "" 
              : "bg-primary-foreground border-primary-foreground" 
            : isMultiSelect 
              ? "" 
              : "border-muted-foreground/30 group-hover:border-primary/50"
          }
        `}
      >
        {isMultiSelect ? (
          isSelected ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          ) : (
            <Square className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary/50" />
          )
        ) : (
          isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Check className="w-4 h-4 text-primary" />
            </motion.div>
          )
        )}
      </div>

      {/* Label */}
      <span className={`text-base font-medium ${isSelected ? "" : "text-foreground"}`}>
        {label}
      </span>

      {/* Keyboard shortcut hint */}
      <span 
        className={`
          ml-auto text-xs font-mono px-2 py-1 rounded-lg
          ${isSelected 
            ? "bg-primary-foreground/20 text-primary-foreground" 
            : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100"
          }
          transition-opacity duration-200
        `}
      >
        {index + 1}
      </span>
    </motion.button>
  );
};
