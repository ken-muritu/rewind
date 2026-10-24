import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Edit2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile, presetAvatars, Profile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProfileEditorProps {
  userId: string;
  userEmail?: string;
}

export const ProfileAvatar = ({ 
  profile, 
  size = "lg",
  showEdit = false,
  onClick
}: { 
  profile: ReturnType<typeof useProfile>["profile"];
  size?: "sm" | "md" | "lg" | "xl";
  showEdit?: boolean;
  onClick?: () => void;
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-28 h-28 text-5xl",
  };

  const avatarType = profile?.avatar_type || "default";
  const avatarUrl = profile?.avatar_url;
  const preset = avatarType === "preset" ? presetAvatars.find(p => p.id === avatarUrl) : null;

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} rounded-full cursor-pointer group`}
      whileHover={onClick ? { scale: 1.05 } : {}}
      onClick={onClick}
    >
      {avatarType === "custom" && avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary/20`}
        />
      ) : preset ? (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${preset.bg} flex items-center justify-center ring-4 ring-primary/20`}>
          <span>{preset.emoji}</span>
        </div>
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-4 ring-primary/20`}>
          <span className="text-primary-foreground font-bold">
            {profile?.username?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      )}

      {showEdit && (
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
      )}
    </motion.div>
  );
};

export const ProfileEditor = ({ userId, userEmail }: ProfileEditorProps) => {
  const { profile, loading, uploading, updateUsername, selectPresetAvatar, uploadAvatar } = useProfile(userId);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const displayName = profile?.username || userEmail?.split("@")[0] || "there";

  const handleSaveUsername = async () => {
    await updateUsername(tempUsername);
    setIsEditingName(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      setDialogOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50"
    >
      {/* Avatar with edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <ProfileAvatar profile={profile} size="xl" showEdit onClick={() => setDialogOpen(true)} />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Choose your avatar
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Upload custom */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Upload your photo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>

            {/* Preset avatars */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Or choose a preset</p>
              <div className="grid grid-cols-4 gap-3">
                {presetAvatars.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      await selectPresetAvatar(preset.id);
                      setDialogOpen(false);
                    }}
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${preset.bg} flex items-center justify-center text-2xl ring-2 ring-transparent hover:ring-primary/50 transition-all ${
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
        </DialogContent>
      </Dialog>

      {/* Name section */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {isEditingName ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <Input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Enter your name"
                className="max-w-[200px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveUsername();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
              />
              <Button size="icon" variant="ghost" onClick={handleSaveUsername}>
                <Check className="w-4 h-4 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setTempUsername(profile?.username || "");
                  setIsEditingName(true);
                }}
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
        
        {/* Quick stats or message */}
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3" />
            Your 2025 Journey
          </span>
        </div>
      </div>
    </motion.div>
  );
};
