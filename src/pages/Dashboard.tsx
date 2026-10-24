import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LogOut, 
  Play, 
  Sparkles, 
  ChevronRight,
  FileText,
  Target,
  User,
  Clock
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import type { User as SupabaseUser } from "@/lib/api-client";

interface ReflectionData {
  id: string;
  status: string;
  current_question_index: number;
  completed_at: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState<ReflectionData | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile(user?.id);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: reflectionData } = await supabase
        .from("reflections")
        .select("id, status, current_question_index, completed_at")
        .eq("user_id", session.user.id)
        .eq("year", 2025)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reflectionData) {
        setReflection(reflectionData);
      }

      setLoading(false);
    };

    loadData();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

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

  const userName = profile?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const isCompleted = reflection?.status === "completed";
  const isInProgress = reflection?.status === "in_progress";
  const progressPercent = reflection ? Math.round((reflection.current_question_index / 25) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-black text-gradient-primary">Rewind</span>
          </a>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Profile Settings Component */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ProfileSettings userId={user.id} userEmail={user.email} />
          </motion.div>
        )}

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-muted-foreground mb-1">Hi {userName} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-black">
            {isCompleted ? "Your 2025 is wrapped" : "Ready to reflect?"}
          </h1>
        </motion.div>

        {/* Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {isCompleted ? (
            <button
              onClick={() => navigate("/wrapped")}
              className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-left group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm opacity-80 mb-2">Your 2025 Wrapped</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to share</h2>
                  <p className="opacity-80">View and share your year in review</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("/reflect")}
              className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-left group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 opacity-80" />
                    <span className="text-sm opacity-80">~5 minutes</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {isInProgress ? "Continue Reflection" : "Start Your Reflection"}
                  </h2>
                  {isInProgress && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-primary-foreground/20 rounded-full overflow-hidden max-w-32">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm opacity-80">{progressPercent}% done</span>
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6" />
                </div>
              </div>
            </button>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground font-medium">Quick actions</p>
          
          <div className="space-y-2">
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label="View Blueprint"
              sublabel={isCompleted ? "Your AI-powered roadmap" : "Complete reflection first"}
              onClick={() => navigate("/blueprint")}
              disabled={!isCompleted}
            />
            <QuickAction
              icon={<Target className="w-5 h-5" />}
              label="Track Goals"
              sublabel={isCompleted ? "Monitor your progress" : "Complete reflection first"}
              onClick={() => navigate("/goals")}
              disabled={!isCompleted}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Quick action component
const QuickAction = ({ 
  icon, 
  label, 
  sublabel, 
  onClick, 
  disabled 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string; 
  onClick: () => void; 
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full p-4 rounded-2xl border border-border bg-card text-left
      flex items-center gap-4 transition-all duration-200
      ${disabled 
        ? "opacity-50 cursor-not-allowed" 
        : "hover:border-primary/50 hover:bg-card/80"
      }
    `}
  >
    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{sublabel}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  </button>
);

export default Dashboard;
