import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, RefreshCw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBlueprint } from '@/hooks/useBlueprint';
import { BlueprintHistory } from '@/components/blueprint/BlueprintHistory';
import { ShareBlueprint } from '@/components/blueprint/ShareBlueprint';
import { BlueprintCompare } from '@/components/blueprint/BlueprintCompare';
import { EmailBlueprint } from '@/components/blueprint/EmailBlueprint';
import { BlueprintNotes } from '@/components/blueprint/BlueprintNotes';
import { BlueprintReminders } from '@/components/blueprint/BlueprintReminders';
import { BlueprintGoals } from '@/components/blueprint/BlueprintGoals';
import { BlueprintContent } from '@/components/blueprint/BlueprintContent';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#8B5CF6', '#D946EF', '#F97316', '#10B981', '#3B82F6'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  // Initial burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });

  frame();
};

const Blueprint = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedForBlueprint, setHasCheckedForBlueprint] = useState(false);
  const wasGenerating = useRef(false);
  const hasTriggeredConfetti = useRef(false);
  const blueprintContentRef = useRef<HTMLDivElement>(null);
  const { 
    isGenerating, 
    isLoading, 
    blueprint, 
    savedBlueprint,
    allBlueprints,
    selectedBlueprintId,
    error, 
    generateBlueprint,
    selectBlueprint,
    deleteBlueprint
  } = useBlueprint();

  // Trigger confetti when generation completes
  useEffect(() => {
    if (wasGenerating.current && !isGenerating && blueprint && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      triggerConfetti();
    }
    wasGenerating.current = isGenerating;
    
    // Reset confetti trigger when starting new generation
    if (isGenerating) {
      hasTriggeredConfetti.current = false;
    }
  }, [isGenerating, blueprint]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [navigate]);

  // Auto-generate blueprint if none exists after loading completes
  useEffect(() => {
    if (isAuthenticated && !isLoading && !blueprint && !isGenerating && !error && !hasCheckedForBlueprint) {
      setHasCheckedForBlueprint(true);
      // Only auto-generate if there's no existing blueprint
      generateBlueprint();
    }
  }, [isAuthenticated, isLoading, blueprint, isGenerating, error, hasCheckedForBlueprint, generateBlueprint]);

  const showLoading = !isAuthenticated || isLoading;

  const handleDownload = () => {
    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-2025-blueprint.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-bold text-lg">Your 2025 Blueprint</h1>
          <div className="flex gap-2">
            <BlueprintHistory 
              blueprints={allBlueprints}
              selectedId={selectedBlueprintId}
              onSelect={selectBlueprint}
              onDelete={deleteBlueprint}
            />
            <BlueprintCompare 
              blueprints={allBlueprints}
              currentBlueprintId={selectedBlueprintId}
            />
            {blueprint && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateBlueprint}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="print:hidden"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <ShareBlueprint 
                  blueprintRef={blueprintContentRef}
                  blueprintId={selectedBlueprintId}
                />
                <EmailBlueprint
                  blueprintContent={blueprint}
                  blueprintDate={savedBlueprint?.created_at || new Date().toISOString()}
                />
                <BlueprintReminders blueprintId={selectedBlueprintId} />
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="print:hidden"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {isGenerating && !blueprint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="relative inline-block mb-6">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Creating Your Blueprint...</h2>
              <p className="text-muted-foreground">
                Analyzing your reflections and crafting personalized insights for 2025
              </p>
              <div className="mt-8 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {error && !blueprint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md mx-auto">
                <h2 className="text-xl font-bold text-destructive mb-2">Generation Failed</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={generateBlueprint}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {blueprint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-lg dark:prose-invert max-w-none print-container"
            >
              {/* Print-only header */}
              <div className="print-header hidden print:block">
                <h1>Your 2025 Blueprint</h1>
                <p>AI-crafted insights and goals based on your year in review</p>
              </div>

              {/* Gradient header card - hidden in print */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-8 mb-8 text-primary-foreground print:hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-8 w-8" />
                    <span className="text-sm font-medium uppercase tracking-wider opacity-80">
                      Your Personal
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">2025 Blueprint</h1>
                  <p className="text-lg opacity-90">
                    AI-crafted insights and goals based on your year in review
                  </p>
                </div>
              </div>

              {/* Blueprint content with premium formatting */}
              <div 
                ref={blueprintContentRef}
                className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg print-content print:bg-white print:border-none print:shadow-none print:p-0"
              >
                <BlueprintContent content={blueprint} isGenerating={isGenerating} />
              </div>

              {/* Goals Section */}
              <BlueprintGoals blueprintId={selectedBlueprintId} />

              {/* Personal Notes Section */}
              <BlueprintNotes blueprintId={selectedBlueprintId} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blueprint;
