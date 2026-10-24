import { motion } from "framer-motion";
import type { WrappedCardData, UserProfile } from "@/lib/wrappedGenerator";
import { SITE_HOST } from "@/lib/site";

// Preset avatar options (matching the hook)
const presetAvatars = [
  { id: "star", emoji: "⭐", bg: "from-yellow-400 to-orange-500" },
  { id: "rocket", emoji: "🚀", bg: "from-blue-400 to-purple-500" },
  { id: "fire", emoji: "🔥", bg: "from-orange-400 to-red-500" },
  { id: "heart", emoji: "💖", bg: "from-pink-400 to-rose-500" },
  { id: "sparkles", emoji: "✨", bg: "from-purple-400 to-pink-500" },
  { id: "rainbow", emoji: "🌈", bg: "from-green-400 to-blue-500" },
  { id: "moon", emoji: "🌙", bg: "from-indigo-400 to-purple-600" },
  { id: "sun", emoji: "☀️", bg: "from-yellow-300 to-amber-500" },
];

// Profile Avatar component for wrapped cards
const WrappedProfileAvatar = ({ profile, size = "lg" }: { profile?: UserProfile; size?: "md" | "lg" }) => {
  if (!profile) return null;

  const sizeClasses = {
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  const avatarType = profile.avatar_type || "default";
  const avatarUrl = profile.avatar_url;
  const preset = avatarType === "preset" ? presetAvatars.find(p => p.id === avatarUrl) : null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className={`${sizeClasses[size]} rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl`}
    >
      {avatarType === "custom" && avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : preset ? (
        <div className={`w-full h-full bg-gradient-to-br ${preset.bg} flex items-center justify-center`}>
          <span>{preset.emoji}</span>
        </div>
      ) : (
        <div className="w-full h-full bg-white/20 flex items-center justify-center">
          <span className="font-bold">
            {profile.username?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Decorative elements for visual depth
const FloatingShape = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.15, scale: 1 }}
    transition={{ delay, duration: 0.6 }}
    className={className}
  />
);

const GridPattern = () => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
    <div 
      className="w-full h-full" 
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />
  </div>
);

interface WrappedCardProps {
  card: WrappedCardData;
  index: number;
}

export const WrappedCard = ({ card, index }: WrappedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`wrapped-card-container relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${card.gradient}`}
      data-card-id={card.id}
    >
      {/* Background effects */}
      <GridPattern />
      
      {/* Animated glow orbs */}
      <FloatingShape 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" 
        delay={0.2}
      />
      <FloatingShape 
        className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-black/10 blur-3xl" 
        delay={0.4}
      />
      
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      {/* Diagonal accent line */}
      <div className="absolute top-0 right-0 w-1 h-32 bg-white/20 transform rotate-45 translate-x-8 -translate-y-8" />

      <div className={`relative z-10 h-full flex flex-col p-8 ${card.textColor}`}>
        {/* Card-specific content */}
        {card.type === "opening" && (
          <OpeningCard card={card} />
        )}
        {card.type === "numbers" && (
          <NumbersCard card={card} />
        )}
        {card.type === "peak" && (
          <QuoteCard card={card} icon="✨" />
        )}
        {card.type === "struggle" && (
          <QuoteCard card={card} icon="💪" />
        )}
        {card.type === "people" && (
          <PeopleCard card={card} />
        )}
        {card.type === "pattern" && (
          <PatternCard card={card} />
        )}
        {card.type === "pivot" && (
          <PivotCard card={card} />
        )}
        {card.type === "final" && (
          <FinalCard card={card} />
        )}

        {/* Watermark */}
        <div className="mt-auto pt-6 flex items-center justify-between">
          <p className="text-xs opacity-40 font-medium">Made with Rewind</p>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Opening Card
const OpeningCard = ({ card }: { card: WrappedCardData }) => (
  <>
    {/* Decorative corner elements */}
    <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-current opacity-30" />
    <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-current opacity-30" />
    
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      {card.userProfile && (
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <WrappedProfileAvatar profile={card.userProfile} size="lg" />
        </motion.div>
      )}
      <motion.p 
        className="text-sm uppercase tracking-[0.3em] opacity-70 mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {card.subtitle}
      </motion.p>
      <motion.h1 
        className="text-8xl font-black tracking-tight"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        {card.title}
      </motion.h1>
      
      {/* Animated underline */}
      <motion.div 
        className="mt-6 h-1 bg-current opacity-50 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      />
    </div>
  </>
);

// Numbers Card
const NumbersCard = ({ card }: { card: WrappedCardData }) => {
  const metrics = card.content as Record<string, number>;
  
  return (
    <>
      <motion.h2 
        className="text-3xl font-black mb-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {card.title}
      </motion.h2>
      <motion.div 
        className="w-16 h-1 bg-current opacity-50 rounded-full mb-8"
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 0.2 }}
      />
      
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {Object.entries(metrics).map(([label, value], i) => (
          <motion.div 
            key={label} 
            className="relative"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <div className="flex justify-between items-end">
              <span className="text-lg opacity-70">{label}</span>
              <span className="text-6xl font-mono font-black">{value}</span>
            </div>
            <div className="mt-2 h-px bg-current opacity-20" />
          </motion.div>
        ))}
      </div>
    </>
  );
};

