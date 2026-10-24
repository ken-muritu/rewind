import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2,
  Loader2
} from "lucide-react";
import { WrappedCard } from "./WrappedCard";
import { captureCardAsImage, downloadImage, downloadAllCards } from "@/lib/cardExport";
import { ShareModal } from "@/components/sharing/ShareModal";
import { useToast } from "@/hooks/use-toast";
import type { WrappedCardData } from "@/lib/wrappedGenerator";

interface WrappedViewerProps {
  cards: WrappedCardData[];
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
};

// Haptic feedback utility
const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Vibration API not supported or blocked
    }
  }
};

export const WrappedViewer = ({ cards }: WrappedViewerProps) => {
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentCard = cards[currentIndex];

  const paginate = useCallback((newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < cards.length) {
      triggerHaptic(15); // Short haptic pulse on card change
      setPage([newIndex, newDirection]);
    }
  }, [currentIndex, cards.length]);

  const goToIndex = useCallback((index: number) => {
    if (index !== currentIndex) {
      const newDirection = index > currentIndex ? 1 : -1;
      triggerHaptic(10); // Lighter haptic for dot navigation
      setPage([index, newDirection]);
    }
  }, [currentIndex]);

  const handleDragEnd = useCallback((e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  }, [paginate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          paginate(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          paginate(1);
          break;
        case "Home":
          e.preventDefault();
          if (currentIndex !== 0) {
            setPage([0, -1]);
            triggerHaptic(10);
          }
          break;
        case "End":
          e.preventDefault();
          if (currentIndex !== cards.length - 1) {
            setPage([cards.length - 1, 1]);
            triggerHaptic(10);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, currentIndex, cards.length]);

  const handleDownloadCurrent = async () => {
    const cardElement = cardRefs.current[currentIndex];
    if (!cardElement) return;

    setDownloading(true);
    try {
      const dataUrl = await captureCardAsImage(cardElement);
      downloadImage(dataUrl, `rewind-2025-${currentCard.id}.png`);
      toast({
        title: "Downloaded!",
        description: "Card saved to your device.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download card.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    const validRefs = cardRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    if (validRefs.length === 0) return;

    setDownloadingAll(true);
    try {
      await downloadAllCards(validRefs);
      toast({
        title: "All cards downloaded!",
        description: `${cards.length} cards saved to your device.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download some cards.",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  // Get current card element for sharing
  const getCurrentCardElement = () => cardRefs.current[currentIndex];

  return (
    <div className="flex flex-col items-center">
      {/* Card display with swipe */}
      <div className="relative w-full max-w-sm mx-auto mb-8 overflow-hidden">
        {/* Hidden cards for export */}
        <div className="absolute opacity-0 pointer-events-none">
          {cards.map((card, index) => (
            <div
              key={`export-${card.id}`}
              ref={(el) => (cardRefs.current[index] = el)}
            >
              <WrappedCard card={card} index={0} />
            </div>
          ))}
        </div>

        {/* Swipeable card container */}
        <div className="relative touch-pan-y" style={{ minHeight: "500px" }}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing"
              whileTap={{ cursor: "grabbing" }}
            >
              <WrappedCard card={currentCard} index={0} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows (hidden on mobile, shown on desktop) */}
        <button
          onClick={() => paginate(-1)}
          disabled={currentIndex === 0}
          className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-card border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => paginate(1)}
          disabled={currentIndex === cards.length - 1}
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-card border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile navigation buttons */}
      <div className="sm:hidden flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(-1)}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(1)}
          disabled={currentIndex === cards.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Swipe hint for mobile */}
      <p className="sm:hidden text-xs text-muted-foreground mb-4 opacity-60">
        or swipe to navigate
      </p>

      {/* Card indicators */}
      <div className="flex gap-2 mb-8">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => goToIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-4">
        <Button
          onClick={handleDownloadCurrent}
          disabled={downloading}
          className="flex-1 gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Card
        </Button>

        <Button
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          variant="outline"
          className="flex-1 gap-2"
        >
          {downloadingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download All ({cards.length})
        </Button>
      </div>

      {/* Share button with modal */}
      <div className="flex gap-4 mt-6">
        <ShareModal 
          cardElement={getCurrentCardElement()} 
          cardId={currentCard.id}
          trigger={
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Card
            </Button>
          }
        />
      </div>

      {/* Card counter */}
      <p className="mt-6 text-sm text-muted-foreground">
        Card {currentIndex + 1} of {cards.length}
      </p>
    </div>
  );
};
