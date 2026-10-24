import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, RefreshCw, Edit3 } from "lucide-react";
import { WrappedViewer } from "@/components/wrapped/WrappedViewer";
import { generateWrappedCards, type WrappedCardData, type UserProfile } from "@/lib/wrappedGenerator";
import type { User } from "@/lib/api-client";

const Wrapped = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cards, setCards] = useState<WrappedCardData[]>([]);
  const [hasCompletedReflection, setHasCompletedReflection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check for completed reflection - get the most recent one
      const { data: reflections, error: reflectionError } = await supabase
        .from("reflections")
        .select("id, status")
        .eq("user_id", session.user.id)
        .eq("year", 2025)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);

      if (reflectionError) {
        console.error("Error fetching reflection:", reflectionError);
        setLoading(false);
        return;
      }

      const reflection = reflections?.[0];

      if (!reflection || reflection.status !== "completed") {
        setHasCompletedReflection(false);
        setLoading(false);
        return;
      }

      setHasCompletedReflection(true);

      // Load answers and generate cards
      setGenerating(true);
      
      // Fetch answers and profile in parallel
      const [answersResult, profileResult] = await Promise.all([
        supabase
          .from("reflection_answers")
          .select("question_id, answer")
          .eq("reflection_id", reflection.id),
        supabase
          .from("profiles")
          .select("username, avatar_url, avatar_type")
          .eq("id", session.user.id)
          .maybeSingle()
      ]);

      if (answersResult.error) {
        console.error("Error fetching answers:", answersResult.error);
        setGenerating(false);
        setLoading(false);
        return;
      }

      // Convert answers to map
      const answersMap: Record<string, string> = {};
      answersResult.data?.forEach((a) => {
        answersMap[a.question_id] = a.answer;
      });

      // Get user profile
      const userProfile: UserProfile | undefined = profileResult.data ? {
        username: profileResult.data.username,
        avatar_url: profileResult.data.avatar_url,
        avatar_type: profileResult.data.avatar_type || "default"
      } : undefined;

      // Get user name (prefer profile username)
      const userName = userProfile?.username ||
                       session.user.user_metadata?.full_name || 
                       session.user.email?.split("@")[0] || 
                       "You";

      // Generate cards with profile
      const generatedCards = generateWrappedCards(answersMap, userName, userProfile);
      
      // Simulate generation delay for effect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setCards(generatedCards);
      setGenerating(false);
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  if (loading) {
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

  // Generating state
  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grain-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Creating your Wrapped...</h2>
          <p className="text-muted-foreground">
            Transforming your year into shareable story cards
          </p>
        </motion.div>
      </div>
    );
  }

  // No completed reflection
  if (!hasCompletedReflection) {
    return (
      <div className="min-h-screen bg-background grain-overlay flex flex-col">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md px-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-4">Complete Your Reflection First</h1>
            <p className="text-muted-foreground mb-8">
              Your Wrapped will be generated once you complete the reflection experience.
            </p>
            <Button 
              onClick={() => navigate("/reflect")} 
              className="bg-foreground text-background"
            >
              Start Reflection
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Show wrapped viewer
  return (
    <div className="min-h-screen bg-background grain-overlay">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <h1 className="text-xl font-bold">Your 2025 Wrapped</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Your Year, <span className="text-gradient-primary">Visualized</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Swipe through your story cards. Download and share your favorites.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reflect")}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reflect Again
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reflect")}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Answers
            </Button>
          </div>
        </motion.div>

        <WrappedViewer cards={cards} />
      </main>
    </div>
  );
};

export default Wrapped;
