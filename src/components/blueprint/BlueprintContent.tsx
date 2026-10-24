import { motion } from 'framer-motion';
import { 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Heart, 
  Calendar, 
  Star, 
  Sparkles,
  Quote,
  Compass
} from 'lucide-react';

interface BlueprintContentProps {
  content: string;
  isGenerating?: boolean;
}

// Parse inline markdown (bold, italic)
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(<strong key={key++} className="font-semibold text-foreground">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/(?:\*|_)(.+?)(?:\*|_)/);
    if (italicMatch && italicMatch.index !== undefined && !remaining.startsWith('**')) {
      if (italicMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, italicMatch.index)}</span>);
      }
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // No more matches, add remaining text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
};

// Get icon and gradient for each section type
const getSectionStyle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('theme') || lowerTitle.includes('core')) {
    return {
      icon: Compass,
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-500/30'
    };
  }
  if (lowerTitle.includes('insight')) {
    return {
      icon: Lightbulb,
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/30'
    };
  }
  if (lowerTitle.includes('strength')) {
    return {
      icon: TrendingUp,
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30'
    };
  }
  if (lowerTitle.includes('growth') || lowerTitle.includes('area')) {
    return {
      icon: Target,
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30'
    };
  }
  if (lowerTitle.includes('goal')) {
    return {
      icon: Star,
      gradient: 'from-orange-500/20 via-red-500/10 to-transparent',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/30'
    };
  }
  if (lowerTitle.includes('quarter') || lowerTitle.includes('month') || lowerTitle.includes('focus')) {
    return {
      icon: Calendar,
      gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
      iconColor: 'text-pink-500',
      borderColor: 'border-pink-500/30'
    };
  }
  if (lowerTitle.includes('affirmation') || lowerTitle.includes('mantra')) {
    return {
      icon: Heart,
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      iconColor: 'text-rose-500',
      borderColor: 'border-rose-500/30'
    };
  }
  if (lowerTitle.includes('word') || lowerTitle.includes('one word')) {
    return {
      icon: Sparkles,
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      iconColor: 'text-indigo-500',
      borderColor: 'border-indigo-500/30'
    };
  }
  
  return {
    icon: Lightbulb,
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    iconColor: 'text-primary',
    borderColor: 'border-primary/30'
  };
};

// Parse content into structured sections
const parseBlueprint = (content: string) => {
  const lines = content.split('\n');
  const sections: { title: string; content: string[]; isQuote?: boolean; isOneWord?: boolean }[] = [];
  let currentSection: { title: string; content: string[] } | null = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Main section headers (## or #)
    if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('# ')) {
      if (currentSection && currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, ''),
        content: []
      };
    } else if (currentSection) {
      if (trimmedLine) {
        currentSection.content.push(trimmedLine);
      }
    } else if (trimmedLine) {
      // Content before any section header
      if (!currentSection) {
        currentSection = { title: '', content: [] };
      }
      currentSection.content.push(trimmedLine);
    }
  });

  // Push last section
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
};

export const BlueprintContent = ({ content, isGenerating }: BlueprintContentProps) => {
  const sections = parseBlueprint(content);

  const renderContentItem = (item: string, index: number) => {
    const cleanItem = item.replace(/\*\*/g, '');
    
    // Numbered list items
    if (/^\d+\.\s/.test(item)) {
      const text = item.replace(/^\d+\.\s*/, '');
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0"
        >
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
            {item.match(/^\d+/)?.[0]}
          </span>
          <p className="text-foreground/90 leading-relaxed pt-1">
            {parseInlineMarkdown(text.replace(/\*\*/g, ''))}
          </p>
        </motion.div>
      );
    }

    // Bullet list items
    if (/^[-*•]\s/.test(item)) {
      const text = item.replace(/^[-*•]\s*/, '');
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 py-2"
        >
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
          <p className="text-foreground/90 leading-relaxed">
            {parseInlineMarkdown(text.replace(/\*\*/g, ''))}
          </p>
        </motion.div>
      );
    }

    // Sub-headers (### or bold lines)
    if (item.startsWith('### ') || (item.startsWith('**') && item.endsWith('**'))) {
      const text = item.replace(/^###\s*/, '').replace(/\*\*/g, '');
      return (
        <h4 key={index} className="font-semibold text-lg text-foreground mt-4 mb-2 first:mt-0">
          {text}
        </h4>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="text-foreground/80 leading-relaxed mb-3">
        {parseInlineMarkdown(cleanItem)}
      </p>
    );
  };

  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => {
        const { icon: Icon, gradient, iconColor, borderColor } = getSectionStyle(section.title);
        const isAffirmation = section.title.toLowerCase().includes('affirmation') || section.title.toLowerCase().includes('mantra');
        const isOneWord = section.title.toLowerCase().includes('one word');

        // Special rendering for affirmation/mantra
        if (isAffirmation) {
          return (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent border border-rose-500/20 p-8 text-center"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-rose-500/20" />
              <Quote className="absolute bottom-4 right-4 h-8 w-8 text-rose-500/20 rotate-180" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-rose-500" />
                  <h3 className="text-lg font-medium text-rose-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <p className="text-2xl md:text-3xl font-serif italic text-foreground leading-relaxed">
                  "{section.content.map(c => c.replace(/\*\*/g, '').replace(/^["']|["']$/g, '')).join(' ')}"
                </p>
              </div>
            </motion.div>
          );
        }

        // Special rendering for one word theme
        if (isOneWord) {
          const word = section.content[0]?.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim() || '';
          return (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 p-12 text-center"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-[200px] font-bold uppercase">{word.charAt(0)}</span>
              </div>
              <div className="relative z-10">
                <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-indigo-500 uppercase tracking-widest mb-4">
                  Your 2025 Theme
                </h3>
                <p className="text-5xl md:text-6xl font-bold text-foreground uppercase tracking-wide">
                  {word}
                </p>
                {section.content.length > 1 && (
                  <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                    {section.content.slice(1).join(' ').replace(/\*\*/g, '')}
                  </p>
                )}
              </div>
            </motion.div>
          );
        }

        // Regular section rendering
        return (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className={`relative overflow-hidden rounded-xl border ${borderColor} bg-card`}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />
            
            {/* Section header */}
            <div className="relative z-10 px-6 py-4 border-b border-border/50 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/50 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {section.title}
              </h3>
            </div>

            {/* Section content */}
            <div className="relative z-10 px-6 py-4">
              {section.content.map((item, itemIndex) => renderContentItem(item, itemIndex))}
            </div>
          </motion.div>
        );
      })}

      {isGenerating && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-sm">Generating insights...</span>
        </div>
      )}
    </div>
  );
};
