import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    description: "Perfect for personal reflection",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    gradient: "from-slate-500 to-gray-600",
    features: [
      "Full reflection experience",
      "8 shareable Wrapped cards",
      "AI-generated Blueprint",
      "Download & share cards",
      "Basic analytics",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious goal-setters",
    price: "$12",
    period: "per year",
    icon: Zap,
    gradient: "from-primary to-violet-600",
    features: [
      "Everything in Free",
      "Unlimited reflections",
      "Advanced pattern analysis",
      "Goal tracking dashboard",
      "Weekly progress reminders",
      "Export to PDF & Notion",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Team",
    description: "For teams & organizations",
    price: "$8",
    period: "per person/year",
    icon: Crown,
    gradient: "from-amber-500 to-orange-600",
    features: [
      "Everything in Pro",
      "Team retrospectives",
      "Shared insights dashboard",
      "Admin controls",
      "Custom branding",
      "SSO integration",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Reflection questions", free: "12 questions", pro: "Unlimited" },
  { name: "Wrapped cards", free: "8 cards", pro: "Unlimited" },
  { name: "AI Blueprint generation", free: true, pro: true },
  { name: "Download & share", free: true, pro: true },
  { name: "Basic analytics", free: true, pro: true },
  { name: "Pattern analysis", free: false, pro: true },
  { name: "Goal tracking dashboard", free: false, pro: true },
  { name: "Weekly reminders", free: false, pro: true },
  { name: "Export to PDF", free: false, pro: true },
  { name: "Export to Notion", free: false, pro: true },
  { name: "Year-over-year comparison", free: false, pro: true },
  { name: "Priority support", free: false, pro: true },
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
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    }
  },
};

const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return <span className="text-foreground font-medium">{value}</span>;
  }
  if (value) {
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
      <X className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
};

export const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      {/* Decorative orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl"
        animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full bg-accent/5 blur-3xl"
        animate={{ x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="relative container mx-auto px-4">
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
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent-foreground">Simple Pricing</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            Choose your
            <br />
            <span className="text-gradient-primary">reflection journey.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              className={`relative group ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-xs font-bold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Glow effect for popular */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-50" />
              )}

              <div className={`relative h-full p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
                plan.popular 
                  ? "bg-card border-primary/30 shadow-2xl shadow-primary/10" 
                  : "bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20"
              }`}>
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan info */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  size="lg"
                  className={`w-full font-semibold ${
                    plan.popular 
                      ? "bg-foreground text-background hover:bg-foreground/90" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => navigate("/auth")}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Compare{" "}
            <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              Free vs Pro
            </span>
          </h3>

          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/30 border-b border-border/50">
              <div className="p-4 font-semibold text-muted-foreground">Features</div>
              <div className="p-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">Free</span>
                </div>
              </div>
              <div className="p-4 text-center bg-primary/5">
                <div className="inline-flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Pro</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            {comparisonFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className={`grid grid-cols-3 ${
                  index !== comparisonFeatures.length - 1 ? "border-b border-border/30" : ""
                } hover:bg-muted/10 transition-colors`}
              >
                <div className="p-4 text-muted-foreground text-sm md:text-base">
                  {feature.name}
                </div>
                <div className="p-4 text-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="p-4 text-center bg-primary/5">
                  <FeatureValue value={feature.pro} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA under table */}
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-violet-600 text-white font-semibold hover:opacity-90 shadow-lg shadow-primary/20"
              onClick={() => navigate("/auth")}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {[
            "No credit card required",
            "14-day free trial on Pro",
            "Cancel anytime",
            "SOC 2 compliant",
          ].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
