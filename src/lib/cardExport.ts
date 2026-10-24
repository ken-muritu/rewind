import html2canvas from "html2canvas";
import { SITE_URL } from "@/lib/site";

// Social media optimal image sizes
export const IMAGE_SIZES = {
  original: { width: 0, height: 0, label: "Original", aspect: "auto" },
  instagramStory: { width: 1080, height: 1920, label: "Instagram Story", aspect: "9:16" },
  instagramPost: { width: 1080, height: 1080, label: "Instagram Post", aspect: "1:1" },
  twitterPost: { width: 1200, height: 675, label: "Twitter/X Post", aspect: "16:9" },
  facebookPost: { width: 1200, height: 630, label: "Facebook Post", aspect: "1.91:1" },
  linkedinPost: { width: 1200, height: 627, label: "LinkedIn Post", aspect: "1.91:1" },
  whatsappStatus: { width: 1080, height: 1920, label: "WhatsApp Status", aspect: "9:16" },
} as const;

export type ImageSizeKey = keyof typeof IMAGE_SIZES;

export const captureCardAsImage = async (
  cardElement: HTMLElement,
  targetSize?: { width: number; height: number }
): Promise<string> => {
  try {
    // Capture at high resolution
    const canvas = await html2canvas(cardElement, {
      scale: 3, // Higher resolution for better quality
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    // If no target size, return original
    if (!targetSize || (targetSize.width === 0 && targetSize.height === 0)) {
      return canvas.toDataURL("image/png");
    }

    // Resize to target dimensions
    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = targetSize.width;
    resizedCanvas.height = targetSize.height;
    const ctx = resizedCanvas.getContext("2d");

    if (!ctx) {
      return canvas.toDataURL("image/png");
    }

    // Fill with background (extract from original or use default)
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, targetSize.width, targetSize.height);

    // Calculate scaling to fit the card centered
    const sourceAspect = canvas.width / canvas.height;
    const targetAspect = targetSize.width / targetSize.height;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (sourceAspect > targetAspect) {
      // Source is wider - fit to width with padding
      drawWidth = targetSize.width * 0.9;
      drawHeight = drawWidth / sourceAspect;
      offsetX = (targetSize.width - drawWidth) / 2;
      offsetY = (targetSize.height - drawHeight) / 2;
    } else {
      // Source is taller - fit to height with padding
      drawHeight = targetSize.height * 0.9;
      drawWidth = drawHeight * sourceAspect;
      offsetX = (targetSize.width - drawWidth) / 2;
      offsetY = (targetSize.height - drawHeight) / 2;
    }

    // Draw the original canvas onto the resized one
    ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

    return resizedCanvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error capturing card:", error);
    throw error;
  }
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllCards = async (
  cardElements: HTMLElement[],
  sizeKey: ImageSizeKey = "original"
): Promise<void> => {
  const size = IMAGE_SIZES[sizeKey];
  
  for (let i = 0; i < cardElements.length; i++) {
    const element = cardElements[i];
    const cardId = element.getAttribute("data-card-id") || `card-${i + 1}`;

    try {
      const dataUrl = await captureCardAsImage(
        element,
        size.width > 0 ? { width: size.width, height: size.height } : undefined
      );
      const sizeSuffix = sizeKey !== "original" ? `-${sizeKey}` : "";
      downloadImage(dataUrl, `rewind-2025-${cardId}${sizeSuffix}.png`);

      // Small delay between downloads to prevent browser issues
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error downloading card ${cardId}:`, error);
    }
  }
};

export const shareToSocial = async (
  cardElement: HTMLElement,
  platform: "twitter" | "linkedin"
) => {
  try {
    // Use platform-specific sizes
    const platformSizes: Record<string, ImageSizeKey> = {
      twitter: "twitterPost",
      linkedin: "linkedinPost",
    };
    
    const sizeKey = platformSizes[platform] || "original";
    const size = IMAGE_SIZES[sizeKey];
    
    const dataUrl = await captureCardAsImage(
      cardElement,
      size.width > 0 ? { width: size.width, height: size.height } : undefined
    );

    const shareText = "My 2025 Year in Review, created with Rewind ✨";
    const shareUrl = SITE_URL;

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }

    return dataUrl;
  } catch (error) {
    console.error("Error sharing card:", error);
    throw error;
  }
};
