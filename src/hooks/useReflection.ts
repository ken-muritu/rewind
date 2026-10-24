import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { questions } from "@/data/questions";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/api-client";

interface ReflectionAnswer {
  question_id: string;
  category: string;
  answer: string;
}

interface UseReflectionReturn {
  reflectionId: string | null;
  answers: Record<string, string>;
  currentIndex: number;
  loading: boolean;
  saving: boolean;
  saveAnswer: (questionId: string, category: string, answer: string) => Promise<void>;
  updateProgress: (index: number) => Promise<void>;
  completeReflection: () => Promise<void>;
}

export const useReflection = (user: User | null): UseReflectionReturn => {
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load or create reflection session
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadReflection = async () => {
      try {
        // Check for existing in-progress reflection
        const { data: existingReflection, error: fetchError } = await supabase
          .from("reflections")
          .select("*")
          .eq("user_id", user.id)
          .eq("year", 2025)
          .eq("status", "in_progress")
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingReflection) {
          setReflectionId(existingReflection.id);
          setCurrentIndex(existingReflection.current_question_index);

          // Load existing answers
          const { data: existingAnswers, error: answersError } = await supabase
            .from("reflection_answers")
            .select("question_id, answer")
            .eq("reflection_id", existingReflection.id);

          if (answersError) throw answersError;

          const answersMap: Record<string, string> = {};
          existingAnswers?.forEach((a) => {
            answersMap[a.question_id] = a.answer;
          });
          setAnswers(answersMap);
        } else {
          // Create new reflection
          const { data: newReflection, error: createError } = await supabase
            .from("reflections")
            .insert({
              user_id: user.id,
              year: 2025,
              status: "in_progress",
              current_question_index: 0,
            })
            .select()
            .single();

          if (createError) throw createError;
          setReflectionId(newReflection.id);
        }
      } catch (error) {
        console.error("Error loading reflection:", error);
        toast({
          title: "Error",
          description: "Failed to load your reflection. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReflection();
  }, [user, toast]);

  // Save answer with debounce-friendly design
  const saveAnswer = useCallback(
    async (questionId: string, category: string, answer: string) => {
      if (!reflectionId || !user) return;

      // Update local state immediately
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));

      // Don't save empty answers
      if (!answer.trim()) return;

      setSaving(true);
      try {
        const { error } = await supabase.from("reflection_answers").upsert(
          {
            reflection_id: reflectionId,
            user_id: user.id,
            question_id: questionId,
            category,
            answer: answer.trim(),
          },
          {
            onConflict: "reflection_id,question_id",
          }
        );

        if (error) throw error;
      } catch (error) {
        console.error("Error saving answer:", error);
        // Don't show toast for every save to avoid spam
      } finally {
        setSaving(false);
      }
    },
    [reflectionId, user]
  );

  // Update progress in database
  const updateProgress = useCallback(
    async (index: number) => {
      if (!reflectionId) return;

      setCurrentIndex(index);

      try {
        const { error } = await supabase
          .from("reflections")
          .update({ current_question_index: index })
          .eq("id", reflectionId);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    },
    [reflectionId]
  );

  // Complete reflection
  const completeReflection = useCallback(async () => {
    if (!reflectionId) return;

    try {
      const { error } = await supabase
        .from("reflections")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", reflectionId);

      if (error) throw error;

      toast({
        title: "Reflection Complete!",
        description: "Your Wrapped is being generated...",
      });
    } catch (error) {
      console.error("Error completing reflection:", error);
      toast({
        title: "Error",
        description: "Failed to complete reflection. Please try again.",
        variant: "destructive",
      });
    }
  }, [reflectionId, toast]);

  return {
    reflectionId,
    answers,
    currentIndex,
    loading,
    saving,
    saveAnswer,
    updateProgress,
    completeReflection,
  };
};
