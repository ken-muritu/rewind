import { useState } from 'react';
import { GitCompare, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedBlueprint } from '@/hooks/useBlueprint';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BlueprintCompareProps {
  blueprints: SavedBlueprint[];
  currentBlueprintId: string | null;
}

function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith('## ')) {
    return (
      <h2 key={index} className="text-lg font-bold mt-6 mb-2 text-primary first:mt-0">
        {line.replace('## ', '')}
      </h2>
    );
  }
  if (line.startsWith('### ')) {
    return (
      <h3 key={index} className="text-base font-semibold mt-4 mb-2">
        {line.replace('### ', '')}
      </h3>
    );
  }
  if (line.startsWith('# ')) {
    return (
      <h1 key={index} className="text-xl font-bold mt-6 mb-2 first:mt-0">
        {line.replace('# ', '')}
      </h1>
    );
  }
  if (line.startsWith('**') && line.endsWith('**')) {
    return (
      <p key={index} className="font-bold mt-3 mb-1">
        {line.replace(/\*\*/g, '')}
      </p>
    );
  }
  if (line.startsWith('- ') || line.startsWith('* ')) {
    return (
      <li key={index} className="ml-4 mb-1 text-sm text-foreground/80">
        {line.replace(/^[-*] /, '')}
      </li>
    );
  }
  if (/^\d+\. /.test(line)) {
    return (
      <li key={index} className="ml-4 mb-1 text-sm text-foreground/80 list-decimal">
        {line.replace(/^\d+\. /, '')}
      </li>
    );
  }
  if (line.trim() === '') {
    return <br key={index} />;
  }
  return (
    <p key={index} className="mb-2 text-sm text-foreground/80 leading-relaxed">
      {line}
    </p>
  );
}

export function BlueprintCompare({ blueprints, currentBlueprintId }: BlueprintCompareProps) {
  const [open, setOpen] = useState(false);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  if (blueprints.length < 2) {
    return null;
  }

  const leftBlueprint = blueprints.find(b => b.id === leftId);
  const rightBlueprint = blueprints.find(b => b.id === rightId);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !leftId && !rightId) {
      // Pre-select the two most recent blueprints
      if (blueprints.length >= 2) {
        setLeftId(blueprints[1].id);
        setRightId(blueprints[0].id);
      }
    }
  };

  const getBlueprintLabel = (bp: SavedBlueprint, index: number) => {
    return `Blueprint ${blueprints.length - index} - ${format(new Date(bp.created_at), 'MMM d, yyyy')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="print:hidden">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Blueprints
          </DialogTitle>
          <DialogDescription>
            View two blueprints side by side to see how your goals and insights have evolved
          </DialogDescription>
        </DialogHeader>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Left Blueprint</label>
            <Select value={leftId || ''} onValueChange={setLeftId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a blueprint" />
              </SelectTrigger>
              <SelectContent>
                {blueprints.map((bp, index) => (
                  <SelectItem 
                    key={bp.id} 
                    value={bp.id}
                    disabled={bp.id === rightId}
                  >
                    {getBlueprintLabel(bp, index)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Right Blueprint</label>
            <Select value={rightId || ''} onValueChange={setRightId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a blueprint" />
              </SelectTrigger>
              <SelectContent>
                {blueprints.map((bp, index) => (
                  <SelectItem 
                    key={bp.id} 
                    value={bp.id}
                    disabled={bp.id === leftId}
                  >
                    {getBlueprintLabel(bp, index)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Left Panel */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm">
                {leftBlueprint 
                  ? format(new Date(leftBlueprint.created_at), 'MMMM d, yyyy \'at\' h:mm a')
                  : 'Select a blueprint'
                }
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {leftBlueprint ? (
                <div className="prose prose-sm max-w-none">
                  {leftBlueprint.content.split('\n').map((line, i) => 
                    renderMarkdownLine(line, i)
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a blueprint to compare</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm">
                {rightBlueprint 
                  ? format(new Date(rightBlueprint.created_at), 'MMMM d, yyyy \'at\' h:mm a')
                  : 'Select a blueprint'
                }
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {rightBlueprint ? (
                <div className="prose prose-sm max-w-none">
                  {rightBlueprint.content.split('\n').map((line, i) => 
                    renderMarkdownLine(line, i)
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a blueprint to compare</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
