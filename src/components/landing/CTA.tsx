import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const benefits = [
  { icon: Clock, text: "15 minutes to complete" },
  { icon: Shield, text: "100% private & secure" },
  { icon: Sparkles, text: "AI-powered insights" },
];

export const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Solid dark background */}
      <div className="absolute inset-0 bg-foreground" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              hsl(var(--background)) 40px,
              hsl(var(--background)) 41px
            )`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 mb-8 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
            <span className="text-sm font-semibold text-background/80">Limited Time Offer</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-background mb-6 leading-tight">
            Your story
            <br />
            <span className="text-accent">deserves better.</span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-background/60 mb-8 max-w-2xl mx-auto leading-relaxed">
            15 minutes of reflection. A lifetime of clarity.
            <br className="hidden sm:block" />
            Join thousands building their lifelong journey.
          </p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-12"
          >
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-2 text-background/70">
                <benefit.icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="h-18 px-14 text-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 group relative overflow-hidden shadow-2xl shadow-accent/30"
              onClick={() => navigate("/auth")}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative flex items-center py-2">
                Start Your Rewind — Free
                <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-sm text-background/40"
          >
            No credit card required · Takes only 15 minutes · Your data stays private
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
