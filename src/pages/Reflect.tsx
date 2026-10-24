import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { questions, categories, getCategoryByQuestionIndex, getCelebrationMessage } from "@/data/questions";
import { useReflection } from "@/hooks/useReflection";
import { ProgressBar } from "@/components/reflect/ProgressBar";
import { CategoryHeader } from "@/components/reflect/CategoryHeader";
import { QuestionCard } from "@/components/reflect/QuestionCard";
import { CategoryTransition } from "@/components/reflect/CategoryTransition";
import { CompletionScreen } from "@/components/reflect/CompletionScreen";
import { CelebrationOverlay } from "@/components/reflect/CelebrationOverlay";
import type { User } from "@/lib/api-client";

const Reflect = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showCelebration, setShowCelebration] = useState<{ message: string; subtext: string } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const {
    answers,
    currentIndex,
    loading,
    saving,
    saveAnswer,
    updateProgress,
    completeReflection,
  } = useReflection(user);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const currentQuestion = questions[currentIndex];
  const currentCategory = getCategoryByQuestionIndex(currentIndex);
  const totalQuestions = questions.length;

  const handleNext = useCallback(() => {
    // Save current answer one more time before moving
    if (currentQuestion) {
      const answer = answers[currentQuestion.id] || "";
      if (answer.trim()) {
        saveAnswer(currentQuestion.id, currentQuestion.category, answer);
      }
    }

    if (currentIndex >= totalQuestions - 1) {
      // Completed all questions
      setIsComplete(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    
    // Check for celebration (every 5 questions)
    const celebration = getCelebrationMessage(currentIndex);
    if (celebration && (currentIndex + 1) % 5 === 0) {
      setShowCelebration({ message: celebration.message, subtext: celebration.subtext });
    }
    
    // Check if entering new category
    if (nextIndex % 5 === 0 && nextIndex < totalQuestions && !celebration) {
      setShowTransition(true);
    }

    updateProgress(nextIndex);
  }, [currentIndex, totalQuestions, currentQuestion, answers, saveAnswer, updateProgress]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      updateProgress(currentIndex - 1);
    }
  }, [currentIndex, updateProgress]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleAnswerChange = useCallback(
    (answer: string) => {
      if (currentQuestion) {
        saveAnswer(currentQuestion.id, currentQuestion.category, answer);
      }
    },
    [currentQuestion, saveAnswer]
  );

  const handleContinueFromTransition = useCallback(() => {
    setShowTransition(false);
  }, []);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(null);
    // Show category transition after celebration
    const nextIndex = currentIndex;
    if (nextIndex % 5 === 0 && nextIndex < totalQuestions) {
      setShowTransition(true);
    }
  }, [currentIndex, totalQuestions]);

  const handleGenerateWrapped = async () => {
    await completeReflection();
    navigate("/wrapped");
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Count answered questions
  const answeredCount = Object.values(answers).filter((a) => a?.trim()).length;

  // Calculate estimated time remaining
  const questionsRemaining = totalQuestions - currentIndex;
  const estimatedMinutes = Math.ceil(questionsRemaining * 0.2); // ~12 seconds per question with new format

  return (
    <div className="min-h-screen bg-background grain-overlay flex flex-col">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay
            message={showCelebration.message}
            subtext={showCelebration.subtext}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Save & Exit</span>
              <span className="sm:hidden">Exit</span>
            </Button>

            <div className="flex items-center gap-3">
              {saving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              )}
              
              {/* Time estimate */}
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                ~{estimatedMinutes} min left
              </div>
            </div>
          </div>

          {!isComplete && !showTransition && (
            <ProgressBar currentIndex={currentIndex} totalQuestions={totalQuestions} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <CompletionScreen
              key="completion"
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
              onGenerateWrapped={handleGenerateWrapped}
            />
          ) : showTransition && currentCategory ? (
            <CategoryTransition
              key={`transition-${currentCategory.id}`}
              categoryName={currentCategory.name}
              categoryDescription={currentCategory.description}
              categoryNumber={categories.indexOf(currentCategory) + 1}
              totalCategories={categories.length}
              onContinue={handleContinueFromTransition}
            />
          ) : currentQuestion && currentCategory ? (
            <div key={currentQuestion.id}>
              <CategoryHeader
                category={currentCategory}
                questionNumber={currentIndex + 1}
              />
              <QuestionCard
                question={currentQuestion}
                answer={answers[currentQuestion.id] || ""}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSkip={handleSkip}
                isFirst={currentIndex === 0}
                isLast={currentIndex === totalQuestions - 1}
                saving={saving}
              />
            </div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Reflect;
