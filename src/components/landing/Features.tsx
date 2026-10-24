import { motion, useInView } from "framer-motion";
import { Brain, Share2, Target, Sparkles, Layers, Zap, Lock, Palette } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "Psychology-Backed",
    description: "Guided questions based on narrative identity theory and peak-end research that unlock genuine insights.",
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
  },
  {
    icon: Share2,
    title: "Shareable Stories",
    description: "Instagram-ready cards that make you look introspective and interesting. Share your journey beautifully.",
    gradient: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: Target,
    title: "Future Blueprint",
    description: "AI-powered planning that transforms insights into quarterly action plans with clear milestones.",
    gradient: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Cinematic Experience",
    description: "Smooth animations, beautiful typography, and film-grain aesthetics that make reflection feel magical.",
    gradient: "from-orange-500 to-amber-500",
    shadowColor: "shadow-orange-500/20",
  },
  {
    icon: Layers,
    title: "Deep Insights",
    description: "Uncover patterns in your behavior, identify growth areas, and understand what truly drives you.",
    gradient: "from-pink-500 to-rose-500",
    shadowColor: "shadow-pink-500/20",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your reflections are encrypted and stored securely. Only you can access your personal insights.",
    gradient: "from-slate-500 to-gray-600",
    shadowColor: "shadow-slate-500/20",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    }
  },
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      variants={item}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className={`relative h-full p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl ${feature.shadowColor}`}>
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <feature.icon className="w-7 h-7 text-white" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        {/* Decorative corner */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
          <feature.icon className="w-24 h-24 text-foreground" />
        </div>
      </div>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      {/* Floating accent */}
      <motion.div
        className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      
      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            Not just reflection.
            <br />
            <span className="text-gradient-primary">Transformation.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Spotify Wrapped meets therapy meets Notion. Finally, a year-end review you'll actually enjoy and benefit from.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
