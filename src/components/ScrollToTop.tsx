import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsVisible(latest > 400);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/20 group"
            aria-label="Scroll to top"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
