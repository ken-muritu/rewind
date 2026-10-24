import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Preset avatar options - organized by categories
export const presetAvatars = [
  // Cosmic & Nature
  { id: "star", emoji: "⭐", bg: "from-yellow-400 to-orange-500" },
  { id: "moon", emoji: "🌙", bg: "from-indigo-400 to-purple-600" },
  { id: "sun", emoji: "☀️", bg: "from-yellow-300 to-amber-500" },
  { id: "sparkles", emoji: "✨", bg: "from-purple-400 to-pink-500" },
  { id: "rainbow", emoji: "🌈", bg: "from-green-400 to-blue-500" },
  { id: "cloud", emoji: "☁️", bg: "from-blue-200 to-blue-400" },
  { id: "lightning", emoji: "⚡", bg: "from-yellow-400 to-yellow-600" },
  { id: "comet", emoji: "☄️", bg: "from-orange-500 to-red-600" },
  
  // Emotions & Energy
  { id: "fire", emoji: "🔥", bg: "from-orange-400 to-red-500" },
  { id: "heart", emoji: "💖", bg: "from-pink-400 to-rose-500" },
  { id: "diamond", emoji: "💎", bg: "from-cyan-400 to-blue-500" },
  { id: "crown", emoji: "👑", bg: "from-yellow-500 to-amber-600" },
  { id: "magic", emoji: "🪄", bg: "from-violet-400 to-purple-600" },
  { id: "crystal", emoji: "🔮", bg: "from-purple-500 to-indigo-600" },
  { id: "boom", emoji: "💥", bg: "from-red-400 to-orange-500" },
  { id: "butterfly", emoji: "🦋", bg: "from-blue-400 to-cyan-500" },
  
  // Activities & Objects
  { id: "rocket", emoji: "🚀", bg: "from-blue-400 to-purple-500" },
  { id: "gaming", emoji: "🎮", bg: "from-gray-600 to-gray-800" },
  { id: "music", emoji: "🎵", bg: "from-pink-500 to-purple-600" },
  { id: "art", emoji: "🎨", bg: "from-red-400 to-pink-500" },
  { id: "book", emoji: "📚", bg: "from-amber-500 to-orange-600" },
  { id: "camera", emoji: "📸", bg: "from-gray-500 to-gray-700" },
  { id: "coffee", emoji: "☕", bg: "from-amber-600 to-amber-800" },
  { id: "plant", emoji: "🌱", bg: "from-green-400 to-emerald-600" },
  
  // Animals
  { id: "cat", emoji: "🐱", bg: "from-orange-300 to-amber-500" },
  { id: "dog", emoji: "🐶", bg: "from-amber-400 to-orange-500" },
  { id: "fox", emoji: "🦊", bg: "from-orange-400 to-red-500" },
  { id: "panda", emoji: "🐼", bg: "from-gray-300 to-gray-500" },
  { id: "unicorn", emoji: "🦄", bg: "from-pink-400 to-purple-500" },
  { id: "dragon", emoji: "🐲", bg: "from-green-500 to-emerald-700" },
  { id: "lion", emoji: "🦁", bg: "from-yellow-500 to-orange-600" },
  { id: "owl", emoji: "🦉", bg: "from-amber-500 to-stone-600" },
  
  // Food & Fun
  { id: "pizza", emoji: "🍕", bg: "from-yellow-400 to-red-500" },
  { id: "avocado", emoji: "🥑", bg: "from-green-400 to-green-600" },
  { id: "sushi", emoji: "🍣", bg: "from-rose-400 to-red-500" },
  { id: "icecream", emoji: "🍦", bg: "from-pink-300 to-pink-500" },
  { id: "taco", emoji: "🌮", bg: "from-yellow-400 to-orange-500" },
  { id: "cupcake", emoji: "🧁", bg: "from-pink-400 to-rose-500" },
  { id: "cookie", emoji: "🍪", bg: "from-amber-400 to-amber-600" },
  { id: "donut", emoji: "🍩", bg: "from-pink-400 to-pink-600" },
  
  // Symbols & Misc
  { id: "yin-yang", emoji: "☯️", bg: "from-gray-400 to-gray-600" },
  { id: "peace", emoji: "☮️", bg: "from-purple-400 to-indigo-500" },
  { id: "alien", emoji: "👽", bg: "from-green-400 to-lime-500" },
  { id: "ghost", emoji: "👻", bg: "from-slate-200 to-slate-400" },
  { id: "skull", emoji: "💀", bg: "from-gray-600 to-gray-800" },
  { id: "robot", emoji: "🤖", bg: "from-blue-500 to-blue-700" },
  { id: "ninja", emoji: "🥷", bg: "from-gray-700 to-gray-900" },
  { id: "clown", emoji: "🤡", bg: "from-red-400 to-yellow-400" },
];

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data as Profile);
      } else {
        // Create profile if it doesn't exist (for existing users)
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: userId })
          .select()
          .single();

        if (!insertError && newProfile) {
          setProfile(newProfile as Profile);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const updateUsername = async (username: string) => {
    if (!userId) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .update({ username: username.trim() || null })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
      return { error };
    }

    setProfile(data as Profile);
    toast({ title: "Username updated!" });
    return { error: null };
  };

  const selectPresetAvatar = async (presetId: string) => {
    if (!userId) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        avatar_url: presetId,
        avatar_type: "preset" 
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
      return { error };
    }

    setProfile(data as Profile);
    toast({ title: "Avatar updated!" });
    return { error: null };
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) return { error: "Not authenticated" };

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 2MB",
        variant: "destructive",
      });
      return { error: "File too large" };
    }

    setUploading(true);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    const { data, error } = await supabase
      .from("profiles")
      .update({
        avatar_url: dataUrl,
        avatar_type: "custom",
      })
      .eq("id", userId)
      .select()
      .single();

    setUploading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return { error };
    }

    setProfile(data as Profile);
    toast({ title: "Profile picture uploaded!" });
    return { error: null };
  };

  const getAvatarDisplay = () => {
    if (!profile) return { type: "default" as const, value: null };
    
    if (profile.avatar_type === "custom" && profile.avatar_url) {
      return { type: "custom" as const, value: profile.avatar_url };
    }
    
    if (profile.avatar_type === "preset" && profile.avatar_url) {
      const preset = presetAvatars.find(p => p.id === profile.avatar_url);
      return { type: "preset" as const, value: preset || null };
    }
    
    return { type: "default" as const, value: null };
  };

  const updateDescription = async (description: string) => {
    if (!userId) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .update({ description })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
      return { error };
    }

    setProfile(data as Profile);
    toast({ title: "Profile updated!" });
    return { error: null };
  };

  return {
    profile,
    loading,
    uploading,
    updateUsername,
    selectPresetAvatar,
    uploadAvatar,
    getAvatarDisplay,
    updateDescription,
  };
};
