import { useState } from 'react';
import { format } from 'date-fns';
import { History, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SavedBlueprint } from '@/hooks/useBlueprint';
import { cn } from '@/lib/utils';

interface BlueprintHistoryProps {
  blueprints: SavedBlueprint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function BlueprintHistory({ blueprints, selectedId, onSelect, onDelete }: BlueprintHistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (blueprints.length <= 1) {
    return null;
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await onDelete(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History ({blueprints.length})
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Previous Blueprints
            </SheetTitle>
            <SheetDescription>
              View and switch between your past blueprints
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {blueprints.map((bp, index) => {
              const isSelected = bp.id === selectedId;
              const previewText = bp.content.slice(0, 150).replace(/[#*\n]/g, ' ').trim();
              
              return (
                <div
                  key={bp.id}
                  className={cn(
                    "relative group w-full text-left p-4 rounded-lg border transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card"
                  )}
                >
                  <button
                    onClick={() => onSelect(bp.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium">
                            Blueprint {blueprints.length - index}
                          </span>
                          {isSelected && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Created {format(new Date(bp.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                        <p className="text-sm text-foreground/70 line-clamp-2 pr-8">
                          {previewText}...
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                  </button>
                  
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute top-3 right-12 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                      "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(bp.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this blueprint from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
