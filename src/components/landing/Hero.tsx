import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, Play, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

// Floating orb component for ambient background
const FloatingOrb = ({ 
  className, 
  delay = 0, 
  duration = 20,
  size = "w-96 h-96"
}: { 
  className?: string; 
  delay?: number; 
  duration?: number;
  size?: string;
}) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${size} ${className}`}
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -80, 40, 0],
      scale: [1, 1.2, 0.9, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Animated grid lines for depth
const GridOverlay = () => (
  <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
  </div>
);

// Particle effect
const Particles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -200, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

// Social proof avatars with real gradients
const AvatarStack = () => {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ];

  return (
    <div className="flex -space-x-3">
      {colors.map((gradient, i) => (
        <motion.div
          key={i}
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-background flex items-center justify-center shadow-lg`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.1 }}
        >
          <span className="text-xs font-bold text-white/90">
            {String.fromCharCode(65 + i)}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export const Hero = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating header with logo and theme toggle */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6"
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.a
            href="/"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-gradient-primary">Rewind</span>
            </span>
          </motion.a>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex font-semibold hover:bg-primary/10"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <FloatingOrb 
          className="bg-primary/20 top-20 -left-20" 
          delay={0} 
          duration={25}
          size="w-[500px] h-[500px]"
        />
        <FloatingOrb 
          className="bg-accent/30 -top-20 right-0" 
          delay={2} 
          duration={30}
          size="w-[600px] h-[600px]"
        />
        <FloatingOrb 
          className="bg-primary/15 bottom-0 left-1/4" 
          delay={4} 
          duration={22}
          size="w-[400px] h-[400px]"
        />
        <FloatingOrb 
          className="bg-accent/20 bottom-20 right-1/4" 
          delay={6} 
          duration={28}
          size="w-[350px] h-[350px]"
        />
      </div>

      {/* Grid overlay for depth */}
      <GridOverlay />
      
      {/* Particles */}
      <Particles />
      
      {/* Grain overlay */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      {/* Spotlight effect following mouse */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
          left: mousePosition.x - 400,
          top: mousePosition.y - 400,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-8 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Lifetime Reflection Journey
            </span>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-xs font-bold text-accent-foreground">
              ∞
            </span>
          </motion.div>

          {/* Main headline with 3D effect */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.85]"
            >
              <span className="block">Your year,</span>
              <span className="block text-gradient-primary relative">
                distilled.
                <motion.span
                  className="absolute -right-4 -top-4 text-accent"
                  animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 md:w-12 md:h-12 fill-accent" />
                </motion.span>
              </span>
            </motion.h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-muted-foreground mb-8"
          >
            Your future, <motion.span 
              className="text-accent inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >designed.</motion.span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Transform your year-end reflection into a{" "}
            <span className="text-foreground font-semibold">cinematic, shareable experience</span>. 
            Spotify Wrapped meets personal growth—powered by psychology.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 group relative overflow-hidden shadow-2xl shadow-foreground/20"
              onClick={() => navigate("/auth")}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative flex items-center">
                <Zap className="mr-2 w-5 h-5" />
                Start Your Rewind
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 group backdrop-blur-sm"
              onClick={() => {
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Play className="mr-2 w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground"
          >
            <AvatarStack />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm">
                <span className="font-bold text-foreground">2,847</span> people reflected this week
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
