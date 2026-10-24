import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Camera, 
  Check, 
  X, 
  Sparkles, 
  User, 
  Mail, 
  Edit2,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useProfile, presetAvatars, Profile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usernameSchema, validateField } from "@/lib/validationSchemas";

// Description options for "What best describes you"
const descriptionOptions = [
  // Career & Education
  { id: "student", label: "Student", emoji: "📚" },
  { id: "professional", label: "Working Professional", emoji: "💼" },
  { id: "entrepreneur", label: "Entrepreneur", emoji: "🚀" },
  { id: "freelancer", label: "Freelancer", emoji: "✨" },
  { id: "developer", label: "Developer / Tech", emoji: "💻" },
  { id: "designer", label: "Designer", emoji: "🎨" },
  { id: "writer", label: "Writer / Content Creator", emoji: "✍️" },
  { id: "marketer", label: "Marketer", emoji: "📈" },
  { id: "healthcare", label: "Healthcare Professional", emoji: "🩺" },
  { id: "educator", label: "Teacher / Educator", emoji: "👩‍🏫" },
  { id: "scientist", label: "Scientist / Researcher", emoji: "🔬" },
  { id: "engineer", label: "Engineer", emoji: "⚙️" },
  
  // Life Roles
  { id: "parent", label: "Parent / Caregiver", emoji: "👨‍👩‍👧" },
  { id: "athlete", label: "Athlete / Fitness Enthusiast", emoji: "🏃" },
  { id: "musician", label: "Musician", emoji: "🎵" },
  { id: "gamer", label: "Gamer", emoji: "🎮" },
  { id: "traveler", label: "Traveler / Nomad", emoji: "✈️" },
  { id: "foodie", label: "Foodie", emoji: "🍜" },
  { id: "mentor", label: "Mentor / Coach", emoji: "🧭" },
  { id: "volunteer", label: "Volunteer / Activist", emoji: "🤝" },
  
  // Personality
  { id: "explorer", label: "Life Explorer", emoji: "🌍" },
  { id: "dreamer", label: "Dreamer", emoji: "💭" },
  { id: "hustler", label: "Hustler / Go-getter", emoji: "💪" },
  { id: "introvert", label: "Introvert", emoji: "🌙" },
  { id: "extrovert", label: "Extrovert / Social Butterfly", emoji: "🦋" },
  { id: "minimalist", label: "Minimalist", emoji: "🧘" },
  { id: "creative", label: "Creative Soul", emoji: "🌈" },
  { id: "lifelong-learner", label: "Lifelong Learner", emoji: "🧠" },
];

interface ProfileSettingsProps {
  userId: string;
  userEmail?: string;
}