// Quote Card (Peak, Struggle)
const QuoteCard = ({ card, icon }: { card: WrappedCardData; icon: string }) => (
  <>
    <div className="mb-6">
      <motion.div
        className="text-4xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
      {card.subtitle && (
        <motion.p 
          className="text-sm uppercase tracking-widest opacity-60 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
        >
          {card.subtitle}
        </motion.p>
      )}
      <motion.h2 
        className="text-3xl font-black"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {card.title}
      </motion.h2>
    </div>
    
    <div className="flex-1 flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        {/* Quote marks */}
        <span className="absolute -top-4 -left-2 text-6xl opacity-20 font-serif">"</span>
        <p className="text-2xl font-medium leading-relaxed pl-4 border-l-4 border-current/30">
          {card.content as string}
        </p>
      </motion.div>
    </div>
  </>
);

// People Card
const PeopleCard = ({ card }: { card: WrappedCardData }) => {
  const names = card.content as string[];
  
  return (
    <>
      <div className="mb-6">
        <motion.div
          className="text-4xl mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          ❤️
        </motion.div>
        {card.subtitle && (
          <p className="text-sm uppercase tracking-widest opacity-60 mb-2">
            {card.subtitle}
          </p>
        )}
        <h2 className="text-3xl font-black">{card.title}</h2>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {names.length > 0 ? (
          names.map((name, i) => (
            <motion.div
              key={i}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shadow-inner">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xl font-semibold">{name}</span>
            </motion.div>
          ))
        ) : (
          <p className="text-xl opacity-70 italic">
            The people who showed up for you
          </p>
        )}
      </div>
    </>
  );
};

// Pattern Card
const PatternCard = ({ card }: { card: WrappedCardData }) => (
  <>
    <div className="mb-6">
      <motion.div
        className="text-4xl mb-4"
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        🔍
      </motion.div>
      {card.subtitle && (
        <p className="text-sm uppercase tracking-widest opacity-60 mb-2">
          {card.subtitle}
        </p>
      )}
      <h2 className="text-3xl font-black">{card.title}</h2>
    </div>
    
    <div className="flex-1 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
      >
        <p className="text-sm opacity-70 mb-3 uppercase tracking-wider">You tend to...</p>
        <p className="text-2xl font-bold leading-relaxed">
          {card.content as string}
        </p>
      </motion.div>
    </div>
  </>
);

// Pivot Card
const PivotCard = ({ card }: { card: WrappedCardData }) => (
  <>
    <div className="mb-6">
      <motion.div
        className="text-4xl mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        🎯
      </motion.div>
      {card.subtitle && (
        <p className="text-sm uppercase tracking-widest opacity-60 mb-2">
          {card.subtitle}
        </p>
      )}
      <h2 className="text-3xl font-black">{card.title}</h2>
    </div>
    
    <div className="flex-1 flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="absolute -left-4 top-0 bottom-0 w-2 bg-current opacity-40 rounded-full" />
        <p className="text-3xl font-bold leading-tight pl-6">
          "{card.content as string}"
        </p>
      </motion.div>
    </div>
  </>
);

// Final Card
const FinalCard = ({ card }: { card: WrappedCardData }) => (
  <>
    {/* Decorative corner elements */}
    <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-current opacity-30" />
    <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-current opacity-30" />
    
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      {card.userProfile && (
        <motion.div 
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <WrappedProfileAvatar profile={card.userProfile} size="md" />
        </motion.div>
      )}
      
      <motion.h1 
        className="text-5xl font-black tracking-tight mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {card.title}
      </motion.h1>
      
      {/* Animated arrow between years */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4 }}
      >
        <div className="w-8 h-px bg-current" />
        <span className="text-2xl">→</span>
        <div className="w-8 h-px bg-current" />
      </motion.div>
      
      <motion.p 
        className="text-xl opacity-80 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.5 }}
      >
        {card.subtitle}
      </motion.p>
      
      <motion.p 
        className="text-lg opacity-60 max-w-xs"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 0.6 }}
        transition={{ delay: 0.6 }}
      >
        {card.content as string}
      </motion.p>
    </div>
    
    <motion.div 
      className="text-center mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <p className="text-sm font-medium opacity-60">
        Create yours at {SITE_HOST}
      </p>
    </motion.div>
  </>
);