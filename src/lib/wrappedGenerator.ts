// Wrapped card generation utilities

export interface UserProfile {
  username: string | null;
  avatar_url: string | null;
  avatar_type: string;
}

export interface WrappedCardData {
  id: string;
  type: 
    | "opening"
    | "numbers"
    | "peak"
    | "struggle"
    | "people"
    | "pattern"
    | "pivot"
    | "final";
  title: string;
  subtitle?: string;
  content: string | string[] | Record<string, number>;
  gradient: string;
  textColor: string;
  userProfile?: UserProfile;
}

interface ReflectionAnswers {
  [questionId: string]: string;
}

// Extract key metrics from answers
const extractMetrics = (answers: ReflectionAnswers) => {
  const projectsAnswer = answers["evidence_1"] || "";
  const skillsAnswer = answers["evidence_2"] || "";
  const milestonesAnswer = answers["evidence_3"] || "";
  
  // Count items mentioned (rough heuristic based on commas, "and", line breaks)
  const countItems = (text: string) => {
    if (!text) return 0;
    const items = text.split(/,|\band\b|\n/).filter(s => s.trim().length > 0);
    return Math.max(1, items.length);
  };

  return {
    projects: countItems(projectsAnswer),
    skills: countItems(skillsAnswer),
    milestones: countItems(milestonesAnswer),
  };
};

// Get the first meaningful sentence or phrase
const extractQuote = (text: string, maxLength = 150): string => {
  if (!text) return "";
  
  // Clean up and get first sentence or truncate
  const cleaned = text.trim();
  const firstSentence = cleaned.split(/[.!?]/)[0];
  
  if (firstSentence.length <= maxLength) {
    return firstSentence.trim();
  }
  
  return cleaned.slice(0, maxLength).trim() + "...";
};

// Extract names from people answers
const extractNames = (text: string): string[] => {
  if (!text) return [];
  
  // Split by common separators and clean up
  const names = text
    .split(/,|\band\b|\n|;/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50) // Filter out long descriptions
    .slice(0, 5); // Max 5 names
  
  return names;
};

export const generateWrappedCards = (
  answers: ReflectionAnswers,
  userName: string,
  userProfile?: UserProfile
): WrappedCardData[] => {
  const metrics = extractMetrics(answers);
  
  const cards: WrappedCardData[] = [
    // 1. Opening Card
    {
      id: "opening",
      type: "opening",
      title: "2025",
      subtitle: `${userName}'s Year`,
      content: "A year of growth, challenges, and transformation.",
      gradient: "from-primary via-primary/90 to-primary/70",
      textColor: "text-primary-foreground",
      userProfile,
    },
    
    // 2. The Numbers
    {
      id: "numbers",
      type: "numbers",
      title: "The Numbers",
      content: {
        "Things Built": metrics.projects,
        "Skills Gained": metrics.skills,
        "Milestones Hit": metrics.milestones,
      },
      gradient: "from-foreground to-foreground/90",
      textColor: "text-background",
    },
    
    // 3. Peak Moment
    {
      id: "peak",
      type: "peak",
      title: "Peak Moment",
      subtitle: "Your highest high",
      content: extractQuote(answers["emotions_1"] || "The moments that made everything worth it."),
      gradient: "from-accent to-accent/80",
      textColor: "text-accent-foreground",
    },
    
    // 4. The Struggle
    {
      id: "struggle",
      type: "struggle",
      title: "The Struggle",
      subtitle: "What tested you",
      content: extractQuote(answers["emotions_2"] || "Growth often hides in our struggles."),
      gradient: "from-destructive/90 to-destructive/70",
      textColor: "text-destructive-foreground",
    },
    
    // 5. People MVPs
    {
      id: "people",
      type: "people",
      title: "Your MVPs",
      subtitle: "The people who showed up",
      content: extractNames(answers["people_5"] || answers["people_1"] || ""),
      gradient: "from-primary/90 via-primary/70 to-accent/50",
      textColor: "text-primary-foreground",
    },
    
    // 6. Pattern Recognition
    {
      id: "pattern",
      type: "pattern",
      title: "Pattern Found",
      subtitle: "What the year revealed",
      content: extractQuote(
        answers["patterns_5"] || answers["patterns_1"] || 
        "Every year teaches us something about ourselves."
      ),
      gradient: "from-secondary via-muted to-secondary",
      textColor: "text-secondary-foreground",
    },
    
    // 7. The Pivot
    {
      id: "pivot",
      type: "pivot",
      title: "The Pivot",
      subtitle: "Your 2026 commitment",
      content: extractQuote(
        answers["future_3"] || 
        "A new chapter begins with a single decision."
      ),
      gradient: "from-primary via-primary/80 to-accent",
      textColor: "text-primary-foreground",
    },
    
    // 8. Final Frame
    {
      id: "final",
      type: "final",
      title: "2025 → 2026",
      subtitle: "Your year, distilled.",
      content: extractQuote(
        answers["future_5"] || 
        "The best is yet to come."
      ),
      gradient: "from-foreground via-foreground/95 to-foreground/90",
      textColor: "text-background",
      userProfile,
    },
  ];

  return cards;
};