// Enhanced image cropper component with better controls
const ImageCropper = ({ 
  imageUrl, 
  onCrop, 
  onCancel 
}: { 
  imageUrl: string; 
  onCrop: (croppedBlob: Blob) => void; 
  onCancel: () => void;
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate initial scale to fit image in the circle
  const calculateInitialScale = useCallback((imgWidth: number, imgHeight: number) => {
    const containerSize = 240; // visible circle size
    const minDimension = Math.min(imgWidth, imgHeight);
    // Scale so the smaller dimension fills the circle
    return containerSize / minDimension;
  }, []);

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    setImageDimensions({ width, height });
    
    // Auto-fit the image to the circle
    const initialScale = calculateInitialScale(width, height);
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    const initialScale = calculateInitialScale(imageDimensions.width, imageDimensions.height);
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outputSize = 512; // Higher resolution output
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Clear canvas
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Calculate how the image is displayed
    const displaySize = 240;
    const scaleRatio = outputSize / displaySize;
    
    const scaledWidth = img.naturalWidth * scale * scaleRatio;
    const scaledHeight = img.naturalHeight * scale * scaleRatio;
    
    const offsetX = (outputSize - scaledWidth) / 2 + (position.x * scaleRatio);
    const offsetY = (outputSize - scaledHeight) / 2 + (position.y * scaleRatio);

    // Create circular clip
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/png", 0.95);
  }, [scale, position, onCrop]);

  // Calculate min/max scale based on image dimensions
  const minScale = imageLoaded ? 
    Math.max(0.2, 240 / Math.max(imageDimensions.width, imageDimensions.height) * 0.5) : 0.2;
  const maxScale = imageLoaded ? 
    Math.min(5, 240 / Math.min(imageDimensions.width, imageDimensions.height) * 3) : 5;

  return (
    <div className="space-y-4">
      <p className="text-sm text-center text-muted-foreground">
        Drag to position • Pinch or use slider to zoom
      </p>
      
      <div 
        ref={containerRef}
        className="relative w-60 h-60 mx-auto overflow-hidden rounded-full border-4 border-primary cursor-move bg-muted/50 shadow-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Crop preview"
          className="absolute select-none pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
            left: "50%",
            top: "50%",
            opacity: imageLoaded ? 1 : 0,
            transition: isDragging ? 'none' : 'opacity 0.2s',
          }}
          draggable={false}
          onLoad={handleImageLoad}
        />
        {/* Guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-full" />
          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
            <div className="absolute left-1/2 top-0 w-px h-full bg-white/30 -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 w-full h-px bg-white/30 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0"
            onClick={() => setScale(Math.max(minScale, scale - 0.2))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Slider
            value={[scale]}
            onValueChange={([v]) => setScale(v)}
            min={minScale}
            max={maxScale}
            step={0.05}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0"
            onClick={() => setScale(Math.min(maxScale, scale + 0.2))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
          className="w-full text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Position
        </Button>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleCrop} className="flex-1" disabled={!imageLoaded}>
          <Check className="w-4 h-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
};

// Compact profile display for dashboard
export const ProfileDisplay = ({ 
  profile, 
  onOpenSettings 
}: { 
  profile: Profile | null;
  onOpenSettings: () => void;
}) => {
  const avatarType = profile?.avatar_type || "default";
  const avatarUrl = profile?.avatar_url;
  const preset = avatarType === "preset" ? presetAvatars.find(p => p.id === avatarUrl) : null;
  const description = descriptionOptions.find(d => d.id === profile?.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50"
    >
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20">
        {avatarType === "custom" && avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : preset ? (
          <div className={`w-full h-full bg-gradient-to-br ${preset.bg} flex items-center justify-center text-2xl`}>
            {preset.emoji}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate">
          {profile?.username || "Set your name"}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>{description.emoji}</span>
            <span>{description.label}</span>
          </p>
        )}
      </div>

      {/* Settings button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onOpenSettings}
        className="shrink-0"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Button>
    </motion.div>
  );
};

export const ProfileSettings = ({ userId, userEmail }: ProfileSettingsProps) => {
  const { 
    profile, 
    loading, 
    uploading, 
    updateUsername, 
    selectPresetAvatar, 
    uploadAvatar,
    updateDescription 
  } = useProfile(userId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl bg-card/80">
        <div className="w-14 h-14 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted" />
      </div>
    );
  }

  const handleSaveUsername = async () => {
    // Validate username
    const result = validateField(usernameSchema, tempUsername);
    if (!result.success) {
      toast({
        title: "Invalid username",
        description: 'error' in result ? result.error : "Please enter a valid username",
        variant: "destructive",
      });
      return;
    }
    await updateUsername(tempUsername.trim());
    setIsEditingName(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (blob: Blob) => {
    const file = new File([blob], "avatar.png", { type: "image/png" });
    await uploadAvatar(file);
    setCropImage(null);
    setAvatarDialogOpen(false);
  };

  const handleDescriptionChange = async (descId: string) => {
    if (updateDescription) {
      await updateDescription(descId);
    }
  };

  return (
    <>
      <ProfileDisplay 
        profile={profile} 
        onOpenSettings={() => setSheetOpen(true)} 
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Profile Settings
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Avatar section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/20 group"
                    >
                      {profile?.avatar_type === "custom" && profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : profile?.avatar_type === "preset" && profile?.avatar_url ? (
                        <div className={`w-full h-full bg-gradient-to-br ${presetAvatars.find(p => p.id === profile.avatar_url)?.bg} flex items-center justify-center text-3xl`}>
                          {presetAvatars.find(p => p.id === profile.avatar_url)?.emoji}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-2xl">
                            {profile?.username?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {cropImage ? "Crop Your Photo" : "Choose Avatar"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {cropImage ? (
                      <ImageCropper 
                        imageUrl={cropImage} 
                        onCrop={handleCroppedImage}
                        onCancel={() => setCropImage(null)}
                      />
                    ) : (
                      <div className="space-y-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3">Upload your photo</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload & Crop Photo"}
                          </Button>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3">Or choose a preset</p>
                          <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                            <div className="grid grid-cols-5 gap-2">
                              {presetAvatars.map((preset) => (
                                <motion.button
                                  key={preset.id}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={async () => {
                                    await selectPresetAvatar(preset.id);
                                    setAvatarDialogOpen(false);
                                  }}
                                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${preset.bg} flex items-center justify-center text-xl ring-2 ring-transparent hover:ring-primary/50 transition-all ${
                                    profile?.avatar_type === "preset" && profile?.avatar_url === preset.id
                                      ? "ring-primary ring-offset-2"
                                      : ""
                                  }`}
                                >
                                  {preset.emoji}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Click to upload a custom photo or choose from presets
                  </p>
                </div>
              </div>
            </div>

            {/* Username section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Display Name</Label>
              <AnimatePresence mode="wait">
                {isEditingName ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                      maxLength={50}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveUsername();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveUsername}>
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="font-medium">
                      {profile?.username || "Not set"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTempUsername(profile?.username || "");
                        setIsEditingName(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Email section (read-only) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Email</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{userEmail}</span>
              </div>
            </div>

            {/* Description section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What best describes you?</Label>
              <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                <div className="grid grid-cols-2 gap-2">
                  {descriptionOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDescriptionChange(option.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${
                        profile?.description === option.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-base shrink-0">{option.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
