export interface Question {
  id: string;
  category: "evidence" | "emotions" | "people" | "patterns" | "future";
  question: string;
  options: string[];
  allowCustom: boolean;
  multiSelect?: boolean; // Allow selecting multiple options
  placeholder?: string;
  helperText?: string;
}

export interface Category {
  id: "evidence" | "emotions" | "people" | "patterns" | "future";
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: "evidence",
    name: "The Evidence",
    description: "What you built, earned, and shipped",
    icon: "Trophy",
    color: "text-accent",
  },
  {
    id: "emotions",
    name: "The Emotions",
    description: "Your peaks, valleys, and surprises",
    icon: "Heart",
    color: "text-destructive",
  },
  {
    id: "people",
    name: "The People",
    description: "Who mattered and who faded",
    icon: "Users",
    color: "text-primary",
  },
  {
    id: "patterns",
    name: "The Patterns",
    description: "Your strengths, distractions, and growth",
    icon: "Brain",
    color: "text-accent",
  },
  {
    id: "future",
    name: "The Future",
    description: "What changes moving forward",
    icon: "Rocket",
    color: "text-primary",
  },
];

export const questions: Question[] = [
  // EVIDENCE (5 questions)
  {
    id: "evidence_1",
    category: "evidence",
    question: "What did you create or build this year that you're most proud of?",
    options: [
      "A side project or app I shipped",
      "A new skill or certification",
      "A meaningful relationship or community",
      "A business or income stream",
      "A creative work (art, music, writing)",
    ],
    allowCustom: true,
    placeholder: "Tell us what you created...",
    helperText: "This could be anything—code, content, connections, or personal growth.",
  },
  {
    id: "evidence_2",
    category: "evidence",
    question: "What skills did you develop or improve this year?",
    options: [
      "Technical skills (coding, design, data)",
      "Communication and leadership",
      "Creative abilities (writing, art, music)",
      "Business and entrepreneurship",
      "Health and fitness",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "Share the skill you developed...",
  },
  {
    id: "evidence_3",
    category: "evidence",
    question: "What milestones or achievements did you hit?",
    options: [
      "Launched a project or product",
      "Got promoted or changed jobs",
      "Hit a financial goal",
      "Completed a major learning journey",
      "Built something meaningful",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "Describe your achievement...",
  },
  {
    id: "evidence_4",
    category: "evidence",
    question: "What did you learn that changed how you think?",
    options: [
      "A book that shifted my perspective",
      "A failure that taught me resilience",
      "A mentor's advice that clicked",
      "A life experience that humbled me",
      "A skill that unlocked new possibilities",
    ],
    allowCustom: true,
    placeholder: "Share what changed your thinking...",
    helperText: "Sometimes the biggest lessons come from unexpected places.",
  },
  {
    id: "evidence_5",
    category: "evidence",
    question: "If you had to summarize your productivity this year in one phrase, what would it be?",
    options: [
      "Shipped more than ever before",
      "Focused on depth over breadth",
      "Struggled but learned a lot",
      "Found my rhythm finally",
      "Started many, finished few",
    ],
    allowCustom: true,
    placeholder: "Sum up your productivity...",
  },

  // EMOTIONS (5 questions)
  {
    id: "emotions_1",
    category: "emotions",
    question: "What was your absolute highest moment this year?",
    options: [
      "A project launch or big win",
      "A breakthrough in learning something new",
      "A deep connection with someone special",
      "A moment of recognition or appreciation",
      "Overcoming a major challenge",
    ],
    allowCustom: true,
    placeholder: "Describe that peak moment...",
    helperText: "Close your eyes and remember how that felt.",
  },
  {
    id: "emotions_2",
    category: "emotions",
    question: "What was the hardest thing you had to deal with?",
    options: [
      "A professional setback or failure",
      "A personal loss or struggle",
      "Health or mental health challenges",
      "A difficult relationship situation",
      "Financial stress or uncertainty",
    ],
    allowCustom: true,
    placeholder: "Share what challenged you...",
    helperText: "Growth often hides in our struggles.",
  },
  {
    id: "emotions_3",
    category: "emotions",
    question: "What surprised you most about this year?",
    options: [
      "How quickly things changed",
      "An unexpected opportunity that appeared",
      "How resilient I actually was",
      "A relationship that transformed",
      "Something I didn't know I was capable of",
    ],
    allowCustom: true,
    placeholder: "What caught you off guard?",
  },
  {
    id: "emotions_4",
    category: "emotions",
    question: "When did you feel most alive and energized?",
    options: [
      "While working on a passion project",
      "During travel or adventure",
      "In deep conversation with someone",
      "Learning something completely new",
      "Achieving a goal I set for myself",
    ],
    allowCustom: true,
    placeholder: "Describe when you felt most alive...",
  },
  {
    id: "emotions_5",
    category: "emotions",
    question: "What emotion defined most of your year?",
    options: [
      "Hope and optimism",
      "Anxiety and uncertainty",
      "Excitement and momentum",
      "Gratitude and appreciation",
      "Determination and focus",
    ],
    allowCustom: true,
    placeholder: "Name your defining emotion...",
    helperText: "Be honest—there are no wrong answers here.",
  },

  // PEOPLE (5 questions)
  {
    id: "people_1",
    category: "people",
    question: "Who showed up for you when it mattered most?",
    options: [
      "A close friend",
      "A family member",
      "A mentor or colleague",
      "A partner or spouse",
      "An unexpected supporter",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "Tell us who was there for you...",
    helperText: "The people who were there in your peaks and valleys.",
  },
  {
    id: "people_2",
    category: "people",
    question: "Who did you become closer to this year?",
    options: [
      "An old friend I reconnected with",
      "A new friend I made this year",
      "A family member I grew closer to",
      "A colleague who became a friend",
      "Myself (self-relationship improved)",
    ],
    allowCustom: true,
    placeholder: "Share who you grew closer to...",
  },
  {
    id: "people_3",
    category: "people",
    question: "Who inspired or influenced you significantly?",
    options: [
      "A mentor or teacher",
      "A public figure or creator",
      "A friend who leads by example",
      "A family member's wisdom",
      "Someone I only know online",
    ],
    allowCustom: true,
    placeholder: "Who inspired you?",
  },
  {
    id: "people_4",
    category: "people",
    question: "What relationship do you wish you had invested more in?",
    options: [
      "A friendship that faded",
      "Family I didn't see enough",
      "A professional connection",
      "Myself (self-care, self-development)",
      "A romantic relationship",
    ],
    allowCustom: true,
    placeholder: "Which relationship needed more?",
  },
  {
    id: "people_5",
    category: "people",
    question: "Who are the MVPs of your year?",
    options: [
      "My partner/spouse",
      "My best friend(s)",
      "My family",
      "My work team/colleagues",
      "My online community",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "Name your MVPs...",
    helperText: "These could appear in your Wrapped as shoutouts.",
  },

  // PATTERNS (5 questions)
  {
    id: "patterns_1",
    category: "patterns",
    question: "What strength became more apparent to you this year?",
    options: [
      "My ability to adapt and be flexible",
      "My persistence and determination",
      "My creativity and problem-solving",
      "My empathy and emotional intelligence",
      "My focus and discipline",
    ],
    allowCustom: true,
    placeholder: "What strength emerged?",
  },
  {
    id: "patterns_2",
    category: "patterns",
    question: "What was your biggest distraction or time-waster?",
    options: [
      "Social media scrolling",
      "Overcommitting to too many things",
      "Perfectionism and overthinking",
      "Unhealthy habits or relationships",
      "Comparing myself to others",
    ],
    allowCustom: true,
    placeholder: "What distracted you most?",
    helperText: "Awareness is the first step to change.",
  },
  {
    id: "patterns_3",
    category: "patterns",
    question: "When you failed or fell short, what was usually the reason?",
    options: [
      "Procrastination and avoidance",
      "Fear of failure or judgment",
      "Lack of focus or clarity",
      "Taking on too much at once",
      "Not asking for help when needed",
    ],
    allowCustom: true,
    placeholder: "What pattern caused setbacks?",
  },
  {
    id: "patterns_4",
    category: "patterns",
    question: "What habit or behavior served you well?",
    options: [
      "Consistent exercise or health routine",
      "Deep work and focus blocks",
      "Journaling or daily reflection",
      "Saying no to distractions",
      "Building in public / accountability",
    ],
    allowCustom: true,
    placeholder: "What habit helped you?",
  },
  {
    id: "patterns_5",
    category: "patterns",
    question: "If someone observed your year, what pattern would they notice?",
    options: [
      "You're always learning something new",
      "You put others before yourself",
      "You start strong but fade",
      "You thrive under pressure",
      "You avoid confrontation",
    ],
    allowCustom: true,
    placeholder: "What pattern would others see?",
    helperText: "This might become an insight in your Wrapped.",
  },

  // FUTURE (5 questions)
  {
    id: "future_1",
    category: "future",
    question: "What do you want to feel more of going forward?",
    options: [
      "Peace and calm",
      "Excitement and momentum",
      "Connection and belonging",
      "Confidence and self-trust",
      "Joy and playfulness",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "What feeling do you want more of?",
  },
  {
    id: "future_2",
    category: "future",
    question: "What do you want to feel less of going forward?",
    options: [
      "Anxiety and overwhelm",
      "FOMO and comparison",
      "Exhaustion and burnout",
      "Self-doubt and imposter syndrome",
      "Loneliness and isolation",
    ],
    allowCustom: true,
    multiSelect: true,
    placeholder: "What do you want less of?",
  },
  {
    id: "future_3",
    category: "future",
    question: "What is the ONE thing you are committing to next?",
    options: [
      "Ship more projects and ideas",
      "Build financial stability",
      "Prioritize health and fitness",
      "Deepen relationships",
      "Master a new skill",
    ],
    allowCustom: true,
    placeholder: "Your one commitment moving forward...",
    helperText: "This will be highlighted in your Wrapped and Blueprint.",
  },
  {
    id: "future_4",
    category: "future",
    question: "What are you letting go of as you move forward?",
    options: [
      "Toxic productivity and hustle culture",
      "Relationships that drain me",
      "Fear of being judged",
      "Perfectionism holding me back",
      "The need to please everyone",
    ],
    allowCustom: true,
    placeholder: "What are you releasing?",
  },
  {
    id: "future_5",
    category: "future",
    question: "If the next year goes exactly as you hope, what will be different?",
    options: [
      "I'll have launched something I'm proud of",
      "I'll be healthier and more energized",
      "I'll have deeper, more meaningful relationships",
      "I'll have financial freedom and security",
      "I'll finally feel at peace with myself",
    ],
    allowCustom: true,
    placeholder: "Paint your ideal future...",
    helperText: "Paint a vivid picture of your ideal outcome.",
  },
];

export const getCategoryQuestions = (categoryId: string) => {
  return questions.filter((q) => q.category === categoryId);
};

export const getQuestionById = (questionId: string) => {
  return questions.find((q) => q.id === questionId);
};

export const getCategoryByQuestionIndex = (index: number) => {
  const question = questions[index];
  if (!question) return null;
  return categories.find((c) => c.id === question.category);
};

export const getCategoryProgress = (currentIndex: number) => {
  const categoryIndex = Math.floor(currentIndex / 5);
  return {
    current: categoryIndex + 1,
    total: categories.length,
    category: categories[categoryIndex],
  };
};

// Celebration messages for gamification
export const celebrationMessages = [
  { threshold: 5, message: "You're on fire! 🔥", subtext: "First category complete!" },
  { threshold: 10, message: "Halfway there! 🚀", subtext: "Keep the momentum!" },
  { threshold: 15, message: "Almost done! ⚡", subtext: "You're crushing it!" },
  { threshold: 20, message: "Final stretch! 🏁", subtext: "One category to go!" },
  { threshold: 25, message: "You did it! 🎉", subtext: "Your Wrapped awaits!" },
];

export const getCelebrationMessage = (questionIndex: number) => {
  return celebrationMessages.find((c) => c.threshold === questionIndex + 1);
};
