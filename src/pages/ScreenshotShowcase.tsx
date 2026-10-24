import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Download, Share, ChevronRight } from "lucide-react";

// Sample wrapped cards for showcase
const sampleCards = [
  {
    id: "opening",
    type: "opening",
    title: "2025",
    subtitle: "Alex's Year",
    gradient: "from-primary via-primary/90 to-primary/70",
    textColor: "text-primary-foreground",
    profile: { username: "Alex Chen", avatar: "🚀" },
  },
  {
    id: "numbers",
    type: "numbers",
    title: "The Numbers",
    gradient: "from-foreground to-foreground/90",
    textColor: "text-background",
    metrics: { "Things Built": 8, "Skills Gained": 5, "Milestones Hit": 12 },
  },
  {
    id: "peak",
    type: "quote",
    title: "Peak Moment",
    subtitle: "Your highest high",
    gradient: "from-accent to-accent/80",
    textColor: "text-accent-foreground",
    quote: "The day I launched my first product and saw real users signing up.",
  },
  {
    id: "struggle",
    type: "quote",
    title: "The Struggle",
    subtitle: "What tested you",
    gradient: "from-destructive/90 to-destructive/70",
    textColor: "text-destructive-foreground",
    quote: "Burnout hit hard in Q3. Learned that rest isn't optional.",
  },
  {
    id: "people",
    type: "people",
    title: "Your MVPs",
    subtitle: "The people who showed up",
    gradient: "from-primary/90 via-primary/70 to-accent/50",
    textColor: "text-primary-foreground",
    names: ["Sarah M.", "David K.", "Emily R.", "Michael T."],
  },
  {
    id: "pattern",
    type: "pattern",
    title: "Pattern Found",
    subtitle: "What the year revealed",
    gradient: "from-secondary via-muted to-secondary",
    textColor: "text-secondary-foreground",
    content: "Start strong, then overcommit by week 6. Your best work happened when you said 'no' more often.",
  },
  {
    id: "pivot",
    type: "pivot",
    title: "The Pivot",
    subtitle: "Your 2026 commitment",
    gradient: "from-primary via-primary/80 to-accent",
    textColor: "text-primary-foreground",
    content: "I will ship fewer things, but ship them right.",
  },
  {
    id: "final",
    type: "final",
    title: "2025 → 2026",
    subtitle: "Your year, distilled.",
    gradient: "from-foreground via-foreground/95 to-foreground/90",
    textColor: "text-background",
    content: "The best is yet to come.",
    profile: { username: "Alex Chen", avatar: "🚀" },
  },
];

