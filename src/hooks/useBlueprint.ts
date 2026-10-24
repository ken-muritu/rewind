import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { questions } from '@/data/questions';

interface BlueprintAnswer {
  question: string;
  answer: string;
  category: string;
}

export interface SavedBlueprint {
  id: string;
  content: string;
  reflection_id: string;
  created_at: string;
  updated_at: string;
}

export function useBlueprint() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blueprint, setBlueprint] = useState<string>('');
  const [savedBlueprint, setSavedBlueprint] = useState<SavedBlueprint | null>(null);
  const [allBlueprints, setAllBlueprints] = useState<SavedBlueprint[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all blueprints for the user
  const fetchAllBlueprints = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: blueprints } = await supabase
      .from('blueprints')
      .select('id, content, reflection_id, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (blueprints) {
      setAllBlueprints(blueprints);
    }
  }, []);

  // Load existing blueprint on mount
  const loadExistingBlueprint = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all blueprints
      await fetchAllBlueprints();

      // Get the most recent completed reflection
      const { data: reflection } = await supabase
        .from('reflections')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!reflection) {
        setIsLoading(false);
        return;
      }

      // Check if a blueprint exists for this reflection
      const { data: existingBlueprint } = await supabase
        .from('blueprints')
        .select('id, content, reflection_id, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('reflection_id', reflection.id)
        .maybeSingle();

      if (existingBlueprint) {
        setSavedBlueprint(existingBlueprint);
        setBlueprint(existingBlueprint.content);
        setSelectedBlueprintId(existingBlueprint.id);
      }
    } catch (err) {
      console.error('Error loading blueprint:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllBlueprints]);

  useEffect(() => {
    loadExistingBlueprint();
  }, [loadExistingBlueprint]);

  // Select a specific blueprint to view
  const selectBlueprint = useCallback((blueprintId: string) => {
    const selected = allBlueprints.find(b => b.id === blueprintId);
    if (selected) {
      setSelectedBlueprintId(blueprintId);
      setBlueprint(selected.content);
      setSavedBlueprint(selected);
    }
  }, [allBlueprints]);

  const fetchAnswers = useCallback(async (): Promise<{ answers: BlueprintAnswer[], reflectionId: string } | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to generate your blueprint.",
        variant: "destructive",
      });
      return null;
    }

    // Get the completed reflection
    const { data: reflection, error: reflectionError } = await supabase
      .from('reflections')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reflectionError || !reflection) {
      toast({
        title: "No completed reflection",
        description: "Please complete your reflection first.",
        variant: "destructive",
      });
      return null;
    }

    // Fetch all answers
    const { data: answers, error: answersError } = await supabase
      .from('reflection_answers')
      .select('question_id, answer, category')
      .eq('reflection_id', reflection.id);

    if (answersError || !answers) {
      toast({
        title: "Error fetching answers",
        description: "Could not load your reflection answers.",
        variant: "destructive",
      });
      return null;
    }

    // Map answers with question text
    const formattedAnswers: BlueprintAnswer[] = answers.map(a => {
      const question = questions.find(q => q.id === a.question_id);
      return {
        question: question?.question || a.question_id,
        answer: a.answer,
        category: a.category,
      };
    });

    return { answers: formattedAnswers, reflectionId: reflection.id };
  }, [toast]);

  const saveBlueprint = useCallback(async (content: string, reflectionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upsert the blueprint (update if exists, insert if not)
    const { data, error } = await supabase
      .from('blueprints')
      .upsert({
        user_id: user.id,
        reflection_id: reflectionId,
        content,
      }, {
        onConflict: 'user_id,reflection_id',
      })
      .select('id, content, reflection_id, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error saving blueprint:', error);
      toast({
        title: "Save failed",
        description: "Could not save your blueprint, but you can still download it.",
        variant: "destructive",
      });
    } else if (data) {
      setSavedBlueprint(data);
      setSelectedBlueprintId(data.id);
      // Refresh the list
      await fetchAllBlueprints();
      toast({
        title: "Blueprint saved",
        description: "Your blueprint has been saved and can be viewed anytime.",
      });
    }
  }, [toast, fetchAllBlueprints]);

  const generateBlueprint = useCallback(async () => {
    setIsGenerating(true);
    setBlueprint('');
    setError(null);

    try {
      const result = await fetchAnswers();
      if (!result) {
        setIsGenerating(false);
        return;
      }

      const { answers, reflectionId } = result;

      // Get the current session to pass the user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session. Please sign in again.');
      }

      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/generate-blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI usage limit reached. Please add credits to continue.");
        }
        throw new Error(errorData.error || 'Failed to generate blueprint');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setBlueprint(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setBlueprint(fullText);
            }
          } catch { /* ignore */ }
        }
      }

      // Save the completed blueprint to the database
      if (fullText) {
        await saveBlueprint(fullText, reflectionId);
      }

    } catch (err) {
      console.error('Blueprint generation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate blueprint';
      setError(message);
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [fetchAnswers, saveBlueprint, toast]);

  const deleteBlueprint = useCallback(async (blueprintId: string) => {
    const { error } = await supabase
      .from('blueprints')
      .delete()
      .eq('id', blueprintId);

    if (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the blueprint.",
        variant: "destructive",
      });
      return false;
    }

    // Update local state
    setAllBlueprints(prev => prev.filter(b => b.id !== blueprintId));
    
    // If we deleted the currently selected blueprint, clear it
    if (selectedBlueprintId === blueprintId) {
      const remaining = allBlueprints.filter(b => b.id !== blueprintId);
      if (remaining.length > 0) {
        selectBlueprint(remaining[0].id);
      } else {
        setBlueprint('');
        setSavedBlueprint(null);
        setSelectedBlueprintId(null);
      }
    }

    toast({
      title: "Blueprint deleted",
      description: "The blueprint has been removed.",
    });
    return true;
  }, [toast, selectedBlueprintId, allBlueprints, selectBlueprint]);

  return {
    isGenerating,
    isLoading,
    blueprint,
    savedBlueprint,
    allBlueprints,
    selectedBlueprintId,
    error,
    generateBlueprint,
    loadExistingBlueprint,
    selectBlueprint,
    deleteBlueprint,
  };
}
