import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  recipientEmailSchema,
  senderNameSchema,
  recipientNameSchema,
  validateField,
} from '@/lib/validationSchemas';

interface EmailBlueprintProps {
  blueprintContent: string;
  blueprintDate: string;
}

export function EmailBlueprint({ blueprintContent, blueprintDate }: EmailBlueprintProps) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [errors, setErrors] = useState<{ recipientEmail?: string; senderName?: string; recipientName?: string }>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const emailResult = validateField(recipientEmailSchema, recipientEmail);
    if (!emailResult.success) {
      newErrors.recipientEmail = 'error' in emailResult ? emailResult.error : "Invalid email";
    }

    const senderResult = validateField(senderNameSchema, senderName);
    if (!senderResult.success) {
      newErrors.senderName = 'error' in senderResult ? senderResult.error : "Invalid name";
    }

    if (recipientName) {
      const recipientResult = validateField(recipientNameSchema, recipientName);
      if (!recipientResult.success) {
        newErrors.recipientName = 'error' in recipientResult ? recipientResult.error : "Invalid name";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-blueprint-email', {
        body: {
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          senderName: senderName.trim(),
          blueprintContent,
          blueprintDate: format(new Date(blueprintDate), 'MMMM d, yyyy'),
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: `Your blueprint has been sent to ${recipientEmail}`,
      });
      
      setOpen(false);
      setRecipientEmail('');
      setRecipientName('');
      setErrors({});
    } catch (err) {
      toast({
        title: "Failed to send",
        description: "Could not send the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="print:hidden">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share via Email
          </DialogTitle>
          <DialogDescription>
            Send your blueprint directly to someone's inbox
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Your Name *</Label>
            <Input
              id="senderName"
              placeholder="John Doe"
              value={senderName}
              onChange={(e) => {
                setSenderName(e.target.value);
                setErrors((prev) => ({ ...prev, senderName: undefined }));
              }}
              maxLength={100}
              className={errors.senderName ? "border-destructive" : ""}
            />
            {errors.senderName && (
              <p className="text-sm text-destructive">{errors.senderName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                setErrors((prev) => ({ ...prev, recipientEmail: undefined }));
              }}
              maxLength={255}
              className={errors.recipientEmail ? "border-destructive" : ""}
            />
            {errors.recipientEmail && (
              <p className="text-sm text-destructive">{errors.recipientEmail}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name (optional)</Label>
            <Input
              id="recipientName"
              placeholder="Jane"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                setErrors((prev) => ({ ...prev, recipientName: undefined }));
              }}
              maxLength={100}
              className={errors.recipientName ? "border-destructive" : ""}
            />
            {errors.recipientName && (
              <p className="text-sm text-destructive">{errors.recipientName}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