// Wrapped Card Component
const WrappedCardShowcase = ({ card }: { card: typeof sampleCards[0] }) => (
  <div
    className={`relative w-64 aspect-[9/16] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br ${card.gradient}`}
  >
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
    
    <div className={`relative z-10 h-full flex flex-col p-5 ${card.textColor}`}>
      {card.type === "opening" && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl mb-4">
            {card.profile?.avatar}
          </div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">{card.subtitle}</p>
          <h1 className="text-5xl font-black">{card.title}</h1>
        </div>
      )}
      
      {card.type === "numbers" && (
        <>
          <h2 className="text-xl font-black mb-4">{card.title}</h2>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {card.metrics && Object.entries(card.metrics).map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm opacity-70">{label}</span>
                <span className="text-3xl font-mono font-bold">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {card.type === "quote" && (
        <>
          <div className="mb-3">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{card.subtitle}</p>
            <h2 className="text-lg font-black">{card.title}</h2>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-base font-medium leading-relaxed italic">"{card.quote}"</p>
          </div>
        </>
      )}
      
      {card.type === "people" && (
        <>
          <div className="mb-3">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{card.subtitle}</p>
            <h2 className="text-lg font-black">{card.title}</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {card.names?.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {card.type === "pattern" && (
        <>
          <div className="mb-3">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{card.subtitle}</p>
            <h2 className="text-lg font-black">{card.title}</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs opacity-70 mb-2">You tend to...</p>
            <p className="text-base font-bold leading-relaxed">{card.content}</p>
          </div>
        </>
      )}
      
      {card.type === "pivot" && (
        <>
          <div className="mb-3">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{card.subtitle}</p>
            <h2 className="text-lg font-black">{card.title}</h2>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-xl font-bold leading-tight">"{card.content}"</p>
          </div>
        </>
      )}
      
      {card.type === "final" && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl mb-4">
            {card.profile?.avatar}
          </div>
          <h1 className="text-3xl font-black mb-3">{card.title}</h1>
          <p className="text-sm opacity-80 mb-2">{card.subtitle}</p>
          <p className="text-xs opacity-60">{card.content}</p>
        </div>
      )}
      
      <div className="mt-auto pt-3">
        <p className="text-[10px] opacity-40 font-medium">Made with Rewind</p>
      </div>
    </div>
  </div>
);

export default function ScreenshotShowcase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Screenshot Showcase</h1>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Toggle theme for light/dark screenshots</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Section: Wrapped Cards */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Wrapped Cards</h2>
          <p className="text-muted-foreground mb-8">All 8 card types from the Wrapped experience</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sampleCards.map((card) => (
              <WrappedCardShowcase key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Section: Auth Forms */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Authentication</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full">Sign In</Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account? <span className="text-primary">Sign up</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full">Create Account</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section: Reflection Question */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Reflection Question</h2>
          <Card className="max-w-2xl">
            <CardContent className="p-8">
              <div className="mb-4">
                <span className="text-sm text-primary font-medium">Question 3 of 12</span>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div className="w-1/4 h-full bg-primary rounded-full" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6">What was your biggest win this year?</h3>
              <Textarea 
                placeholder="Take your time to reflect..." 
                className="min-h-[150px] resize-none"
              />
              <div className="flex gap-3 mt-6">
                <Button variant="outline">Skip</Button>
                <Button className="flex-1">Next</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: Dashboard Components */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Dashboard Components</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            {/* Progress Ring */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reflection Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-muted"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-primary"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset="62.8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Streak Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Streak</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">7</div>
                <p className="text-muted-foreground">days in a row</p>
                <div className="flex justify-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div key={day} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✓
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Goals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Career Growth", progress: 65 },
                  { label: "Health", progress: 40 },
                  { label: "Learning", progress: 80 },
                ].map((goal) => (
                  <div key={goal.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.label}</span>
                      <span className="text-primary">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section: Profile Settings */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>
          <Card className="max-w-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl font-bold">Alex Chen</h3>
                  <p className="text-muted-foreground">Member since 2025</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Username</label>
                  <Input value="alexchen" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea value="Building cool things and reflecting on life." className="resize-none" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: Blueprint Preview */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Blueprint Preview</h2>
          <Card className="max-w-2xl">
            <CardContent className="p-8 prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold flex items-center gap-2 not-prose mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                Your 2025 Blueprint
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <p className="text-muted-foreground text-sm">Your year revealed a pattern of strong starts followed by overcommitment. The most productive periods came when you prioritized depth over breadth.</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Growth Areas</h4>
                  <p className="text-muted-foreground text-sm">Focus on sustainable pace, boundary setting, and celebrating small wins along the way.</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2">Action Steps</h4>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Schedule weekly reflection time
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Set clear project boundaries
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Build a support accountability system
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 mt-6 not-prose">
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: 404 Page */}
        <section>
          <h2 className="text-3xl font-bold mb-6">404 Page</h2>
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <h3 className="text-6xl font-bold mb-4">404</h3>
              <p className="text-muted-foreground mb-6">Oops! Page not found</p>
              <Button>Return to Home</Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Screenshot Showcase - Toggle theme toggle in header for light/dark mode screenshots</p>
        </div>
      </footer>
    </div>
  );
}
