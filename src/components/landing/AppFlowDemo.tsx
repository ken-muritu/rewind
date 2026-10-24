import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const screens = [
  {
    id: "welcome",
    title: "Welcome",
    content: (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-4 flex items-center justify-center"
        >
          <span className="text-2xl text-white font-bold">R</span>
        </motion.div>
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-bold text-white mb-2"
        >
          Welcome to Rewind
        </motion.h3>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/60"
        >
          Your year, distilled.
        </motion.p>
      </div>
    ),
  },
  {
    id: "reflect",
    title: "Reflect",
    content: (
      <div className="flex flex-col h-full p-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4"
        >
          <span className="text-xs text-violet-400 font-medium">Question 1 of 12</span>
          <div className="w-full h-1 bg-white/10 rounded-full mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "25%" }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base font-semibold text-white mb-3"
        >
          What was your biggest win this year?
        </motion.h3>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.6, repeat: Infinity, duration: 1 }}
            className="text-white/40 text-sm"
          >
            Type your answer...
          </motion.span>
        </motion.div>
      </div>
    ),
  },
  {
    id: "generate",
    title: "Generate",
    content: (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent mb-4"
        />
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base font-semibold text-white mb-2"
        >
          Generating Your Blueprint
        </motion.h3>
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ delay: i * 0.2, repeat: Infinity, duration: 1 }}
              className="w-2 h-2 rounded-full bg-violet-400"
            />
          ))}
        </motion.div>
      </div>
    ),
  },
  {
    id: "blueprint",
    title: "Blueprint",
    content: (
      <div className="flex flex-col h-full p-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-sm font-medium text-white">Your 2024 Blueprint</span>
        </motion.div>
        {["Key Insights", "Growth Areas", "Action Steps"].map((item, i) => (
          <motion.div
            key={item}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-2 border border-white/10"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-violet-400" />
            </div>
            <span className="text-sm text-white/80">{item}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "goals",
    title: "Goals",
    content: (
      <div className="flex flex-col h-full p-4">
        <motion.h3
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base font-semibold text-white mb-4"
        >
          Your 2025 Goals
        </motion.h3>
        {[
          { label: "Career Growth", progress: 65 },
          { label: "Health & Wellness", progress: 40 },
          { label: "Learning", progress: 80 },
        ].map((goal, i) => (
          <motion.div
            key={goal.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="mb-3"
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/80">{goal.label}</span>
              <span className="text-violet-400">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
];

export const AppFlowDemo = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            See It In Action
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Experience the{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how Rewind transforms your reflections into actionable insights
          </p>
        </motion.div>

        {/* Demo Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative w-[280px] h-[560px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-2 shadow-2xl shadow-black/50">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
              
              {/* Screen */}
              <div className="relative w-full h-full bg-[#0a0a12] rounded-[2.5rem] overflow-hidden">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 text-white/60 text-[10px] z-10">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 border border-white/60 rounded-sm">
                      <div className="w-2/3 h-full bg-white/60 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Screen Content */}
                <div className="absolute inset-0 pt-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={screens[currentScreen].id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {screens[currentScreen].content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-3xl scale-110" />
          </motion.div>

          {/* Steps Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => {
                  setCurrentScreen(index);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left min-w-[200px] ${
                  currentScreen === index
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-card/50 border border-border/50 hover:border-primary/20"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentScreen === index
                      ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`font-medium transition-colors ${
                    currentScreen === index ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {screen.title}
                </span>
              </button>
            ))}

            {/* Play/Pause Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="mt-2 gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Play
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
