import { useState, useRef } from 'react';
import { Share2, Image, Link2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ShareBlueprintProps {
  blueprintRef: React.RefObject<HTMLDivElement>;
  blueprintId: string | null;
}

export function ShareBlueprint({ blueprintRef, blueprintId }: ShareBlueprintProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleExportImage = async () => {
    if (!blueprintRef.current) {
      toast({
        title: "Export failed",
        description: "Could not find the blueprint content.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(blueprintRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-2025-blueprint.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Image exported",
          description: "Your blueprint has been saved as an image.",
        });
      }, 'image/png');
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: "Export failed",
        description: "Could not export the blueprint as an image.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/blueprint${blueprintId ? `?id=${blueprintId}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Blueprint link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = `${window.location.origin}/blueprint${blueprintId ? `?id=${blueprintId}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My 2025 Blueprint',
          text: 'Check out my personalized 2025 Blueprint!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="print:hidden">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportImage} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Image className="h-4 w-4 mr-2" />
          )}
          Save as Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          Copy Link
        </DropdownMenuItem>
        {typeof navigator !== 'undefined' && navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
