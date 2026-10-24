import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin,
  Instagram,
  MessageCircle,
  Loader2,
  Smartphone,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { captureCardAsImage, downloadImage, IMAGE_SIZES, type ImageSizeKey } from "@/lib/cardExport";

interface ShareModalProps {
  cardElement: HTMLElement | null;
  cardId: string;
  trigger?: React.ReactNode;
}

export const ShareModal = ({ cardElement, cardId, trigger }: ShareModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ImageSizeKey>("original");
  const { toast } = useToast();

  const captureCard = async (sizeKey: ImageSizeKey = "original") => {
    if (!cardElement) return null;
    
    setIsCapturing(true);
    try {
      const size = IMAGE_SIZES[sizeKey];
      const dataUrl = await captureCardAsImage(
        cardElement,
        size.width > 0 ? { width: size.width, height: size.height } : undefined
      );
      setCapturedImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("Error capturing card:", error);
      toast({
        title: "Error",
        description: "Failed to capture card image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      captureCard(selectedSize);
    } else {
      setCapturedImage(null);
    }
  };

  const handleSizeChange = async (sizeKey: ImageSizeKey) => {
    setSelectedSize(sizeKey);
    await captureCard(sizeKey);
  };

  const handleDownload = async () => {
    const image = capturedImage || await captureCard(selectedSize);
    if (!image) return;
    
    const sizeSuffix = selectedSize !== "original" ? `-${selectedSize}` : "";
    downloadImage(image, `rewind-2025-${cardId}${sizeSuffix}.png`);
    toast({ title: "Downloaded!", description: `Card saved as ${IMAGE_SIZES[selectedSize].label}.` });
  };

  const handleCopyImage = async () => {
    const image = capturedImage || await captureCard(selectedSize);
    if (!image) return;
    
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Image copied to clipboard." });
    } catch (error) {
      try {
        await navigator.clipboard.writeText(image);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied!", description: "Image URL copied to clipboard." });
      } catch {
        toast({
          title: "Error",
          description: "Failed to copy image",
          variant: "destructive",
        });
      }
    }
  };

  const shareText = "Check out my 2025 Year in Review! ✨ Created with Rewind";
  const shareUrl = window.location.origin;

  // Share with actual image file using native share or download
  const handleTwitterShare = async () => {
    // Capture with Twitter-optimized size
    const image = await captureCard("twitterPost");
    if (!image) return;
    
    // Try native share with file first
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], `rewind-2025-${cardId}-twitter.png`, { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My 2025 Wrapped",
          text: shareText,
          files: [file],
        });
        return;
      }
    } catch (e) {
      // Fall through to download + link
    }
    
    // Fallback: download image and open share link
    downloadImage(image, `rewind-2025-${cardId}-twitter.png`);
    toast({
      title: "Image downloaded!",
      description: "Upload the image when posting to X/Twitter.",
    });
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const handleLinkedInShare = async () => {
    const image = await captureCard("linkedinPost");
    if (!image) return;
    
    // Try native share with file first
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], `rewind-2025-${cardId}-linkedin.png`, { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My 2025 Wrapped",
          text: shareText,
          files: [file],
        });
        return;
      }
    } catch (e) {
      // Fall through to download + link
    }
    
    // Fallback: download image
    downloadImage(image, `rewind-2025-${cardId}-linkedin.png`);
    toast({
      title: "Image downloaded!",
      description: "Upload the image when posting to LinkedIn.",
    });
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleWhatsAppShare = async () => {
    const image = await captureCard("whatsappStatus");
    if (!image) return;
    
    // Try native share with file first
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], `rewind-2025-${cardId}-whatsapp.png`, { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My 2025 Wrapped",
          text: shareText,
          files: [file],
        });
        return;
      }
    } catch (e) {
      // Fall through to download + link
    }
    
    // Fallback: download image and open whatsapp
    downloadImage(image, `rewind-2025-${cardId}-whatsapp.png`);
    toast({
      title: "Image downloaded!",
      description: "Attach the image in WhatsApp.",
    });
    const message = `${shareText}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleInstagramShare = async () => {
    // Instagram story size
    const image = await captureCard("instagramStory");
    if (!image) return;
    
    downloadImage(image, `rewind-2025-${cardId}-instagram.png`);
    toast({
      title: "Image Downloaded!",
      description: "Optimized for Instagram Stories. Open Instagram to share.",
    });
  };

  const handleNativeShare = async () => {
    const image = capturedImage || await captureCard(selectedSize);
    if (!image) return;

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], `rewind-2025-${cardId}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My 2025 Wrapped",
          text: shareText,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "My 2025 Wrapped",
          text: shareText,
          url: shareUrl,
        });
      } else {
        toast({
          title: "Share not supported",
          description: "Use the download button instead.",
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  const sizeOptions = Object.entries(IMAGE_SIZES).map(([key, value]) => ({
    key: key as ImageSizeKey,
    ...value,
  }));

  const shareOptions = [
    { 
      id: "download", 
      label: "Download", 
      icon: Download, 
      onClick: handleDownload,
      color: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    { 
      id: "copy", 
      label: copied ? "Copied!" : "Copy", 
      icon: copied ? Check : Copy, 
      onClick: handleCopyImage,
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    },
    { 
      id: "twitter", 
      label: "X / Twitter", 
      icon: Twitter, 
      onClick: handleTwitterShare,
      color: "bg-black text-white hover:bg-black/80"
    },
    { 
      id: "linkedin", 
      label: "LinkedIn", 
      icon: Linkedin, 
      onClick: handleLinkedInShare,
      color: "bg-[#0077b5] text-white hover:bg-[#0077b5]/80"
    },
    { 
      id: "whatsapp", 
      label: "WhatsApp", 
      icon: MessageCircle, 
      onClick: handleWhatsAppShare,
      color: "bg-[#25D366] text-white hover:bg-[#25D366]/80"
    },
    { 
      id: "instagram", 
      label: "Instagram", 
      icon: Instagram, 
      onClick: handleInstagramShare,
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Card
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Size Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Image Size</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {IMAGE_SIZES[selectedSize].label}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sizeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    onClick={() => handleSizeChange(option.key)}
                    className="flex justify-between gap-4"
                  >
                    <span>{option.label}</span>
                    {option.aspect !== "auto" && (
                      <span className="text-xs text-muted-foreground">
                        {option.width}×{option.height}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Preview */}
          <div className="relative aspect-[9/16] max-h-[280px] mx-auto rounded-xl overflow-hidden bg-muted">
            {isCapturing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Card preview" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Preparing preview...
              </div>
            )}
          </div>

          {/* Share options grid */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={option.onClick}
                disabled={isCapturing}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Native share button (mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              onClick={handleNativeShare}
              disabled={isCapturing}
              className="w-full gap-2"
              variant="outline"
            >
              <Smartphone className="w-4 h-4" />
              More Sharing Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
