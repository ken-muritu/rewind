import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquareText, Sparkles, Target, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "Reflect",
    description: "Answer thoughtful questions about your year—wins, challenges, and lessons learned.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Generate",
    description: "AI analyzes your reflections and creates a personalized growth blueprint.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    icon: Target,
    title: "Plan",
    description: "Set actionable goals with timelines based on your unique insights.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Transform",
    description: "Track progress and turn your reflections into real-world achievements.",
    gradient: "from-orange-500 to-rose-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to transform your yearly reflections into actionable growth
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={item} className="relative group">
              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%-20%)] h-[2px]">
                  <div className="h-full bg-gradient-to-r from-border via-primary/30 to-border" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/50" />
                </div>
              )}
              
              <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                {/* Step number */}
                <span className="absolute -top-3 -right-2 text-6xl font-bold text-muted/20 select-none">
                  {step.number}
                </span>
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg mb-4`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
