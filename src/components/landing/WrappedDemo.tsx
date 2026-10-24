import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

const demoCards = [
  {
    id: 1,
    title: "2025",
    subtitle: "Kennedy's Year",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    textColor: "text-white",
    content: null,
  },
  {
    id: 2,
    title: "The Numbers",
    subtitle: "By the digits",
    gradient: "from-slate-900 via-gray-900 to-zinc-900",
    textColor: "text-white",
    content: (
      <div className="space-y-5">
        {[
          { label: "Projects shipped", value: "12" },
          { label: "Skills gained", value: "7" },
          { label: "Cups of coffee", value: "847" },
        ].map((item) => (
          <motion.div 
            key={item.label}
            className="flex justify-between items-center border-b border-white/10 pb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white/60 text-sm">{item.label}</span>
            <span className="text-4xl font-mono font-black text-white">{item.value}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    title: "Peak Moment",
    subtitle: "The highlight",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    textColor: "text-white",
    content: (
      <motion.p 
        className="text-xl font-medium italic text-white/90 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        "The day I launched my first product and saw real users signing up. 
        Months of late nights finally paid off."
      </motion.p>
    ),
  },
  {
    id: 4,
    title: "The Struggle",
    subtitle: "What challenged you",
    gradient: "from-rose-600 via-red-600 to-orange-600",
    textColor: "text-white",
    content: (
      <motion.p 
        className="text-xl font-medium text-white/90 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Burnout hit hard in Q3. Learned that rest isn't optional—it's essential for the long game.
      </motion.p>
    ),
  },
  {
    id: 5,
    title: "Pattern Found",
    subtitle: "Self-discovery",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    textColor: "text-black",
    content: (
      <div className="space-y-3">
        <p className="text-lg text-black/70 font-medium">
          You tend to...
        </p>
        <p className="text-2xl font-bold text-black">
          Start strong, then overcommit by week 6.
        </p>
        <p className="text-black/60">
          Your best work happened when you said "no" more often.
        </p>
      </div>
    ),
  },
  {
    id: 6,
    title: "2026",
    subtitle: "The Pivot",
    gradient: "from-violet-600 via-fuchsia-600 to-pink-600",
    textColor: "text-white",
    content: (
      <motion.p 
        className="text-2xl font-bold text-white"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        "I will ship fewer things, but ship them right."
      </motion.p>
    ),
  },
];

export const WrappedDemo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % demoCards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % demoCards.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + demoCards.length) % demoCards.length);

  return (
    <section id="demo" className="py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, -50, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Play className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-semibold text-accent-foreground">Live Preview</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Your <span className="text-gradient-primary">Wrapped</span> awaits
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            8 cinematic cards that tell your story. Shareable. Beautiful. Unforgettable.
          </p>
        </motion.div>

        {/* Cards display area */}
        <div className="flex justify-center items-center mb-12">
          <div className="relative w-80 h-[520px]">
            {/* Card stack effect - show 3 cards */}
            <AnimatePresence mode="popLayout">
              {[2, 1, 0].map((offset) => {
                const cardIndex = (currentIndex + offset) % demoCards.length;
                const card = demoCards[cardIndex];
                
                return (
                  <motion.div
                    key={`${card.id}-${offset}`}
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.gradient} p-8 flex flex-col justify-between overflow-hidden`}
                    style={{
                      zIndex: 3 - offset,
                    }}
                    initial={offset === 0 ? { scale: 1.05, y: -30 } : false}
                    animate={{
                      scale: 1 - offset * 0.05,
                      y: offset * 24,
                      rotateZ: offset * 2,
                      filter: offset > 0 ? `brightness(${1 - offset * 0.15})` : 'brightness(1)',
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Shimmer effect on front card */}
                    {offset === 0 && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                      />
                    )}

                    {/* Card content */}
                    <div>
                      {card.subtitle && (
                        <p className={`text-xs uppercase tracking-widest opacity-60 mb-2 ${card.textColor}`}>
                          {card.subtitle}
                        </p>
                      )}
                      <h3 className={`text-3xl font-black mb-6 ${card.textColor}`}>
                        {card.title}
                      </h3>
                    </div>

                    <div className="flex-1 flex items-center">
                      {card.content}
                    </div>

                    {/* Watermark */}
                    <div className="mt-auto pt-4">
                      <p className={`text-xs opacity-40 ${card.textColor}`}>Made with Rewind</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6">
          {/* Navigation arrows and play/pause */}
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrev}
              className="w-12 h-12 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center transition-all duration-300 group"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-lg shadow-primary/30"
              aria-label={isAutoPlaying ? "Pause" : "Play"}
            >
              {isAutoPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={goToNext}
              className="w-12 h-12 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center transition-all duration-300 group"
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card indicators */}
          <div className="flex justify-center gap-2">
            {demoCards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
