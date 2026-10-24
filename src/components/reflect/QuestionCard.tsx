import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, Check, Pencil, X } from "lucide-react";
import { OptionCard } from "./OptionCard";
import type { Question } from "@/data/questions";

interface QuestionCardProps {
  question: Question;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
}

const MULTI_SELECT_SEPARATOR = " | ";

export const QuestionCard = ({
  question,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  onSkip,
  isFirst,
  isLast,
  saving,
}: QuestionCardProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMultiSelect = question.multiSelect === true;

  // Parse answer into selected options (handles both single and multi-select)
  const parseAnswer = useCallback((answerStr: string): { options: string[]; custom: string } => {
    if (!answerStr) return { options: [], custom: "" };
    
    const parts = answerStr.split(MULTI_SELECT_SEPARATOR).map(s => s.trim()).filter(Boolean);
    const matchingOptions: string[] = [];
    const customParts: string[] = [];
    
    for (const part of parts) {
      if (question.options.includes(part)) {
        matchingOptions.push(part);
      } else {
        customParts.push(part);
      }
    }
    
    return { 
      options: matchingOptions, 
      custom: customParts.join(MULTI_SELECT_SEPARATOR) 
    };
  }, [question.options]);

  // Initialize state from answer prop
  useEffect(() => {
    const { options, custom } = parseAnswer(answer);
    setSelectedOptions(options);
    if (custom) {
      setShowCustomInput(true);
      setCustomText(custom);
    } else {
      setShowCustomInput(false);
      setCustomText("");
    }
  }, [answer, question.id, parseAnswer]);

  // Focus textarea when showing custom input
  useEffect(() => {
    if (showCustomInput) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showCustomInput]);

  // Build combined answer string
  const buildAnswerString = useCallback((options: string[], custom: string): string => {
    const parts = [...options];
    if (custom.trim()) {
      parts.push(custom.trim());
    }
    return parts.join(MULTI_SELECT_SEPARATOR);
  }, []);

  // Handle option selection
  const handleOptionSelect = useCallback((option: string) => {
    let newSelectedOptions: string[];
    
    if (isMultiSelect) {
      // Multi-select: toggle the option
      if (selectedOptions.includes(option)) {
        newSelectedOptions = selectedOptions.filter(o => o !== option);
      } else {
        newSelectedOptions = [...selectedOptions, option];
      }
    } else {
      // Single-select: replace selection
      newSelectedOptions = [option];
      setShowCustomInput(false);
      setCustomText("");
    }
    
    setSelectedOptions(newSelectedOptions);
    onAnswerChange(buildAnswerString(newSelectedOptions, isMultiSelect ? customText : ""));
    
    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isMultiSelect, selectedOptions, customText, onAnswerChange, buildAnswerString]);

  // Handle custom input toggle
  const handleCustomToggle = useCallback(() => {
    setShowCustomInput(true);
    if (!isMultiSelect) {
      setSelectedOptions([]);
    }
  }, [isMultiSelect]);

  // Handle custom text change
  const handleCustomChange = useCallback((value: string) => {
    setCustomText(value);
    onAnswerChange(buildAnswerString(selectedOptions, value));
  }, [selectedOptions, onAnswerChange, buildAnswerString]);

  // Handle closing custom input
  const handleCloseCustom = useCallback(() => {
    setShowCustomInput(false);
    setCustomText("");
    onAnswerChange(buildAnswerString(selectedOptions, ""));
  }, [selectedOptions, onAnswerChange, buildAnswerString]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in textarea, don't intercept
      if (showCustomInput && document.activeElement === textareaRef.current) {
        if (e.key === "Enter" && e.metaKey) {
          e.preventDefault();
          onNext();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          handleCloseCustom();
        }
        return;
      }

      // Number keys 1-5 for option selection
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= question.options.length) {
        e.preventDefault();
        handleOptionSelect(question.options[numKey - 1]);
      }

      // 6 or 'c' for custom
      if ((e.key === "6" || e.key === "c") && question.allowCustom) {
        e.preventDefault();
        handleCustomToggle();
      }

      // Enter to continue (only if has answer)
      const hasAnswer = selectedOptions.length > 0 || customText.trim();
      if (e.key === "Enter" && !e.metaKey && hasAnswer) {
        e.preventDefault();
        onNext();
      }

      // Backspace to go back
      if (e.key === "Backspace" && !isFirst && !showCustomInput) {
        e.preventDefault();
        onPrevious();
      }

      // Arrow keys
      if (e.key === "ArrowRight" && hasAnswer) {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft" && !isFirst) {
        e.preventDefault();
        onPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question.options, question.allowCustom, selectedOptions, customText, showCustomInput, isFirst, onNext, onPrevious, handleOptionSelect, handleCustomToggle, handleCloseCustom]);

  // Swipe gesture handling
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const hasAnswer = selectedOptions.length > 0 || customText.trim();
    if (info.offset.x < -threshold && hasAnswer) {
      onNext();
    } else if (info.offset.x > threshold && !isFirst) {
      onPrevious();
    }
  }, [selectedOptions, customText, isFirst, onNext, onPrevious]);

  const hasAnswer = selectedOptions.length > 0 || customText.trim();

  return (
    <motion.div
      ref={containerRef}
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="space-y-6 touch-pan-y"
    >
      {/* Question */}
      <div className="space-y-2">
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {question.question}
        </motion.h2>
        {question.helperText && (
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {question.helperText}
          </motion.p>
        )}
        {isMultiSelect && (
          <motion.p 
            className="text-sm text-primary font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Select all that apply
          </motion.p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <OptionCard
            key={option}
            label={option}
            isSelected={selectedOptions.includes(option)}
            onClick={() => handleOptionSelect(option)}
            index={index}
            isMultiSelect={isMultiSelect}
          />
        ))}

        {/* Custom option */}
        {question.allowCustom && (
          <AnimatePresence mode="wait">
            {showCustomInput ? (
              <motion.div
                key="custom-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="p-4 rounded-2xl border-2 border-primary bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary">Write your own</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseCustom}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    value={customText}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder={question.placeholder || "Type your answer..."}
                    className="min-h-[100px] text-base resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {customText.length}/500
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">⌘ Enter</kbd> to continue
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="custom-trigger"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: question.options.length * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCustomToggle}
                className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-200 flex items-center gap-4 group"
              >
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Pencil className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Something else...
                </span>
                <span className="ml-auto text-xs font-mono px-2 py-1 rounded-lg bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  6
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Selected count for multi-select */}
      {isMultiSelect && selectedOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-primary font-medium text-center"
        >
          {selectedOptions.length} selected
        </motion.div>
      )}

      {/* Save indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </motion.div>
        )}
        {!saving && hasAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-primary"
          >
            <Check className="w-4 h-4" />
            <span>Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasAnswer && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!hasAnswer && isLast}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 px-6"
          >
            {isLast ? "Complete" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard/Swipe hints */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
        <span className="hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">1-5</kbd>
          to {isMultiSelect ? "toggle" : "select"}
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Enter</kbd>
          to continue
        </span>
        <span className="sm:hidden">Swipe to navigate</span>
      </div>
    </motion.div>
  );
};
